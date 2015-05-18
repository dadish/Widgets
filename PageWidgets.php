<?php

class PageWidgets extends WireData {

  protected $page;

  protected $widgets;

  public function __construct(Page $page)
  {
    $this->page = $page;
    $this->widgets = $this->modules->get('Widgets');
  }

  public function render()
  {
    $str = "";
    $widgets = $this->widgets->withOwner($this->page->WidgetsOwnerId);
    foreach ($widgets as $widget) {
      $str .= $widget->render();
    }
    return $str;
  }

}