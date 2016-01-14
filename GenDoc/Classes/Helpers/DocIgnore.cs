using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes
{
    class DocIgnore
    {

        private const string IGNORE_FILE_NAME = ".doc-ignore";
        private const string USER_IGNORE_FILE_NAME = ".doc-user-ignore";

        //private DirectoryInfo dirInfo = null;

        private List<string> ignoringNames = null; // new List<string>();
        private List<string> userIgnoringNames = null; // new List<string>();

        public DocIgnore(DirectoryInfo dirInfo, bool userIgnoreMode = false)
        {
            //this.dirInfo = dirInfo;
            //
            this.ignoringNames = this.createNamesList(dirInfo, IGNORE_FILE_NAME);
            this.userIgnoringNames = this.createNamesList(dirInfo, USER_IGNORE_FILE_NAME);
            //
            //string ignoreFileName = userIgnoreMode ? USER_IGNORE_FILE_NAME : IGNORE_FILE_NAME;
            //string ignoreFullFileName = Path.Combine(dirInfo.FullName, ignoreFileName);
            ////
            //if (File.Exists(ignoreFullFileName))
            //{
            //    string[] lines = File.ReadAllLines(ignoreFullFileName);
            //    foreach (string line in lines)
            //    {
            //        string pureLine = line.Trim().ToLower();
            //        if (!string.IsNullOrEmpty(pureLine)) this.ignoringNames.Add(pureLine);
            //    }                
            //}
        }

        public bool Ignore(DirectoryInfo subDirInfo)
        {
            if (this.ignoringNames == null) return false;
            //
            return this.ignoringNames.Contains(subDirInfo.Name.ToLower());
        }

        public bool Ignore(FileInfo fileInfo)
        {
            if (string.Equals(fileInfo.Name, IGNORE_FILE_NAME, StringComparison.OrdinalIgnoreCase)) return true;
            if (string.Equals(fileInfo.Name, USER_IGNORE_FILE_NAME, StringComparison.OrdinalIgnoreCase)) return true;
            //
            if (this.ignoringNames == null) return false;
            //
            return this.ignoringNames.Contains(fileInfo.Name.ToLower());
        }

        public bool UserIgnore(DirectoryInfo subDirInfo)
        {
            if (this.userIgnoringNames == null) return false;
            //
            return this.userIgnoringNames.Contains(subDirInfo.Name.ToLower());
        }

        public bool UserIgnore(FileInfo fileInfo)
        {
            if (string.Equals(fileInfo.Name, IGNORE_FILE_NAME, StringComparison.OrdinalIgnoreCase)) return true;
            if (string.Equals(fileInfo.Name, USER_IGNORE_FILE_NAME, StringComparison.OrdinalIgnoreCase)) return true;
            //
            if (this.userIgnoringNames == null) return false;
            //
            return this.userIgnoringNames.Contains(fileInfo.Name.ToLower());
        }

        private List<string> createNamesList(DirectoryInfo dirInfo, string ignoreFileName)
        {
            string ignoreFullFileName = Path.Combine(dirInfo.FullName, ignoreFileName);
            //
            if (File.Exists(ignoreFullFileName))
            {
                List<string> result = new List<string>();
                string[] lines = File.ReadAllLines(ignoreFullFileName);
                foreach (string line in lines)
                {
                    string pureLine = line.Trim().ToLower();
                    if (!string.IsNullOrEmpty(pureLine)) result.Add(pureLine);
                }
                if (result.Count > 0) return result;
            }
            //
            return null;
        }

    }
}
