/*jslint browser: true*/

(function() {

	'use strict';

	var classNames = {
			changed: 'vui-heading-collapsible-changed',
			target: 'vui-heading-collapsible-target',
			transition: 'vui-heading-collapsible-transition'
		};

	var transitionEnd = 'transitionend.vui webkitTransitionEnd.vui';

	var finishTransition = function( evt, force ) {

			var hasTransitions = 'transition' in document.body.style ||
				'webkitTransition' in document.body.style ||
				'MozTransition' in document.body.style;

			if( !hasTransitions || force ) {
				evt.originalEvent = { propertyName: 'height' };
				evt.data.me._handleTransitionEnd( evt );
			}

		};

	$.widget( 'vui.vui_collapsibleSection', {

		_create: function() {

			var me = this;

			var targetInfo = this._getTargetInfo();
			if( targetInfo === null ) {
				return;
			}

			this._createAnchor();

			var evtData = {
					me: this,
					inProgress: false,
					isHover: false,
					scrollTimeout: null
				};

			this.element
				.on( 'vui-collapse', evtData, this._handleCollapse )
				.on( 'vui-expand', evtData, this._handleExpand )
				.on( 'click.vui', evtData, this._handleClick )
				.on( 'mouseover.vui', evtData, this._handleHover )
				.on( 'mouseout.vui', evtData, this._handleBlur );

			this.anchor
				.attr( 'aria-controls', targetInfo.id )
				.attr( 'aria-expanded', targetInfo.isVisible ? 'true' : 'false' )
				.on( 'focus', evtData, this._handleHover )
				.on( 'blur', evtData, this._handleBlur );

			this.icon
				.attr( 'class', targetInfo.isVisible ? 'vui-heading-collapsible-icon-collapse' : 'vui-heading-collapsible-icon-expand' );

			this.target
				.vui_changeTracker()
				.addClass( classNames.target )
				.attr( 'aria-hidden', targetInfo.isVisible ? 'false' : 'true' )
				.css( 'display', targetInfo.isVisible ? 'block' : 'none' )
				.on( transitionEnd, evtData, this._handleTransitionEnd )
				.on( 'vui-expand', evtData, this._handleExpand )
				.on( 'vui-change vui-restore', function() {
					me.anchor.toggleClass(
							classNames.changed,
							$( this ).vui_changeTracker('containsChanges')
						);
				} );

		},

		_destroy: function () {

			this.element
				.off( 'vui-collapse vui-expand click.vui mouseover.vui mouseout.vui vui-collapsibleSection-done' );

			this.icon.remove();
			this.anchor.contents().unwrap();

			this.target
				.removeClass( classNames.target + ' ' + classNames.transition )
				.off( transitionEnd + ' vui-expand vui-change vui-restore' )
				.removeAttr( 'aria-hidden' )
				.removeData( 'height' );

		},

		_createAnchor: function() {

			this.element.contents().wrapAll(
					'<a href="javascript:void(0);"></a>'
				);
			this.anchor = this.element.find( 'a');

			this.icon = $( '<span></span>' );
			this.anchor.append( this.icon );

		},

		_getTargetInfo: function() {

			var targetId = this.element.attr( 'data-target' );
			if( targetId === undefined ) {
				return null;
			}

			var target = document.getElementById( targetId );
			if( target === null ) {
				return null;
			}

			this.target = $( target );

			var targetInfo = {
					id: targetId,
					isVisible: this.target.is(":visible")
				};

			// initially hidden, we need to calculate height
			if( !targetInfo.isVisible ) {
				this.target.css(
						{
							position: 'absolute',
							visibility: 'hidden',
							display: 'block'
						}
					);
			}

			this.target.data( 'height', this.target.outerHeight( false ) );

			if( !targetInfo.isVisible ) {
				this.target.css(
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

			var isCollapsed = evt.data.me.target.attr( 'aria-hidden' ) == 'true';

			evt.data.me.icon.attr(
					'class',
					isCollapsed ? 'vui-heading-collapsible-icon-expand' : 'vui-heading-collapsible-icon-collapse'
				);

		},

		_handleClick: function( evt ) {

			var isCollapsed = evt.data.me.target.attr( 'aria-hidden' ) == 'true';
			$( this ).trigger( isCollapsed ? 'vui-expand' : 'vui-collapse' );

		},

		_handleCollapse: function( evt ) {

			if( evt.data.inProgress ) {
				return;
			}
			evt.data.inProgress = true;

			evt.data.me.icon.attr(
					'class',
					evt.data.isHover ? 'vui-heading-collapsible-icon-expand-h' : 'vui-heading-collapsible-icon-expand'
				);

			evt.data.me.anchor
				.attr( 'aria-expanded', false );

			var forceTransition = false;
			var targetIsVisible = evt.data.me.target.is(":visible");
			if( targetIsVisible ) {
				var targetHeight = evt.data.me.target.outerHeight( false );
				evt.data.me.target
					.data( 'height', targetHeight )
					.css( 'height', targetHeight + 'px' );
			} else {
				forceTransition = true;
			}

			setTimeout( function() {
					if( !evt.data ) {
						return;
					}
					if( !forceTransition ) {
						forceTransition = evt.data.me.target.data('height') === 0;
					}
					evt.data.me.target
						.addClass( classNames.transition )
						.attr( 'aria-hidden', true )
						.css( 'height', '' );
					finishTransition( evt, forceTransition );
				}, 50 );

		},

		_handleExpand: function( evt ) {

			if( evt.data.inProgress ) {
				return;
			}
			evt.data.inProgress = true;

			evt.data.me.icon.attr(
					'class',
					evt.data.isHover ? 'vui-heading-collapsible-icon-collapse-h' : 'vui-heading-collapsible-icon-collapse'
				);

			evt.data.me.anchor
				.attr( 'aria-expanded', true );

			evt.data.me.target
				.css( 'display', 'block' );

			setTimeout( function() {
					if( !evt.data ) {
						return;
					}
					var force = evt.data.me.target.height() ==
						evt.data.me.target.data('height');
					evt.data.me.target
						.addClass( classNames.transition )
						.attr( 'aria-hidden', false )
						.css( { 'height': evt.data.me.target.data('height') + 'px' } );
					evt.data.me._scroll( evt.data, true );
					finishTransition( evt, force );
				}, 50 );

		},

		_handleHover: function( evt ) {

			evt.data.isHover = true;

			var isCollapsed = evt.data.me.target.attr( 'aria-hidden' ) == 'true';
			evt.data.me.icon.attr(
					'class',
					isCollapsed ? 'vui-heading-collapsible-icon-expand-h' : 'vui-heading-collapsible-icon-collapse-h'
				);

		},

		_handleTransitionEnd: function( evt ) {

			if( !evt || !evt.originalEvent || evt.originalEvent.propertyName != 'height' ) {
				return;
			}

			evt.data.inProgress = false;

			evt.data.me.target.removeClass( classNames.transition );

			var isCollapsed = evt.data.me.target.attr( 'aria-hidden' ) == 'true';
			if( isCollapsed ) {
				evt.data.me.target.css( 'display', 'none' );
			} else {
				evt.data.me.target.css( 'height', '' );
				evt.data.me._scroll( evt.data, false );
			}

			evt.data.me.element.trigger( 'vui-collapsibleSection-done' );

		},

		_scroll: function( data, keepScrolling ) {

			clearTimeout( data.scrollTimeout );
			data.scrollTimeout = null;

			var targetBottom = data.me.target.offset().top +
				data.me.target.height() + 50;
			var scrollTop = $( window ).scrollTop();
			var windowBottom = scrollTop + $( window ).height();

			var diff = targetBottom - windowBottom;
			if( diff > 0 ) {
				window.scrollTo( 0, scrollTop + diff );
			}

			if( keepScrolling ) {
				data.scrollTimeout = setTimeout(
						function() { data.me._scroll( data, true ); },
						10
					);
			}

		}

	} );

} )();
