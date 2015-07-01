// js/Views/Widgets.js

define(function (require, exports, module) {
  
  var
    Backbone                      = require('backbone'),
    Widget                        = require('js/Views/Widget'),
    Config                        = require('js/Config'),
    _                             = require('underscore')
  ;

  var
    status = Config.status
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
      this.$addLink = this.$('#InputfieldWidgetsAddLink_' + this._id);
      this._addLinkText = this.$addLink.text();
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
      this.listenTo(wgts.events, 'widget:changeParent', this.onChangeParent);
      this.listenTo(wgts.events, 'widget:unchangeParent widget:changedParent', this.unchangeParent);
      this.listenTo(wgts.events, 'widget:moveToParent', this.removeChild);
      
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

      if (wgts._changeParentStatus === status.progress && wgts._changeParentWidget instanceof Widget) {
        if (this.isChild(wgts._changeParentWidget)) return;
        return this.changeParent();
      }

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
    },

    isChild : function (widget) {
      return _(this._widgets).some(function (item) {
        return item.model.id === widget.model.id
      });
    },

    onChangeParent : function (widget) {
      if (this.isChild(widget)) return;
      this.$addLink.empty().append(wgts.config.changeParentDestinationText);
    },

    changeParent : function () {
      var widget;
      widget = wgts._changeParentWidget;
      widget.model.set('parent', this._id);

      function then () {
        widget.$el.appendTo(this.$widgets);
        this._widgets.push(widget);
        widget.$el.slideDown(300);
        wgts._changeParentStatus = status.ready;
        wgts._changeParentWidget = null;
        wgts.events.trigger('widget:changedParent', widget);
      }

      widget.$el.slideUp(300, _.bind(then, this));
      wgts.events.trigger('widget:moveToParent', widget);
    },

    unchangeParent : function () {
      this.$addLink.empty().append(this._addLinkText);
    },

    removeChild : function (widget) {
      var index;
      if (!this.isChild(widget)) return;

      index = _(this._widgets).findIndex(function (item) {
        return widget.model.id === item.model.id;
      });

      this._widgets.splice(index, 1);
    }

  });

});