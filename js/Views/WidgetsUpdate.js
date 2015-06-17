// js/Views/WidgetsBatchUpdate.js

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    Config                        = require('js/Config'),
    _                             = require('underscore')
  ;

  var status = Config.status;

  module.exports = Backbone.View.extend({

    events : {
      'click button' : 'update'
    },

    initialize : function () {
      this.$button = this.$('button');
      this.$spinner = $('<i class="fa fa-lg fa-spin fa-spinner"></i>');
      this.$text = this.$('.ui-button-text');
      this._status = status.end;
      this._buttonSizeFixed = false;
      this.attachEvents();
      this._disabled = true;
      this.updateButtonStatus();
    },

    attachEvents : function () {
      this.listenTo(wgts.events, 'widgets:updated', this.updated);
      this.listenTo(wgts.widgets, 'change', this.updateButtonStatus);
    },

    update : function (ev) {
      ev.preventDefault();
      if (this._disabled) return;
      this.fixButtonSize();
      wgts.events.trigger('widgets:update');
      this.startSpinning();
    },

    defaultMode : function () {
      this.$button.removeClass('ui-state-active').addClass('ui-state-default');
    },

    updated : function (widget, updated) {
      this.stopSpinning();
      this.defaultMode();
      this.updateButtonStatus();
      this._status = status.end;
    },

    fixButtonSize : function () {
      if (this._buttonSizeFixed) return;
      this.$button.css('width', this.$el.width() + 'px');
      this._buttonSizeFixed = true;
    },

    startSpinning : function () {
      this.$button.empty().append(this.$spinner);
    },

    stopSpinning : function () {
      this.$button.empty().append(this.$text);
      this.updateButtonStatus();
    },

    updateButtonStatus : function () {
      var changed;
      changed = wgts.widgets.some(function (widget) {
        return widget.isChanged();
      });
      if (changed) this.enableButton();
      else this.disableButton();
    },

    enableButton : function () {
      this.$button.removeClass('ui-state-disabled');
      this._disabled = false;
    },

    disableButton : function () {
      this.$button.addClass('ui-state-disabled');
      this._disabled = true;
    }
  });

});