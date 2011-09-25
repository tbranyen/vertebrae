/* vertebrae.js 0.0.0
 *
 * jQuery Plugin to mock AJAX requests for Backbone applications.
 * Tim Branyen @tbranyen, Copyright 2011
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date Built: Sun, 25 Sep 2011 21:25:50 GMT
 */
(function(global) {

// Internal state
var self = { vendor: {} };
// Cache internally all future defined routes
var _routes = {};
// Shorten Backbone regexp reference
var routeToRegExp = Backbone.Router.prototype._routeToRegExp;

// Load plugins
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

  }

  // Vendor stuff
  (function(_, Backbone) {
  // A simple module to replace `Backbone.sync` with *localStorage*-based
  // persistence. Models are given GUIDS, and saved into a JSON object. Simple
  // as that.
  // Generate four random hex digits.


  function S4() {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  };

  // Generate a pseudo-GUID by concatenating random hexadecimal.


  function guid() {
      return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
  };

  Backbone.Storage = function (name,type) {
      type = type || "local";
      this.name = name;
      this.type = type + "Storage";
      var store = window[this.type].getItem(this.name);
      this.records = (store && store.split(",")) || [];
  }

  _.extend(Backbone.Storage.prototype, {

      // Save the current state of the **Store** to *localStorage*.
      save: function() {
          window[this.type].setItem(this.name, this.records.join(","));
      },

      // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
      // have an id of it's own.
      create: function(model) {
          if (!model.id) model.id = model.attributes.id = guid();
          window[this.type].setItem(this.name + "-" + model.id, JSON.stringify(model));
          this.records.push(model.id.toString());
          this.save();
          return model;
      },

      // Update a model by replacing its copy in `this.data`.
      update: function(model) {
          window[this.type].setItem(this.name + "-" + model.id, JSON.stringify(model));
          if (!_.include(this.records, model.id.toString())) this.records.push(model.id.toString());
          this.save();
          return model;
      },

      // Retrieve a model from `this.data` by id.
      find: function(model) {
          return JSON.parse(window[this.type].getItem(this.name + "-" + model.id));
      },

      // Return the array of all models currently in storage.
      findAll: function() {
          return _.map(this.records, function(id) {
              return JSON.parse(window[this.type].getItem(this.name + "-" + id))
          }, this);
      },

      // Delete a model from `this.data`, returning it.
      destroy: function(model) {
          window[this.type].removeItem(this.name + "-" + model.id);
          this.records = _.reject(this.records, function(record_id) {
              return record_id == model.id.toString();
          });
          this.save();
          return model;
      }


  });

  var normalSync = Backbone.sync;

  // Override `Backbone.sync` to use delegate to the model or collection's
  // *localStorage* property, which should be an instance of `Store`.
  // If there is no storage found, use the normal Backbone.sync
  Backbone.sync = function(method, model, options, error) {

    // Backwards compatibility with Backbone <= 0.3.3
    if (typeof options == 'function') {
      options = {
        success: options,
        error: error
      };
    }

    var resp,
        store =  model.localStorage || model.sessionStorage;

      if (!store && model.collection) {
        store = model.collection.localStorage || model.collection.sessionStorage;
      }
      if (!store) {
        return normalSync.apply(this, _.toArray(arguments));
      }

      switch (method) {
      case "read":    resp = model.id ? store.find(model) : store.findAll(); break;
      case "create":  resp = store.create(model);                            break;
      case "update":  resp = store.update(model);                            break;
      case "delete":  resp = store.destroy(model);                           break;
      }

      if (resp) {
        options.success(resp);
      } else {
        options.error("Record not found");
      }
  };

})(_, Backbone);

}).call(global);

// Allow for Backbone augmentation
if (typeof Backbone !== "undefined") {

  // Main Backbone plugin function
  Backbone.Vertebrae = function(options) {
    var i, len, type;

    // Persistables
    if (this.persist && (len = this.persist.length)) {
      for (i = 0; i < len; i++) {
        this.persist[i].prototype.localStorage = new Backbone.Storage(this.profile || "");
      }
    }

    // Convert all URLs passed to regex and assign defaults if they
    // are not provided.
    _.each(this.routes, function(val, key) {
      _routes[key] = val;

      // Add in localStorage support
      if (type = val.model || val.collection) {
        type.prototype.localStorage = new Backbone.Storage(val.profile || "");
      }
    });

    if (typeof jQuery !== "undefined") {
      jQuery.vertebrae.options.testRoute = function(route, url) {
        return routeToRegExp(route).exec(url);
      };

      return jQuery.vertebrae(this.routes || {});
    }
  };

  // This extend method isn't publically available, so we'll just borrow it
  // from the Backbone.Model constructor.
  Backbone.Vertebrae.extend = Backbone.Model.extend;
}

})(this);
