// js/Config.js

define(function (require, exports, module) {

  var _                           = require('underscore');
  
  module.exports = _.extend(config.ProcessWidgets, {

    ajaxUrl : config.urls.admin + 'setup/widgets/'

  });

});