// js/Models/Widget.js

define(function (require, exports, module) {
  var
    Backbone                      = require('backbone'),
    Breakpoints                   = require('js/Collections/Breakpoints'),
    _                             = require('underscore')
  ;

  module.exports = Backbone.Model.extend({

    initialize : function (options) {
      this.set('breakpoints', new Breakpoints());
      this._lastString = JSON.stringify(this.toJSON());
      this.listenTo(this.get('breakpoints'), 'change', this.triggerChange);
    },

    triggerChange : function () {
      this.trigger('change change:breakpoints', this);
    },

    defaults : {
      owner : null,
      ownerType : null,
      parent : 1,
      className : 'Widget',
      breakpoints : null, // A collection of Breakpoint models
      sort : null
    },

    parseWidget : function (string) {
      var data;
      data = JSON.parse(string);
      this.set('id', data.id);
      this.set('owner', data.owner);
      this.set('ownerType', data.ownerType);
      this.set('parent', data.parent);
      this.set('sort', data.sort);
      this.get('breakpoints').parseData(data.breakpoints);
              
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
    },

    children : function () {
      return wgts.widgets.filter(function (item) {
        return item.get('parent') === this.get('id');
      }, this);
    }

  });
});