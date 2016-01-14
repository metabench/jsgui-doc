using GenDoc.Classes.Env;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes
{
    class NavProcessor
    {

        public static void Process()
        {
            string navHtml = NavProcessor.CreateNavHtml(Settings.JsSourceDir, Settings.DocSourceDir);
            File.WriteAllText(Path.Combine(Globals.OutSettings.OutDir, "nav.html"), navHtml);
        }

        public static string CreateNavHtml(string srcDir, string docDir)
        {
            NavNode navRoot = CreateNavTree(new DirectoryInfo(srcDir), new DirectoryInfo(docDir));
            return GenerateNavHtml(navRoot, Globals.OutSettings.DocRelPath);
        }

        private static NavNode CreateNavTree(DirectoryInfo srcDirInfo, DirectoryInfo docDirInfo)
        {
            FileSystemNode srcNode = CreateFileSystemDirNode(srcDirInfo);
            FileSystemNode docNode = CreateFileSystemDirNode(docDirInfo);
            return CreateNavNode(srcNode, docNode);
        }

        private static FileSystemNode CreateFileSystemDirNode(DirectoryInfo directoryInfo)
        {
            FileSystemNode result = new FileSystemNode(directoryInfo.Name, isDir: true);
            //
            //if (directoryInfo.  //(File.Exists(""))
            DocIgnore docIgnore = new DocIgnore(directoryInfo);
            //
            foreach (DirectoryInfo subDirectoryInfo in directoryInfo.EnumerateDirectories())
            {
                if (docIgnore.Ignore(subDirectoryInfo)) continue;
                result.AddSub(CreateFileSystemDirNode(subDirectoryInfo), docIgnore.UserIgnore(subDirectoryInfo));
            }
            //
            foreach (FileInfo fileInfo in directoryInfo.EnumerateFiles())
            {
                if (docIgnore.Ignore(fileInfo)) continue;
                result.AddFile(fileInfo.Name, docIgnore.UserIgnore(fileInfo));
            }
            //
            return result;
        }

        private static List<string> createNamesList(FileSystemNode srcNode, FileSystemNode docNode)
        {
            List<string> result = new List<string>();
            //
            if (srcNode != null) foreach (FileSystemNode subNode in srcNode.SubNodes) addName(result, subNode.Name);
            if (docNode != null) foreach (FileSystemNode subNode in docNode.SubNodes) addName(result, subNode.Name);
            //
            return result;
        }

        private static void addName(List<string> list, string name)
        {
            name = NavNode.CalcDisplayName(name);
            //
            int index = list.BinarySearch(name);
            if (index < 0) list.Insert(~index, name);
        }

        private static FileSystemNode findSubNode(FileSystemNode parentNode, string name)
        {
            if (parentNode == null) return null;
            return parentNode.FindSub(name);
        }

        private static FileSystemNode findDocSubNode(FileSystemNode parentNode, string name)
        {
            if (parentNode == null) return null;
            //
            FileSystemNode dirSubNode = parentNode.FindSub(name);
            if (dirSubNode != null) return dirSubNode;
            //
            return findDocFileSubNode(parentNode, name);
        }

        private static FileSystemNode findDocFileSubNode(FileSystemNode parentNode, string name)
        {
            if (parentNode == null) return null;
            //
            FileSystemNode htmlSubNode = parentNode.FindSub(name + ".html");
            if (htmlSubNode != null) return htmlSubNode;
            //
            FileSystemNode xmlSubNode = parentNode.FindSub(name + ".xml");
            if (xmlSubNode != null) return xmlSubNode;
            //
            return null;
        }

        private enum FileSystemNodeKind { Dir, File, None };

        private static FileSystemNodeKind calcNodeKind(FileSystemNode node)
        {
            if (node == null) return FileSystemNodeKind.None;
            if (node.IsDir) return FileSystemNodeKind.Dir;
            return FileSystemNodeKind.File;
        }

        private static bool userIgnore(FileSystemNode fileSystemNode)
        {
            if (!Globals.OutSettings.DevOutMode)
            {
                if ((fileSystemNode != null) && (fileSystemNode.UserIgnore)) return true;
            }
            //
            return false;
        }

        private static NavNode CreateNavNode(FileSystemNode srcParentNode, FileSystemNode docParentNode)
        {
            if (userIgnore(srcParentNode)) return null;
            if (userIgnore(docParentNode)) return null;
            //
            NavNode result = new NavNode("root", NavNodeKind.Dir);
            result.Name = (srcParentNode != null) ? srcParentNode.Name : docParentNode.Name;
            //
            List<string> names = createNamesList(srcParentNode, docParentNode);
            if (names.Count <= 0) return null;
            //
            foreach(string name in names)
            {
                //if (name == "collection.js.html")
                //{
                //    Debug.WriteLine("0");
                //}
                //
                FileSystemNode srcNode = findSubNode(srcParentNode, name);
                FileSystemNode docNode = findDocSubNode(docParentNode, name); // name, name+".html", name+".xml"
                FileSystemNodeKind srcNodeKind = calcNodeKind(srcNode);
                FileSystemNodeKind docNodeKind = calcNodeKind(docNode);
                //
                //if (docNodeKind == FileSystemNodeKind.None)
                //{
                //    // dir/none, file/none
                //    //if (srcNode == null)
                //    //{
                //    //    Debug.WriteLine("1");
                //    //}
                //    result.AddSub(new NavNode(srcNode.Name, NavNodeKind.Placeholder));
                //}
                //else if (docNodeKind == FileSystemNodeKind.File)
                //{
                //    // dir/file, file/file, none/file
                //    result.AddSub(new NavNode(docNode.Name, NavNodeKind.Page));
                //}
                //else
                //{
                //    // dir/dir, dir/file, file/dir, none/dir
                //    result.AddSub(CreateNavNode(srcNode, docNode));
                //}


                switch (srcNodeKind)
                {
                    case FileSystemNodeKind.Dir:
                        switch (docNodeKind)
                        {
                            case FileSystemNodeKind.Dir:
                                // dir/dir
                                result.AddSub(CreateNavNode(srcNode, docNode));
                                break;
                            case FileSystemNodeKind.File:
                                result.AddSub(CreateNavNode(srcNode, docNode));
                                break;
                            case FileSystemNodeKind.None:
                                // dir/none
                                result.AddSub(CreateNavNode(srcNode, docNode));
                                break;
                        }
                        break;
                    case FileSystemNodeKind.File:
                        switch (docNodeKind)
                        {
                            case FileSystemNodeKind.Dir:
                                // file/dir
                                NavNode navNode = CreateNavNode(srcNode, docNode);
                                FileSystemNode docFileNode = findDocFileSubNode(docParentNode, name);
                                if (docFileNode != null)
                                {
                                    navNode.Name = docFileNode.Name;
                                    navNode.Kind = NavNodeKind.DirPage;
                                }
                                result.AddSub(navNode);
                                break;
                            case FileSystemNodeKind.File:
                                // file/file
                                if (!userIgnore(docNode))
                                {
                                    result.AddSub(new NavNode(docNode.Name, NavNodeKind.Page));
                                }
                                break;
                            case FileSystemNodeKind.None:
                                // file/none
                                result.AddSub(new NavNode(srcNode.Name, NavNodeKind.Placeholder));
                                break;
                        }
                        break;
                    case FileSystemNodeKind.None:
                        switch (docNodeKind)
                        {
                            case FileSystemNodeKind.Dir:
                                // none/dir
                                result.AddSub(CreateNavNode(srcNode, docNode));
                                break;
                            case FileSystemNodeKind.File:
                                // none/file
                                if (!userIgnore(docNode))
                                {
                                    FileSystemNode docDirNode = findSubNode(docParentNode, NavNode.CalcDisplayName(name));
                                    if (docDirNode == null)
                                    {
                                        result.AddSub(new NavNode(docNode.Name, NavNodeKind.Page));
                                    }
                                }
                                break;
                            case FileSystemNodeKind.None:
                                // none/none, impossible
                                throw new Exception("impossible case found");
                        }
                        break;
                }
            }
            //
            if (result.SubNodes.Count > 0)
            {
                result.SortSubNodes();
                return result;
            }
            return null;
        }

        private static NavNode CreateNavNode_Old(FileSystemNode srcNode, FileSystemNode docNode)
        {
            NavNode result = new NavNode("root", NavNodeKind.Dir);
            //
            if (docNode != null)
            {
                result.Name = docNode.Name;
                //
                foreach (FileSystemNode docSubNode in docNode.SubNodes)
                {
                    if (docSubNode.IsDir)
                    {
                        FileSystemNode srcSubNode = FileSystemNode.FindSub(srcNode, docSubNode.Name);
                        NavNode resultSubNode = CreateNavNode(srcSubNode, docSubNode);
                        if (resultSubNode != null)
                        {
                            FileSystemNode docFileSubNode = docNode.FindSub(docSubNode.Name + ".html");
                            if (docFileSubNode != null)
                            {
                                // doc dir and doc file, e.g. "collection.js" dir and "collection.js.html" file:
                                //
                                resultSubNode.Name += ".html";
                                resultSubNode.Kind = NavNodeKind.DirPage;
                            }
                            result.AddSub(resultSubNode);
                        }
                    }
                    else
                    {
                        FileSystemNode docDirSubNode = docNode.FindSub(NavNode.CalcDisplayName(docSubNode.Name));
                        if (docDirSubNode == null)
                        {
                            NavNode resultSubNode = new NavNode(docSubNode.Name, NavNodeKind.Page);
                            result.AddSub(resultSubNode);
                        }
                        else
                        {
                            // the pair NavNodeKind.DirPage file, e.g. "collection.js.html"
                        }
                    }
                }
            }
            //
            if (srcNode != null)
            {
                result.Name = srcNode.Name;
                //
                foreach (FileSystemNode srcSubNode in srcNode.SubNodes)
                {
                    FileSystemNode docSubNode = FileSystemNode.FindSub(docNode, calcDocNodeName(srcSubNode));
                    if (docSubNode == null)
                    {
                        // the src js file is not documented yet:
                        //
                        if (srcSubNode.IsDir)
                        {
                            NavNode resultSubNode = CreateNavNode(srcSubNode, docSubNode);
                            if (resultSubNode != null) result.AddSub(resultSubNode);
                        }
                        else
                        {
                            NavNode resultSubNode = new NavNode(srcSubNode.Name, NavNodeKind.Placeholder);
                            result.AddSub(resultSubNode);
                        }
                    }
                }
            }
            //
            if (result.SubNodes.Count > 0)
            {
                result.SortSubNodes();
                return result;
            }
            //
            return null;
        }

        private static string calcDocNodeName(FileSystemNode srcNode)
        {
            string docSuffix = srcNode.IsDir ? "" : ".html";
            return srcNode.Name + docSuffix;
        }

        private const string TAB = "  ";

        private static string GenerateNavHtml(NavNode root, string path, string indent = "")
        {
            StringBuilder sb = new StringBuilder();
            //
            sb.AppendLine(indent + "<ul>");
            //
            foreach (NavNode subNode in root.SubNodes)
            {
                sb.AppendLine(indent + TAB + "<li>");
                //
                string addr = path + "/" + Path.ChangeExtension(subNode.Name, ".html");
                string tag_a = string.Format("<a href='{1}'>{0}</a>", subNode.DisplayName, addr);
                if (subNode.Kind == NavNodeKind.Placeholder) tag_a = string.Format("<span>{0}</span>", subNode.DisplayName);
                if (subNode.Kind == NavNodeKind.Dir) tag_a = string.Format("<span class=\"nav-dir\">{0}</span>", subNode.DisplayName);
                if (subNode.Kind == NavNodeKind.DirPage) tag_a = string.Format("<a class=\"nav-dir\" href='{1}'>{0}</a>", subNode.DisplayName, addr);
                sb.AppendLine(indent + TAB + TAB + tag_a);
                //
                if (subNode.SubNodes.Count > 0) sb.Append(GenerateNavHtml(subNode, path + "/" + subNode.DisplayName, indent + TAB + TAB));
                //
                sb.AppendLine(indent + TAB + "</li>");
            }
            //
            sb.AppendLine(indent + "</ul>");
            //
            return sb.ToString();
        }

    }
}
