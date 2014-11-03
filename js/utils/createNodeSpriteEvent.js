// Create a handler that dispatches an event to the nodeType and specific sprite
module.exports = function( eventName, sprite, nodeType, nodeEditor ) {
	
	return function( spriteEvent ) {
			
		var i = sprite.nodeIndex;
		var nodeDispatcher = nodeType.dispatchers[i];
		var nodeTypeDispatcher = nodeType;
		var allNodesDispatcher = nodeEditor.nodeDispatcher;
		
		var event = {
			type: eventName,
			originalEvent: spriteEvent.originalEvent,
			spriteEvent: spriteEvent,
			sprite: sprite,
			node: nodeType.nodes[i],
			nodeType: nodeType,
			nodeIndex: i,
			dispatchers: {
				node : nodeDispatcher,
				nodeType : nodeTypeDispatcher,
				allNodes : allNodesDispatcher
			}
		};
		// console.log('dispatching', eventName);
		
		nodeDispatcher.dispatch( event );
		nodeTypeDispatcher.dispatch( event );
		allNodesDispatcher.dispatch( event );
	};
	
};