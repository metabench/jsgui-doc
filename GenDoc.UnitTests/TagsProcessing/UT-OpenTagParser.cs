using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using GenDoc.Classes;

namespace GenDoc.UnitTests.TagsProcessing
{
    [TestClass]
    public class UT_OpenTagParser
    {
        [TestMethod]
        public void TestOpenTagParser()
        {
            OpenTagParser parser = null;
            //
            try { parser = new OpenTagParser("@item", "xxx"); Assert.Fail(); } catch { }
            //
            parser = new OpenTagParser("@item", "<@item>");
            Assert.AreEqual(0, parser.Attributes.Count);
            //
            parser = new OpenTagParser("@item", "<@item >");
            Assert.AreEqual(0, parser.Attributes.Count);
            //
            parser = new OpenTagParser("@item", "<@item     >");
            Assert.AreEqual(0, parser.Attributes.Count);
            //
            parser = new OpenTagParser("@item", "<@item title=abc >");
            Assert.AreEqual(1, parser.Attributes.Count);
            Assert.AreEqual("abc", parser.Attributes["title"]);
            //
            parser = new OpenTagParser("@item", "<@item title=\"abc\">");
            Assert.AreEqual(1, parser.Attributes.Count);
            Assert.AreEqual("abc", parser.Attributes["title"]);
            //
            parser = new OpenTagParser("@item", "<@item title=\'abc\'>");
            Assert.AreEqual(1, parser.Attributes.Count);
            Assert.AreEqual("abc", parser.TryGetAttribute("title"));
            Assert.AreEqual(null, parser.TryGetAttribute("title2"));
        }

        [TestMethod]
        public void TestOpenTagParser2()
        {
            OpenTagParser parser = null;
            //
            parser = new OpenTagParser("@item", "<@item title=\"abc def\">");
            Assert.AreEqual(1, parser.Attributes.Count);
            Assert.AreEqual("abc def", parser.Attributes["title"]);
            //
            parser = new OpenTagParser("@item", "<@item  title = \"abc def\"  >");
            Assert.AreEqual(1, parser.Attributes.Count);
            Assert.AreEqual("abc def", parser.Attributes["title"]);
        }

        [TestMethod]
        public void TestCodeblockSrc()
        {
            OpenTagParser parser = new OpenTagParser("@codeblock", "<@codeblock src=\"/z_core/data-object/Data_Object.spec.js:dobj() - Data_Object\" >");
            string src = parser.TryGetAttribute("src");
            Assert.AreEqual(src, "/z_core/data-object/Data_Object.spec.js:dobj() - Data_Object");
        }

        [TestMethod]
        public void TestCodeblockSrc2()
        {
            OpenTagParser parser = new OpenTagParser("@codeblock", "<@codeblock src=\"/z_core/data-object/Data_Object.spec.js:dobj() - Data_Object\" />");
            string src = parser.TryGetAttribute("src");
            Assert.AreEqual(src, "/z_core/data-object/Data_Object.spec.js:dobj() - Data_Object");
        }


    }
}
