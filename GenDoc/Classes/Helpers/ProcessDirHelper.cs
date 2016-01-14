using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes.Helpers
{
    class ProcessDirHelper
    {

        public static void ProcessDir(DirectoryInfo directoryInfo, string outDir)
        {
            if (!Directory.Exists(outDir)) Directory.CreateDirectory(outDir);
            //
            DirectoryInfo outDirInfo = new DirectoryInfo(outDir);
            //
            // Directories:
            //
            ObsoleteDirs obsoleteDirs = new ObsoleteDirs(outDirInfo);
            foreach (DirectoryInfo subDirectoryInfo in directoryInfo.EnumerateDirectories())
            {
                obsoleteDirs.RemoveDirFromObsoleteList(subDirectoryInfo);
                //
                ProcessDir(subDirectoryInfo, Path.Combine(outDir, subDirectoryInfo.Name));
            }
            obsoleteDirs.DeleteDirs();
            //
            // Files:
            //
            ObsoleteFiles obsoleteFiles = new ObsoleteFiles(outDirInfo);
            foreach (FileInfo fileInfo in directoryInfo.EnumerateFiles())
            {
                string outFileName = processFile(fileInfo, outDir);
                obsoleteFiles.RemoveFileFromObsoleteList(outFileName);
            }
            obsoleteFiles.DeleteFiles();
        }

        private static string processFile(FileInfo fileInfo, string outDir)
        {
            string outFileName = "";
            string fullOutFileName = Path.Combine(outDir, outFileName);
            return outFileName;
        }

    }
}
