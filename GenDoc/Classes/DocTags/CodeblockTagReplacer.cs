using GenDoc.Classes.DocUtils;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes
{
    class CodeblockTagReplacer
    {

        #region Public

        // -----------------------------------
        //              Public
        // -----------------------------------

        public static string Process(string html)
        {
            CodeblockTagReplacer replacer = new CodeblockTagReplacer();
            return replacer.doProcess(html);
        }

        #endregion

        private int exampleProblemsCount = 0;

        private string doProcess(string html)
        {
            TagProcessor tagProcessor = new TagProcessor("@codeblock", html);
            string result = tagProcessor.Replace(this.doReplace);
            result = this.calcExampleProblemsListHtml() + result;
            return result;
        }

        private string calcExampleProblemId(int exampleProblemIndex)
        {
            return string.Format("example-problem-{0}", exampleProblemIndex);
        }

        private string calcExampleProblemsListHtml()
        {
            if (this.exampleProblemsCount <= 0) return string.Empty;
            //
            StringBuilder sb = new StringBuilder();
            sb.Append("<div class=\"example-problems-list\">");
            sb.Append("<p>Example problems:</p>");
            sb.Append("<ul>");
            //
            for (int i = 0; i < this.exampleProblemsCount; i++)
            {
                string link = string.Format("<a href=\"#{0}\">{1}</a>", this.calcExampleProblemId(i), i+1);
                sb.AppendFormat("<li>{0}</li> ", link);
            }
            //
            sb.Append("</ul>");
            sb.Append("</div>");
            return sb.ToString();
        }

        private string doReplace(string openTag, string content, string closeTag)
        {
            OpenTagParser openTagParser = new OpenTagParser("@codeblock", openTag);
            string src = openTagParser.TryGetAttribute("src");
            if (string.IsNullOrEmpty(src)) src = null;
            //
            StringBuilder sb = new StringBuilder();
            sb.AppendLine("<div>");
            //
            if (src != null)
            {
                TestSourceLoader testSourceLoader = new TestSourceLoader(src);
                //
                string labelText = testSourceLoader.State.ToString();
                if (testSourceLoader.State == TestSourceLoader.TestState.Passed) labelText = "√ " + labelText;
                //
                string stateClass = "";
                string labelClass = "label-ok";
                string problemId = "";
                if (testSourceLoader.State != TestSourceLoader.TestState.Passed)
                {
                    stateClass = " testerror";
                    labelClass = "label-problem";
                    problemId = string.Format("id=\"{0}\"", this.calcExampleProblemId(this.exampleProblemsCount++));
                }
                //
                //sb.AppendLine("<div class=\"example-wrapper" + stateClass + "\">");
                sb.AppendLine(string.Format("<div {0} class=\"example-wrapper{1}\">", problemId, stateClass));
                sb.AppendLine(string.Format("<p class=\"example-label {0}\" title=\"{2}\">{1}</p>\r\n", labelClass, labelText, "The code unit test state"));
                sb.Append("<pre  class=\"prettyprint\"><code>");
                sb.Append(this.processContent(testSourceLoader.Text));
                sb.Append("</code></pre>");
                sb.AppendLine("</div>");
            }
            //
            if (content != null)
            {
                sb.AppendLine("<div class=\"example-wrapper staticcode\">");
                sb.AppendLine("<p class=\"example-label label-static\" title=\"This code is not checked by unit testing system\">Static code</p>\r\n");
                sb.Append("<pre  class=\"prettyprint\"><code>");
                sb.Append(this.processContent(content));
                sb.Append("</code></pre>");
                sb.AppendLine("</div>");
            }
            //
            //
            sb.AppendLine("</div>");
            return sb.ToString();
        }

        private string processContent(string content)
        {
            if (string.IsNullOrEmpty(content)) return content;
            //
            content = content.Replace("\t", "    ");
            //
            string[] lines = this.splitToLines(content); // content.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
            if (lines.Length <= 0) return content;
            //
            //List<string> temp = lines.ToList();
            //if ((temp.Count > 0) && (string.IsNullOrWhiteSpace(temp[0]))) temp.RemoveAt(0);
            //if ((temp.Count > 0) && (string.IsNullOrWhiteSpace(temp[temp.Count - 1]))) temp.RemoveAt(temp.Count - 1);
            //lines = temp.ToArray();
            //if (lines.Length <= 0) return Environment.NewLine;
            //
            List<string> newLines = new List<string>();
            //
            if (lines.Length == 1)
            {
                newLines.Add(lines[0].Trim());
            }
            else
            {
                int minSpace = this.calcMinStartSpaceLength(lines);                
                //
                newLines.Add(lines[0].TrimStart());
                for (int i = 1; i < lines.Length; i++)
                {
                    if (string.IsNullOrWhiteSpace(lines[i]))
                    {
                        newLines.Add(string.Empty);
                    }
                    else
                    {
                        newLines.Add(lines[i].Substring(minSpace));
                    }
                }
                //newLines.Add(lines[lines.Length - 1].TrimEnd());
            }
            //
            for (int i=0; i<newLines.Count; i++)
            {
                newLines[i] = this.process3Exclamations(newLines[i]);
            }
            //
            return String.Join(Environment.NewLine, newLines);
        }

        private string[] splitToLines(string content)
        {
            string[] lines = content.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.None);
            if (lines.Length > 0)
            {
                List<string> temp = lines.ToList();
                if ((temp.Count > 0) && (string.IsNullOrWhiteSpace(temp[0]))) temp.RemoveAt(0);
                if ((temp.Count > 0) && (string.IsNullOrWhiteSpace(temp[temp.Count - 1]))) temp.RemoveAt(temp.Count - 1);
                lines = temp.ToArray();
            }
            //
            return lines;
        }

        private int calcMinStartSpaceLength(string[] lines)
        {
            //int result = this.calcStartSpaceLength(lines[0]);
            int? result = null;
            for (int i=0; i<lines.Length; i++)
            {
                int? current = this.calcStartSpaceLength(lines[i]);
                if (current.HasValue)
                {
                    if (!result.HasValue)
                    {
                        result = current;
                    }
                    else
                    {
                        if (current.Value < result.Value) result = current;
                    }
                }
            }
            //
            if (!result.HasValue) return 0;
            return result.Value;
        }

        private int? calcStartSpaceLength(string line)
        {
            if (string.IsNullOrWhiteSpace(line)) return null;
            //
            string trimmed = line.TrimStart();
            return line.Length - trimmed.Length;
        }

        private string process3Exclamations(string line)
        {
            int index = line.IndexOf("!!!");
            if (index < 0) return line;
            //
            string result = "";
            if (index > 0) result += line.Substring(0, index);
            result += "<mark>";
            result += line.Substring(index);
            result += "</mark>";
            return result;
        }


}
}
