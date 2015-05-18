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

/**
 * WireArray of widgets instances for children widgets.
 * 
 */
class WidgetChildrenArray extends WidgetArray
{

  public function __construct()
  {
    $this->data('owner', null);
    $this->data('ownerType', null);
  }

  public function setOwner($value)
  {
    $this->data('owner', $value);
    foreach ($this as $widget) $widget->owner = $value;
  }

  public function setOwnerType($value)
  {
    $this->data('ownerType', $value);
    foreach ($this as $widget) $widget->ownerType = $value;
  }
}