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

}


class BreakpointArray extends WireArray {

  public function __construct()
  {
    parent::__construct();
    $default = $this->makeBlankItem();
    $default->media = 'default';
    $this->add($default);
  }

  public function populate($breakpoints)
  {
    $this->remove('default');

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

  public function __toString() {
    $arr = array();
    foreach ($this as $item) {
      $arr[] = $item->className();
    }
    return implode('|', $arr);
  }

  public function getArray()
  {
    $arr = array();
    foreach ($this as $breakpoint) $arr[] = $breakpoint->getArray();
    return $arr;
  }

}