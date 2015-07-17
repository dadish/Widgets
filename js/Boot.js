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
		'jqueryUI' : '../../../wire/modules/Jquery/JqueryUI/JqueryUI',
		'underscore' : 'deps/underscore/underscore',
		'backbone' : 'deps/backbone/backbone',
		'magnificPopup' : '../../../wire/modules/Jquery/JqueryMagnific/JqueryMagnific',
		'asmSelect' : '../../../wire/modules/Inputfield/InputfieldAsmSelect/asmselect/jquery.asmselect'
	},
	shim : {
		'magnificPopup' : {
			deps : ['jquery'],
			exports : 'magnificPopup'
		},

		'jqueryUI' : {
			deps : ['jquery'],
			exports : 'jqueryUI'
		},

		'asmSelect' : {
			deps : ['jquery'],
			exports : 'asmSelect'
		}
	},
	waitSeconds : 0
});

//========
//  BOOT
//========

define(function (require, exports, module) {

	require('js/polyfills');
	require('jquery');
	require('jqueryUI');
	require('underscore');
	require('backbone');

	var
		app											=	require('js/App/App'),
		Config 									=	require('js/Config')
	;

	if (Config.stop) return;

	setTimeout(function () {
		app.launch();
	}, 2000);

});