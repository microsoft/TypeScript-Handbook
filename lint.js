var markdownlint = require("markdownlint");
var glob = require("glob");
var fs = require("fs");

var markdownConfig = require("./.markdownlint.json");

var inputFiles = glob.sync("**/*.md", { ignore: "node_modules/**/*" });
var options = {
  files: inputFiles,
  config: markdownConfig,
};

var result = markdownlint.sync(options);
console.log(result.toString());

var exitCode = 0;
Object.keys(result).forEach(function (file) {
    var fileResults = result[file];
    Object.keys(fileResults).forEach(function (rule) {
        var ruleResults = fileResults[rule];
        exitCode += ruleResults.length;
    });
});

inputFiles.forEach(function(fileName) {
    var text = fs.readFileSync(fileName, "utf8")
    exitCode += checkForImproperlyIndentedFencedCodeBlocks(fileName, text);
});

process.exit(exitCode);

/**
 * @param {string} fileName
 * @param {string} text
 */
function checkForImproperlyIndentedFencedCodeBlocks(fileName, text) {
    var lines = text.split(/\r?\n/g);
    var numErrors = 0;

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var codeBlockMatch = line.match(/^(\s*)```\S+/);

        if (codeBlockMatch) {
            var startingColumn = codeBlockMatch[1].length;
            if (startingColumn === 0 || startingColumn === getCorrectStartingColumnForLine(lines, i)) {
                continue;
            }

            numErrors++;
            console.log(fileName + ": " +
                        i + 1 + ": A fenced code block following a list item must be indented to the first non-whitespace character of the list item.")
        }
    }

    return numErrors;
}

/**
 * @param {string[]} line
 * @param {number} lineIndex
 */
function getCorrectStartingColumnForLine(lines, lineIndex) {
    for (var i = lineIndex - 1; i >= 0; i--) {
        var line = lines[i];

        if (line.length === 0) {
            continue;
        }

        var m;
        if (m = line.match(/^\s*([\*\-]|(\d+\.))\s*/)) {
            return m[0].length;
        }
        if (m = line.match(/^(\s*)/)) {
            return m[0].length;
        }
    }

    return 0;
}
