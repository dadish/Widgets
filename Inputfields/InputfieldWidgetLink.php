<?php

class InputfieldWidgetLink extends Inputfield {

  protected $widget;

  public function __construct()
  {
    parent::__construct();
    $this->attr('href', '#');
  }

  public function ___render() {
    $this->attr('id', $this->name . '_' . $this->widget->id);

    $out = "\n<a class='link' ". $this->getAttributesString() . " >"; 
    $out .= $this->label;
    $out .= "</a>";
    if ($this->message) $out .= "<p class='message'>$this->message</p>";
    return $out; 
  }  

  public function setWidget(Widget $widget)
  {
    $this->widget = $widget;
    return $this;
  }
}
