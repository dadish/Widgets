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
    $this->attr('id', "InputfieldWidget_" . $this->widget->id);
    $wrap = new InputfieldWrapper();
    $wrap->label = $this->label;

    // WidgetType
    $field = $this->modules->get('InputfieldSelect');
    $field->label = $this->_('Widget Type');
    $field->attr('id', 'InputfieldType_' . $this->widget->id);
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
    $breakpoints = new InputfieldBreakpoints($this->widget);
    $breakpoints->setWidget($this->widget);
    $wrap->add($breakpoints);

    // UpdateButton
    $button = $this->modules->get('InputfieldButton');
    $button->attr('id', 'InputfieldUpdate_' . $this->widget->id);
    $button->attr('value', $this->_('Update'));   
    $wrap->add($button);

    return parent::___render() . $wrap->render();
  }

  public function setWidget(Widget $widget)
  {
    $this->widget = $widget;
    return $this;
  }
}