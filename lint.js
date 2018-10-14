var markdownlint = require("markdownlint");
var glob = require("glob");
var fs = require("fs");

var inputFiles = glob.sync("**/*.md", { ignore: "node_modules/**/*" });
var options = {
  files: inputFiles,
  config: {
    "default": false, // Let's disable all rules by default
    "heading-increment": "atx", // Header style
    "ul-style": { style: "asterisk" }, // Unordered list style
    "list-indent": true, // Inconsistent indentation for list items at the same level
    "ul-start-left": true, // Consider starting bulleted lists at the beginning of the line
    "ul-indent": { indent: 4 }, // Unordered list indentation
    "no-trailing-spaces": true, // Trailing spaces
    "no-hard-tabs": true, // Hard tabs
    "no-reversed-links": true, // Reversed link syntax
    "no-multiple-blanks": true, // Multiple consecutive blank lines
    "no-missing-space-atx": true, // No space after hash on atx style header
    "no-multiple-space-atx": true, // Multiple spaces after hash on atx style header
    "blanks-around-headings": true, // Headers should be surrounded by blank lines
    "heading-start-left": true, // Headers must start at the beginning of the line
    "no-trailing-punctuation": { punctuation: ".,;:!" }, // Trailing punctuation in header
    "no-multiple-space-blockquote": true, // Multiple spaces after blockquote symbol
    "no-blanks-blockquote": true, // Blank line inside blockquote
    "ol-prefix": { style: "ordered" }, // Ordered list item prefix
    "list-marker-space": true, // Spaces after list markers
    "blanks-around-fences": true, // Fenced code blocks should be surrounded by blank lines
    "blanks-around-lists": true, // Lists should be surrounded by blank lines
    "no-bare-urls": true, // Bare URL used
    "hr-style": "---", // Horizontal rule style
    "no-space-in-emphasis": true, // Spaces inside emphasis markers
    "no-space-in-links": true, // Spaces inside link text
    "fenced-code-language": true, // Fenced code blocks should have a language specifieds
  }
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
})

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