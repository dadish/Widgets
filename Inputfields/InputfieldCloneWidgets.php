<?php

class InputfieldCloneWidgets extends Inputfield {

  public function __construct()
  {
    parent::__construct();
    $this->attr('type', 'submit'); 
    $this->attr('name', 'submit'); 
    $this->attr('value', $this->_('Clone Widgets')); // Standard submit button label
    $this->attr('class', 'ui-button ui-widget ui-state-default ui-corner-all'); 
  }

  public function ___render() {
    $attrs  = $this->getAttributesString();
    $icon = $this->icon ? $this->sanitizer->name($this->icon) : '';
    $icon = $icon ? "<i class='fa fa-$icon'></i> " : '';
    $out = "\n<button $attrs><span class='ui-button-text'>$icon" . $this->attr('value') . '</span></button>';
    return $out; 
  }

}