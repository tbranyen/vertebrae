/* vertebrae.js 0.0.0
 *
 * jQuery Plugin to mock AJAX requests for Backbone applications.
 * Tim Branyen @tbranyen, Copyright 2011
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date Built: Mon, 19 Sep 2011 05:19:50 GMT
 */
(function(global) {

// Internal state
var self = { vendor: {} };
// Store default options
var defaults;
// Cache internally all future defined routes
var _routes = {};

// Routing
(function() {
  /*!
 * JavaScript Basic Route Matcher - v0.1pre - 9/16/2011
 * http://benalman.com/
 *
 * Copyright (c) 2011 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

(function(global) {
  // Characters to be escaped with \. RegExp borrowed from the Backbone router
  // but escaped (note: unnecessarily) to keep JSHint from complaining.
  var reEscape = /[\-\[\]{}()+?.,\\\^$|#\s]/g;
  // Match named :param or *splat placeholders.
  var reParam = /([:*])(\w+)/g;

  global.routeMatcher = function(route, url) {
    // Object to be returned. The public API.
    var self = {};
    // Matched param or splat names, in order
    var names = [];
    // Route matching RegExp.
    var re = route;

    // Build route RegExp from passed string.
    if (typeof route === "string") {
      // Escape special chars.
      re = re.replace(reEscape, "\\$&");
      // Replace any :param or *splat with the appropriate capture group.
      re = re.replace(reParam, function(_, mode, name) {
        names.push(name);
        // :param should capture until the next / or EOL, while *splat should
        // capture until the next :param, *splat, or EOL.
        return mode === ":" ? "([^/]*)" : "(.*)";
      });
      // Add ^/$ anchors and create the actual RegExp.
      re = new RegExp("^" + re + "$");

      // Match the passed url against the route, returning an object of params
      // and values.
      self.match = function(url) {
        var i = 0;
        var params = {};
        var matches = url.match(re);
        // If no matches, return null.
        if (!matches) { return null; }
        // Add all matched :param / *splat values into the params object.
        while(i < names.length) {
          params[names[i++]] = matches[i];
        }
        return params;
      };

      // Build path by inserting the given params into the route.
      self.build = function(params) {
        var param, re;
        var result = route;
        // Insert each passed param into the route string.
        for (param in params) {
          re = new RegExp("[:*]" + param + "\\b");
          result = result.replace(re, params[param]);
        }
        // Missing params should be replaced with empty string.
        return result.replace(reParam, "");
      };
    } else {
      // RegExp route was passed. This is super-simple.
      self.match = function(url) {
        return url.match(re);
      };
    }
    // If a url was passed, return params or matches, otherwise return the
    // route-matching function.
    return url == null ? self : self.match(url);
  };

}(this.exports || this));


  var routeMatcher = this.routeMatcher;
  
  // Provide adapter for routeMatcher
  // @route is the template
  // @url is URL to be tested
  self.testRoute = function(route, url) {
    return routeMatcher(route).match(url);
  };
}).call(self.vendor);

// Bundle jQuery plugin
if (typeof jQuery !== "undefined") {
(function() {
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

}).call(self);
}

if (typeof Backbone !== "undefined") {
  // Shorten Backbone regexp reference
  var routeToRegExp = Backbone.Router.prototype._routeToRegExp;

  self.testRoute = function(route, url) {
    return routeToRegExp(route).exec(url);
  };

  // Main Backbone plugin function
  Backbone.Vertebrae = function() {
    // Convert all URLs passed to regex and assign defaults if they
    // are not provided.
    _.each(this.routes, function(val, key) {
      _routes[key] = val;
    });
  };

  // This extend method isn't publically available, so we'll just borrow it
  // from the Backbone.Model constructor.
  Backbone.Vertebrae.extend = Backbone.Model.extend;
  // Add the store method from localStorage plugin
  Backbone.Vertebrae.store = self.vendor.Store;
}

})(this);
