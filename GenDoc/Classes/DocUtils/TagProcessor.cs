using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes
{
    class TagProcessor
    {

        #region Public

        // -----------------------------------
        //              Public
        // -----------------------------------

        // === Types ===

        public enum ItemKind { Text, OpenTag, Content, CloseTag, OpenCloseTag };

        public class Item
        {
            public int Start { get; set; }
            public int Length { get; set; }
            public ItemKind Kind { get; set; }
            //
            public string CalcText(string entireText)
            {
                return entireText.Substring(this.Start, this.Length);
            }
        }

        public delegate string ReplaceDelegate(string openTag, string content, string closeTag);

        // === Members ===

        public List<Item> Items { get; private set; }

        public TagProcessor(string tagName, string htmlText)
        {
            this.doInitialize(tagName, htmlText);
        }

        public string Replace(ReplaceDelegate replacer)
        {
            return this.doReplace(replacer);
        }

        #endregion

        #region Private

        // -----------------------------------
        //              Private
        // -----------------------------------

        private string openTagText = null; // <tagname
        private string closeTagText = null; // </tagname>
        private string htmlText = null;

        #endregion

        #region Initialize

        // -----------------------------------
        //              Initialize
        // -----------------------------------

        private void doInitialize(string tagName, string htmlText)
        {
            if (string.IsNullOrEmpty(tagName)) throw new ArgumentException("tagName");
            if (string.IsNullOrEmpty(htmlText)) throw new ArgumentException("htmlText");
            //
            this.htmlText = htmlText;
            //
            this.openTagText = "<" + tagName;
            this.closeTagText = "</" + tagName + ">";
            //
            this.buildItems();
        }

        #endregion

        #region Parse

        // -----------------------------------
        //              Parse
        // -----------------------------------

        private void buildItems()
        {
            this.Items = new List<Item>();
            //
            int start = 0;
            while (start < this.htmlText.Length)
            {
                int p1 = 0, p2 = 0, p3 = 0;
                if (this.calcTagsPos(start, ref p1, ref p2, ref p3))
                {
                    if (p1 > start)
                    {
                        this.Items.Add(new Item() { Start = start, Length = p1 - start, Kind = ItemKind.Text });
                    }
                    //
                    if (p3 > 0)
                    {
                        this.Items.Add(new Item() { Start = p1, Length = p2 + 1 - p1, Kind = ItemKind.OpenTag });
                        this.Items.Add(new Item() { Start = p2 + 1, Length = p3 - (p2 + 1), Kind = ItemKind.Content });
                        this.Items.Add(new Item() { Start = p3, Length = this.closeTagText.Length, Kind = ItemKind.CloseTag });
                        //
                        start = p3 + this.closeTagText.Length;
                    }
                    else
                    {
                        this.Items.Add(new Item() { Start = p1, Length = p2 + 1 - p1, Kind = ItemKind.OpenCloseTag });
                        start = p2 + 1;
                    }
                }
                else
                {
                    this.Items.Add(new Item() { Start = start, Length = this.htmlText.Length - start, Kind = ItemKind.Text  });
                    break;
                }
            }
        }

        private bool calcTagsPos(int start, ref int p1, ref int p2, ref int p3)
        {
            p1 = this.indexOfAny(this.htmlText, start, this.openTagText + ">", this.openTagText + " ");
            //
            if (p1 >= 0)
            {
                p2 = this.htmlText.IndexOf(">", p1 + this.openTagText.Length, StringComparison.OrdinalIgnoreCase);
                if (p2 > 0)
                {
                    if (this.htmlText[p2 - 1] == '/') // <tag/>
                    {
                        p3 = -1;
                        return true;
                    }
                    //
                    p3 = this.htmlText.IndexOf(this.closeTagText, p2 + 1, StringComparison.OrdinalIgnoreCase);
                    if (p3 > 0)
                    {
                        return true;
                    }
                }
            }
            return false;
        }

        private int indexOfAny(string text, int start, string searchText1, string searchText2)
        {
            int p1 = text.IndexOf(searchText1, start, StringComparison.OrdinalIgnoreCase);
            int p2 = text.IndexOf(searchText2, start, StringComparison.OrdinalIgnoreCase);
            //
            if ((p1 >= 0) && (p2 >= 0))
            {
                return (p1 < p2) ? p1 : p2;
            }
            else
            {
                return (p1 >= 0) ? p1 : p2;
            }
        }

        #endregion

        #region Replace

        // -----------------------------------
        //              Replace
        // -----------------------------------

        private string doReplace(ReplaceDelegate replacer)
        {
            StringBuilder sb = new StringBuilder();
            //
            int index = 0;
            while (index < this.Items.Count)
            {
                Item item = this.Items[index];
                if (item.Kind == ItemKind.Text)
                {
                    sb.Append(item.CalcText(this.htmlText));
                    index++;
                }
                else if (item.Kind == ItemKind.OpenCloseTag)
                {
                    string textOpen = item.CalcText(this.htmlText);
                    string replaceText = replacer(textOpen, null, null);
                    sb.Append(replaceText);
                    index++;
                }
                else
                {
                    if ((index + 2) >= this.Items.Count) throw new Exception("(index + 2) >= this.textItems.Count");
                    if (item.Kind != ItemKind.OpenTag) throw new Exception("item.Kind != ItemKind.OpenTag");
                    //
                    Item itemContent = this.Items[index + 1];
                    Item itemClose = this.Items[index + 2];
                    if (itemContent.Kind != ItemKind.Content) throw new Exception("itemContent.Kind != ItemKind.Content");
                    if (itemClose.Kind != ItemKind.CloseTag) throw new Exception("itemClose.Kind != ItemKind.CloseTag");
                    //
                    string textOpen = item.CalcText(this.htmlText);
                    string textContent = itemContent.CalcText(this.htmlText);
                    string textClose = itemClose.CalcText(this.htmlText);
                    string replaceText = replacer(textOpen, textContent, textClose);
                    sb.Append(replaceText);
                    //
                    index += 3;
                }
            }
            //
            return sb.ToString();
        }

        #endregion

    }
}
