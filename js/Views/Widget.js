// js/Views/Widget.js

// TODO Dp not delete widget if it has child wigets
// Tell user to delete child widgets first

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    Breakpoints                   = require('js/Views/Breakpoints'),
    BreakpointModel               = require('js/Models/Breakpoint'),
    ChangeParent                  = require('js/Views/WidgetChangeParent'),
    Model                         = require('js/Models/Widget'),
    Magnific                      = require('magnificPopup'),
    Config                        = require('js/Config'),
    _                             = require('underscore')
  ;

  var
    status = Config.status
  ;

  module.exports = Backbone.View.extend({

    events : {
      'click .InputfieldWidgetDelete' : 'remove',
      'change [name="widgetType"]' : 'changeType'
    },

    initialize : function (options) {
      var id, jsonString, subContainer;
      this.$('.InputfieldHeader').addClass('InputfieldStateToggle');
      this.model = new Model();

      id = this.$el.attr('data-id');
      jsonString = this.$('#Inputfield_' + id).val();
      this.model.parseWidget(jsonString);
      this.breakpoints = new Breakpoints({
        model : this.model,
        collection : this.model.get('breakpoints'),
        el : this.$('#wrap_InputfieldBreakpoints_' + this.model.id)[0]
      });

      this.$spinner = $('<i class="fa fa-lg fa-spin fa-spinner"></i>');

      this.$labelMeta = this.$('.InputfieldWidgetHeader .InputfieldWidgetHeaderMeta');

      // If we have a li.InputfieldWidgets element then initiate it as a Widgets
      // View and add it to wgts.containers.
      subContainer = this.$('#wrap_Inputfield_widgets_' + this.model.id);
      if (subContainer.length) {
        wgts.addContainer(subContainer[0]);
      }

      this.changeParent = new ChangeParent({
        el : this.$('#wrap_changeParent_' + this.model.id), 
        model : this.model,
        _parent : this
      });

      this.attachEvents();
    },

    attachEvents : function () {
      // Bind magnific popup for widget settings
      this.$('#widgetSettings_' + this.model.id).magnificPopup({
        type : 'iframe',
        callbacks : {
          close : _.bind(this.updateLabelMeta, this)   
        }
      });
    },

    addBreakpoint : function (ev) {
      ev.preventDefault();
      this.model.get('breakpoints').add(new BreakpointModel());
    },

    alertChildren : function () {
      alert('Please remove embedded (child) widgets first.');
    },

    remove : function (ev) {
      ev.preventDefault();
      if (this.model.children().length) return this.alertChildren();
      
      function then (data) {
        data = wgts.messenger(data);
        if (data) {
          wgts.events.trigger('remove:widget', this);
          this.stopSpinning();
          this.$el.slideUp(_.bind(Backbone.View.prototype.remove, this));
        }
      }
      
      this.startSpinning();
      $.get(wgts.config.ajaxUrl + 'Delete/', {
        widgetId : this.model.id
      }, _.bind(then, this));
      return false;
    },

    changeType : function (ev) {
      var $target;
      $target = $(ev.target);
      if (!$target.is('#widgetType_' + this.model.id)) return;
      this.model.set('className', $(ev.target).val());
      wgts.events.trigger('widget:changeType', this);
      this.startSpinning();
    },

    startSpinning : function () {
      this.$('.InputfieldWidgetHeader').append(this.$spinner);
    },

    stopSpinning : function () {
      this.$spinner.remove();
    },

    updateLabelMeta : function () {
      
      function then (data) {
        this.$labelMeta.empty().append(data);
      }

      $.get(wgts.config.ajaxUrl + 'LabelMeta/', {
        widgetId : this.model.id
      }, _.bind(then, this));
    }
  });

});