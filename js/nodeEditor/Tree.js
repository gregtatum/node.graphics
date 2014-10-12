var EventDispatcher = require('../utils/EventDispatcher');
var Tree = function( root, nodes, links ) {
	
	this.root = root;
	this.nodes = nodes;
	this.links = links;
	
	this.dispatch({
		type: "changed"
	});
	
};

var compareToProperty = function( node, key ) {
	return function( link ) {
		return link[key] === node;
	};		
};

Tree.prototype = {
	
	id : 0,
	
	isChild : function( parent, child) {
		
		var links = _.filter( this.links, compareToProperty(parent, "source") );
				
		return _.reduce( links, function( memo, link ) {
			
			return (
				memo ||
				link.target === child ||
				this.isChild( link.target, child )
			);
			
		}, false, this);
		
	},
	
	isImmediateChild : function(tree, parent, child) {
		
		var links = _.filter( this.links, compareToProperty(parent, "source") );
				
		return _.each( links, function( memo, link ) {
			
			return memo || link.target === child;
			
		}, false);
		
	},
	
	hasParents : function( node ) {
		var links = _.filter( this.links, compareToProperty(node, "target") );
		
		return links.length > 0;
	},
	
	getNodeById : function( id ) {
		
		return _.filter( this.nodes, function( node ) {
			return node.id === id;
		});
		
	},
	
	linkAngle : function( link ) {
		
		return Math.atan2(link.source.y - link.target.y, link.source.x - link.target.x);
		
	},
	
	navigateUp : function( node ) {
		
		//TEST ME
		
		var link = _.find( this.links, function( link ) {
			return link.target === link;
		});
		
		if(link) {
			return link.source;
		} else {
			return null;
		}
		
	},
	
	navigateDown : function( node ) {
		
		//TEST ME
		
		var parentLink, links, parentAngle, linkWithMostSimilarAngle;
		
		
		parentLink = _.find( this.links, function( link ) {
			return link.target === link;
		});
		
		links = _.filter( this.links, function( link ) {
			return link.source === link;
		});
		
		
		if(parentLink && links.length > 0) {
			
			parentAngle = this.linkAngle( parentAngle );
			
			var angles = _.map( this.links, this.linkAngle );
			
			linkWithMostSimilarAngle = _.reduce( angles, function( memo, angle, i ) {
				
				var angleDiff = Math.abs( parentAngle - angle );
				
				if( memo.link ) {
					
					if( memo.angleDiff < angleDiff ) {
						return memo;
					} else {
						return {
							link: links[i],
							angleDiff: angleDiff
						};
					}
					
				} else {
					return {
						link: links[i],
						angleDiff: angleDiff
					};
				}
				
			}, {} );
			
			return linkWithMostSimilarAngle.link.target;
			
		} else {
			return null;
		}
		
	},
	
	navigateLeft : function() {
		//TODO
	},
	
	navigateRight : function() {
		//TODO
	},
	
	addLink : function( source, target ) {
		
		this.links.push({source: source, target: target});
	
		this.dispatch({
			type: "changed"
		});
		
	},
	
	addNode : function( node, parent ) {
		this.nodes.push( node );
		
		if( parent ) {
			this.links.push({source: parent, target: node});
		}
		
		this.dispatch({
			type: "changed"
		});
		
		return node;
	},
	
	hasNaN : function() {
		console.log(
			_.reduce( this.nodes, function( memo, node ) {
				return isNaN(node.x) || memo;
			}, false)
		);
	},
	
	addNodeByType : function( type, x, y, parent ) {
		
		var node = {
			x: x,
			y: y,
			px: x,
			py: y,
			type: type,
			depth: (parent ? parent.depth + 1 : 0),
			id: ++Tree.prototype.id
		}
		
		return this.addNode( node, parent );
		
	},
	
	select : function( node ) {
		
	},
	
	changeLinkSource : function( source, target ) {
		
		if( this.isChild( source, target ) ) return;
		
		var linkToRemove = _.find( this.links, function( link ) {
			return link.target === source;
		});
		
		this.links.splice( this.links.indexOf( linkToRemove ), 1 );
		
		this.addLink( target, source );
	}
	
};

EventDispatcher.prototype.apply( Tree.prototype );

module.exports = Tree;