<?php

class PageWidgets extends TemplateWidgets {

  public function refresh()
  {
    $this->removeAll();
    $this->import($this->widgets->find("owner=$this->ownerId, sort=sort"));
    $this->breakpoints->fetchAllForOwner($this->ownerId);
  }

}