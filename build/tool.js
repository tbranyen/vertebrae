var combyne = require("combyne");
var fs = require("fs");

// Parse out package.json configuration
var package = JSON.parse(fs.readFileSync("package.json").toString());
// Load in the parts
var main = fs.readFileSync("lib/main.js").toString();

// Create output file
var output = combyne(main, {
  VERSION: package.version,
  YEAR: new Date().getFullYear(),
  DATE: new Date().toGMTString()
});

output.filters.add('include', function(name, stripComments) {
  if (stripComments) {
    console.log('strip comments for filename', name);
  }
  // Need to be able to rip out first comment
  return fs.readFileSync(name + ".js").toString();
});


fs.writeFile('vertebrae.js', output.render());
