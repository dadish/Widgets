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
      this._breakpoints.splice(index, 1);
      this.collection.remove(breakpoint.model);
    },

    populate : function () {
      this._breakpoints = this.collection.map(function (breakpoint) {
        return new Breakpoint({model : breakpoint});
      });
      this.renderBreakpoints();
    },

    addBreakpoint : function (ev) {
      ev.preventDefault();
      this.collection.add(new BreakpointModel());
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
    }

  });

});