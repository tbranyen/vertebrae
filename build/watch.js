var fs = require("fs");
var exec = require("child_process").exec;

function monitor(tasks, trigger) {
  function complete() {
    trigger();
  }

  tasks.forEach(function(task) {
    task(complete);
  });
}

function watch(path) {
  return function(callback) {
    fs.watchFile(path, callback);
  };
}

monitor([watch("lib"), watch("lib/plugins")], function() {
  exec("make");
  console.log("Updated vertebrae.js");
});
