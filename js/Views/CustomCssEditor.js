// js/views/CustomCssEditor.js

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    Magnific                      = require('magnificPopup')
  ;

  module.exports = Backbone.View.extend({

    events : {
      'keyup [name="CustomCss"]' : 'updateProperties'
    },

    tagName : 'ul',

    attributes : {
      'class' : 'WrapCustomCssEditorFields'
    },

    template : function (json) {
      return _(json.data.customCss).reduce(function (memo, value, property) {
        return memo + property + ' : ' + value + ";\n";
      }, '');
    },

    initialize : function () {
      this.$el.append($('#CustomCssEditorFields').clone().removeClass('InputfieldHidden').attr('id', ''));
      this.$textarea = this.$('[name="CustomCss"]');
      this.render();
    },

    updateProperties : _.debounce(function () {
      this.model.parsePropertiesString(this.$textarea.val());
    }, 200),

    show : function (callback) {
      this.$el.slideDown(200, callback);
    },

    hide : function (callback) {
      this.model.parsePropertiesString(this.$textarea.val());
      this.$el.slideUp(100, callback);
    },

    render : function () {
      this.$textarea.text(this.template(this.model.toJSON()));
      return this;
    }

  });

});