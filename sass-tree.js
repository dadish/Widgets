// ===========
//  SASS TREE
// ===========

var through									=	require('through');
var glob										=	require('glob');
var fs											=	require('fs');
var _												=	require('underscore');
var gutil										=	require('gulp-util');
var Vinyl										=	require('vinyl');
var VinylFile								=	require('vinyl-file');

var tree = null;
var scssGlob = null;
var globOptions = null;
var paths = null;

function sassTree (data) {
	var parents;
	if (paths === null) paths = getPaths(scssGlob);
	if (tree === null) {
		buildTree(paths);
	}

	if (!data.event) return this.queue(data);

	if (data.event !== 'unlink') {
		processItem(data);
	} else {
		unProcessItem(data);
		return this.queue(data);
	}

	parents = getRenderables(data.relative, []);	
	_(parents).each(function  (parent) {
		parent = globOptions.base + '/' + parent;
		this.queue(new Vinyl({
			path : parent,
			contents : fs.readFileSync(parent),
			base : globOptions.base,
		}));
	}, this);

	this.queue(data);
}

function setGlobOptions (scssDir) {
	var cwd;
	cwd = process.cwd();
	globOptions = {
		cwd : cwd,
		base : cwd + scssDir
	};
}

function getPaths (scssGlob) {
	if (Array.isArray(scssGlob)) {
		if (scssGlob.length === 0) return [];
		return getPathsFromArray(scssGlob);
	}
	return glob.sync(scssGlob, globOptions);
}

function getPathsFromArray (globArr) {
	var paths;
	paths = [];
	_(globArr).each(function (item, index) {
		if (item[0] === '!') {
			item = item.split('');
			item.splice(0, 1);
			paths = subtractArray(paths, glob.sync(item.join(''), globOptions));
		} else {
			paths = addArray(paths, glob.sync(item, globOptions));
		}
	});
	return paths;
}

function subtractArray (paths, subtracts) {
	var from, subtractIndex;
	from = paths.slice();
	_(subtracts).each(function (subtract) {
		subtractIndex = _(from).indexOf(subtract);
		if (subtractIndex === -1) return;
		from.splice(subtractIndex, 1);
	});
	return from;
}

function addArray (paths, adds) {
	return _([paths, adds]).chain().flatten().unique().value();
}

function buildTree (paths) {
	var imports, basePath;

	tree = {};

	_(paths).each(function (path) {
		processItem(path);
	});
}

/**
 * Processes the given file. parses for @imports 
 * and add approriate data into tree. 
 * @param data. A vinyl file or a path to vinyl file;
 */
function processItem (data) {
	var imports, base;
	if (typeof data === 'string') data = VinylFile.readSync(data, {base : process.cwd() + '/scss'});
	imports = getImports(data.contents.toString(), 0, []);
	_(imports).each(function (importItem) {
		importItem = fixImport(importItem);
		base = getBase(data.relative);
		importItem = (base ? base + '/' : '') + glob.sync(importItem, {cwd : globOptions.base + '/' + base})[0];
		addParent(importItem, data.relative);
	});
}

function createTree (paths) {
	tree = {};
	_(paths).each(function (path) {
		tree[path] = {
			prefixed : isPrefixed(path),
			parents : []
		}
	});
}

function getBase (path) {
	path = path.split('/');
	path.splice(path.length - 1, 1);
	return path.join('/');
}

function getItem (path) {	
	if (!tree[path]) {
		setItem(path, {
			prefixed : isPrefixed(path),
			parents : []
		});
	}
	return tree[path];
}

function setItem (path, value) {
	tree[path] = value;
}

function unProcessItem (data) {
	var base, imports, index;
	_(tree).each(function (item, key, list) {
		index = _(item.parents).indexOf(data.relative)
		if (index !== -1) item.parents.splice(index, 1);
	});
	delete tree[data.relative];
}

function addParent (path, parentPath) {
	var item;
	item = getItem(path);
	item.parents.push(parentPath);
	setItem(path, item);
}

function removeParent (path, parentPath) {
	var item;
	item = getItem(path);
	item.parents.splice(_(item.parents).indexOf(parentPath));
	setItem(path, item);
}

function getImports (content, index, imports) {
	var keyLength, startIndex, endIndex, importKey, extract;
	importKey = '@import';

	// We should extract everything between
	// @import keyword and `;`;
	startIndex = content.indexOf(importKey, index);

	// If the is no importKey then return;
	if (startIndex === -1) return imports;

	// start from the end of the importKey
	startIndex += importKey.length;

	endIndex = content.indexOf(';', startIndex);

	extract = content.substring(startIndex, endIndex);

	// remove unnecessary character codes
	extract = extract.replace(/\s/g, '').replace(/"/g, '').replace(/'/g, '');

	// if extract has a comma in it then split the string
	// because probably someone is importing multiple paths
	// with one importKey
	if (extract.indexOf(',') !== -1) {
		extract = extract.split(',');
	}

	imports.push(extract);

	imports = _(imports).flatten();

	return getImports(content, endIndex, imports);
}

function fixImport (imp) {
	var lastIndex;
	imp = imp.split('/');
	lastIndex = imp.length - 1;
	imp[lastIndex] = '_' + imp[lastIndex] + '.scss';
	return imp.join('/');
}

function isPrefixed (path) {
	var pathArr, lastIndex;
	pathArr = path.split('/');
	lastIndex = pathArr.length - 1;
	if (pathArr[lastIndex][0] === '_') return true;
	return false;
}

function getRenderables (path, renderables) {
	var item;
	item = getItem(path);
	if (!item || !Array.isArray(item.parents)) {
		gutil.log('Couldn\'t locate the item: ' + path);
		gutil.beep();
		return;
	}
	if (item.parents.length) {
		_(item.parents).each(function (parent) {
			renderables = getRenderables(parent, renderables);
		});
	}
	
	if (!isPrefixed(path)) renderables.push(path);

	return renderables;
}

module.exports = function (globik, scssDir) {
	scssGlob = globik;
	setGlobOptions(scssDir);
	return through(sassTree);
}