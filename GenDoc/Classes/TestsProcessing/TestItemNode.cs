using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes.TestsProcessing
{
    class TestItemNode
    {

        public string Name { get; set; }
        public TestDirNode Parent { get; set; }
        public TestResultsInfo ResultsInfo { get; set; }

        public string OutName { get { return this.Name + ".html"; } }

        public string CalcSiteUrl()
        {
            return this.Parent.CalcSitePath() + "/" + this.OutName;
        }


    }
}
