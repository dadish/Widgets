// js/Views/WidgetBreakpoint.js

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    html                          = require('text!js/Templates/Breakpoint.html'),
    _                             = require('underscore')
  ;

  module.exports = Backbone.View.extend({

    events : {
      'click .remove' : 'fadeRemove'
    },

    attributes : {
      'role' : 'row'
    },

    tagName : 'tr',

    template : _.template(html),

    fadeRemove : function () {
      this.$el.fadeOut(200, _.bind(this.remove, this));
    },

    render : function () {
      this.$el.empty().append(this.template(this.model.toJSON()));
      return this;
    }

  });

});