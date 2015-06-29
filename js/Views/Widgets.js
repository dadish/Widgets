// js/Views/Widgets.js

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    Widget                        = require('js/Views/Widget'),
    _                             = require('underscore')
  ;

  module.exports = Backbone.View.extend({

    events : {
      'click .InputfieldWidgetsAddLink' : 'addWidget'
    },

    initialize : function (options) {

      // The widgets
      this._id = parseInt(this.$el.attr('id').replace('wrap_Inputfield_widgets_', ''), 10);
      this.$widgets = this.$('.Inputfields.InputfieldsWidgets_' + this._id);
      this._widgets = _(this.$widgets.children('.InputfieldWidget')).map(this.initializeWidget, this);
      this.attachEvents();
    },

    initializeWidget : function (el) {
      var widget;
      widget = new Widget({el : el});
      wgts.widgets.add(widget.model);
      return widget;
    },

    attachEvents : function () {
      this.listenTo(wgts.events, 'remove:widget', this.removeWidget);
      this.listenTo(wgts.events, 'widget:changeType', this.changeWidgetType);
      
      // Init sortable
      this.$widgets.sortable({
        handle : ".InputfieldWidgetDragZone",
        axis : 'y',
        cursor : 'move',
        distance: 8,
        opacity : 0.65,
        update : _.bind(this.onSortUpdate, this)
      });
    },

    addWidget : function (ev) {

      var $target;
      $target = $(ev.target);
      id = '#InputfieldWidgetsAddLink_' + this._id;
      if (!$target.is(id) && !$target.parents(id).length) return;
      ev.preventDefault();

      $.get(wgts.config.ajaxUrl + 'Create/', {
        owner : wgts.config.owner,
        ownerType : wgts.config.ownerType,
        parent : this._id
      }, _.bind(this.onDataRecieve, this));
    },

    onDataRecieve : function (data) {
      $data = $(data);
      $data.css('display', 'none');
      if ($data.length === 1) {
        this.$widgets.append($data);
        this._widgets.push(this.initializeWidget($data[0]));
        $data.slideDown();
      } else if ($data.length > 1) {
        _($data).each(function (item) {
          this.onDataRecieve(item);
        }, this);
      }
    },

    changeWidgetType : function (widget) {
      var index, $widget;
      index = _(this._widgets).findIndex(function (item) {
        return item.cid === widget.cid && item.model.id === widget.model.id;
      });
      if (index === -1) return;

      function then (data) {
        // our new widget
        $widget = $(data);

        // Insert it right after old
        $widget.insertAfter(widget.$el);

        // Remove the old one
        Backbone.View.prototype.remove.apply(widget);

        // Remove the model of the old widget
        wgts.widgets.remove(widget.model);

        // Remove the widget view from _widgets cache
        this._widgets.splice(index, 1);

        // Initialize the new widget and append it to _widgets cache
        this._widgets.push(this.initializeWidget($widget[0]));
      }

      $.post(wgts.config.ajaxUrl + 'ChangeType/', {
        widget : JSON.stringify(widget.model.toJSON())
      }, _.bind(then, this));
    },

    removeWidget : function (widget) {
      var index, widget;
      index = _(this._widgets).findIndex(function (item) {
        return item.cid === widget.cid;
      });
      if (index === -1) return;
      this._widgets.splice(index, 1);
      wgts.widgets.remove(widget.model);
    },

    onSortUpdate : function (ev, ui) {
      _(this.$widgets.children()).each(function(el, index) {
        wgts.widgets.get(parseInt($(el).attr('data-id'), 10)).set('sort', index);
      });
    }

  });

});