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
    },

    update : function (ev) {
      ev.preventDefault();
      if (this._status !== status.end) return;
      this.fixButtonSize();
      this._status = status.progress;
      this.$button.empty().append(this.$spinner);
      this.triggerUpdate();
    },

    clickEvent : function () {
      this.$button.trigger('click');
    },

    triggerUpdate : function () {
      wgts.events.trigger('widget:update', this.model);
    },

    addNotification : function (widgetId) {
      var notification, time;
      time = Math.floor(new Date().getTime() / 1000);
      Notifications.add({
        addClass: "runtime",
        created: time,
        expires: time + 10,
        flagNames: "message",
        flags: 64,
        from: "Widgets",
        href: "",
        html: "",
        ghostShown: true,
        icon: "check-square-o",
        id: _.uniqueId('WidgetNotifications_'),
        modified: time,
        progress: 0,
        qty: 1,
        runtime: true,
        title: "Widget Updated. Id: " + widgetId,
        when: "now"
      });
    },

    notify : function (model, updated) {
      if (model.id !== this.model.id) return;
      if (!updated) return;
      this.addNotification(this.model.id);
      if (!wgts.config.batchUpdate) Notifications.render();
    },

    updated : function (model, updated) {
      if (this.model.id !== model.id) return;
      if (this._status !== status.progress) return;
      if (!updated) {
        return setTimeout(_.bind(function () {
          this.updated(model, true);
        }, this), 200);
      }
      this.$button.empty().append(this.$text);
      this.$button.removeClass('ui-state-active').addClass('ui-state-default');
      this._status = status.end;
    }
    
  });

});