// js/Views/Widget.js

// TODO Dp not delete widget if it has child wigets
// Tell user to delete child widgets first

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    WidgetUpdate                  = require('js/Views/WidgetUpdate'),
    Breakpoints                   = require('js/Views/Breakpoints'),
    BreakpointModel               = require('js/Models/Breakpoint'),
    Model                         = require('js/Models/Widget'),
    Magnific                      = require('magnific-popup')
  ;

  module.exports = Backbone.View.extend({

    events : {
      'click .InputfieldWidgetDelete' : 'remove',
      'change [name="InputfieldType"]' : 'changeType'
    },

    initialize : function (options) {
      var id, jsonString, subContainer;
      this.$('.InputfieldHeader').addClass('InputfieldStateToggle');
      this.model = new Model();

      id = this.$el.attr('data-id');
      jsonString = this.$('#Inputfield_' + id).val();
      this.model.parseWidget(jsonString);
      this.breakpoints = new Breakpoints({
        collection : this.model.get('breakpoints'),
        el : this.$('.InputfieldContent .Inputfields .InputfieldBreakpoints')[0]
      });

      this.$update = new WidgetUpdate({
        el : this.$('#wrap_InputfieldUpdate_' + this.model.id),
        model : this.model
      });

      this.$spinner = $('<i class="fa fa-lg fa-spin fa-spinner"></i>');

      // If we have a li.InputfieldWidgets element then initiate it as a Widgets
      // View and add it to wgts.containers.
      subContainer = this.$('.InputfieldWidgets');
      if (subContainer.length) {
        wgts.addContainer(subContainer[0]);
      }

      // Bind magnific popup for widget settings
      this.$('.InputfieldWidgetSettings .InputfieldContent a').magnificPopup({
        type : 'iframe'
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
      var alertMsg, alerted;
      ev.preventDefault();
      if (this.model.children().length) return this.alertChildren();
      function then (data) {
        alertMsg = "Something went wrong. Could not delete Widget with the id " + this.model.id + ". \n Please try again.";
        try{
          data = JSON.parse(data);
        }catch (e) {
          alerted = true;
          alert(alertMsg);
        }
        if (data.error !== false && !alerted) {
          alert(alertMsg);
        } else {
          wgts.events.trigger('remove:widget', this);
          this.$el.slideUp(_.bind(Backbone.View.prototype.remove, this));
        }
      }
      $.get(wgts.config.ajaxUrl + '/Delete', {
        widgetId : this.model.id
      }, _.bind(then, this));
      return false;
    },

    changeType : function (ev) {
      var $target;
      $target = $(ev.target);
      if (!$target.is('#InputfieldType_' + this.model.id)) return;
      this.model.set('className', $(ev.target).val());
      wgts.events.trigger('widget:changeType', this);
      this.startSpinning();
    },

    startSpinning : function () {
      this.$('.InputfieldWidgetHeader').append(this.$spinner);
    },

    stopSpinning : function () {
      this.$spinner.remove();
    }
  });

});