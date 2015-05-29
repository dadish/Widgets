<?php

class InputfieldWidgets extends Inputfield implements InputfieldItemList{

  protected $widget;

  protected $widgets;

  protected $form;

  protected $unsavedWidgetCount = 0;

  public function __construct()
  {
    parent::__construct();
    $this->widgets = new WidgetArray();    
  }
  
  public function add(Widget $widget)
  {
    $this->widgets->add($widget);
  }

  public function ___render()
  {
    $out = "<a href='#' class='InputfieldWidgetsAddLink' id='InputfieldWidgetsAddLink_". $this->widget->id ."'><i class='fa fa-plus-circle'></i> Add Widget</a>";
    return $this->renderWidgets() . $out;
  }

  protected function renderWidgets()
  {
    $cnt = 1;
    $out = "<ul class='Inputfields InputfieldsWidgets InputfieldsWidgets_". $this->widget->id ."' data-id='". $this->widget->id ."'>";
    foreach ($this->widgets as $widget) {
      $out .= self::renderWidget($widget, $cnt);
      $cnt++;
    }
    $out .= "</ul>";
    return $out;
  }

  public static function renderWidget(Widget $widget)
  {
    $InputfieldWidget = new InputfieldWidget($widget);
    $out = "<li class='Inputfield InputfieldWidget InputfieldWidgetsItem' data-id='$widget->id'>";
    $out .= "<label class='InputfieldHeader InputfieldWidgetHeader InputfieldStateToggle' for='id: $widget->id'>";
    $out .= $InputfieldWidget->label;
    $out .= "<i class='toggle-icon fa fa-angle-down' data-to='fa-angle-down fa-angle-right' style='color: rgb(20, 144, 184);'></i>";
    $out .= wireIconMarkup('trash', 'InputfieldWidgetDelete');
    $out .= "</label>";
    $out .= "<div class='InputfieldContent'>";
    $out .= $InputfieldWidget->render();
    $out .= "</div>";
    $out .= "</li>";
    return $out;
  }

  public function setWidget(Widget $widget)
  {
    $this->widget = $widget;
    
    $this->name = "widgets_" . $this->widget->id;
    $this->label = $this->_('Widgets');

    return $this;
  }

}