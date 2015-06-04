// js/Views/Breakpoints.js

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    Breakpoint                    = require('js/Views/Breakpoint'),
    BreakpointModel               = require('js/Models/Breakpoint'),
    _                             = require('underscore')
  ;

  module.exports = Backbone.View.extend({

    events : {
      'click .addBreakpointButton' : 'addBreakpoint'
    },

    initialize : function (options) {
      var populated;
      this.$breakpoints = this.$('tbody');
      this.$spinner = $('<i class="fa fa-lg fa-spin fa-spinner"></i>');
      this._breakpoints = [];
      this.populate();
      this.attachEvents();
    },

    attachEvents : function () {
      this.listenTo(this.collection, 'add', this.renderBreakpoint);
      this.listenTo(this.collection, 'reset', this.populate);
      this.listenTo(wgts.events, 'remove:breakpoint', this.removeBreakpoint);
    },

    removeBreakpoint : function (breakpoint) {
      var index;
      index = _(this._breakpoints).findIndex(function (item) {
        return item.cid === breakpoint.cid;
      });
      if (index === -1) return;

      this.startSpinning();

      function then (data) {
        data = wgts.messenger(data);
        if (data) {
          this._breakpoints.splice(index, 1);
          this.collection.remove(breakpoint.model);
          breakpoint.remove();
          this.stopSpinning();
        }
      }

      $.get(wgts.config.ajaxUrl + 'DeleteBreakpoint/', {
        id : breakpoint.model.id
      }, _.bind(then, this));
    },

    populate : function () {
      this._breakpoints = this.collection.map(function (breakpoint) {
        return new Breakpoint({model : breakpoint});
      }, this);
      this.renderBreakpoints();
    },

    addBreakpoint : function (ev) {
      ev.preventDefault();

      this.startSpinning();

      function then (data) {
        var breakpoint;
        breakpoint = new BreakpointModel();
        breakpoint.parseData(JSON.parse(data));
        this.collection.add(breakpoint);
        this.stopSpinning();
      }

      $.get(wgts.config.ajaxUrl + 'CreateBreakpoint/', {
        widgetId : this.model.id
      }, _.bind(then, this));
    },

    renderBreakpoint : function (model) {
      var breakpoint;
      breakpoint = new Breakpoint({model : model});
      this._breakpoints.push(breakpoint);
      this.$breakpoints.append(breakpoint.render().el);
    },

    renderBreakpoints : function () {
      var breakpoints;
      
      breakpoints = document.createDocumentFragment();
      
      _(this._breakpoints).each(function (breakpoint, index) {
        breakpoints.appendChild(breakpoint.render().el);
      }, this);

      this.$breakpoints.empty().append(breakpoints);
      return this;
    },

    startSpinning : function () {
      this.$('.InputfieldWidgetHeader').append(this.$spinner);
    },

    stopSpinning : function () {
      this.$spinner.remove();
    }

  });

});