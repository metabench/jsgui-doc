﻿using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes
{
    class FileSystemNode
    {

        public string Name { get; set; }
        public FileSystemNode Parent { get; private set; }
        public List<FileSystemNode> SubNodes { get; private set; }

        public bool IsDir { get; private set; }
        public bool IsFile { get { return !this.IsDir; } }

        public bool UserIgnore { get; set; }

        public FileSystemNode(string name, bool isDir)
        {

            this.Name = name;
            this.IsDir = isDir;
            this.SubNodes = new List<FileSystemNode>();
            this.UserIgnore = false;
        }

        public void AddFile(string name, bool userIgnore)
        {
            FileSystemNode subNode = new FileSystemNode(name, isDir: false);
            this.AddSub(subNode, userIgnore);
        }

        public void AddSub(FileSystemNode subNode, bool userIgnore)
        {
            subNode.Parent = this;
            subNode.UserIgnore = userIgnore;
            //
            int index = this.SubNodes.BinarySearch(subNode, nodeComparer);
            if (index < 0) index = ~index;
            this.SubNodes.Insert(index, subNode);
        }

        public FileSystemNode FindSub(string subName)
        {
            FileSystemNode subDir = new FileSystemNode(subName, isDir: true);
            int index = this.SubNodes.BinarySearch(subDir, nodeComparer);
            if (index >= 0) return this.SubNodes[index];
            //
            FileSystemNode subFile = new FileSystemNode(subName, isDir: false);
            index = this.SubNodes.BinarySearch(subFile, nodeComparer);
            if (index >= 0) return this.SubNodes[index];
            //
            return null;
        }

        public static FileSystemNode FindSub(FileSystemNode node, string subName)
        {
            if (node == null) return null;
            return node.FindSub(subName);
        }

        private static NodeComparer nodeComparer = new NodeComparer();

        private class NodeComparer : IComparer<FileSystemNode>
        {
            public int Compare(FileSystemNode x, FileSystemNode y)
            {
                if (x.IsDir != y.IsDir)
                {
                    return x.IsDir ? -1 : 1;
                }
                return string.Compare(x.Name, y.Name);
            }
        }

        #region Utils

        // -------------------------------------
        //              Utils
        // -------------------------------------

        public void PrintToDebug(string indent = "")
        {
            Debug.WriteLine(indent + this.Name);
            foreach (FileSystemNode sub in this.SubNodes)
            {
                sub.PrintToDebug(indent + "  ");
            }
        }

        #endregion


    }
}
