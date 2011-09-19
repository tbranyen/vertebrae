/* vertebrae.js {{VERSION}}
 *
 * jQuery Plugin to mock AJAX requests for Backbone applications.
 * Tim Branyen @tbranyen, Copyright {{YEAR}}
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date Built: {{DATE}}
 */
(function(global) {

// Internal state
var self = { vendor: {} };
// Cache internally all future defined routes
var _routes = {};

// Routing
(function() {
  {{"vendor/ba-routematcher"|include}}

  var routeMatcher = this.routeMatcher;
  
  // Provide adapter for routeMatcher
  // @route is the template
  // @url is URL to be tested
  self.testRoute = function(route, url) {
    return routeMatcher(route).match(url);
  };
}).call(self.vendor);

// Load default plugins
(function() {
  if (typeof jQuery !== "undefined") {
    {{"lib/plugins/jquery"|include}}
  }
  {{"lib/plugins/localStorage"|include}}
}).call(self);

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
