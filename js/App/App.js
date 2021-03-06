// js/App/App.js

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    Widgets                       = require('js/Collections/Widgets'),
    View                          = require('js/Views/Widgets'),
    Config                        = require('js/Config'),
    BatchUpdate                   = require('js/Views/WidgetsUpdate'),
    CloneWidgets                  = require('js/Views/CloneWidgets'),
    _                             = require('underscore')
  ;

  module.exports = {

    // The widget that is going to change it's parent
    _changeParentWidget : null,

    events : _.extend({}, Backbone.Events),
  
    launch : function () {
      var $wrapper;

      window.wgts = this;
      $wrapper = $('#wrap_Inputfield_widgets_1');

      wgts.config = Config;

      wgts.widgets = new Widgets();
      wgts.containers = [];

      if ($wrapper.length) {
        wgts.addContainer($wrapper[0]);
      }
      
      wgts.batchUpdate = new BatchUpdate({el : $('#wrap_WidgetsBatchUpdate')[0]});

      if ($('#wrap_Inputfield_widgets_clone_template').length) {
        wgts.cloner = new CloneWidgets();
      }
      
    },

    addContainer : function (el) {
      wgts.containers.push(new View({el : el}));
    },

    messenger : function (data) {
      var alertMsg, alerted;
      alerted = false;
      alertMsg = 'Something went wrong. Please try to refresh the page and try again.';
      try{
        data = JSON.parse(data);
      }catch (e) {
        alerted = true;
        alert(alertMsg);
        return false;
      }
      if (data.error !== false && !alerted) {
        if (data.message) alert(data.message);
        else alert(alertMsg);
        return false;
      } else {
        return data;
      }
    }

  };

});