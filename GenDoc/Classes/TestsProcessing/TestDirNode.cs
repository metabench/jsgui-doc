using GenDoc.Classes.Env;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes.TestsProcessing
{
    class TestDirNode
    {

        public string Name { get; set; }
        public TestResultsInfo ResultsInfo { get; private set; }

        public TestDirNode Parent { get; private set; }
        public List<TestDirNode> SubNodes { get; private set; }
        public List<TestItemNode> ItemNodes { get; private set; }

        public TestDirNode(string name)
        {
            this.Name = name;
            this.ResultsInfo = new TestResultsInfo();
            this.SubNodes = new List<TestDirNode>();
            this.ItemNodes = new List<TestItemNode>();
        }

        public void AddSubDir(TestDirNode subDir)
        {
            subDir.Parent = this;
            this.SubNodes.Add(subDir);
        }

        public void AddItem(TestItemNode item)
        {
            item.Parent = this;
            this.ItemNodes.Add(item);
        }

        public string CalcSitePath()
        {
            if (this.Parent == null) return Globals.OutSettings.TestsRelPath;
            return this.Parent.CalcSitePath() + "/" + this.Name;
        }

        public void UpdateResultsInfo()
        {
            this.ResultsInfo.Clear();
            //
            foreach(TestDirNode dirNode in this.SubNodes)
            {
                dirNode.UpdateResultsInfo();
                this.ResultsInfo.Add(dirNode.ResultsInfo);
            }
            //
            foreach(TestItemNode itemNode in this.ItemNodes) this.ResultsInfo.Add(itemNode.ResultsInfo);
        }

    }
}
