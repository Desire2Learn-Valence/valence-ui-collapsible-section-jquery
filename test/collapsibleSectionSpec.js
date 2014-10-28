( function() {
	'use strict';

	describe( 'vui.collapsibleSection', function() {

		var node, $heading1, $content1, $heading2, $content2, $heading3, $heading4;

		beforeEach( function () {

			jasmine.addMatchers( d2l.jasmine.matchers );

			node = document.body.appendChild( document.createElement( 'div' ) );

			$heading1 = $( "<h2 id='heading1' class='vui-heading-collapsible' data-target='content1'>some heading</h2>" )
				.appendTo( node );
			$content1 = $( "<div id='content1' style='display:none;'>some content</div>" )
				.appendTo( node );
			$heading2 = $( "<h2 id='heading2' class='vui-heading-collapsible' data-target='content2'>some heading</h2>" )
				.appendTo( node );
			$content2 = $( "<div id='content2'>some content</div>" )
				.appendTo( node );
			$heading3 = $( "<h2 id='heading3' class='vui-heading-collapsible'>some heading</h2>" )
				.appendTo( node );
			$heading4 = $( "<h2 id='heading4' class='vui-heading-collapsible' data-target='content4'>some heading</h2>" )
				.appendTo( node );

		} );

		afterEach( function() {
			document.body.removeChild( node );
		} );

		var expectVisible = function( content, expected ) {
			if ( expected ) {
				expect( content.getAttribute( 'aria-hidden' ) ).toBe( 'false' );
				expect( content ).toHaveDisplay( 'block' );
			} else {
				expect( content.getAttribute( 'aria-hidden' ) ).toBe( 'true' );
				expect( content ).toHaveDisplay( 'none' );
			}
		};

		describe( 'create', function() {

			it( 'binds the heading and collapsible content elements using widget method', function() {
				$heading1.vui_collapsibleSection();
				expect( $heading1.data( 'vui-vui_collapsibleSection' ) ).toBeDefined();
			} );

			it( 'adds the target class name to the collapsible target', function() {
				$heading1.vui_collapsibleSection();
				expect( $content1.get( 0 ) ).toHaveClassName( 'vui-heading-collapsible-target' );
			} );

			it( 'creates an anchor to wrap the target content', function() {
				$heading1.vui_collapsibleSection();
				expect( $( '#heading1 > a' ).get( 0 ) ).toBeDefined();
			} );

			it( 'applies aria-hidden=true when target content is not visible', function() {
				$heading1.vui_collapsibleSection();
				expectVisible( $content1.get( 0 ), false );
			} );

			it( 'applies aria-hidden=false when target content is visible', function() {
				$heading2.vui_collapsibleSection();
				expectVisible( $content2.get( 0 ), true );
			} );

			it( 'does not error if the target is not specified', function() {
				$heading3.vui_collapsibleSection();
			} );

			it( 'does not create an anchor if the target is not specified', function() {
				$heading1.vui_collapsibleSection();
				expect( $( '#heading3 > a' ).get( 0 ) ).not.toBeDefined();
			} );

			it( 'does not error if the target is incorrectly specified', function() {
				$heading4.vui_collapsibleSection();
			} );

			it( 'does not create an anchor if the target is incorrectly specified', function() {
				$heading1.vui_collapsibleSection();
				expect( $( '#heading4 > a' ).get( 0 ) ).not.toBeDefined();
			} );

		} );

		describe( 'destroy', function() {

			beforeEach( function () {
				$heading1.vui_collapsibleSection();
			} );

			it( 'unbinds input from widget when destroy is called', function() {
				$heading1.vui_collapsibleSection( 'destroy' );
				expect( $heading1.data( 'vui-vui_collapsibleSection' ) )
					.not.toBeDefined();
			} );

			it( 'removes the target class name from the collapsible target', function() {
				$heading1.vui_collapsibleSection( 'destroy' );
				expect( $content1.get( 0 ) )
					.not.toHaveClassName( 'vui-heading-collapsible-target' );
			} );

		} );

		describe( 'expand', function() {

			beforeEach( function () {
				$heading1.vui_collapsibleSection();
			} );

			it( 'triggers vui-expand when clicking on collapsed content heading', function( done ) {
				$heading1.on( 'vui-expand', function() {
					done();
				} );
				$( '#heading1 > a' ).click();
			} );

			it( 'expands content when link is clicked', function( done ) {
				$heading1.on( 'vui-collapsibleSection-done', function() {
					expectVisible( $content1.get( 0 ), true );
					done();
				} );
				$( '#heading1 > a' ).click();
			} );

		} );

		describe( 'collapse', function() {

			beforeEach( function () {
				$heading2.vui_collapsibleSection();
			} );

			it( 'triggers vui-expand when clicking on collapsed content heading', function( done ) {
				$heading2.on( 'vui-collapse', function() {
					done();
				} );
				$( '#heading2 > a' ).click();
			} );

			it( 'expands content when link is clicked', function( done ) {
				$heading2.on( 'vui-collapsibleSection-done', function() {
					expectVisible( $content2.get( 0 ), false );
					done();
				} );
				$( '#heading2 > a' ).click();
			} );

		} );

		describe( 'vui-change', function() {

			var $input2;

			beforeEach( function () {
				$input2 = $( "<input class='vui-input' type='checkbox'>" )
					.appendTo( $content2 )
					.vui_changeTracking();
				$heading2.vui_collapsibleSection();
			} );

			it( 'adds vui-heading-collapsible-changed class name to target content if it contains changes being tracked', function() {
				$input2.click();
				expect( $( '#heading2 > a' ).get( 0 ) )
					.toHaveClassName( 'vui-heading-collapsible-changed' );
			} );

			it( 'adds vui-heading-collapsible-changed class name to target content if it contains changes being tracked', function() {
				$input2.click();
				$input2.click();
				expect( $( '#heading2 > a' ).get( 0 ) )
					.not.toHaveClassName( 'vui-heading-collapsible-changed' );
			} );

		} );

	} );

} )();
