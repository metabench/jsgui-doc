var path = require('path');
var fs = require('fs');
var colors = require('chalk');

var root = {};

var COMPACT = "COMPACT",
    VERBOSE = "VERBOSE",
    SILENT = "SILENT",
    HTML_OUT = "HTML";

var config = {
    /*
        Modes: COMPACT, VERBOSE, SILENT

        COMPACT: Displays passed in compact and errors in compact
        VERBOSE: Displays passed with detail and errors with detail
        SILENT: Displays only errors with detail

    */
    path: '', // full or relative path (relative to your execution folder)
    filename: 'report.html',
    mode: 'VERBOSE'
};

var suiteFileName = null;
var suiteFileLines = null;

module.exports = function(runner, options) {
    var status = {
        pass: 0,
        fail: 0,
        pending: 0,
        duration: 0,
        issues: 0,
        big_issues: 0
    };

    // initialize configuration
    config.path = options.savePath || config.path;
    config.filename = options.filename || config.filename;
    config.mode = options.mode || config.mode;

    for (var i=0; (i+1)<process.argv.length; i++) {
        if (process.argv[i] == '--report-path' || process.argv[i] == '-p') {
            var list = process.argv[i+1].split('/');
            var temp_path = '';
            for (var i2=0; i2<list.length-1; i2++) {
                temp_path += list[i2] + '/';
            }

            config.filename = list[list.length-1];
            config.path = temp_path;
        }

        if (process.argv[i] == '--report-mode' || process.argv[i] == '-m') config.mode = process.argv[i+1];
    }
    config.mode = config.mode.toUpperCase();

    config.testPureFileName = calcFileName(config.filename).replace(".js.html", ".js");;

    runner.on('start', function () {
        //if (config.mode != HTML_OUT) {
        //    console.log('My Mocha HTML Table Reporter v2.0.0\nNOTE: Tests sequence must complete to generate html report');
        //    console.log("Run Mode: " + config.mode + "\n");
        //}
    });

    var onEnd = function () {

        //var template = fs.readFileSync('D:/WORK/RentACoder/James/Work/Doc/DocWebSite/template/page-test-template.html', "utf8");
        var template = fs.readFileSync(path.join(__dirname, 'page-test-template.html'), "utf8");

        //var value = fs.readFileSync(path.join(__dirname, 'header.html'), "utf8"); // get header file
        //var doc = '<html><head>' + value + '</head><body>'; // start doc
        //doc += calcDocHtml(status, root);
        //doc += '</body></html>'; // compile tests and finish the doc

        var doc = template.replace("%TITLE%", config.testPureFileName);
        doc = doc.replace("%CONTENT%", calcDocHtml(status, root));


        if (config.mode == HTML_OUT) console.log(doc);

        if (config.mode != HTML_OUT) {
            var filePath;
            if (config.filename != '') {
                filePath = path.join(config.path, config.filename);
                if (config.path && !fs.existsSync(config.path)) fs.mkdirSync(config.path);
            }

            console.log('\n');
            var summary = "";
            if (status.pass > 0) summary += "  pass: " + status.pass;
            if (status.fail > 0) summary += "  fail: " + status.fail;
            if (status.pending > 0) summary += "  pending: " + status.pending;
            if (status.big_issues > 0) summary += "  big_issues: " + status.big_issues;
            if (status.issues > 0) summary += "  issues: " + status.issues;
            console.log(config.testPureFileName + " " + summary);

            if (filePath) {
                try {
                    fs.writeFileSync(filePath, doc, 'utf8'); // write out to report.html
                    //console.log('Writing file to: ' + filePath);
                } catch (err) {
                    console.log(err.message);
                }
            } else {
                console.log('No file location and name was given');
            }
        }
    }

    //runner.on('end', onEnd.bind(null));
    process.on('exit', onEnd.bind(null));

    runner.on('suite', function (suite) {
        //console.log(suite);
        if (suite.file) {
            if (suiteFileName !== suite.file) {
                suiteFileName = suite.file;
                suiteFileLines = fs.readFileSync(suiteFileName, "utf8").split('\n');
            }
        }

        // calculate nesting level
        var depth = 0;
        var object = suite;
        while (!object.root) {
            depth++;
            object = object.parent;
        }
        suite.depth = depth;
        suite.guid = getNextSuiteId();

        //if (!suite.root && config.mode != SILENT && config.mode != HTML_OUT) console.log(textIndent(depth) + suite.title);
    });

    runner.on('suite end', function(suite) {
        if (suite.root) { // do not do anything if its the root
            root = suite;
            return;
        }

        var depth = suite.depth;

        var id = suite.guid;
        var pid = suite.parent.guid;

        var tests = '';

        try {
            suite.tests.forEach(function (test, index, array) {
                var state = test.state
                //
                if (state == 'failed') {
                    status.fail++;
                    status.duration += (test.duration != undefined) ? test.duration : 0;
                    //tests += htmlTestFailed(test, suite, status);
                    tests += calcTestHtml(test, suite, status);
                } else if (state == 'passed') {
                    status.pass++;
                    status.duration += (test.duration != undefined) ? test.duration : 0;
                    //if (config.mode == SILENT) return; // if running silent mode dont print anything
                    //tests += htmlTestPassed(test, suite, status);
                    tests += calcTestHtml(test, suite, status);
                } else if (test.pending) {
                    status.pending++;
                    //if (config.mode != SILENT) {
                    //    tests += htmlTestPending(test, suite);
                    //}
                    tests += calcTestHtml(test, suite, status);
                }
            });

        } catch (err) {
            console.log("==error==");
            console.log(err);
            console.log(err.stack);
        }


        var result = generateResult(suite);
        var display = calcSuiteHtml(suite, result);
        display += tests;

        suite.htmlDisplay = display;
    });

    runner.on('pass', function(test) {
        //var depth = test.parent.depth + 1;
        //if (config.mode != SILENT && config.mode != HTML_OUT) {
        //    var output = colors.green(textIndent(depth) + '√ ' + test.title) + colors.gray(" <" + test.duration + ">");
        //    console.log(output);
        //}
        ////
        //if (config.mode == VERBOSE && test.ctx.log != undefined) {
        //    test.log = test.ctx.log;
        //    test.ctx.log = undefined;
        //    if (test.log == undefined) test.log = '';

        //    var list = test.log.split('\n');
        //    var temp = '';

        //    for (var i=0; i<list.length; i++) {
        //        temp += '\n' + textIndent(depth + 1) + list[i];
        //    }

        //    var output = colors.grey(textIndent(depth+1) + temp);
        //    console.log(output);
        //}
    });

    runner.on('pending', function(test) {
        //var depth = test.parent.depth + 1;
        //if (config.mode != SILENT && config.mode != HTML_OUT) {
        //    var output = colors.cyan(textIndent(depth) + '» ' + test.title) + colors.gray(" <pending>");
        //    console.log(output);
        //}
    });

    runner.on('fail', function(test, err) {
        test.err = err;
        //
        //var depth = test.parent.depth + 1;
        //var output = '';
        //if (config.mode != HTML_OUT) {
        //    //
        //    if (config.mode == SILENT) output += textIndent(depth - 1) + test.parent.title + '\n';
        //    //
        //    output += colors.red(textIndent(depth) + 'x ' + test.title) + colors.gray(" <" + ((test.duration) ? test.duration : "NaN") + ">");
        //    //
        //    if (config.mode == SILENT || config.mode == VERBOSE) {
        //        test.log = test.ctx.log;
        //        test.ctx.log = undefined;
        //        if (test.log == undefined) test.log = '';

        //        var list = test.log.split('\n');
        //        var temp = "";
        //        for (var i=0; i<list.length; i++) {
        //            temp += '\n' + textIndent(depth + 1) + list[i];
        //        }
        //        output += colors.gray(((temp != '') ?'\n'+textIndent(depth + 1)+'|Test Logs|\n' + temp : '') + '\n' + textIndent(depth + 1) + '|Error Message|\n' + test.err);
        //    }
        //    console.log(output);
        //}
    });
}


