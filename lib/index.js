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
// Store default options
var defaults;
// Cache internally all future defined routes
var _routes = {};

ROUTING: {
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
}

JQUERY: {
{{"lib/plugins/jquery"|include}}
}

BACKBONE: {
  if (Backbone) {

    LOCAL_STORAGE: {
      (function(window) {
        with (self.vendor) {
          {{"vendor/backbone.localStorage"|include}}
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
