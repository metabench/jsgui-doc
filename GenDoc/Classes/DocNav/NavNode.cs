using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes
{

    enum NavNodeKind { DirPage, Dir, Page, Placeholder };

    class NavNode
    {
        public string Name { get; set; }
        public NavNodeKind Kind { get; set; }

        public NavNode Parent { get; private set; }
        public List<NavNode> SubNodes { get; private set; }

        public NavNode(string name, NavNodeKind kind)
        {
            this.Name = name;
            this.Kind = kind;
            this.SubNodes = new List<NavNode>();
        }

        public void AddSub(NavNode subNode)
        {
            if (subNode == null) return;
            //
            subNode.Parent = this;
            //
            this.SubNodes.Add(subNode);
        }

        public string DisplayName
        {
            get
            {
                return CalcDisplayName(this.Name);
            }
        }

        public void SortSubNodes()
        {
            this.SubNodes.Sort((x, y) =>
            {
                bool x_dir = (x.Kind == NavNodeKind.Dir); // || (x.Kind == NavNodeKind.DirPage);
                bool y_dir = (y.Kind == NavNodeKind.Dir); // || (y.Kind == NavNodeKind.DirPage);
                if (x_dir != y_dir)
                {
                    return x_dir ? -1 : 1;
                }
                return string.Compare(x.Name, y.Name, ignoreCase: true);
            });
        }

        public static string CalcDisplayName(string nodeName)
        {
            string result = nodeName;
            //
            if (result.EndsWith(".html", StringComparison.OrdinalIgnoreCase))
            {
                result = result.Remove(result.Length - 5);
            }
            if (result.EndsWith(".xml", StringComparison.OrdinalIgnoreCase))
            {
                result = result.Remove(result.Length - 4);
            }
            //
            return result;
        }

        //public bool ContainsSub(string subName)
        //{
        //    foreach (NavNode sub in this.SubNodes)
        //    {
        //        if (string.Equals(sub.Name, subName, StringComparison.OrdinalIgnoreCase)) return true;
        //    }
        //    return false;
        //}

        //public NavNode FindSub(string subName)
        //{
        //    foreach (NavNode sub in this.SubNodes)
        //    {
        //        if (string.Equals(sub.Name, subName, StringComparison.OrdinalIgnoreCase)) return sub;
        //    }
        //    return null;
        //}

    }
}
