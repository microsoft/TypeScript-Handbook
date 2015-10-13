var markdownlint = require("markdownlint");
var glob = require("glob");

var options = {
  files: glob.sync("**/*.md", {ignore: "node_modules/**/*"}),
  config: {
	  MD013: false // Line length
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

process.exit(exitCode);
