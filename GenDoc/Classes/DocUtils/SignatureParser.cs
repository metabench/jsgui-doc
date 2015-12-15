using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes
{

    // signature example: [static] methodname(parm1, parm2-opt)

    class SignatureParser
    {

        #region Public

        // -----------------------------------
        //              Public
        // -----------------------------------

        public class Parm
        {
            public string Name { get; set; }
            public bool Optional { get; set; }
        }

        public static List<Parm> ParseParms(string insideParentheses)
        {
            return doParseParms(insideParentheses);
        }

            public SignatureParser(string text)
        {
            this.doInitialize(text);
        }

        public bool IsStatic { get; private set; }

        public string Name { get; private set; }

        public List<Parm> Parms { get; private set; }

        public string CalcId()
        {
            return this.doCalcId();
        }

        public string CalcHtmlH4(string _class = null, string _id = null)
        {
            return this.doCalcHtmlH4(_class, _id);
        }

        #endregion

        #region Private

        // -----------------------------------
        //              Private
        // -----------------------------------

        const string STATIC_ = "static ";

        private string signatureText = null;

        private int openParenthesis = -1;
        private int closeParenthesis = -1;

        private string textAfterParentheses = null;

        #endregion

        #region Initialize

        // -----------------------------------
        //              Initialize
        // -----------------------------------

        private void doInitialize(string text)
        {
            this.signatureText = text;
            //
            if (!this.prepareText())
            {
                this.IsStatic = false;
                this.Name = string.Empty;
                this.Parms = new List<Parm>();
                return;
            }
            //
            this.processStatic();
            this.processParentheses();
            this.processAfterParentheses();
            this.processName();
            this.processParms();
        }

        private bool prepareText()
        {
            if (this.signatureText == null) return false;
            //
            this.signatureText = this.signatureText.Trim();
            //
            if (String.IsNullOrEmpty(this.signatureText)) return false;
            //
            return true;
        }

        #endregion

        #region Static

        // -----------------------------------
        //              Static
        // -----------------------------------

        private void processStatic()
        {
            this.IsStatic = (this.signatureText.StartsWith(STATIC_, StringComparison.OrdinalIgnoreCase));
        }

        #endregion

        #region Name

        // -----------------------------------
        //              Name
        // -----------------------------------

        private void processName()
        {
            int nameStart = 0;
            int nameLength = this.signatureText.Length;
            //
            if (this.IsStatic)
            {
                nameStart = STATIC_.Length;
                nameLength -= STATIC_.Length;
            }
            if (this.openParenthesis >= 0) nameLength = this.openParenthesis - nameStart;
            //
            this.Name = this.substr(this.signatureText, nameStart, nameLength).Trim();
        }

        #endregion

        #region Parentheses

        // -----------------------------------
        //              Parentheses
        // -----------------------------------

        private void processParentheses()
        {
            this.findParentheses(this.signatureText, ref this.openParenthesis, ref this.closeParenthesis);
        }

        private bool findParentheses(string text, ref int p1, ref int p2)
        {
            if (string.IsNullOrEmpty(text)) return false;
            //
            p1 = text.IndexOf('(');
            if (p1 >= 0)
            {
                p2 = text.IndexOf(')', p1 + 1);
                if (p2 > 0)
                {
                    return true;
                }
            }
            //
            return false;
        }

        private bool hasParentheses()
        {
            return (this.openParenthesis >= 0) && (this.closeParenthesis > 0);
        }

        #endregion

        #region AfterParentheses

        // -----------------------------------
        //              AfterParentheses
        // -----------------------------------

        private void processAfterParentheses()
        {
            if (this.closeParenthesis > 0)
            {
                this.textAfterParentheses = this.substr(this.signatureText, this.closeParenthesis + 1);
                if (string.IsNullOrEmpty(this.textAfterParentheses)) this.textAfterParentheses = null;
            }
        }

        #endregion

        #region Parms

        // -----------------------------------
        //              Parms
        // -----------------------------------

        private void processParms()
        {
            if (this.hasParentheses())
            {
                string insideParenthesis = this.substr(this.signatureText, this.openParenthesis + 1, this.closeParenthesis - this.openParenthesis - 1);
                this.Parms = ParseParms(insideParenthesis);
            }
            else
            {
                this.Parms = new List<Parm>();
            }
        }

        private static List<Parm> doParseParms(string insideParentheses)
        {
            const string OPT = "-opt";
            List<Parm> result = new List<Parm>();
            //
            string[] parms = insideParentheses.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            foreach (string parm in parms)
            {
                string name = parm.Trim();
                bool optional = false;
                //
                if (name.EndsWith(OPT, StringComparison.OrdinalIgnoreCase))
                {
                    // example: "a-opt"
                    name = name.Remove(name.Length - OPT.Length);
                    optional = true;
                }
                //
                result.Add(new Parm() { Name = name, Optional = optional });
            }
            //
            return result;
        }

        #endregion

        #region CalcId

        // -----------------------------------
        //              CalcId
        // -----------------------------------

        private string doCalcId()
        {
            StringBuilder sb = new StringBuilder();
            //
            sb.Append(this.Name);
            if (this.Parms.Count > 0)
            {
                sb.Append("__");
                bool first = true;
                foreach (Parm parm in this.Parms)
                {
                    if (!first) sb.Append("_");
                    sb.Append(parm.Name);
                    first = false;
                }
            }
            //
            StringBuilder sb2 = new StringBuilder();
            foreach (char c in sb.ToString().ToLower())
            {
                if (Char.IsLetterOrDigit(c) || (c == '_')) sb2.Append(c);
            }
            //
            return sb2.ToString();
        }

        #endregion

        #region CalcHtmlH4

        // -----------------------------------
        //              CalcHtmlH4
        // -----------------------------------

        private string doCalcHtmlH4(string _class=null, string _id = null)
        {
            // <h4 class="name" id="connect_fields_string"><span class="type-signature"></span>connect_fields<span class="signature">(name)</span><span class="type-signature"></span></h4>
            StringBuilder sb = new StringBuilder();
            //
            string h4class = "name";
            if (!string.IsNullOrEmpty(_class)) h4class += " " + _class;
            //
            if (_id == null) _id = this.CalcId();
            //
            sb.AppendFormat("<h4 class=\"{0}\" id=\"{1}\">", h4class, _id);
            //sb.Append("<h4 class=\"name\" id=\"");
            //sb.Append(this.CalcId());
            //sb.Append("\">");
            //
            if (this.IsStatic)
            {
                sb.Append("<span class=\"type-signature\">&lt;static> </span>");
            }
            //
            sb.Append(this.Name);
            //
            // <span class="signature">(name, <span class="optional">param_index</span>)</span>
            if (this.hasParentheses())
            {
                sb.Append("<span class=\"signature\">(");
                bool first = true;
                foreach (Parm parm in this.Parms)
                {
                    if (!first) sb.Append(", ");
                    first = false;
                    //
                    if (parm.Optional) sb.Append("<span class=\"optional\">");
                    sb.Append(parm.Name);
                    if (parm.Optional) sb.Append("</span>");
                }
                sb.Append(")</span>");
            }
            //
            if (!string.IsNullOrEmpty(this.textAfterParentheses)) sb.Append(this.textAfterParentheses);
            //
            sb.Append("</h4>");
            //
            return sb.ToString();
        }

        #endregion

        #region Utils

        // -----------------------------------
        //              Utils
        // -----------------------------------

        private string substr(string text, int start, int length = int.MinValue)
        {
            if (start >= text.Length) return string.Empty;
            //
            if (length == int.MinValue) length = text.Length - start;
            if (length <= 0) return string.Empty;
            //
            return text.Substring(start, length);
        }

        #endregion

    }
}
