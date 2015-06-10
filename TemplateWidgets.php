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
    $owner = $this->templates->get($this->ownerId)->name;
    $this->import($this->widgets->find("owner=$owner, sort=sort"));
    $this->breakpoints->fetchAllForOwner($owner);
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

  public function assetsMin($type = 'css')
  {
    if (!in_array($type, array('css', 'js'))) return '';
    $method = $type . 'Assets';
    return $this->minify($this->$method());    
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

    foreach ($this->find("parent=1") as $widget) {
      $out .= $widget->breakpointsCss();
    }
    return $out;
  }

  protected function jsAssets()
  {
    return '';
  }

  static public function minify($string = '')
  {
    // Load minifier
    require_once(__DIR__ . "/cssmin.php");

    $compressor = new CSSmin();

    return $compressor->run($string);
  }

}