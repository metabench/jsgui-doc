using GenDoc.PageTemplate;
using GenDoc.YellowIssues;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes.Env
{
    class Globals
    {

        public static PageTemplateProcessor PageTemplateProcessor { get; set; }
        public static IssuesProcessor IssuesProcessor { get; set; }

        public static OutputSettings DevOutSettings { get; private set; }
        public static OutputSettings UserOutSettings { get; private set; }

        public static OutputSettings OutSettings { get; set; }

        static Globals()
        {
            DevOutSettings = new OutputSettings()
            {
                DevOutMode = true,
                OutDir = Settings.DevOutDir,
                DocOutDir = Settings.DevOutDir + @"\doc",
                IssuesOutDir = Settings.DevOutDir + @"\issues",
                TestsOutDir = Settings.DevOutDir + @"\tests"
            };
            //
            UserOutSettings = new OutputSettings()
            {
                DevOutMode = false,
                OutDir = Settings.OutDir,
                DocOutDir = Settings.OutDir + @"\doc",
                IssuesOutDir = Settings.OutDir + @"\issues",
                TestsOutDir = Settings.OutDir + @"\tests"
            };
        }

    }
}
