using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.YellowIssues
{
    class IssueDirNode
    {

        public string Name { get; set; }

        public string DisplayName {
            get {
                if ((this.ItemNodes.Count > 0) && (this.allSubItemsCount > 0)) return string.Format("{0} ({1}+{2})", this.Name, this.ItemNodes.Count, this.allSubItemsCount);
                //
                return string.Format("{0} ({1})", this.Name, this.ItemNodes.Count + this.allSubItemsCount);
            }
        }

        public IssueDirNode Parent { get; private set; }
        public List<IssueDirNode> SubNodes { get; private set; }

        public List<IssueItemNode> ItemNodes { get; private set; }

        public IssueDirNode()
        {
            this.SubNodes = new List<IssueDirNode>();
            this.ItemNodes = new List<IssueItemNode>();
        }

        public IssueDirNode FindSubDir(string subName)
        {
            foreach (IssueDirNode sub in this.SubNodes)
            {
                if (string.Equals(sub.Name, subName, StringComparison.OrdinalIgnoreCase)) return sub;
            }
            return null;
        }

        public IssueDirNode AddSub(string subName)
        {
            IssueDirNode sub = new IssueDirNode() { Name = subName, Parent = this };
            this.SubNodes.Add(sub);
            return sub;
        }

        public void AddItem(IssueItemNode itemNode)
        {
            this.ItemNodes.Add(itemNode);
        }

        //public int TotalItemsCount()
        //{
        //    int result = this.ItemNodes.Count;
        //    foreach (IssueDirNode subDir in this.SubNodes) result += subDir.TotalItemsCount();
        //    return result;
        //}

        //private int itemsCount = 0;
        private int allSubItemsCount = 0;

        public void UpdateItemsCount()
        {
            //this.itemsCount = this.ItemNodes.Count;
            this.allSubItemsCount = 0;
            foreach (IssueDirNode subDir in this.SubNodes)
            {
                subDir.UpdateItemsCount();
                this.allSubItemsCount += (subDir.ItemNodes.Count + subDir.allSubItemsCount);
            }
        }

    }
}
