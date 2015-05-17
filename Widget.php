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
    require_once($this->config->paths->Widgets . "WidgetsArray.php");
    $this->set('id', null);
    $this->set('owner', null);
    $this->set('ownerType', null);
    $this->set('renderPages', '');
    $this->set('parent', 0);
    $this->set('class', $this->className);
    $this->set('grid', '');
    $this->set('options', new WireData());
    $this->renderPagesCache = new PageArray();
    $this->widgets = $this->modules->get('Widgets');
  }

  public static function sanitizeOwner($owner, $object)
  {
    if (is_null($object->ownerType)) {
      // Try to find template first
      $v = $object->templates->get($owner);
      if (is_null($owner)) {
        $v = $object->pages->get($owner);
        if ($v instanceof NullPage) {
          throw new WireException("Couldn't find the owner object: $owner. With ownerType `$object->ownerType`.");
        }
      }
    } else if ($object->ownerType == self::ownerTypeTemplate) {
      $v = $object->templates->get($owner);
      if (is_null($v)) throw new WireException("Incompatible pair of owner `$owner` and ownerType `ownerTypeTemplate`");
    } else if ($object->ownerType == self::ownerTypePage || $object->ownerType == self::ownerTypeAncestor) {
      $v = $object->pages->get($owner);
      $ownerType = ($object->ownerType == self::ownerTypePage) ? 'ownerTypePage' : 'ownerTypeAncestor';
      if ($v instanceof NullPage) throw new WireException("Incompatible pair of `$owner` and ownerType `$ownerType`");
    } else {
      throw new WireException("You shouldn't event get this exception. You somehow managed to set wrong value for ownerType `$object->ownerType`. How the hell did you do that!?");
    }
    return $v;
  }

  public static function sanitizeOwnerType($ownerType, $object)
  {
    if (is_null($object->owner)) {
      if ($ownerType == self::ownerTypeTemplate) return self::ownerTypeTemplate;
      if ($ownerType == self::ownerTypePage) return self::ownerTypePage;
      if ($ownerType == self::ownerTypeAncestor) return self::ownerTypeAncestor;      
    } else if ($object->owner instanceof Template) {
      if ($ownerType == self::ownerTypeTemplate) return self::ownerTypeTemplate;
    } else if ($object->owner instanceof Page) {
      if ($ownerType == self::ownerTypePage) return self::ownerTypePage;
      if ($ownerType == self::ownerTypeAncestor) return self::ownerTypeAncestor;      
    } else {
      throw new WireException("You shouldn;t even get this exception. You somehow managed to set wrond value for owner `$object->owner`. How the hell did you do that!?");
    }
    throw new WireException("Wrong value for ownerType `$ownerType`");
  }

  public function __set($key, $value)
  {
    switch ($key) {
      case 'owner':
        $v = self::sanitizeOwner($value, $this);
        $this->children->owner = $v->id;
        return $this->set($key, $v->id);
        break;

      case 'ownerType':
        $v = self::sanitizeOwnerType($value, $this);
        $this->children->ownerType = $v;
        return $this->set($key, $v->id);
        break;

      case 'parent':
        if ($value instanceof Widget) {
          if ($value->isNew()) throw new WireException("The widget `$value` should be saved to database first before being assigned as a parent.", 1);
          $value = $value->id;
        }
        if ($value == 0) return $this->set($key, $value);
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
        return ($this->ownerType == self::ownerTypeTemplate) ? $this->templates->get($this->get($key)) : $this->pages->get($this->get($key));
        break;

      case 'renderPages':
        return $this->renderPagesCache;
        break;

      case 'parent':
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

  protected function getChildren()
  {
    if (is_null($this->owner)) throw new WireException("Please set owner property before getting, adding or removing child widgets.");
    if (is_null($this->ownerType)) throw new WireException("Please set ownerType property before getting, adding or removing child widgets.");
    if ($this->childrenCache instanceof WidgetsChildrenArray) return $this->childrenCache;
    $this->childrenCache = new WidgetsChildrenArray();
    $this->childrenCache->ownerType = $this->ownerType;
    $this->childrenCache->owner = $this->owner;
    return $this->childrenCache;
  }

  public function addClass(string $class)
  {
    $classes = split(' ', $this->class);
    if (strpos($class, ' ') !== false) $class = split(' ', $class);
    else $class = (array) $class;
    foreach ($class as $c) {
      if (!in_array($c, $classes)) $classes[] = $c;
    }
    $this->set('class', implode(' ', array_unique($classes)));
  }

  public function removeClass(string $class)
  {
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
    if(is_array($items) && self::iterable($items) && $page instanceof WireArray) {
      $this->renderPagesCache->import($page);
      return $this;
    }
    if ($this->renderPagesCache->has($page)) return $this;
    $this->renderPagesCache->add($page);
    return $this;
  }

  public function removeRender($page)
  {
    if(is_array($items) && self::iterable($items) && $page instanceof WireArray) {
      foreach ($page as $p) $this->renderPagesCache->remove($p);
      return $this;
    }
    $this->renderPagesCache->remove($page);
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
    $data['renderPages'] = (string) $this->renderPages;
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
    if (isset($data['options'])) $this->options->setArray();
    return $this;
  }

  public function isNew() {
    return ! (boolean) $this->id; 
  }

  public function save()
  {
    if ($this->children->count()) foreach ($this->children as $child) $child->save();
    $this->widgets->save($this);
    return $this;
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
}