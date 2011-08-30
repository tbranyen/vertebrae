// Set up mock api routes
$.mock({
  '/route/:id': {
    timeout: 0,
    data: function(id) {
      console.log('test', id);
      if (+id === 4) {
        return '{ "id": 4, "test": "My Four" }';
      }

      return '{ "id": 0, "test": "None" }';
    }
  },

  '/route/post': {
    method: 'post',
    data: 'lol'
  }
});

module('routes');

asyncTest('matched id', function() {
  $.getJSON('/route/4', function(data) {
    equals(data.id, 4);
    equals(data.test, 'My Four')
    start();
  }).error(function() {
    ok(false, 'Should not error here');
    start();
  });
});

//asyncTest('invalid id', function() {
//  $.getJSON('/route/5', function(data) {
//    equals(data.id, 0);
//    equals(data.test, 'None')
//    start();
//  }).error(function() {
//    ok(false, 'Should not error here');
//    start();
//  });
//});

asyncTest('post request', function() {
  $.ajax({
    url: '/route/post',
    type: 'post',
    success: function() {
      ok(true, 'Valid 200 request');
      start();
    },
    error: function() {
      ok(false, 'Should not error here');
      start();
    }
  });
});
