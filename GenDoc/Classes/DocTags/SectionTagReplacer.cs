using GenDoc.Classes.DocUtils;
using GenDoc.Classes.Env;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes
{
    class SectionTagReplacer
    {

        #region Public

        // -----------------------------------
        //              Public
        // -----------------------------------

        public static string Process(string html)
        {
            SectionTagReplacer replacer = new SectionTagReplacer();
            return replacer.doProcess(html);
        }

        #endregion

        // <@section title="Methods">
        //   <@item title="static get_item_sig(i, arr_depth-opt)">
        //    ...
        //   </@item>
        // </@section>


        private string doProcess(string html)
        {
            TagProcessor tagProcessor = new TagProcessor("@section", html);
            return tagProcessor.Replace(this.doReplace);
        }

        private string doReplace(string openTag, string content, string closeTag)
        {
            if (!Globals.OutSettings.DevOutMode)
            {
                if (CommentsChecker.IsStringEmptyOrComments(content)) return string.Empty;
            }
            //
            OpenTagParser openTagParser = new OpenTagParser("@section", openTag);
            //
            string title = openTagParser.TryGetAttribute("title");
            if (string.IsNullOrEmpty(title)) title = "Untitled";
            //
            string id_text = "";
            string id = openTagParser.TryGetAttribute("id");
            if (!string.IsNullOrEmpty(id)) id_text = " id=\"" + id + "\"";
            //
            //
            StringBuilder sb = new StringBuilder();
            //
            sb.AppendLine("");
            sb.AppendLine("<h3 class=\"subsection-title\"" + id_text + ">" + title + "</h3>"); // "Methods":  <h3 class="subsection-title">Features</h3>
            sb.AppendLine("<dl class=\"doc-section\">");
            //
            sb.AppendLine(content);
            //
            sb.AppendLine("</dl>");
            //
            return sb.ToString();
        }


    }
}
