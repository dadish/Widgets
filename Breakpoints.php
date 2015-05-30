<?php

/**
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

class Breakpoint extends WireData {

  public function __construct()
  {
    parent::__construct();
    $this->set('media', null);
    $this->set('span', array(1,1));
    $this->set('clear', 'none');
    $this->setTrackChanges();
  }

  public function getString($id, $prefix)
  {
    $out = "";
    $width = $this->span[0] / $this->span[1] * 100;
    if ($this->media !== 'default') $out .= "@media(max-width:". $this->media ."px){";
    $out .= ".". $prefix . $id ."{width:". $width ."%;clear:". $this->clear ."}";
    if ($this->media !== 'default') $out .= "}";
    return $out;
  }

}

class BreakpointArray extends WireArray {

  protected $widget = null;

  public function __construct()
  {
    parent::__construct();
    $default = $this->makeBlankItem();
    $default->media = 'default';
    $this->add($default);
  }

  public function populate($breakpoints)
  {
    $this->removeAll();

    foreach ($breakpoints as $brk) {
      $breakpoint = $this->makeBlankItem();
      $breakpoint->media = $brk['media'];
      $breakpoint->span = $brk['span'];
      $breakpoint->clear = $brk['clear'];
      $this->add($breakpoint);
    }
  }

  public function isValidItem($item) {
    return $item instanceof Breakpoint;
  }

  public function isValidKey($key) {
    return is_int($key) || ctype_digit($key); 
  }

  public function getItemKey($item) {
    return $item->media; 
  }

  public function makeBlankItem() {
    return new Breakpoint();
  }

  public function getArray()
  {
    $arr = array();
    foreach ($this as $breakpoint) $arr[] = $breakpoint->getArray();
    return $arr;
  }

  public function setWidget(Widget $widget)
  {
    $this->widget = $widget;
    return $this;
  }

  protected function getString()
  {
    $out = "";
    $prefix = $this->modules->get('Widgets')->prefix;
    foreach ($this as $brk) $out .= $brk->getString($this->widget->id, $prefix);
    return $out;
  }

  public function __toString() {
    if (is_null($this->widget) || $this->widget->isNew()) return $this->className();
    return $this->getString();
  }

}