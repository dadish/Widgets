<?php

/**
 * WireArray of Widget instances
 * 
 * @todo Build default widget module for makeBlankItem ?
 *
 */

class WidgetArray extends WireArray {

  public function isValidItem($item) {
    return $item instanceof Widget;   
  }

  public function isValidKey($key) {
    return is_int($key) || ctype_digit($key); 
  }

  public function getItemKey($item) {
    return $item->id; 
  }

  public function makeBlankItem() {
    return new Widget();
  }

  public function __toString() {
    $arr = array();
    foreach ($this as $item) {
      if ($item->isNew()) $arr[] = $item->className();
      else $arr[] = $item->id;
    }
    return implode('|', $arr);
  }
}