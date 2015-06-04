// js/Collections/widgets.js

define(function (reqiure, exports, module) {

  var
    Backbone                      = require('backbone'),
    Model                         = require('js/Models/Widget')
  ;
  
  module.exports = Backbone.Collection.extend({

    model : Model,

    initialize : function () {
      this.listenTo(wgts.events, 'widget:update', this.updateIfChanged);
    },

    updateIfChanged : function (widget) {
      var widgetJSON;
      widgetJSON = widget.toJSON();

      if (!widget.isChanged()) return wgts.events.trigger('widget:updated', widget, false);

      function then (string) {
        widget.parseWidget(string);
        wgts.events.trigger('widget:updated', widget, true);
      }

      $.post(wgts.config.ajaxUrl + 'Update/', {
        widget : JSON.stringify(widgetJSON)
      }, _.bind(then, this));
    }

  });

});