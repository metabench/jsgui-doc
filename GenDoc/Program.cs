using GenDoc.Classes;
using GenDoc.Classes.DocProcessor;
using GenDoc.Classes.Env;
using GenDoc.Classes.TestsProcessing;
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

        static void Main(string[] args)
        {
            try
            {
                CommandLine.Prepare(args);
                //
                // ------------------------------------------
                //          Developer's version:
                // ------------------------------------------
                //
                Globals.PageTemplateProcessor = new PageTemplateProcessor(Settings.PageTemplateFileNameDev);
                //
                Globals.OutSettings = Globals.DevOutSettings;
                //
                Globals.IssuesProcessor = new IssuesProcessor();
                //
                TestsProcessor.Process();
                //
                DocProcessor.Process(Settings.DocSourceDir, Globals.OutSettings.DocOutDir);
                //
                NavProcessor.Process();
                //
                Globals.IssuesProcessor.WriteOutput();
                //
                // ------------------------------------------
                //              User's version:
                // ------------------------------------------
                //
                Globals.PageTemplateProcessor = new PageTemplateProcessor(Settings.PageTemplateFileName);
                //
                Globals.OutSettings = Globals.UserOutSettings;
                //
                Globals.IssuesProcessor = new IssuesProcessor();
                //
                //TestsProcessor.Run();
                //
                DocProcessor.Process(Settings.DocSourceDir, Globals.OutSettings.DocOutDir);
                //
                NavProcessor.Process();
                //
                Globals.IssuesProcessor.WriteOutput();
            }
            catch (Exception ex)
            {
                Console.WriteLine(string.Format("Error: {0}", ex.Message));
                Console.WriteLine();
                Console.WriteLine(ex.ToString());
                Console.WriteLine();
                Console.WriteLine("press Enter...");
                Console.ReadLine();
            }
        }

        #endregion

    }
}
