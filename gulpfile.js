
'hello there!';

var
	gulp									=	require('gulp'),
	watch									=	require('gulp-watch'),
	jshint								=	require('gulp-jshint'),
	util									=	require('gulp-util'),
	through								=	require('through'),
	rjs										=	require('requirejs')
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


// gulp watch
// ==========
// Watches the .js files and reports about the 
// style. Uses jshint-stylish for reporting
gulp.task('watch', function () {
	var glob;
	glob = config.js_dir + '/**/*.js';
	return gulp.src(glob)
		.pipe(watch(glob))
		.pipe(jshint())
		.pipe(jshint.reporter('jshint-stylish'));
});


// gulp build
// ==========
gulp.task('build', function (cb) {
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
		},
    
    // Exclude ProcessWire modules. Otherwise they are loaded twice
    // and break everything
    onBuildRead: function (moduleName, path, contents) {
    	var key, excludes;
    	excludes = {
    		'$' : '/[a-zA-Z./!0-9-]*(Jquery/JqueryCore)[a-zA-Z/.0-9-]*/',
    		'$.ui' : '/[a-zA-Z./!0-9-]*(Jquery/jqueryUI)[a-zA-Z/.0-9-]*/',
    		'$.magnificPopup' : '/[a-zA-Z./!0-9-]*(Jquery/JqueryMagnific)[a-zA-Z/.0-9-]*/'
    	};
      for (key in excludes) {
      	if (path.match(excludes[key])) {
      		return "define(function (require, exports, module) { module.exports = "+ key +";});";
      	}
      }
      return contents;
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