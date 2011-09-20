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

function update() {
  exec("make");
  console.log("Updated vertebrae.js");
}

monitor([watch("lib"), watch("lib/plugins")], update);

update();
