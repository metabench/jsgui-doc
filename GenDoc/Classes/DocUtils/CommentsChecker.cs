using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace GenDoc.Classes.DocUtils
{
    class CommentsChecker
    {

        private static Regex regexFindHtmlComments = new Regex("<!--([\\s\\S]*)-->");

        public static bool IsStringEmptyOrComments(string text)
        {
            //Regex regex = new Regex("<!--([\\s\\S]*)-->");
            text = regexFindHtmlComments.Replace(text, "");
            return string.IsNullOrWhiteSpace(text);
        }


    }
}
