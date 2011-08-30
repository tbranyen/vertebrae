var _routes = {};

jQuery.mock = function(routes) {
  // Shorten reference
  var routeToRegExp = Backbone.Router.prototype._routeToRegExp;

  // Convert all URLs passed to regex
  _.each(routes, function(val, key) {
    var route = _routes[key] = val;

    // Set defaults
    route.regex = routeToRegExp(key);
    route.method = (route.method || 'get').toLowerCase();
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
      _.detect(_routes, function(opts, url) {
        captures = opts.regex.exec(options.url);

        // Capture has been found, ensure its the correct type
        if (captures && _routes[url].method === options.type.toLowerCase()) {
          route = _routes[url];

          return true;
        }
      });

      // If no matches, trigger 404 with delay
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
          ? route.data.apply(null, captures && captures.slice(1)) : route.data;

        completeCallback(200, 'success', { responseText: data });
      }, route.timeout);
    },

    abort: function() {
      window.clearTimeout(timeout);
    }
  };
});
