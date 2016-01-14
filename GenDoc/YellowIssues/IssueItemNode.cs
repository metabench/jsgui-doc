using GenDoc.Classes.Env;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.YellowIssues
{
    class IssueItemNode
    {
        //public string Id { get; set; }
        public string Title { get; set; }
        public string Text { get; set; }
        public string Link { get; set; }
        //public string RelFileName { get; set; }

        public IssueItemNode(string relFileName, string id, string title, string text)
        {
            if (!string.IsNullOrEmpty(title)) title = title.Replace("&lt;", "<");
            //
            //this.Id = id;
            this.Title = title;
            this.Text = text;
            //
            string urlHash = "";
            if (!string.IsNullOrEmpty(id)) urlHash = "#" + id;
            //
            this.Link = Globals.OutSettings.DocRelPath + "/" + relFileName.Replace('\\', '/') + urlHash;
        }
    }
}
