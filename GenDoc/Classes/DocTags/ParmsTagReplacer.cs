using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes
{
    class ParmsTagReplacer
    {

        #region Public

        // -----------------------------------
        //              Public
        // -----------------------------------

        public static string Process(string html)
        {
            ParmsTagReplacer replacer = new ParmsTagReplacer();
            return replacer.doProcess(html);
        }

        #endregion


        // <@parms>
        //     <@parm name = "parent" type="An object with _id() method" description="Parent object" />
        //     <@parm name = "xxx" type="xxx" description="xxxxxx" default="0" optional />
        //     <@parm name = "xxx" type="xxx" description="xxxxxx" />
        //     <@parm name = "xxx" type="xxx" description="xxxxxx" />
        // </@parms>


        private string doProcess(string html)
        {
            TagProcessor tagProcessor = new TagProcessor("@parms", html);
            return tagProcessor.Replace(this.doReplace);
        }

        private string doReplace(string openTag, string content, string closeTag)
        {
            List<Parm> parmList = this.calcParmList(content);
            ParmsProp parmsProp = this.calcParmsProp(parmList);
            //
            StringBuilder sb = new StringBuilder();
            //
            sb.AppendLine("    <table class=\"params\">");
            sb.AppendLine("        <thead>");
            sb.AppendLine("            <tr>");
            sb.AppendLine("                <th>Name</th>");
            sb.AppendLine("                <th>Type</th>");
            //
            if (parmsProp.HasOptional) sb.AppendLine("                <th>Argument</th>");
            if (parmsProp.HasDefault) sb.AppendLine("                <th>Default</th>");
            //
            sb.AppendLine("                <th class=\"last\">Description</th>");
            sb.AppendLine("            </tr>");
            sb.AppendLine("        </thead>");
            sb.AppendLine("        <tbody>");
            //
            foreach (Parm parm in parmList)
            {
                sb.AppendLine("            <tr>");
                sb.AppendLine("                <td class=\"name\"><code>" + parm.NameText + "</code></td>");
                sb.AppendLine("                <td class=\"type\"><span class=\"param-type\">" + parm.TypeText + "</span></td>");
                if (parmsProp.HasOptional) sb.AppendLine("                <td class=\"attributes\">" + parm.OptionalText + "</td>");
                if (parmsProp.HasDefault) sb.AppendLine("                <td class=\"default\">" + parm.DefaultText + "</td>");
                sb.AppendLine("                <td class=\"description last\"><p>" + parm.DescriptionText + "</p></td>");
                sb.AppendLine("            </tr>");
            }

                        //<td class="attributes">
                        //    &lt;optional><br>
                        //</td>
                        //<td class="default">
                        //    0
                        //</td>


            //
            //sb.Append(this.processContent(content));
            //
            sb.AppendLine("        </tbody>");
            sb.AppendLine("    </table>");
            //
            return sb.ToString();
        }

        //private string processContent(string content)
        //{
        //    if (string.IsNullOrEmpty(content)) return content;
        //    //
        //    StringBuilder sb = new StringBuilder();
        //    //
        //    TextProcessor textProcessor = new TextProcessor(content);
        //    while (!textProcessor.End())
        //    {
        //        Parm parm = this.eatParm(textProcessor);
        //        if (parm == null) break;
        //        //
        //        sb.AppendLine("            <tr>");
        //        sb.AppendLine("                <td class=\"name\"><code>" + parm.Name + "</code></td>");
        //        sb.AppendLine("                <td class=\"type\"><span class=\"param-type\">" + parm.Type + "</span></td>");
        //        sb.AppendLine("                <td class=\"description last\"><p>" + parm.Description + "</p></td>");
        //        sb.AppendLine("            </tr>");
        //    }
        //    //
        //    return sb.ToString();
        //}

        private List<Parm> calcParmList(string content)
        {
            List<Parm> result = new List<Parm>();
            //
            TextProcessor textProcessor = new TextProcessor(content);
            while (!textProcessor.End())
            {
                Parm parm = this.eatParm(textProcessor);
                if (parm == null) break;
                //
                result.Add(parm);
            }
            //
            return result;
        }

        private ParmsProp calcParmsProp(List<Parm> parmList)
        {
            ParmsProp result = new ParmsProp() { HasDefault = false, HasOptional = false };
            //
            foreach(Parm parm in parmList)
            {
                if (!string.IsNullOrEmpty(parm.Default)) result.HasDefault = true;
                if (parm.Optional) result.HasOptional = true;
            }
            //
            return result;
        }

        private class Parm
        {
            public string Name { get; set; }
            public string Type { get; set; }
            public string Description { get; set; }
            public string Default { get; set; }
            public bool Optional { get; set; }
            //
            public string NameText { get { return this.Name == null ? string.Empty : this.Name; } }
            public string TypeText { get { return this.Type == null ? string.Empty : this.Type; } }
            public string DescriptionText { get { return this.Description == null ? string.Empty : this.Description; } }
            public string DefaultText { get { return this.Default == null ? string.Empty : this.Default; } }
            public string OptionalText { get { return this.Optional  ? "&lt;optional><br>" : string.Empty; } }
        }

        private class ParmsProp
        {
            public bool HasDefault { get; set; }
            public bool HasOptional { get; set; }
        }

        private Parm eatParm(TextProcessor textProcessor)
        {
            //     <@parm name = "xxx" type="xxx" description="xxxxxx" />
            //
            textProcessor.EatSpace();
            if (textProcessor.End()) return null;
            //
            if (!textProcessor.EatString("<@parm ", StringComparison.OrdinalIgnoreCase)) return null;
            textProcessor.EatSpace();
            //
            Parm result = new Parm();
            //
            while (!textProcessor.EatString("/>"))
            {
                NameValue attr = this.eatAttr(textProcessor);
                if (attr == null) break;
                //
                if (string.Equals(attr.Name, "name", StringComparison.OrdinalIgnoreCase)) result.Name = attr.Value;
                if (string.Equals(attr.Name, "type", StringComparison.OrdinalIgnoreCase)) result.Type = attr.Value;
                if (string.Equals(attr.Name, "description", StringComparison.OrdinalIgnoreCase)) result.Description = attr.Value;
                if (string.Equals(attr.Name, "default", StringComparison.OrdinalIgnoreCase)) result.Default = attr.Value;
                if (string.Equals(attr.Name, "optional", StringComparison.OrdinalIgnoreCase)) result.Optional = !string.Equals(attr.Value, "false", StringComparison.OrdinalIgnoreCase);
                //
                textProcessor.EatSpace();
            }
            //
            return result;
        }

        private class NameValue
        {
            public string Name { get; set; }
            public string Value { get; set; }
        }

        private NameValue eatAttr(TextProcessor textProcessor)
        {
            textProcessor.EatSpace();
            if (textProcessor.End()) return null;
            //
            string attrValue = null;
            //
            string attrName = textProcessor.EatName();
            textProcessor.EatSpace();
            //
            if (textProcessor.EatChar('='))
            {
                textProcessor.EatSpace();
                char valueStartChar = textProcessor.Current();
                if ((valueStartChar == '\"') || (valueStartChar == '\''))
                {
                    attrValue = textProcessor.EatQuoted(valueStartChar);
                }
                else
                {
                    attrValue = textProcessor.EatNonSpace();
                }
            }
            //
            return new NameValue() { Name = attrName, Value = attrValue };
        }

    }
}
