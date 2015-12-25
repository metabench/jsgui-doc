using GenDoc.Classes.Env;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes.TestsProcessing
{
    class RunTests
    {
        public static void Run()
        {
            //RunMocha.Run(@"z_core\data-object\Data_Object.spec.js");
            RunTests runner = new RunTests();
            runner.processDir(runner.rootNode, new DirectoryInfo(Settings.TestsSourceDir), Settings.TestsOutDir);
            runner.writeNav();
        }

        private RunTests()
        {
            //
        }

        private TestDirNode rootNode = new TestDirNode("root");

        private bool processDir(TestDirNode testDirNode, DirectoryInfo directoryInfo, string outDir)
        {
            bool result = false;
            //
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
                TestDirNode subTestDirNode = new TestDirNode(subDirectoryInfo.Name);
                if (processDir(subTestDirNode, subDirectoryInfo, Path.Combine(outDir, subDirectoryInfo.Name)))
                {
                    obsoleteDirs.RemoveDirFromObsoleteList(subDirectoryInfo);
                    testDirNode.AddSubDir(subTestDirNode);
                    result = true;
                }
            }
            obsoleteDirs.DeleteDirs();
            //
            // Files:
            //
            ObsoleteFiles obsoleteFiles = new ObsoleteFiles(outDirInfo);
            foreach (FileInfo fileInfo in directoryInfo.EnumerateFiles("*.spec.js"))
            {
                string outFileName = fileInfo.Name + ".html";
                obsoleteFiles.RemoveFileFromObsoleteList(outFileName);
                string fullOutFileName = Path.Combine(outDir, outFileName);
                obsoleteFiles.RemoveFileFromObsoleteList(outFileName);
                //
                //Console.WriteLine(fileInfo.FullName);
                //Console.WriteLine("  " + fullOutFileName);
                //
                TestResultsInfo testResultInfo = RunMocha.Run(fileInfo.FullName, fullOutFileName);
                //TestResultsInfo testResultInfo = new TestResultsInfo();
                //
                //Console.WriteLine(string.Format("total={0} passed={1}", testResultInfo.Total, testResultInfo.Passed));
                TestItemNode itemNode = new TestItemNode() { Name = fileInfo.Name, ResultsInfo = testResultInfo };
                testDirNode.AddItem(itemNode);
                //
                //
                result = true;
            }
            obsoleteFiles.DeleteFiles();
            //
            if (!result)
            {
                Directory.Delete(outDir);
            }
            //
            return result;
        }

        private void writeNav()
        {
            this.rootNode.UpdateResultsInfo();
            //
            string navHtml = this.generateNavHtml();
            File.WriteAllText(Path.Combine(Settings.OutDir, "tests.html"), navHtml);
        }

        private string generateNavHtml()
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("<ul>");
            //
            this.addDirNavHtml(this.rootNode, sb);
            //
            sb.AppendLine("</ul>");
            return sb.ToString();
        }

        private const string TAB = "  ";

        private void addDirNavHtml(TestDirNode dirNode, StringBuilder sb, string indent=TAB)
        {
            foreach (TestDirNode subDir in dirNode.SubNodes)
            {
                sb.AppendLine(indent + "<li>");
                sb.AppendLine(indent + TAB + string.Format("<span class='nav-dir'>{0}{1}</span>", subDir.Name, subDir.ResultsInfo.CalcHtml()));
                sb.AppendLine(indent + TAB + "<ul>");
                this.addDirNavHtml(subDir, sb, indent + TAB + TAB);
                sb.AppendLine(indent + TAB + "</ul>");
                sb.AppendLine(indent + "</li>");
            }
            //
            foreach (TestItemNode item in dirNode.ItemNodes)
            {
                sb.AppendLine(indent + "<li>");
                sb.AppendLine(indent + TAB + string.Format("<a href='{0}'>{1}</a>{2}", item.CalcSiteUrl(), item.Name, item.ResultsInfo.CalcHtml()));
                sb.AppendLine(indent + "</li>");
            }

        }

    }
}
