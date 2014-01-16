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

	var classNames = {
			collapsed: 'vui-heading-collapsible-collapsed',
			target: 'vui-heading-collapsible-target',
			transition: 'vui-heading-collapsible-transition'
		};

	var transitionEnd = 'transitionend.vui webkitTransitionEnd.vui';

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

			$elem.contents().wrapAll( '<a href="javascript:void(0);"></a>' );
			this.anchor = $elem.find( 'a');

			this.icon = $( '<span></span>' );
			this.anchor.append( this.icon );

			var evtData = {
					anchor: this.anchor,
					icon: this.icon,
					elem: $elem,
					isFirst: true,
					isHover: false,
					target: targetInfo.$
				};

			$elem
				.on( 'vui-collapse', evtData, this._handleCollapse )
				.on( 'vui-expand', evtData, this._handleExpand )
				.on( 'click.vui', this._handleClick )
				.on( 'mouseover.vui', evtData, this._handleHover )
				.on( 'mouseout.vui', evtData, this._handleBlur )
				.trigger(  targetInfo.isVisible ? 'vui-expand': 'vui-collapse' );

			this.anchor
				.attr( 'aria-controls', targetInfo.id )
				.on( 'focus', evtData, this._handleHover )
				.on( 'blur', evtData, this._handleBlur );

			this.target
				.addClass( classNames.target )
				.on( transitionEnd, evtData, this._handleTransitionEnd );

		},

		_destroy: function () {

			var $elem = this.element;

			$elem
				.off( 'vui-collapse vui-expand click.vui mouseover.vui mouseout.vui' )
				.removeClass( classNames.collapsed );

			this.icon.remove();
			this.anchor.contents().unwrap();

			this.target
				.removeClass(
					classNames.target + ' ' +
					classNames.transition
				)
				.off( transitionEnd )
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

			evt.data.icon.attr(
					'class',
					isCollapsed ? 'vui-icon-expand' : 'vui-icon-collapse'
				);

		},

		_handleClick: function( evt ) {

			var isCollapsed = $( this )
				.is('.vui-heading-collapsible-collapsed');
			$( this ).trigger( isCollapsed ? 'vui-expand' : 'vui-collapse' );

		},

		_handleCollapse: function( evt ) {

			evt.data.isFirst = false;

			evt.data.elem
				.addClass( classNames.collapsed );

			var className = evt.data.isHover ?
				'vui-icon-expand-h' : 'vui-icon-expand';

			evt.data.icon
				.attr( 'class', className );

			evt.data.anchor
				.attr( 'aria-expanded', false );
			
			var targetIsVisible = evt.data.target.is(":visible");
			if( targetIsVisible ) {
				var targetHeight = evt.data.target.outerHeight( false );
				evt.data.target
					.data( 'height', targetHeight )
					.css( 'height', targetHeight + 'px' );
			}

			setTimeout( function() {
					if( !evt.data ) {
						return;
					}
					evt.data.target
						.addClass( classNames.transition )
						.attr( 'aria-hidden', true )
						.css( 'height', '' );
				}, 50 );

		},

		_handleExpand: function( evt ) {

			var className = evt.data.isHover ?
				'vui-icon-collapse-h' : 'vui-icon-collapse';

			evt.data.elem
				.removeClass( classNames.collapsed );

			evt.data.icon
				.attr( 'class', className );

			evt.data.anchor
				.attr( 'aria-expanded', true );
			
			evt.data.target
				.css( 'display', 'block' );

			if( evt.data.isFirst ) {
				evt.data.isFirst = false;
				evt.data.target.attr( 'aria-hidden', false );
				return;
			}

			setTimeout( function() {
				if( !evt.data ) {
					return;
				}
				evt.data.target
					.addClass( classNames.transition )
					.attr( 'aria-hidden', false )
					.css( {
							'height': evt.data.target.data('height') + 'px'
						} );
				}, 50 );

		},

		_handleHover: function( evt ) {

			evt.data.isHover = true;

			var isCollapsed = evt.data.elem
				.is('.vui-heading-collapsible-collapsed');

			evt.data.icon.attr(
					'class',
					isCollapsed ? 'vui-icon-expand-h' : 'vui-icon-collapse-h'
				);

		},

		_handleTransitionEnd: function( evt ) {

			if( !evt || !evt.originalEvent || evt.originalEvent.propertyName != 'height' ) {
				return;
			}

			evt.data.target.removeClass( classNames.transition );

			var isCollapsed = evt.data.elem
				.is('.vui-heading-collapsible-collapsed');
			if( isCollapsed ) {
				evt.data.target.css( 'display', 'none' );
			} else {
				evt.data.target.css( 'height', '' );
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