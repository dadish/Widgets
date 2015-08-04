// js/Views/CloneWidgets.js

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    Config                        = require('js/Config'),
    _                             = require('underscore')
  ;

  var status = Config.status;

  module.exports = Backbone.View.extend({

    el : '#wrap_Inputfield_widgets_clone_template',

    events : {
      'click button' : 'cloneWidgets'
    },

    initialize : function () {
      this.$button = this.$('button');
      this.$spinner = $('<i class="fa fa-lg fa-spin fa-spinner"></i>');
      this.$text = this.$('.ui-button-text');
      this._status = status.end;
      this._buttonSizeFixed = false;
      this._disabled = false;
      this.attachEvents();
      this.onWidgetsChange();
    },

    attachEvents : function () {
      this.listenTo(wgts.widgets, 'add remove', this.onWidgetsChange);
    },

    hide : function (callback) {
      this.$el.slideUp(callback);
      this._disabled = true;
    },

    show : function (callback) {
      this.$el.slideDown(callback);
      this._disabled = false;
    },

    onWidgetsChange : function (ev) {
      if (wgts.widgets.length) this.hide();
      else this.show();
    },

    getRootContainer : function () {
      return _(wgts.containers).find(function (container) {
        return container.$el.is('#wrap_Inputfield_widgets_1');
      }, this);
    },

    cloneWidgets : function (ev) {
      ev.preventDefault();
      if (this._status !== status.end) return;
      if (wgts.widgets.length) return;
      if (this._disabled) return;
      this._status = status.progress;
      this.fixButtonSize();
      this.startSpinning();

      $.get(wgts.config.ajaxUrl + 'CloneWidgets/', {
        cloneFrom : this.getCloneFrom(),
        cloneTo : this.getCloneTo(),
        cloneToType : this.getCloneToType()
      }, _.bind(this.onDataRecieve, this));

    },

    getCloneFrom : function () {
      var $target;
      $target = this.$('#widgets_clone_template_from');
      return parseInt($target.val(), 10);
    },

    getCloneTo : function () {
      var $target;
      $target = this.$('button');
      return parseInt($target.attr('data-clone-to'));
    },

    getCloneToType : function () {
      var $target;
      $target = this.$('button');
      return parseInt($target.attr('data-clone-to-type'));
    },

    onDataRecieve : function (data) {
      if (this._status !== status.progress) return;
      this._status = status.end;
      this.getRootContainer().onDataRecieve(data);
      this.stopSpinning();
    },

    fixButtonSize : function () {
      if (this._buttonSizeFixed) return;
      this.$button.css('width', this.$button.outerWidth() + 2 + 'px');
      this._buttonSizeFixed = true;
    },

    startSpinning : function () {
      this.$button.empty().append(this.$spinner);
    },

    stopSpinning : function () {
      this.$button.empty().append(this.$text);
      this.$button.removeClass('ui-state-active');
    }

  });

});