var GroupNode = require('./group');

var RootNode = function() {
	
	GroupNode.apply( this, arguments );
	
	//Change cssClass
	this.cssClass = "node-type-root";
	this.$nodes = this.$scope.selectAll("."+this.cssClass);
	
}

RootNode.prototype = _.extend( {}, GroupNode.prototype, {
	
	
});

module.exports = RootNode;