using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using GenDoc.Classes.DocUtils;

namespace GenDoc.UnitTests.DocUtils
{
    [TestClass]
    public class UnitTest1
    {
        [TestMethod]
        public void Test_IsStringEmptyOrComments()
        {
            Assert.AreEqual(true, CommentsChecker.IsStringEmptyOrComments(""));
            Assert.AreEqual(true, CommentsChecker.IsStringEmptyOrComments("     "));
            Assert.AreEqual(true, CommentsChecker.IsStringEmptyOrComments("  <!-- xx -->   "));
            Assert.AreEqual(true, CommentsChecker.IsStringEmptyOrComments("  <!---->   "));
            Assert.AreEqual(true, CommentsChecker.IsStringEmptyOrComments("  <!--\r\n-->   "));
            Assert.AreEqual(true, CommentsChecker.IsStringEmptyOrComments("  <!----><!-- xx -->\r\n <!-- \r\n xx\r\n -->    "));
        }
    }
}
