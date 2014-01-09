/*jslint browser: true*/

(function( vui ) {

	'use strict';

	// Check if the provided vui global is defined, otherwise try to require it if
	// we're in a CommonJS environment; otherwise we'll just fail out
	if( vui === undefined ) {
		if( typeof require === 'function' ) {
			vui = require('../../core');
		} else {
			throw new Error('load vui first');
		}
	}

	// Export the vui object if we're in a CommonJS environment.
	// It will already be on the window otherwise
	if( typeof module === 'object' && typeof module.exports === 'object' ) {
		module.exports = vui;
	}

	var $ = vui.$;

	$.widget( 'vui.vui_collapsibleSection', {

		_create: function() {

			var $node = $( this.element );

			

		},

		_destroy: function () {

			var $node = $( this.element );

			if( !$node.is( 'a' ) ) {
				return;
			}

			$node.removeAttr( 'role' )
				.removeAttr( 'aria-disabled' )
				.removeAttr( 'tabIndex' );

		}

	} );

	vui.addClassInitializer(
			'vui-collapsibleSection',
			function( node ) {
				$( node ).vui_collapsibleSection();
			}
		);

} )( window.vui );