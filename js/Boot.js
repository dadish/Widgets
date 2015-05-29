// js/Boot.js

//==============
//  AMD Config
//==============

requirejs.config({
	baseUrl : '/site/modules/Widgets/',
	paths : {
		'requirejs' : 'deps/requirejs/require',
		'text' : 'deps/requirejs-text/text',
		'jquery' : '../../../wire/modules/Jquery/JqueryCore/jquery-1.11.1',
		'underscore' : 'deps/underscore/underscore',
		'backbone' : 'deps/backbone/backbone',
		'magnific-popup' : '../../../wire/modules/Jquery/JqueryMagnific/JqueryMagnific'
	},
	shim : {
		'magnific-popup' : {
			deps : ['jquery'],
			exports : 'magnific-popup'
		}
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
		app											=	require('js/App/App'),
		Config 									=	require('js/Config')
	;

	if (Config.stop) return;

	app.launch();

});