<?php
/**
 * A widget.
 * 
 * @property int $owner The page or template that this widget is assigned to.
 * @property int $ownerType The type of the owner. It can be either a Page or a Template.
 * @property PageArray $renderPages The pages that are rendered by this widget. The widget will end up using data from these pages to build it's markup
 * @property int $parent Parent widget. Default = 0;
 * @property string $class Class/es that will be rendered with the XHTML output.
 *
 * @todo look for ProcessModules on how to handle widget settings properly
 */

class Widget extends WireData{

  const ownerTypePage = 1;
  const ownerTypeTemplate = 2;

  /**
   * A quick reference to the necessary modules
   * 
   */
  protected $widgets;

  protected $breakpoints;

  /**
   * Pages that are to be rendered by this widget
   * 
   */
  protected $renderPages;

  /**
   * Additional settings for this widget
   * 
   */
  protected $settings;


  public function __construct()
  {
    parent::__construct();

    $this->widgets = $this->modules->get('Widgets');
    $this->breakpoints = $this->modules->get('Breakpoints');
    $this->renderPages = new PageArray();
    $this->settings = new WireData();

    $this->set('id', null);
    $this->set('parent', 1);
    $this->set('owner', null);
    $this->set('ownerType', self::ownerTypeTemplate);
    $this->set('class', '');
    $this->set('sort', null);
    $this->resetTrackChanges();
  }