var CRLF = '\r\n';

var calcDocHtml = function (status, root) {
    var doc = '';
    var width = 695;
    var totalTests = status.pass + status.fail + status.pending;
    var passWidth = ((status.pass / totalTests) * width).toFixed(0);
    var failWidth = ((status.fail / totalTests) * width).toFixed(0);
    var pendWidth = ((status.pending / totalTests) * width).toFixed(0);
    var passPercent = Math.floor((status.pass / totalTests) * 100);
    var failPercent = Math.floor((status.fail / totalTests) * 100);
    var pendingPercent = Math.floor((status.pending / totalTests) * 100);
    if (passPercent + failPercent + pendingPercent == 99) failPercent++;
    //
    // totals:
    //
    doc += '<div class="divTotals">';
    //
    doc += '<div class="totalsLeft">' +
        '<div>Run Time: ' + getTime(status.duration) + '</div>' +
        '<div class="totalTotal">Total: <span class="infoTotal">' + totalTests + '</span></div>' +
        '<div class="totalPassed">Passed: <span class="infoPassed">' + status.pass + '</span></div>' +
        '<div class="totalFailed">Failed: <span class="infoFailed">' + status.fail + '</span></div>' +
        '<div class="totalPending">Pending: <span class="infoPending">' + status.pending + '</span></div>' +
        //'<div class="totalIssues">Issues: <span class="infoIssues">' + status.issues + '</span></div>' +
        '<div class="totalIssues">Issues: ' + '<span class="infoIssues"><strong>' + status.big_issues +'</strong>+' + status.issues + '</span></div>' +
        '</div>';
    //
    doc += '<div class="totalsRight" style="width: ' + width + 'px;">' +
        '<div class="totalPassedBar" style="width:' + passWidth + 'px; ">' + passPercent + '%</div>' +
        '<div class="totalFailedBar" style="width:' + failWidth + 'px; ">' + failPercent + '%</div>' +
        '<div class="totalPendingBar" style="width:' + pendWidth + 'px; ">' + pendingPercent + '%</div>' +
        '</div>';
    //
    doc += '</div>';
    //
    // report table:
    //
    doc += CRLF + CRLF;
    doc += '<div id="reportTable">' + displayHTML(root) + '</div>'; // compile tests and finish the doc
    //
    return doc;
};

