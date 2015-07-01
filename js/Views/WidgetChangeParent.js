// js/Views/WidgetChangeParent.js

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    Config                        = require('js/Config'),
    _                             = require('underscore')
  ;

  var
    status = Config.status
  ;

  module.exports = Backbone.View.extend({

    events : {
      'click .link' : 'toggleChangeParent'
    },

    initialize : function (options) {
      this.$a = this.$('[name="changeParent"]');
      this.$message = this.$('.message');
      this._changeText = this.$a.attr('data-change-str');
      this._unchangeText = this.$a.attr('data-unchange-str');
      wgts._changeParentStatus = status.ready;
      this.listenTo(wgts.events, 'widget:changeParent widget:unchangeParent widget:changedParent', this.toggleChangeParentText);
      this._parent = options._parent;
    },

    toggleChangeParent : function (ev) {
      ev.preventDefault();
      if (wgts._changeParentStatus === status.ready) this.changeParent();
      else this.unchangeParent();
    },

    changeParent : function () {
      wgts._changeParentStatus = status.progress;
      wgts._changeParentWidget = this._parent;
      wgts.events.trigger('widget:changeParent', this._parent);
    },

    unchangeParent : function () {
      wgts._changeParentStatus = status.ready;
      wgts._changeParentWidget = null;
      wgts.events.trigger('widget:unchangeParent', this._parent);
    },

    toggleChangeParentText : function (widget) {
      if (widget.model.id !== this.model.id) return;
      if (wgts._changeParentStatus === status.progress) {
        this.$a.empty().append(this._unchangeText);
        this.$message.fadeIn(200);
      } else {
        this.$a.empty().append(this._changeText);
        this.$message.fadeOut(200);
      }
    }

  });

});