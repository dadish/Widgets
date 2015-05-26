// js/Models/Widget.js

define(function (require, exports, module) {
  var
    Backbone                      = require('backbone'),
    Breakpoints                   = require('js/Collections/Breakpoints')
  ;

  module.exports = Backbone.Model.extend({

    defaults : {
      owner : null,
      ownerType : null,
      parent : 1,
      className : 'Widget',
      options : {},
      breakpoints : new Breakpoints([{media : 'default', span : [1,1], clear : 'none'}]), // A collection of WidgetBreakpoint models
      breakpointsCss : '',
      renderPages : []
    }

  });
});