// js/App/App.js

define(function (require, exports, module) {

	module.exports = {

		launch : function () {
			
			// Assign a global App variable so it is accessable from anywhere
			window.app = this;

			console.log('initialize app!');
		}
	};

});