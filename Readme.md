Site
====

This repository is a starting point for web projects as per Yakyn Labs.
Here we also describe the conventions and common patterns used to build
our web projects. This document should serve as an introduction to Yakyn
Labs project development process.

Clone this repo to your local machine before we continue.

	git clone <this-repo>

###GULP
Our building system relies on [Gulp][gulp]. We've setup gulpfile.js for most
of the common needs. However most of the time you will use only three commands.

#### Gulp development state
The first command is...

	gulp dev

This command will:
-- Delete all production js/css files. 
-- Remove their respective links from template files like `index.html`, `_head.php`
and/or `_foot.php`.
-- Inject all necessary develoment js/css files into template files.

Of course all this behavior is configurable. You decide what css/js files should be
injected and where to they should be injected.


#### Gulp development mode
Then comes...

	gulp watch

As you may guess this command starts to watch your css/js files for change and report
neccessary information for the developer. 

When you change the sass files it will be compiled into css files and reported that 
they did so. If there was any errors during the compilation of the sass files, information 
about it will be reported.

Please note that you do not need to create a `.scss.` file that imports all your css modules
into one. This file is created automatically and updated during `gulp watch` and 
`gulp watch-sass` whenever a css module is added or removed from the `scss` directory.
A __CSS Module__ is just an `.scss` file without leading underscore in it's filename. All css
modules will be created in the `build` directory during the _watch_ modes and a css file that
imports al of them will be created automatically and injected into your template files. Read
further for more info.

When you change the JavaScript file. The file will be checked via your local jshint and 
necessary info will be reported.


#### Gulp production state
The last command that you need to know is...

	gulp build

This command will:
-- Create and compile the production sass file. It will include all .scss files from your sass 
directory without leading underscore. We only want to deliver one css file to the client.
-- Revision the production css file and append a hash to it's filename. It will look smth like
`www.497a9cb0.css`. This guarantees us that if the previus version of the css file is 
cached by client's browser the new file will not be ignored and downloaded if it was changed.
-- Inject production css file into template files like `index.html` or any other file that you
configured for css injection.
-- All the steps above wil be performed for production js file also. The js file will be 
optimized by [r.js][rjs]. This also should be a single file.

The three commands above should be all you need after you configure everything for your
needs. Below you will find everything you need to configure the `gulpfile.js`.


###CSS
We prefer to use [sass][sass]. Hence our css files are compiled from .scss files.
Usually all .scss files are located in a `scss` directory and their compiled
versions are mirrored in `build` directory.


####Gulp watch-sass

	gulp watch-sass

Watches all `.scss` files in a `scss` directory (or directory that you choose) and 
compiles those that are changed into `.css` file and place it into `build`
directiry.


####Gulp build-css-dev

	gulp build-css-dev

Creates a css file for development mode. This file imports (via css `@import`) all `.css` 
files from `build` directory. This is helper file that for you when you are developing
the app. You do not have to include all css modules into your templates. This file
imports them all, thus this is the only file you should include into your templates in
development mode. 

You would not need this command most of the time. Because `gulp dev` automatically calls
it and `gulp watsh-sass` automatically updates this file whenever a css module is added
or removed from the project.


####Gulp build-css

	gulp build-css

Compiles all css files into one file and places it into `build` directory. Produces a 
css file for production environment.


####Gulp build-css-rev

	gulp build-css-rev

Same as above except it appends a unique hash to the name of the file. This ensures us 
that changed css file for production is downloaded by client, not taken from cache.


####Gulp inject-css-dev

	gulp inject-css-dev

Inserts a css `<link>` tag for development mode into template file/s that you have defined
in `config` variable in `gulpfile.js` (e.g. `['index.html', '_head.php']`). It injects the 
`<link>` betweet two injection tags that you define in the gulp configurtion.
The tags looks somethomg like...

	<link href="/build/www.css" rel="stylesheet" type="text/css"></link>


####Gulp inject-css-build

	gulp inject-css-build

Inserts a css `<link>` tag for production mode into template file/s that you have defined
in `config` variable in `gulpfile.js` (e.g. `['index.html', '_head.php']`). It injects the 
`<link>` betweet two injection tags that you define in the gulp configurtion.
The tags looks somethomg like...

	<link href="/build/www.ee193fbe.css" rel="stylesheet" type="text/css"></link>

###JS

####Gulp build-js

	gulp build-js

Builds a js file for production. Starts with the bootstrap file/s that you have defined 
in `config` variable in `gulpfile.js` and follows CommonJS `require('module')` syntax
and includes al required files. The result is uglified.


####Gulp build-js-rev

	gulp build-js-rev

Same as above except it appends a uniqe hash to the name of the file.


####Gulp inject-js-dev

	gulp inject-js-dev

Inserts a js `<script>` tag for development mode into template file/s that you have defined
in `config` variable in `gulpfile.js` (e.g. `['index.html', '_foot.php']`). It injects the 
`<script>` betweet two injection tags that you define in the gulp configurtion.
The tags looks somethomg like...

	<script data-main="/js/Boot" src="/deps/requirejs/require.js"></script>


####Gulp inject-js-build

	gulp inject-js-build

Inserts a js `<script>` tag for production mode into template file/s that you have defined
in `config` variable in `gulpfile.js` (e.g. `['index.html', '_foot.php']`). It injects the 
`<script>` betweet two injection tags that you define in the gulp configurtion.
The tags looks somethomg like...

	<script src="/build/www.2cb1fb86.js"></script>


[sass]: http://sass-lang.org
[gulp]: http://gulpjs.com
[rjs]: https://github.com/jrburke/r.js