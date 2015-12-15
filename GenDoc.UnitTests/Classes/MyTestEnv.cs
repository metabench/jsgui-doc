using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.UnitTests.Classes
{
    class MyTestEnv
    {
        private TestContext testContext = null;
        private string filesDir = null;

        public MyTestEnv(TestContext testContext, string filesDir)
        {
            if (testContext == null) throw new ArgumentNullException("testContext");
            if (filesDir == null) throw new ArgumentNullException("filesDir");
            //
            this.testContext = testContext;
            this.filesDir = filesDir;
        }

        public string InputFileName(string fileName)
        {
            string result = Path.Combine("./TestData", this.filesDir, fileName);
            //result = Path.GetFullPath
            return result;
        }

        public string ResultFileName(string fileName)
        {
            string dir = Path.Combine(this.testContext.TestRunDirectory, "MyResults", this.filesDir);
            if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
            return Path.Combine(dir, fileName);
        }
    }
}
