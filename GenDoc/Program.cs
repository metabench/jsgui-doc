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
            //catch (TypeInitializationException ex)
            //{
            //    if (ex.InnerException != null) printException(ex.InnerException); else printException(ex);
            //}
            catch (Exception ex)
            {
                printException(ex);
            }
        }

        private static void printException(Exception ex)
        {
            Console.WriteLine();
            Console.WriteLine(stringOfChars('-', 70));
            //
            TypeInitializationException typeInitializationException = ex as TypeInitializationException;
            if ((typeInitializationException != null) && (typeInitializationException.InnerException != null))
            {
                Console.WriteLine(string.Format("Error: {0}", typeInitializationException.InnerException.Message));
            }
            else
            {
                Console.WriteLine(string.Format("Error: {0}", ex.Message));
            }
            //
            Console.WriteLine(stringOfChars('-', 70));
            Console.WriteLine();
            Console.WriteLine(ex.ToString());
            Console.WriteLine();
            Console.WriteLine("press Enter...");
            Console.ReadLine();
        }

        private static string stringOfChars(char c, int length)
        {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < length; i++) sb.Append(c);
            return sb.ToString();
        }

        #endregion

    }
}
