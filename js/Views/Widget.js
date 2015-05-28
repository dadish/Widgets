// js/Views/Widget.js

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    WidgetUpdate                  = require('js/Views/WidgetUpdate'),
    Breakpoints                   = require('js/Views/Breakpoints'),
    BreakpointModel               = require('js/Models/Breakpoint'),
    Model                         = require('js/Models/Widget')
  ;

  module.exports = Backbone.View.extend({

    events : {
      'click .InputfieldWidgetDelete' : 'remove'
    },

    initialize : function (options) {
      var id, jsonString;
      this.$('.InputfieldHeader').addClass('InputfieldStateToggle');
      this.model = new Model();

      id = this.$el.attr('data-id');
      jsonString = this.$('#InputfieldWidget_' + id).val();
      this.model.parseWidget(jsonString);
      this.breakpoints = new Breakpoints({
        collection : this.model.get('breakpoints'),
        el : this.$('.InputfieldContent .Inputfields .InputfieldBreakpoints')[0]
      });

      this.$update = new WidgetUpdate({
        el : this.$('#wrap_InputfieldUpdate_' + this.model.id),
        model : this.model
      });
    },

    addBreakpoint : function (ev) {
      ev.preventDefault();
      this.model.get('breakpoints').add(new BreakpointModel());
    },

    remove : function (ev) {
      var alertMsg, alerted;
      ev.preventDefault();
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
    }
  });

});