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

	var collapsedClassName = 'vui-heading-collapsible-collapsed';

	var $ = vui.$;

	$.widget( 'vui.vui_collapsibleSection', {

		_create: function() {

			var me = this;

			var $elem = this.element;

			var targetId = $elem.attr( 'data-target' );
			if( targetId === undefined ) {
				return;
			}

			var target = document.getElementById( targetId );
			if( target === null ) {
				return;
			}

			this.target = $( target );
			var targetIsVisible = this.target.is(":visible");

			var headingText = $elem.text();
			var hideText = 'Hide ' + headingText;
			var showText = 'Show ' + headingText;

			this.anchor = $( '<a class="foo vui-link" href="javascript:void(0);" aria-controls="' + targetId + '"><span class="vui-offscreen"></span></a>' );
			$elem.append( this.anchor );

			var evtData = {
					hideText: hideText,
					showText: showText,
					target: this.target
				};

			$elem
				.on( 'collapse.vui', evtData, this._handleCollapse )
				.on( 'expand.vui', evtData, this._handleExpand )
				.on( 'click', this._handleClick )
				.trigger(  targetIsVisible ? 'expand.vui': 'collapse.vui' );

		},

		_destroy: function () {

			var $elem = this.element;

			$elem
				.off( 'collapse.vui', this._handleCollapse )
				.off( 'epxand.vui', this._handleExpand )
				/*.off( 'click', this._handleClick )*/
				.removeClass( collapsedClassName );

			this.anchor.remove();
			this.target.removeAttr( 'aria-hidden' );

		},

		_handleCollapse: function( evt ) {

			$( this )
				.addClass( collapsedClassName )
				.find( '.foo' )
					.attr( 'aria-expanded', false )
				.find( '.vui-offscreen').text( evt.data.showText );

			evt.data.target.slideUp(
					function() {
						$( this )
							.addClass( 'vui-hidden' )
							.removeAttr( 'style' )
							.attr( 'aria-hidden', true );
					}
				);

		},

		_handleClick: function( evt ) {

			var isCollapsed = $( this ).is('.vui-heading-collapsible-collapsed');
			$( this ).trigger( isCollapsed ? 'expand.vui' : 'collapse.vui' );
			console.log( 'click' );

		},

		_handleExpand: function( evt ) {

			$( this )
				.removeClass( collapsedClassName )
				.find( '.foo' )
					.attr( 'aria-expanded', true )
				.find( '.vui-offscreen' ).text( evt.data.hideText );

			evt.data.target.slideDown(
					function() {
						$( this )
							.removeClass( 'vui-hidden' )
							.removeAttr( 'style' )
							.attr( 'aria-hidden', false );
					}
				);

		}

	} );

	vui.addClassInitializer(
			'vui-heading-collapsible',
			function( node ) {
				$( node ).vui_collapsibleSection();
			}
		);

} )( window.vui );