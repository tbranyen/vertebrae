var _routes = {};
jQuery.mock = function(routes) {
  // Shorten reference
  var routeToRegExp = Backbone.Router.prototype._routeToRegExp;

  // Convert all URLs passed to regex
  _.each(routes, function(val, key) {
    var route = _routes[key] = val;

    // Set defaults
    route.regex = routeToRegExp(key);
    route.timeout = route.timeout || 0;
    route.textStatus = route.textStatus || 'success';
    route.data = route.data || {};
  });
};

// Testing out an ajax transport
$.ajaxTransport('+*', function(options, originalOptions, jqXHR) {
  return {
    send: function(headers, completeCallback) {

      // Look for captures
      var captures, route;

      // If match is found bail
      _.each(_routes, function(opts, url) {
        captures = opts.regex.exec(options.url);

        // Capture has been found, bail out
        if (captures) {
          route = _routes[url];

          return false;
        }
      });

      // If no matches, run regular AJAX
      if (!route) {
        completeCallback(404, 'error');
      }

      // Simulate a longer request
      window.setTimeout(function() {
        completeCallback(200, 'success', { responseText: route.data });
      }, route.timeout);
    },
    abort: function() {
      /* abort code */
    }
  };
});
