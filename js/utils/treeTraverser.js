var matchesLinkSourceComparison = function( node ) {
	
	return function( link ) {
		return link.source === node;
	};
};

var matchesLinkTargetComparison = function( node ) {
	
	return function( link ) {
		return link.target === node;
	};
};

var treeTraverser = {
	
	isChild : function(tree, parent, child) {
		
		var links = _.filter( tree.links, matchesLinkSourceComparison(parent) );
				
		return _.reduce( links, function( memo, link ) {
			
			return (
				memo ||
				link.target === child ||
				treeTraverser.isChild( tree, link.target, child )
			);
			
		}, false);
		
	},
	
	isImmediateChild : function(tree, parent, child) {
		
		var links = _.filter( tree.links, matchesLinkSourceComparison(parent) );
				
		return _.each( links, function( memo, link ) {
			
			return memo || link.target === child;
			
		}, false);
		
	},
	
	hasParents : function( tree, node ) {
		var links = _.filter( tree.links, matchesLinkTargetComparison(node) );
		
		return links.length > 0;
	},
	
	addLink : function( tree, parent, child ) {
		this.tree.links
	}
	
};

module.exports = treeTraverser;