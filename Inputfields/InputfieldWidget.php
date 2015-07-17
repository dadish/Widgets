<?php

class InputfieldWidget extends InputfieldTextarea {

  protected $widget = null;

  const asterisk = '<i class="fa fa-asterisk fa-spin"></i>';

  public function __construct($widget = null)
  {
    parent::__construct();
    if (!is_null($widget) && $widget instanceof Widget) $this->setWidget($widget);
  }

  public function ___render() {
    $wrap = new InputfieldWrapper();

    // Determine if this widget is going to be a container
    // If WidgetContainer is installed and
    // If the widget is a container then it is a container
    $container = $this->modules->has('WidgetContainer') && $this->widget->className() == 'WidgetContainer';

    // WidgetType
    $field = $this->modules->get('InputfieldSelect');
    $field->name = 'widgetType';
    $field->label = $this->_('Widget Type');
    $field->attr('id', 'widgetType_' . $this->widget->id);
    $field->required = true;
    $field->columnWidth = 30;
    $widgetTypes = array();
    foreach ($this->modules->findByPrefix('Widget') as $module) {
      $title = $module::getModuleInfo()['title'];
      if ($title === 'Widgets') continue;
      $widgetTypes[$module] = $title;
    }
    $field->addOptions($widgetTypes);
    $field->attr('value', $this->widget->className());
    $wrap->add($field);

    // Settings button
    $field = new InputfieldWidgetLink();
    $field->setWidget($this->widget);
    $field->name = 'widgetSettings';
    $field->attr('href', $this->config->urls->admin . 'setup/widgets/Settings/?modal=1&id=' . $this->widget->id);
    $field->label = $this->_('Settings');
    $field->columnWidth = 30;
    $wrap->add($field);

    $field = new InputfieldWidgetLink();
    $field->setWidget($this->widget);
    $field->name = 'changeParent';
    $field->label = $this->_('Change Parent');
    $field->attr('data-change-str', $field->label);
    $field->attr('data-unchange-str', $this->_('Cancel'));
    $field->message = sprintf($this->_('Choose the place where you want to move this widget. The allowed places is indicated as %1$s Put Here %2$s'), "<a class='changeParentIndicator'>" . self::asterisk, self::asterisk . "</a>");
    $field->columnWidth = 40;
    $wrap->add($field);

    // Prepare breakpoints
    $breakpoints = new InputfieldBreakpoints($this->widget);
    $breakpoints->setWidget($this->widget);
    $wrap->add($breakpoints);

    // Add widgets container if it is a container
    if ($container) {
      $container = new InputfieldWidgets();
      $container->setWidget($this->widget);
      foreach ($this->widget->children() as $childWidget) $container->add($childWidget);
      $wrap->add($container);
    }

    return parent::___render() . $wrap->render();
  }

  public function setWidget(Widget $widget)
  {
    $this->widget = $widget;

    $label = "<span class='InputfieldWidgetDragZone'>";
    $label .= wireIconMarkup('cube'); 
    $label .= " <span class='InputfieldWidgetHeaderText'>". $this->widget->className() . "</span>";
    $label .= " <span class='InputfieldWidgetHeaderId'>id: ". $this->widget->id ."</span>";
    $label .= " <span class='InputfieldWidgetHeaderMeta'>". $this->widget->getLabelMeta() ."</span>";
    $label .= "</span>";
    $this->label = $label;
    $arr = $this->widget->getArray();
    $this->attr('value', json_encode($arr));
    $this->name = $this->widget->id;

    return $this;
  }
}