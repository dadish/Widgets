// js/Models/WidgetBreakpoint.js

define(function (require, exports, module) {
  var
    Backbone                      = require('backbone'),
    _                             = require('underscore')
  ;

  module.exports = Backbone.Model.extend({

    defaults : {
      widget : null, // the widget that this breakpoint belongs to
      sort : null,
      media : [ // @media (min/max-width : ...) a css property
        0, // min
        100 // max
      ], 
      span : [ // A fraction. 
        1, // numerator
        1  // denominator
      ],
      clear : 'none', // css clear property. Allowed: none, both, right, left.
      clearOptions : {}, // Hash of possible values and labels for clear property
      mixins : [], // Array of mixins to be included into this breakpoint.
      mixinOptions : {}, // Hash of possible values and labels for mixins property.
      customCss : {} // additional custom css rules for this particular breakpoint.
    },

    parseData : function (arr) {
      var attr;
      attr = {};
      attr.id = arr.id
      attr.widget = arr.widget;
      if (arr.data.media === 'default') attr.media = 'default';
      if (_.isArray(arr.data.media)) attr.media = [arr.data.media[0], arr.data.media[1]];
      attr.span = [arr.data.span[0], arr.data.span[1]];
      attr.clear = arr.data.clear;
      attr.sort = arr.sort;
      attr.clearOptions = arr.clearOptions;
      attr.mixins = arr.data.mixins;
      attr.mixinOptions = arr.mixinOptions;
      attr.customCss = (_.isArray(arr.data.customCss) && !arr.data.customCss.length) ? {} : arr.data.customCss;
      this.set(attr);
    },

    parsePropertiesString : function (str) {
      var properties, propIndex, valIndex, propStr, valStr;
      properties = {};

      while (str) {
        propIndex = str.indexOf(':');
        if (propIndex === -1) {
          str = false;
          continue;
        }
        propStr = str.substring(0, propIndex).trim();

        valIndex = str.indexOf(';', propIndex);
        if (valIndex === -1) {
          str = false;
          continue;
        }
        valStr = str.substring(propIndex + 1, valIndex).trim();

        if (propStr && valStr) properties[propStr] = valStr;

        str = str.slice(valIndex + 1);
      }

      this.set('customCss', properties, {silent : true});
      this.trigger('change change:customCss', this);

      return properties;
    },

    toJSON : function () {
      var json, data;
      json = {};
      json.id = this.get('id');
      json.widget = this.get('widget');
      json.sort = this.get('sort');
      json.clearOptions = this.get('clearOptions');
      json.mixinOptions = this.get('mixinOptions');
      data = {};
      data.media = this.get('media');
      data.span = this.get('span');
      data.clear = this.get('clear');
      data.mixins = this.get('mixins');
      data.customCss = this.get('customCss');
      json.data = data;
      return json;
    }

  });

});