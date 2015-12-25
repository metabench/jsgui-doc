using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes.TestsProcessing
{
    class TestResultsInfo
    {
        public int Total { get; private set; }
        public int Passed { get; private set; }
        public int Failed { get; private set; }
        public int Pending { get; private set; }
        public int Issues { get; private set; }
        public int BigIssues { get; private set; }
        public int Error { get; private set; }

        public string CalcHtml()
        {
            StringBuilder sb = new StringBuilder();
            sb.Append("<span class='infoLine'>");
            //
            if (this.Passed > 0) sb.AppendFormat("<span class='infoPassed' title='passed tests'>{0}</span>", this.Passed);
            if (this.Failed > 0) sb.AppendFormat("<span class='infoFailed' title='failed tests'>{0}</span>", this.Failed);
            if (this.Pending > 0) sb.AppendFormat("<span class='infoPending' title='pending tests'>{0}</span>", this.Pending);
            //
            if ((this.Issues > 0) || (this.BigIssues > 0))
            {
                if (this.BigIssues > 0)
                {
                    sb.AppendFormat("<span class='infoIssues' title='tests with issues and big issues'><strong>{0}</strong>+{1}</span>", this.BigIssues, this.Issues);
                }
                else
                {
                    sb.AppendFormat("<span class='infoIssues' title='tests with issues'>{0}</span>", this.Issues);
                }
            }
            //
            if (this.Error > 0) sb.AppendFormat("<span class='infoError' title='error: test file not executed'>{0}</span>", this.Error);
            //
            sb.Append("</span>");
            return sb.ToString();
        }

        public void Clear()
        {
            this.Total = 0;
            this.Passed = 0;
            this.Failed = 0;
            this.Pending = 0;
            this.Issues = 0;
            this.BigIssues = 0;
            this.Error = 0;
        }

        public void Add(TestResultsInfo summand)
        {
            this.Total += summand.Total;
            this.Passed += summand.Passed;
            this.Failed += summand.Failed;
            this.Pending += summand.Pending;
            this.Issues += summand.Issues;
            this.BigIssues += summand.BigIssues;
            this.Error += summand.Error;
        }

        public static TestResultsInfo CreateError()
        {
            TestResultsInfo result = new TestResultsInfo();
            result.Error = 1;
            return result;
        }

        public static TestResultsInfo CreateFromFile(string htmlFileName)
        {
            TestResultsInfo result = new TestResultsInfo();
            //
            HtmlDocument htmlDocument = new HtmlDocument();
            htmlDocument.Load(htmlFileName);
            //
            //
            HtmlNode nodeTotalsLeft = htmlDocument.DocumentNode.SelectSingleNode("//div[@class='totalsLeft']");
            if (nodeTotalsLeft != null)
            {
                foreach(HtmlNode subNode in nodeTotalsLeft.ChildNodes)
                {
                    if (subNode.GetAttributeValue("class", "") == "totalTotal") result.Total = getValueAfterColon(subNode.InnerText);
                    if (subNode.GetAttributeValue("class", "") == "totalPassed") result.Passed = getValueAfterColon(subNode.InnerText);
                    if (subNode.GetAttributeValue("class", "") == "totalFailed") result.Failed = getValueAfterColon(subNode.InnerText);
                    if (subNode.GetAttributeValue("class", "") == "totalPending") result.Pending = getValueAfterColon(subNode.InnerText);
                    //
                    if (subNode.GetAttributeValue("class", "") == "totalIssues")
                    {
                        string innerText = subNode.InnerText;
                        if (innerText.IndexOf('+') >= 0)
                        {
                            result.BigIssues = getValueAfterColon(innerText);
                            result.Issues = getValueAfterPlus(innerText);
                        }
                        else
                        {
                            result.BigIssues = 0;
                            result.Issues = getValueAfterColon(innerText);
                        }
                    }
                }
            }
            else
            {
                result.Error = 1;
            }
            //
            return result;
        }

        private static int getValueAfterColon(string text)
        {
            // e.g. "Total: 119"
            int p = text.IndexOf(':');
            string s = text.Substring(p + 1).Trim();
            int p2 = s.IndexOf('+');
            if (p2 > 0) s = s.Substring(0, p2);
            return int.Parse(s);
        }
        private static int getValueAfterPlus(string text)
        {
            // e.g. "Issues: 1+5"
            int p = text.IndexOf('+');
            if (p < 0) return 0;
            string s = text.Substring(p + 1).Trim();
            return int.Parse(s);
        }
    }
}
