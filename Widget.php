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
 * @todo Rename addRenderPage and removeRenderPage methods to addRender and removeRender
 *       Make sure these methods accepts single Page and PageArrays too and keeps the 
 *       renderPages a flat PageArray.
 */

abstract class Widget extends WireData{

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


  public function __construct($owner, $ownerType)
  {
    require_once($this->config->paths->Widgets . "WidgetsArray.php");
    $this->set('owner', null);
    $this->set('ownerType', null);
    $this->set('renderPages', '');
    $this->set('parent', 0);
    $this->set('class', $this->className);
    $this->set('options', new WireData());
    $this->ownerType = $ownerType;
    $this->owner = $owner;

    $this->renderPagesCache = new PageArray();
    $this->widgets = $this->modules->get('Widgets');
  }

  public function __set($key, $value)
  {
    switch ($key) {
      case 'owner':
        if ($this->ownerType == self::ownerTypeTemplate) {
          $v = $this->templates->get("$value");
          if ($v instanceof Template) $this->set($key, $v->id);
          else throw new WireException("Wrong template $value for owner property.");
        } else {
          $v = $this->pages->get("$value");
          if (!$v instanceof NullPage) $this->set($key, $v->id);
          else throw new WireException("Wrong page $value for owner property.");
        }
        break;

      case 'ownerType':
        if (
          $value == self::ownerTypePage ||
          $value == self::ownerTypeTemplate ||
          $value == self::ownerTypeAncestor
        ) {
          return $this->set($key, $value);
        } else {
          throw new WireException("Wrong type of ownerType: $value");
        }
        break;

      case 'renderPages':
        throw new WireException("Use addRenderPage(), removeRenderPage() methods to modify renderPages property.");
        break;

      case 'parent':
        $v = $this->widgets->get($value);
        if (!$v instanceof Widget) throw new WireException("Wrong widget: $value as a parent.");
        return $this->set($key, $v->id);
        break;

      case 'class':
        throw new WireException("Use addClass() or removeClass() methods to modify class property.");
        break;

      case 'children':
        throw new WireException("You cannot change the children property.");
        break;

      case 'options':
        if ($value instanceof WireData) {
          $this->set($key, $value);
        } else {
          throw new WireException("Widget options property should be WireData instance.");
        }
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
        return ($this->ownerType == self::ownerTypeTemplate) ? $this->templates->get($key) : $this->pages->get($key);
        break;

      case 'renderPages':
        return $this->renderPagesCache;
        break;

      case 'parent':
        return $this->widgets->get($this->get('parent'));
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
    if ($this->childrenCache instanceof WidgetsChildrenArray) return $this->childrenCache;
    $this->childrenCache = new WidgetsChildrenArray();
    $this->childrenCache->ownerType = $this->ownerType;
    $this->childrenCache->owner = $this->owner;
    return $this->childrenCache;
  }

  public function add(Widget $child)
  {
    $this->children->append($child);
    return $this;
  }

  public function remove(Widget $child)
  {
    $this->children->remove($child);
    return $this;
  }

  public function addClass(string $class)
  {
    $classes = split(' ', $this->class);
    if (strpos($class, ' ') !== false) $class = split(' ', $class);
    else (array) $class;
    foreach ($class as $c) {
      if (!in_array($c, $classes)) $classes[] = $c;
    }
    $this->set('class', implode(' ', $classes));
  }

  public function removeClass(string $class)
  {
    $classes = split(' ', $this->class);
    if (strpos($class, ' ') !== false) $class = split(' ', $class);
    else (array) $class;
    foreach ($class as $c) {
      $index = array_search($c, $classes);
      if ($index !== false) $classes = array_splice($classes, $index, 1);
    }
    $this->set('class', implode(' ', $classes));
  }

  public function addRenderPage(Page $page)
  {
    $this->renderPagesCache->append($page);
    return $this;
  }

  public function removeRenderPage(Page $page)
  {
    $this->renderPagesCache->remove($page);
    return $this;
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
    $data['renderPages'] = (string) $this->renderPages;
    $data['parent'] = $this->parent;
    $data['class'] = $this->class;
    return $data;
  }

  public function setArray($data)
  {
    if ($data['id']) $this->id = $data['id'];
    if ($data['ownerType']) $this->ownerType = $data['ownerType'];
    if ($data['owner']) $this->owner = $data['owner'];
    if ($data['renderPages']) {
      foreach ($this->pages->find("id=" . $data['renderPages']) as $p) {
        $this->addRenderPage($p);
      }
    }
    if ($data['class']) $this->addClass($data['class']);
    return $this;
  }

  public function isNew() {
    return (boolean) $this->id; 
  }

  public function save()
  {
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