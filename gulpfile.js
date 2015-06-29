
'hello there!';

var
	gulp									=	require('gulp'),
	watch									=	require('gulp-watch'),
	sass									= require('gulp-sass'),
	jshint								=	require('gulp-jshint'),
	util									=	require('gulp-util'),
	through								=	require('through'),
	rjs										=	require('requirejs'),
	RevAll								=	require('gulp-rev-all'),
	del										= require('del'),
	vinylPaths						=	require('vinyl-paths'),
	glob									=	require('glob'),
	runSequence						=	require('run-sequence'),
	Vinyl									=	require('vinyl'),
	ternaryStream					=	require('ternary-stream'),
	ReadableStream				=	require('readable-stream')
	fs										=	require('fs'),
	_											=	require('underscore')
;


// configuration
// =============
// this should be changed to 
// reflect your project directory
var config = {

	build_dir : '.',

	build_prefix : 'ProcessWidgets', // could be your app name

	// the directory for watching after js files
	js_dir : 'js', 

	// the file that is used to build a js for production
	js_build : 'js/Boot', 

	// the path to almond. Note: you should omit the `.js` extension
	js_almond : 'deps/almond/almond'
};


// reporter
// ========
// Logs a message prettified with gulp-utils
function reporter (subject, action, object) {
	util.log(util.colors.cyan(subject) + ' ' + util.colors.yellow(action) + ' ' + object);
}


// gulp watch-js
// =============
// Watches the .js files and reports about the 
// style. Uses jshint-stylish for reporting
gulp.task('watch-js', function () {
	var glob;
	glob = config.js_dir + '/**/*.js';
	return gulp.src(glob)
		.pipe(watch(glob))
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});


// gulp watch
// ==========
// Starts gulp sass and gulp jshint
// Useful for development mode
gulp.task('watch', function () {
	//gulp.start('watch-sass');
	gulp.start('watch-js');
});


// gulp build-js
// =============
// Starts with config.build_js and follows CommonJS
// syntax  paths (e.g. require('string')). Concatenates
// and compresses all found files.
gulp.task('build-js', function (cb) {
	var options;
	options = {	
		baseUrl : __dirname,
		mainConfigFile : config.js_build + '.js',
		optimize : 'none',
		preserveLicenseComments: true,
		findNestedDependencies: true,	
		name : config.js_almond,
		include : config.js_build,
		insertRequire : [config.js_build],
		out : config.build_dir + '/' + config.build_prefix + '.js',
		wrap: {
			start: "(function() {",
			end: "})();"
		}
	};
	rjs.optimize(options, function (res) {
		var msg;
		res = res.split('\n');
		res.forEach(function (str, index) {
			msg = ' require: ';
			if (index === 0 || index === res.length - 1) return;
			if (index === 1) msg = ' building: ';
			if (index === 2) msg = ' start ';
			reporter('RJS', msg, str);
		});
		cb(); // finish
	});
});


// gulp build-js-rev
// =================
// Appends a unique hash for build/*.js
// Ultimately this method creates a copy of the file
// with appended hash and deletes the original file.
gulp.task('build-js-min', function (cb) {
	var options;
	options = {	
		baseUrl : __dirname,
		mainConfigFile : config.js_build + '.js',
		optimize : 'uglify',
		preserveLicenseComments: false,
		findNestedDependencies: true,	
		name : config.js_almond,
		include : config.js_build,
		insertRequire : [config.js_build],
		out : config.build_dir + '/' + config.build_prefix + '.min.js',
		wrap: {
			start: "(function() {",
			end: "})();"
		}
	};
	rjs.optimize(options, function (res) {
		var msg;
		res = res.split('\n');
		res.forEach(function (str, index) {
			msg = ' require: ';
			if (index === 0 || index === res.length - 1) return;
			if (index === 1) msg = ' building: ';
			if (index === 2) msg = ' start ';
			reporter('RJS', msg, str);
		});
		cb(); // finish
	});
});



// gulp dev
// ========
// Set everything for develpment environment
gulp.task('dev', function (cb) {
	function then() {
		util.log(util.green('Ready for development!'));
	}

	runSequence(
		'build-js',
		cb
		);
});


// gulp build
// ==========
// Set everything for production environment
gulp.task('build', function (cb) {
	runSequence(
		'build-js-min',
		cb
		);
});