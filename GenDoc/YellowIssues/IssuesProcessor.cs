using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HtmlAgilityPack;
using System.IO;
using GenDoc.PageTemplate;
using GenDoc.Classes.Env;

namespace GenDoc.YellowIssues
{
    class IssuesProcessor
    {

        #region Public

        // -------------------------------------
        //              Public
        // -------------------------------------

        //public string DocOutDir { get; set; }
        //public string IssuesOutDir { get; set; }
        //public PageTemplateProcessor PageTemplateProcessor { get; set; }

        public void ProcessYellowIssues(string pageFileName, string text)
        {
            if (!Globals.OutSettings.DevOutMode) return;
            //
            this.doProcessYellowIssues(pageFileName, text);
        }

        public void Print()
        {
            this.print(this.rootDirNode);
        }

        public void WriteOutput()
        {
            if (!Globals.OutSettings.DevOutMode) return;
            //
            this.writeIssuesNav();
            this.writeIssuePages();
        }

        #endregion

        #region Private

        // -------------------------------------
        //              Private
        // -------------------------------------

        private IssueDirNode rootDirNode = new IssueDirNode() { Name = "" };

        #endregion

        #region doProcessYellowIssues

        // -------------------------------------
        //              doProcessYellowIssues
        // -------------------------------------

        private void doProcessYellowIssues(string pageFileName, string text)
        {
            HtmlDocument htmlDocument = new HtmlDocument();
            htmlDocument.LoadHtml(text);
            //
            string relFileName = pageFileName.Substring(Globals.OutSettings.DocOutDir.Length);
            //
            HtmlNodeCollection markNodes = htmlDocument.DocumentNode.SelectNodes("//mark");
            if ((markNodes != null) && (markNodes.Count > 0))
            {
                IssueDirNode issueDirNode = this.adjustIssueDirNode(relFileName);
                //
                foreach (HtmlNode markNode in markNodes)
                {
                    IssueItemNode issueItemNode = null;
                    //
                    HtmlNode parentDdNode = this.calcParentDdNode(markNode);
                    if (parentDdNode != null)
                    {
                        HtmlNode titleNode = this.calcDtTitleNode(parentDdNode);
                        if (titleNode != null)
                        {
                            issueItemNode = new IssueItemNode(relFileName, titleNode.Id, titleNode.InnerText, markNode.InnerText);
                        }
                    }
                    //
                    if (issueItemNode == null)
                    {
                        HtmlNode parentWithId = this.calcParentWithId(markNode);
                        if (parentWithId != null)
                        {
                            issueItemNode = new IssueItemNode(relFileName, parentWithId.Id, "???", markNode.InnerText);
                        }
                    }
                    //
                    if (issueItemNode == null)
                    {
                        issueItemNode = new IssueItemNode(relFileName, null, "???", markNode.InnerText);
                    }
                    //
                    issueDirNode.AddItem(issueItemNode);
                }
            }
        }

        private HtmlNode calcParentDdNode(HtmlNode node)
        {
            HtmlNode parentNode = node.ParentNode;
            if (parentNode == null) return null;
            //
            if (string.Equals(parentNode.Name, "dd", StringComparison.OrdinalIgnoreCase)) return parentNode;
            //
            return calcParentDdNode(parentNode);
        }

        private HtmlNode calcDtTitleNode(HtmlNode ddNode)
        {
            HtmlNode dtNode = ddNode.PreviousSibling;
            while ((dtNode != null) && (dtNode.NodeType != HtmlNodeType.Element)) dtNode = dtNode.PreviousSibling;
            if (ddNode == null) return null;
            //
            HtmlNode dtFirstChild = dtNode.FirstChild;
            while ((dtFirstChild != null) && (dtFirstChild.NodeType != HtmlNodeType.Element)) dtFirstChild = dtFirstChild.NextSibling;
            if (dtFirstChild == null) return null;
            //
            if (string.Equals(dtFirstChild.Name, "h4", StringComparison.OrdinalIgnoreCase)) return dtFirstChild;
            //
            return null;
        }

        private HtmlNode calcParentWithId(HtmlNode node)
        {
            HtmlNode parentNode = node.ParentNode;
            if (parentNode == null) return null;
            //
            if (!string.IsNullOrEmpty(parentNode.Id)) return parentNode;
            //
            return calcParentWithId(parentNode);
        }


        private IssueDirNode adjustIssueDirNode(string relFileName)
        {
            relFileName = Path.ChangeExtension(relFileName, null); // remove tailing ".html"
            string[] parts = relFileName.Split('\\');
            //
            IssueDirNode current = this.rootDirNode;
            foreach (string part in parts)
            {
                IssueDirNode subDir = current.FindSubDir(part);
                if (subDir == null) subDir = current.AddSub(part);
                current = subDir;
            }
            return current;
        }

        #endregion

        #region print

        // -------------------------------------
        //              print
        // -------------------------------------

        private void print(IssueDirNode dir, string ind = "")
        {
            //Console.WriteLine(string.Format("{0}{1} ({2})", ind, dir.Name, dir.TotalItemsCount()));
            Console.WriteLine(string.Format("{0}{1}", ind, dir.DisplayName));
            //
            foreach (IssueDirNode subDir in dir.SubNodes)
            {
                print(subDir, ind + "  ");
            }
            //
            foreach (IssueItemNode item in dir.ItemNodes)
            {
                //Console.WriteLine(string.Format("{0} > {1}: {2} {3}", ind, item.Id, item.Title, item.Link));
                Console.WriteLine(string.Format("{0} > {1}: {2}", ind, item.Title, item.Link));
            }
        }

