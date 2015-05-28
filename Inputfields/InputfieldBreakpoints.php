<?php

class InputfieldBreakpoints extends InputfieldTextarea {

  protected $widget;

  public function __construct($widget = null)
  {
    parent::__construct();
    if (!is_null($widget)) $this->setWidget($widget);
    $this->label = $this->_('Breakpoints');
  }

  public function ___render() {
    $this->attr('id', $this->className() . "_" . $this->widget->id);

    $out = "";
    $table = $this->modules->get('MarkupAdminDataTable');
    $table->setEncodeEntities(false);
    $table->headerRow(array(
      $this->_('Media'),
      $this->_('Span'),
      $this->_('Clear'),
      $this->_('Remove')
      ));

    $breakpoints = $this->widget->getArray()['breakpoints'];
    foreach ($breakpoints as $brk) {
      $arr = array();
      // Media
      if ($brk['media'] === 'default') $media = "Default";
      else $media = "<input class='breakpointMedia' type='text' size='10' value='". $brk['media'] ."'/>";
      $arr[] = $media;

      // Span
      $span = "<input class='breakpointSpan breakpointSpanNumerator' type='text' size='2' value='". $brk['span'][0] ."'>"; 
      $span .= " of "; 
      $span .= "<input class='breakpointSpan breakpointSpanDenominator' type='text' size='2' value='". $brk['span'][1] ."'>";
      $arr[] = $span;

      // Clear
      $clear = "<select class='breakpointClear'>";
      foreach (array('none', 'left', 'right', 'both') as $clr) $clear .= "<option value='$clr'>$clr</option>";
      $clear .= "</select>";
      $arr[] = $clear;

      // Remove
      if ($brk['media'] === 'default') $remove = "";
      else $remove = "<a class='remove' href='#'><i class='fa fa-trash'></i></a>";
      $arr[] = $remove;

      $table->row($arr);
    }

    $out .= $table->render();
    $out .= "<a class='addBreakpointButton' href='#'><i class='fa fa-plus-circle'></i> Add Breakpoint</a>";
    return $out;
  }

  public function setWidget(Widget $widget)
  {
    $this->widget = $widget;
    return $this;
  }
}