// js/Models/WidgetBreakpoint.js

define(function (require, exports, module) {
  var
    Backbone                      = require('backbone')
  ;

  module.exports = Backbone.Model.extend({

    defaults : {
      media : null, // integer. E.g. 800,
      span : [ // A fraction. 
        1, // numerator
        1  // denominator
      ],
      clear : 'none' // css clear property. Allowed: none, both, right, left.
    }

  });

});