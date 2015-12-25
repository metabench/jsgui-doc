using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes.Env
{
    static class Settings
    {
        public const string DocRelPath = "/jsgui-doc/content/doc";
        public const string IssuesRelPath = "/jsgui-doc/content/issues";
        public const string TestsRelPath = "/jsgui-doc/content/tests";

        public const string PageTemplateFileName = @"D:\WORK\RentACoder\James\Work\Doc\DocWebSite\template\page-template.html";

        public const string DocSourceDir = @"D:\WORK\RentACoder\James\Work\Doc\DocSource\content";
        public const string JsSourceDir = @"D:\WORK\RentACoder\James\Work\Main\Github-jsgui\ws\js";
        public const string TestsSourceDir = JsSourceDir + @"\test";
        //public const string TestsSourceDir = @"D:\WORK\RentACoder\James\Work\Main\Github-jsgui\ws\js\test\z_core";
        //public const string TestsSourceDir = @"D:\WORK\RentACoder\James\Work\Main\Github-jsgui\ws\js\test\jsgui-node-sprite";

        public const string OutDir = @"D:\WORK\RentACoder\James\Work\Doc\DocWebSite\jsgui-doc\content";
        public const string DocOutDir = OutDir + @"\doc";
        public const string IssuesOutDir = OutDir + @"\issues";
        public const string TestsOutDir = OutDir + @"\tests";

        public const string TestsMochaFileName = @"C:\Users\-\AppData\Roaming\npm\node_modules\mocha\bin\mocha";

        public static PageTemplate.PageTemplateProcessor pageTemplateProcessor { get; set; }
    }
}
