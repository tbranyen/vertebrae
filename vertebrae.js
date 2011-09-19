/* vertebrae.js 0.0.0
 *
 * jQuery Plugin to mock AJAX requests for Backbone applications.
 * Tim Branyen @tbranyen, Copyright 2011
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date Built: Mon, 19 Sep 2011 04:02:06 GMT
 */
(function(global) {

// Internal state
var self = { vendor: {} };
// Store default options
var defaults;
// Cache internally all future defined routes
var _routes = {};

ROUTING: {
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
}

JQUERY: {
(function() {
  var lol = { lol: "hi" };


  return lol;
});

}

BACKBONE: {
  if (Backbone) {

    LOCAL_STORAGE: {
      (function(window) {
        with (self.vendor) {
          /**
 * Backbone localStorage Adapter v1.0
 * https://github.com/jeromegn/Backbone.localStorage
 *
 * Date: Sun Aug 14 2011 09:53:55 -0400
 */

// A simple module to replace `Backbone.sync` with *localStorage*-based
// persistence. Models are given GUIDS, and saved into a JSON object. Simple
// as that.

// Generate four random hex digits.
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

// Our Store is represented by a single JS object in *localStorage*. Create it
// with a meaningful name, like the name you'd give a table.
window.Store = function(name) {
  this.name = name;
  var store = localStorage.getItem(this.name);
  this.records = (store && store.split(",")) || [];
};

_.extend(Store.prototype, {

  // Save the current state of the **Store** to *localStorage*.
  save: function() {
    localStorage.setItem(this.name, this.records.join(","));
  },

  // Add a model, giving it a (hopefully)-unique GUID, if it doesn't already
  // have an id of it's own.
  create: function(model) {
    if (!model.id) model.id = model.attributes.id = guid();
    localStorage.setItem(this.name+"-"+model.id, JSON.stringify(model));
    this.records.push(model.id.toString());
    this.save();
    return model;
  },

  // Update a model by replacing its copy in `this.data`.
  update: function(model) {
    localStorage.setItem(this.name+"-"+model.id, JSON.stringify(model));
    if (!_.include(this.records, model.id.toString())) this.records.push(model.id.toString()); this.save();
    return model;
  },

  // Retrieve a model from `this.data` by id.
  find: function(model) {
    return JSON.parse(localStorage.getItem(this.name+"-"+model.id));
  },

  // Return the array of all models currently in storage.
  findAll: function() {
    return _.map(this.records, function(id){return JSON.parse(localStorage.getItem(this.name+"-"+id));}, this);
  },

  // Delete a model from `this.data`, returning it.
  destroy: function(model) {
    localStorage.removeItem(this.name+"-"+model.id);
    this.records = _.reject(this.records, function(record_id){return record_id == model.id.toString();});
    this.save();
    return model;
  }

});

// Override `Backbone.sync` to use delegate to the model or collection's
// *localStorage* property, which should be an instance of `Store`.
Backbone.sync = function(method, model, options, error) {

  // Backwards compatibility with Backbone <= 0.3.3
  if (typeof options == 'function') {
    options = {
      success: options,
      error: error
    };
  }

  var resp;
  var store = model.localStorage || model.collection.localStorage;

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
        }
      })(self.vendor);
    }

    ROUTING: {
    // Shorten Backbone regexp reference
    var routeToRegExp = Backbone.Router.prototype._routeToRegExp;

    self.testRoute = function(route, url) {
      return routeToRegExp(route).exec(url);
    };
    }

    // Main Backbone plugin function
    Backbone.Vertebrae = function() {

    };

    // This extend method isn't publically available, so we'll just borrow it
    // from the Backbone.Model constructor.
    Backbone.Vertebrae.extend = Backbone.Model.extend;

    // Add the store method from localStorage plugin
    Backbone.Vertebrae.store = self.vendor.Store;
  }
}

})(this);
