var Cursor = function( nodeEditor, id ) {
	
	this.nodeEditor = nodeEditor;
	
	this.node = this.nodeEditor.tree.getNodeById( id );
};

module.exports = Cursor;

Cursor.prototype = {

};