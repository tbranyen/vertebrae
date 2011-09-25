(function(global) {

var defaults;

// Third-party hard dependencies
var jQuery = global.jQuery;

// Cache internally all future defined routes
var _routes = {};

// Assign directly onto jQuery to be indicative this is indeed
// a plugin and requires jQuery to use.
jQuery.vertebrae = function(routes) {
  // Convert all URLs passed to regex and assign defaults if they
  // are not provided.
  jQuery.each(routes, function(key, val) {
    _routes[key] = val;
  });
};

// Plugin defaults, can be overwritten
defaults = jQuery.vertebrae.options = {
  // @route is the template
  // @url is URL to be tested
  testRoute: function(route, url) {
    return route === url;
  },
  delay: {
    // Set 404 timeout to simulate real-world delay
    '404': 100
  },
  // Allow AJAX requests to pass through
  passthrough: true
};

// Adding transports in jQuery will push them to the end of the stack for
// filtering.  Without the + preceding the wildcard *, most requests would
// still be handled by jQuery's internal transports.  With the +, this
// catch-all transport is bumped to the front and hijacks *ALL* requests.
jQuery.ajaxTransport('+*', function(options, originalOptions, jqXHR) {
  var data;
  var timeout, captures, match, route;
  var method = options.type.toUpperCase();

  // Detect method to check if a route is found match will either be
  // undefined (falsy) or true (truthy).
  jQuery.each(_routes, function(key, val) {
    captures = defaults.testRoute(key, options.url);
    route = _routes[key];
    
    // Capture has been found, ensure the requested type has a handler
    if (captures && route[method]) {
      match = true;

      // Break the jQuery.each loop
      return false;
    }
  });

  // If no matches were found, instead of triggering a fake 404, attempt
  // to use real AJAX
  if (!match && defaults.passthrough) {
    return null;
  }

  // Per the documentation a transport should return an object
  // with two keys: send and abort.
  //
  // send: Passes the currently requested route through the routes
  // object and attempts to find a match.  
  return {
    send: function(headers, completeCallback) {
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
      }, route.timeout || 0);
    },

    // This method will cancel any pending "request", by clearing the timeout
    // that is responsible for triggering the success callback.
    abort: function() {
      window.clearTimeout(timeout);
    }
  };
});

})(this);
