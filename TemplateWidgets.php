<?php

class TemplateWidgets extends WidgetArray {

  protected $ownerId;

  protected $widgets;

  public function __construct($ownerId)
  {
    $this->ownerId = $ownerId;
    $this->widgets = $this->modules->get('Widgets');
    $this->refresh();
  }

  public function refresh()
  {
    $this->import($this->widgets->find("owner=$this->ownerId"));
  }

  public function render()
  {
    $html = "";
    foreach ($this as $widget) {
      $html .= $widget->render();
    }
    return $html;
  }

  public function assets()
  {
    $out = ""; 
    $out .= $this->widgets->assets();
    foreach ($this as $widget) {
      $out .= $widget->css();
      $out .= $widget->breakpoints;
    }
    return $out;
  }

}