/*!
 * vertebrae.js v0.1.0-pre
 * Copyright 2013, Tim Branyen (@tbranyen)
 * vertebrae.js may be freely distributed under the MIT license.
 */
(function(window) { 
"use strict";

// Normalize the `define` and `require` calls.
var require = window.require || function() {};
// Call the exports function or the crafted one with the Node.js `require`.
var define = window.define || function(cb) { cb.call(this, require); };

// Define the module contents.
define(function(require) {

// Localize global dependency references.
var Backbone = require("backbone") || window.Backbone;
var _ = require("underscore") || window._;
var $ = require("jquery") || Backbone.$;

// Cache internally all future defined routes.
var _routes = {};

// Shorten Backbone regexp reference
var routeToRegExp = Backbone.Router.prototype._routeToRegExp;

// Assign directly onto jQuery to be indicative this is indeed a plugin and
// requires jQuery to use.
$.vertebrae = function(routes) {
  // Convert all URLs passed to regex and assign defaults if they are not
  // provided.
  $.each(routes, function(key, val) {
    _routes[key] = val;
  });
};

// Plugin defaults, can be overwritten.
var defaults = $.vertebrae.options = {
  // @route is the template, @url is URL to be tested.
  testRoute: function(route, url) {
    return route === url;
  },
  delay: {
    // Set 404 timeout to simulate real-world delay.
    "404": 100
  },
  // Allow AJAX requests to pass through.
  passthrough: true
};

// Adding transports in jQuery will push them to the end of the stack for
// filtering.  Without the + preceding the wildcard *, most requests would
// still be handled by jQuery's internal transports.  With the +, this
// catch-all transport is bumped to the front and hijacks *ALL* requests.
$.ajaxTransport("+*", function(options, originalOptions, jqXHR) {
  var data;
  var timeout, captures, match, route;
  var method = options.type.toUpperCase();

  // Detect method to check if a route is found match will either be
  // undefined (falsy) or true (truthy).
  $.each(_routes, function(key, val) {
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
      var context;

      // If no matches, trigger 404 with delay
      if (!match) {
        // Return to ensure that the successful handler is never run
        return timeout = window.setTimeout(function() {
          completeCallback(404, "error");
        }, defaults.delay["404"]);
      }

      // Ensure captures is an array and not null
      captures = captures || [];

      // Set the context to contain references to the Vetebrae instance and the
      // jqXHR object.
      context = {
        jqXHR: jqXHR,
        params: options.data,
        instance: route.__instance__
      };

      // Slice off the path from captures, only want to send the
      // arguments.  Capture the return value.
      data = route[method].apply(context,
        [options.url].concat(captures.slice(1)));

      // A timeout is useful for testing behavior that may require an abort
      // or simulating how slow requests will show up to an end user.
      timeout = window.setTimeout(function() {
        completeCallback(jqXHR.status || 200, "success", {
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

// This acts like a custom constructor.
function Vertebrae(options) {
  var i, type;

  // If persist is a function, call it.
  if (typeof this.persist == "function") {
    this.persist = this.persist();
  }

  var profile = this.profile || "";
  var len = this.persist && this.persist.length;

  // Persistables.
  for (i = 0; i < len; i++) {
    this.persist[i].prototype.localStorage = new Backbone.Storage(profile);
  }

  // Convert all URLs passed to regex and assign defaults if they
  // are not provided.
  _.each(this.routes, function(val, key) {
    _routes[key] = val;

    // Add reference to this instance.
    _routes[key].__instance__ = this;

    // Add in localStorage support
    if (type = val.model || val.collection) {
      type.prototype.localStorage = new Backbone.Storage(val.profile || "");
    }
  }, this);

  if (_.isFunction(this.initialize)) {
    this.initialize();
  }

  $.vertebrae.options.testRoute = function(route, url) {
    return routeToRegExp(route).exec(url);
  };

  return $.vertebrae(this.routes || {});
}

// This extend method isn't publically available, so we'll just borrow it
// from the Backbone.Model constructor.
Vertebrae.extend = Backbone.Model.extend;

// Main Backbone plugin function
Backbone.Vertebrae = Vertebrae;

// Assign `Vertebrae` object for AMD loaders.
return Vertebrae;

});

})(typeof global === "object" ? global : this);