  public function __set($key, $value)
  {
    switch ($key) {
      case 'id':
      case 'sort':
        return $this->set($key, (integer) $value);
        break;
      case 'ownerType':
        $value = (integer) $value;
        if (
          $value == self::ownerTypePage ||
          $value == self::ownerTypeTemplate 
        ) {
          foreach ($this->children() as $child) $child->$key = $value;
          return $this->set($key, (integer) $value);
        } else {
          throw new WireException("Wrong value for ownerType `$value`");
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
        return $this->widgets->get($parentId);
        break;

      case 'class':
        return trim($this->get($key));
        break;
      
      default:
        return parent::__get($key);
        break;
    }
  }

  public function children()
  {
    return $this->widgets->find("parent=$this, sort=sort");
  }

  public function breakpoints()
  {
    $breakpoints = $this->breakpoints->find("widget=$this, sort=sort");
    if (!$breakpoints->count()) {
      $this->breakpoints->fetchAllForWidget($this->id);
      $breakpoints = $this->breakpoints->find("widget=$this, sort=sort");
    }
    return $breakpoints;
  }

  public function addClass($class)
  {
    $class = (string) $class;
    $classes = explode(' ', $this->class);
    if (strpos($class, ' ') !== false) $class = explode(' ', $class);
    else $class = (array) $class;
    foreach ($class as $c) {
      if (!in_array($c, $classes)) $classes[] = $c;
    }
    $this->set('class', implode(' ', array_unique($classes)));
  }

  public function removeClass($class)
  {
    $class = (string) $class;
    $classes = explode(' ', $this->class);
    if (strpos($class, ' ') !== false) $class = explode(' ', $class);
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
    $this->renderPages->import($items);
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
    foreach ($items as $item) $this->renderPages->remove($item);
    return $this;
  }

  public function render()
  {
    $prefix = $this->widgets->prefix;
    $className = $this->className();
    $classNameInner = $className . 'Inner';
    $this->addClass($className);
    $this->addClass($prefix);
    $this->addClass($prefix . $this->id);
    $html = "<div class='$this->class'>";
    $html .= "<div class='$classNameInner wgts-inner'>";
    if ($this->children()->count()) {
      foreach ($this->children() as $child) {
        $html .= $child->render();
      }
    } else {
      $html .= $this->getTemplateFile()->render();
    }
    $html .= "</div></div>";
    return $html;
  }

  protected function getCssFile()
  {
    $className = $this->className();
    $filename = $this->config->paths->$className . "$className.css";
    if (!is_file($filename)) return false;
    return new TemplateFile($filename);
  }

  public function css()
  {
    $css = $this->getCssFile();
    if ($css === false) return '';
    $css = $this->setVariables($css);
    return $css->render();
  }

  public function breakpointsCss()
  {
    return (string) $this->breakpoints();
  }

  public function getArray($withBreakpoints = true)
  {
    $arr = array();
    if (!$this->isNew()) $arr['id'] = $this->id;
    $arr['owner'] = $this->owner->id;
    $arr['ownerType'] = $this->ownerType;
    $arr['parent'] = $this->parent->id;
    $arr['sort'] = $this->sort;
    $data = array();
    $data['renderPages'] = (string) $this->renderPages;
    $data['class'] = $this->class;
    $data['className'] = $this->className();
    $data['settings'] = $this->settings->getArray();
    $arr['data'] = $data;
    if ($withBreakpoints) $arr['breakpoints'] = $this->breakpoints()->getArray();
    return $arr;
  }

  public function setArray(array $arr)
  {
    if (isset($arr['id'])) $this->id = $arr['id'];
    if (isset($arr['owner'])) $this->owner = $arr['owner'];
    if (isset($arr['ownerType'])) $this->ownerType = $arr['ownerType'];
    if (isset($arr['parent'])) $this->parent = $arr['parent'];
    if (isset($arr['sort'])) $this->sort = $arr['sort'];

    if (isset($arr['data']) && is_array($arr['data'])) {
      $data = $arr['data'];
      if (isset($data['renderPages'])) {
        // Remove all and add new ones.
        // This method is consistent and makes sure
        // the change is detected if happened.
        $this->renderPages->removeAll();
        foreach ($this->pages->find("id=" . $data['renderPages']) as $p) $this->addRender($p);
      }
      if (isset($data['class'])) $this->addClass($data['class']);
      if (isset($data['settings']) && is_array($data['settings'])) {
        // Manually remove all data from settings and set
        // the new ones. This will ensure us that if change is
        // indeed happened then the isChanged method will work
        // properly
        foreach ($this->settings->getArray() as $key => $value) {
          $this->settings->remove($key);
        }
        $this->settings->setArray($data['settings']);
      }
    }
    return $this;
  }

  public function isNew() {
    return ! (boolean) $this->id;
  }

  public function save()
  {
    $this->reportIfErrors();
    return $this->widgets->save($this);
  }

  protected function reportIfErrors()
  {
    // The widget should have an owner object assigned
    if (is_null($this->get('owner'))) throw new WireException("Please set owner property before saving into db.");
    $incompatible = "Incompatible pair of owner and ownerType property values. Owner: `$this->owner`. OwnerType: `$this->ownerType`.";
    if ($this->ownerType == self::ownerTypeTemplate) {
      if ($this->owner instanceof Template) return;
      else throw new WireException($incompatible);
    } else {
      if ($this->owner instanceof NullPage) throw new WireException("The owner cannot be NullPage. Check if you asigned a correct value for owner property. The current value is " . $this->get('owner'));      
    }

    // The widget instance should be one of the ProcessWire module.
    if (!$this->modules->has($this->className())) throw new WireException("The widget should be a ProcessWire module.");
  }

  protected function setVariables($templateFile)
  {
    $templateFile->set('renderPages', $this->renderPages);
    $templateFile->set('settings', $this->settings);
    $templateFile->set('widget', $this);
    $templateFile->set('prefix', $this->widgets->prefix);
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
    return $this->setVariables(new TemplateFile($file));
  }

  public function getSettingsFields ($multipleRenders = true)
  {
    $this->modules->get('JqueryCore');
    $this->modules->get('JqueryUI');
    $fields = new InputfieldWrapper();

    if ($multipleRenders) $inputfield = 'InputfieldPageListSelectMultiple';
    else $inputfield = 'InputfieldPageListSelect';

    $field = $this->modules->get('InputfieldPage');
    $field->inputfield = $inputfield;
    $field->name = "renderPages";

    if ($multipleRenders) $field->label = $this->_('Render Pages');
    else $field->label = $this->_('Render Page');
    
    if ($multipleRenders) $field->description = $this->_('Pages that will be rendered by this widget.');
    else $field->description = $this->_('Page that will be rendered by this widget.');
    $field->attr('value', (string) $this->renderPages);
    $fields->add($field);

    $field = $this->modules->get('InputfieldText');
    $field->name = "class";
    $field->label = $this->_('Class');
    $field->description = $this->_("Additional custom html classes that you would like to add to your widget. \n This widget will get `" . $this->className() . "` class by default.");
    $field->attr('value', str_replace($this->className(), '', $this->class));
    $field->collapsed = Inputfield::collapsedBlank;
    $fields->add($field);
    
    return $fields;
  }

  public function processSettingsFields(InputfieldWrapper $settings)
  {
    // Renew the renderPages property
    $this->renderPages->removeAll();
    $renderPages = $settings->get('renderPages');
    if ($renderPages instanceof InputfieldHasArrayValue) {
      foreach ($renderPages->value as $id) {
        $this->addRender($id);
      }
    } else {
      $this->addRender($renderPages->value);
    }

    // Renew the class property
    $this->set('class', '');
    $this->addClass($settings->get('class')->value);
  }

  public function __debugInfo()
  {
    $arr = array();
    $arr['id'] = (string) $this->id;
    $arr['owner'] = (string) $this->owner;
    $arr['ownerType'] = (string) $this->ownerType;
    $arr['parent'] = (string) $this->parent;
    $arr['sort'] = (string) $this->sort;
    $arr['renderPages'] = (string) $this->renderPages;
    $arr['class'] = (string) $this->class;
    $arr['settings'] = $this->settings->getArray();
    return $arr;
  }

  public function __toString()
  {
    if (!$this->isNew()) return (string) $this->id;
    return parent::__toString();
  }

  public function getLabelMeta()
  {
    $label = "";
    if ($this->renderPages->count()) $label .= " \"" . $this->renderPages->first()->title . "\"";
    if ($this->renderPages->count() > 1) $label .= " and " . ($this->renderPages->count() - 1) . "more...";
    return $label;
  }

  public function setTrackChanges($trackChanges = true)
  {
    parent::setTrackChanges($trackChanges);
    $this->renderPages->setTrackChanges($trackChanges);
    $this->settings->setTrackChanges($trackChanges);
  }

  public function resetTrackChanges($trackChanges = true)
  {
    parent::resetTrackChanges($trackChanges);
    $this->settings->resetTrackChanges($trackChanges);
    $this->renderPages->resetTrackChanges($trackChanges);
  }

  public function isChanged($what = '')
  {
    if ($this->renderPages->isChanged($what)) return true;
    if ($this->settings->isChanged($what)) return true;
    return parent::isChanged($what);
  }

  public static function pageSummary($page, $length = 255, $summary_field = 'summary', $body_field = 'body') {
    if ($page->$summary_field) return $page->$summary_field;
    $intro = mb_substr(strip_tags($page->$body_field), 0, $length); 
    $lastPeriodPos = mb_strrpos($intro, '.'); 
    if($lastPeriodPos !== false) $intro = mb_substr($intro, 0, $lastPeriodPos); 
    return ($intro === '') ? '' : $intro . '...'; 
  }
}