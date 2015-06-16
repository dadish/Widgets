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
    $out = "";
    $table = $this->modules->get('MarkupAdminDataTable');
    $table->setEncodeEntities(false);
    $table->setSortable(false);
    $table->headerRow(array(
      '',
      $this->_('Media (min)'),
      $this->_('Media (max)'),
      $this->_('Span'),
      $this->_('Clear'),
      //$this->_('Mixins'),
      $this->_('Extra CSS'),
      $this->_('Remove')
      ));

    $breakpoints = $this->widget->breakpoints();

    foreach ($breakpoints as $brk) {
      $brk = $brk->getArray();
      $arr = array();

      $arr[] = wireIconMarkup('arrows', 'breakpointSort');

      // Media
      if ($brk['data']['media'] === 'default') {
        $media = "Default";
        $arr[] = $media;
        $arr[] = "";
      } else {
        $media = "<input class='breakpointMedia breakpointMediaMin' type='text' size='10' value='". $brk['data']['media'][0] ."'/>";
        $arr[] = $media;
        $media = "<input class='breakpointMedia breakpointMediaMax' type='text' size='10' value='". $brk['data']['media'][1] ."'/>";
        $arr[] = $media;
      }
      
      // Span
      $span = "<input class='breakpointSpan breakpointSpanNumerator' type='text' size='2' value='". $brk['data']['span'][0] ."'>"; 
      $span .= " of "; 
      $span .= "<input class='breakpointSpan breakpointSpanDenominator' type='text' size='2' value='". $brk['data']['span'][1] ."'>";
      $arr[] = $span;

      // Clear
      $clear = $this->modules->get('InputfieldSelect');
      $clear->name = 'breakpointClear';
      $clear->required = true;
      $clear->attr('value', $brk['data']['clear']);
      $clear->attr('class', 'breakpointClear');
      $clear->addOptions(Breakpoint::getClearOptions());
      $arr[] = $clear->render();

      // Mixins
//      $mixins = $this->modules->get('InputfieldAsmSelect');
//      $mixins->name = 'breakpointMixins_' . $this->widget->id;
//      $mixins->attr('class', 'breakpointMixins');
//      $mixins->addOptions(Breakpoint::getMixinOptions());
//      $arr[] = $mixins->render();

      // Extra
      $arr[] = "<a class='customCss' href='#' data-text-open='". $this->_('Close') ."' data-text-close='". $this->_('Edit') ."'>". $this->_('Edit') ."</a>";

      // Remove
      if ($brk['data']['media'] === 'default') $remove = "";
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
    $this->attr('id', $this->className() . "_" . $this->widget->id);
    return $this;
  }
}