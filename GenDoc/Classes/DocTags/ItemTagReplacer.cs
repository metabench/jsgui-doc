using GenDoc.Classes.Env;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes
{
    class ItemTagReplacer
    {

        #region Public

        // -----------------------------------
        //              Public
        // -----------------------------------

        public static string Process(string html)
        {
            ItemTagReplacer replacer = new ItemTagReplacer();
            return replacer.doProcess(html);
        }

        #endregion

        // <@item title="static get_item_sig(i, arr_depth-opt)">
        // ...
        // </@item>


        private string doProcess(string html)
        {
            TagProcessor tagProcessor = new TagProcessor("@item", html);
            return tagProcessor.Replace(this.doReplace);
        }

        private string doReplace(string openTag, string content, string closeTag)
        {
            if (!Globals.OutSettings.DevOutMode)
            {
                if (content.IndexOf("!!!!") >= 0) return string.Empty;
            }
            //
            OpenTagParser openTagParser = new OpenTagParser("@item", openTag);
            string title = openTagParser.TryGetAttribute("title");
            if (string.IsNullOrEmpty(title)) title = "Untitled";
            string _class = openTagParser.TryGetAttribute("class");
            string _id = openTagParser.TryGetAttribute("id");
            //
            StringBuilder sb = new StringBuilder();
            //
            sb.AppendLine("<dt>");
            SignatureParser signatureParser = new SignatureParser(title);
            sb.AppendLine(signatureParser.CalcHtmlH4(_class, _id));
            sb.AppendLine("</dt>");
            //
            sb.AppendLine("<dd>");
            sb.AppendLine(content);
            sb.AppendLine("</dd>");
            //
            return sb.ToString();
        }

    }
}
