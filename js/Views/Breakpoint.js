// js/Views/WidgetBreakpoint.js

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    html                          = require('text!js/Templates/Breakpoint.html'),
    _                             = require('underscore')
  ;

  module.exports = Backbone.View.extend({

    events : {
      'click .remove' : 'fadeRemove',
      'keyup .breakpointMedia' : 'updateMedia',
      'keyup .breakpointSpanNumerator' : 'updateSpanNumerator',
      'keyup .breakpointSpanDenominator' : 'updateSpanDenominator',
      'change .breakpointClear' : 'updateClear'
    },

    attributes : {
      'role' : 'row'
    },

    tagName : 'tr',

    template : _.template(html),

    updateMedia : function (ev) {
      this.model.set('media', $(ev.target).val());
    },

    updateSpanNumerator : function (ev) {
      var numerator;
      numerator = parseInt($(ev.target).val(), 10);
      this.model.set('span', [numerator, this.model.get('span')[1]]);
    },

    updateSpanDenominator : function (ev) {
      var denominator;
      denominator = parseInt($(ev.target).val(), 10);
      this.model.set('span', [this.model.get('span')[0], denominator]);
    },

    updateClear : function (ev) {
      this.model.set('clear', $(ev.target).val());
    },

    fadeRemove : function (ev) {
      ev.preventDefault();

      function then () {
        wgts.events.trigger('remove:breakpoint', this);
        this.remove();
      }

      this.$el.fadeOut(200, _.bind(then, this));
    },

    render : function () {
      this.$el.empty().append(this.template(this.model.toJSONWithClears()));
      return this;
    }

  });

});