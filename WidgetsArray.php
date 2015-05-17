<?php

/**
 * WireArray of Widget instances
 * 
 * @todo Build default widget module for makeBlankItem ?
 *
 */

require_once(__DIR__ . "/Widget.php");

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

  public function makeBlankItem() {
    return new Widget();
  }
}

/**
 * WireArray of widgets instances for children widgets.
 * 
 */
class WidgetsChildrenArray extends WidgetsArray
{

  public function __construct()
  {
    $this->set('owner', null);
    $this->set('ownerType', null);
  }

  public function __set($key, $value)
  {
    switch ($key) {
      case 'owner':
        $v = Widget::sanitizeOwner($value, $this);
        return $this->setOwnerOrType($key, $v);
        break;

      case 'ownerType':
        $v = Widget::sanitizeOwnerType($value, $this);
        return $this->setOwnerOrType($key, $v);
        break;
      
      default:
        return parent::__set($key, $value);
        break;
    }
  }

  public function __get($key)
  {
    switch ($key) {
      case 'owner':
        return ($this->ownerType == Widget::ownerTypeTemplate) ? $this->templates->get($this->get($key)) : $this->pages->get($this->get($key));
        break;
      
      default:
        return parent::__get($key);
        break;
    }
  }

  protected function setOwnerOrType($key, $owner)
  {
    $this->set($key, $owner->id);
    foreach ($this as $widget) {
      $widget->set($key, $owner->id);
    }
  }
}
//*/