using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes.Env
{
    class OutputSettings
    {

        public bool DevOutMode { get; set; }

        public string OutDir { get; set; }
        public string DocOutDir { get; set; }
        public string IssuesOutDir { get; set; }
        public string TestsOutDir { get; set; }

        //public const string DocRelPath = "/jsgui-doc/content/doc";
        //public const string IssuesRelPath = "/jsgui-doc/content/issues";
        //public const string TestsRelPath = "/jsgui-doc/content/tests";

        public string ContentDirSuffix { get { return this.DevOutMode ? "-dev" : ""; } }

        public string DocRelPath { get { return string.Format("/jsgui-doc/content{0}/doc", this.ContentDirSuffix); } }
        public string IssuesRelPath { get { return string.Format("/jsgui-doc/content{0}/issues", this.ContentDirSuffix); } }
        public string TestsRelPath { get { return string.Format("/jsgui-doc/content{0}/tests", this.ContentDirSuffix); } }
    }
}