var calcSuiteHtml = function (suite, result) {
    var html = '';
    //
    html += '<table cellspacing="0" cellpadding="0">' + CRLF +
        '<tr id="' + suite.guid + '" onclick="showHide(\'' + suite.guid + '\', \'' + suite.parent.guid + '\')" class="' + suite.parent.guid + ' suite">' + CRLF +
        addIndentation(suite.depth) + CRLF +
        '<td id="image" class="expanded"></td>' + CRLF +
        '<td class="title">' + process3Exclamations(suite.title) + '</td>' + CRLF +
        '<td class="subTotal" style="color: DarkGreen;">Pass: ' + result.pass + '</td>' + CRLF +
        '<td class="subTotal" style="color: DarkRed;">Fail: ' + result.fail + '</td>' + CRLF +
        '<td class="subTotal" style="color: DarkBlue;">Pend: ' + result.pending + '</td>' + CRLF +
        '<td class="subTotal" style="color: black; width: 120px;">' + getTime(result.duration) + '</td>' + CRLF +
        '</tr></table>' + CRLF;
    //
    return html;
};

var calcTestHtml = function (test, suite, status) {
    var html = '';
    //
    var htmlTr = null;
    var htmlTdState = null;
    var detailClass = '';
    //
    var detailId = getNextDetailId();
    //
    var hasIssues = false;
    var hasBigIssues = false;
    //
    var textDuration = (test.duration != undefined) ? test.duration + ' ms' : '';
    //
    var errorHtml = calcTestErrorHtml(test.err); // process error first to save possible error line number for the getErrorLineText() call
    //
    var processedTestSource = processSource(test.fn, getErrorLineText());
    //    
    if (processedTestSource.indexOf("!!!!") >= 0) {
        textDuration += '&nbsp;&nbsp;&nbsp;<mark>!!!</mark>';
        hasBigIssues = true;
    } else if (processedTestSource.indexOf("!!!") >= 0) {
        textDuration += '&nbsp;&nbsp;&nbsp;<mark>!!!</mark>';
        hasIssues = true;
    }
    //
    var testTitle = test.title;
    var testTitleClass = "title";
    var testTitleSpanClass = "";
    if (testTitle.indexOf("!!!") == 0) {
        testTitle = testTitle.substr(3).trim();
        hasBigIssues = true;
    }
    //
    if (hasBigIssues) {
        //testTitleClass = "title exclamations";
        testTitleSpanClass = "exclamations big-issues";
    }
    //
    if (hasIssues) status.issues++;
    if (hasBigIssues) status.big_issues++;
    //
    if (test.state == 'failed') {
        htmlTr = '<tr id="' + suite.guid + 'err' + status.fail + '" onclick="showHide(\'' + detailId + '\', \'' + suite.guid + '\')" class="' + suite.guid + ' failed">';
        htmlTdState = '<td class="state failedState">Failed</td>';
        detailClass += detailId + ' failed';
    }
    if (test.state == 'passed') {
        htmlTr = '<tr id="' + suite.guid + 'pass' + status.pass + '" onclick="showHide(\'' + detailId + '\', \'' + suite.guid + '\')" class="' + suite.guid + ' passed passlog">';
        htmlTdState = '<td class="state passedState">Passed</td>';
        detailClass += detailId + ' passed';
    }
    if (test.pending) {
        htmlTr = '<tr onclick="showHide(\'' + detailId + '\', \'' + suite.guid + '\')" class="' + suite.guid + ' pending">';
        htmlTdState = '<td class="state pendingState">Pending</td>';
        detailClass += detailId + ' pending';
    }
    //
    html += '<table cellspacing="0" cellpadding="0">' + CRLF +
        htmlTr + CRLF +
        addIndentation(suite.depth + 1) + CRLF + // tests reside one step deaper than its parent suite
        '<td id="image" class="expanded"></td>' + CRLF +
        '<td class="duration">' + textDuration + '</td>' + CRLF +
        //'<td class="title">' + processTestTitle(test.title, processedTestSource) + '</td>' + CRLF +
        //'<td class="title">' + test.title + '</td>' + CRLF +
        //'<td class="title" data-type="test-title">' + testTitle + '</td>' + CRLF +
        //'<td class=' + testTitleClass + ' data-type="test-title"><span>' + testTitle + '</span></td>' + CRLF +
        //'<td class="' + testTitleClass + '" data-type="test-title">' + testTitle + '</td>' + CRLF +
        '<td class="' + testTitleClass + '" data-type="test-title"><span class="' + testTitleSpanClass + '" data-type="test-title">' + testTitle + '</span></td>' + CRLF +
        htmlTdState + CRLF +
        '</tr>' + CRLF +
        '</table>' + CRLF;
    //
    //
    html += '<table cellspacing="0" cellpadding="0">' + CRLF +
        '<tr class="' + detailClass + '">' + CRLF +
        addIndentation(suite.depth + 2) + CRLF +
        '<td class="detail">' + CRLF +
        '<pre class="prettyprint">' + CRLF +
        '<code>' + processedTestSource + '</code>' + CRLF +
        '</pre>' + CRLF +
        errorHtml +
        '</td>' + CRLF +
        '</table>' + CRLF;
    //
    return html;
};

