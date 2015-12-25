using GenDoc.Classes.Env;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes.TestsProcessing
{
    class RunMocha
    {

        public static void Run(string testRelFileName)
        {
            string testDir = Settings.TestsSourceDir;
            string outDir = Settings.TestsOutDir;
            //
            string testFileName = Path.Combine(testDir, testRelFileName);
            string outFileName = Path.Combine(outDir, testRelFileName) + ".html";
            //
            Run(testFileName, outFileName);
        }

        public static TestResultsInfo Run(string testFileName, string outFileName)
        {
            // D:\WORK\RentACoder\James\Work\Main\Github-jsgui\ws\js\test\z_core\
            // D:\WORK\RentACoder\James\Work\Main\Github-jsgui\ws\js\test\z_core\data-object\Data_Object.spec.js 
            // D:\WORK\RentACoder\James\Work\Main\Github-jsgui\ws\js\test\z_heap\require\require.spec.js 

            string args = string.Format("{0} -R my-mocha-reporter -m Silent {1} -p {2}", Settings.TestsMochaFileName, testFileName, outFileName);
            //
            ProcessStartInfo startInfo = new ProcessStartInfo("node.exe", args);
            //
            //startInfo.RedirectStandardOutput = true;
            startInfo.RedirectStandardError = true;
            startInfo.UseShellExecute = false;
            //startInfo.CreateNoWindow = true;
            //
            bool execute = CommandLine.ExecuteTests;
            if (CommandLine.TestsStartPath != null)
            {
                if (!testFileName.StartsWith(CommandLine.TestsStartPath)) execute = false;
            }
            //
            string error = "unknown error";
            //
            if (execute)
            {
                File.Delete(outFileName);
                //
                using (Process exeProcess = Process.Start(startInfo))
                {
                    error = exeProcess.StandardError.ReadToEnd();
                    exeProcess.WaitForExit();
                    //Debug.WriteLine(exeProcess.ExitCode);
                }
            }
            //
            if (File.Exists(outFileName)) {
                return TestResultsInfo.CreateFromFile(outFileName);
            }
            //
            Settings.pageTemplateProcessor.WritePageText(outFileName, error);
            return TestResultsInfo.CreateError();
        }

    }
}
