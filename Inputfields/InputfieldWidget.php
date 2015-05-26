<?php

class InputfieldWidget extends InputfieldTextarea {

  protected $widget = null;

  public function __construct($widget = null)
  {
    parent::__construct();
    if (!is_null($widget) && $widget instanceof Widget) $this->setWidget($widget);
  }

  public function ___render() {
    $this->attr('value', json_encode($this->widget->getArray()));

    $wrap = new InputfieldWrapper();
    $wrap->label = $this->label;

    // WidgetType
    $field = $this->modules->get('InputfieldSelect');
    $field->label = $this->_('Widget Type');
    $widgetTypes = array();
    foreach ($this->modules->findByPrefix('Widget') as $module) {
      $title = $module::getModuleInfo()['title'];
      if ($title === 'Widgets') continue;
      $widgetTypes[] = $title;
    }
    $field->addOptions($widgetTypes);
    $field->attr('value', $this->widget->className());
    $wrap->add($field);

    // Prepare breakpoints
    $breakpoints = new InputfieldBreakpoints();
    $breakpoints->setWidget($this->widget);
    $wrap->add($breakpoints);

    return parent::___render() . $wrap->render();
  }

  public function setWidget(Widget $widget)
  {
    $this->widget = $widget;
    return $this;
  }
}