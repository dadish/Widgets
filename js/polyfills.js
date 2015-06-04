// js/polyfills.js

define(function (require, exports, module) {
  
  // taken from MDN
  // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/String/trim
  if (!String.prototype.trim) {
    (function() {
      // Make sure we trim BOM and NBSP
      var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
      String.prototype.trim = function() {
        return this.replace(rtrim, '');
      };
    })();
  }

});