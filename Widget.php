<?php

/**
 * A widget.
 * 
 * @property int $owner The page or template that this widget is assigned to.
 * @property int $ownerType The type of the owner. It can be either a Page or a Template.
 * @property string $renderPages The pages that are rendered by this widget. The widget will end up using data from these pages to build it's markup
 * @property int $parent Parent widget. Default = 0;
 * @property string $class Class/es that will be rendered with the XHTML output.
 *
 * @todo add a sort method for renderPages
 * @todo add a sort method for childWidgets
 */

class Widget extends WireData{

  const ownerTypePage = 1;
  const ownerTypeTemplate = 2;

  /**
   * A quick reference to the widgets module
   * 
   */
  protected $widgets;

  /**
   * Pages that are to be rendered by this widget
   * 
   */
  protected $renderPages;

  /**
   * Widget breakpoints.
   * 
   */
  protected $breakpoints;

  /**
   * Additional options that any widget can accept
   * 
   */
  protected $options;


  public function __construct()
  {
    parent::__construct();

    $this->widgets = $this->modules->get('Widgets');
    $this->renderPages = new PageArray();
    $this->renderPages->setTrackChanges();
    $this->breakpoints = new BreakpointArray();
    $this->breakpoints->setTrackChanges();
    $this->options = new WireData();
    $this->options->setTrackChanges();

    $this->set('id', null);
    $this->set('parent', 1);
    $this->set('owner', null);
    $this->set('ownerType', self::ownerTypeTemplate);
    $this->set('class', $this->className);
    $this->setTrackChanges();
  }

  public function __set($key, $value)
  {
    switch ($key) {
      case 'ownerType':
        if (
          $value == self::ownerTypePage ||
          $value == self::ownerTypeTemplate 
        ) {
          foreach ($this->children() as $child) $child->$key = $value;
          return $this->set($key, $value);
        } else {
          throw new WireException("Wrong value for ownerType `$ownerType`");
        }
        break;

      case 'owner':
        $v = null;
        if ($value instanceof Template || $value instanceof Page) $v = $value->id;
        if (is_null($v)) $v = (integer) $value;
        foreach ($this->children() as $child) $child->$key = $v;
        return $this->set($key, $v);
        break;

      case 'parent':
        if ($value instanceof Widget) {
          if ($value->isNew()) throw new WireException("The widget `$value` should be saved to database first before being assigned as a parent.", 1);
          $value = $value->id;
        }
        if ($value == 1) return $this->set($key, (integer) $value);
        $v = $this->widgets->get($value);
        if (!$v instanceof Widget) throw new WireException("Wrong widget `$value` as a parent.");
        return $this->set($key, $v->id);
        break;

      case 'class':
        throw new WireException("Use addClass() or removeClass() methods to modify class property.");
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
        $ownerId = $this->get($key);
        if (is_null($ownerId)) return $ownerId;
        if ($this->ownerType == self::ownerTypeTemplate) {
          $owner = $this->templates->get($ownerId);
          if ($owner instanceof Template) return $owner;
          else return $this->pages->get($ownerId);
        } else {
          return $this->pages->get($ownerId);
        }
        break;

      case 'parent':
        $parentId = $this->get($key);
        if ($parentId === 1) {
          $parent = new Widget();
          $parent->id = 1;
          return $parent;
        }
        return $this->widgets->get($parentId);
        break;
      
      default:
        return parent::__get($key);
        break;
    }
  }

  public function reportIfErrors()
  {
    if (is_null($this->get('owner'))) throw new WireException("Please set owner property before saving into db.");
    $incompatible = "Incompatible pair of owner and ownerType property values. Owner: `$this->owner`. OwnerType: `$this->ownerType`.";
    if ($this->ownerType == self::ownerTypeTemplate) {
      if ($this->owner instanceof Template) return;
      else throw new WireException($incompatible);
    } else {
      if ($this->owner instanceof NullPage) throw new WireException("The owner cannot be NullPage. Check if you asigned a correct value for owner property. The current value is " . $this->get('owner'));      
    }
  }

  public function children()
  {
    return $this->widgets->find("parent=$this");
  }

  public function addClass($class)
  {
    $class = (string) $class;
    $classes = explode(' ', $this->class);
    if (strpos($class, ' ') !== false) $class = split(' ', $class);
    else $class = (array) $class;
    foreach ($class as $c) {
      if (!in_array($c, $classes)) $classes[] = $c;
    }
    $this->set('class', implode(' ', array_unique($classes)));
  }

