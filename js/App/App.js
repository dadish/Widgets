// js/App/App.js

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    Widgets                       = require('js/Collections/Widgets'),
    View                          = require('js/Views/Widgets'),
    Config                        = require('js/Config'),
    BatchUpdate                   = require('js/Views/WidgetsBatchUpdate'),
    _                             = require('underscore')
  ;

  module.exports = {

    events : _.extend({}, Backbone.Events),
  
    launch : function () {
      window.wgts = this;

      wgts.config = Config;

      wgts.widgets = new Widgets();
      wgts.views = [];

      $('.InputfieldWidgets').each(function () {
        wgts.views.push(new View({el : this}));
      });

      wgts.batchUpdate = new BatchUpdate({el : $('#wrap_WidgetsBatchUpdate')[0]});
    }

  };

});