<?php

class InputfieldWidget extends InputfieldTextarea {

  protected $widget = null;

  public function __construct($widget = null)
  {
    parent::__construct();
    if (!is_null($widget) && $widget instanceof Widget) $this->setWidget($widget);
  }

  public function ___render() {
    $wrap = new InputfieldWrapper();

    // Determine if this widget is going to be a container
    // If WidgetContainer is installed and
    // If the widget is a container then it is a container
    $container = $this->modules->has('WidgetContainer') && $this->widget->className() == 'WidgetContainer';

    // WidgetType
    $field = $this->modules->get('InputfieldSelect');
    $field->name = 'InputfieldType';
    $field->label = $this->_('Widget Type');
    $field->attr('id', 'InputfieldType_' . $this->widget->id);
    $field->required = true;
    $field->columnWidth = 50;
    $widgetTypes = array();
    foreach ($this->modules->findByPrefix('Widget') as $module) {
      $title = $module::getModuleInfo()['title'];
      if ($title === 'Widgets') continue;
      $widgetTypes[$module] = $title;
    }
    $field->addOptions($widgetTypes);
    $field->attr('value', $this->widget->className());
    $wrap->add($field);

    // Settings button
    $field = new InputfieldWidgetSettings();
    $field->setWidget($this->widget);
    $field->name = 'InputfieldSettings';
    $field->label = $this->_('Settings');
    $field->columnWidth = 50;
    $wrap->add($field);

    // Prepare breakpoints
    $breakpoints = new InputfieldBreakpoints($this->widget);
    $breakpoints->setWidget($this->widget);
    $wrap->add($breakpoints);

    // Add widgets container if it is a container
    if ($container) {
      $container = new InputfieldWidgets();
      $container->setWidget($this->widget);
      foreach ($this->widget->children() as $childWidget) $container->add($childWidget);
      $wrap->add($container);
    }

//    // UpdateButton
//    $button = $this->modules->get('InputfieldButton');
//    $button->attr('id', 'InputfieldUpdate_' . $this->widget->id);
//    $button->attr('value', $this->_('Update'));   
//    $wrap->add($button);

    return parent::___render() . $wrap->render();
  }

  public function setWidget(Widget $widget)
  {
    $this->widget = $widget;

    $label = "<span class='InputfieldWidgetDragZone'>";
    $label .= wireIconMarkup('cube'); 
    $label .= " <span class='InputfieldWidgetHeaderText'>". __('Widget', __FILE__) . "</span>";
    $label .= " <span class='InputfieldWidgetHeaderId'>id: ". $this->widget->id ."</span>";
    $label .= "</span>";
    $this->label = $label;
    $arr = $this->widget->getArray();
    $this->attr('value', json_encode($arr));
    $this->name = $this->widget->id;

    return $this;
  }
}