<?php

class BreakpointArray extends WireArray {

  public function isValidItem($item) {
    return $item instanceof Breakpoint;
  }

  public function isValidKey($key) {
    return is_int($key) || ctype_digit($key); 
  }

  public function getItemKey($item) {
    return $item->id; 
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

  protected function getString()
  {
    $out = "";
    $prefix = $this->modules->get('Widgets')->prefix;
    foreach ($this as $brk) $out .= $brk->getString($prefix);
    return $out;
  }

  public function __toString() {
    return $this->getString();
  }

  public function __debugInfo()
  {
    $info = parent::__debugInfo();
    $info['breakpoints'] = array();
    foreach ($this as $brk) $info['breakpoints'][] = $brk->__debugInfo();
    return $info;
  }

}