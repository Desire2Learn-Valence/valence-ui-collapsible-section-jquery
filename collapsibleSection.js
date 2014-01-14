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
	var hoverClassName = 'vui-heading-collapsible-h';
	var anchorHtml = '<a href="javascript:void(0);"><span class="vui-offscreen"></span></a>';
	var transitionEnd = 'transitionend webkitTransitionEnd';

	var $ = vui.$;

	$.widget( 'vui.vui_collapsibleSection', {

		_create: function() {

			var me = this;

			var $elem = this.element;

			var targetInfo = this._getTargetInfo( $elem );
			if( targetInfo === null ) {
				return;
			}
			this.target = targetInfo.$;

			this.anchor = $( anchorHtml );
			$elem.append( this.anchor );

			var evtData = {
					anchor: this.anchor,
					elem: $elem,
					isHover: false,
					hideText: $elem.data( 'text-hide' ) || '',
					showText: $elem.data( 'text-show' ) || '',
					target: targetInfo.$
				};

			$elem
				.on( 'collapse.vui', evtData, this._handleCollapse )
				.on( 'expand.vui', evtData, this._handleExpand )
				.on( 'click', this._handleClick )
				.on( 'mouseover', evtData, this._handleHover )
				.on( 'mouseout', evtData, this._handleBlur )
				.trigger(  targetInfo.isVisible ? 'expand.vui': 'collapse.vui' );

			this.anchor
				.attr( 'aria-controls', targetInfo.id )
				.on( 'focus', evtData, this._handleHover )
				.on( 'blur', evtData, this._handleBlur );

			this.target
				.addClass( 'vui-heading-collapsible-target' )
				.on( transitionEnd, evtData, this._handleTransitionEnd );

		},

		_destroy: function () {

			var $elem = this.element;

			$elem
				.off( 'collapse.vui', this._handleCollapse )
				.off( 'epxand.vui', this._handleExpand )
				.off( 'click', this._handleClick )
				.off( 'mouseover', this._handleHover )
				.off( 'mouseout', this._handleBlur )
				.removeClass( collapsedClassName );

			this.anchor.remove();

			this.target
				.off( transitionEnd, this.m_handleTransitionEnd )
				.removeAttr( 'aria-hidden' )
				.removeData( 'height' );

		},

		_getTargetInfo: function( $elem ) {

			var targetId = $elem.attr( 'data-target' );
			if( targetId === undefined ) {
				return null;
			}

			var target = document.getElementById( targetId );
			if( target === null ) {
				return null;
			}

			var $target = $( target );

			var targetInfo = {
					$: $target,
					id: targetId,
					isVisible: $target.is(":visible")
				};

			// initially hidden, we need to calculate height
			if( !targetInfo.isVisible ) {
				$target.css(
						{
							position: 'absolute',
							visibility: 'hidden',
							display: 'block'
						}
					);
			}

			$target.data( 'height', $target.outerHeight( false ) );

			if( !targetInfo.isVisible ) {
				$target.css(
						{
							position: 'static',
							visibility: 'visible',
							display: 'none'
						}
					);
			}

			return targetInfo;

		},

		_handleBlur: function( evt ) {

			evt.data.isHover = false;

			var isCollapsed = evt.data.elem
				.is('.vui-heading-collapsible-collapsed');

			evt.data.elem.removeClass( hoverClassName );

			evt.data.anchor.attr(
					'class',
					isCollapsed ? 'vui-icon-expand' : 'vui-icon-collapse'
				);

		},

		_handleClick: function( evt ) {

			var isCollapsed = $( this )
				.is('.vui-heading-collapsible-collapsed');
			$( this ).trigger( isCollapsed ? 'expand.vui' : 'collapse.vui' );

		},

		_handleCollapse: function( evt ) {

			evt.data.elem.addClass( collapsedClassName );

			var className = evt.data.isHover ?
				'vui-icon-expand-h' : 'vui-icon-expand';

			evt.data.anchor
				.attr( 'class', className )
				.attr( 'aria-expanded', false )
				.find( '.vui-offscreen').text( evt.data.showText );

			var targetIsVisible = evt.data.target.is(":visible");
			if( targetIsVisible ) {
				var targetHeight = evt.data.target.outerHeight( false );
				evt.data.target
					.data( 'height', targetHeight )
					.css( 'height', targetHeight + 'px' );
			}

			setTimeout( function() {
					evt.data.target
						.addClass( 'vui-heading-collapsible-target-collapsed' )
						.attr( 'aria-hidden', true )
						.css( 'height', '0' );
				}, 50 );

		},

		_handleExpand: function( evt ) {

			var className = evt.data.isHover ?
				'vui-icon-collapse-h' : 'vui-icon-collapse';

			evt.data.elem
				.removeClass( collapsedClassName );

			evt.data.anchor
				.attr( 'class', className )
				.attr( 'aria-expanded', true )
				.find( '.vui-offscreen' ).text( evt.data.hideText );

			evt.data.target
				.css( 'display', 'block' )
				.attr( 'aria-hidden', false );

			setTimeout( function() {
				evt.data.target
					.removeClass( 'vui-heading-collapsible-target-collapsed' )
					.css( {
							'height': evt.data.target.data('height') + 'px'
						} );
				}, 50 );

		},

		_handleHover: function( evt ) {

			evt.data.isHover = true;

			var isCollapsed = evt.data.elem
				.is('.vui-heading-collapsible-collapsed');

			evt.data.elem.addClass( hoverClassName );

			evt.data.anchor.attr(
					'class',
					isCollapsed ? 'vui-icon-expand-h' : 'vui-icon-collapse-h'
				);

		},

		_handleTransitionEnd: function( evt ) {

			if( evt.originalEvent.propertyName != 'height' ) {
				return;
			}

			var isCollapsed = evt.data.elem
				.is('.vui-heading-collapsible-collapsed');
			if( isCollapsed ) {
				evt.data.target.css( 'display', 'none' );
			} else {
				evt.data.target.css( 'height', 'auto' );
			}

		}

	} );

	vui.addClassInitializer(
			'vui-heading-collapsible',
			function( node ) {
				$( node ).vui_collapsibleSection();
			}
		);

} )( window.vui );