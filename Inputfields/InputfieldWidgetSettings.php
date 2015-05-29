<?php

class InputfieldWidgetSettings extends Inputfield {

  protected $widget;

  public function ___render() {
    $out = "\n<a ". $this->getAttributesString() . " >"; 
    $out .= $this->label;
    $out .= "</a>";
    return $out; 
  }  

  public function setWidget(Widget $widget)
  {
    $this->widget = $widget;
    $this->attr('href', $this->config->urls->admin . 'setup/widgets/Settings/?modal=1&id=' . $this->widget->id);
    return $this;
  }
}
