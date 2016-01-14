using GenDoc.Classes.Env;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace GenDoc.PageTemplate
{
    class PageTemplateProcessor
    {

        #region Public

        // -------------------------------------
        //              Public
        // -------------------------------------

        public PageTemplateProcessor(string templateFileName)
        {
            this.templateText = File.ReadAllText(templateFileName);
        }

        public void WritePage(string pageFileName, string contentHtml)
        {
            string title = this.calcH1Content(contentHtml);
            //
            this.doWritePage(pageFileName, contentHtml, title);
        }

        public void WritePageAddH1(string pageFileName, string contentHtml, string title)
        {
            this.doWritePage(pageFileName, this.createContentWithH1(contentHtml, title), title);
        }

        public void WritePageText(string pageFileName, string text)
        {
            string title = "Untitled";
            //
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("<pre>");
            sb.AppendLine(text);
            sb.AppendLine("</pre>");
            //
            this.doWritePage(pageFileName, sb.ToString(), title);
        }


        #endregion

        #region Private

        // -------------------------------------
        //              Private
        // -------------------------------------

        private string templateText = null;

        #endregion

        #region doWritePage

        // -------------------------------------
        //              doWritePage
        // -------------------------------------

        private void doWritePage(string pageFileName, string contentHtml, string title)
        {
            string text = this.templateText;
            text = text.Replace("%TITLE%", title);
            //text = text.Replace("%CONTENT-DIR-SUFFIX%", Globals.OutSettings.ContentDirSuffix);
            text = text.Replace("%CONTENT%", contentHtml);
            //
            if (File.Exists(pageFileName))
            {
                string existingText = File.ReadAllText(pageFileName);
                if (existingText == text) return;
            }
            //
            File.WriteAllText(pageFileName, text);
        }

        #endregion

        #region Utils

        // -------------------------------------
        //              Utils
        // -------------------------------------

        private string calcH1Content(string html)
        {
            Regex regex = new Regex("<h1[^>]*>(.*)</h1>");
            Match match = regex.Match(html);
            if (match.Groups.Count > 1) return match.Groups[1].Value;
            return "Untitled";
        }

        private string createH1Html(string title)
        {
            return string.Format("<h1 class=\"page-title\">{0}</h1>", title);
        }

        private string createContentWithH1(string contentHtml, string title)
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine(this.createH1Html(title));
            sb.Append(contentHtml);
            return sb.ToString();
        }

        #endregion

    }
}
