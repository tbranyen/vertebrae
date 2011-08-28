vertebrae.js: Backbone mock AJAX jQuery plugin
==============================================

Getting started
---------------

Include: 

``` html
<script src="jquery.js"></script>
<script src="underscore.js"></script>
<script src="backbone.js"></script>
<script src="vertebrae.js"></script>
```

Compatibility: Presumably everything Backbone and jQuery supports, let me know if you find issues.

Defining routes
---------------

Routes are defined in the exact same syntax as Backbone routes.

``` javascript
// Set up mock api routes
$.mock({
  // Easiest way to define a path
  '/valid.json': {
    data: '{ "test": "None" }'
  },

  // Change data to a function and the arguments will be passed to it
  '/param/:id': {
    data: function(id) {
      return '{ "id": '+ id +' }';
    }
  }
});
```
