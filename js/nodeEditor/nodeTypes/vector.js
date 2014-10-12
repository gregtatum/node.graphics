var VectorNode = function( nodeEditor ) {
	
	this.nodeEditor = nodeEditor;
	this.$scope = nodeEditor.$scope;
	
	this.cssClass = "node-type-vector";
	this.$nodes = this.$scope.selectAll("."+this.cssClass);
};

module.exports = VectorNode;

VectorNode.prototype = {

	appendNewNodes : function( data ) {
		
		return this.$nodes
			.data( data, function(d) {return d.id;} )
			.enter().append("circle")
			.attr("class", "node " + this.cssClass)
			.attr("r", 5);
			
	},
	
};