// js/collections/Breakpoints.js

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    Model                         = require('js/Models/Breakpoint'),
    _                             = require('underscore')
  ;

  module.exports = Backbone.Collection.extend({

    model : Model,

    parseData : function (data) {
      var breakpoint;
      _(data).each(function (item) {
        breakpoint = this.get(item.id);
        
        if (breakpoint instanceof Model && breakpoint.id == item.id) {
          return breakpoint.parseData(item);
        } else {
          breakpoint = new Model();
          breakpoint.parseData(item);
          this.add(breakpoint);          
        }
      }, this);
    }
    
  });

});