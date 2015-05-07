// js/Boot.js

//==============
//  AMD Config
//==============

requirejs.config({
	baseUrl : '/site/a',
	paths : {

		'requirejs' : 'deps/requirejs/require',
		'jquery' : 'deps/jquery/dist/jquery.min',
		'underscore' : 'deps/underscore/underscore',
		'backbone' : 'deps/backbone/backbone'
	},
	waitSeconds : 0
});

//========
//  BOOT
//========

define(function (require, exports, module) {

	require('jquery');
	require('underscore');
	require('backbone');

	var
		app											=	require('js/App/App')
	;

	app.launch();

});