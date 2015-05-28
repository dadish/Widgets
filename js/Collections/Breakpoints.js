// js/collections/Breakpoints.js

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    Model                         = require('js/Models/Breakpoint')
  ;

  module.exports = Backbone.Collection.extend({

    model : Model
    
  });

});