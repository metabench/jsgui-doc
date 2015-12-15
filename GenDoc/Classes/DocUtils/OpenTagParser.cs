using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes
{
    class OpenTagParser
    {

        #region Public

        // -----------------------------------
        //              Public
        // -----------------------------------

        public Dictionary<string, string> Attributes { get; private set; }

        public OpenTagParser(string tagName, string openTagText)
        {
            this.doInitialize(tagName, openTagText);
        }

        public string TryGetAttribute(string name)
        {
            string result = null;
            if (this.Attributes.TryGetValue(name, out result)) return result;
            return null;
        }

        #endregion

        #region Private

        // -----------------------------------
        //              Private
        // -----------------------------------

        private string tagName = null;
        private string openTagText = null;

        #endregion

        #region Initialize

        // -----------------------------------
        //              Initialize
        // -----------------------------------

        private void doInitialize(string tagName, string openTagText)
        {
            if (string.IsNullOrEmpty(tagName)) throw new ArgumentException("tagName");
            if (string.IsNullOrEmpty(openTagText)) throw new ArgumentException("openTagText");
            //
            this.tagName = tagName;
            this.openTagText = openTagText;
            //
            this.buildAttributes();
        }

        #endregion

        #region Attributes

        // -----------------------------------
        //              Attributes
        // -----------------------------------

        private void buildAttributes()
        {
            if (!this.openTagText.StartsWith("<" + this.tagName, StringComparison.OrdinalIgnoreCase)) throw new Exception("tag start");
            if (!this.openTagText.EndsWith(">", StringComparison.OrdinalIgnoreCase)) throw new Exception("tag end");
            //
            this.Attributes = new Dictionary<string, string>();
            //
            int p1 = this.tagName.Length + 1; // +1:  + "<"
            int p2 = this.openTagText.Length - 1; // ">" position
            if (this.openTagText[p2] == '/') p2--;  // />
            if (p1 >= p2) return;
            //
            string openTagBody = this.openTagText.Substring(p1, p2 - p1);
            this.processOpenTagBody(openTagBody);
        }

        private void processOpenTagBody(string text)
        {
            TextProcessor textProcessor = new TextProcessor(text);
            //
            while (!textProcessor.End())
            {
                if (!this.eatAttr(textProcessor)) break;
            }
        }

        private bool eatAttr(TextProcessor textProcessor)
        {
            // attr1="xxx yyy" attr2 = "yyy"
            //
            textProcessor.EatSpace();
            if (textProcessor.End()) return false;
            //
            string attrValue = null;
            //
            string attrName = textProcessor.EatName();
            if (string.IsNullOrEmpty(attrName)) return false;
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
            this.Attributes[attrName] = attrValue;
            //
            return true;
        }

        #endregion

    }
}
