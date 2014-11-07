var wrapScope		= require('../../utils/wrapScope'),
	mouse			= require('../../constants/mouse'),
	EventDispatcher = require('../../utils/EventDispatcher');

var Mouse = function( nodeEditor ) {
	
	this.nodeEditor = nodeEditor;
	
	this.position = {
		x: 0,
		y: 0
	};
	
	_.bindAll( this, "_handleMove", "start", "stop");
	
	this.nodeEditor.on( 'show', this.start );
	this.nodeEditor.on( 'hide', this.stop );
	this.nodeEditor.on( 'destroy', this.stop );
};

module.exports = Mouse;

Mouse.prototype = {
	
	wrapScope : wrapScope,
	
	wrapMouse : function( shortcuts, callback, context ) {
		
		var scope = this;
		
		return function( event ) {
			var modifiersCorrect, clickCorrect;
			
			modifiersCorrect = _.reduce( shortcuts.modifiers, function( memo, modifier ) {
			
				return memo && event.originalEvent[modifier];
			
			}, true );
			
			clickCorrect = shortcuts.click === scope.normalizeWhich( event.originalEvent );
			
			if( modifiersCorrect && clickCorrect ) {
				callback.call(context, event );
			}
		};
		
	},
	
	wrapMouseUp : function( shortcuts, callback, context ) {
		
		//Strip out modifiers
		return this.wrapMouse( {
			
			modifiers: null,
			click: shortcuts.click
			
		}, callback, context );
		
	},
		
	normalizeWhich : function( e ) {
		if ( !e.which && e.button !== undefined ) {
			e.which = ( e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) ) );
		}
		switch (e.which) {
			case 1: return mouse.left;
			case 2: return mouse.middle;
			case 3: return mouse.right;
			default: return null;
		}
	},
	
	start : function() {
		$(window).on('mousemove', this._handleMove);
	},
	
	stop : function() {
		$(window).off('mousemove', this._handleMove);
	},
	
	_handleMove : function( e ) {
		
		var offset = this.nodeEditor.$scope.offset();
		
		this.position.x = (e.pageX - offset.left) * this.nodeEditor.scene.ratio;
		this.position.y = (e.pageY - offset.top) * this.nodeEditor.scene.ratio;
		
	}
	
	
};

EventDispatcher.prototype.apply( Mouse.prototype );