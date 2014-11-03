var EventDispatcher = require('../utils/EventDispatcher');

var callbackToEvents = function( object, events ) {
	
	if( !_.isArray( event ) ) {
		throw new Error("Event must be an array");
	}

	object.prototype.apply( EventDispatcher.prototype );
	
	_.each( events, function( event ) {
		object[event] = function( originalEvent ) {
			object.dispatch({
				type: event,
				event: originalEvent
			});
		};
	});
	
};

module.exports = callbackToEvents;