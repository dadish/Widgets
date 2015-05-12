<?php

/**
 * WireArray of Widget instances
 *
 */
class WidgetsArray extends WireArray {

  public function isValidItem($item) {
    return $item instanceof Widget;   
  }

  public function isValidKey($key) {
    return is_int($key) || ctype_digit($key); 
  }

  public function getItemKey($item) {
    return $item->id; 
  }

  public function makeBlankItem($owner, $ownerType) {
    return new Widget($owner, $ownerType);
  }
}

/**
 * WireArray of widgets instances for children widgets.
 * 
 */
class WidgetsChildrenArray extends WidgetsArray
{
  public function __construct($owner, $ownerType)
  {
    
  }

  public function makeBlankItem() {
    return new Widget($this->owner, $this->ownerType);
  }
}