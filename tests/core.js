// Set up mock api routes
$.mock({

  '/basic': {
    timeout: 0,
    data: 'Hello World'
  },

  '/timeout': {
    timeout: 1000,
    data: 'Hello World, Later'
  }

});

module('core');

asyncTest('basic', function() {
  $.get('/basic', function(data) {
    equals(data, 'Hello World');
    start();
  }).error(function() {
    ok(false, 'Should not error here');
    start();
  });
});

asyncTest('timeout', function() {
  var timeStart = +new Date;
  $.get('/timeout', function(data) {
    var timeEnd = +new Date;
    ok((timeEnd-timeStart) >= 1000, 'timed out for one second');
    start();
  }).error(function(error) {
    ok(false, 'Should not error here');
    start();
  });
});