        #endregion

        #region WriteOutput

        // -------------------------------------
        //              WriteOutput
        // -------------------------------------

        private void writeIssuesNav()
        {
            this.rootDirNode.UpdateItemsCount();
            string navHtml = this.doGenIssuesNavHtml(this.rootDirNode, Globals.OutSettings.IssuesRelPath);
            //File.WriteAllText(Path.Combine(this.DocOutDir, "issues.html"), navHtml);
            File.WriteAllText(Path.Combine(Globals.OutSettings.OutDir, "issues.html"), navHtml);
            //this.Print();
        }

        private void writeIssuePages()
        {
            this.clearIssuePages(Globals.OutSettings.IssuesOutDir);
            this.doWriteIssuePages(this.rootDirNode, Globals.OutSettings.IssuesOutDir);
        }

        #endregion

        #region doGenIssuesNavHtml

        // -------------------------------------
        //              doGenIssuesNavHtml
        // -------------------------------------


        /*
            core (8)
              jsgui-lang.js (3)
              collection.js (1+5)
                Collection (5)
        */

        private const string TAB = "  ";

        private string doGenIssuesNavHtml(IssueDirNode root, string path, string indent = "")
        {
            StringBuilder sb = new StringBuilder();
            //
            sb.AppendLine(indent + "<ul>");
            //
            foreach (IssueDirNode subNode in root.SubNodes)
            {
                sb.AppendLine(indent + TAB + "<li>");
                //
                //string addr = path + "/" + Path.ChangeExtension(subNode.Name, ".html");
                //string tag_a = string.Format("<a href='{1}'>{0}</a>", subNode.DisplayName, addr);
                //if (subNode.Kind == NavNodeKind.Placeholder) tag_a = string.Format("<span>{0}</span>", subNode.DisplayName);
                //if (subNode.Kind == NavNodeKind.Dir) tag_a = string.Format("<span class=\"nav-dir\">{0}</span>", subNode.DisplayName);
                //if (subNode.Kind == NavNodeKind.DirPage) tag_a = string.Format("<a class=\"nav-dir\" href='{1}'>{0}</a>", subNode.DisplayName, addr);

                string tagClass = (subNode.SubNodes.Count > 0) ? "class=\"nav-dir\"" : "";
                string itemTag = string.Format("<span {0}>{1}</span>", tagClass, subNode.DisplayName);
                if (subNode.ItemNodes.Count > 0) itemTag = string.Format("<a {0} href=\"{1}\">{2}</a>", tagClass, path + "/" + subNode.Name + ".html", subNode.DisplayName);
                //
                //if (subNode.SubNodes.Count > 0) itemTag = string.Format("<span class=\"nav-dir\">{0}</span>", subNode.DisplayName);
                //
                sb.AppendLine(indent + TAB + TAB + itemTag);
                //
                if (subNode.SubNodes.Count > 0) sb.Append(doGenIssuesNavHtml(subNode, path + "/" + subNode.Name, indent + TAB + TAB));
                //
                sb.AppendLine(indent + TAB + "</li>");
            }
            //
            sb.AppendLine(indent + "</ul>");
            //
            return sb.ToString();
        }

        #endregion

        #region doWriteIssuePages

        // -------------------------------------
        //              doWriteIssuePages
        // -------------------------------------

        private void clearIssuePages(string path)
        {
            if (Directory.Exists(path))
            {
                Directory.Delete(path, recursive: true);
            }
            //
            //Directory.CreateDirectory(path);
        }


        private void doWriteIssuePages(IssueDirNode dirNode, string parentPath)
        {
            string dirNodePath = Path.Combine(parentPath, dirNode.Name);
            //
            if (dirNode.ItemNodes.Count > 0)
            {
                string pagePath = dirNodePath  + ".html";
                string contentHtml = this.createIssuesHtml(dirNode);
                //string pageHtml = contentHtml; // this.processTemplate(contentHtml);
                //File.WriteAllText(pagePath, pageHtml);
                Globals.PageTemplateProcessor.WritePageAddH1(pagePath, contentHtml, dirNode.Name + " known issues");
            }
            //
            if (dirNode.SubNodes.Count > 0)
            {
                Directory.CreateDirectory(dirNodePath);
                //
                foreach (IssueDirNode subDirNode in dirNode.SubNodes)
                {
                    doWriteIssuePages(subDirNode, dirNodePath);
                }
            }
        }

        private string createIssuesHtml(IssueDirNode dirNode)
        {
            StringBuilder sb = new StringBuilder();
            //
            //sb.AppendLine("<h1 class=\"page-title\">" + dirNode.Name + " issues </h1>");
            //
            sb.AppendLine("<ol>");
            foreach(IssueItemNode item in dirNode.ItemNodes)
            {
                sb.AppendLine(TAB + "<li>");
                //
                sb.AppendLine(TAB + TAB + "<ul>");
                //sb.AppendLine(TAB + TAB + TAB + string.Format("<p><strong>{0}</strong></p>", item.Title));
                sb.AppendLine(TAB + TAB + TAB + string.Format("<p><a href=\"{0}\" target=\"_blank\"><strong>{1}</strong></a></p>", item.Link, item.Title));
                sb.AppendLine(TAB + TAB + TAB + string.Format("<p><mark>{0}</mark></p>", item.Text));
                sb.AppendLine(TAB + TAB + "</ul>");
                //
                sb.AppendLine(TAB + "</li>");
            }
            sb.AppendLine("</ol>");
            //
            return sb.ToString();
        }

        #endregion

    }
}
