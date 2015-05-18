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

  const ownerTypePage = 0;
  const ownerTypeTemplate = 1;
  const ownerTypeAncestor = 2;

  /**
   * Initialized renderPages.
   * Sort of a cache so we do not instantiate it just once per instance.
   * 
   */
  protected $renderPagesCache;

  /**
   * Children Widgets
   * 
   */
  protected $childrenCache;

  /**
   * A quick reference to all widgets
   * 
   */
  protected $widgets;


  public function __construct()
  {
    parent::__construct();
    $this->set('id', null);
    $this->set('owner', null);
    $this->set('ownerType', self::ownerTypeTemplate);
    $this->set('renderPages', '');
    $this->set('parent', 1);
    $this->set('class', $this->className);
    $this->set('grid', '');
    $this->set('options', new WireData());
    $this->renderPagesCache = new PageArray();
    $this->widgets = $this->modules->get('Widgets');
    $this->setTrackChanges();
  }

  public function __set($key, $value)
  {
    switch ($key) {
      case 'ownerType':
        if (
          $value == self::ownerTypePage ||
          $value == self::ownerTypeTemplate ||
          $value == self::ownerTypeAncestor
        ) {
          $this->children->setOwnerType($value);
          return $this->set($key, $value);
        } else {
          throw new WireException("Wrong value for ownerType `$ownerType`");
        }
        break;

      case 'owner':
        $v = null;
        if ($value instanceof Template || $value instanceof Page) $v = $value->id;
        if (is_null($v)) $v = (string) $value;
        $this->children->setOwner($v);
        $this->set($key, $v);
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

      case 'renderPages':
        throw new WireException("Use addRender(), removeRender() methods to modify renderPages property.");
        break;

      case 'class':
        throw new WireException("Use addClass() or removeClass() methods to modify class property.");
        break;

      case 'children':
        throw new WireException("Use add() or remove() methods to modify children property.");
        break;

      case 'options':
        throw new WireException("You cannot change the `$key` property.");
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

      case 'renderPages':
        return $this->renderPagesCache;
        break;

      case 'parent':
        $parentId = $this->get($key);
        if ($parentId === 1) {
          $parent = new Widget();
          $parent->id = 1;
          return $parent;
        }
        return $this->widgets->get($this->get($key));
        break;

      case 'children':
        return $this->getChildren();
        break;
      
      default:
        return parent::__get($key);
        break;
    }
  }

  public static function reportIfErrors(Widget $widget)
  {
    if (is_null($widget->get('owner'))) throw new WireException("Please set owner property before saving into db.");
    $incompatible = "Incompatible pair of owner and ownerType property values. Owner: `$widget->owner`. OwnerType: `$widget->ownerType`.";
    if ($widget->ownerType == self::ownerTypeTemplate) {
      if ($widget->owner instanceof Template) return;
      else throw new WireException($incompatible);
    } else {
      if ($widget->owner instanceof NullPage) throw new WireException("The owner cannot be NullPage. Check if you asigned a correct value for owner property. The current value is " . $widget->get('owner'));      
    }
  }

  protected function getChildren()
  {
    if ($this->childrenCache instanceof WidgetChildrenArray) return $this->childrenCache;
    $this->childrenCache = new WidgetChildrenArray();
    return $this->childrenCache;
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
    $this->set('renderPages', (string) $this->renderPagesCache);
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
    $this->set('renderPages', (string) $this->renderPagesCache);
    return $this;
  }

  public function add(Widget $child)
  {
    if ($this->isNew()) throw new WireException("You should save widget into database before adding child widgets to it.");
    if ($this->children->has($child)) return $this;
    $this->children->add($child);
    $child->parent = $this;
    return $this;
  }

  public function remove($key)
  {
    if ($this->children->has($key)) {
      $child->set('parent', null);
      return $this->children->remove($child);      
    }
    return parent::remove($key);
  }

  public function render()
  {
    $html = "<div class='$this->class' id='$this->id'>";
    if ($this->children->count()) {
      foreach ($this->children as $child) {
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
    $data['renderPages'] = $this->get('renderPages');
    $data['grid'] = $this->grid;
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
    if (isset($data['grid'])) $this->grid = $data['grid'];
    if (isset($data['options'])) $this->options->setArray($data['options']);
    return $this;
  }

  public function isNew() {
    return ! (boolean) $this->id; 
  }

  public function save()
  {
    if ($this->children->count()) foreach ($this->children as $child) $child->save();
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

  public function __debugInfo()
  {
    $info = parent::__debugInfo();
    $info['data']['owner'] = $this->owner->__debugInfo();
    return $info;
  }
}