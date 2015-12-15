using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes
{
    class TextProcessor
    {

        private int pos = 0;
        private string text = null;

        public TextProcessor(string text)
        {
            if (text == null) text = string.Empty;
            //
            this.text = text;
            this.pos = 0;
        }

        //public int Pos { get { return this.pos; } }

        public void EatSpace()
        {
            while (this.pos < this.text.Length)
            {
                char c = this.text[this.pos];
                if (!char.IsWhiteSpace(c)) break;
                //
                this.pos++;
            }
        }

        public string EatQuoted(char quote)
        {
            Debug.Assert(this.Current() == quote);
            this.pos++;
            //
            int start = this.pos;
            int end = -1;
            //
            while (this.pos < this.text.Length)
            {
                char c = this.text[this.pos];
                if (c == quote) break;
                //
                this.pos++;
            }
            //
            if (this.Current() == quote)
            {
                end = this.pos;
                this.pos++;
            }
            //
            if (end >= start) return this.text.Substring(start, end - start);
            //
            return null;
        }

        public string EatNonSpace()
        {
            int start = this.pos;
            //
            while (this.pos < this.text.Length)
            {
                char c = this.text[this.pos];
                if (char.IsWhiteSpace(c)) break;
                //
                this.pos++;
            }
            //
            return this.text.Substring(start, this.pos - start);
        }

        public string EatName()
        {
            int start = this.pos;
            //
            while (this.pos < this.text.Length)
            {
                char c = this.text[this.pos];
                bool ok = (c == '_') || (c == '-') || char.IsLetterOrDigit(c);
                if (!ok) break;
                //
                this.pos++;
            }
            //
            return this.text.Substring(start, this.pos - start);
        }

        public bool EatString(string s, StringComparison comparisonType = StringComparison.Ordinal)
        {
            if (string.IsNullOrEmpty(s)) throw new ArgumentException("s");
            //
            if ((this.pos + s.Length) <= this.text.Length)
            {
                string t = this.text.Substring(this.pos, s.Length);
                if (string.Equals(s, t, comparisonType))
                {
                    this.pos += s.Length;
                    return true;
                }
            }
            return false;
        }

        public bool EatChar(char c)
        {
            if (this.pos < this.text.Length)
            {
                if (this.text[this.pos] == c)
                {
                    this.pos++;
                    return true;
                }
            }
            return false;
        }

        public bool End()
        {
            return (this.pos >= this.text.Length);
        }

        public char Current()
        {
            if (this.pos < this.text.Length)
            {
                return this.text[this.pos];
            }
            else
            {
                return '\0';
            }
        }

    }
}
