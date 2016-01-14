using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes
{
    class ObsoleteFiles
    {

        private DirectoryInfo dirInfo = null;
        private List<string> obsoleteFileNames = new List<string>();


        public ObsoleteFiles(DirectoryInfo dirInfo)
        {
            this.dirInfo = dirInfo;
            //
            foreach (FileInfo fi in dirInfo.EnumerateFiles())
            {
                obsoleteFileNames.Add(fi.Name);
            }
        }

        public void RemoveFileFromObsoleteList(FileInfo fileInfo)
        {
            this.obsoleteFileNames.Remove(fileInfo.Name);
        }

        public void RemoveFileFromObsoleteList(string fileName)
        {
            this.obsoleteFileNames.Remove(fileName);
        }

        public void DeleteFiles()
        {
            foreach (string obsoleteFileName in this.obsoleteFileNames)
            {
                string fullObsoleteFileName = Path.Combine(this.dirInfo.FullName, obsoleteFileName);
                File.Delete(fullObsoleteFileName);
            }
        }

    }
}
