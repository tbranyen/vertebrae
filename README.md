vertebrae.js: Backbone Persistence and jQuery AJAX Management Plugin
====================================================================

Introduction
------------

When developing a client side application it is very convenient to stub out
API calls to avoid being held up by server developments.

What separates vertebrae.js from other similar scripts is that it uses the 
exact same Backbone routing regular expressions so you can define routes the
way you already know how.  It also uses the official jQuery Transport API
to allow *identical* responses as if you made them live to the server.  No
hacks / no compromises.  You can use all the jQuery deferred goodness and 
always work with a jqXHR object.

Vetebrae functions completely with or without Backbone and with or without
jQuery.  If you drop vertebrae.js into a project without Backbone, but has
jQuery, you'll get full access to the jQuery plugin.  If you are in a
project that has Backbone, but not jQuery, it will still function, but by
overriding Backbone.sync.  Finally if you use Vertebrae without jQuery and
without Backbone, it will do absolutely nothing!

Vertebrae can be used entirely localStorage backed as well.  This makes it
function in essence, identical to `backbone.localStorage.js` of which, it
embeds.  The one crucial difference here is that, per-design, Vertebrae
does not require you to modify your existing models/collections to play
nicely.  You just configure everything inside of your Vertebrae
constructor and later on you could always delete the handlers and not have
to change your existing project.

Lastly this tool was built to make your life easier.  I'm open to all
suggestions, so please send feedback! =)

Getting started
---------------

Include into existing Backbone application

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

Defining routes
---------------

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

Since you are creating constructor functions that are later on called, much 
like Router, you are able to conditionally load a set.  This opens up the
possibility for many layers.


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
$.get('/valid.json', function(data) { data.test == "None" });
```

Defining Backbone persistence
-----------------------------

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
