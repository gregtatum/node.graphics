var wrapScope		= require('../../utils/wrapScope'),
	mouse			= require('../../constants/mouse'),
	EventDispatcher = require('../../utils/EventDispatcher');
	
var modifierKeys = [
	"command",
	"control",
	"option",
    "shift"
];
	
var Keyboard = function( $scope ) {
	
	this.$scope = $scope;
	this.dispatcher = new EventDispatcher();
	this.registeredKeypresses = [];
	this.eventScope = ".HID.Keyboard" + Keyboard.prototype._id;
	Keyboard.prototype._id++;
	
	this._handleKeyDownWrapped	= wrapScope( this._handleKeyDown, this );
	this._handleKeyUpWrapped	= wrapScope( this._handleKeyUp, this );

	if( this.$scope ) {
		this.start( this.$scope );
	}
	
};

module.exports = Keyboard;

Keyboard.prototype = {
	
	_id : 0,
	
	start : function( $scope ) {
		this.$scope = $scope;
		this.$scope.on('keydown'+this.eventScope, this._handleKeyDownWrapped );
	},
	
	end : function() {
		this.$scope.on('keydown'+this.eventScope, null );
		this.clearKeypresses();
	},

	_handleKeyDown : function() {
		this.dispatcher.dispatch({type:'keypress'});
	},

	on : function( shortcuts, callback, context ) {
		
		
		if(!_.isArray( shortcuts )) {
			shortcuts = [shortcuts];
		}
		
		_.each( shortcuts, function( shortcut ) {
			
			var keyChecker = function( jQueryEvent ) {
				
				var modifiersCorrect, keysCorrect;
				
				var modifiers = shortcut.modifiers || {};
			
				modifiersCorrect = _.reduce( modifierKeys, function( memo, modifierKey ) {
				
					
					return memo && d3.event[ mouse[modifierKey] ] === !!modifiers[modifierKey];
				
				}, true );
					
				
				keysCorrect = d3.event.keyCode === shortcut.key;
				
				if( modifiersCorrect && keysCorrect ) {
					callback.apply(context);
				}
			};
			
			this.dispatcher.on('keypress', keyChecker);
		
			this.registeredKeypresses.push({
				keyChecker: keyChecker,
				callback: callback
			});
			
		}, this);
				
	},
	
	off : function( callback ) {
		
		var keypresses = _.filter( this.registeredKeypresses, function( keypress ) {
			return keypress.callback === callback;
		});
		
		_.each( keypresses, function( keypress ) {

			this.off( keypress.keyChecker );
		
			this.registeredKeypress.splice( this.registeredKeypress.indexOf(keypress), 1);
			
		}, this);
		
	}
};
