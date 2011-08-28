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

jQuery.mock.delay = {
  '404': 100
};

// Testing out an ajax transport
$.ajaxTransport('+*', function(options, originalOptions, jqXHR) {
  var timeout;

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
        timeout = window.setTimeout(function() {
          completeCallback(404, 'error');
        }, jQuery.mock.delay['404']);

        // Ensure the success is not run
        return;
      }

      // Simulate a longer request
      timeout = window.setTimeout(function() {
        var data = typeof route.data === 'function'
          ? route.data.apply(this, captures.slice(1)) : route.data;

        completeCallback(200, 'success', { responseText: data });
      }, route.timeout);
    },

    abort: function() {
      window.clearTimeout(timeout);
    }
  };
});
