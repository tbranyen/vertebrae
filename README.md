vertebrae.js: Backbone mock AJAX jQuery plugin
==============================================

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

Lastly this tool was built to make your life easier.  I'm open to all
suggestions, so please send feedback! =)

Getting started
---------------

Include into existing Backbone application

``` html
<script src="jquery.js"></script>
<script src="underscore.js"></script>
<script src="backbone.js"></script>
<script src="vertebrae.js"></script>
```

Compatibility: Everything Backbone and jQuery supports, let me know if you find
issues.

Defining routes
---------------

Routes are defined by passing an object literal to `$.mock` after including
vertebrae.js.  Do not attempt to define before all dependencies are loaded.

Backbone style paths are the keys in the mock object, any arguments you 
define there will automatically be provided in he callback verb handlers
described below.

You can bind to any HTTP verb, such as `GET/POST/PUT/DELETE` by simply using 
that identifier as a key and supplying an accompanying callback function.


``` javascript
$.mock({

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
```

Consuming routes
----------------


Mocking the lifecycle of a Model
--------------------------------


Integrating with collections
----------------------------
