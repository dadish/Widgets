<?php

class InputfieldCloneWidgets extends Inputfield {

  protected $owner = null;

  public function __construct()
  {
    parent::__construct();
    $this->attr('type', 'submit'); 
    $this->attr('name', 'widgets_clone_template'); 
    $this->attr('value', $this->_('Clone Widgets')); // Standard submit button label
    $this->attr('class', 'ui-button ui-widget ui-state-default ui-corner-all'); 
    $this->label = $this->_('Clone Widgets From Template');
    $this->attr('value', $this->_('Clone Widgets'));
  }

  public function ___render() {
    $attrs  = $this->getAttributesString();
    $icon = $this->icon ? $this->sanitizer->name($this->icon) : '';
    $icon = $icon ? "<i class='fa fa-$icon'></i> " : '';
    $out = "Clone From:<br />";
    $out .= $this->getChoices() . "<br /><br />";
    $out .= "\n<button $attrs><span class='ui-button-text'>$icon" . $this->attr('value') . '</span></button>';
    return $out; 
  }

  protected function getChoices()
  {
    $name = $this->name . "_from";
    $out = "<select id='$name' name='$name'>";
    foreach (wire('templates') as $template) {
      if ($template->hasWidgets()) {
        if ($this->owner instanceof Template && $this->owner->id === $template->id) continue;
        if ($this->owner instanceof Page) {
          $selected = ($this->owner->template->id === $template->id) ? "selected='selected'" : "";
        } else {
          $selected = "";
        }
        $out .= "<option value='$template->id' $selected>$template->name</option>";
      }
    }
    $out .= "</select>";

    return $out;
  }

  public function setOwner($owner)
  {
    if ($owner instanceof Template) {
      $this->owner = $owner;  
      $this->attr('data-clone-to', $this->owner->id);
      $this->attr('data-clone-to-type', Widget::ownerTypeTemplate);
    } else if ($owner instanceof Page) {
      $this->owner = $owner;
      $this->attr('data-clone-to', $this->owner->id);
      $this->attr('data-clone-to-type', Widget::ownerTypePage);
    } else {
      throw new WireExceprion('Wrong type of owner.');
    }
  }

}