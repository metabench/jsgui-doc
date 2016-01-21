using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace GenDoc.Classes.Env
{
    static class Settings
    {
        public static string PageTemplateFileName { get; set; } // = @"D:\WORK\RentACoder\James\Work\Doc\DocWebSite\template\page-template.html";
        public static string PageTemplateFileNameDev { get; set; } // = @"D:\WORK\RentACoder\James\Work\Doc\DocWebSite\template\page-template-dev.html";

        public static string DocSourceDir { get; set; } // = @"D:\WORK\RentACoder\James\Work\Doc\DocSource\content";
        public static string JsSourceDir { get; set; } // = @"D:\WORK\RentACoder\James\Work\Main\Github-jsgui\ws\js";
        public static string TestsSourceDir { get; set; } // = JsSourceDir + @"\test";
        //public const string TestsSourceDir = @"D:\WORK\RentACoder\James\Work\Main\Github-jsgui\ws\js\test\z_core";
        //public const string TestsSourceDir = @"D:\WORK\RentACoder\James\Work\Main\Github-jsgui\ws\js\test\jsgui-node-sprite";

        public static string OutDir { get; set; } // = @"D:\WORK\RentACoder\James\Work\Doc\DocWebSite\jsgui-doc\content"; // user version
        public static string DevOutDir { get; set; } // = OutDir + "-dev";  // jsgui developer's doc work version


        //public const string DocOutDir = OutDir + @"\doc";
        //public const string IssuesOutDir = OutDir + @"\issues";
        //public const string TestsOutDir = OutDir + @"\tests";

        public static string TestsMochaFileName { get; set; } // = @"C:\Users\-\AppData\Roaming\npm\node_modules\mocha\bin\mocha";

        //public static PageTemplate.PageTemplateProcessor pageTemplateProcessor { get; set; }

        static Settings()
        {
            tryLoadSettingsFromXmlFile();
        }

        private static void tryLoadSettingsFromXmlFile()
        {
            string exeFileName = System.Reflection.Assembly.GetEntryAssembly().Location;
            string settingsFileName = Path.Combine(Path.GetDirectoryName(exeFileName), "settings.xml");
            if (!File.Exists(settingsFileName)) throw new Exception("settings.xml file not found");
            //
            XmlDocument xDoc = new XmlDocument();
            xDoc.Load(settingsFileName);
            XmlElement xRoot = xDoc.DocumentElement;
            foreach (XmlNode xnode in xRoot)
            {
                if (xnode.NodeType == XmlNodeType.Element)
                {
                    string name = xnode.Attributes.GetNamedItem("name").Value;
                    string value = xnode.Attributes.GetNamedItem("value").Value;
                    //
                    setValue(name, value);
                }
            }
            //
            checkValue("PageTemplateFileName", PageTemplateFileName);
            checkValue("PageTemplateFileNameDev", PageTemplateFileNameDev);
            checkValue("DocSourceDir", DocSourceDir);
            checkValue("JsSourceDir", JsSourceDir);
            checkValue("TestsSourceDir", TestsSourceDir);
            checkValue("OutDir", OutDir);
            checkValue("DevOutDir", DevOutDir);
            checkValue("TestsMochaFileName", TestsMochaFileName);
        }

        private static void setValue(string name, string value)
        {
            //Console.WriteLine("name=" + name + "  value=" + value);
            switch (name)
            {
                case "PageTemplateFileName": PageTemplateFileName = value; break;
                case "PageTemplateFileNameDev": PageTemplateFileNameDev = value; break;

                case "DocSourceDir": DocSourceDir = value; break;
                case "JsSourceDir": JsSourceDir = value; break;
                case "TestsSourceDir": TestsSourceDir = value; break;

                case "OutDir": OutDir = value; break;
                case "DevOutDir": DevOutDir = value; break;
                case "TestsMochaFileName": TestsMochaFileName = value; break;
            }
        }

        private static void checkValue(string name, string value)
        {
            if (string.IsNullOrWhiteSpace(value)) throw new Exception(string.Format("settings.xml: \"{0}\" is not set", name));
        }


    }
}
