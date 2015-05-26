// js/App/App.js

define(function (require, exports, module) {
  
  var
    _                             = require('underscore'),
    Widgets                       = require('js/Collections/Widgets'),
    View                          = require('js/Views/Widgets'),
    Config                        = require('js/Config')
  ;

  module.exports = {

    launch : function () {
      window.wgts = this;

      wgts.config = Config;

      wgts.widgets = new Widgets();
      wgts.widgetViews = [];

      $('.InputfieldWidgets').each(function () {
        wgts.widgetViews.push(new View({el : this}));
      });
    }

  };

});