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
            //string testDir = @"D:\WORK\RentACoder\James\Work\Main\Github-jsgui\ws\js\test";
            //string outDir = @"D:\WORK\RentACoder\James\Work\Doc\DocWebSite\jsgui-doc\tests";
            //string mochaFileName = @"C:\Users\-\AppData\Roaming\npm\node_modules\mocha\bin\mocha";
            string testDir = Settings.TestsSourceDir;
            string outDir = Settings.TestsOutDir;
            string mochaFileName = Settings.TestsMochaFileName;
            //
            string testFileName = Path.Combine(testDir, testRelFileName);
            string outFileName = Path.Combine(outDir, testRelFileName) + ".html";

            //ProcessStartInfo startInfo = new ProcessStartInfo("mocha.cmd", @"-R my-mocha-reporter D:\WORK\RentACoder\James\Work\Main\Github-jsgui\ws\js\test\z_core\data-object\Data_Object.spec.js");
            //ProcessStartInfo startInfo = new ProcessStartInfo(
            //    "node.exe",
            //    @"C:\Users\-\AppData\Roaming\npm\node_modules\mocha\bin\mocha -R my-mocha-reporter -m Silent D:\WORK\RentACoder\James\Work\Main\Github-jsgui\ws\js\test\z_core\data-object\Data_Object.spec.js"
            //);

            string args = string.Format("{0} -R my-mocha-reporter -m Silent {1} -p {2}", mochaFileName, testFileName, outFileName);

            //Debug.WriteLine(args);
            //Debug.WriteLine(@"C:\Users\-\AppData\Roaming\npm\node_modules\mocha\bin\mocha -R my-mocha-reporter -m Silent D:\WORK\RentACoder\James\Work\Main\Github-jsgui\ws\js\test\z_core\data-object\Data_Object.spec.js -p D:\WORK\RentACoder\James\Work\Doc\DocWebSite\jsgui-doc\tests\z_core\data_object\Data_Object.spec.js.html");
            //if (args != @"C:\Users\-\AppData\Roaming\npm\node_modules\mocha\bin\mocha -R my-mocha-reporter -m Silent D:\WORK\RentACoder\James\Work\Main\Github-jsgui\ws\js\test\z_core\data-object\Data_Object.spec.js -p D:\WORK\RentACoder\James\Work\Doc\DocWebSite\jsgui-doc\tests\z_core\data_object\Data_Object.spec.js.html")
            //{
            //    Debug.WriteLine("NOT EQUAL!");
            //}

            ProcessStartInfo startInfo = new ProcessStartInfo(
                "node.exe",
                args
                //@"C:\Users\-\AppData\Roaming\npm\node_modules\mocha\bin\mocha -R my-mocha-reporter -m Silent D:\WORK\RentACoder\James\Work\Main\Github-jsgui\ws\js\test\z_core\data-object\Data_Object.spec.js -p D:\WORK\RentACoder\James\Work\Doc\DocWebSite\jsgui-doc\tests\z_core\data_object\Data_Object.spec.js.html"
            );

            //startInfo.RedirectStandardOutput = true;
            //startInfo.RedirectStandardError = true;
            startInfo.UseShellExecute = false;
            //startInfo.CreateNoWindow = true;

            //using (Process exeProcess = Process.Start(@"mocha -R my-mocha-reporter D:\WORK\RentACoder\James\Work\Main\Github-jsgui\ws\js\test\z_core\data-object\Data_Object.spec.js"))
            //using (Process exeProcess = Process.Start(@"mocha"))
            //using (Process exeProcess = Process.Start(@"mocha D:\WORK\RentACoder\James\Work\Main\Github-jsgui\ws\js\test\z_core\data-object\Data_Object.spec.js"))

            using (Process exeProcess = Process.Start(startInfo))
            {
                exeProcess.WaitForExit();
                Debug.WriteLine(exeProcess.ExitCode);
            }
        }
    }
}
