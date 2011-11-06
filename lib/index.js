/* vertebrae.js {(VERSION)}
 *
 * jQuery Plugin to mock AJAX requests for Backbone applications.
 * Tim Branyen @tbranyen, Copyright {(YEAR)}
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date Built: {(DATE)}
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
    {("lib/plugins/jquery"|include)}
  }

  // Vendor stuff
  {("vendor/backbone.localStorage"|include)}
}).call(global);

// Allow for Backbone augmentation
if (typeof Backbone !== "undefined") {

  // Main Backbone plugin function
  Backbone.Vertebrae = function(options) {
    var i, len, type;

    // If persist is a function, call it
    if (typeof this.persist == "function") {
      this.persist = this.persist();
    }

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
