// js/Views/WidgetBreakpoint.js

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    html                          = require('text!js/Templates/Breakpoint.html'),
    CustomCssEditor               = require('js/Views/CustomCssEditor'),
    _                             = require('underscore')
  ;

  module.exports = Backbone.View.extend({

    events : {
      'click .remove' : 'fadeRemove',
      'keyup .breakpointMediaMin' : 'updateMediaMin',
      'keyup .breakpointMediaMax' : 'updateMediaMax',
      'keyup .breakpointSpanNumerator' : 'updateSpanNumerator',
      'keyup .breakpointSpanDenominator' : 'updateSpanDenominator',
      'click .customCss' : 'handleCssEditor',
      'change .breakpointClear' : 'updateClear'
    },

    attributes : {
      'role' : 'row'
    },

    tagName : 'tr',

    template : _.template(html),

    initialize : function (options) {
      
      this._customCss = null;

    },

    updateMediaMin : function (ev) {
      var min;
      min = parseInt($(ev.target).val(), 10);
      this.model.set('media', [min, this.model.get('media')[1]]);
    },

    updateMediaMax : function (ev) {
      var max;
      max = parseInt($(ev.target).val(), 10);
      this.model.set('media', [this.model.get('media')[0], max]);
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
      wgts.events.trigger('remove:breakpoint', this);
    },

    remove : function () {
      function then () {
        Backbone.View.prototype.remove.apply(this);
      }
      this.$el.fadeOut(200, _.bind(then, this));
    },

    handleCssEditor : function (ev) {
      var target;
      target = $(ev.target);
      ev.preventDefault();
      if (!target.is('.customCss')) return;
      if (this._customCss === null) this.launchCustomCssEditor();
      else this.closeCustomCssEditor();
    },

    launchCustomCssEditor : function () {
      var target;
      target = this.$('.customCss');
      target.text(target.attr('data-text-close'));
      this._customCss = new CustomCssEditor({model : this.model});
      this._customCss.$el.insertAfter(this.$('.customCss'));
      this._customCss.show();
    },

    closeCustomCssEditor : function () {
      var target;
      target = this.$('.customCss');
      target.text(target.attr('data-text-open'));
      this._customCss.hide(_.bind(this._customCss.remove, this._customCss));
      this._customCss = null;
    },

    render : function () {
      this.$el.empty().append(this.template(this.model.toJSONWithClears()));
      return this;
    }

  });

});