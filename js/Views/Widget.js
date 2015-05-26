// js/Views/Widget.js

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    Breakpoint                    = require('js/Views/Breakpoint'),
    BreakpointModel               = require('js/Models/Breakpoint'),
    Model                         = require('js/Models/Widget')
  ;

  module.exports = Backbone.View.extend({

    events : {
      'click .addBreakpointButton' : 'addBreakpoint'
    },

    initialize : function (options) {
      this.$('.InputfieldHeader').addClass('InputfieldStateToggle');
      this._breakpoints = []; // a cache of breakpoint views
      this.model = new Model();
      this.populateBreakpoints();
      this.render();
      this.attacheEvents();
    },

    attacheEvents : function () {
      this.listenTo(this.model.get('breakpoints'), 'add', this.renderBreakpoint);
    },

    populateBreakpoints : function () {
      this._breakpoints = this.model.get('breakpoints').map(function (model) {
        return new Breakpoint({model : model});
      });
    },

    renderBreakpoint : function (breakpoint) {
      var $breakpoints, breakpoint;
      $breakpoints = this.$('.WidgetBreakpoints');
      breakpoint = new Breakpoint({model : new BreakpointModel()});
      this._breakpoints.push(breakpoint);
      $breakpoint = breakpoint.render().$el;
      $breakpoints.find('tbody').append($breakpoint).trigger('addRows', [$breakpoint]);
    },

    addBreakpoint : function (ev) {
      this.model.get('breakpoints').add(new BreakpointModel());
    },

    render : function () {
      var breakpoints, $breakpoints, $settings;
      
      $breakpoints = this.$('.WidgetBreakpoints');
      $settings = this.$('.WidgetSettings').empty();
      breakpoints = document.createDocumentFragment();
      
      _(this._breakpoints).each(function (breakpoint, index) {
        breakpoints.appendChild(breakpoint.render().el);
      }, this);

      $breakpoints.find('tbody').empty().append(breakpoints);
      return this;
    }

  });

});