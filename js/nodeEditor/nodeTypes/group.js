var HID = require('../../utils/HID'),
	shortcuts = require('../../environment/shortcuts/nodeEditor.shortcuts.js'),
	NodeLasso = require('../tools/NodeLasso');

var GroupNode = function( nodeEditor, settings ) {
	
	this.shortcuts = shortcuts.nodeTypes.group;
	
	this.nodeEditor = nodeEditor;
	this.$scope = nodeEditor.$scope;
	
	this.cssClass = "node-type-group";
	this.$nodes = this.$scope.selectAll("."+this.cssClass);
	this.nodeLasso = new NodeLasso( this.$scope, this.shortcuts.drawLine );
	
	this.nodeLasso.on( 'lasso', this.onLasso.bind(this) );
	this.nodeLasso.on( 'emptyRelease', this.onEmptyRelease.bind(this) );
}

module.exports = GroupNode;

GroupNode.prototype = {
	
	appendNewNodes : function( data ) {
		
		var $nodes = this.$nodes
			.data( data, function(d) {return d.id;} )
			.enter().append("circle")
			.attr("class", "node " + this.cssClass)
			.attr("r", function(d) {
				return Math.max(10 - d.depth, 3);
			});
			
		this.setHandlers( $nodes );
			
		return $nodes;
			
	},
	
	setHandlers : function( $newNodes ) {
		
		this.nodeLasso.setHandlers( $newNodes );

	},
	
	onLasso : function( e ) {
		this.nodeEditor.tree.changeLinkSource( e.source, e.target );
	},
	
	onEmptyRelease : function( e ) {
		
		var parent = d3.select(e.source).data()[0];
		var node = this.nodeEditor.tree.addNodeByType( "group", e.x, e.y, parent );
		
	}
	
};