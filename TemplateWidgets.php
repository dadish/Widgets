<?php

class TemplateWidgets extends WidgetArray {

  protected $ownerId;

  protected $widgets;

  protected $breakpoints;

  public function __construct($ownerId)
  {
    $this->ownerId = $ownerId;
    $this->widgets = $this->modules->get('Widgets');
    $this->breakpoints = $this->modules->get('Breakpoints');
    $this->refresh();
  }

  public function refresh()
  {
    $this->removeAll();
    $this->import($this->widgets->find("owner=$this->ownerId, sort=sort"));
    $this->breakpoints->fetchAllForOwner($this->ownerId);
  }

  public function render()
  {
    $html = "";
    foreach ($this->find("parent=1") as $widget) {
      $html .= $widget->render();
    }
    return $html;
  }

  public function assets($type = 'css')
  {
    if (!in_array($type, array('css', 'js'))) return '';
    $method = $type . 'Assets';
    return $this->$method();
  }

  protected function cssAssets()
  {
    $out = "";
    $widgetCss = array();
    $out .= $this->widgets->assets();

    foreach ($this as $widget) {
      if (!in_array($widget->className(), $widgetCss)) {
        $out .= $widget->css();
        $widgetCss[] = $widget->className();
      }
    }

    foreach ($this as $widget) {
      $out .= $widget->breakpoints();
    }
    if ($this->config->debug) return $this->minify($out);
    return $out;
  }

  protected function jsAssets()
  {
    return '';
  }

  static public function minify($string = '')
  {
    return $string;
  }

}