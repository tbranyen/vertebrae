/*!
 * backbone.datamanager.js v0.1.0
 * Copyright 2012, Tim Branyen (@tbranyen)
 * backbone.datamanager.js may be freely distributed under the MIT license.
 */
(function(Backbone, _, $) {

"use strict";

// Test for localStorage, I've been told an exception can be raised in some
// browsers, therefore... try/catch.
var hasLocalStorage = function() {
  try {
    window.localStorage.setItem("this", "works");
    window.localStorage.removeItem("this");

    return true;
  } catch (ex) {}

  return false;
}();

// Maintain a reference to the original Backbone.sync
var _sync = Backbone.sync;

// Override the backbone sync to provide local storage recording options
Backbone.sync = function(method, model, options) {
  
};

// Adding transports in jQuery will push them to the end of the stack for
// filtering.  Without the + preceding the wildcard *, most requests would
// still be handled by jQuery's internal transports.  With the +, this
// catch-all transport is bumped to the front and hijacks *ALL* requests.
jQuery.ajaxTransport('+*', function(options, originalOptions, jqXHR) {
  var data, timeout, captures, match, route;
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

var DataManager = function(options) {
  // Support no options being passed... (why??)
  options = options || {};

  // Record all traffic
  if (options.record) {
    
  }
};

//var DataManager = function(options) {
//  var i, len, type;
//
//  // If persist is a function, call it
//  if (_.isFunction(this.persist)) {
//    this.persist = this.persist();
//  }
//
//  // Persistables
//  if (this.persist && (len = this.persist.length)) {
//    for (i = 0; i < len; i++) {
//      this.persist[i].prototype.localStorage = new Backbone.Storage(this.profile || "");
//    }
//  }
//
//  // Convert all URLs passed to regex and assign defaults if they
//  // are not provided.
//  _.each(this.routes, function(val, key) {
//    _routes[key] = val;
//
//    // Add in localStorage support
//    if (type = val.model || val.collection) {
//      type.prototype.localStorage = new Backbone.Storage(val.profile || "");
//    }
//  });
//
//  if (typeof jQuery !== "undefined") {
//    jQuery.vertebrae.options.testRoute = function(route, url) {
//      return routeToRegExp(route).exec(url);
//    };
//
//    return jQuery.vertebrae(this.routes || {});
//  }
//};

// Attach to Backbone
Backbone.DataManager = _.extend(DataManager, {
  // This extend method isn't publically available, so we'll just borrow it
  // from the Backbone.Model constructor.
  extend: Backbone.Model.extend
});

})(this.Backbone, this._, this.jQuery);
