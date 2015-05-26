// js/Collections/widgets.js

define(function (reqiure, exports, module) {

  var
    Backbone                      = require('backbone'),
    Model                         = require('js/Models/Widget')
  ;
  
  module.exports = Backbone.Collection.extend({

    model : Model

  });

});