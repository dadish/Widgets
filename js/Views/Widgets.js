// js/Views/Widgets.js

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    Widget                        = require('js/Views/Widget'),
    _                             = require('underscore')
  ;

  module.exports = Backbone.View.extend({

    events : {
      'click .InputfieldWidgetsAddLink' : 'addWidget'
    },

    initialize : function (options) {
      // The widgets
      this.$widgets = this.$('.Inputfields.InputfieldsWidgets');
      this._widgets = _(this.$widgets.children('.InputfieldWidget')).map(this.initializeWidget, this);
      this.attachEvents();
    },

    initializeWidget : function (el) {
      var widget;
      widget = new Widget({el : el});
      wgts.widgets.add(widget.model);
      return widget;
    },

    attachEvents : function () {
      this.listenTo(wgts.events, 'remove:widget', this.removeWidget);
    },

    addWidget : function (ev) {
      ev.preventDefault();

      function then (data) {
        $data = $(data);
        $data.css('display', 'none');
        this.$widgets.append($data);
        this._widgets.push(this.initializeWidget($data[0]));
        $data.slideDown();
      }

      $.get(wgts.config.ajaxUrl + 'Create/', {
        owner : wgts.config.owner,
        ownerType : wgts.config.ownerType
      }, _.bind(then, this));
    },

    removeWidget : function (widget) {
      var index, widget;
      index = _(this._widgets).findIndex(function (item) {
        return item.cid === widget.cid;
      });
      if (index === -1) return;
      this._widgets.splice(index, 1);
      wgts.widgets.remove(widget.model);
    }

  });

});