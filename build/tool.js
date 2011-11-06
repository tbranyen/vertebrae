var combyne = require("combyne");
var fs = require("fs");

// Parse out package.json configuration
var package = JSON.parse(fs.readFileSync("package.json").toString());
// Load in the parts
var index = fs.readFileSync("lib/index.js").toString();

// Create output file
var output = combyne(index, {
  VERSION: package.version,
  YEAR: new Date().getFullYear(),
  DATE: new Date().toGMTString()
});

output.delimiters = {
  START_PROP: "{(",
  END_PROP: ")}",
  FILTER: "@"
};

output.filters.add("include", function(name) {
  // Need to be able to rip out first comment
  return fs.readFileSync(name + ".js").toString();
});


fs.writeFile("./dist/vertebrae.js", output.render());
