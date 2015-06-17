// js/Collections/widgets.js

define(function (reqiure, exports, module) {

  var
    Backbone                      = require('backbone'),
    Model                         = require('js/Models/Widget')
  ;
  
  module.exports = Backbone.Collection.extend({

    model : Model,

    initialize : function () {
      this.listenTo(wgts.events, 'widgets:update', this.updateWidgets);
    },

    updateWidgets : function (widget) {
      var widgets, action;
      widgets = [];

      this.each(function (widget) {
       if (widget.isChanged()) widgets.push(widget.toJSON());
      });

      function then (string) {
        this.parseWidgets(string);
        wgts.events.trigger('widgets:updated', widget);
      }

      $.post(wgts.config.ajaxUrl + 'Update/', {
        owner : wgts.config.owner,
        ownerType : wgts.config.ownerType,
        widgets : JSON.stringify(widgets)
      }, _.bind(then, this));
    },

    parseWidgets : function (string) {
      var json, widget;
      json = JSON.parse(string);
      _(json).each(function (item) {
        widget = this.get(item.id);
        if (widget) widget.parseWidget(JSON.stringify(item));
      }, this);
    }

  });

});