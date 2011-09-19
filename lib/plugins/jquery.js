(function(global) {

var self = global.jquery = {};

// Plugin defaults, can be overwritten
self.defaults = {
  delay: {
    // Set 404 timeout to simulate real-world delay
    '404': 100
  }
};

// Adding transports in jQuery will push them to the end of the stack for
// filtering.  Without the + preceding the wildcard *, most requests would
// still be handled by jQuery's internal transports.  With the +, this
// catch-all transport is bumped to the front and hijacks *ALL* requests.
jQuery.ajaxTransport('+*', function(options, originalOptions, jqXHR) {
  var data;
  var timeout, captures, match, route;
  var method = options.type.toUpperCase();

  // Per the documentation a transport should return an object
  // with two keys: send and abort.
  //
  // send: Passes the currently requested route through the routes
  // object and attempts to find a match.  
  return {
    send: function(headers, completeCallback) {
      // Use the underscore detect method to check if a route is found
      // match will either be undefined (falsy) or true (truthy).
      match = _.detect(_routes, function(val, key) {
        captures = global.testRoute(key, options.url);
        route = _routes[key];

        // Capture has been found, ensure the requested type has a handler
        if (captures && route[method]) {
          return true;
        }
      });

      // If no matches, trigger 404 with delay
      if (!match) {
        // Return to ensure that the successful handler is never run
        return timeout = window.setTimeout(function() {
          completeCallback(404, 'error');
        }, defaults.delay['404']);
      }

      // Ensure captures is an array and not null
      captures = captures || [];

      // Slice off the path from captures, only want to send the
      // arguments.  Capture the return value.
      data = route[method].apply(jqXHR, captures.slice(1));

      // A timeout is useful for testing behavior that may require an abort
      // or simulating how slow requests will show up to an end user.
      timeout = window.setTimeout(function() {
        completeCallback(jqXHR.status || 200, 'success', {
          responseText: data
        });
      }, route.timeout);
    },

    // This method will cancel any pending "request", by clearing the timeout
    // that is responsible for triggering the success callback.
    abort: function() {
      window.clearTimeout(timeout);
    }
  };
});

})(this);
