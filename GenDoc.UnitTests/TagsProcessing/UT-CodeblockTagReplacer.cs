using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Text;
using GenDoc.Classes;
using System.IO;
using GenDoc.UnitTests.Classes;

namespace GenDoc.UnitTests.TagsProcessing
{
    [TestClass]
    public class UT_CodeblockTagReplacer
    {

        private TestContext testContextInstance;
        /// <summary>
        ///Gets or sets the test context which provides
        ///information about and functionality for the current test run.
        ///</summary>
        public TestContext TestContext
        {
            get
            {
                return testContextInstance;
            }
            set
            {
                testContextInstance = value;
            }
        }

        [TestMethod]
        public void TestCodeblockTagReplacer1()
        {
            MyTestEnv env = new MyTestEnv(this.TestContext, "CodeblockTagReplacer");
            //
            Assert.IsTrue(this.checkFile(env, "1-empty.xml"));
            Assert.IsTrue(this.checkFile(env, "2-simple.xml"));
            Assert.IsTrue(this.checkFile(env, "3-if.xml"));
            Assert.IsTrue(this.checkFile(env, "4-empty-line.xml"));
            Assert.IsTrue(this.checkFile(env, "5-custom.xml"));
            Assert.IsTrue(this.checkFile(env, "6-collection.xml"));
            //Assert.IsTrue(this.checkFile(env, "7-temp.xml"));
        }

        private bool checkFile(MyTestEnv env, string fileName)
        {
            string outFileName = Path.GetFileNameWithoutExtension(fileName) + "-res" + Path.GetExtension(fileName);
            //
            string input = File.ReadAllText(env.InputFileName(fileName));
            string expected = File.ReadAllText(env.InputFileName(outFileName));
            //
            string output = CodeblockTagReplacer.Process(input);
            File.WriteAllText(env.ResultFileName(outFileName), output);
            //
            return (expected.Trim() == output.Trim());
        }

        //[TestMethod]
        //public void TestCodeblockTagReplacer0()
        //{
        //    StringBuilder sbIn = new StringBuilder();
        //    sbIn.AppendLine("  <@codeblock>");
        //    sbIn.AppendLine("       x = 1;");
        //    sbIn.AppendLine("  </@codeblock>");
        //    //
        //    StringBuilder sbOut = new StringBuilder();
        //    sbOut.AppendLine("<pre class=\"prettyprint\"><code>");
        //    sbOut.AppendLine("x = 1;");
        //    sbOut.AppendLine("</code></pre>");
        //    //
        //    string result = CodeblockTagReplacer.Process(sbIn.ToString());
        //    //
        //    //Assert.AreEqual(sbOut.ToString().Trim(), result.Trim());

        //    Assert.IsTrue(File.Exists("TestData/CodeblockTagReplacer/1-empty.xml"));
        //    //
        //    //Assert.AreEqual("", this.TestContext.TestResultsDirectory);
        //    //
        //    MyTestEnv env = new MyTestEnv(this.TestContext, "CodeblockTagReplacer");
        //    string fileName1 = env.InputFileName("1-empty.xml");
        //    Assert.IsTrue(File.Exists(fileName1));
        //    //
        //    string res = env.ResultFileName("1-empty-res.xml");
        //    File.WriteAllText(res, "my res");
        //    //
        //    //Assert.AreEqual("", env.ResultFileName("1-empty-res.xml"));
        //}

    }
}
