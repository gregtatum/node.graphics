var wrapScope		= require('../../utils/wrapScope'),
	mouse			= require('../../constants/mouse'),
	EventDispatcher = require('../../utils/EventDispatcher');

var Mouse = function() {};

module.exports = Mouse;

Mouse.prototype = {
	
	wrapScope : wrapScope,
	
	wrapMouse : function( shortcuts, callback, context ) {
		
		var scope = this;
		
		return function() {
			
			var modifiersCorrect, clickCorrect;
				
			modifiersCorrect = _.reduce( shortcuts.modifiers, function( memo, modifier ) {
			
				return memo && d3.event[modifier];
			
			}, true );
		
			clickCorrect = shortcuts.click === scope.normalizeWhich( d3.event );
		
			if( modifiersCorrect && clickCorrect ) {
				callback.call(context, this );
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
	}
	
};

EventDispatcher.prototype.apply( Mouse.prototype );