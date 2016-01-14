using GenDoc.Classes.Env;
using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes.DocUtils
{
    class TestSourceLoader
    {

        #region Public

        // -----------------------------------
        //              Public
        // -----------------------------------

        public enum TestState { Passed, Failed, Pending, Error };

        public string Src { get; private set; }
        public string Text { get; private set; }
        public TestState State { get; private set; }

        public TestSourceLoader(string src)
        {
            this.Src = src;
            this.Load(src);
        }

        #endregion


        private void Load(string src)
        {
            string testPath = null;
            string testName = null;
            this.parseSrc(src, out testPath, out testName);
            //
            string testOutFileName = this.calcTestOutFileName(testPath);
            //
            //Console.WriteLine(Settings.TestsOutDir);
            //return string.Format("TestSourceLoader: {0}, {1}", testOutFileName, testName);
            this.loadFromFile(testOutFileName, testName);
        }

        private void loadFromFile(string testOutFileName, string testName)
        {
            this.State = TestState.Error;
            //
            try
            {
                HtmlDocument htmlDocument = new HtmlDocument();
                htmlDocument.Load(testOutFileName);
                //
                HtmlNode testTableNode = this.selectTestTableNode(htmlDocument, testName);
                HtmlNode testDetailTableNode = this.selectTestDetailTableNode(testTableNode);
                //
                this.State = this.getTestState(testTableNode);
                this.Text = this.getDetailCodeText(testDetailTableNode);
                //
                //return testTableNode.InnerText;
                //return "(" + this.State.ToString() + ")" + "\r\n" + 
            }
            catch (Exception ex)
            {
                this.Text = ex.Message;
            }
        }

        private HtmlNode selectTestTableNode(HtmlDocument htmlDocument, string testName)
        {
            //string expr = string.Format("//td[@class='title' and contains(text(), '{0}')]", testName);
            //string expr = string.Format("//td[@class='title' and text()='{0}']", testName);
            //string expr = string.Format("//td[@data-type='test-title' and text()='{0}']", testName);
            string expr = string.Format("//span[@data-type='test-title' and text()='{0}']", testName);
            //
            HtmlNodeCollection nodes = htmlDocument.DocumentNode.SelectNodes(expr);
            if ((nodes == null) || (nodes.Count < 1)) throw new Exception(string.Format("Code not found: \"{0}\"", this.Src));
            if (nodes.Count > 1) throw new Exception(string.Format("Ambiguity: there are {0} occurrencies of the code: \"{1}\"", nodes.Count, this.Src));
            //
            HtmlNode testTitleNode = nodes[0]; // htmlDocument.DocumentNode.SelectSingleNode(expr);
            if (testTitleNode == null) throw new Exception("testTitleNode == null");
            //
            HtmlNode testTdNode = testTitleNode.ParentNode;
            if (testTdNode == null) throw new Exception("testTdNode == null");
            if (testTdNode.Name != "td") throw new Exception("testTdNode.Name != \"td\"");
            //
            HtmlNode testTrNode = testTdNode.ParentNode;
            if (testTrNode == null) throw new Exception("testTrNode == null");
            if (testTrNode.Name != "tr") throw new Exception("testTrNode.Name != \"tr\"");
            //
            HtmlNode testTableNode = testTrNode.ParentNode;
            if (testTableNode == null) throw new Exception("testTableNode == null");
            if (testTableNode.Name != "table") throw new Exception("testTableNode.Name != \"table\"");
            //
            return testTableNode;
        }

        private HtmlNode selectTestDetailTableNode(HtmlNode testTableNode)
        {
            return this.selectNextSibling(testTableNode, "table");
        }

        private string getDetailCodeText(HtmlNode testDetailNode)
        {
            HtmlNode codeNode = testDetailNode.SelectSingleNode(".//code");
            if (codeNode == null) throw new Exception("getDetailCodeText: codeNode == null");
            //
            return codeNode.InnerText;
        }

        private TestState getTestState(HtmlNode testTableNode)
        {
            HtmlNode stateNode = testTableNode.SelectSingleNode(".//td[contains(@class, 'state ')]");
            if (stateNode == null) throw new Exception("getTestState(): stateNode == null");
            //
            if (stateNode.InnerText == "Passed") return TestState.Passed;
            if (stateNode.InnerText == "Failed") return TestState.Failed;
            if (stateNode.InnerText == "Pending") return TestState.Pending;
            //
            throw new Exception("getTestState(): unknown state");
        }

        #region Utils

        // -----------------------------------
        //              Utils
        // -----------------------------------

        private void parseSrc(string src, out string path, out string name)
        {
            if (src == null) throw new ArgumentNullException("src");
            //
            string delimiter = ":";
            int p = src.IndexOf(delimiter);
            if (p < 0) throw new ArgumentException(string.Format("delimiter {0} not found: {1}", delimiter, src), "src");
            //
            path = src.Substring(0, p);
            name = src.Substring(p + 1);
            //
            if (string.IsNullOrEmpty(path)) throw new Exception("test path is empty");
            if (string.IsNullOrEmpty(name)) throw new Exception("test name is empty");
        }

        private string calcTestOutFileName(string testPath)
        {
            //return Path.Combine(Settings.TestsOutDir, testPath) + ".html"; // - does not works because testPath starts from "/" - returns testPathOnly as result
            //return Globals.OutSettings.TestsOutDir + testPath + ".html";
            return Globals.DevOutSettings.TestsOutDir + testPath + ".html";
        }

        private HtmlNode selectNextSibling(HtmlNode node, string siblingName)
        {
            for (HtmlNode siblingNode = node.NextSibling; siblingNode != null; siblingNode = siblingNode.NextSibling)
            {
                if (siblingNode.Name == siblingName) return siblingNode;
            }
            throw new Exception("selectNextSibling(" + siblingName + "): not found");
        }

        #endregion

    }
}
