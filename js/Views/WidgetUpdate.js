// js/Views/WidgetUpdate.js

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
      this.updateButtonStatus();
    },

    fixButtonSize : function () {
      if (this._buttonSizeFixed) return;
      this.$button.css('width', this.$el.width() + 'px');
      this._buttonSizeFixed = true;
    },

    attachEvents : function () {
      this.listenTo(wgts.events, 'widgets:update', this.clickEvent);
      this.listenTo(wgts.events, 'widget:updated', this.updated);
      this.listenTo(wgts.events, 'widget:updated', this.notify);
      this.listenTo(this.model, 'change', this.updateButtonStatus);
    },

    update : function (ev) {
      if (this._disabled) return;
      ev.preventDefault();
      if (this._status !== status.end) return;
      this.fixButtonSize();
      this._status = status.progress;
      this.startSpinning();
      this.triggerUpdate();
    },

    clickEvent : function () {
      this.$button.trigger('click');
    },

    triggerUpdate : function () {
      wgts.events.trigger('widget:update', this.model);
    },

    notify : function (model, updated) {
      if (model.id !== this.model.id) return;
      if (!updated) return;
    },

    updated : function (model, updated) {
      if (this.model.id !== model.id) return;
      if (this._status !== status.progress) return;
      if (!updated) {
        return setTimeout(_.bind(function () {
          this.updated(model, true);
        }, this), 200);
      }
      this.stopSpinning();
      this.$button.removeClass('ui-state-active').addClass('ui-state-default');
      this._status = status.end;
    },

    startSpinning : function () {
      this.$button.empty().append(this.$spinner);
    },

    stopSpinning : function () {
      this.$button.empty().append(this.$text);
      this.updateButtonStatus();
    },

    enableButton : function () {
      this.$button.removeClass('ui-state-disabled');
      this._disabled = false;
    },

    disableButton : function () {
      this.$button.addClass('ui-state-disabled');
      this._disabled = true;
    },

    updateButtonStatus : function () {
      var changed;
      changed = this.model.isChanged();
      if (changed) this.enableButton();
      else this.disableButton();
      wgts.events.trigger('widgets:change', changed);
    }
    
  });

});