using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using GenDoc.Classes;
using System.Collections.Generic;

namespace GenDoc.UnitTests.TagsProcessing
{
    [TestClass]
    public class UT_TagProcessor
    {
        [TestMethod]
        public void TestTagProcessorParse()
        {
            //                       1
            //             0123456789012345678
            string html = "1<@code >2</@code>3";
            TagProcessor tagProcessor = new TagProcessor("@code", html);
            List<TagProcessor.Item> items = tagProcessor.Items;
            //
            Assert.AreEqual(5, items.Count);
            //
            Assert.IsTrue(items[0].Start == 0);
            Assert.IsTrue(items[0].Length == 1);
            Assert.IsTrue(items[0].Kind == TagProcessor.ItemKind.Text);
            //
            Assert.IsTrue(items[1].Start == 1);
            Assert.IsTrue(items[1].Length == 8);
            Assert.IsTrue(items[1].Kind == TagProcessor.ItemKind.OpenTag);
            //
            Assert.IsTrue(items[2].Start == 9);
            Assert.IsTrue(items[2].Length == 1);
            Assert.IsTrue(items[2].Kind == TagProcessor.ItemKind.Content);
            //
            Assert.IsTrue(items[3].Start == 10);
            Assert.IsTrue(items[3].Length == 8);
            Assert.IsTrue(items[3].Kind == TagProcessor.ItemKind.CloseTag);
            //
            Assert.IsTrue(items[4].Start == 18);
            Assert.IsTrue(items[4].Length == 1);
            Assert.IsTrue(items[4].Kind == TagProcessor.ItemKind.Text);
        }

        [TestMethod]
        public void TestTagProcessorReplace()
        {
            string html = "1<@code >2</@code>3";
            TagProcessor tagProcessor = new TagProcessor("@code", html);
            string result = tagProcessor.Replace((openTag, content, closeTag) => { return "(" + content + ")"; });
            Assert.AreEqual("1(2)3", result);
        }

        [TestMethod]
        public void TestTagProcessor2Tags()
        {
            string html = "1<@code >2</@code>3<@code>4</@code>5";
            TagProcessor tagProcessor = new TagProcessor("@code", html);
            string result = tagProcessor.Replace((openTag, content, closeTag) => { return "(" + content + ")"; });
            Assert.AreEqual("1(2)3(4)5", result);
        }


        [TestMethod]
        public void TestTagProcessorParse2()
        {
            //                       1
            //             0123456789012345678
            string html = "1<@code />2";
            TagProcessor tagProcessor = new TagProcessor("@code", html);
            List<TagProcessor.Item> items = tagProcessor.Items;
            //
            Assert.AreEqual(3, items.Count);
            //
            Assert.IsTrue(items[0].Start == 0);
            Assert.IsTrue(items[0].Length == 1);
            Assert.IsTrue(items[0].Kind == TagProcessor.ItemKind.Text);
            //
            Assert.IsTrue(items[1].Start == 1);
            Assert.IsTrue(items[1].Length == 9);
            Assert.IsTrue(items[1].Kind == TagProcessor.ItemKind.OpenCloseTag);
            //
            Assert.IsTrue(items[2].Start == 10);
            Assert.IsTrue(items[2].Length == 1);
            Assert.IsTrue(items[2].Kind == TagProcessor.ItemKind.Text);
        }

        [TestMethod]
        public void TestTagProcessorReplace2()
        {
            string html = "1<@code />2";
            TagProcessor tagProcessor = new TagProcessor("@code", html);
            string result = tagProcessor.Replace((openTag, content, closeTag) => { return "()"; });
            Assert.AreEqual("1()2", result);
        }

        [TestMethod]
        public void TestTagProcessorReplace3()
        {
            string html = "1<@code />2<@code>3</@code>";
            TagProcessor tagProcessor = new TagProcessor("@code", html);
            string result = tagProcessor.Replace((openTag, content, closeTag) => { return "()"; });
            Assert.AreEqual("1()2()", result);
        }


    }
}
