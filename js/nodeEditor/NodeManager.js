var nodeTypes	= require('./nodeTypes');

var NodeManager = function( nodeEditor ) {
	
	this.nodeEditor = nodeEditor;
	this.types = [];

	this.initiateNodeTypes();	
};

module.exports = NodeManager;

NodeManager.prototype = {

	initiateNodeTypes : function() {
		
		_.each( nodeTypes, function( NodeType, type ) {
			
			this.types[type] = new NodeType( this.nodeEditor );
			this.types[type].handleTreeChange();
			
		}, this);
		
	},
	
	getSprite : function( node ) {
		return this.types[ node.type ].sprites[ node.index ];
	}

};