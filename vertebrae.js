/* vertebrae.js 0.0.0
 *
 * jQuery Plugin to mock AJAX requests for Backbone applications.
 * Tim Branyen @tbranyen, Copyright 2011
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date Built: Tue, 20 Sep 2011 03:39:05 GMT
 */
(function(global) {

// Internal state
var self = { vendor: {} };
// Cache internally all future defined routes
var _routes = {};
// Shorten Backbone regexp reference
var routeToRegExp = Backbone.Router.prototype._routeToRegExp;

// Load default plugins
(function() {
  if (typeof jQuery !== "undefined") {
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

  }
}).call(global);

// Main Backbone plugin function
Backbone.Vertebrae = function() {
  if (typeof jQuery !== "undefined") {
    jQuery.vertebrae.options.testRoute = function(route, url) {
      return routeToRegExp(route).exec(url);
    };

    return jQuery.vertebrae(this.routes);
  }

  // Convert all URLs passed to regex and assign defaults if they
  // are not provided.
  _.each(this.routes, function(val, key) {
    _routes[key] = val;
  });
};

// This extend method isn't publically available, so we'll just borrow it
// from the Backbone.Model constructor.
Backbone.Vertebrae.extend = Backbone.Model.extend;

})(this);