  public function removeClass($class)
  {
    $class = (string) $class;
    $classes = split(' ', $this->class);
    if (strpos($class, ' ') !== false) $class = split(' ', $class);
    else $class = (array) $class;
    foreach ($class as $c) {
      $index = array_search($c, $classes);
      if ($index !== false) $classes = array_splice($classes, $index, 1);
    }
    $this->set('class', implode(' ', $classes));
  }

  public function addRender($page)
  {
    if(is_array($page) && WireArray::iterable($page)) {
      $items = $page;
    } else {
      $items = new PageArray();
      $items->add($page);
    }
    $this->renderPagesCache->import($items);
    return $this;
  }

  public function removeRender($page)
  {
    if(is_array($page) && WireArray::iterable($page)) {
      $items = $page;
    } else {
      $items = new PageArray();
      $items->add($page);      
    }
    foreach ($items as $item) $this->renderPagesCache->remove($item);
    return $this;
  }

  public function render()
  {
    $html = "<div class='$this->class' id='$this->id'>";
    if ($this->children()->count()) {
      foreach ($this->children() as $child) {
        $html .= $child->render();
      }
    } else {
      $html .= $this->getTemplateFile()->render();
    }
    $html .= "</div>";
    return $html;
  }

  public function css()
  {
    $className = $this->className();
    return wireRenderFile($this->config->paths->$className . "$className.css");
  }

  public function getArray()
  {
    $data = array();
    if (!$this->isNew()) $data['id'] = $this->id;
    $data['owner'] = $this->owner->id;
    $data['ownerType'] = $this->ownerType;
    $data['parent'] = $this->parent->id;
    $data['renderPages'] = (string) $this->renderPages;
    $data['breakpoints'] = $this->breakpoints->getArray();
    $data['breakpointsString'] = (string) $this->breakpoints;
    $data['class'] = $this->class;
    $data['options'] = $this->options->getArray();
    return $data;
  }

  public function setArray(array $data)
  {
    if (isset($data['id'])) $this->id = $data['id'];
    if (isset($data['owner'])) $this->owner = $data['owner'];
    if (isset($data['ownerType'])) $this->ownerType = $data['ownerType'];
    if (isset($data['parent'])) $this->parent = $data['parent'];
    if (isset($data['renderPages'])) foreach ($this->pages->find("id=" . $data['renderPages']) as $p) $this->addRender($p);
    if (isset($data['class'])) $this->addClass($data['class']);
    if (isset($data['breakpoints'])) $this->breakpoints->populate($data['breakpoints']);
    if (isset($data['options'])) $this->options->setArray($data['options']);
    return $this;
  }

  public function isChanged($what = '')
  {
    foreach (array('breakpoints', 'renderPages', 'options') as $subObject) {
      if ($this->$subObject->isChanged($what)) return true;
    }
    return parent::isChanged($what);
  }

  public function isNew() {
    return ! (boolean) $this->id; 
  }

  public function save()
  {
    return $this->widgets->save($this);
  }

  protected function setTemplateVariables($templateFile)
  {
    $templateFile->set('renderPages', $this->renderPages);
    $templateFile->set('options', $this->options);
    return $templateFile;
  }

  protected function getMarkupsPath()
  {
    $className = $this->className();
    return $this->config->paths->$className . "markups/";
  }

  protected function getTemplateFile()
  {
    $templateName = ($this->ownerType == self::ownerTypeTemplate) ? $this->owner->name : $this->owner->template->name;
    $file = $this->getMarkupsPath() . "$templateName.php";
    if (!is_file($file)){
      $file = $this->getMarkupsPath() . "default.php";
    }
    return $this->setTemplateVariables(new TemplateFile($file));
  }

  public function getOptionsForm ()
  {
    $this->modules->get('JqueryCore');
    $this->modules->get('JqueryUI');

    $form = $this->modules->get('InputfieldForm');
    $form->attr('id', "widget_form_$this->id");
    $field = $this->modules->get('InputfieldPageListSelectMultiple');
    $field->name = "renderPages";
    $form->add($field);
    return $form;
  }

  public function processOptions(array $options)
  {
    
  }

  public function __debugInfo()
  {
    $info = parent::__debugInfo();
    $info['data']['owner'] = $this->owner->__debugInfo();
    return $info;
  }

  public function __toString()
  {
    if (!$this->isNew()) $this->id;
    return parent::__toString();
  }
}