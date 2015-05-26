
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
	tree									=	require('./sass-tree.js'),
	_											=	require('underscore')
;


// configuration
// =============
// this should be changed to 
// reflect your project directory
var config = {

	build_dir : 'build',

	build_prefix : 'widgets', // could be your app name

	// the directory for watching after js files
	js_dir : 'js', 

	// the file that is used to build a js for production
	js_build : 'js/Boot', 

	// the path to almond. Note: you should omit the `.js` extension
	js_almond : 'deps/almond/almond', 

	// the directory for watching after scss files
	scss_dir : 'scss', 

	// the directory where the css will be outputted
	css_dir : 'css'
};


// reporter
// ========
// Logs a message prettified with gulp-utils
function reporter (subject, action, object) {
	util.log(util.colors.cyan(subject) + ' ' + util.colors.yellow(action) + ' ' + object);
}


// sass change reporter
// ====================
// Used with through. Reports the state of the gulp stream.
// Uses data.event provided by gulp-watch to decide the 
// action of the reporter
function sassChangeReporter(data) {
	var event = data.event;
	if (!event) return this.queue(data);
	reporter('Sass', data.event, data.relative);
	this.queue(data); // Make sure you pass the data through
}


// sass write reporter
// ===================
// Same as above except it assumes that the action
// is that file is successfully wrtitten to disk
function sassWriteReporter(data) {
	if (data.event === 'unlink') return this.queue(data);
	reporter('Sass', 'write', data.relative);
	this.queue(data); // Make sure you pass the data through
}


// dev css transformer
// ===================
// Transform data into new vinyl file
// that is a css file which imports all
// other css files from the build folder 
// except itself
var writeDevCss = false;
function sassCreateDevCss (data) {
	var paths, path, str, itemArr, file, fileExists;
	path = process.cwd() + '/' + config.css_dir + '/' + config.build_prefix + '.css';
	fileExists = fs.existsSync(path);
	if (!data.event || data.event === 'change') {
		if (fileExists) {
			writeDevCss = false;
			return this.queue(data);
		}
	}
	paths = fs.readdirSync(config.css_dir);
	str = _(paths).reduce(function (memo, item) {
		itemArr = item.split('.');
		if (itemArr.length > 2) return memo;
		if (itemArr[1] !== 'css') return memo;
		if (itemArr[0] === config.build_prefix) return memo;
		if (_(config.css_ignore).indexOf(itemArr[0]) !== -1) return memo;
		return memo += '@import url("'+ item +'");\n';
	}, '');

	file = new Vinyl({
		path : path,
		contents : new Buffer(str)
	});
	writeDevCss = true;
	this.queue(file);
	reporter('Sass', (fileExists ? 'updated' : 'created'), file.path);
}

// dev css write condition
// =======================
// update dev css or not. Make sure

function sassDevCssCondition () {
	return writeDevCss;
}


// unlinked remover
// ================
// Deletes css files whoose scss files were
// deleted
function sassRemoveUnlinked (data) {
	var path;
	if (data.event !== 'unlink') return this.queue(data);
	path = data.path.split('.');
	path.pop();
	path.push('css');
	path = path.join('.');
	fs.unlinkSync(path);
	reporter('Sass', 'delete', data.relative);
	this.queue(data);
}


// gulp watch-sass
// ===============
gulp.task('watch-sass', function () {
	var scssGlob;
	scssGlob = [config.scss_dir + '/**/*.scss', '!'+ config.scss_dir + '/' + config.build_prefix +'.scss'];
	return gulp.src(scssGlob)
		.pipe(watch(scssGlob))
		.pipe(tree(scssGlob, '/scss'))
		.pipe(through(sassChangeReporter))
		.pipe(sass({
			errLogToConsole : true,
			sourceComments : true
		}))
		.pipe(gulp.dest(config.css_dir))
		.pipe(through(sassRemoveUnlinked))
		.pipe(through(sassWriteReporter))
		.pipe(through(sassCreateDevCss))
		.pipe(ternaryStream(sassDevCssCondition, gulp.dest('./')));
});


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
	gulp.start('watch-sass');
	gulp.start('watch-js');
});


// gulp remove-build-css
// =====================
// Removes the files that are previosly created by 
// `gulp build-css`. Runs before `gulp build-sass`.
gulp.task('remove-build-css', function (cb) {
	var glob;
	glob = [config.build_dir + '/'+ config.build_prefix +'.*.css', config.build_dir + '/'+ config.build_prefix +'.css',];
	del(glob, function (options, paths) {
		reporter('Sass', 'remove', paths);
		cb();
	});
});


