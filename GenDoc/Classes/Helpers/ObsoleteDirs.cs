using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes
{
    class ObsoleteDirs
    {

        private DirectoryInfo dirInfo = null;
        private List<string> obsoleteDirNames = new List<string>();


        public ObsoleteDirs(DirectoryInfo dirInfo)
        {
            this.dirInfo = dirInfo;
            //
            foreach (DirectoryInfo di in dirInfo.EnumerateDirectories())
            {
                obsoleteDirNames.Add(di.Name);
            }
        }

        public void RemoveDirFromObsoleteList(DirectoryInfo di)
        {
            this.obsoleteDirNames.Remove(di.Name);
        }

        public void DeleteDirs()
        {
            foreach (string obsoleteDirName in this.obsoleteDirNames)
            {
                string fullObsoleteDirName = Path.Combine(this.dirInfo.FullName, obsoleteDirName);
                if (Directory.Exists(fullObsoleteDirName))
                {
                    Directory.Delete(fullObsoleteDirName, recursive: true);
                }
            }
        }

        public void Print()
        {
            foreach (string obsoleteDirName in this.obsoleteDirNames)
            {
                Console.WriteLine("ObsoleteDirs: " + obsoleteDirName);
            }
        }

    }
}
