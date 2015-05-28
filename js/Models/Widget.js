// js/Models/Widget.js

define(function (require, exports, module) {
  var
    Backbone                      = require('backbone'),
    Breakpoints                   = require('js/Collections/Breakpoints'),
    _                             = require('underscore')
  ;

  module.exports = Backbone.Model.extend({

    initialize : function (options) {
      this.set('breakpoints', new Breakpoints([{media : 'default', span : [1,1], clear : 'none'}]));
      this._lastString = JSON.stringify(this.toJSON());
      this.listenTo(this.get('breakpoints'), 'change', this.triggerChange);
    },

    triggerChange : function () {
      this.trigger('change', this);
    },

    defaults : {
      owner : null,
      ownerType : null,
      parent : 1,
      className : 'Widget',
      options : {},
      breakpoints : null, // A collection of Breakpoint models
      breakpointsString : '',
      renderPages : []
    },

    parseWidget : function (string) {
      _(JSON.parse(string)).each(function (value, key) {
        if (key === 'breakpoints') this.get('breakpoints').reset(value);
        else this.set(key, value);
      }, this);
      this._lastString = JSON.stringify(this.toJSON());
    },

    isChanged : function () {
      return this._lastString !== JSON.stringify(this.toJSON());
    },

    toJSON : function () {
      var json;
      json = Backbone.Model.prototype.toJSON.apply(this, arguments);
      json.breakpoints = json.breakpoints.toJSON();
      return json;
    }

  });
});