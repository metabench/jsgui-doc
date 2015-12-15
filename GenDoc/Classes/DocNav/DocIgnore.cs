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

        private DirectoryInfo dirInfo = null;

        private List<string> ignoringNames = new List<string>();

        public DocIgnore(DirectoryInfo dirInfo)
        {
            this.dirInfo = dirInfo;
            //
            string ignoreFileName = Path.Combine(dirInfo.FullName, IGNORE_FILE_NAME);
            if (File.Exists(ignoreFileName))
            {
                string[] lines = File.ReadAllLines(ignoreFileName);
                foreach (string line in lines)
                {
                    string pureLine = line.Trim().ToLower();
                    if (!string.IsNullOrEmpty(pureLine)) this.ignoringNames.Add(pureLine);
                }                
            }
        }

        public bool Ignore(DirectoryInfo subDirInfo)
        {
            return this.ignoringNames.Contains(subDirInfo.Name.ToLower());
        }

        public bool Ignore(FileInfo fileInfo)
        {
            if (string.Equals(fileInfo.Name, IGNORE_FILE_NAME, StringComparison.OrdinalIgnoreCase)) return true;
            //
            return this.ignoringNames.Contains(fileInfo.Name.ToLower());
        }

    }
}
