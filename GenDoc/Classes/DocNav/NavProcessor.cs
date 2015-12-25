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

        public static string CreateNavHtml(string srcDir, string docDir)
        {
            NavNode navRoot = CreateNavTree(new DirectoryInfo(srcDir), new DirectoryInfo(docDir));
            return GenerateNavHtml(navRoot, Settings.DocRelPath);
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
                result.AddSub(CreateFileSystemDirNode(subDirectoryInfo));
            }
            //
            foreach (FileInfo fileInfo in directoryInfo.EnumerateFiles())
            {
                if (docIgnore.Ignore(fileInfo)) continue;
                result.AddFile(fileInfo.Name);
            }
            //
            return result;
        }


        private static NavNode CreateNavNode(FileSystemNode srcNode, FileSystemNode docNode)
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
