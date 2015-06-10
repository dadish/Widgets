<?php


class Breakpoint extends WireData {

  protected $breakpoints;

  protected $widgets;

  protected $customCss;

  public function __construct()
  {
    parent::__construct();
    $this->set('id', null);
    $this->set('widget', null);
    $this->set('media', null);
    $this->set('span', array(1,1));
    $this->set('clear', 'none');
    $this->set('mixins', array());
    $this->customCss = new WireData();
    $this->resetTrackChanges();
    $this->breakpoints = $this->modules->get('Breakpoints');
    $this->widgets = $this->modules->get('Widgets');
  }

  public function getString($prefix)
  {
    if (is_null($this->widget)) return '';
    $out = "";
    $id = $this->widget;
    $width = $this->span[0] / $this->span[1] * 100;

    // If this breakpoint is not default 
    // then wrap it in a css @media with provided settings
    if ($this->media !== 'default') {
      $out .= "\n@media(min-width:". $this->media[0] ."px) and (max-width:". $this->media[1] ."px){\n";
      $mediaOffset = "  ";
    } else {
      $mediaOffset = "";
      $out .= "\n";
    }

    // Open css rules with prefix and id
    $out .= $mediaOffset . ".$prefix$id {\n";

    // Add default width and clear properties
    $out .= $mediaOffset . "  width : $width%;\n $mediaOffset clear : $this->clear;\n";

    // Add any custom css...
    foreach ($this->customCss->getArray() as $property => $value) {
      $out .= $mediaOffset . "  $property : $value;\n";
    }

    // Close css rules
    $out .= $mediaOffset . "}\n";

    // Close css @media wrap
    if ($this->media !== 'default') $out .= "}\n";

    return $out;
  }

  public function getArray()
  {
    $arr = array();
    if (!$this->isNew()) $arr['id'] = $this->id;
    $arr['widget'] = $this->widget->id;
    $arr['clearOptions'] = self::getClearOptions();
    $arr['mixinOptions'] = self::getMixinOptions();
    $arr['data'] = array(
      'media' => $this->media,
      'span' => $this->span,
      'clear' => $this->clear,
      'mixins' => $this->mixins,
      'customCss' => $this->customCss->getArray()
      );
    return $arr;
  }

  public function setArray(array $arr)
  {
    if(isset($arr['id'])) $this->id = $arr['id'];
    if(isset($arr['widget'])) $this->widget = $arr['widget'];
    
    if(isset($arr['data']) && is_array($arr['data'])) {
      $data = $arr['data'];
      if(isset($data['media'])) $this->media = $data['media'];
      if(isset($data['span'])) $this->span = $data['span'];
      if(isset($data['clear'])) $this->clear = $data['clear'];
      if(isset($data['mixins'])) $this->mixins = $data['mixins'];
      if(isset($data['customCss']) && is_array($data['customCss'])) {
        // Manually remove all data from customCss and set
        // the new ones. This will ensure us that if change is
        // indeed happened then the isChanged method will work
        // properly
        foreach ($this->customCss->getArray() as $key => $value) {
          $this->customCss->remove($key);
        }
        $this->customCss->setArray($data['customCss']);
      }
    }
  }

  public function isChanged($what = '')
  {
    if ($this->customCss->isChanged()) return true;
    return parent::isChanged($what);
  }

  public function getCustom($property)
  {
    return $this->customCss->$property;
  }

  public function addCustom($property = '', $value = null)
  {
    $this->customCss->$property = $value;    
  }

  public function removeCustom($property)
  {
    $this->customCss->remove($property);
  }

  public function __set($key, $value)
  {
    switch ($key) {
      case 'widget':
        if ($value == 1) throw new WireException("Default parent widget cannot have breakpoints.");
        $v = $this->widgets->get($value);
        if (!$v instanceof Widget) throw new WireException("Wrong value for widget property `$value`");
        return $this->set($key, $v->id);
        break;

      case 'media':
        if (is_array($value) && count($value) === 2) {
          if ($value[0] > $value[1]) throw new WireException("The 'media(min)' cannot be greater that 'media(max)'.");
          return $this->set($key, array((integer) $value[0], (integer) $value[1]));
        }
        if ($value === 'default') return $this->set($key, $value);
        throw new WireException("Wrong value for `media` property: " . print_r($value, true));
        break;

      case 'span':
        if (is_array($value) && count($value) === 2) {
          return $this->set($key, array((integer) $value[0], (integer) $value[1]));
        } else {
          throw new WireException("Wrong value for span property: " . print_r($value, true));
        }
        break;

      case 'clear':
        if (in_array($value, array('none', 'left', 'right', 'both'))) return $this->set($key, $value);
        else throw new WireException("Wrong value for clear property: $value");
        break;

      case 'customCss':
        throw new WireException('Do not modify customCss property directly. Use addCustom() and removeCustom() methods instead.');
        break;
      
      default:
        return parent::__set($key, $value);
        break;
    }
  }

  public function __get($key)
  {
    switch ($key) {
      case 'widget':
        return $this->widgets->get($this->get($key));
        break;
      
      default:
        return parent::__get($key);
        break;
    }
  }

  public function customCssString()
  {
    $out = "";
    foreach ($this->customCss->getArray() as $property => $value) $out .= "$property : $value";
    return $out;
  }

  public function isNew()
  {
    return ! (boolean) $this->id; 
  }

  protected function reportIfErrors()
  {
    // The breakpoint should have a widget assigned to it
    if (is_null($this->widget)) throw new WireException("You should assign a 'widget' to a breakpoint before you saving.");

    // The breakpoint should have a media property assigned
    if (is_null($this->media)) throw new WireException("You should set 'media' to a breakpoint before saving.");
  }

  public function save()
  {
    $this->reportIfErrors();
    return $this->breakpoints->save($this);
  }

  public function setTrackChanges($trackChanges = true)
  {
    parent::setTrackChanges($trackChanges);
    $this->customCss->setTrackChanges($trackChanges);
  }

  public function resetTrackChanges($trackChanges = true)
  {
    parent::resetTrackChanges($trackChanges);
    $this->customCss->resetTrackChanges($trackChanges);
  }

  public static function getClearOptions()
  {
    return array(
      'none' => 'none',
      'both' => 'both',
      'right' => 'right',
      'left' => 'left'
      );
  }

  public static function getMixinOptions()
  {
    return array(
      'first' => 'first',
      'last' => 'last',
      'remove-first' => 'remove-first',
      'remove-last' => 'remove-last'
      );
  }
}