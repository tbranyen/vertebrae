// Set up mock api routes
$.mock({

  '/basic': {
    GET: function() {
      return 'Hello World';
    }
  },

  '/timeout': {
    timeout: 1000,
    GET: function() {
      return 'Hello World, Later';
    }
  },

  '/intentional': {
    GET: function() {
      this.status = 404;
      return 'Hello World, Later';
    }
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
    ok((timeEnd-timeStart) >= 1000, 'timed out for 1000ms');
    start();
  }).error(function(error) {
    ok(false, 'Should not error here');
    start();
  });
});

asyncTest('404 timeout', function() {
  var timeStart = +new Date;
  $.get('/failtime', function(data) {
    ok(false, 'Should not succeed here');
    start();
  }).error(function(error) {
    var timeEnd = +new Date;
    ok((timeEnd-timeStart) >= 100, 'timed out for 100ms');
    start();
  });
});

asyncTest('intentional 404', function() {
  $.get('/intentional', function(data) {
    ok(false, 'Should not succeed here');
    start();
  }).error(function() {
    ok(true, 'Should succeed here');
    start();
  });
});
