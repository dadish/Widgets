Widgets
=======

Widgets is a [ProcessWire][pw] module. It is designed to be as flexible as 
possible for websites that change their look on demand with support of responsive 
grids inspired by [Susy][susy].

### Installation
1. Copy all the files in this directory into `/site/modules/Widgets/`.

2. The Widgets modules extend their own custom classes that extend either `WireData`
or `WireArray`. Each widget is PW module too. Therefore required classes should be
loaded before site modules begin to initialize. Append this line of code into `/site/config.php`
```php
require_once($config->paths->site . 'modules/Widgets/require.php');
```

3. In your admin, go to _Modules > Refresh_.

4. Click install next to the modules in this order:
  - Widget Breakpoints
  - Widgets
  - Widget Container
  - Widget Reference
  - Process Widgets
  - Process Widgets Labels (optional)

## Usage
Now you have to know that the above modules are only the foundation for __Widgets__.
You also need at least one widget that renders out some markup. You can use [Widget Text][widget-text]
for your initial testing purposes. From there you should be good for basic widgets outputs.

...

## Widget
A Widget is a [ProcessWire][pw] module that extends the Widget class. Look at the
Widget.php for more information.

...

[pw]: http://processwire.com
[susy]: http://susy.oddbird.net/
[widget-text]: https://github.com/dadish/WidgetText