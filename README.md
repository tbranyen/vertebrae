vertebrae
=========

> Backbone Persistence and jQuery AJAX Management Plugin

**v0.1.0-pre** [![Build
Status](https://travis-ci.org/tbranyen/vertebrae.png?branch=master)](https://travis-ci.org/tbranyen/vertebrae)

Maintained by Tim Branyen [@tbranyen](http://twitter.com/tbranyen) with help
from [awesome
contributors](https://github.com/tbranyen/vertebrae/contributors)!

When developing a client side application it is convenient to break out the
transports used to fulfill API requests.

What separates vertebrae.js from other similar scripts is that it uses the
exact same Backbone routing regular expressions so you can define routes the
way you already know how.  It also uses the official jQuery Transport API to
allow *identical* responses as if you made them live to the server with no
hacks.  You can use all the jQuery deferred goodness and always work with a
jqXHR object.

Lastly this tool was built to make your life easier.  I'm open to all
suggestions, so please send feedback! =)

## Getting started ##

Include into existing Backbone application:

``` html
<!-- Optional dependencies -->
<script src="jquery.js"></script>
<script src="underscore.js"></script>
<script src="backbone.js"></script>

<!-- Load the vertebrae plugin library -->
<script src="vertebrae.js"></script>
```

Compatibility: Everything Backbone and jQuery supports? Let me know if you find
issues.

## Defining routes ##

__With Backbone__

Routes are defined by passing an object literal to `Backbone.Vertebrae` after
including vertebrae.js.  Do not attempt to define before all dependencies are
loaded.

Backbone style paths are the keys in the mock object, any arguments you 
define there will automatically be provided in he callback verb handlers
described below.

You can bind to any HTTP verb, such as `GET/POST/PUT/DELETE` by simply using 
that identifier as a key and supplying an accompanying callback function.


``` javascript
// Declare example route based overrides
ExampleLayer = Backbone.Vertebrae.extend({
  routes: {
    '/valid.json': {
      GET: function() {
        return '{ "test": "None" }';
      }
    },

    '/param/:id': {
      POST: function(id) {
        return '{ "id": ' + id + ' }';
      }
    }
  }
});

// Initialize the layer
new ExampleLayer();

// Consume the layer with jQuery
$.get('/valid.json', function(data) { data.test == "None" });

```
Instead of having sets of routes and persistence rules defined on models and
collections which depend on a third-party plugin (backbone.localStorage.js),
Vertebrae has you define what should be persisted inside a RouteSet.  This
RouteSet is then initialized when you want to use those particular rules.
Defining and initializing rules this way allows you to toggle and conditionally
choose based on the environment, such as testing, production, bugs, etc.

__With jQuery__

One of the great features about vertebrae is that you can take it with you to
other non-Backbone related projects.  It bundles a fully functional standalone 
plugin for jQuery as well.

``` javascript
// Declare example route based overrides
jQuery.vertebrae({
  '/valid.json': {
    GET: function() {
      return '{ "test": "None" }';
    }
  },

  '/param/:id': {
    POST: function(id) {
      return '{ "id": ' + id + ' }';
    }
  }
});

// Consuming
$.getJSON('/valid.json', function(data) {
  console.log(data.test); // None
});
```

## Defining Backbone persistence ##

Vertebrae comes bundled with a modified version of Backbone.localStorage.  If
you define the models/collections you would like to persist in the `persist`
method they will automatically be configured to work in your application.

A profile is required as well if you would like to avoid conflicts in your
storage.  The profile name should be basically a slug for the constructor
function.

You will also notice that in order to use this feature of the add-on all
Models/Collections must already be loaded on the page.  Just ensure to
load this code before you initialize any models that require persistence,
yet after they are all declared.

``` javascript
// Example model
MyModel = Backbone.Model.extend({
  defaults: {
    lol: "hi"
  }
});

// Declare example route based overrides
ExampleLayer = Backbone.Vertebrae.extend({
  profile: "example-layer",
  persist: [ MyModel ]
});

// Initialize the layer
new ExampleLayer();

// Consume the persistence layer
var myModel = new MyModel();

// First save the model to the localStorage persistence
myModel.save({ lol: "duh" }, {
  success: function() {
    // Clear it so you know we aren't cheating
    myModel.clear();
    // Then fetch it back out of the storage mechanism
    myModel.fetch({
      success: function() {
        // Test the lol attribute
        console.log(myModel.get('lol')); // duh
      }
    });
  }
});
```

## Late binding persistence ##

In the case that you do not have your models loaded *before* you call Backbone,
you can use functions to return your Models/Collections to persist.  For
instance, you can load the simulation script before declaring your structures
as this example illustrates:

What would have happened if you did not use a function, is that MyModel would
be considered undefined and potentially throw an undeclared error.

``` javascript
// Declare example route based overrides
ExampleLayer = Backbone.Vertebrae.extend({
  profile: "example-layer",
  persist: function() {
    return [ MyModel ];
  }
});

// Example model
MyModel = Backbone.Model.extend({
  defaults: {
    lol: "hi"
  }
});

// Initialize the layer
new ExampleLayer();

// ... The rest is the same as the example above.
```
