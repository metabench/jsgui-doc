using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GenDoc.Classes.TestsProcessing
{
    class RunTests
    {
        public static void Run()
        {
            RunMocha.Run(@"z_core\data-object\Data_Object.spec.js");
        }
    }
}
