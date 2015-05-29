// js/Views/WidgetsBatchUpdate.js

define(function (require, exports, module) {
  
  var
    View                          = require('js/Views/WidgetUpdate'),
    Config                        = require('js/Config'),
    _                             = require('underscore')
  ;

  var status = Config.status;

  module.exports = View.extend({

    initialize : function () {
      View.prototype.initialize.apply(this, arguments);
      this._updates = {};
    },

    attachEvents : function () {
      this.listenTo(wgts.events, 'widget:updated', this.updated);
    },

    update : function () {
      if (this._status !== status.end) return this.defaultMode();
      if (!wgts.widgets.length) return this.defaultMode();
      this.fixButtonSize();
      this._status = status.progress;
      this.$button.empty().append(this.$spinner);
      this._updates = {};

      // Remember all widgets that will be sent to update
      wgts.widgets.each(function (widget) {
        this._updates[widget.id] = false;
      }, this);

      wgts.config.batchUpdate = true;

      // Send all widgets to update
      wgts.events.trigger('widgets:update');
    },

    defaultMode : function () {
      this.$button.removeClass('ui-state-active').addClass('ui-state-default');
    },

    updated : function (widget, updated) {
      var all;
      if (this._status !== status.progress) return;
      this._updates[widget.id] = true;
      all = _(this._updates).every(function (value) { return value; });
      if (all) {
        this.$button.empty().append(this.$text);
        this.defaultMode();
        this._status = status.end;
        Notifications.render();
        wgts.config.batchUpdate = false;
      }
    }

  });

});