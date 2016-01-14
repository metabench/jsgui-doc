using GenDoc.Classes.Env;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes.DocProcessor
{
    class DocProcessor
    {

        public static void Process(string docSourceDir, string docOutDir)
        {
            if (!Directory.Exists(docSourceDir)) throw new Exception(string.Format("docSourceDir \"{0}\" not exists", docSourceDir));
            //
            processDir(new DirectoryInfo(docSourceDir), docOutDir);
        }


        #region processDir()

        // -------------------------------------
        //              processDir()
        // -------------------------------------

        private static void processDir(DirectoryInfo directoryInfo, string outDir)
        {
            if (!Directory.Exists(outDir))
            {
                Directory.CreateDirectory(outDir);
            }
            DirectoryInfo outDirInfo = new DirectoryInfo(outDir);
            //
            // Directories:
            //
            ObsoleteDirs obsoleteDirs = new ObsoleteDirs(outDirInfo);
            foreach (DirectoryInfo subDirectoryInfo in directoryInfo.EnumerateDirectories())
            {
                obsoleteDirs.RemoveDirFromObsoleteList(subDirectoryInfo);
                //
                processDir(subDirectoryInfo, Path.Combine(outDir, subDirectoryInfo.Name));
            }
            obsoleteDirs.DeleteDirs();
            //
            // Files:
            //
            ObsoleteFiles obsoleteFiles = new ObsoleteFiles(outDirInfo);
            foreach (FileInfo fileInfo in directoryInfo.EnumerateFiles())
            {
                //obsoleteFiles.RemoveFileFromObsoleteList(fileInfo);
                //
                string contentHtml = File.ReadAllText(fileInfo.FullName);
                //
                string outFileName = Path.ChangeExtension(fileInfo.Name, ".html");
                obsoleteFiles.RemoveFileFromObsoleteList(outFileName);
                string fullOutFileName = Path.Combine(outDir, outFileName);
                //
                writePage(fullOutFileName, contentHtml);
            }
            obsoleteFiles.DeleteFiles();
        }

        #endregion

        #region writePage()

        // -------------------------------------
        //          writePage()
        // -------------------------------------

        private static void writePage(string pageFileName, string contentHtml)
        {
            contentHtml = preprocessContent(contentHtml);
            //
            Globals.PageTemplateProcessor.WritePage(pageFileName, contentHtml);
            //
            Globals.IssuesProcessor.ProcessYellowIssues(pageFileName, contentHtml);
        }

        private static string preprocessContent(string contentHtml)
        {
            contentHtml = contentHtml.Replace("@link:", Globals.OutSettings.DocRelPath);
            //
            contentHtml = CodeblockTagReplacer.Process(contentHtml);
            contentHtml = ItemTagReplacer.Process(contentHtml);
            contentHtml = OverloadsTagReplacer.Process(contentHtml);
            contentHtml = SectionTagReplacer.Process(contentHtml);
            contentHtml = ParmsTagReplacer.Process(contentHtml);
            //
            return contentHtml;
        }

        #endregion





    }
}
