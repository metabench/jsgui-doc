using GenDoc.Classes;
using GenDoc.Classes.Env;
using GenDoc.PageTemplate;
using GenDoc.YellowIssues;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace GenDoc
{
    class Program
    {

        #region Main

        // -------------------------------------
        //              Main
        // -------------------------------------

        private static PageTemplateProcessor pageTemplateProcessor = null;
        private static IssuesProcessor issuesProcessor = new IssuesProcessor();

        static void Main(string[] args)
        {
            Classes.TestsProcessing.RunTests.Run();
            //
            pageTemplateProcessor = new PageTemplateProcessor(Settings.PageTemplateFileName);
            //
            issuesProcessor.DocOutDir = Settings.DocOutDir;
            issuesProcessor.IssuesOutDir = Settings.IssuesOutDir;
            issuesProcessor.PageTemplateProcessor = pageTemplateProcessor;
            //
            if (!Directory.Exists(Settings.DocSourceDir))
            {
                Console.WriteLine("docDir not exists");
                return;
            }
            //
            //
            processDir(new DirectoryInfo(Settings.DocSourceDir), Settings.DocOutDir);
            //
            string navHtml = NavProcessor.CreateNavHtml(Settings.JsSourceDir, Settings.DocSourceDir);
            File.WriteAllText(Path.Combine(Settings.OutDir, "nav.html"), navHtml);
            //
            issuesProcessor.WriteIssuesNav();
            issuesProcessor.WriteIssuePages();
        }

        #endregion

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
            pageTemplateProcessor.WritePage(pageFileName, contentHtml);
            //
            issuesProcessor.ProcessYellowIssues(pageFileName, contentHtml); // text);
        }

        private static string preprocessContent(string contentHtml)
        {
            contentHtml = contentHtml.Replace("@link:", Settings.DocRelPath);
            //
            contentHtml = CodeblockTagReplacer.Process(contentHtml);
            contentHtml = SectionTagReplacer.Process(contentHtml);
            contentHtml = OverloadsTagReplacer.Process(contentHtml);
            contentHtml = ItemTagReplacer.Process(contentHtml);
            contentHtml = ParmsTagReplacer.Process(contentHtml);
            //
            return contentHtml;
        }

        #endregion

        #region Utils

        // -------------------------------------
        //              Utils
        // -------------------------------------

        private static void printNode(FileSystemNode node, string indent = "")
        {
            Debug.WriteLine(indent + node.Name);
            foreach(FileSystemNode sub in node.SubNodes)
            {
                printNode(sub, indent + "  ");
            }
        }

        #endregion

    }
}