var calcTestErrorHtml = function(test_err){
    var errorHtml = '';
    //
    if (test_err) {
        errorHtml = '<pre class="prettyprint testerror">' + CRLF + '<code>' + test_err + '</code>' + CRLF + '</pre>' + CRLF;
        if (test_err.stack) {
            errorHtml = '<pre class="prettyprint testerror">' + CRLF + '<code>' + test_err.stack + '</code>' + CRLF + '</pre>' + CRLF;
        }
        //
        errorHtml = processErrorHtml(errorHtml);
    }
    //
    return errorHtml;
};

var processSource = function (fn, errorLineText) {
    if (!fn) return '';
    var fnText = fn.toString();
    if (!fnText) return '';
    //
    var lines = ('' + fnText).split('\n');
    var result = '';
    //
    var startLine = 0;
    var endLine = lines.length - 1;
    if (endLine < 2) return fnText;
    if (lines[0].trim() == "function () {") startLine++;
    if (lines[endLine].trim() == "}") endLine--;
    //
    var indent = 100000;
    for (var i = startLine; i <= endLine; i++) {
        var line = lines[i].trimRight();
        var lefted = line.trimLeft();
        if (lefted.length > 0) {
            var ind = line.length - lefted.length;
            if (ind < indent) indent = ind;
        }
    }
    //
    for (var i = startLine; i <= endLine; i++) {
        var isErrorLine = (lines[i] == errorLineText);
        //
        var line = lines[i].trimRight();
        if (line.length > indent) {
            line = line.substr(indent);
        }
        //
        line = htmlEntities(line);
        line = process3Exclamations(line);
        //
        if (isErrorLine) line = '<mark class="testerror">' + line + '</mark>';
        //
        result += line + CRLF;
    }
    //
    return result;
};

var htmlEntities = function (str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
};

