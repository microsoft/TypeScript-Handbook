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