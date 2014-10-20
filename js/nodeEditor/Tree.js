var EventDispatcher = require('../utils/EventDispatcher');
var Tree = function( nodeEditor ) {
	
	this.nodeEditor = nodeEditor;
	
	this.root = {
		x: this.nodeEditor.scene.width * 0.6,
		y: this.nodeEditor.scene.height * 0.6,
		depth: 0,
		type: "root",
		id: 0
	};
	this.nodes = [this.root];
	this.links = [];
	
	this.dispatch({
		type: "changed",
		nodes: this.nodes,
		links: this.links
	});
	
};

var compareToProperty = function( node, key ) {
	return function( link ) {
		return link[key] === node;
	};		
};

Tree.prototype = {
	
	id : 0,
	
	isChild : function( parent, child ) {
		
		var links = _.filter( this.links, compareToProperty(parent, "source") );
				
		return _.reduce( links, function( memo, link ) {
			
			return (
				memo ||
				link.target === child ||
				this.isChild( link.target, child )
			);
			
		}, false, this);
		
	},
	
	isImmediateChild : function( tree, parent, child ) {
		
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
	
	getNodesByType : function( type ) {
		
		return _.filter( this.nodes, function( node ) {
			return node.type === type;
		});
		
	},
	
	linkAngle : function( link ) {
		
		return Math.atan2(link.source.y - link.target.y, link.source.x - link.target.x);
		
	},
	
	navigateUp : function( node ) {
		
		var link = _.find( this.links, function( link ) {
			return link.target === node;
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
		
		links = _.filter( this.links, function( link ) {
			return link.source === node;
		});
		
		
		if(links.length >= 1) {
			
			parentLink = _.find( this.links, function( link ) {
				return link.target === node;
			});
			
			if(parentLink) {
				parentAngle = this.linkAngle( parentLink );
			} else {
				parentAngle = Math.PI * 1.5;
			}
			
			var angles = _.map( links, this.linkAngle );
			
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
	
	_navigateSiblings : function( node, direction ) {
		
		var parentLink, parentAngle, siblingLinks, nextLink, siblingAngles;
		
		parentLink = _.find( this.links, function( link ) {
			return link.target === node;
		});
		
		if(!parentLink) return null;
		
		siblingLinks = _.filter( this.links, function( link ) {
			return parentLink.source === link.source && link.target !== node;
		});
	
		if( parentLink && siblingLinks.length >= 1 ) {
			
			parentAngle = this.linkAngle( parentLink );
			
			siblingAngles = _.map( siblingLinks, this.linkAngle );
		
			nextLink = _.reduce( siblingAngles, function( memo, angle, i ) {
			
				var angleDiff = ( ( parentAngle - angle ) * direction ) % ( 2 * Math.PI );
				if( angleDiff < 0 ) angleDiff += 2 * Math.PI;
			
				if( memo.link ) {
				
					if( memo.angleDiff < angleDiff ) {
						return memo;
					} else {
						return {
							link: siblingLinks[i],
							angleDiff: angleDiff
						};
					}
				
				} else {
					return {
						link: siblingLinks[i],
						angleDiff: angleDiff
					};
				}
			
			}, {} );
			
			return nextLink.link.target;
		}
		
	},
	
	navigateLeft : function( node ) {
		return this._navigateSiblings( node, -1 );
	},
	
	navigateRight : function( node ) {
		return this._navigateSiblings( node, 1 );
	},
	
	_nearestInRange : function() {
		
		function rangeIsPoorlyFormed( lowerRadians, upperRadians ) {
			return (
				lowerRadians >= upperRadians ||
				upperRadians - lowerRadians > 2 * Math.PI ||
				lowerRadians > 2 * Math.PI
			);
		}
		
		function isInRange( angle, lowerRadians, upperRadians) {
			
			angle %= 2 * Math.PI;
			if( angle < 0 ) angle += 2 * Math.PI;
			
			if( angle < lowerRadians ) {
				angle += 2 * Math.PI;
			}
			
			return angle >= lowerRadians && angle < upperRadians;
			
			
		}
		
		return function( nodeA, lowerRadians, upperRadians ) {
		
			if( rangeIsPoorlyFormed( lowerRadians, upperRadians ) ) {
				throw "The defined range is poorly formed.";
			}
			
			var result = _.reduce(this.nodes, function( memo, nodeB ) {
			
				if( nodeA === nodeB ) return memo;
				
				var distanceSq;
				var deltaX = nodeB.x - nodeA.x;
				var deltaY = nodeB.y - nodeA.y;
				var angle = Math.atan2( deltaY, deltaX );
			
				if( isInRange( angle, lowerRadians, upperRadians ) ) {
			
					distanceSq = deltaX * deltaX + deltaY * deltaY;
				
					if( !memo || distanceSq < memo.distanceSq ) {
						return {
							distanceSq : distanceSq,
							node: nodeB
						};
					} else {
						return memo;
					}
				
				} else {
					return memo;
				}
			
			}, null);
			
			if(result) {
				return result.node;
			} else {
				return null;
			}
		};
	}(),
	
	nearestDown : function( node ) {
		return this._nearestInRange( node, (Math.PI*0.20), (Math.PI*0.80) );
	},
	
	nearestLeft : function( node ) {
		return this._nearestInRange( node, (Math.PI*0.80), (Math.PI*1.20) );
	},
	
	nearestUp : function( node ) {
		return this._nearestInRange( node, (Math.PI*1.20), (Math.PI*1.80) );
	},
	
	nearestRight : function( node ) {
		return this._nearestInRange( node, (Math.PI*1.80), (Math.PI*2.20) );
	},
	
	addLink : function( source, target ) {
		
		this.links.push({source: source, target: target});
	
		this.dispatch({
			type: "changed",
			nodes: this.nodes,
			links: this.links
		});
		
	},
	
	addNode : function( node, parent ) {
		this.nodes.push( node );
		
		if( parent ) {
			this.links.push({source: parent, target: node});
		}
		
		this.dispatch({
			type: "changed",
			nodes: this.nodes,
			links: this.links
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
		};
		
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