// gulp remove-dev-css
// =====================
// Removes the files that are previosly created by 
// `gulp build-css`. Runs before `gulp build-sass`.
gulp.task('remove-dev-css', function (cb) {
	var glob;
	glob = [config.css_dir + '/'+ config.build_prefix +'.*.css', config.css_dir + '/'+ config.build_prefix +'.css',];
	del(glob, function (options, paths) {
		reporter('Sass', 'remove', paths);
		cb();
	});
});


// gulp  build-css-dev
// ===================
// Creates a css file for development mode.
// This is a file that includes all other css files 
// that are in the build directory
gulp.task('build-css-dev', ['remove-dev-css', 'remove-build-css'], function (cb) {
	var file, path, str, itemArr, Readable;
	Readable = require('stream').Readable;
	path = config.build_prefix + '.css';
	str = 'str';

	file = ReadableStream({objectMode : true});
	file._read = function () {
		this.push(new util.File({
			cwd : __dirname,
			base : config.build_dir,
			path : path,
			contents : new Buffer(str)
		}));
		this.push(null);
	};

	file
		.pipe(through(function (data) {
			data.event = 'add';
			this.queue(data);
		}))
		.pipe(through(sassCreateDevCss))
		.pipe(gulp.dest('./'))
		.on('end', cb);
});


// gulp build-css
// ==============
// Compiles and minifies only config.build_scss file
gulp.task('build-css', ['remove-build-css'], function (cb) {

	var file, path, str, itemArr, Readable;
	Readable = require('stream').Readable;
	path = config.scss_dir + '/' + config.build_prefix + '.scss';
	str = _(fs.readdirSync(config.scss_dir)).reduce(function (memo, item) {
		itemArr = item.split('.');
		if (itemArr.length !== 2) return memo;
		if (itemArr[1] !== 'scss') return memo;
		if (itemArr[0].indexOf('_') === 0) return memo;
		if (_(config.css_ignore).indexOf(itemArr[0]) !== -1) return memo;
		return memo += '@import "' + item + '";\n';
	}, '');

	file = ReadableStream({objectMode : true});
	file._read = function () {
		this.push(new util.File({
			cwd : __dirname,
			base : config.scss_dir,
			path : path,
			contents : new Buffer(str)
		}));
		this.push(null);
	};

	file
		.pipe(sass({errLogToConsole : true, outputStyle : 'compressed'}))
		.pipe(gulp.dest(config.build_dir))
		.pipe(through(sassWriteReporter))
		.on('end', cb);
});


// gulp build-css-rev
// ==================
// Appends a unique hash for build css
// Ultimately this method creates a copy of the file
// with appended hash and deletes the original file.
gulp.task('build-css-rev', ['build-css'], function (cb) {
	var revAll, vp;
	revAll = new RevAll();
	vp = vinylPaths();
	gulp.src(config.build_dir + '/' + config.build_prefix + '.css')
		.pipe(vp)
		.pipe(revAll.revision())
		.pipe(gulp.dest(config.build_dir))
		.pipe(through(sassWriteReporter))
		.on('end', function () {
			del(vp.paths, function () {
				reporter('Sass', 'remove', vp.paths);
				cb();
			});
		});
});


// gulp remove-build-js
// ====================
// Removes the files that are previosly created by 
// `gulp build-js`. Runs before `gulp build-js`.
gulp.task('remove-build-js', function (cb) {
	var glob;
	glob = [config.build_dir + '/' + config.build_prefix + '.js', config.build_dir + '/' + config.build_prefix + '.*.js'];
	del(glob, function (oprions, paths) {
		reporter('JS', 'remove', paths);
		cb();
	});
});


// gulp build-js
// =============
// Starts with config.build_js and follows CommonJS
// syntax  paths (e.g. require('string')). Concatenates
// and compresses all found files.
gulp.task('build-js', ['remove-build-js'], function (cb) {
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
gulp.task('build-js-rev', ['build-js'], function (cb) {
	var revAll, vp;
	revAll = new RevAll();
	vp = vinylPaths();
	gulp.src(config.build_dir + '/' + config.build_prefix + '.js')
		.pipe(vp)
		.pipe(revAll.revision())
		.pipe(gulp.dest(config.build_dir))
		.on('end', function () {
			del(vp.paths, function () {
				reporter('JS', 'remove', vp.paths);
				cb();
			});
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
		['build-css-dev', 'remove-build-js'],
		cb
		);
});


// gulp build
// ==========
// Set everything for production environment
gulp.task('build', function (cb) {
	function then() {
		util.log(util.green('Ready for production!'));
	}

	runSequence(
		['build-css-rev', 'build-js-rev'],
		cb
		);
});