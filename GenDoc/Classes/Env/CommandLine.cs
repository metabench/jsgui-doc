using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes.Env
{
    class CommandLine
    {
        private const string SKIP_TESTS = "/skip-tests";
        private const string TESTS_START_PATH = "/tests:";

        public static bool ExecuteTests { get; private set; }
        public static string TestsStartPath { get; private set; }

        public static void Prepare(string[] args)
        {
            ExecuteTests = true;
            TestsStartPath = null;
            //
            foreach (string arg in args)
            {
                if (string.Equals(arg, SKIP_TESTS, StringComparison.OrdinalIgnoreCase))
                {
                    ExecuteTests = false;
                }
                else if (arg == ".")
                {
                    TestsStartPath = Directory.GetCurrentDirectory() + "\\";
                }
                else if (arg.EndsWith(".spec.js"))
                {
                    TestsStartPath = Path.Combine(Directory.GetCurrentDirectory(), arg);
                }
                else
                {
                    throw new Exception(string.Format("unknown command-line parameter: \"{0}\"", arg));
                }
                //
                //if (arg.StartsWith(TESTS_START_PATH, StringComparison.OrdinalIgnoreCase))
                //{
                //    TestsStartPath = processStartPath(arg.Substring(TESTS_START_PATH.Length));
                //}
            }
            //Console.WriteLine(string.Format("TestsStartPath={0}", TestsStartPath));

            //string dir = Directory.GetCurrentDirectory();
            //Console.WriteLine();
            //Console.WriteLine(string.Format("dir={0}", dir));

        }

        private static string processStartPath(string path)
        {
            // .
            // filename
            return path;
        }

    }
}