//var processTestTitle = function (title, source) {
//    var sourceContains3Exclamations = (source.indexOf("!!!") >= 0);
//    var titleContains3Exclamations = (title.indexOf("!!!") >= 0);
//    //
//    if (sourceContains3Exclamations && !titleContains3Exclamations) {
//        title += " !!!";
//        titleContains3Exclamations = true;
//    }
//    //
//    if (titleContains3Exclamations) title = process3Exclamations(title);
//    //
//    return title;
//};

var process3Exclamations = function (line) {
    var index = line.indexOf("!!!");
    if (index < 0) return line;
    //
    var result = "";
    if (index > 0) result += line.substr(0, index);
    result += "<mark>";
    result += line.substr(index);
    result += "</mark>";
    return result;
};

var errorLineNumber = null;
//
var processErrorHtml = function (html) {
    errorLineNumber = null;
    //
    var testPureFileName = config.testPureFileName;
    var p = html.indexOf(testPureFileName);
    if (p < 0) return html;
    //
    var p2 = p + testPureFileName.length;
    if (html[p2] != ':') return html;
    //
    var p3 = html.indexOf(':', p2 + 1);
    if (p3 < 0) return html;
    errorLineNumber = parseInt(html.substring(p2 + 1, p3));
    //
    var p4 = html.indexOf(')', p2);
    if (p4 < 0) return html;
    //
    var text = html.substring(p, p4);
    html = html.replace(text, "<mark>" + text + "</mark>");
    return html;
};
//
var getErrorLineText = function () {
    var errorLineText = null;
    //
    if ((errorLineNumber !== null) && suiteFileLines) {
        var errorLineIndex = errorLineNumber - 1;
        if (errorLineIndex < suiteFileLines.length) {
            errorLineText = suiteFileLines[errorLineIndex];
        }
    }
    //
    return errorLineText;
};


//#region Suite Id

var suiteId_index = 1;
//
var getNextSuiteId = function () {
    return "suite_" + suiteId_index++;
};

//var guid_old = (function () {
//    function s4() {
//        return Math.floor((1 + Math.random()) * 0x10000)
//            .toString(16)
//            .substring(1);
//    }
//    return function () {
//        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
//            s4() + '-' + s4() + s4() + s4() + '-' + s4();
//    };
//})();

//#endregion

//#region Detail Id

var detailIndex = 0;
//
var getNextDetailId = function () {
    return 'det' + detailIndex++;
};

//#endregion

var textIndent = function (indent) {
    indent = indent - 1;
    var data = '';
    for (var i = 0; i < indent; i++) {
        data += '  ';
    }
    return data;
}

var addIndentation = function(indent) {
    indent = indent - 1;
    var data = '';
    for (var i = 0; i < indent; i++) {

        var color = (16 * i) + 56;
        var colorText = 'rgb(' + color + ',' + color + ',' + color + ')'
        data += '<td style="background-color: ' + colorText + ';" class="indent"></td>';
    }
    return data;
}


var displayHTML = function(suite) {
    doc = '';
    if (suite.htmlDisplay) doc += suite.htmlDisplay;
    if (suite.suites == undefined) return doc;
    suite.suites.forEach(function(sub, index, array) {
        doc += displayHTML(sub);
    });
    return doc;
}

var generateResult = function(suite) {
    var result = {
        pass: 0,
        fail: 0,
        pending: 0,
        duration: 0
    };

    suite.suites.forEach(function(sub, index, array) {
        var reTotal = generateResult(sub);
        result.pass += reTotal.pass;
        result.fail += reTotal.fail;
        result.pending += reTotal.pending;
        result.duration += reTotal.duration;
    });

    suite.tests.forEach(function(test, index, array) {
        if (test.pending) result.pending++;
        else if (test.state == 'failed') result.fail++;
        else if (test.state == 'passed') result.pass++;
        result.duration += (test.duration != null) ? test.duration : 0;

    });

    return result;
}

var getTime = function(x) {
    ms = Math.floor(x % 1000);
    x /= 1000
    seconds = Math.floor(x % 60);
    x /= 60
    minutes = Math.floor(x % 60);
    x /= 60
    hours = Math.floor(x % 24);
    x /= 24
    days = Math.floor(x);

    return days + 'd' + ' ' + hours + ':' + minutes + ':' + seconds + ':' + ms;
}

var calcFileName = function (fullFileName) {
    var result = fullFileName;
    var p = result.lastIndexOf('/');
    if (p >= 0) result = result.substr(p + 1);
    //
    p = result.lastIndexOf('\\');
    if (p >= 0) result = result.substr(p + 1);
    //
    return result;
};

