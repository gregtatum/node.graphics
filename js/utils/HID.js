var wrapScope	= require('../utils/wrapScope'),
	mouse		= require('../constants/mouse');
	
var HID = function() {
	
	this.pressed = {};
	this.start();
	
};

HID.prototype = {
	
	start : function() {
		$(document).on('keydown', this.onKeyDown.bind(this) );		
	},
	
	end : function() {
		$(document).off('keydown', this.onKeyDown.bind(this) );		
	},
	
	onKeyDown : function(e) {
		this.pressed[e.keyCode] = true;
	},
	
	onKeyUp : function(e) {
		this.pressed[e.keyCode] = false;
	},
	
	onLoseFocus : function() {
		this.pressed = {};
	},
	
	isPressed : function( key ) {
		return this.pressed[key] === true;
	},
	
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
		}
		
	},
	
	wrapMouseUp : function( shortcuts, callback, context ) {
		
		//Strip out modifiers
		return this.wrapMouse( {
			
			modifiers: null,
			click: shortcuts.click
			
		}, callback, context );
		
	},
	
	extractKeys : function( shortcuts ) {
		
		return _.map( shortcuts, function( shortcut ) {
			if(_.has( shortcut, "keys" )) {
				return shortcut["keys"];
			} else {
				return shortcut;
			}
		});
		
	},
	
	extractMouse : function( shortcuts ) {
		
		var mouse = _.map( shortcuts, function( shortcut ) {
			if(_.has( shortcut, "mouse" )) {
				return shortcut["mouse"];
			} else {
				return null;
			}
		});
		
		return _.filter( mouse, function( button ) {
			return !_.isNull( button );
		});
		
	},
	
	shortcutClicksOnly : function( shortcut ) {
		
		//Useful for mouseups
		
		return {
			modifiers: null,
			click: shortcut.click
		};
	},
	
	normalizeWhich : function( e ) {
		if ( !e.which && e.button !== undefined ) {
			e.which = ( e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) ) );
		}
		switch (e.which) {
			case 1: return mouse.left; break;
			case 2: return mouse.middle; break;
			case 3: return mouse.right; break;
			default: return null;
		}
	}
}

module.exports = new HID();
