using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes
{
    class OverloadsTagReplacer
    {

        #region Public

        // -----------------------------------
        //              Public
        // -----------------------------------

        public static string Process(string html)
        {
            OverloadsTagReplacer replacer = new OverloadsTagReplacer();
            return replacer.doProcess(html);
        }

        #endregion

        // <@overloads title="get_item_sig()">
        //   <@item title="static get_item_sig(i, arr_depth-opt)">
        //    ...
        //   </@item>
        // </@overloads>


        private string doProcess(string html)
        {
            TagProcessor tagProcessor = new TagProcessor("@overloads", html);
            return tagProcessor.Replace(this.doReplace);
        }

        private string doReplace(string openTag, string content, string closeTag)
        {
            OpenTagParser openTagParser = new OpenTagParser("@overloads", openTag);
            string title = openTagParser.TryGetAttribute("title");
            if (string.IsNullOrEmpty(title)) title = "Untitled";
            //
            SignatureParser signatureParser = new SignatureParser(title);
            //
            StringBuilder sb = new StringBuilder();
            //
            sb.AppendLine("");
            sb.AppendLine("<dt>");
            sb.AppendLine("    <h4 id=\"" + signatureParser.CalcId() + "__\" >" + title + "...</h4>"); // "fields()":  <h4 id="fields__" >fields()...</h4>
            sb.AppendLine("</dt>");
            sb.AppendLine("<dd>");
            sb.AppendLine("    <dl>");
            //
            sb.AppendLine(content);
            //
            sb.AppendLine("    </dl>");
            sb.AppendLine("</dd>");
            //
            return sb.ToString();
        }


    }
}
