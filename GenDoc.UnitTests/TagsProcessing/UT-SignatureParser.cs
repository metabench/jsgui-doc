using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.Generic;
using GenDoc.Classes;

namespace GenDoc.UnitTests.TagsProcessing
{
    [TestClass]
    public class UT_SignatureParser
    {
        [TestMethod]
        public void TestSignatureParser_ParseParms()
        {
            //
            // empty
            //
            List<SignatureParser.Parm> parms = SignatureParser.ParseParms("");
            Assert.IsNotNull(parms);
            Assert.AreEqual(0, parms.Count);
            //
            // 3
            //
            parms = SignatureParser.ParseParms("a, b2-opt, ...");
            Assert.IsNotNull(parms);
            Assert.AreEqual(3, parms.Count);
            //
            Assert.AreEqual("a", parms[0].Name);
            Assert.AreEqual(false, parms[0].Optional);
            //
            Assert.AreEqual("b2", parms[1].Name);
            Assert.AreEqual(true, parms[1].Optional);
            //
            Assert.AreEqual("...", parms[2].Name);
            Assert.AreEqual(false, parms[2].Optional);
            //
            // 1
            //
            parms = SignatureParser.ParseParms(" Abc-OPT ");
            Assert.IsNotNull(parms);
            Assert.AreEqual(1, parms.Count);
            //
            Assert.AreEqual("Abc", parms[0].Name);
            Assert.AreEqual(true, parms[0].Optional);
        }

        [TestMethod]
        public void TestSignatureParser_IsStatic()
        {
            SignatureParser parser = null;
            //
            parser = new SignatureParser("func()");
            Assert.AreEqual(false, parser.IsStatic);
            //
            parser = new SignatureParser("Static func()");
            Assert.AreEqual(true, parser.IsStatic);
        }

        [TestMethod]
        public void TestSignatureParser_Name()
        {
            SignatureParser parser = null;
            //
            parser = new SignatureParser("func()");
            Assert.AreEqual("func", parser.Name);
            //
            parser = new SignatureParser("Static func()");
            Assert.AreEqual("func", parser.Name);
            //
            parser = new SignatureParser("func(a)");
            Assert.AreEqual("func", parser.Name);
            //
            parser = new SignatureParser("Static func(a,b,c)");
            Assert.AreEqual("func", parser.Name);
            //
            parser = new SignatureParser("Static func(a,b,...)");
            Assert.AreEqual("func", parser.Name);
        }

        [TestMethod]
        public void TestSignatureParser_CalcId()
        {
            SignatureParser parser = null;
            //
            parser = new SignatureParser("func()");
            Assert.AreEqual("func", parser.CalcId());
            //
            parser = new SignatureParser("Static func()");
            Assert.AreEqual("func", parser.CalcId());
            //
            parser = new SignatureParser("func(a)");
            Assert.AreEqual("func__a", parser.CalcId());
            //
            parser = new SignatureParser("Static func(a,b,c)");
            Assert.AreEqual("func__a_b_c", parser.CalcId());
            //
            parser = new SignatureParser("Static func(a,b,...)");
            Assert.AreEqual("func__a_b_", parser.CalcId());
        }

        [TestMethod]
        public void TestSignatureParser_CalcHtmlH4()
        {
            SignatureParser parser = null;
            //
            parser = new SignatureParser("func()");
            Assert.AreEqual("<h4 class=\"name\" id=\"func\">func<span class=\"signature\">()</span></h4>", parser.CalcHtmlH4());
            //
            parser = new SignatureParser("Static func()");
            Assert.AreEqual("<h4 class=\"name\" id=\"func\"><span class=\"type-signature\">&lt;static> </span>func<span class=\"signature\">()</span></h4>", parser.CalcHtmlH4());
            //
            parser = new SignatureParser("func(a)");
            Assert.AreEqual("<h4 class=\"name\" id=\"func__a\">func<span class=\"signature\">(a)</span></h4>", parser.CalcHtmlH4());
            //
            parser = new SignatureParser("Static func(a,b,c)");
            Assert.AreEqual("<h4 class=\"name\" id=\"func__a_b_c\"><span class=\"type-signature\">&lt;static> </span>func<span class=\"signature\">(a, b, c)</span></h4>", parser.CalcHtmlH4());
            //
            parser = new SignatureParser("Static func(a,b,...)");
            Assert.AreEqual("<h4 class=\"name\" id=\"func__a_b_\"><span class=\"type-signature\">&lt;static> </span>func<span class=\"signature\">(a, b, ...)</span></h4>", parser.CalcHtmlH4());
        }

    }
}
