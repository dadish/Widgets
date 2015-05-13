Widgets
=======

Widgets is a [ProcessWire][pw] module. It is designed to be as flexible as possible
for websites that change their look on demand.

The __Widgets__ module comes with it's own classes/interfaces that are intended
be extended/implemented by developers of the website. There is also a front end
helper that allows you to change the look of every single page the way you want
it to look like, without sacrifising the consistency of the overall design of
the website.

The Widgets module could be initiated in the front end of the website. The trigger
could be located near the admin tools of the website. Where the `Edit` button
usually is located.

After initializetion of the __Widgets__ you will see the __toolbar__ at the top 
of the webpage. The toolbar contains all neccessary information about the state
of the widgets on your screen.

###Add Widget
You can add a widget from the __toolbar__. There are several properties that you
need to set when adding a new widget. The properties are:
####Owner property
The owner property is the owner of the widget. It could be either a current Page
of the website that you have opened via the url or it's Template. The widget 
always renders for it's owner. It is fetched by the __Widgets__ module when the
owner asks for it.
####OwnerType property
There are three types of owner of the widget. These types are `Widget` class
constants:
#####Widget::ownerTypePage
If the owner type is _page_ it means that the widget will be rendered only for that
particular page.
#####Widget::ownerTypeTemplate
If the owner is type _template_ it means that the widget will be rendered for every
page with that template.
#####Widget::ownerTypeAncestor
When the owner type is _ancestor_ it's owner is page, however the widget is rendered
for every page under the ancestor. This is useful when you wan't to render the whole
section of the website in one way whatever the template the pages have. Or if you
want to have just one template and several different looks for different sections of
your site.
####RenderPages Property
Widget accepts a list of pages that you want it to render. It should be one or more
pages. E.g. a Widget that renders a title of the page will probably use only one page
to do that, on the other hand a widget that renders a list of pages titles and their
urls will use all pages that you pass to it.

####Parent Property
A Widget should can have a parent. We use this property to nest widgets within each
other. When you create a widget at the front ent via our __toolbar__ you don't have
to worry about this property because it is created for you automatically. However
when you are creating a widget via API you can set a parent property yourself, but
you can omit it, in that case the widget is considered a container. There is more
info about nesting widgets further below.

####Add Widget via API
You can also add a widget via api.
```php
// First of all we need to create a container widget.
$containerWidget = $modules->get('WidgetContainer');

// Lets assign this widget to homepage
$owner = $pages->get('/');
$containerWidget->owner = $owner; // you can pass pageId, name, path or whatever

// We want this widget to be rendered only on home page
$containerWidget->ownerType = Widget::ownerTypePage;

// Then you save the widget
$widget->save();
```
A container widget does not render any markup itself. It is only for encapsulating
subwidgets. So we need to add at least one widget into it.
```php
// Create the new widget that renders a list of pages.
// Every widget is a PW module remember? Assume that
// our module is called WidgetPageLister
$listerWidget = $modules->get('WidgetPageLister');

// Add lister widget into container. When you do that
// it automatically will get owner and ownerType properties
// from it's parent widget. And it will get a prent property
// of course
$containerWidget->add($listerWidget);

// Every widgets accepts one or more pages that it should render
// let's assume you want to list all subpages of home page.
$listerWidget->addRender($owner->children());

$listerWidget->save();
```

###ResizeWidget
The widgets are orginized in horizontal grid. You are able to resize every widget
by holding the side of the widget on your screen and dragging it horizontally to
resize it wider or thinner.


###Nesting Widgets
The widgets could be nested within each other to build complex layouts for your website.
The widget layout starts with a widget that contains all other widgets. You can call it
container widget. But you can have several widget containers.

Whenever you choose a widget by clicking on it on your front end while the __Widgets__
module is intialized, the __toolbar__ will provide you with sets of actions that you
can perform upon the widget. One of the things you can do is add another widget into
it. Usually you want to add children to a widget that is there only to provide nesting
capabilities. It renders it's children and does not need any render pages, because it
does not renders them in any way.
####Nest widgets via API
You can nest widgets via api also.
```php
$widget->add($anotherWidget);
$widget->save();

// Or remove widget from one another
$widget->remove($anotherWidget);
$widget->save();
```

###Modify Widget
Every widget will present it's settings/options that are availabel via __toolbar__.
You will be able to change the settings and widgets will rerender with the new 
settings. This way you can build widgets that can have several different layout
and styles that is cutomizeble via Widgtet's settings. This also means that you
can have one widget to look in one way on some page and another way in other page.
####Modifying Widgets Options via API
You can modify widget settings via options property of the widget.
```php
$widget->options->color = 'white';
$widget->options->columns = 2;
$widget->save();
```

###Sort Widgets
You can change the order of the widgets on front end at __toolbar__. By dragging
the list of child widgets up/down.
####Sort Widget via API
```php
$modules->get('Widgets')->sort($widget, $order);
```

###Render Widgets
It is very simple to render widgets in your template files. __Widgets__ module
adds a _widgets_ property to every page that could be just rendered.
```php
echo $page->widgets->render();
```
You can also render widgets of the page individually by it's index.
```php
echo "<h2>Welcome to our website!<h2>";

echo $page->widgets->render(0);

echo "<h2>See our gallery!</h2>"

echo $page->widgets->render(1);
```

###Modify Widget Markup
Every widget has a default ProcessWire template file. Usually it is located at the
under modules directory in `markups` folder. There should already be a `default.php`
file that is used to render widget's markup by default. But you can have different
markups based on pages template. Say you want a page that has `news-item` to be
rendered by this widget little differently, then you just need to add a file in
the markups folder with the same name as your template name. In our case it would
be `news-item.php`. There you can make copy the contents of the `deafult.php` file
into `news-item.php` and modify the markup however you want. After you do that from
now on pages that have template `news-item` will be renderd by `news-item.php` file
and all others will be rendered with `default.php`. You can do that for any pages
and for any template.

You can do that for every widget and your news-items accross all site can have their
own unique look.

###Responsive Layout
__Widgets__ module is designed to be responsive to the size of the screen. It uses
css `@media` queries to achieve respoinsive effects. After determining the default
look of your website, you can start shrinking it and changing the positions of the
widgets at certain breakpoints to fit them nicely n your widgets grid.

- Click on the `break` button at the right-top of the __toolbar__ and you have just
created a css breakpoint. Now everything below this size will look the way you want
it to look.
- Change the places of the widget (also via __toolbar__) and sizes of the widget by
holding and dragging the edges of your widgets.
- After you have done modifying the look of your page, and all widgets are placed
where you want. Start shrinking your browser again until you feel that your webpage
should look differently at some size.
- When you find the critical point, you can repeat above steps again. Add a breakpoint
modify the look, and so on... Until you make your page look consistent on all sizes
of your screen.

__NOTE:__ `@media` queries are not supported on IE8. You can include a shim for that
browser. 

[pw]: http://processwire.com