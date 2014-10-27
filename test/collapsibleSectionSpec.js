( function() {
	'use strict';

	describe( 'vui.collapsibleSection', function() {

		var node;

		beforeEach( function () {
			jasmine.addMatchers( d2l.jasmine.matchers );
			node = document.body.appendChild( document.createElement( 'div' ) );
		} );

		afterEach( function() {
			document.body.removeChild( node );
		} );

		describe( 'create', function() {

			var $heading, $content;

			beforeEach( function () {
				$heading = $( "<h2 class='vui-heading-collapsible' data-target='content'>some heading</h2>" )
					.appendTo( node );
				$content = $( "<div id='content' style='display:none;'>some content</div>" )
					.appendTo( node );
			} );

			it( 'binds the heading and collapsible content elements using widget method', function() {
				$heading.vui_collapsibleSection();
				expect( $heading.data( 'vui-vui_collapsibleSection' ) ).toBeDefined();
			} );

		} );

		describe( 'destroy', function() {

			var $heading, $content;

			beforeEach( function () {
				$heading = $( "<h2 class='vui-heading-collapsible' data-target='content'>some heading</h2>" )
					.appendTo( node );
				$content = $( "<div id='content' style='display:none;'>some content</div>" )
					.appendTo( node );
				$heading.vui_collapsibleSection();
			} );

			it( 'unbinds input from widget when destroy is called', function() {
				$heading.vui_collapsibleSection( 'destroy' );
				expect( $heading.data( 'vui-vui_collapsibleSection' ) ).not.toBeDefined();
			} );

		} );

	} );

} )();
