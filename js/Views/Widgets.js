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
      this._data = []
      this.$widgets = this.$('.Inputfields.InputfieldsWidgets');
    },

    addWidget : function (ev) {
      ev.preventDefault();

      function then (data) {
        $data = $(data);
        this.$widgets.append($data);
        this._data.push(new Widget({el : $data}));
      }

      $.get(wgts.config.ajaxUrl, {
        action : 'newWidget',
        cnt : this._data.length + 1,
        owner : wgts.config.owner,
        ownerType : wgts.config.ownerType
      }, _.bind(then, this));
    }

  });

});