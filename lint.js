var markdownlint = require("markdownlint");
var glob = require("glob");

var options = {
  files: glob.sync("**/*.md"),
  config: {
	  MD013: false // Line length
  }
};
 
var result = markdownlint.sync(options);
console.log(result.toString());