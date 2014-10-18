(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./js/index.js":[function(require,module,exports){
var nodeEditor = require('./nodeEditor/NodeEditor');

window.editor = new nodeEditor();
},{"./nodeEditor/NodeEditor":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/nodeEditor/NodeEditor.js"}],"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/constants/keys.js":[function(require,module,exports){
module.exports = {
	"backspace":		8,
	"tab":				9,
	"enter":			13,
	"shift":			16,
	"ctrl":				17,
	"alt":				18,
	"pause":			19,
	"caps lock":		20,
	"escape":			27,
	"spacebar":			32,
	"pageup":			33,
	"pagedown":			34,
	"end":				35,
	"home":				36,
	"left":				37,
	"up":				38,
	"right":			39,
	"down":				40,
	"insert":			45,
	"delete":			46,
	"num0":				48,
	"num1":				49,
	"num2":				50,
	"num3":				51,
	"num4":				52,
	"num5":				53,
	"num6":				54,
	"num7":				55,
	"num8":				56,
	"num9":				57,
	"a":				65,
	"b":				66,
	"c":				67,
	"d":				68,
	"e":				69,
	"f":				70,
	"g":				71,
	"h":				72,
	"i":				73,
	"j":				74,
	"k":				75,
	"l":				76,
	"m":				77,
	"n":				78,
	"o":				79,
	"p":				80,
	"q":				81,
	"r":				82,
	"s":				83,
	"t":				84,
	"u":				85,
	"v":				86,
	"w":				87,
	"x":				88,
	"y":				89,
	"z":				90,
	"command":			91,
	"rightWindowKey":	92,
	"select key":		93,
	"numpad0":			96,
	"numpad1":			97,
	"numpad2":			98,
	"numpad3":			99,
	"numpad4":			100,
	"numpad5":			101,
	"numpad6":			102,
	"numpad7":			103,
	"numpad8":			104,
	"numpad9":			105,
	"multiply":			106,
	"add":				107,
	"subtract":			109,
	"decimal":			110,
	"divide":			111,
	"f1":				112,
	"f2":				113,
	"f3":				114,
	"f4":				115,
	"f5":				116,
	"f6":				117,
	"f7":				118,
	"f8":				119,
	"f9":				120,
	"f10":				121,
	"f11":				122,
	"f12":				123,
	"numLock":			144,
	"scrollLock":		145,
	"semicolon":		186,
	"equals":			187,
	"comma":			188,
	"dash":				189,
	"period":			190,
	"forwardSlash":		191,
	"graveAccent":		192,
	"openBracket":		219,
	"backslash":		220,
	"closeBracket":		221,
	"singleQuote":		222
};
},{}],"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/constants/mouse.js":[function(require,module,exports){
var isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;

module.exports = {
	"left"		: 1,
	"middle"	: 2,
	"right"		: 3,
	"command"	: isMac ? "metaKey" : "ctrlKey",
	"control"	: isMac ? "ctrlKey" : "metaKey",
	"option"	: isMac ? "altKey" : "altKey",
	"shift"		: "shiftKey"
};
},{}],"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/environment/shortcuts/nodeEditor.shortcuts.js":[function(require,module,exports){
var keys	= require('../../constants/keys'),
	mouse	= require('../../constants/mouse');
	
module.exports = {
	exit				: [keys.escape],
	editMode			: [keys.spacebar],
	nodeLasso		: { modifiers: [mouse.command], click: mouse.left },
	nodeTypes : {
		group : {
			drawLine : { modifiers: [mouse.command], click: mouse.left }
		}
	},
	cursor : {
		up				: [{ key: keys.up }],
		down			: [{ key: keys.down }],
		left			: [{ key: keys.left }],
		right			: [{ key: keys.right }],
		siblingUp		: [{ modifiers: [mouse.shift], key: keys.up }],
		siblingDown		: [{ modifiers: [mouse.shift], key: keys.down }],
		siblingLeft		: [{ modifiers: [mouse.shift], key: keys.left }],
		siblingRight	: [{ modifiers: [mouse.shift], key: keys.right }]
	}
};
},{"../../constants/keys":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/constants/keys.js","../../constants/mouse":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/constants/mouse.js"}],"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/nodeEditor/NodeEditor.js":[function(require,module,exports){
var	d3				= require('d3'),
	EventDispatcher = require('../utils/EventDispatcher'),
	wrapScope		= require('../utils/wrapScope'),
	nodeTypeClasses	= require('./nodeTypes'),
	keys			= require('../environment/shortcuts/nodeEditor.shortcuts'),
	Keyboard		= require('../utils/HID/Keyboard'),
	Mouse			= require('../utils/HID/Mouse'),
	Cursor			= require('./tools/Cursor'),
	Tree			= require('./Tree');

function getId( d ) {
	return d.id;
}

var NodeEditor = function() {
	this.width = $(window).width();
	this.height = $(window).height();
	this.radius = 10;
	this.dragging = false;
	
	var root = {
		x: this.width * 0.6,
		y: this.height * 0.6,
		depth: 0,
		type: "root",
		id: 0
	};

	this.keyboard = new Keyboard( d3.select('body') );
	this.mouse = new Mouse();
	this.force = this.createForce( root );
	this.$scope = this.createSvg();
	this.backdrop = this.createBackdrop();
	
	this.tree = new Tree( root, this.force.nodes(), this.force.links() );
	
	this.$nodes = this.$scope.selectAll(".node");
	this.$links = this.$scope.selectAll(".link");
	
	this.nodeTypes = {};
	this.initiatedNodeTypes = [];

	this.setHandlers();
	this.restart();
	
	this.cursor = new Cursor( this, this.get$ElFromNode( root ) );
	
};

module.exports = NodeEditor;

NodeEditor.prototype = {
	
	createForce : function( root ) {
		
		return d3.layout.force()
			.size([this.width, this.height])
			.nodes([ root ]) // initialize with a single node
			.linkDistance(function(d) {
				return Math.max(100 - d.source.depth * 20, 10);
			})
			.charge(function(d) {
				return Math.min(-1000 / (d.depth + 1) , -60);
			})
			.on("tick", this.tick.bind(this) );
			
	},
	
	createSvg : function() {
		
		var svg = d3.select("body").append("svg")
		    .attr("width", this.width)
		    .attr("height", this.height);
//		    .on("mousemove", this.mousemove.bind(this) );
			
		return svg;
	},
	
	createBackdrop : function() {
		
		return this.$scope.append("rect")
		    .attr("width", this.width)
		    .attr("height", this.height)
			.attr("id", "node-editor-backdrop");
			
	},
	
	setHandlers : function() {
		//this.tree.on("changed", _.debounce( this.restart.bind(this), 1 ) );
		this.tree.on("changed", this.restart.bind(this) );
	},
	
	tick : function() {
		
		this.$links.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		this.$nodes.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });
	},
	
	restart : function() {
		var types;
	
		this.$links = this.$links.data( this.tree.links );

		this.$links.enter().insert("line", ".node")
			.attr("class", "link");

	
		// var drag = this.force.drag()
		// .on("dragstart", wrapScope(function( event ) {
		//
		// 	d3.event.sourceEvent
		// 	this.dragging = true;
		//
		// 	this.$nodes.classed( "fixed", function(d) {
		// 		return d.fixed = true
		// 	});
		//
		// }, this) )
		// .on("dragend", function( d ) {
		//
		// 	this.dragging = false;
		//
		// 	this.$nodes.classed( "fixed", function(d) {
		// 		return d.fixed = false
		// 	});
		//
		//
		// }.bind(this) )

		this.updateNodes();
			
		this.$nodes = this.$scope.selectAll(".node");
		
		//this.$nodes.call(drag);
		this.force.start();
		
		this.dispatch({ type: "nodesAdded" });
	},
	
	updateNodes : function() {
		
		//current, new
		var cTypesPresent, nTypesPresent, nodeDataByType;

		nodeDataByType = _.groupBy( this.tree.nodes, function( node ) {
			return node.type;
		});
		cTypesPresent = _.keys( nodeDataByType );
		nTypesPresent = _.difference( cTypesPresent, this.initiatedNodeTypes );
		
		this.initiateNodeTypes( nTypesPresent );
		this.addNewNodes( nodeDataByType );
		
		
	},
	
	initiateNodeTypes : function( newTypes ) {
		
		if(newTypes.length === 0) return;
		
		this.initiatedNodeTypes = _.flatten( [this.initiatedNodeTypes, newTypes] );
		
		_.each( newTypes, function( type ) {
			
			this.nodeTypes[type] = new nodeTypeClasses[type]( this );
			
		}, this);
		
	},
	
	addNewNodes : function( nodeDataByType ){
		
		_.each(nodeDataByType, function( nodeData, type ) {
			
			this.nodeTypes[type].appendNewNodes( nodeData );
			
		}, this);
		
	},
	
	get$ElFromNode : function( node ) {
		return this.$nodes.filter(function(d) {
			return d.id === node.id;
		});
	}
	
};

EventDispatcher.prototype.apply( NodeEditor.prototype );

},{"../environment/shortcuts/nodeEditor.shortcuts":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/environment/shortcuts/nodeEditor.shortcuts.js","../utils/EventDispatcher":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/utils/EventDispatcher.js","../utils/HID/Keyboard":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/utils/HID/Keyboard.js","../utils/HID/Mouse":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/utils/HID/Mouse.js","../utils/wrapScope":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/utils/wrapScope.js","./Tree":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/nodeEditor/Tree.js","./nodeTypes":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/nodeEditor/nodeTypes/index.js","./tools/Cursor":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/nodeEditor/tools/Cursor.js","d3":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/node_modules/d3/d3.js"}],"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/nodeEditor/Tree.js":[function(require,module,exports){
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
				var angle = Math.atan2( deltaY, deltaX )
			
				if( isInRange( angle, lowerRadians, upperRadians ) ) {
			
					distanceSq = deltaX * deltaX + deltaY * deltaY;
				
					if( !memo || distanceSq < memo.distanceSq ) {
						return {
							distanceSq : distanceSq,
							node: nodeB
						}
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
},{"../utils/EventDispatcher":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/utils/EventDispatcher.js"}],"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/nodeEditor/nodeTypes/group.js":[function(require,module,exports){
var shortcuts = require('../../environment/shortcuts/nodeEditor.shortcuts.js'),
	NodeLasso = require('../tools/NodeLasso');

var GroupNode = function( nodeEditor, settings ) {
	
	this.shortcuts = shortcuts.nodeTypes.group;
	
	this.nodeEditor = nodeEditor;
	this.$scope = nodeEditor.$scope;
	
	this.cssClass = "node-type-group";
	this.$nodes = this.$scope.selectAll("."+this.cssClass);
	this.nodeLasso = new NodeLasso( this.nodeEditor, this.shortcuts.drawLine );
	
	this.nodeLasso.on( 'lasso', this.onLasso.bind(this) );
	this.nodeLasso.on( 'emptyRelease', this.onEmptyRelease.bind(this) );
};

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
},{"../../environment/shortcuts/nodeEditor.shortcuts.js":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/environment/shortcuts/nodeEditor.shortcuts.js","../tools/NodeLasso":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/nodeEditor/tools/NodeLasso.js"}],"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/nodeEditor/nodeTypes/index.js":[function(require,module,exports){
module.exports = {
	group : require('./group'),
	root : require('./root'),
	vector : require('./vector')
};
},{"./group":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/nodeEditor/nodeTypes/group.js","./root":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/nodeEditor/nodeTypes/root.js","./vector":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/nodeEditor/nodeTypes/vector.js"}],"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/nodeEditor/nodeTypes/root.js":[function(require,module,exports){
var GroupNode = require('./group');

var RootNode = function() {
	
	GroupNode.apply( this, arguments );
	
	//Change cssClass
	this.cssClass = "node-type-root";
	this.$nodes = this.$scope.selectAll("."+this.cssClass);
	
};

RootNode.prototype = _.extend( {}, GroupNode.prototype, {
	
	
});

module.exports = RootNode;
},{"./group":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/nodeEditor/nodeTypes/group.js"}],"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/nodeEditor/nodeTypes/vector.js":[function(require,module,exports){
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
},{}],"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/nodeEditor/tools/Cursor.js":[function(require,module,exports){
var	shortcuts = require('../../environment/shortcuts/nodeEditor.shortcuts').cursor,
	wrapScope = require("../../utils/wrapScope");

var Cursor = function( nodeEditor, $node ) {
	
	this.nodeEditor = nodeEditor;
	this.$node = null;
	
	if( $node ) {
		this.setNode( $node );
	}
	this.addHandlers();
	this.add();
	
	this.handleHover = wrapScope( this.hover, this );
};

module.exports = Cursor;

Cursor.prototype = {
	
	addHandlers : function() {
		this.nodeEditor.keyboard.on( shortcuts.up, this.up, this );
		this.nodeEditor.keyboard.on( shortcuts.down, this.down, this );
		this.nodeEditor.keyboard.on( shortcuts.left, this.left, this );
		this.nodeEditor.keyboard.on( shortcuts.right, this.right, this );
		this.nodeEditor.keyboard.on( shortcuts.siblingUp, this.siblingUp, this );
		this.nodeEditor.keyboard.on( shortcuts.siblingDown, this.siblingDown, this );
		this.nodeEditor.keyboard.on( shortcuts.siblingLeft, this.siblingLeft, this );
		this.nodeEditor.keyboard.on( shortcuts.siblingRight, this.siblingRight, this );
		this.nodeEditor.on('nodesAdded', this.handleNodesAdded.bind(this) );
	},
	
	removeHandlers : function() {
		this.nodeEditor.keyboard.off( shortcuts.up, this.up, this );
		this.nodeEditor.keyboard.off( shortcuts.down, this.down, this );
		this.nodeEditor.keyboard.off( shortcuts.left, this.left, this );
		this.nodeEditor.keyboard.off( shortcuts.right, this.right, this );
		this.nodeEditor.keyboard.off( shortcuts.siblingUp, this.siblingUp, this );
		this.nodeEditor.keyboard.off( shortcuts.siblingDown, this.siblingDown, this );
		this.nodeEditor.keyboard.off( shortcuts.siblingLeft, this.siblingLeft, this );
		this.nodeEditor.keyboard.off( shortcuts.siblingRight, this.siblingRight, this );
	},
	
	navigateCheck : function( node ) {
		var $el;
		
		if( node ) {
			
			$el = this.nodeEditor.get$ElFromNode( node );
			
			this.setNode( $el, node );
		}	
	},
	
	handleNodesAdded : function( event ) {
		this.nodeEditor.$nodes.on('mouseover.Cursor', this.handleHover );

	},
	
	hover : function( el ) {

		var $node = d3.select(el);
		var node = $node.data()[0];
		
		if( node ) {
			this.setNode( $node, node );
		}
		
	},
	
	up : function() {
		console.log('up');
		this.navigateCheck( this.nodeEditor.tree.nearestUp( this.node ) );
	},
	
	down : function() {
		console.log('down');
		this.navigateCheck( this.nodeEditor.tree.nearestDown( this.node ) );
	},
	
	left : function() {
		console.log('left');
		
		this.navigateCheck( this.nodeEditor.tree.nearestLeft( this.node ) );
	},
	
	right : function() {
		console.log('right');
		
		this.navigateCheck( this.nodeEditor.tree.nearestRight( this.node ) );
	},
	
	siblingUp : function() {
		console.log('siblingUp');
		this.navigateCheck( this.nodeEditor.tree.navigateUp( this.node ) );
	},
	
	siblingDown : function() {
		console.log('siblingDown');
		this.navigateCheck( this.nodeEditor.tree.navigateDown( this.node ) );
	},
	
	siblingLeft : function() {
		console.log('siblingLeft');
		
		this.navigateCheck( this.nodeEditor.tree.navigateLeft( this.node ) );
	},
	
	siblingRight : function() {
		console.log('siblingRight');
		
		this.navigateCheck( this.nodeEditor.tree.navigateRight( this.node ) );
	},
	
	setNode : function( $node, node ) {
		
		this.$node = $node;
		
		if( this.$node && node ) {
			this.node = node;
		} else {
			this.node = $node.data()[0];
		}
		
		if( this.$circle ) {
			this.updateSize();
			this.updatePosition();
		}
		
	},
	
	add : function() {
		
		this.$circle = this.nodeEditor.$scope
			.append("circle")
			.attr("class", "node-cursor");
			
		this.updateSize();
		this.updatePosition();
		
		this.nodeEditor.force.on('tick.node-cursor', this.updatePosition.bind(this));
		
	},
	
	updateSize : function() {
		this.$circle.attr("r", parseInt(this.$node.attr('r'), 10) + 4 );
	},
	
	updatePosition : function() {

		this.$circle
			.attr('cx', this.$node.attr('cx'))
			.attr('cy', this.$node.attr('cy'));
		
	},
	
	remove : function() {
		if( this.$circle) {
			this.$circle.remove();
		}
	}
	
};
},{"../../environment/shortcuts/nodeEditor.shortcuts":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/environment/shortcuts/nodeEditor.shortcuts.js","../../utils/wrapScope":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/utils/wrapScope.js"}],"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/nodeEditor/tools/NodeLasso.js":[function(require,module,exports){
var	EventDispatcher = require('../../utils/EventDispatcher');

var NodeLasso = function( nodeEditor, shortcut ) {
	
	this.nodeEditor = nodeEditor;
	this.$scope = nodeEditor.$scope;
	
	this.$nodes = null;
	this.$sourceNode = null;
	this.$targetNode = null;
	this.sourceNode = null;
	this.targetNode = null;
	
	this.$line = null;
	this.$hoverCircle = null;
	this.$lassoTip = null;
	
	this.handlersMousedown		= this.nodeEditor.mouse.wrapMouse( shortcut, this.start, this );
	this.handlersMouseup		= this.nodeEditor.mouse.wrapMouseUp( shortcut, this.stop, this );
	this.handlersMousemove		= this.nodeEditor.mouse.wrapScope( this.move, this );
	this.handlersMouseoverNode	= this.nodeEditor.mouse.wrapScope( this.mouseoverNode, this );
	this.handlersMouseoutNode	= this.nodeEditor.mouse.wrapScope( this.mouseoutNode, this );

};

module.exports = NodeLasso;

NodeLasso.prototype = {
	
	start : function( node ) {

		d3.event.preventDefault();
		
		this.sourceNode = node;
		this.$sourceNode = d3.select(node)
			.classed("node-lasso-active", true);

		this.$nodes = this.$scope.selectAll('.node');

		this.$scope.classed('active-node-lasso', true);
		
		this.$line = this.$scope.insert('line', ':first-child')
			.classed("node-lasso", true);

		var position = d3.mouse( node );
		
		this.enterStage( position[0], position[1] );
		
		this.$scope.on('mousemove.node-lasso', this.handlersMousemove);
		this.$scope.on('mouseup.node-lasso', this.handlersMouseup);
		this.$scope.on('mouseleave.node-lasso', this.handlersMouseup);
		
		this.$nodes.on('mouseover.node-lasso', this.handlersMouseoverNode);
		this.$nodes.on('mouseout.node-lasso', this.handlersMouseoutNode);
	},
	
	stop : function( container ) {
		
		this.$scope.on('mousemove.node-lasso', null);
		this.$scope.on('mouseup.node-lasso', null);
		this.$scope.on('mouseleave.node-lasso', null);
		
		this.$nodes.on('mouseover.node-lasso', null);
		this.$nodes.on('mouseout.node-lasso', null);
		
		if( this.$hoverCircle ) {
			this.$hoverCircle.remove();
			this.$hoverCircle = null;
		}
		if( this.$lassoTip ) {
			this.$lassoTip.remove();
			this.$lassoTip = null;
		}

		this.$scope.classed('active-node-lasso', false);
		this.$nodes.classed('node-lasso-hover', false);
		this.$sourceNode.classed("node-lasso-active", false);
		
		if(this.targetNode) {
			this.dispatch({
				type: "lasso",
				el: this.targetNode,
				$el: this.$targetNode,
				source: this.$sourceNode.data()[0],
				target: this.$targetNode.data()[0]
			});
		} else {
			var position = d3.mouse( container );
			
			this.dispatch({
				type: "emptyRelease",
				source: this.sourceNode,
				x: position[0],
				y: position[1]
			});
		}
		
		this.$sourceNode = null;
		this.sourceNode = null;
		
		this.$targetNode = null;
		this.targetNode = null;
		
		this.$line.remove();
		
	},

	mouseoverNode : function( el ) {
		
		var node,
			$el,
			useNode = true,
			prevTarget = this.targetNode;

		if( el !== this.sourceNode ) {
					
			if( !prevTarget ) {
				var position = d3.mouse( el );
				this.exitStage( position[0], position[1] );
			}
			
			$el = d3.select(el);
			
			this.dispatch({
				type: "mouseover",
				el: el,
				$el: $el,
				node: $el.data()[0],
				preventDefault: function() {
					useNode = false;
				}
			});
						
			if(useNode === false) {
				return;
			}
			
			this.targetNode = el;
			this.$targetNode = $el;
			
			
			this.$targetNode.classed('node-lasso-hover', true);
			
			if( !prevTarget ) {
									
				this.$hoverCircle = this.$scope.append('circle', ':first-child')
					.classed("node-lasso-hover-circle", true);

			}
			
			node = this.$targetNode.data()[0];
			
			this.$hoverCircle
				.attr("r", parseInt(this.$targetNode.attr("r"), 10) + 3)
				.attr("cx", node.x)
				.attr("cy", node.y)
				.style("transform-origin", node.x + "px " + node.y + "px")
			;
			
		}
		
	},
	
	mouseoutNode : function( el ) {
		
		d3.select(el).classed('node-lasso-hover', false);
		
		if(el === this.targetNode) {
			this.targetNode = null;
			this.$targetNode = null;
			
			this.$hoverCircle.remove();
			this.$hoverCircle = null;
			
			var position = d3.mouse( el );
			
			this.enterStage( position[0], position[1] );
		}
		
	},
	
	enterStage : function( x, y ) {
		
		this.dispatch({
			type: "enterStage",
			x: x,
			y: y
		});
		
		this.$lassoTip = this.$scope.append('circle', ':first-child')
			.classed('node-lasso-tip', true)
			.attr('r', 5)
			.attr('cx', x)
			.attr('cy', y);
		
	},
	
	exitStage : function( x, y ) {
		
		this.$lassoTip.remove();
		this.$lassoTip = null;
		
		this.dispatch({
			type: "exitStage",
			x: x,
			y: y
		});
		
	},
	
	move : function( container ) {

		var mousePoint = d3.mouse( container );
		var nodePoint = this.$sourceNode.data()[0];
		
		this.$line
			.attr("x1", this.$targetNode ? this.$targetNode.attr("cx") : mousePoint[0] )
			.attr("y1", this.$targetNode ? this.$targetNode.attr("cy") : mousePoint[1] )
			.attr("x2", function(d) { return nodePoint.x; })
			.attr("y2", function(d) { return nodePoint.y; });
			
		if( this.$lassoTip ) {
			this.$lassoTip
				.attr('cx', mousePoint[0])
				.attr('cy', mousePoint[1]);
		}
	},
	
	setHandlers : function( $newNodes ) {
		
		$newNodes.on('mousedown.node-lasso', this.handlersMousedown );
		
	}
};

EventDispatcher.prototype.apply( NodeLasso.prototype );
},{"../../utils/EventDispatcher":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/utils/EventDispatcher.js"}],"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/utils/EventDispatcher.js":[function(require,module,exports){
/**
 * @author mrdoob / http://mrdoob.com/
 *
 * Modifications: Greg Tatum
 *
 * usage:
 * 
 * 		EventDispatcher.prototype.apply( MyObject.prototype );
 * 
 * 		MyObject.dispatch({
 * 			type: "click",
 * 			datum1: "foo",
 * 			datum2: "bar"
 * 		});
 * 
 * 		MyObject.on( "click", function( event ) {
 * 			event.datum1; //Foo
 * 			//event.target; //MyObject (disabled now)
 * 		});
 * 
 *
 */

var EventDispatcher = function () {};

EventDispatcher.prototype = {

	constructor: EventDispatcher,

	apply: function ( object ) {

		object.on					= EventDispatcher.prototype.on;
		object.hasEventListener		= EventDispatcher.prototype.hasEventListener;
		object.off					= EventDispatcher.prototype.off;
		object.dispatch				= EventDispatcher.prototype.dispatch;

	},

	on: function ( type, listener ) {

		if ( this._listeners === undefined ) this._listeners = {};

		var listeners = this._listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	},

	hasEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) return false;

		var listeners = this._listeners;

		if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {

			return true;

		}

		return false;

	},

	off: function ( type, listener ) {

		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ type ];

		if ( listenerArray !== undefined ) {

			var index = listenerArray.indexOf( listener );

			if ( index !== - 1 ) {

				listenerArray.splice( index, 1 );

			}

		}

	},

	dispatch: function ( event ) {
			
		if ( this._listeners === undefined ) return;

		var listeners = this._listeners;
		var listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			//event.target = this;

			var array = [];
			var length = listenerArray.length;
			var i;

			for ( i = 0; i < length; i ++ ) {

				array[ i ] = listenerArray[ i ];

			}

			for ( i = 0; i < length; i ++ ) {

				array[ i ].call( this, event );

			}

		}

	}

};

if ( typeof module === 'object' ) {

	module.exports = EventDispatcher;

}
},{}],"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/utils/HID/Keyboard.js":[function(require,module,exports){
var wrapScope		= require('../../utils/wrapScope'),
	mouse			= require('../../constants/mouse'),
	EventDispatcher = require('../../utils/EventDispatcher');
	
var modifierKeys = [
	"command",
	"control",
	"option",
    "shift"
];
	
var Keyboard = function( $scope ) {
	
	this.$scope = $scope;
	this.dispatcher = new EventDispatcher();
	this.registeredKeypresses = [];
	this.eventScope = ".HID.Keyboard" + Keyboard.prototype._id;
	Keyboard.prototype._id++;
	
	this._handleKeyDownWrapped	= wrapScope( this._handleKeyDown, this );
	this._handleKeyUpWrapped	= wrapScope( this._handleKeyUp, this );

	if( this.$scope ) {
		this.start( this.$scope );
	}
	
};

module.exports = Keyboard;

Keyboard.prototype = {
	
	_id : 0,
	
	start : function( $scope ) {
		this.$scope = $scope;
		this.$scope.on('keydown'+this.eventScope, this._handleKeyDownWrapped );
	},
	
	end : function() {
		this.$scope.on('keydown'+this.eventScope, null );
		this.clearKeypresses();
	},

	_handleKeyDown : function() {
		this.dispatcher.dispatch({type:'keypress'});
	},

	on : function( shortcuts, callback, context ) {
		
		
		if(!_.isArray( shortcuts )) {
			shortcuts = [shortcuts];
		}
		
		_.each( shortcuts, function( shortcut ) {
			
			var keyChecker = function( jQueryEvent ) {
				
				var modifiersCorrect, keysCorrect;
				
				var modifiers = shortcut.modifiers || {};
			
				modifiersCorrect = _.reduce( modifierKeys, function( memo, modifierKey ) {
				
					
					return memo && d3.event[ mouse[modifierKey] ] === !!modifiers[modifierKey];
				
				}, true );
					
				
				keysCorrect = d3.event.keyCode === shortcut.key;
				
				if( modifiersCorrect && keysCorrect ) {
					callback.apply(context);
				}
			};
			
			this.dispatcher.on('keypress', keyChecker);
		
			this.registeredKeypresses.push({
				keyChecker: keyChecker,
				callback: callback
			});
			
		}, this);
				
	},
	
	off : function( callback ) {
		
		var keypresses = _.filter( this.registeredKeypresses, function( keypress ) {
			return keypress.callback === callback;
		});
		
		_.each( keypresses, function( keypress ) {

			this.off( keypress.keyChecker );
		
			this.registeredKeypress.splice( this.registeredKeypress.indexOf(keypress), 1);
			
		}, this);
		
	}
};

},{"../../constants/mouse":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/constants/mouse.js","../../utils/EventDispatcher":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/utils/EventDispatcher.js","../../utils/wrapScope":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/utils/wrapScope.js"}],"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/utils/HID/Mouse.js":[function(require,module,exports){
var wrapScope		= require('../../utils/wrapScope'),
	mouse			= require('../../constants/mouse'),
	EventDispatcher = require('../../utils/EventDispatcher');

var Mouse = function() {};

module.exports = Mouse;

Mouse.prototype = {
	
	wrapScope : wrapScope,
	
	wrapMouse : function( shortcuts, callback, context ) {
		
		var scope = this;
		
		return function() {
			
			var modifiersCorrect, clickCorrect;
				
			modifiersCorrect = _.reduce( shortcuts.modifiers, function( memo, modifier ) {
			
				return memo && d3.event[modifier];
			
			}, true );
		
			clickCorrect = shortcuts.click === scope.normalizeWhich( d3.event );
		
			if( modifiersCorrect && clickCorrect ) {
				callback.call(context, this );
			}
		};
		
	},
	
	wrapMouseUp : function( shortcuts, callback, context ) {
		
		//Strip out modifiers
		return this.wrapMouse( {
			
			modifiers: null,
			click: shortcuts.click
			
		}, callback, context );
		
	},
		
	normalizeWhich : function( e ) {
		if ( !e.which && e.button !== undefined ) {
			e.which = ( e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) ) );
		}
		switch (e.which) {
			case 1: return mouse.left;
			case 2: return mouse.middle;
			case 3: return mouse.right;
			default: return null;
		}
	}
	
};

EventDispatcher.prototype.apply( Mouse.prototype );
},{"../../constants/mouse":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/constants/mouse.js","../../utils/EventDispatcher":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/utils/EventDispatcher.js","../../utils/wrapScope":"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/utils/wrapScope.js"}],"/Users/gregtatum/Dropbox/greg-sites/node.graphics/js/utils/wrapScope.js":[function(require,module,exports){
/**
 *	D3 event handles take over the context of the function. If you .bind(this) to the function
 *	then you lose the ability to access the current container for that event. This little
 *	function will wrap the scope for the object, and pass the native d3 context in as
 *	the first parameter in the function.
 *	
 *	Usage:
 *	
 *		svg.append("rect").on("mousedown", wrapScope(this.mousedown, this) );
 *		
 *		...
 *		
 *		mousedown : function( container ) {
 *			var pt = d3.mouse( container )
 *			this.methodName();
 *		}
 */

var wrapScope = function(callback, scope) {
	
	return function() {
		callback.call(scope, this );
	};
	
};

module.exports = wrapScope;
},{}],"/Users/gregtatum/Dropbox/greg-sites/node.graphics/node_modules/d3/d3.js":[function(require,module,exports){
!function() {
  var d3 = {
    version: "3.4.11"
  };
  if (!Date.now) Date.now = function() {
    return +new Date();
  };
  var d3_arraySlice = [].slice, d3_array = function(list) {
    return d3_arraySlice.call(list);
  };
  var d3_document = document, d3_documentElement = d3_document.documentElement, d3_window = window;
  try {
    d3_array(d3_documentElement.childNodes)[0].nodeType;
  } catch (e) {
    d3_array = function(list) {
      var i = list.length, array = new Array(i);
      while (i--) array[i] = list[i];
      return array;
    };
  }
  try {
    d3_document.createElement("div").style.setProperty("opacity", 0, "");
  } catch (error) {
    var d3_element_prototype = d3_window.Element.prototype, d3_element_setAttribute = d3_element_prototype.setAttribute, d3_element_setAttributeNS = d3_element_prototype.setAttributeNS, d3_style_prototype = d3_window.CSSStyleDeclaration.prototype, d3_style_setProperty = d3_style_prototype.setProperty;
    d3_element_prototype.setAttribute = function(name, value) {
      d3_element_setAttribute.call(this, name, value + "");
    };
    d3_element_prototype.setAttributeNS = function(space, local, value) {
      d3_element_setAttributeNS.call(this, space, local, value + "");
    };
    d3_style_prototype.setProperty = function(name, value, priority) {
      d3_style_setProperty.call(this, name, value + "", priority);
    };
  }
  d3.ascending = d3_ascending;
  function d3_ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }
  d3.descending = function(a, b) {
    return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
  };
  d3.min = function(array, f) {
    var i = -1, n = array.length, a, b;
    if (arguments.length === 1) {
      while (++i < n && !((a = array[i]) != null && a <= a)) a = undefined;
      while (++i < n) if ((b = array[i]) != null && a > b) a = b;
    } else {
      while (++i < n && !((a = f.call(array, array[i], i)) != null && a <= a)) a = undefined;
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && a > b) a = b;
    }
    return a;
  };
  d3.max = function(array, f) {
    var i = -1, n = array.length, a, b;
    if (arguments.length === 1) {
      while (++i < n && !((a = array[i]) != null && a <= a)) a = undefined;
      while (++i < n) if ((b = array[i]) != null && b > a) a = b;
    } else {
      while (++i < n && !((a = f.call(array, array[i], i)) != null && a <= a)) a = undefined;
      while (++i < n) if ((b = f.call(array, array[i], i)) != null && b > a) a = b;
    }
    return a;
  };
  d3.extent = function(array, f) {
    var i = -1, n = array.length, a, b, c;
    if (arguments.length === 1) {
      while (++i < n && !((a = c = array[i]) != null && a <= a)) a = c = undefined;
      while (++i < n) if ((b = array[i]) != null) {
        if (a > b) a = b;
        if (c < b) c = b;
      }
    } else {
      while (++i < n && !((a = c = f.call(array, array[i], i)) != null && a <= a)) a = undefined;
      while (++i < n) if ((b = f.call(array, array[i], i)) != null) {
        if (a > b) a = b;
        if (c < b) c = b;
      }
    }
    return [ a, c ];
  };
  d3.sum = function(array, f) {
    var s = 0, n = array.length, a, i = -1;
    if (arguments.length === 1) {
      while (++i < n) if (!isNaN(a = +array[i])) s += a;
    } else {
      while (++i < n) if (!isNaN(a = +f.call(array, array[i], i))) s += a;
    }
    return s;
  };
  function d3_number(x) {
    return x != null && !isNaN(x);
  }
  d3.mean = function(array, f) {
    var s = 0, n = array.length, a, i = -1, j = n;
    if (arguments.length === 1) {
      while (++i < n) if (d3_number(a = array[i])) s += a; else --j;
    } else {
      while (++i < n) if (d3_number(a = f.call(array, array[i], i))) s += a; else --j;
    }
    return j ? s / j : undefined;
  };
  d3.quantile = function(values, p) {
    var H = (values.length - 1) * p + 1, h = Math.floor(H), v = +values[h - 1], e = H - h;
    return e ? v + e * (values[h] - v) : v;
  };
  d3.median = function(array, f) {
    if (arguments.length > 1) array = array.map(f);
    array = array.filter(d3_number);
    return array.length ? d3.quantile(array.sort(d3_ascending), .5) : undefined;
  };
  function d3_bisector(compare) {
    return {
      left: function(a, x, lo, hi) {
        if (arguments.length < 3) lo = 0;
        if (arguments.length < 4) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) < 0) lo = mid + 1; else hi = mid;
        }
        return lo;
      },
      right: function(a, x, lo, hi) {
        if (arguments.length < 3) lo = 0;
        if (arguments.length < 4) hi = a.length;
        while (lo < hi) {
          var mid = lo + hi >>> 1;
          if (compare(a[mid], x) > 0) hi = mid; else lo = mid + 1;
        }
        return lo;
      }
    };
  }
  var d3_bisect = d3_bisector(d3_ascending);
  d3.bisectLeft = d3_bisect.left;
  d3.bisect = d3.bisectRight = d3_bisect.right;
  d3.bisector = function(f) {
    return d3_bisector(f.length === 1 ? function(d, x) {
      return d3_ascending(f(d), x);
    } : f);
  };
  d3.shuffle = function(array) {
    var m = array.length, t, i;
    while (m) {
      i = Math.random() * m-- | 0;
      t = array[m], array[m] = array[i], array[i] = t;
    }
    return array;
  };
  d3.permute = function(array, indexes) {
    var i = indexes.length, permutes = new Array(i);
    while (i--) permutes[i] = array[indexes[i]];
    return permutes;
  };
  d3.pairs = function(array) {
    var i = 0, n = array.length - 1, p0, p1 = array[0], pairs = new Array(n < 0 ? 0 : n);
    while (i < n) pairs[i] = [ p0 = p1, p1 = array[++i] ];
    return pairs;
  };
  d3.zip = function() {
    if (!(n = arguments.length)) return [];
    for (var i = -1, m = d3.min(arguments, d3_zipLength), zips = new Array(m); ++i < m; ) {
      for (var j = -1, n, zip = zips[i] = new Array(n); ++j < n; ) {
        zip[j] = arguments[j][i];
      }
    }
    return zips;
  };
  function d3_zipLength(d) {
    return d.length;
  }
  d3.transpose = function(matrix) {
    return d3.zip.apply(d3, matrix);
  };
  d3.keys = function(map) {
    var keys = [];
    for (var key in map) keys.push(key);
    return keys;
  };
  d3.values = function(map) {
    var values = [];
    for (var key in map) values.push(map[key]);
    return values;
  };
  d3.entries = function(map) {
    var entries = [];
    for (var key in map) entries.push({
      key: key,
      value: map[key]
    });
    return entries;
  };
  d3.merge = function(arrays) {
    var n = arrays.length, m, i = -1, j = 0, merged, array;
    while (++i < n) j += arrays[i].length;
    merged = new Array(j);
    while (--n >= 0) {
      array = arrays[n];
      m = array.length;
      while (--m >= 0) {
        merged[--j] = array[m];
      }
    }
    return merged;
  };
  var abs = Math.abs;
  d3.range = function(start, stop, step) {
    if (arguments.length < 3) {
      step = 1;
      if (arguments.length < 2) {
        stop = start;
        start = 0;
      }
    }
    if ((stop - start) / step === Infinity) throw new Error("infinite range");
    var range = [], k = d3_range_integerScale(abs(step)), i = -1, j;
    start *= k, stop *= k, step *= k;
    if (step < 0) while ((j = start + step * ++i) > stop) range.push(j / k); else while ((j = start + step * ++i) < stop) range.push(j / k);
    return range;
  };
  function d3_range_integerScale(x) {
    var k = 1;
    while (x * k % 1) k *= 10;
    return k;
  }
  function d3_class(ctor, properties) {
    try {
      for (var key in properties) {
        Object.defineProperty(ctor.prototype, key, {
          value: properties[key],
          enumerable: false
        });
      }
    } catch (e) {
      ctor.prototype = properties;
    }
  }
  d3.map = function(object) {
    var map = new d3_Map();
    if (object instanceof d3_Map) object.forEach(function(key, value) {
      map.set(key, value);
    }); else for (var key in object) map.set(key, object[key]);
    return map;
  };
  function d3_Map() {}
  d3_class(d3_Map, {
    has: d3_map_has,
    get: function(key) {
      return this[d3_map_prefix + key];
    },
    set: function(key, value) {
      return this[d3_map_prefix + key] = value;
    },
    remove: d3_map_remove,
    keys: d3_map_keys,
    values: function() {
      var values = [];
      this.forEach(function(key, value) {
        values.push(value);
      });
      return values;
    },
    entries: function() {
      var entries = [];
      this.forEach(function(key, value) {
        entries.push({
          key: key,
          value: value
        });
      });
      return entries;
    },
    size: d3_map_size,
    empty: d3_map_empty,
    forEach: function(f) {
      for (var key in this) if (key.charCodeAt(0) === d3_map_prefixCode) f.call(this, key.substring(1), this[key]);
    }
  });
  var d3_map_prefix = "\x00", d3_map_prefixCode = d3_map_prefix.charCodeAt(0);
  function d3_map_has(key) {
    return d3_map_prefix + key in this;
  }
  function d3_map_remove(key) {
    key = d3_map_prefix + key;
    return key in this && delete this[key];
  }
  function d3_map_keys() {
    var keys = [];
    this.forEach(function(key) {
      keys.push(key);
    });
    return keys;
  }
  function d3_map_size() {
    var size = 0;
    for (var key in this) if (key.charCodeAt(0) === d3_map_prefixCode) ++size;
    return size;
  }
  function d3_map_empty() {
    for (var key in this) if (key.charCodeAt(0) === d3_map_prefixCode) return false;
    return true;
  }
  d3.nest = function() {
    var nest = {}, keys = [], sortKeys = [], sortValues, rollup;
    function map(mapType, array, depth) {
      if (depth >= keys.length) return rollup ? rollup.call(nest, array) : sortValues ? array.sort(sortValues) : array;
      var i = -1, n = array.length, key = keys[depth++], keyValue, object, setter, valuesByKey = new d3_Map(), values;
      while (++i < n) {
        if (values = valuesByKey.get(keyValue = key(object = array[i]))) {
          values.push(object);
        } else {
          valuesByKey.set(keyValue, [ object ]);
        }
      }
      if (mapType) {
        object = mapType();
        setter = function(keyValue, values) {
          object.set(keyValue, map(mapType, values, depth));
        };
      } else {
        object = {};
        setter = function(keyValue, values) {
          object[keyValue] = map(mapType, values, depth);
        };
      }
      valuesByKey.forEach(setter);
      return object;
    }
    function entries(map, depth) {
      if (depth >= keys.length) return map;
      var array = [], sortKey = sortKeys[depth++];
      map.forEach(function(key, keyMap) {
        array.push({
          key: key,
          values: entries(keyMap, depth)
        });
      });
      return sortKey ? array.sort(function(a, b) {
        return sortKey(a.key, b.key);
      }) : array;
    }
    nest.map = function(array, mapType) {
      return map(mapType, array, 0);
    };
    nest.entries = function(array) {
      return entries(map(d3.map, array, 0), 0);
    };
    nest.key = function(d) {
      keys.push(d);
      return nest;
    };
    nest.sortKeys = function(order) {
      sortKeys[keys.length - 1] = order;
      return nest;
    };
    nest.sortValues = function(order) {
      sortValues = order;
      return nest;
    };
    nest.rollup = function(f) {
      rollup = f;
      return nest;
    };
    return nest;
  };
  d3.set = function(array) {
    var set = new d3_Set();
    if (array) for (var i = 0, n = array.length; i < n; ++i) set.add(array[i]);
    return set;
  };
  function d3_Set() {}
  d3_class(d3_Set, {
    has: d3_map_has,
    add: function(value) {
      this[d3_map_prefix + value] = true;
      return value;
    },
    remove: function(value) {
      value = d3_map_prefix + value;
      return value in this && delete this[value];
    },
    values: d3_map_keys,
    size: d3_map_size,
    empty: d3_map_empty,
    forEach: function(f) {
      for (var value in this) if (value.charCodeAt(0) === d3_map_prefixCode) f.call(this, value.substring(1));
    }
  });
  d3.behavior = {};
  d3.rebind = function(target, source) {
    var i = 1, n = arguments.length, method;
    while (++i < n) target[method = arguments[i]] = d3_rebind(target, source, source[method]);
    return target;
  };
  function d3_rebind(target, source, method) {
    return function() {
      var value = method.apply(source, arguments);
      return value === source ? target : value;
    };
  }
  function d3_vendorSymbol(object, name) {
    if (name in object) return name;
    name = name.charAt(0).toUpperCase() + name.substring(1);
    for (var i = 0, n = d3_vendorPrefixes.length; i < n; ++i) {
      var prefixName = d3_vendorPrefixes[i] + name;
      if (prefixName in object) return prefixName;
    }
  }
  var d3_vendorPrefixes = [ "webkit", "ms", "moz", "Moz", "o", "O" ];
  function d3_noop() {}
  d3.dispatch = function() {
    var dispatch = new d3_dispatch(), i = -1, n = arguments.length;
    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
    return dispatch;
  };
  function d3_dispatch() {}
  d3_dispatch.prototype.on = function(type, listener) {
    var i = type.indexOf("."), name = "";
    if (i >= 0) {
      name = type.substring(i + 1);
      type = type.substring(0, i);
    }
    if (type) return arguments.length < 2 ? this[type].on(name) : this[type].on(name, listener);
    if (arguments.length === 2) {
      if (listener == null) for (type in this) {
        if (this.hasOwnProperty(type)) this[type].on(name, null);
      }
      return this;
    }
  };
  function d3_dispatch_event(dispatch) {
    var listeners = [], listenerByName = new d3_Map();
    function event() {
      var z = listeners, i = -1, n = z.length, l;
      while (++i < n) if (l = z[i].on) l.apply(this, arguments);
      return dispatch;
    }
    event.on = function(name, listener) {
      var l = listenerByName.get(name), i;
      if (arguments.length < 2) return l && l.on;
      if (l) {
        l.on = null;
        listeners = listeners.slice(0, i = listeners.indexOf(l)).concat(listeners.slice(i + 1));
        listenerByName.remove(name);
      }
      if (listener) listeners.push(listenerByName.set(name, {
        on: listener
      }));
      return dispatch;
    };
    return event;
  }
  d3.event = null;
  function d3_eventPreventDefault() {
    d3.event.preventDefault();
  }
  function d3_eventSource() {
    var e = d3.event, s;
    while (s = e.sourceEvent) e = s;
    return e;
  }
  function d3_eventDispatch(target) {
    var dispatch = new d3_dispatch(), i = 0, n = arguments.length;
    while (++i < n) dispatch[arguments[i]] = d3_dispatch_event(dispatch);
    dispatch.of = function(thiz, argumentz) {
      return function(e1) {
        try {
          var e0 = e1.sourceEvent = d3.event;
          e1.target = target;
          d3.event = e1;
          dispatch[e1.type].apply(thiz, argumentz);
        } finally {
          d3.event = e0;
        }
      };
    };
    return dispatch;
  }
  d3.requote = function(s) {
    return s.replace(d3_requote_re, "\\$&");
  };
  var d3_requote_re = /[\\\^\$\*\+\?\|\[\]\(\)\.\{\}]/g;
  var d3_subclass = {}.__proto__ ? function(object, prototype) {
    object.__proto__ = prototype;
  } : function(object, prototype) {
    for (var property in prototype) object[property] = prototype[property];
  };
  function d3_selection(groups) {
    d3_subclass(groups, d3_selectionPrototype);
    return groups;
  }
  var d3_select = function(s, n) {
    return n.querySelector(s);
  }, d3_selectAll = function(s, n) {
    return n.querySelectorAll(s);
  }, d3_selectMatcher = d3_documentElement.matches || d3_documentElement[d3_vendorSymbol(d3_documentElement, "matchesSelector")], d3_selectMatches = function(n, s) {
    return d3_selectMatcher.call(n, s);
  };
  if (typeof Sizzle === "function") {
    d3_select = function(s, n) {
      return Sizzle(s, n)[0] || null;
    };
    d3_selectAll = Sizzle;
    d3_selectMatches = Sizzle.matchesSelector;
  }
  d3.selection = function() {
    return d3_selectionRoot;
  };
  var d3_selectionPrototype = d3.selection.prototype = [];
  d3_selectionPrototype.select = function(selector) {
    var subgroups = [], subgroup, subnode, group, node;
    selector = d3_selection_selector(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      subgroup.parentNode = (group = this[j]).parentNode;
      for (var i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroup.push(subnode = selector.call(node, node.__data__, i, j));
          if (subnode && "__data__" in node) subnode.__data__ = node.__data__;
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_selector(selector) {
    return typeof selector === "function" ? selector : function() {
      return d3_select(selector, this);
    };
  }
  d3_selectionPrototype.selectAll = function(selector) {
    var subgroups = [], subgroup, node;
    selector = d3_selection_selectorAll(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroups.push(subgroup = d3_array(selector.call(node, node.__data__, i, j)));
          subgroup.parentNode = node;
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_selectorAll(selector) {
    return typeof selector === "function" ? selector : function() {
      return d3_selectAll(selector, this);
    };
  }
  var d3_nsPrefix = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: "http://www.w3.org/1999/xhtml",
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };
  d3.ns = {
    prefix: d3_nsPrefix,
    qualify: function(name) {
      var i = name.indexOf(":"), prefix = name;
      if (i >= 0) {
        prefix = name.substring(0, i);
        name = name.substring(i + 1);
      }
      return d3_nsPrefix.hasOwnProperty(prefix) ? {
        space: d3_nsPrefix[prefix],
        local: name
      } : name;
    }
  };
  d3_selectionPrototype.attr = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") {
        var node = this.node();
        name = d3.ns.qualify(name);
        return name.local ? node.getAttributeNS(name.space, name.local) : node.getAttribute(name);
      }
      for (value in name) this.each(d3_selection_attr(value, name[value]));
      return this;
    }
    return this.each(d3_selection_attr(name, value));
  };
  function d3_selection_attr(name, value) {
    name = d3.ns.qualify(name);
    function attrNull() {
      this.removeAttribute(name);
    }
    function attrNullNS() {
      this.removeAttributeNS(name.space, name.local);
    }
    function attrConstant() {
      this.setAttribute(name, value);
    }
    function attrConstantNS() {
      this.setAttributeNS(name.space, name.local, value);
    }
    function attrFunction() {
      var x = value.apply(this, arguments);
      if (x == null) this.removeAttribute(name); else this.setAttribute(name, x);
    }
    function attrFunctionNS() {
      var x = value.apply(this, arguments);
      if (x == null) this.removeAttributeNS(name.space, name.local); else this.setAttributeNS(name.space, name.local, x);
    }
    return value == null ? name.local ? attrNullNS : attrNull : typeof value === "function" ? name.local ? attrFunctionNS : attrFunction : name.local ? attrConstantNS : attrConstant;
  }
  function d3_collapse(s) {
    return s.trim().replace(/\s+/g, " ");
  }
  d3_selectionPrototype.classed = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") {
        var node = this.node(), n = (name = d3_selection_classes(name)).length, i = -1;
        if (value = node.classList) {
          while (++i < n) if (!value.contains(name[i])) return false;
        } else {
          value = node.getAttribute("class");
          while (++i < n) if (!d3_selection_classedRe(name[i]).test(value)) return false;
        }
        return true;
      }
      for (value in name) this.each(d3_selection_classed(value, name[value]));
      return this;
    }
    return this.each(d3_selection_classed(name, value));
  };
  function d3_selection_classedRe(name) {
    return new RegExp("(?:^|\\s+)" + d3.requote(name) + "(?:\\s+|$)", "g");
  }
  function d3_selection_classes(name) {
    return (name + "").trim().split(/^|\s+/);
  }
  function d3_selection_classed(name, value) {
    name = d3_selection_classes(name).map(d3_selection_classedName);
    var n = name.length;
    function classedConstant() {
      var i = -1;
      while (++i < n) name[i](this, value);
    }
    function classedFunction() {
      var i = -1, x = value.apply(this, arguments);
      while (++i < n) name[i](this, x);
    }
    return typeof value === "function" ? classedFunction : classedConstant;
  }
  function d3_selection_classedName(name) {
    var re = d3_selection_classedRe(name);
    return function(node, value) {
      if (c = node.classList) return value ? c.add(name) : c.remove(name);
      var c = node.getAttribute("class") || "";
      if (value) {
        re.lastIndex = 0;
        if (!re.test(c)) node.setAttribute("class", d3_collapse(c + " " + name));
      } else {
        node.setAttribute("class", d3_collapse(c.replace(re, " ")));
      }
    };
  }
  d3_selectionPrototype.style = function(name, value, priority) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof name !== "string") {
        if (n < 2) value = "";
        for (priority in name) this.each(d3_selection_style(priority, name[priority], value));
        return this;
      }
      if (n < 2) return d3_window.getComputedStyle(this.node(), null).getPropertyValue(name);
      priority = "";
    }
    return this.each(d3_selection_style(name, value, priority));
  };
  function d3_selection_style(name, value, priority) {
    function styleNull() {
      this.style.removeProperty(name);
    }
    function styleConstant() {
      this.style.setProperty(name, value, priority);
    }
    function styleFunction() {
      var x = value.apply(this, arguments);
      if (x == null) this.style.removeProperty(name); else this.style.setProperty(name, x, priority);
    }
    return value == null ? styleNull : typeof value === "function" ? styleFunction : styleConstant;
  }
  d3_selectionPrototype.property = function(name, value) {
    if (arguments.length < 2) {
      if (typeof name === "string") return this.node()[name];
      for (value in name) this.each(d3_selection_property(value, name[value]));
      return this;
    }
    return this.each(d3_selection_property(name, value));
  };
  function d3_selection_property(name, value) {
    function propertyNull() {
      delete this[name];
    }
    function propertyConstant() {
      this[name] = value;
    }
    function propertyFunction() {
      var x = value.apply(this, arguments);
      if (x == null) delete this[name]; else this[name] = x;
    }
    return value == null ? propertyNull : typeof value === "function" ? propertyFunction : propertyConstant;
  }
  d3_selectionPrototype.text = function(value) {
    return arguments.length ? this.each(typeof value === "function" ? function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    } : value == null ? function() {
      this.textContent = "";
    } : function() {
      this.textContent = value;
    }) : this.node().textContent;
  };
  d3_selectionPrototype.html = function(value) {
    return arguments.length ? this.each(typeof value === "function" ? function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    } : value == null ? function() {
      this.innerHTML = "";
    } : function() {
      this.innerHTML = value;
    }) : this.node().innerHTML;
  };
  d3_selectionPrototype.append = function(name) {
    name = d3_selection_creator(name);
    return this.select(function() {
      return this.appendChild(name.apply(this, arguments));
    });
  };
  function d3_selection_creator(name) {
    return typeof name === "function" ? name : (name = d3.ns.qualify(name)).local ? function() {
      return this.ownerDocument.createElementNS(name.space, name.local);
    } : function() {
      return this.ownerDocument.createElementNS(this.namespaceURI, name);
    };
  }
  d3_selectionPrototype.insert = function(name, before) {
    name = d3_selection_creator(name);
    before = d3_selection_selector(before);
    return this.select(function() {
      return this.insertBefore(name.apply(this, arguments), before.apply(this, arguments) || null);
    });
  };
  d3_selectionPrototype.remove = function() {
    return this.each(function() {
      var parent = this.parentNode;
      if (parent) parent.removeChild(this);
    });
  };
  d3_selectionPrototype.data = function(value, key) {
    var i = -1, n = this.length, group, node;
    if (!arguments.length) {
      value = new Array(n = (group = this[0]).length);
      while (++i < n) {
        if (node = group[i]) {
          value[i] = node.__data__;
        }
      }
      return value;
    }
    function bind(group, groupData) {
      var i, n = group.length, m = groupData.length, n0 = Math.min(n, m), updateNodes = new Array(m), enterNodes = new Array(m), exitNodes = new Array(n), node, nodeData;
      if (key) {
        var nodeByKeyValue = new d3_Map(), dataByKeyValue = new d3_Map(), keyValues = [], keyValue;
        for (i = -1; ++i < n; ) {
          keyValue = key.call(node = group[i], node.__data__, i);
          if (nodeByKeyValue.has(keyValue)) {
            exitNodes[i] = node;
          } else {
            nodeByKeyValue.set(keyValue, node);
          }
          keyValues.push(keyValue);
        }
        for (i = -1; ++i < m; ) {
          keyValue = key.call(groupData, nodeData = groupData[i], i);
          if (node = nodeByKeyValue.get(keyValue)) {
            updateNodes[i] = node;
            node.__data__ = nodeData;
          } else if (!dataByKeyValue.has(keyValue)) {
            enterNodes[i] = d3_selection_dataNode(nodeData);
          }
          dataByKeyValue.set(keyValue, nodeData);
          nodeByKeyValue.remove(keyValue);
        }
        for (i = -1; ++i < n; ) {
          if (nodeByKeyValue.has(keyValues[i])) {
            exitNodes[i] = group[i];
          }
        }
      } else {
        for (i = -1; ++i < n0; ) {
          node = group[i];
          nodeData = groupData[i];
          if (node) {
            node.__data__ = nodeData;
            updateNodes[i] = node;
          } else {
            enterNodes[i] = d3_selection_dataNode(nodeData);
          }
        }
        for (;i < m; ++i) {
          enterNodes[i] = d3_selection_dataNode(groupData[i]);
        }
        for (;i < n; ++i) {
          exitNodes[i] = group[i];
        }
      }
      enterNodes.update = updateNodes;
      enterNodes.parentNode = updateNodes.parentNode = exitNodes.parentNode = group.parentNode;
      enter.push(enterNodes);
      update.push(updateNodes);
      exit.push(exitNodes);
    }
    var enter = d3_selection_enter([]), update = d3_selection([]), exit = d3_selection([]);
    if (typeof value === "function") {
      while (++i < n) {
        bind(group = this[i], value.call(group, group.parentNode.__data__, i));
      }
    } else {
      while (++i < n) {
        bind(group = this[i], value);
      }
    }
    update.enter = function() {
      return enter;
    };
    update.exit = function() {
      return exit;
    };
    return update;
  };
  function d3_selection_dataNode(data) {
    return {
      __data__: data
    };
  }
  d3_selectionPrototype.datum = function(value) {
    return arguments.length ? this.property("__data__", value) : this.property("__data__");
  };
  d3_selectionPrototype.filter = function(filter) {
    var subgroups = [], subgroup, group, node;
    if (typeof filter !== "function") filter = d3_selection_filter(filter);
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      subgroup.parentNode = (group = this[j]).parentNode;
      for (var i = 0, n = group.length; i < n; i++) {
        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
          subgroup.push(node);
        }
      }
    }
    return d3_selection(subgroups);
  };
  function d3_selection_filter(selector) {
    return function() {
      return d3_selectMatches(this, selector);
    };
  }
  d3_selectionPrototype.order = function() {
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
        if (node = group[i]) {
          if (next && next !== node.nextSibling) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }
    return this;
  };
  d3_selectionPrototype.sort = function(comparator) {
    comparator = d3_selection_sortComparator.apply(this, arguments);
    for (var j = -1, m = this.length; ++j < m; ) this[j].sort(comparator);
    return this.order();
  };
  function d3_selection_sortComparator(comparator) {
    if (!arguments.length) comparator = d3_ascending;
    return function(a, b) {
      return a && b ? comparator(a.__data__, b.__data__) : !a - !b;
    };
  }
  d3_selectionPrototype.each = function(callback) {
    return d3_selection_each(this, function(node, i, j) {
      callback.call(node, node.__data__, i, j);
    });
  };
  function d3_selection_each(groups, callback) {
    for (var j = 0, m = groups.length; j < m; j++) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; i++) {
        if (node = group[i]) callback(node, i, j);
      }
    }
    return groups;
  }
  d3_selectionPrototype.call = function(callback) {
    var args = d3_array(arguments);
    callback.apply(args[0] = this, args);
    return this;
  };
  d3_selectionPrototype.empty = function() {
    return !this.node();
  };
  d3_selectionPrototype.node = function() {
    for (var j = 0, m = this.length; j < m; j++) {
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        var node = group[i];
        if (node) return node;
      }
    }
    return null;
  };
  d3_selectionPrototype.size = function() {
    var n = 0;
    this.each(function() {
      ++n;
    });
    return n;
  };
  function d3_selection_enter(selection) {
    d3_subclass(selection, d3_selection_enterPrototype);
    return selection;
  }
  var d3_selection_enterPrototype = [];
  d3.selection.enter = d3_selection_enter;
  d3.selection.enter.prototype = d3_selection_enterPrototype;
  d3_selection_enterPrototype.append = d3_selectionPrototype.append;
  d3_selection_enterPrototype.empty = d3_selectionPrototype.empty;
  d3_selection_enterPrototype.node = d3_selectionPrototype.node;
  d3_selection_enterPrototype.call = d3_selectionPrototype.call;
  d3_selection_enterPrototype.size = d3_selectionPrototype.size;
  d3_selection_enterPrototype.select = function(selector) {
    var subgroups = [], subgroup, subnode, upgroup, group, node;
    for (var j = -1, m = this.length; ++j < m; ) {
      upgroup = (group = this[j]).update;
      subgroups.push(subgroup = []);
      subgroup.parentNode = group.parentNode;
      for (var i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          subgroup.push(upgroup[i] = subnode = selector.call(group.parentNode, node.__data__, i, j));
          subnode.__data__ = node.__data__;
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_selection(subgroups);
  };
  d3_selection_enterPrototype.insert = function(name, before) {
    if (arguments.length < 2) before = d3_selection_enterInsertBefore(this);
    return d3_selectionPrototype.insert.call(this, name, before);
  };
  function d3_selection_enterInsertBefore(enter) {
    var i0, j0;
    return function(d, i, j) {
      var group = enter[j].update, n = group.length, node;
      if (j != j0) j0 = j, i0 = 0;
      if (i >= i0) i0 = i + 1;
      while (!(node = group[i0]) && ++i0 < n) ;
      return node;
    };
  }
  d3_selectionPrototype.transition = function() {
    var id = d3_transitionInheritId || ++d3_transitionId, subgroups = [], subgroup, node, transition = d3_transitionInherit || {
      time: Date.now(),
      ease: d3_ease_cubicInOut,
      delay: 0,
      duration: 250
    };
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) d3_transitionNode(node, i, id, transition);
        subgroup.push(node);
      }
    }
    return d3_transition(subgroups, id);
  };
  d3_selectionPrototype.interrupt = function() {
    return this.each(d3_selection_interrupt);
  };
  function d3_selection_interrupt() {
    var lock = this.__transition__;
    if (lock) ++lock.active;
  }
  d3.select = function(node) {
    var group = [ typeof node === "string" ? d3_select(node, d3_document) : node ];
    group.parentNode = d3_documentElement;
    return d3_selection([ group ]);
  };
  d3.selectAll = function(nodes) {
    var group = d3_array(typeof nodes === "string" ? d3_selectAll(nodes, d3_document) : nodes);
    group.parentNode = d3_documentElement;
    return d3_selection([ group ]);
  };
  var d3_selectionRoot = d3.select(d3_documentElement);
  d3_selectionPrototype.on = function(type, listener, capture) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof type !== "string") {
        if (n < 2) listener = false;
        for (capture in type) this.each(d3_selection_on(capture, type[capture], listener));
        return this;
      }
      if (n < 2) return (n = this.node()["__on" + type]) && n._;
      capture = false;
    }
    return this.each(d3_selection_on(type, listener, capture));
  };
  function d3_selection_on(type, listener, capture) {
    var name = "__on" + type, i = type.indexOf("."), wrap = d3_selection_onListener;
    if (i > 0) type = type.substring(0, i);
    var filter = d3_selection_onFilters.get(type);
    if (filter) type = filter, wrap = d3_selection_onFilter;
    function onRemove() {
      var l = this[name];
      if (l) {
        this.removeEventListener(type, l, l.$);
        delete this[name];
      }
    }
    function onAdd() {
      var l = wrap(listener, d3_array(arguments));
      onRemove.call(this);
      this.addEventListener(type, this[name] = l, l.$ = capture);
      l._ = listener;
    }
    function removeAll() {
      var re = new RegExp("^__on([^.]+)" + d3.requote(type) + "$"), match;
      for (var name in this) {
        if (match = name.match(re)) {
          var l = this[name];
          this.removeEventListener(match[1], l, l.$);
          delete this[name];
        }
      }
    }
    return i ? listener ? onAdd : onRemove : listener ? d3_noop : removeAll;
  }
  var d3_selection_onFilters = d3.map({
    mouseenter: "mouseover",
    mouseleave: "mouseout"
  });
  d3_selection_onFilters.forEach(function(k) {
    if ("on" + k in d3_document) d3_selection_onFilters.remove(k);
  });
  function d3_selection_onListener(listener, argumentz) {
    return function(e) {
      var o = d3.event;
      d3.event = e;
      argumentz[0] = this.__data__;
      try {
        listener.apply(this, argumentz);
      } finally {
        d3.event = o;
      }
    };
  }
  function d3_selection_onFilter(listener, argumentz) {
    var l = d3_selection_onListener(listener, argumentz);
    return function(e) {
      var target = this, related = e.relatedTarget;
      if (!related || related !== target && !(related.compareDocumentPosition(target) & 8)) {
        l.call(target, e);
      }
    };
  }
  var d3_event_dragSelect = "onselectstart" in d3_document ? null : d3_vendorSymbol(d3_documentElement.style, "userSelect"), d3_event_dragId = 0;
  function d3_event_dragSuppress() {
    var name = ".dragsuppress-" + ++d3_event_dragId, click = "click" + name, w = d3.select(d3_window).on("touchmove" + name, d3_eventPreventDefault).on("dragstart" + name, d3_eventPreventDefault).on("selectstart" + name, d3_eventPreventDefault);
    if (d3_event_dragSelect) {
      var style = d3_documentElement.style, select = style[d3_event_dragSelect];
      style[d3_event_dragSelect] = "none";
    }
    return function(suppressClick) {
      w.on(name, null);
      if (d3_event_dragSelect) style[d3_event_dragSelect] = select;
      if (suppressClick) {
        function off() {
          w.on(click, null);
        }
        w.on(click, function() {
          d3_eventPreventDefault();
          off();
        }, true);
        setTimeout(off, 0);
      }
    };
  }
  d3.mouse = function(container) {
    return d3_mousePoint(container, d3_eventSource());
  };
  var d3_mouse_bug44083 = /WebKit/.test(d3_window.navigator.userAgent) ? -1 : 0;
  function d3_mousePoint(container, e) {
    if (e.changedTouches) e = e.changedTouches[0];
    var svg = container.ownerSVGElement || container;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      if (d3_mouse_bug44083 < 0 && (d3_window.scrollX || d3_window.scrollY)) {
        svg = d3.select("body").append("svg").style({
          position: "absolute",
          top: 0,
          left: 0,
          margin: 0,
          padding: 0,
          border: "none"
        }, "important");
        var ctm = svg[0][0].getScreenCTM();
        d3_mouse_bug44083 = !(ctm.f || ctm.e);
        svg.remove();
      }
      if (d3_mouse_bug44083) point.x = e.pageX, point.y = e.pageY; else point.x = e.clientX, 
      point.y = e.clientY;
      point = point.matrixTransform(container.getScreenCTM().inverse());
      return [ point.x, point.y ];
    }
    var rect = container.getBoundingClientRect();
    return [ e.clientX - rect.left - container.clientLeft, e.clientY - rect.top - container.clientTop ];
  }
  d3.touches = function(container, touches) {
    if (arguments.length < 2) touches = d3_eventSource().touches;
    return touches ? d3_array(touches).map(function(touch) {
      var point = d3_mousePoint(container, touch);
      point.identifier = touch.identifier;
      return point;
    }) : [];
  };
  d3.behavior.drag = function() {
    var event = d3_eventDispatch(drag, "drag", "dragstart", "dragend"), origin = null, mousedown = dragstart(d3_noop, d3.mouse, d3_behavior_dragMouseSubject, "mousemove", "mouseup"), touchstart = dragstart(d3_behavior_dragTouchId, d3.touch, d3_behavior_dragTouchSubject, "touchmove", "touchend");
    function drag() {
      this.on("mousedown.drag", mousedown).on("touchstart.drag", touchstart);
    }
    function dragstart(id, position, subject, move, end) {
      return function() {
        var that = this, target = d3.event.target, parent = that.parentNode, dispatch = event.of(that, arguments), dragged = 0, dragId = id(), dragName = ".drag" + (dragId == null ? "" : "-" + dragId), dragOffset, dragSubject = d3.select(subject()).on(move + dragName, moved).on(end + dragName, ended), dragRestore = d3_event_dragSuppress(), position0 = position(parent, dragId);
        if (origin) {
          dragOffset = origin.apply(that, arguments);
          dragOffset = [ dragOffset.x - position0[0], dragOffset.y - position0[1] ];
        } else {
          dragOffset = [ 0, 0 ];
        }
        dispatch({
          type: "dragstart"
        });
        function moved() {
          var position1 = position(parent, dragId), dx, dy;
          if (!position1) return;
          dx = position1[0] - position0[0];
          dy = position1[1] - position0[1];
          dragged |= dx | dy;
          position0 = position1;
          dispatch({
            type: "drag",
            x: position1[0] + dragOffset[0],
            y: position1[1] + dragOffset[1],
            dx: dx,
            dy: dy
          });
        }
        function ended() {
          if (!position(parent, dragId)) return;
          dragSubject.on(move + dragName, null).on(end + dragName, null);
          dragRestore(dragged && d3.event.target === target);
          dispatch({
            type: "dragend"
          });
        }
      };
    }
    drag.origin = function(x) {
      if (!arguments.length) return origin;
      origin = x;
      return drag;
    };
    return d3.rebind(drag, event, "on");
  };
  function d3_behavior_dragTouchId() {
    return d3.event.changedTouches[0].identifier;
  }
  function d3_behavior_dragTouchSubject() {
    return d3.event.target;
  }
  function d3_behavior_dragMouseSubject() {
    return d3_window;
  }
  var π = Math.PI, τ = 2 * π, halfπ = π / 2, ε = 1e-6, ε2 = ε * ε, d3_radians = π / 180, d3_degrees = 180 / π;
  function d3_sgn(x) {
    return x > 0 ? 1 : x < 0 ? -1 : 0;
  }
  function d3_cross2d(a, b, c) {
    return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  }
  function d3_acos(x) {
    return x > 1 ? 0 : x < -1 ? π : Math.acos(x);
  }
  function d3_asin(x) {
    return x > 1 ? halfπ : x < -1 ? -halfπ : Math.asin(x);
  }
  function d3_sinh(x) {
    return ((x = Math.exp(x)) - 1 / x) / 2;
  }
  function d3_cosh(x) {
    return ((x = Math.exp(x)) + 1 / x) / 2;
  }
  function d3_tanh(x) {
    return ((x = Math.exp(2 * x)) - 1) / (x + 1);
  }
  function d3_haversin(x) {
    return (x = Math.sin(x / 2)) * x;
  }
  var ρ = Math.SQRT2, ρ2 = 2, ρ4 = 4;
  d3.interpolateZoom = function(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2], ux1 = p1[0], uy1 = p1[1], w1 = p1[2];
    var dx = ux1 - ux0, dy = uy1 - uy0, d2 = dx * dx + dy * dy, d1 = Math.sqrt(d2), b0 = (w1 * w1 - w0 * w0 + ρ4 * d2) / (2 * w0 * ρ2 * d1), b1 = (w1 * w1 - w0 * w0 - ρ4 * d2) / (2 * w1 * ρ2 * d1), r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1), dr = r1 - r0, S = (dr || Math.log(w1 / w0)) / ρ;
    function interpolate(t) {
      var s = t * S;
      if (dr) {
        var coshr0 = d3_cosh(r0), u = w0 / (ρ2 * d1) * (coshr0 * d3_tanh(ρ * s + r0) - d3_sinh(r0));
        return [ ux0 + u * dx, uy0 + u * dy, w0 * coshr0 / d3_cosh(ρ * s + r0) ];
      }
      return [ ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(ρ * s) ];
    }
    interpolate.duration = S * 1e3;
    return interpolate;
  };
  d3.behavior.zoom = function() {
    var view = {
      x: 0,
      y: 0,
      k: 1
    }, translate0, center0, center, size = [ 960, 500 ], scaleExtent = d3_behavior_zoomInfinity, mousedown = "mousedown.zoom", mousemove = "mousemove.zoom", mouseup = "mouseup.zoom", mousewheelTimer, touchstart = "touchstart.zoom", touchtime, event = d3_eventDispatch(zoom, "zoomstart", "zoom", "zoomend"), x0, x1, y0, y1;
    function zoom(g) {
      g.on(mousedown, mousedowned).on(d3_behavior_zoomWheel + ".zoom", mousewheeled).on("dblclick.zoom", dblclicked).on(touchstart, touchstarted);
    }
    zoom.event = function(g) {
      g.each(function() {
        var dispatch = event.of(this, arguments), view1 = view;
        if (d3_transitionInheritId) {
          d3.select(this).transition().each("start.zoom", function() {
            view = this.__chart__ || {
              x: 0,
              y: 0,
              k: 1
            };
            zoomstarted(dispatch);
          }).tween("zoom:zoom", function() {
            var dx = size[0], dy = size[1], cx = dx / 2, cy = dy / 2, i = d3.interpolateZoom([ (cx - view.x) / view.k, (cy - view.y) / view.k, dx / view.k ], [ (cx - view1.x) / view1.k, (cy - view1.y) / view1.k, dx / view1.k ]);
            return function(t) {
              var l = i(t), k = dx / l[2];
              this.__chart__ = view = {
                x: cx - l[0] * k,
                y: cy - l[1] * k,
                k: k
              };
              zoomed(dispatch);
            };
          }).each("end.zoom", function() {
            zoomended(dispatch);
          });
        } else {
          this.__chart__ = view;
          zoomstarted(dispatch);
          zoomed(dispatch);
          zoomended(dispatch);
        }
      });
    };
    zoom.translate = function(_) {
      if (!arguments.length) return [ view.x, view.y ];
      view = {
        x: +_[0],
        y: +_[1],
        k: view.k
      };
      rescale();
      return zoom;
    };
    zoom.scale = function(_) {
      if (!arguments.length) return view.k;
      view = {
        x: view.x,
        y: view.y,
        k: +_
      };
      rescale();
      return zoom;
    };
    zoom.scaleExtent = function(_) {
      if (!arguments.length) return scaleExtent;
      scaleExtent = _ == null ? d3_behavior_zoomInfinity : [ +_[0], +_[1] ];
      return zoom;
    };
    zoom.center = function(_) {
      if (!arguments.length) return center;
      center = _ && [ +_[0], +_[1] ];
      return zoom;
    };
    zoom.size = function(_) {
      if (!arguments.length) return size;
      size = _ && [ +_[0], +_[1] ];
      return zoom;
    };
    zoom.x = function(z) {
      if (!arguments.length) return x1;
      x1 = z;
      x0 = z.copy();
      view = {
        x: 0,
        y: 0,
        k: 1
      };
      return zoom;
    };
    zoom.y = function(z) {
      if (!arguments.length) return y1;
      y1 = z;
      y0 = z.copy();
      view = {
        x: 0,
        y: 0,
        k: 1
      };
      return zoom;
    };
    function location(p) {
      return [ (p[0] - view.x) / view.k, (p[1] - view.y) / view.k ];
    }
    function point(l) {
      return [ l[0] * view.k + view.x, l[1] * view.k + view.y ];
    }
    function scaleTo(s) {
      view.k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], s));
    }
    function translateTo(p, l) {
      l = point(l);
      view.x += p[0] - l[0];
      view.y += p[1] - l[1];
    }
    function rescale() {
      if (x1) x1.domain(x0.range().map(function(x) {
        return (x - view.x) / view.k;
      }).map(x0.invert));
      if (y1) y1.domain(y0.range().map(function(y) {
        return (y - view.y) / view.k;
      }).map(y0.invert));
    }
    function zoomstarted(dispatch) {
      dispatch({
        type: "zoomstart"
      });
    }
    function zoomed(dispatch) {
      rescale();
      dispatch({
        type: "zoom",
        scale: view.k,
        translate: [ view.x, view.y ]
      });
    }
    function zoomended(dispatch) {
      dispatch({
        type: "zoomend"
      });
    }
    function mousedowned() {
      var that = this, target = d3.event.target, dispatch = event.of(that, arguments), dragged = 0, subject = d3.select(d3_window).on(mousemove, moved).on(mouseup, ended), location0 = location(d3.mouse(that)), dragRestore = d3_event_dragSuppress();
      d3_selection_interrupt.call(that);
      zoomstarted(dispatch);
      function moved() {
        dragged = 1;
        translateTo(d3.mouse(that), location0);
        zoomed(dispatch);
      }
      function ended() {
        subject.on(mousemove, null).on(mouseup, null);
        dragRestore(dragged && d3.event.target === target);
        zoomended(dispatch);
      }
    }
    function touchstarted() {
      var that = this, dispatch = event.of(that, arguments), locations0 = {}, distance0 = 0, scale0, zoomName = ".zoom-" + d3.event.changedTouches[0].identifier, touchmove = "touchmove" + zoomName, touchend = "touchend" + zoomName, targets = [], subject = d3.select(that).on(mousedown, null).on(touchstart, started), dragRestore = d3_event_dragSuppress();
      d3_selection_interrupt.call(that);
      started();
      zoomstarted(dispatch);
      function relocate() {
        var touches = d3.touches(that);
        scale0 = view.k;
        touches.forEach(function(t) {
          if (t.identifier in locations0) locations0[t.identifier] = location(t);
        });
        return touches;
      }
      function started() {
        var target = d3.event.target;
        d3.select(target).on(touchmove, moved).on(touchend, ended);
        targets.push(target);
        var changed = d3.event.changedTouches;
        for (var i = 0, n = changed.length; i < n; ++i) {
          locations0[changed[i].identifier] = null;
        }
        var touches = relocate(), now = Date.now();
        if (touches.length === 1) {
          if (now - touchtime < 500) {
            var p = touches[0], l = locations0[p.identifier];
            scaleTo(view.k * 2);
            translateTo(p, l);
            d3_eventPreventDefault();
            zoomed(dispatch);
          }
          touchtime = now;
        } else if (touches.length > 1) {
          var p = touches[0], q = touches[1], dx = p[0] - q[0], dy = p[1] - q[1];
          distance0 = dx * dx + dy * dy;
        }
      }
      function moved() {
        var touches = d3.touches(that), p0, l0, p1, l1;
        for (var i = 0, n = touches.length; i < n; ++i, l1 = null) {
          p1 = touches[i];
          if (l1 = locations0[p1.identifier]) {
            if (l0) break;
            p0 = p1, l0 = l1;
          }
        }
        if (l1) {
          var distance1 = (distance1 = p1[0] - p0[0]) * distance1 + (distance1 = p1[1] - p0[1]) * distance1, scale1 = distance0 && Math.sqrt(distance1 / distance0);
          p0 = [ (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 ];
          l0 = [ (l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2 ];
          scaleTo(scale1 * scale0);
        }
        touchtime = null;
        translateTo(p0, l0);
        zoomed(dispatch);
      }
      function ended() {
        if (d3.event.touches.length) {
          var changed = d3.event.changedTouches;
          for (var i = 0, n = changed.length; i < n; ++i) {
            delete locations0[changed[i].identifier];
          }
          for (var identifier in locations0) {
            return void relocate();
          }
        }
        d3.selectAll(targets).on(zoomName, null);
        subject.on(mousedown, mousedowned).on(touchstart, touchstarted);
        dragRestore();
        zoomended(dispatch);
      }
    }
    function mousewheeled() {
      var dispatch = event.of(this, arguments);
      if (mousewheelTimer) clearTimeout(mousewheelTimer); else translate0 = location(center0 = center || d3.mouse(this)), 
      d3_selection_interrupt.call(this), zoomstarted(dispatch);
      mousewheelTimer = setTimeout(function() {
        mousewheelTimer = null;
        zoomended(dispatch);
      }, 50);
      d3_eventPreventDefault();
      scaleTo(Math.pow(2, d3_behavior_zoomDelta() * .002) * view.k);
      translateTo(center0, translate0);
      zoomed(dispatch);
    }
    function dblclicked() {
      var dispatch = event.of(this, arguments), p = d3.mouse(this), l = location(p), k = Math.log(view.k) / Math.LN2;
      zoomstarted(dispatch);
      scaleTo(Math.pow(2, d3.event.shiftKey ? Math.ceil(k) - 1 : Math.floor(k) + 1));
      translateTo(p, l);
      zoomed(dispatch);
      zoomended(dispatch);
    }
    return d3.rebind(zoom, event, "on");
  };
  var d3_behavior_zoomInfinity = [ 0, Infinity ];
  var d3_behavior_zoomDelta, d3_behavior_zoomWheel = "onwheel" in d3_document ? (d3_behavior_zoomDelta = function() {
    return -d3.event.deltaY * (d3.event.deltaMode ? 120 : 1);
  }, "wheel") : "onmousewheel" in d3_document ? (d3_behavior_zoomDelta = function() {
    return d3.event.wheelDelta;
  }, "mousewheel") : (d3_behavior_zoomDelta = function() {
    return -d3.event.detail;
  }, "MozMousePixelScroll");
  d3.color = d3_color;
  function d3_color() {}
  d3_color.prototype.toString = function() {
    return this.rgb() + "";
  };
  d3.hsl = d3_hsl;
  function d3_hsl(h, s, l) {
    return this instanceof d3_hsl ? void (this.h = +h, this.s = +s, this.l = +l) : arguments.length < 2 ? h instanceof d3_hsl ? new d3_hsl(h.h, h.s, h.l) : d3_rgb_parse("" + h, d3_rgb_hsl, d3_hsl) : new d3_hsl(h, s, l);
  }
  var d3_hslPrototype = d3_hsl.prototype = new d3_color();
  d3_hslPrototype.brighter = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return new d3_hsl(this.h, this.s, this.l / k);
  };
  d3_hslPrototype.darker = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return new d3_hsl(this.h, this.s, k * this.l);
  };
  d3_hslPrototype.rgb = function() {
    return d3_hsl_rgb(this.h, this.s, this.l);
  };
  function d3_hsl_rgb(h, s, l) {
    var m1, m2;
    h = isNaN(h) ? 0 : (h %= 360) < 0 ? h + 360 : h;
    s = isNaN(s) ? 0 : s < 0 ? 0 : s > 1 ? 1 : s;
    l = l < 0 ? 0 : l > 1 ? 1 : l;
    m2 = l <= .5 ? l * (1 + s) : l + s - l * s;
    m1 = 2 * l - m2;
    function v(h) {
      if (h > 360) h -= 360; else if (h < 0) h += 360;
      if (h < 60) return m1 + (m2 - m1) * h / 60;
      if (h < 180) return m2;
      if (h < 240) return m1 + (m2 - m1) * (240 - h) / 60;
      return m1;
    }
    function vv(h) {
      return Math.round(v(h) * 255);
    }
    return new d3_rgb(vv(h + 120), vv(h), vv(h - 120));
  }
  d3.hcl = d3_hcl;
  function d3_hcl(h, c, l) {
    return this instanceof d3_hcl ? void (this.h = +h, this.c = +c, this.l = +l) : arguments.length < 2 ? h instanceof d3_hcl ? new d3_hcl(h.h, h.c, h.l) : h instanceof d3_lab ? d3_lab_hcl(h.l, h.a, h.b) : d3_lab_hcl((h = d3_rgb_lab((h = d3.rgb(h)).r, h.g, h.b)).l, h.a, h.b) : new d3_hcl(h, c, l);
  }
  var d3_hclPrototype = d3_hcl.prototype = new d3_color();
  d3_hclPrototype.brighter = function(k) {
    return new d3_hcl(this.h, this.c, Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)));
  };
  d3_hclPrototype.darker = function(k) {
    return new d3_hcl(this.h, this.c, Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)));
  };
  d3_hclPrototype.rgb = function() {
    return d3_hcl_lab(this.h, this.c, this.l).rgb();
  };
  function d3_hcl_lab(h, c, l) {
    if (isNaN(h)) h = 0;
    if (isNaN(c)) c = 0;
    return new d3_lab(l, Math.cos(h *= d3_radians) * c, Math.sin(h) * c);
  }
  d3.lab = d3_lab;
  function d3_lab(l, a, b) {
    return this instanceof d3_lab ? void (this.l = +l, this.a = +a, this.b = +b) : arguments.length < 2 ? l instanceof d3_lab ? new d3_lab(l.l, l.a, l.b) : l instanceof d3_hcl ? d3_hcl_lab(l.l, l.c, l.h) : d3_rgb_lab((l = d3_rgb(l)).r, l.g, l.b) : new d3_lab(l, a, b);
  }
  var d3_lab_K = 18;
  var d3_lab_X = .95047, d3_lab_Y = 1, d3_lab_Z = 1.08883;
  var d3_labPrototype = d3_lab.prototype = new d3_color();
  d3_labPrototype.brighter = function(k) {
    return new d3_lab(Math.min(100, this.l + d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
  };
  d3_labPrototype.darker = function(k) {
    return new d3_lab(Math.max(0, this.l - d3_lab_K * (arguments.length ? k : 1)), this.a, this.b);
  };
  d3_labPrototype.rgb = function() {
    return d3_lab_rgb(this.l, this.a, this.b);
  };
  function d3_lab_rgb(l, a, b) {
    var y = (l + 16) / 116, x = y + a / 500, z = y - b / 200;
    x = d3_lab_xyz(x) * d3_lab_X;
    y = d3_lab_xyz(y) * d3_lab_Y;
    z = d3_lab_xyz(z) * d3_lab_Z;
    return new d3_rgb(d3_xyz_rgb(3.2404542 * x - 1.5371385 * y - .4985314 * z), d3_xyz_rgb(-.969266 * x + 1.8760108 * y + .041556 * z), d3_xyz_rgb(.0556434 * x - .2040259 * y + 1.0572252 * z));
  }
  function d3_lab_hcl(l, a, b) {
    return l > 0 ? new d3_hcl(Math.atan2(b, a) * d3_degrees, Math.sqrt(a * a + b * b), l) : new d3_hcl(NaN, NaN, l);
  }
  function d3_lab_xyz(x) {
    return x > .206893034 ? x * x * x : (x - 4 / 29) / 7.787037;
  }
  function d3_xyz_lab(x) {
    return x > .008856 ? Math.pow(x, 1 / 3) : 7.787037 * x + 4 / 29;
  }
  function d3_xyz_rgb(r) {
    return Math.round(255 * (r <= .00304 ? 12.92 * r : 1.055 * Math.pow(r, 1 / 2.4) - .055));
  }
  d3.rgb = d3_rgb;
  function d3_rgb(r, g, b) {
    return this instanceof d3_rgb ? void (this.r = ~~r, this.g = ~~g, this.b = ~~b) : arguments.length < 2 ? r instanceof d3_rgb ? new d3_rgb(r.r, r.g, r.b) : d3_rgb_parse("" + r, d3_rgb, d3_hsl_rgb) : new d3_rgb(r, g, b);
  }
  function d3_rgbNumber(value) {
    return new d3_rgb(value >> 16, value >> 8 & 255, value & 255);
  }
  function d3_rgbString(value) {
    return d3_rgbNumber(value) + "";
  }
  var d3_rgbPrototype = d3_rgb.prototype = new d3_color();
  d3_rgbPrototype.brighter = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    var r = this.r, g = this.g, b = this.b, i = 30;
    if (!r && !g && !b) return new d3_rgb(i, i, i);
    if (r && r < i) r = i;
    if (g && g < i) g = i;
    if (b && b < i) b = i;
    return new d3_rgb(Math.min(255, r / k), Math.min(255, g / k), Math.min(255, b / k));
  };
  d3_rgbPrototype.darker = function(k) {
    k = Math.pow(.7, arguments.length ? k : 1);
    return new d3_rgb(k * this.r, k * this.g, k * this.b);
  };
  d3_rgbPrototype.hsl = function() {
    return d3_rgb_hsl(this.r, this.g, this.b);
  };
  d3_rgbPrototype.toString = function() {
    return "#" + d3_rgb_hex(this.r) + d3_rgb_hex(this.g) + d3_rgb_hex(this.b);
  };
  function d3_rgb_hex(v) {
    return v < 16 ? "0" + Math.max(0, v).toString(16) : Math.min(255, v).toString(16);
  }
  function d3_rgb_parse(format, rgb, hsl) {
    var r = 0, g = 0, b = 0, m1, m2, color;
    m1 = /([a-z]+)\((.*)\)/i.exec(format);
    if (m1) {
      m2 = m1[2].split(",");
      switch (m1[1]) {
       case "hsl":
        {
          return hsl(parseFloat(m2[0]), parseFloat(m2[1]) / 100, parseFloat(m2[2]) / 100);
        }

       case "rgb":
        {
          return rgb(d3_rgb_parseNumber(m2[0]), d3_rgb_parseNumber(m2[1]), d3_rgb_parseNumber(m2[2]));
        }
      }
    }
    if (color = d3_rgb_names.get(format)) return rgb(color.r, color.g, color.b);
    if (format != null && format.charAt(0) === "#" && !isNaN(color = parseInt(format.substring(1), 16))) {
      if (format.length === 4) {
        r = (color & 3840) >> 4;
        r = r >> 4 | r;
        g = color & 240;
        g = g >> 4 | g;
        b = color & 15;
        b = b << 4 | b;
      } else if (format.length === 7) {
        r = (color & 16711680) >> 16;
        g = (color & 65280) >> 8;
        b = color & 255;
      }
    }
    return rgb(r, g, b);
  }
  function d3_rgb_hsl(r, g, b) {
    var min = Math.min(r /= 255, g /= 255, b /= 255), max = Math.max(r, g, b), d = max - min, h, s, l = (max + min) / 2;
    if (d) {
      s = l < .5 ? d / (max + min) : d / (2 - max - min);
      if (r == max) h = (g - b) / d + (g < b ? 6 : 0); else if (g == max) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h *= 60;
    } else {
      h = NaN;
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new d3_hsl(h, s, l);
  }
  function d3_rgb_lab(r, g, b) {
    r = d3_rgb_xyz(r);
    g = d3_rgb_xyz(g);
    b = d3_rgb_xyz(b);
    var x = d3_xyz_lab((.4124564 * r + .3575761 * g + .1804375 * b) / d3_lab_X), y = d3_xyz_lab((.2126729 * r + .7151522 * g + .072175 * b) / d3_lab_Y), z = d3_xyz_lab((.0193339 * r + .119192 * g + .9503041 * b) / d3_lab_Z);
    return d3_lab(116 * y - 16, 500 * (x - y), 200 * (y - z));
  }
  function d3_rgb_xyz(r) {
    return (r /= 255) <= .04045 ? r / 12.92 : Math.pow((r + .055) / 1.055, 2.4);
  }
  function d3_rgb_parseNumber(c) {
    var f = parseFloat(c);
    return c.charAt(c.length - 1) === "%" ? Math.round(f * 2.55) : f;
  }
  var d3_rgb_names = d3.map({
    aliceblue: 15792383,
    antiquewhite: 16444375,
    aqua: 65535,
    aquamarine: 8388564,
    azure: 15794175,
    beige: 16119260,
    bisque: 16770244,
    black: 0,
    blanchedalmond: 16772045,
    blue: 255,
    blueviolet: 9055202,
    brown: 10824234,
    burlywood: 14596231,
    cadetblue: 6266528,
    chartreuse: 8388352,
    chocolate: 13789470,
    coral: 16744272,
    cornflowerblue: 6591981,
    cornsilk: 16775388,
    crimson: 14423100,
    cyan: 65535,
    darkblue: 139,
    darkcyan: 35723,
    darkgoldenrod: 12092939,
    darkgray: 11119017,
    darkgreen: 25600,
    darkgrey: 11119017,
    darkkhaki: 12433259,
    darkmagenta: 9109643,
    darkolivegreen: 5597999,
    darkorange: 16747520,
    darkorchid: 10040012,
    darkred: 9109504,
    darksalmon: 15308410,
    darkseagreen: 9419919,
    darkslateblue: 4734347,
    darkslategray: 3100495,
    darkslategrey: 3100495,
    darkturquoise: 52945,
    darkviolet: 9699539,
    deeppink: 16716947,
    deepskyblue: 49151,
    dimgray: 6908265,
    dimgrey: 6908265,
    dodgerblue: 2003199,
    firebrick: 11674146,
    floralwhite: 16775920,
    forestgreen: 2263842,
    fuchsia: 16711935,
    gainsboro: 14474460,
    ghostwhite: 16316671,
    gold: 16766720,
    goldenrod: 14329120,
    gray: 8421504,
    green: 32768,
    greenyellow: 11403055,
    grey: 8421504,
    honeydew: 15794160,
    hotpink: 16738740,
    indianred: 13458524,
    indigo: 4915330,
    ivory: 16777200,
    khaki: 15787660,
    lavender: 15132410,
    lavenderblush: 16773365,
    lawngreen: 8190976,
    lemonchiffon: 16775885,
    lightblue: 11393254,
    lightcoral: 15761536,
    lightcyan: 14745599,
    lightgoldenrodyellow: 16448210,
    lightgray: 13882323,
    lightgreen: 9498256,
    lightgrey: 13882323,
    lightpink: 16758465,
    lightsalmon: 16752762,
    lightseagreen: 2142890,
    lightskyblue: 8900346,
    lightslategray: 7833753,
    lightslategrey: 7833753,
    lightsteelblue: 11584734,
    lightyellow: 16777184,
    lime: 65280,
    limegreen: 3329330,
    linen: 16445670,
    magenta: 16711935,
    maroon: 8388608,
    mediumaquamarine: 6737322,
    mediumblue: 205,
    mediumorchid: 12211667,
    mediumpurple: 9662683,
    mediumseagreen: 3978097,
    mediumslateblue: 8087790,
    mediumspringgreen: 64154,
    mediumturquoise: 4772300,
    mediumvioletred: 13047173,
    midnightblue: 1644912,
    mintcream: 16121850,
    mistyrose: 16770273,
    moccasin: 16770229,
    navajowhite: 16768685,
    navy: 128,
    oldlace: 16643558,
    olive: 8421376,
    olivedrab: 7048739,
    orange: 16753920,
    orangered: 16729344,
    orchid: 14315734,
    palegoldenrod: 15657130,
    palegreen: 10025880,
    paleturquoise: 11529966,
    palevioletred: 14381203,
    papayawhip: 16773077,
    peachpuff: 16767673,
    peru: 13468991,
    pink: 16761035,
    plum: 14524637,
    powderblue: 11591910,
    purple: 8388736,
    red: 16711680,
    rosybrown: 12357519,
    royalblue: 4286945,
    saddlebrown: 9127187,
    salmon: 16416882,
    sandybrown: 16032864,
    seagreen: 3050327,
    seashell: 16774638,
    sienna: 10506797,
    silver: 12632256,
    skyblue: 8900331,
    slateblue: 6970061,
    slategray: 7372944,
    slategrey: 7372944,
    snow: 16775930,
    springgreen: 65407,
    steelblue: 4620980,
    tan: 13808780,
    teal: 32896,
    thistle: 14204888,
    tomato: 16737095,
    turquoise: 4251856,
    violet: 15631086,
    wheat: 16113331,
    white: 16777215,
    whitesmoke: 16119285,
    yellow: 16776960,
    yellowgreen: 10145074
  });
  d3_rgb_names.forEach(function(key, value) {
    d3_rgb_names.set(key, d3_rgbNumber(value));
  });
  function d3_functor(v) {
    return typeof v === "function" ? v : function() {
      return v;
    };
  }
  d3.functor = d3_functor;
  function d3_identity(d) {
    return d;
  }
  d3.xhr = d3_xhrType(d3_identity);
  function d3_xhrType(response) {
    return function(url, mimeType, callback) {
      if (arguments.length === 2 && typeof mimeType === "function") callback = mimeType, 
      mimeType = null;
      return d3_xhr(url, mimeType, response, callback);
    };
  }
  function d3_xhr(url, mimeType, response, callback) {
    var xhr = {}, dispatch = d3.dispatch("beforesend", "progress", "load", "error"), headers = {}, request = new XMLHttpRequest(), responseType = null;
    if (d3_window.XDomainRequest && !("withCredentials" in request) && /^(http(s)?:)?\/\//.test(url)) request = new XDomainRequest();
    "onload" in request ? request.onload = request.onerror = respond : request.onreadystatechange = function() {
      request.readyState > 3 && respond();
    };
    function respond() {
      var status = request.status, result;
      if (!status && request.responseText || status >= 200 && status < 300 || status === 304) {
        try {
          result = response.call(xhr, request);
        } catch (e) {
          dispatch.error.call(xhr, e);
          return;
        }
        dispatch.load.call(xhr, result);
      } else {
        dispatch.error.call(xhr, request);
      }
    }
    request.onprogress = function(event) {
      var o = d3.event;
      d3.event = event;
      try {
        dispatch.progress.call(xhr, request);
      } finally {
        d3.event = o;
      }
    };
    xhr.header = function(name, value) {
      name = (name + "").toLowerCase();
      if (arguments.length < 2) return headers[name];
      if (value == null) delete headers[name]; else headers[name] = value + "";
      return xhr;
    };
    xhr.mimeType = function(value) {
      if (!arguments.length) return mimeType;
      mimeType = value == null ? null : value + "";
      return xhr;
    };
    xhr.responseType = function(value) {
      if (!arguments.length) return responseType;
      responseType = value;
      return xhr;
    };
    xhr.response = function(value) {
      response = value;
      return xhr;
    };
    [ "get", "post" ].forEach(function(method) {
      xhr[method] = function() {
        return xhr.send.apply(xhr, [ method ].concat(d3_array(arguments)));
      };
    });
    xhr.send = function(method, data, callback) {
      if (arguments.length === 2 && typeof data === "function") callback = data, data = null;
      request.open(method, url, true);
      if (mimeType != null && !("accept" in headers)) headers["accept"] = mimeType + ",*/*";
      if (request.setRequestHeader) for (var name in headers) request.setRequestHeader(name, headers[name]);
      if (mimeType != null && request.overrideMimeType) request.overrideMimeType(mimeType);
      if (responseType != null) request.responseType = responseType;
      if (callback != null) xhr.on("error", callback).on("load", function(request) {
        callback(null, request);
      });
      dispatch.beforesend.call(xhr, request);
      request.send(data == null ? null : data);
      return xhr;
    };
    xhr.abort = function() {
      request.abort();
      return xhr;
    };
    d3.rebind(xhr, dispatch, "on");
    return callback == null ? xhr : xhr.get(d3_xhr_fixCallback(callback));
  }
  function d3_xhr_fixCallback(callback) {
    return callback.length === 1 ? function(error, request) {
      callback(error == null ? request : null);
    } : callback;
  }
  d3.dsv = function(delimiter, mimeType) {
    var reFormat = new RegExp('["' + delimiter + "\n]"), delimiterCode = delimiter.charCodeAt(0);
    function dsv(url, row, callback) {
      if (arguments.length < 3) callback = row, row = null;
      var xhr = d3_xhr(url, mimeType, row == null ? response : typedResponse(row), callback);
      xhr.row = function(_) {
        return arguments.length ? xhr.response((row = _) == null ? response : typedResponse(_)) : row;
      };
      return xhr;
    }
    function response(request) {
      return dsv.parse(request.responseText);
    }
    function typedResponse(f) {
      return function(request) {
        return dsv.parse(request.responseText, f);
      };
    }
    dsv.parse = function(text, f) {
      var o;
      return dsv.parseRows(text, function(row, i) {
        if (o) return o(row, i - 1);
        var a = new Function("d", "return {" + row.map(function(name, i) {
          return JSON.stringify(name) + ": d[" + i + "]";
        }).join(",") + "}");
        o = f ? function(row, i) {
          return f(a(row), i);
        } : a;
      });
    };
    dsv.parseRows = function(text, f) {
      var EOL = {}, EOF = {}, rows = [], N = text.length, I = 0, n = 0, t, eol;
      function token() {
        if (I >= N) return EOF;
        if (eol) return eol = false, EOL;
        var j = I;
        if (text.charCodeAt(j) === 34) {
          var i = j;
          while (i++ < N) {
            if (text.charCodeAt(i) === 34) {
              if (text.charCodeAt(i + 1) !== 34) break;
              ++i;
            }
          }
          I = i + 2;
          var c = text.charCodeAt(i + 1);
          if (c === 13) {
            eol = true;
            if (text.charCodeAt(i + 2) === 10) ++I;
          } else if (c === 10) {
            eol = true;
          }
          return text.substring(j + 1, i).replace(/""/g, '"');
        }
        while (I < N) {
          var c = text.charCodeAt(I++), k = 1;
          if (c === 10) eol = true; else if (c === 13) {
            eol = true;
            if (text.charCodeAt(I) === 10) ++I, ++k;
          } else if (c !== delimiterCode) continue;
          return text.substring(j, I - k);
        }
        return text.substring(j);
      }
      while ((t = token()) !== EOF) {
        var a = [];
        while (t !== EOL && t !== EOF) {
          a.push(t);
          t = token();
        }
        if (f && !(a = f(a, n++))) continue;
        rows.push(a);
      }
      return rows;
    };
    dsv.format = function(rows) {
      if (Array.isArray(rows[0])) return dsv.formatRows(rows);
      var fieldSet = new d3_Set(), fields = [];
      rows.forEach(function(row) {
        for (var field in row) {
          if (!fieldSet.has(field)) {
            fields.push(fieldSet.add(field));
          }
        }
      });
      return [ fields.map(formatValue).join(delimiter) ].concat(rows.map(function(row) {
        return fields.map(function(field) {
          return formatValue(row[field]);
        }).join(delimiter);
      })).join("\n");
    };
    dsv.formatRows = function(rows) {
      return rows.map(formatRow).join("\n");
    };
    function formatRow(row) {
      return row.map(formatValue).join(delimiter);
    }
    function formatValue(text) {
      return reFormat.test(text) ? '"' + text.replace(/\"/g, '""') + '"' : text;
    }
    return dsv;
  };
  d3.csv = d3.dsv(",", "text/csv");
  d3.tsv = d3.dsv("	", "text/tab-separated-values");
  d3.touch = function(container, touches, identifier) {
    if (arguments.length < 3) identifier = touches, touches = d3_eventSource().changedTouches;
    if (touches) for (var i = 0, n = touches.length, touch; i < n; ++i) {
      if ((touch = touches[i]).identifier === identifier) {
        return d3_mousePoint(container, touch);
      }
    }
  };
  var d3_timer_queueHead, d3_timer_queueTail, d3_timer_interval, d3_timer_timeout, d3_timer_active, d3_timer_frame = d3_window[d3_vendorSymbol(d3_window, "requestAnimationFrame")] || function(callback) {
    setTimeout(callback, 17);
  };
  d3.timer = function(callback, delay, then) {
    var n = arguments.length;
    if (n < 2) delay = 0;
    if (n < 3) then = Date.now();
    var time = then + delay, timer = {
      c: callback,
      t: time,
      f: false,
      n: null
    };
    if (d3_timer_queueTail) d3_timer_queueTail.n = timer; else d3_timer_queueHead = timer;
    d3_timer_queueTail = timer;
    if (!d3_timer_interval) {
      d3_timer_timeout = clearTimeout(d3_timer_timeout);
      d3_timer_interval = 1;
      d3_timer_frame(d3_timer_step);
    }
  };
  function d3_timer_step() {
    var now = d3_timer_mark(), delay = d3_timer_sweep() - now;
    if (delay > 24) {
      if (isFinite(delay)) {
        clearTimeout(d3_timer_timeout);
        d3_timer_timeout = setTimeout(d3_timer_step, delay);
      }
      d3_timer_interval = 0;
    } else {
      d3_timer_interval = 1;
      d3_timer_frame(d3_timer_step);
    }
  }
  d3.timer.flush = function() {
    d3_timer_mark();
    d3_timer_sweep();
  };
  function d3_timer_mark() {
    var now = Date.now();
    d3_timer_active = d3_timer_queueHead;
    while (d3_timer_active) {
      if (now >= d3_timer_active.t) d3_timer_active.f = d3_timer_active.c(now - d3_timer_active.t);
      d3_timer_active = d3_timer_active.n;
    }
    return now;
  }
  function d3_timer_sweep() {
    var t0, t1 = d3_timer_queueHead, time = Infinity;
    while (t1) {
      if (t1.f) {
        t1 = t0 ? t0.n = t1.n : d3_timer_queueHead = t1.n;
      } else {
        if (t1.t < time) time = t1.t;
        t1 = (t0 = t1).n;
      }
    }
    d3_timer_queueTail = t0;
    return time;
  }
  function d3_format_precision(x, p) {
    return p - (x ? Math.ceil(Math.log(x) / Math.LN10) : 1);
  }
  d3.round = function(x, n) {
    return n ? Math.round(x * (n = Math.pow(10, n))) / n : Math.round(x);
  };
  var d3_formatPrefixes = [ "y", "z", "a", "f", "p", "n", "µ", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y" ].map(d3_formatPrefix);
  d3.formatPrefix = function(value, precision) {
    var i = 0;
    if (value) {
      if (value < 0) value *= -1;
      if (precision) value = d3.round(value, d3_format_precision(value, precision));
      i = 1 + Math.floor(1e-12 + Math.log(value) / Math.LN10);
      i = Math.max(-24, Math.min(24, Math.floor((i - 1) / 3) * 3));
    }
    return d3_formatPrefixes[8 + i / 3];
  };
  function d3_formatPrefix(d, i) {
    var k = Math.pow(10, abs(8 - i) * 3);
    return {
      scale: i > 8 ? function(d) {
        return d / k;
      } : function(d) {
        return d * k;
      },
      symbol: d
    };
  }
  function d3_locale_numberFormat(locale) {
    var locale_decimal = locale.decimal, locale_thousands = locale.thousands, locale_grouping = locale.grouping, locale_currency = locale.currency, formatGroup = locale_grouping ? function(value) {
      var i = value.length, t = [], j = 0, g = locale_grouping[0];
      while (i > 0 && g > 0) {
        t.push(value.substring(i -= g, i + g));
        g = locale_grouping[j = (j + 1) % locale_grouping.length];
      }
      return t.reverse().join(locale_thousands);
    } : d3_identity;
    return function(specifier) {
      var match = d3_format_re.exec(specifier), fill = match[1] || " ", align = match[2] || ">", sign = match[3] || "", symbol = match[4] || "", zfill = match[5], width = +match[6], comma = match[7], precision = match[8], type = match[9], scale = 1, prefix = "", suffix = "", integer = false;
      if (precision) precision = +precision.substring(1);
      if (zfill || fill === "0" && align === "=") {
        zfill = fill = "0";
        align = "=";
        if (comma) width -= Math.floor((width - 1) / 4);
      }
      switch (type) {
       case "n":
        comma = true;
        type = "g";
        break;

       case "%":
        scale = 100;
        suffix = "%";
        type = "f";
        break;

       case "p":
        scale = 100;
        suffix = "%";
        type = "r";
        break;

       case "b":
       case "o":
       case "x":
       case "X":
        if (symbol === "#") prefix = "0" + type.toLowerCase();

       case "c":
       case "d":
        integer = true;
        precision = 0;
        break;

       case "s":
        scale = -1;
        type = "r";
        break;
      }
      if (symbol === "$") prefix = locale_currency[0], suffix = locale_currency[1];
      if (type == "r" && !precision) type = "g";
      if (precision != null) {
        if (type == "g") precision = Math.max(1, Math.min(21, precision)); else if (type == "e" || type == "f") precision = Math.max(0, Math.min(20, precision));
      }
      type = d3_format_types.get(type) || d3_format_typeDefault;
      var zcomma = zfill && comma;
      return function(value) {
        var fullSuffix = suffix;
        if (integer && value % 1) return "";
        var negative = value < 0 || value === 0 && 1 / value < 0 ? (value = -value, "-") : sign;
        if (scale < 0) {
          var unit = d3.formatPrefix(value, precision);
          value = unit.scale(value);
          fullSuffix = unit.symbol + suffix;
        } else {
          value *= scale;
        }
        value = type(value, precision);
        var i = value.lastIndexOf("."), before = i < 0 ? value : value.substring(0, i), after = i < 0 ? "" : locale_decimal + value.substring(i + 1);
        if (!zfill && comma) before = formatGroup(before);
        var length = prefix.length + before.length + after.length + (zcomma ? 0 : negative.length), padding = length < width ? new Array(length = width - length + 1).join(fill) : "";
        if (zcomma) before = formatGroup(padding + before);
        negative += prefix;
        value = before + after;
        return (align === "<" ? negative + value + padding : align === ">" ? padding + negative + value : align === "^" ? padding.substring(0, length >>= 1) + negative + value + padding.substring(length) : negative + (zcomma ? value : padding + value)) + fullSuffix;
      };
    };
  }
  var d3_format_re = /(?:([^{])?([<>=^]))?([+\- ])?([$#])?(0)?(\d+)?(,)?(\.-?\d+)?([a-z%])?/i;
  var d3_format_types = d3.map({
    b: function(x) {
      return x.toString(2);
    },
    c: function(x) {
      return String.fromCharCode(x);
    },
    o: function(x) {
      return x.toString(8);
    },
    x: function(x) {
      return x.toString(16);
    },
    X: function(x) {
      return x.toString(16).toUpperCase();
    },
    g: function(x, p) {
      return x.toPrecision(p);
    },
    e: function(x, p) {
      return x.toExponential(p);
    },
    f: function(x, p) {
      return x.toFixed(p);
    },
    r: function(x, p) {
      return (x = d3.round(x, d3_format_precision(x, p))).toFixed(Math.max(0, Math.min(20, d3_format_precision(x * (1 + 1e-15), p))));
    }
  });
  function d3_format_typeDefault(x) {
    return x + "";
  }
  var d3_time = d3.time = {}, d3_date = Date;
  function d3_date_utc() {
    this._ = new Date(arguments.length > 1 ? Date.UTC.apply(this, arguments) : arguments[0]);
  }
  d3_date_utc.prototype = {
    getDate: function() {
      return this._.getUTCDate();
    },
    getDay: function() {
      return this._.getUTCDay();
    },
    getFullYear: function() {
      return this._.getUTCFullYear();
    },
    getHours: function() {
      return this._.getUTCHours();
    },
    getMilliseconds: function() {
      return this._.getUTCMilliseconds();
    },
    getMinutes: function() {
      return this._.getUTCMinutes();
    },
    getMonth: function() {
      return this._.getUTCMonth();
    },
    getSeconds: function() {
      return this._.getUTCSeconds();
    },
    getTime: function() {
      return this._.getTime();
    },
    getTimezoneOffset: function() {
      return 0;
    },
    valueOf: function() {
      return this._.valueOf();
    },
    setDate: function() {
      d3_time_prototype.setUTCDate.apply(this._, arguments);
    },
    setDay: function() {
      d3_time_prototype.setUTCDay.apply(this._, arguments);
    },
    setFullYear: function() {
      d3_time_prototype.setUTCFullYear.apply(this._, arguments);
    },
    setHours: function() {
      d3_time_prototype.setUTCHours.apply(this._, arguments);
    },
    setMilliseconds: function() {
      d3_time_prototype.setUTCMilliseconds.apply(this._, arguments);
    },
    setMinutes: function() {
      d3_time_prototype.setUTCMinutes.apply(this._, arguments);
    },
    setMonth: function() {
      d3_time_prototype.setUTCMonth.apply(this._, arguments);
    },
    setSeconds: function() {
      d3_time_prototype.setUTCSeconds.apply(this._, arguments);
    },
    setTime: function() {
      d3_time_prototype.setTime.apply(this._, arguments);
    }
  };
  var d3_time_prototype = Date.prototype;
  function d3_time_interval(local, step, number) {
    function round(date) {
      var d0 = local(date), d1 = offset(d0, 1);
      return date - d0 < d1 - date ? d0 : d1;
    }
    function ceil(date) {
      step(date = local(new d3_date(date - 1)), 1);
      return date;
    }
    function offset(date, k) {
      step(date = new d3_date(+date), k);
      return date;
    }
    function range(t0, t1, dt) {
      var time = ceil(t0), times = [];
      if (dt > 1) {
        while (time < t1) {
          if (!(number(time) % dt)) times.push(new Date(+time));
          step(time, 1);
        }
      } else {
        while (time < t1) times.push(new Date(+time)), step(time, 1);
      }
      return times;
    }
    function range_utc(t0, t1, dt) {
      try {
        d3_date = d3_date_utc;
        var utc = new d3_date_utc();
        utc._ = t0;
        return range(utc, t1, dt);
      } finally {
        d3_date = Date;
      }
    }
    local.floor = local;
    local.round = round;
    local.ceil = ceil;
    local.offset = offset;
    local.range = range;
    var utc = local.utc = d3_time_interval_utc(local);
    utc.floor = utc;
    utc.round = d3_time_interval_utc(round);
    utc.ceil = d3_time_interval_utc(ceil);
    utc.offset = d3_time_interval_utc(offset);
    utc.range = range_utc;
    return local;
  }
  function d3_time_interval_utc(method) {
    return function(date, k) {
      try {
        d3_date = d3_date_utc;
        var utc = new d3_date_utc();
        utc._ = date;
        return method(utc, k)._;
      } finally {
        d3_date = Date;
      }
    };
  }
  d3_time.year = d3_time_interval(function(date) {
    date = d3_time.day(date);
    date.setMonth(0, 1);
    return date;
  }, function(date, offset) {
    date.setFullYear(date.getFullYear() + offset);
  }, function(date) {
    return date.getFullYear();
  });
  d3_time.years = d3_time.year.range;
  d3_time.years.utc = d3_time.year.utc.range;
  d3_time.day = d3_time_interval(function(date) {
    var day = new d3_date(2e3, 0);
    day.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    return day;
  }, function(date, offset) {
    date.setDate(date.getDate() + offset);
  }, function(date) {
    return date.getDate() - 1;
  });
  d3_time.days = d3_time.day.range;
  d3_time.days.utc = d3_time.day.utc.range;
  d3_time.dayOfYear = function(date) {
    var year = d3_time.year(date);
    return Math.floor((date - year - (date.getTimezoneOffset() - year.getTimezoneOffset()) * 6e4) / 864e5);
  };
  [ "sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday" ].forEach(function(day, i) {
    i = 7 - i;
    var interval = d3_time[day] = d3_time_interval(function(date) {
      (date = d3_time.day(date)).setDate(date.getDate() - (date.getDay() + i) % 7);
      return date;
    }, function(date, offset) {
      date.setDate(date.getDate() + Math.floor(offset) * 7);
    }, function(date) {
      var day = d3_time.year(date).getDay();
      return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7) - (day !== i);
    });
    d3_time[day + "s"] = interval.range;
    d3_time[day + "s"].utc = interval.utc.range;
    d3_time[day + "OfYear"] = function(date) {
      var day = d3_time.year(date).getDay();
      return Math.floor((d3_time.dayOfYear(date) + (day + i) % 7) / 7);
    };
  });
  d3_time.week = d3_time.sunday;
  d3_time.weeks = d3_time.sunday.range;
  d3_time.weeks.utc = d3_time.sunday.utc.range;
  d3_time.weekOfYear = d3_time.sundayOfYear;
  function d3_locale_timeFormat(locale) {
    var locale_dateTime = locale.dateTime, locale_date = locale.date, locale_time = locale.time, locale_periods = locale.periods, locale_days = locale.days, locale_shortDays = locale.shortDays, locale_months = locale.months, locale_shortMonths = locale.shortMonths;
    function d3_time_format(template) {
      var n = template.length;
      function format(date) {
        var string = [], i = -1, j = 0, c, p, f;
        while (++i < n) {
          if (template.charCodeAt(i) === 37) {
            string.push(template.substring(j, i));
            if ((p = d3_time_formatPads[c = template.charAt(++i)]) != null) c = template.charAt(++i);
            if (f = d3_time_formats[c]) c = f(date, p == null ? c === "e" ? " " : "0" : p);
            string.push(c);
            j = i + 1;
          }
        }
        string.push(template.substring(j, i));
        return string.join("");
      }
      format.parse = function(string) {
        var d = {
          y: 1900,
          m: 0,
          d: 1,
          H: 0,
          M: 0,
          S: 0,
          L: 0,
          Z: null
        }, i = d3_time_parse(d, template, string, 0);
        if (i != string.length) return null;
        if ("p" in d) d.H = d.H % 12 + d.p * 12;
        var localZ = d.Z != null && d3_date !== d3_date_utc, date = new (localZ ? d3_date_utc : d3_date)();
        if ("j" in d) date.setFullYear(d.y, 0, d.j); else if ("w" in d && ("W" in d || "U" in d)) {
          date.setFullYear(d.y, 0, 1);
          date.setFullYear(d.y, 0, "W" in d ? (d.w + 6) % 7 + d.W * 7 - (date.getDay() + 5) % 7 : d.w + d.U * 7 - (date.getDay() + 6) % 7);
        } else date.setFullYear(d.y, d.m, d.d);
        date.setHours(d.H + Math.floor(d.Z / 100), d.M + d.Z % 100, d.S, d.L);
        return localZ ? date._ : date;
      };
      format.toString = function() {
        return template;
      };
      return format;
    }
    function d3_time_parse(date, template, string, j) {
      var c, p, t, i = 0, n = template.length, m = string.length;
      while (i < n) {
        if (j >= m) return -1;
        c = template.charCodeAt(i++);
        if (c === 37) {
          t = template.charAt(i++);
          p = d3_time_parsers[t in d3_time_formatPads ? template.charAt(i++) : t];
          if (!p || (j = p(date, string, j)) < 0) return -1;
        } else if (c != string.charCodeAt(j++)) {
          return -1;
        }
      }
      return j;
    }
    d3_time_format.utc = function(template) {
      var local = d3_time_format(template);
      function format(date) {
        try {
          d3_date = d3_date_utc;
          var utc = new d3_date();
          utc._ = date;
          return local(utc);
        } finally {
          d3_date = Date;
        }
      }
      format.parse = function(string) {
        try {
          d3_date = d3_date_utc;
          var date = local.parse(string);
          return date && date._;
        } finally {
          d3_date = Date;
        }
      };
      format.toString = local.toString;
      return format;
    };
    d3_time_format.multi = d3_time_format.utc.multi = d3_time_formatMulti;
    var d3_time_periodLookup = d3.map(), d3_time_dayRe = d3_time_formatRe(locale_days), d3_time_dayLookup = d3_time_formatLookup(locale_days), d3_time_dayAbbrevRe = d3_time_formatRe(locale_shortDays), d3_time_dayAbbrevLookup = d3_time_formatLookup(locale_shortDays), d3_time_monthRe = d3_time_formatRe(locale_months), d3_time_monthLookup = d3_time_formatLookup(locale_months), d3_time_monthAbbrevRe = d3_time_formatRe(locale_shortMonths), d3_time_monthAbbrevLookup = d3_time_formatLookup(locale_shortMonths);
    locale_periods.forEach(function(p, i) {
      d3_time_periodLookup.set(p.toLowerCase(), i);
    });
    var d3_time_formats = {
      a: function(d) {
        return locale_shortDays[d.getDay()];
      },
      A: function(d) {
        return locale_days[d.getDay()];
      },
      b: function(d) {
        return locale_shortMonths[d.getMonth()];
      },
      B: function(d) {
        return locale_months[d.getMonth()];
      },
      c: d3_time_format(locale_dateTime),
      d: function(d, p) {
        return d3_time_formatPad(d.getDate(), p, 2);
      },
      e: function(d, p) {
        return d3_time_formatPad(d.getDate(), p, 2);
      },
      H: function(d, p) {
        return d3_time_formatPad(d.getHours(), p, 2);
      },
      I: function(d, p) {
        return d3_time_formatPad(d.getHours() % 12 || 12, p, 2);
      },
      j: function(d, p) {
        return d3_time_formatPad(1 + d3_time.dayOfYear(d), p, 3);
      },
      L: function(d, p) {
        return d3_time_formatPad(d.getMilliseconds(), p, 3);
      },
      m: function(d, p) {
        return d3_time_formatPad(d.getMonth() + 1, p, 2);
      },
      M: function(d, p) {
        return d3_time_formatPad(d.getMinutes(), p, 2);
      },
      p: function(d) {
        return locale_periods[+(d.getHours() >= 12)];
      },
      S: function(d, p) {
        return d3_time_formatPad(d.getSeconds(), p, 2);
      },
      U: function(d, p) {
        return d3_time_formatPad(d3_time.sundayOfYear(d), p, 2);
      },
      w: function(d) {
        return d.getDay();
      },
      W: function(d, p) {
        return d3_time_formatPad(d3_time.mondayOfYear(d), p, 2);
      },
      x: d3_time_format(locale_date),
      X: d3_time_format(locale_time),
      y: function(d, p) {
        return d3_time_formatPad(d.getFullYear() % 100, p, 2);
      },
      Y: function(d, p) {
        return d3_time_formatPad(d.getFullYear() % 1e4, p, 4);
      },
      Z: d3_time_zone,
      "%": function() {
        return "%";
      }
    };
    var d3_time_parsers = {
      a: d3_time_parseWeekdayAbbrev,
      A: d3_time_parseWeekday,
      b: d3_time_parseMonthAbbrev,
      B: d3_time_parseMonth,
      c: d3_time_parseLocaleFull,
      d: d3_time_parseDay,
      e: d3_time_parseDay,
      H: d3_time_parseHour24,
      I: d3_time_parseHour24,
      j: d3_time_parseDayOfYear,
      L: d3_time_parseMilliseconds,
      m: d3_time_parseMonthNumber,
      M: d3_time_parseMinutes,
      p: d3_time_parseAmPm,
      S: d3_time_parseSeconds,
      U: d3_time_parseWeekNumberSunday,
      w: d3_time_parseWeekdayNumber,
      W: d3_time_parseWeekNumberMonday,
      x: d3_time_parseLocaleDate,
      X: d3_time_parseLocaleTime,
      y: d3_time_parseYear,
      Y: d3_time_parseFullYear,
      Z: d3_time_parseZone,
      "%": d3_time_parseLiteralPercent
    };
    function d3_time_parseWeekdayAbbrev(date, string, i) {
      d3_time_dayAbbrevRe.lastIndex = 0;
      var n = d3_time_dayAbbrevRe.exec(string.substring(i));
      return n ? (date.w = d3_time_dayAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseWeekday(date, string, i) {
      d3_time_dayRe.lastIndex = 0;
      var n = d3_time_dayRe.exec(string.substring(i));
      return n ? (date.w = d3_time_dayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseMonthAbbrev(date, string, i) {
      d3_time_monthAbbrevRe.lastIndex = 0;
      var n = d3_time_monthAbbrevRe.exec(string.substring(i));
      return n ? (date.m = d3_time_monthAbbrevLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseMonth(date, string, i) {
      d3_time_monthRe.lastIndex = 0;
      var n = d3_time_monthRe.exec(string.substring(i));
      return n ? (date.m = d3_time_monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
    }
    function d3_time_parseLocaleFull(date, string, i) {
      return d3_time_parse(date, d3_time_formats.c.toString(), string, i);
    }
    function d3_time_parseLocaleDate(date, string, i) {
      return d3_time_parse(date, d3_time_formats.x.toString(), string, i);
    }
    function d3_time_parseLocaleTime(date, string, i) {
      return d3_time_parse(date, d3_time_formats.X.toString(), string, i);
    }
    function d3_time_parseAmPm(date, string, i) {
      var n = d3_time_periodLookup.get(string.substring(i, i += 2).toLowerCase());
      return n == null ? -1 : (date.p = n, i);
    }
    return d3_time_format;
  }
  var d3_time_formatPads = {
    "-": "",
    _: " ",
    "0": "0"
  }, d3_time_numberRe = /^\s*\d+/, d3_time_percentRe = /^%/;
  function d3_time_formatPad(value, fill, width) {
    var sign = value < 0 ? "-" : "", string = (sign ? -value : value) + "", length = string.length;
    return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
  }
  function d3_time_formatRe(names) {
    return new RegExp("^(?:" + names.map(d3.requote).join("|") + ")", "i");
  }
  function d3_time_formatLookup(names) {
    var map = new d3_Map(), i = -1, n = names.length;
    while (++i < n) map.set(names[i].toLowerCase(), i);
    return map;
  }
  function d3_time_parseWeekdayNumber(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 1));
    return n ? (date.w = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseWeekNumberSunday(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i));
    return n ? (date.U = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseWeekNumberMonday(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i));
    return n ? (date.W = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseFullYear(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 4));
    return n ? (date.y = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseYear(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.y = d3_time_expandYear(+n[0]), i + n[0].length) : -1;
  }
  function d3_time_parseZone(date, string, i) {
    return /^[+-]\d{4}$/.test(string = string.substring(i, i + 5)) ? (date.Z = -string, 
    i + 5) : -1;
  }
  function d3_time_expandYear(d) {
    return d + (d > 68 ? 1900 : 2e3);
  }
  function d3_time_parseMonthNumber(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.m = n[0] - 1, i + n[0].length) : -1;
  }
  function d3_time_parseDay(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.d = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseDayOfYear(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 3));
    return n ? (date.j = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseHour24(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.H = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseMinutes(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.M = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseSeconds(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 2));
    return n ? (date.S = +n[0], i + n[0].length) : -1;
  }
  function d3_time_parseMilliseconds(date, string, i) {
    d3_time_numberRe.lastIndex = 0;
    var n = d3_time_numberRe.exec(string.substring(i, i + 3));
    return n ? (date.L = +n[0], i + n[0].length) : -1;
  }
  function d3_time_zone(d) {
    var z = d.getTimezoneOffset(), zs = z > 0 ? "-" : "+", zh = ~~(abs(z) / 60), zm = abs(z) % 60;
    return zs + d3_time_formatPad(zh, "0", 2) + d3_time_formatPad(zm, "0", 2);
  }
  function d3_time_parseLiteralPercent(date, string, i) {
    d3_time_percentRe.lastIndex = 0;
    var n = d3_time_percentRe.exec(string.substring(i, i + 1));
    return n ? i + n[0].length : -1;
  }
  function d3_time_formatMulti(formats) {
    var n = formats.length, i = -1;
    while (++i < n) formats[i][0] = this(formats[i][0]);
    return function(date) {
      var i = 0, f = formats[i];
      while (!f[1](date)) f = formats[++i];
      return f[0](date);
    };
  }
  d3.locale = function(locale) {
    return {
      numberFormat: d3_locale_numberFormat(locale),
      timeFormat: d3_locale_timeFormat(locale)
    };
  };
  var d3_locale_enUS = d3.locale({
    decimal: ".",
    thousands: ",",
    grouping: [ 3 ],
    currency: [ "$", "" ],
    dateTime: "%a %b %e %X %Y",
    date: "%m/%d/%Y",
    time: "%H:%M:%S",
    periods: [ "AM", "PM" ],
    days: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
    shortDays: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
    months: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
    shortMonths: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ]
  });
  d3.format = d3_locale_enUS.numberFormat;
  d3.geo = {};
  function d3_adder() {}
  d3_adder.prototype = {
    s: 0,
    t: 0,
    add: function(y) {
      d3_adderSum(y, this.t, d3_adderTemp);
      d3_adderSum(d3_adderTemp.s, this.s, this);
      if (this.s) this.t += d3_adderTemp.t; else this.s = d3_adderTemp.t;
    },
    reset: function() {
      this.s = this.t = 0;
    },
    valueOf: function() {
      return this.s;
    }
  };
  var d3_adderTemp = new d3_adder();
  function d3_adderSum(a, b, o) {
    var x = o.s = a + b, bv = x - a, av = x - bv;
    o.t = a - av + (b - bv);
  }
  d3.geo.stream = function(object, listener) {
    if (object && d3_geo_streamObjectType.hasOwnProperty(object.type)) {
      d3_geo_streamObjectType[object.type](object, listener);
    } else {
      d3_geo_streamGeometry(object, listener);
    }
  };
  function d3_geo_streamGeometry(geometry, listener) {
    if (geometry && d3_geo_streamGeometryType.hasOwnProperty(geometry.type)) {
      d3_geo_streamGeometryType[geometry.type](geometry, listener);
    }
  }
  var d3_geo_streamObjectType = {
    Feature: function(feature, listener) {
      d3_geo_streamGeometry(feature.geometry, listener);
    },
    FeatureCollection: function(object, listener) {
      var features = object.features, i = -1, n = features.length;
      while (++i < n) d3_geo_streamGeometry(features[i].geometry, listener);
    }
  };
  var d3_geo_streamGeometryType = {
    Sphere: function(object, listener) {
      listener.sphere();
    },
    Point: function(object, listener) {
      object = object.coordinates;
      listener.point(object[0], object[1], object[2]);
    },
    MultiPoint: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) object = coordinates[i], listener.point(object[0], object[1], object[2]);
    },
    LineString: function(object, listener) {
      d3_geo_streamLine(object.coordinates, listener, 0);
    },
    MultiLineString: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) d3_geo_streamLine(coordinates[i], listener, 0);
    },
    Polygon: function(object, listener) {
      d3_geo_streamPolygon(object.coordinates, listener);
    },
    MultiPolygon: function(object, listener) {
      var coordinates = object.coordinates, i = -1, n = coordinates.length;
      while (++i < n) d3_geo_streamPolygon(coordinates[i], listener);
    },
    GeometryCollection: function(object, listener) {
      var geometries = object.geometries, i = -1, n = geometries.length;
      while (++i < n) d3_geo_streamGeometry(geometries[i], listener);
    }
  };
  function d3_geo_streamLine(coordinates, listener, closed) {
    var i = -1, n = coordinates.length - closed, coordinate;
    listener.lineStart();
    while (++i < n) coordinate = coordinates[i], listener.point(coordinate[0], coordinate[1], coordinate[2]);
    listener.lineEnd();
  }
  function d3_geo_streamPolygon(coordinates, listener) {
    var i = -1, n = coordinates.length;
    listener.polygonStart();
    while (++i < n) d3_geo_streamLine(coordinates[i], listener, 1);
    listener.polygonEnd();
  }
  d3.geo.area = function(object) {
    d3_geo_areaSum = 0;
    d3.geo.stream(object, d3_geo_area);
    return d3_geo_areaSum;
  };
  var d3_geo_areaSum, d3_geo_areaRingSum = new d3_adder();
  var d3_geo_area = {
    sphere: function() {
      d3_geo_areaSum += 4 * π;
    },
    point: d3_noop,
    lineStart: d3_noop,
    lineEnd: d3_noop,
    polygonStart: function() {
      d3_geo_areaRingSum.reset();
      d3_geo_area.lineStart = d3_geo_areaRingStart;
    },
    polygonEnd: function() {
      var area = 2 * d3_geo_areaRingSum;
      d3_geo_areaSum += area < 0 ? 4 * π + area : area;
      d3_geo_area.lineStart = d3_geo_area.lineEnd = d3_geo_area.point = d3_noop;
    }
  };
  function d3_geo_areaRingStart() {
    var λ00, φ00, λ0, cosφ0, sinφ0;
    d3_geo_area.point = function(λ, φ) {
      d3_geo_area.point = nextPoint;
      λ0 = (λ00 = λ) * d3_radians, cosφ0 = Math.cos(φ = (φ00 = φ) * d3_radians / 2 + π / 4), 
      sinφ0 = Math.sin(φ);
    };
    function nextPoint(λ, φ) {
      λ *= d3_radians;
      φ = φ * d3_radians / 2 + π / 4;
      var dλ = λ - λ0, sdλ = dλ >= 0 ? 1 : -1, adλ = sdλ * dλ, cosφ = Math.cos(φ), sinφ = Math.sin(φ), k = sinφ0 * sinφ, u = cosφ0 * cosφ + k * Math.cos(adλ), v = k * sdλ * Math.sin(adλ);
      d3_geo_areaRingSum.add(Math.atan2(v, u));
      λ0 = λ, cosφ0 = cosφ, sinφ0 = sinφ;
    }
    d3_geo_area.lineEnd = function() {
      nextPoint(λ00, φ00);
    };
  }
  function d3_geo_cartesian(spherical) {
    var λ = spherical[0], φ = spherical[1], cosφ = Math.cos(φ);
    return [ cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ) ];
  }
  function d3_geo_cartesianDot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }
  function d3_geo_cartesianCross(a, b) {
    return [ a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0] ];
  }
  function d3_geo_cartesianAdd(a, b) {
    a[0] += b[0];
    a[1] += b[1];
    a[2] += b[2];
  }
  function d3_geo_cartesianScale(vector, k) {
    return [ vector[0] * k, vector[1] * k, vector[2] * k ];
  }
  function d3_geo_cartesianNormalize(d) {
    var l = Math.sqrt(d[0] * d[0] + d[1] * d[1] + d[2] * d[2]);
    d[0] /= l;
    d[1] /= l;
    d[2] /= l;
  }
  function d3_geo_spherical(cartesian) {
    return [ Math.atan2(cartesian[1], cartesian[0]), d3_asin(cartesian[2]) ];
  }
  function d3_geo_sphericalEqual(a, b) {
    return abs(a[0] - b[0]) < ε && abs(a[1] - b[1]) < ε;
  }
  d3.geo.bounds = function() {
    var λ0, φ0, λ1, φ1, λ_, λ__, φ__, p0, dλSum, ranges, range;
    var bound = {
      point: point,
      lineStart: lineStart,
      lineEnd: lineEnd,
      polygonStart: function() {
        bound.point = ringPoint;
        bound.lineStart = ringStart;
        bound.lineEnd = ringEnd;
        dλSum = 0;
        d3_geo_area.polygonStart();
      },
      polygonEnd: function() {
        d3_geo_area.polygonEnd();
        bound.point = point;
        bound.lineStart = lineStart;
        bound.lineEnd = lineEnd;
        if (d3_geo_areaRingSum < 0) λ0 = -(λ1 = 180), φ0 = -(φ1 = 90); else if (dλSum > ε) φ1 = 90; else if (dλSum < -ε) φ0 = -90;
        range[0] = λ0, range[1] = λ1;
      }
    };
    function point(λ, φ) {
      ranges.push(range = [ λ0 = λ, λ1 = λ ]);
      if (φ < φ0) φ0 = φ;
      if (φ > φ1) φ1 = φ;
    }
    function linePoint(λ, φ) {
      var p = d3_geo_cartesian([ λ * d3_radians, φ * d3_radians ]);
      if (p0) {
        var normal = d3_geo_cartesianCross(p0, p), equatorial = [ normal[1], -normal[0], 0 ], inflection = d3_geo_cartesianCross(equatorial, normal);
        d3_geo_cartesianNormalize(inflection);
        inflection = d3_geo_spherical(inflection);
        var dλ = λ - λ_, s = dλ > 0 ? 1 : -1, λi = inflection[0] * d3_degrees * s, antimeridian = abs(dλ) > 180;
        if (antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
          var φi = inflection[1] * d3_degrees;
          if (φi > φ1) φ1 = φi;
        } else if (λi = (λi + 360) % 360 - 180, antimeridian ^ (s * λ_ < λi && λi < s * λ)) {
          var φi = -inflection[1] * d3_degrees;
          if (φi < φ0) φ0 = φi;
        } else {
          if (φ < φ0) φ0 = φ;
          if (φ > φ1) φ1 = φ;
        }
        if (antimeridian) {
          if (λ < λ_) {
            if (angle(λ0, λ) > angle(λ0, λ1)) λ1 = λ;
          } else {
            if (angle(λ, λ1) > angle(λ0, λ1)) λ0 = λ;
          }
        } else {
          if (λ1 >= λ0) {
            if (λ < λ0) λ0 = λ;
            if (λ > λ1) λ1 = λ;
          } else {
            if (λ > λ_) {
              if (angle(λ0, λ) > angle(λ0, λ1)) λ1 = λ;
            } else {
              if (angle(λ, λ1) > angle(λ0, λ1)) λ0 = λ;
            }
          }
        }
      } else {
        point(λ, φ);
      }
      p0 = p, λ_ = λ;
    }
    function lineStart() {
      bound.point = linePoint;
    }
    function lineEnd() {
      range[0] = λ0, range[1] = λ1;
      bound.point = point;
      p0 = null;
    }
    function ringPoint(λ, φ) {
      if (p0) {
        var dλ = λ - λ_;
        dλSum += abs(dλ) > 180 ? dλ + (dλ > 0 ? 360 : -360) : dλ;
      } else λ__ = λ, φ__ = φ;
      d3_geo_area.point(λ, φ);
      linePoint(λ, φ);
    }
    function ringStart() {
      d3_geo_area.lineStart();
    }
    function ringEnd() {
      ringPoint(λ__, φ__);
      d3_geo_area.lineEnd();
      if (abs(dλSum) > ε) λ0 = -(λ1 = 180);
      range[0] = λ0, range[1] = λ1;
      p0 = null;
    }
    function angle(λ0, λ1) {
      return (λ1 -= λ0) < 0 ? λ1 + 360 : λ1;
    }
    function compareRanges(a, b) {
      return a[0] - b[0];
    }
    function withinRange(x, range) {
      return range[0] <= range[1] ? range[0] <= x && x <= range[1] : x < range[0] || range[1] < x;
    }
    return function(feature) {
      φ1 = λ1 = -(λ0 = φ0 = Infinity);
      ranges = [];
      d3.geo.stream(feature, bound);
      var n = ranges.length;
      if (n) {
        ranges.sort(compareRanges);
        for (var i = 1, a = ranges[0], b, merged = [ a ]; i < n; ++i) {
          b = ranges[i];
          if (withinRange(b[0], a) || withinRange(b[1], a)) {
            if (angle(a[0], b[1]) > angle(a[0], a[1])) a[1] = b[1];
            if (angle(b[0], a[1]) > angle(a[0], a[1])) a[0] = b[0];
          } else {
            merged.push(a = b);
          }
        }
        var best = -Infinity, dλ;
        for (var n = merged.length - 1, i = 0, a = merged[n], b; i <= n; a = b, ++i) {
          b = merged[i];
          if ((dλ = angle(a[1], b[0])) > best) best = dλ, λ0 = b[0], λ1 = a[1];
        }
      }
      ranges = range = null;
      return λ0 === Infinity || φ0 === Infinity ? [ [ NaN, NaN ], [ NaN, NaN ] ] : [ [ λ0, φ0 ], [ λ1, φ1 ] ];
    };
  }();
  d3.geo.centroid = function(object) {
    d3_geo_centroidW0 = d3_geo_centroidW1 = d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
    d3.geo.stream(object, d3_geo_centroid);
    var x = d3_geo_centroidX2, y = d3_geo_centroidY2, z = d3_geo_centroidZ2, m = x * x + y * y + z * z;
    if (m < ε2) {
      x = d3_geo_centroidX1, y = d3_geo_centroidY1, z = d3_geo_centroidZ1;
      if (d3_geo_centroidW1 < ε) x = d3_geo_centroidX0, y = d3_geo_centroidY0, z = d3_geo_centroidZ0;
      m = x * x + y * y + z * z;
      if (m < ε2) return [ NaN, NaN ];
    }
    return [ Math.atan2(y, x) * d3_degrees, d3_asin(z / Math.sqrt(m)) * d3_degrees ];
  };
  var d3_geo_centroidW0, d3_geo_centroidW1, d3_geo_centroidX0, d3_geo_centroidY0, d3_geo_centroidZ0, d3_geo_centroidX1, d3_geo_centroidY1, d3_geo_centroidZ1, d3_geo_centroidX2, d3_geo_centroidY2, d3_geo_centroidZ2;
  var d3_geo_centroid = {
    sphere: d3_noop,
    point: d3_geo_centroidPoint,
    lineStart: d3_geo_centroidLineStart,
    lineEnd: d3_geo_centroidLineEnd,
    polygonStart: function() {
      d3_geo_centroid.lineStart = d3_geo_centroidRingStart;
    },
    polygonEnd: function() {
      d3_geo_centroid.lineStart = d3_geo_centroidLineStart;
    }
  };
  function d3_geo_centroidPoint(λ, φ) {
    λ *= d3_radians;
    var cosφ = Math.cos(φ *= d3_radians);
    d3_geo_centroidPointXYZ(cosφ * Math.cos(λ), cosφ * Math.sin(λ), Math.sin(φ));
  }
  function d3_geo_centroidPointXYZ(x, y, z) {
    ++d3_geo_centroidW0;
    d3_geo_centroidX0 += (x - d3_geo_centroidX0) / d3_geo_centroidW0;
    d3_geo_centroidY0 += (y - d3_geo_centroidY0) / d3_geo_centroidW0;
    d3_geo_centroidZ0 += (z - d3_geo_centroidZ0) / d3_geo_centroidW0;
  }
  function d3_geo_centroidLineStart() {
    var x0, y0, z0;
    d3_geo_centroid.point = function(λ, φ) {
      λ *= d3_radians;
      var cosφ = Math.cos(φ *= d3_radians);
      x0 = cosφ * Math.cos(λ);
      y0 = cosφ * Math.sin(λ);
      z0 = Math.sin(φ);
      d3_geo_centroid.point = nextPoint;
      d3_geo_centroidPointXYZ(x0, y0, z0);
    };
    function nextPoint(λ, φ) {
      λ *= d3_radians;
      var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), w = Math.atan2(Math.sqrt((w = y0 * z - z0 * y) * w + (w = z0 * x - x0 * z) * w + (w = x0 * y - y0 * x) * w), x0 * x + y0 * y + z0 * z);
      d3_geo_centroidW1 += w;
      d3_geo_centroidX1 += w * (x0 + (x0 = x));
      d3_geo_centroidY1 += w * (y0 + (y0 = y));
      d3_geo_centroidZ1 += w * (z0 + (z0 = z));
      d3_geo_centroidPointXYZ(x0, y0, z0);
    }
  }
  function d3_geo_centroidLineEnd() {
    d3_geo_centroid.point = d3_geo_centroidPoint;
  }
  function d3_geo_centroidRingStart() {
    var λ00, φ00, x0, y0, z0;
    d3_geo_centroid.point = function(λ, φ) {
      λ00 = λ, φ00 = φ;
      d3_geo_centroid.point = nextPoint;
      λ *= d3_radians;
      var cosφ = Math.cos(φ *= d3_radians);
      x0 = cosφ * Math.cos(λ);
      y0 = cosφ * Math.sin(λ);
      z0 = Math.sin(φ);
      d3_geo_centroidPointXYZ(x0, y0, z0);
    };
    d3_geo_centroid.lineEnd = function() {
      nextPoint(λ00, φ00);
      d3_geo_centroid.lineEnd = d3_geo_centroidLineEnd;
      d3_geo_centroid.point = d3_geo_centroidPoint;
    };
    function nextPoint(λ, φ) {
      λ *= d3_radians;
      var cosφ = Math.cos(φ *= d3_radians), x = cosφ * Math.cos(λ), y = cosφ * Math.sin(λ), z = Math.sin(φ), cx = y0 * z - z0 * y, cy = z0 * x - x0 * z, cz = x0 * y - y0 * x, m = Math.sqrt(cx * cx + cy * cy + cz * cz), u = x0 * x + y0 * y + z0 * z, v = m && -d3_acos(u) / m, w = Math.atan2(m, u);
      d3_geo_centroidX2 += v * cx;
      d3_geo_centroidY2 += v * cy;
      d3_geo_centroidZ2 += v * cz;
      d3_geo_centroidW1 += w;
      d3_geo_centroidX1 += w * (x0 + (x0 = x));
      d3_geo_centroidY1 += w * (y0 + (y0 = y));
      d3_geo_centroidZ1 += w * (z0 + (z0 = z));
      d3_geo_centroidPointXYZ(x0, y0, z0);
    }
  }
  function d3_true() {
    return true;
  }
  function d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener) {
    var subject = [], clip = [];
    segments.forEach(function(segment) {
      if ((n = segment.length - 1) <= 0) return;
      var n, p0 = segment[0], p1 = segment[n];
      if (d3_geo_sphericalEqual(p0, p1)) {
        listener.lineStart();
        for (var i = 0; i < n; ++i) listener.point((p0 = segment[i])[0], p0[1]);
        listener.lineEnd();
        return;
      }
      var a = new d3_geo_clipPolygonIntersection(p0, segment, null, true), b = new d3_geo_clipPolygonIntersection(p0, null, a, false);
      a.o = b;
      subject.push(a);
      clip.push(b);
      a = new d3_geo_clipPolygonIntersection(p1, segment, null, false);
      b = new d3_geo_clipPolygonIntersection(p1, null, a, true);
      a.o = b;
      subject.push(a);
      clip.push(b);
    });
    clip.sort(compare);
    d3_geo_clipPolygonLinkCircular(subject);
    d3_geo_clipPolygonLinkCircular(clip);
    if (!subject.length) return;
    for (var i = 0, entry = clipStartInside, n = clip.length; i < n; ++i) {
      clip[i].e = entry = !entry;
    }
    var start = subject[0], points, point;
    while (1) {
      var current = start, isSubject = true;
      while (current.v) if ((current = current.n) === start) return;
      points = current.z;
      listener.lineStart();
      do {
        current.v = current.o.v = true;
        if (current.e) {
          if (isSubject) {
            for (var i = 0, n = points.length; i < n; ++i) listener.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.n.x, 1, listener);
          }
          current = current.n;
        } else {
          if (isSubject) {
            points = current.p.z;
            for (var i = points.length - 1; i >= 0; --i) listener.point((point = points[i])[0], point[1]);
          } else {
            interpolate(current.x, current.p.x, -1, listener);
          }
          current = current.p;
        }
        current = current.o;
        points = current.z;
        isSubject = !isSubject;
      } while (!current.v);
      listener.lineEnd();
    }
  }
  function d3_geo_clipPolygonLinkCircular(array) {
    if (!(n = array.length)) return;
    var n, i = 0, a = array[0], b;
    while (++i < n) {
      a.n = b = array[i];
      b.p = a;
      a = b;
    }
    a.n = b = array[0];
    b.p = a;
  }
  function d3_geo_clipPolygonIntersection(point, points, other, entry) {
    this.x = point;
    this.z = points;
    this.o = other;
    this.e = entry;
    this.v = false;
    this.n = this.p = null;
  }
  function d3_geo_clip(pointVisible, clipLine, interpolate, clipStart) {
    return function(rotate, listener) {
      var line = clipLine(listener), rotatedClipStart = rotate.invert(clipStart[0], clipStart[1]);
      var clip = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          clip.point = pointRing;
          clip.lineStart = ringStart;
          clip.lineEnd = ringEnd;
          segments = [];
          polygon = [];
        },
        polygonEnd: function() {
          clip.point = point;
          clip.lineStart = lineStart;
          clip.lineEnd = lineEnd;
          segments = d3.merge(segments);
          var clipStartInside = d3_geo_pointInPolygon(rotatedClipStart, polygon);
          if (segments.length) {
            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
            d3_geo_clipPolygon(segments, d3_geo_clipSort, clipStartInside, interpolate, listener);
          } else if (clipStartInside) {
            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
            listener.lineStart();
            interpolate(null, null, 1, listener);
            listener.lineEnd();
          }
          if (polygonStarted) listener.polygonEnd(), polygonStarted = false;
          segments = polygon = null;
        },
        sphere: function() {
          listener.polygonStart();
          listener.lineStart();
          interpolate(null, null, 1, listener);
          listener.lineEnd();
          listener.polygonEnd();
        }
      };
      function point(λ, φ) {
        var point = rotate(λ, φ);
        if (pointVisible(λ = point[0], φ = point[1])) listener.point(λ, φ);
      }
      function pointLine(λ, φ) {
        var point = rotate(λ, φ);
        line.point(point[0], point[1]);
      }
      function lineStart() {
        clip.point = pointLine;
        line.lineStart();
      }
      function lineEnd() {
        clip.point = point;
        line.lineEnd();
      }
      var segments;
      var buffer = d3_geo_clipBufferListener(), ringListener = clipLine(buffer), polygonStarted = false, polygon, ring;
      function pointRing(λ, φ) {
        ring.push([ λ, φ ]);
        var point = rotate(λ, φ);
        ringListener.point(point[0], point[1]);
      }
      function ringStart() {
        ringListener.lineStart();
        ring = [];
      }
      function ringEnd() {
        pointRing(ring[0][0], ring[0][1]);
        ringListener.lineEnd();
        var clean = ringListener.clean(), ringSegments = buffer.buffer(), segment, n = ringSegments.length;
        ring.pop();
        polygon.push(ring);
        ring = null;
        if (!n) return;
        if (clean & 1) {
          segment = ringSegments[0];
          var n = segment.length - 1, i = -1, point;
          if (n > 0) {
            if (!polygonStarted) listener.polygonStart(), polygonStarted = true;
            listener.lineStart();
            while (++i < n) listener.point((point = segment[i])[0], point[1]);
            listener.lineEnd();
          }
          return;
        }
        if (n > 1 && clean & 2) ringSegments.push(ringSegments.pop().concat(ringSegments.shift()));
        segments.push(ringSegments.filter(d3_geo_clipSegmentLength1));
      }
      return clip;
    };
  }
  function d3_geo_clipSegmentLength1(segment) {
    return segment.length > 1;
  }
  function d3_geo_clipBufferListener() {
    var lines = [], line;
    return {
      lineStart: function() {
        lines.push(line = []);
      },
      point: function(λ, φ) {
        line.push([ λ, φ ]);
      },
      lineEnd: d3_noop,
      buffer: function() {
        var buffer = lines;
        lines = [];
        line = null;
        return buffer;
      },
      rejoin: function() {
        if (lines.length > 1) lines.push(lines.pop().concat(lines.shift()));
      }
    };
  }
  function d3_geo_clipSort(a, b) {
    return ((a = a.x)[0] < 0 ? a[1] - halfπ - ε : halfπ - a[1]) - ((b = b.x)[0] < 0 ? b[1] - halfπ - ε : halfπ - b[1]);
  }
  function d3_geo_pointInPolygon(point, polygon) {
    var meridian = point[0], parallel = point[1], meridianNormal = [ Math.sin(meridian), -Math.cos(meridian), 0 ], polarAngle = 0, winding = 0;
    d3_geo_areaRingSum.reset();
    for (var i = 0, n = polygon.length; i < n; ++i) {
      var ring = polygon[i], m = ring.length;
      if (!m) continue;
      var point0 = ring[0], λ0 = point0[0], φ0 = point0[1] / 2 + π / 4, sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), j = 1;
      while (true) {
        if (j === m) j = 0;
        point = ring[j];
        var λ = point[0], φ = point[1] / 2 + π / 4, sinφ = Math.sin(φ), cosφ = Math.cos(φ), dλ = λ - λ0, sdλ = dλ >= 0 ? 1 : -1, adλ = sdλ * dλ, antimeridian = adλ > π, k = sinφ0 * sinφ;
        d3_geo_areaRingSum.add(Math.atan2(k * sdλ * Math.sin(adλ), cosφ0 * cosφ + k * Math.cos(adλ)));
        polarAngle += antimeridian ? dλ + sdλ * τ : dλ;
        if (antimeridian ^ λ0 >= meridian ^ λ >= meridian) {
          var arc = d3_geo_cartesianCross(d3_geo_cartesian(point0), d3_geo_cartesian(point));
          d3_geo_cartesianNormalize(arc);
          var intersection = d3_geo_cartesianCross(meridianNormal, arc);
          d3_geo_cartesianNormalize(intersection);
          var φarc = (antimeridian ^ dλ >= 0 ? -1 : 1) * d3_asin(intersection[2]);
          if (parallel > φarc || parallel === φarc && (arc[0] || arc[1])) {
            winding += antimeridian ^ dλ >= 0 ? 1 : -1;
          }
        }
        if (!j++) break;
        λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ, point0 = point;
      }
    }
    return (polarAngle < -ε || polarAngle < ε && d3_geo_areaRingSum < 0) ^ winding & 1;
  }
  var d3_geo_clipAntimeridian = d3_geo_clip(d3_true, d3_geo_clipAntimeridianLine, d3_geo_clipAntimeridianInterpolate, [ -π, -π / 2 ]);
  function d3_geo_clipAntimeridianLine(listener) {
    var λ0 = NaN, φ0 = NaN, sλ0 = NaN, clean;
    return {
      lineStart: function() {
        listener.lineStart();
        clean = 1;
      },
      point: function(λ1, φ1) {
        var sλ1 = λ1 > 0 ? π : -π, dλ = abs(λ1 - λ0);
        if (abs(dλ - π) < ε) {
          listener.point(λ0, φ0 = (φ0 + φ1) / 2 > 0 ? halfπ : -halfπ);
          listener.point(sλ0, φ0);
          listener.lineEnd();
          listener.lineStart();
          listener.point(sλ1, φ0);
          listener.point(λ1, φ0);
          clean = 0;
        } else if (sλ0 !== sλ1 && dλ >= π) {
          if (abs(λ0 - sλ0) < ε) λ0 -= sλ0 * ε;
          if (abs(λ1 - sλ1) < ε) λ1 -= sλ1 * ε;
          φ0 = d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1);
          listener.point(sλ0, φ0);
          listener.lineEnd();
          listener.lineStart();
          listener.point(sλ1, φ0);
          clean = 0;
        }
        listener.point(λ0 = λ1, φ0 = φ1);
        sλ0 = sλ1;
      },
      lineEnd: function() {
        listener.lineEnd();
        λ0 = φ0 = NaN;
      },
      clean: function() {
        return 2 - clean;
      }
    };
  }
  function d3_geo_clipAntimeridianIntersect(λ0, φ0, λ1, φ1) {
    var cosφ0, cosφ1, sinλ0_λ1 = Math.sin(λ0 - λ1);
    return abs(sinλ0_λ1) > ε ? Math.atan((Math.sin(φ0) * (cosφ1 = Math.cos(φ1)) * Math.sin(λ1) - Math.sin(φ1) * (cosφ0 = Math.cos(φ0)) * Math.sin(λ0)) / (cosφ0 * cosφ1 * sinλ0_λ1)) : (φ0 + φ1) / 2;
  }
  function d3_geo_clipAntimeridianInterpolate(from, to, direction, listener) {
    var φ;
    if (from == null) {
      φ = direction * halfπ;
      listener.point(-π, φ);
      listener.point(0, φ);
      listener.point(π, φ);
      listener.point(π, 0);
      listener.point(π, -φ);
      listener.point(0, -φ);
      listener.point(-π, -φ);
      listener.point(-π, 0);
      listener.point(-π, φ);
    } else if (abs(from[0] - to[0]) > ε) {
      var s = from[0] < to[0] ? π : -π;
      φ = direction * s / 2;
      listener.point(-s, φ);
      listener.point(0, φ);
      listener.point(s, φ);
    } else {
      listener.point(to[0], to[1]);
    }
  }
  function d3_geo_clipCircle(radius) {
    var cr = Math.cos(radius), smallRadius = cr > 0, notHemisphere = abs(cr) > ε, interpolate = d3_geo_circleInterpolate(radius, 6 * d3_radians);
    return d3_geo_clip(visible, clipLine, interpolate, smallRadius ? [ 0, -radius ] : [ -π, radius - π ]);
    function visible(λ, φ) {
      return Math.cos(λ) * Math.cos(φ) > cr;
    }
    function clipLine(listener) {
      var point0, c0, v0, v00, clean;
      return {
        lineStart: function() {
          v00 = v0 = false;
          clean = 1;
        },
        point: function(λ, φ) {
          var point1 = [ λ, φ ], point2, v = visible(λ, φ), c = smallRadius ? v ? 0 : code(λ, φ) : v ? code(λ + (λ < 0 ? π : -π), φ) : 0;
          if (!point0 && (v00 = v0 = v)) listener.lineStart();
          if (v !== v0) {
            point2 = intersect(point0, point1);
            if (d3_geo_sphericalEqual(point0, point2) || d3_geo_sphericalEqual(point1, point2)) {
              point1[0] += ε;
              point1[1] += ε;
              v = visible(point1[0], point1[1]);
            }
          }
          if (v !== v0) {
            clean = 0;
            if (v) {
              listener.lineStart();
              point2 = intersect(point1, point0);
              listener.point(point2[0], point2[1]);
            } else {
              point2 = intersect(point0, point1);
              listener.point(point2[0], point2[1]);
              listener.lineEnd();
            }
            point0 = point2;
          } else if (notHemisphere && point0 && smallRadius ^ v) {
            var t;
            if (!(c & c0) && (t = intersect(point1, point0, true))) {
              clean = 0;
              if (smallRadius) {
                listener.lineStart();
                listener.point(t[0][0], t[0][1]);
                listener.point(t[1][0], t[1][1]);
                listener.lineEnd();
              } else {
                listener.point(t[1][0], t[1][1]);
                listener.lineEnd();
                listener.lineStart();
                listener.point(t[0][0], t[0][1]);
              }
            }
          }
          if (v && (!point0 || !d3_geo_sphericalEqual(point0, point1))) {
            listener.point(point1[0], point1[1]);
          }
          point0 = point1, v0 = v, c0 = c;
        },
        lineEnd: function() {
          if (v0) listener.lineEnd();
          point0 = null;
        },
        clean: function() {
          return clean | (v00 && v0) << 1;
        }
      };
    }
    function intersect(a, b, two) {
      var pa = d3_geo_cartesian(a), pb = d3_geo_cartesian(b);
      var n1 = [ 1, 0, 0 ], n2 = d3_geo_cartesianCross(pa, pb), n2n2 = d3_geo_cartesianDot(n2, n2), n1n2 = n2[0], determinant = n2n2 - n1n2 * n1n2;
      if (!determinant) return !two && a;
      var c1 = cr * n2n2 / determinant, c2 = -cr * n1n2 / determinant, n1xn2 = d3_geo_cartesianCross(n1, n2), A = d3_geo_cartesianScale(n1, c1), B = d3_geo_cartesianScale(n2, c2);
      d3_geo_cartesianAdd(A, B);
      var u = n1xn2, w = d3_geo_cartesianDot(A, u), uu = d3_geo_cartesianDot(u, u), t2 = w * w - uu * (d3_geo_cartesianDot(A, A) - 1);
      if (t2 < 0) return;
      var t = Math.sqrt(t2), q = d3_geo_cartesianScale(u, (-w - t) / uu);
      d3_geo_cartesianAdd(q, A);
      q = d3_geo_spherical(q);
      if (!two) return q;
      var λ0 = a[0], λ1 = b[0], φ0 = a[1], φ1 = b[1], z;
      if (λ1 < λ0) z = λ0, λ0 = λ1, λ1 = z;
      var δλ = λ1 - λ0, polar = abs(δλ - π) < ε, meridian = polar || δλ < ε;
      if (!polar && φ1 < φ0) z = φ0, φ0 = φ1, φ1 = z;
      if (meridian ? polar ? φ0 + φ1 > 0 ^ q[1] < (abs(q[0] - λ0) < ε ? φ0 : φ1) : φ0 <= q[1] && q[1] <= φ1 : δλ > π ^ (λ0 <= q[0] && q[0] <= λ1)) {
        var q1 = d3_geo_cartesianScale(u, (-w + t) / uu);
        d3_geo_cartesianAdd(q1, A);
        return [ q, d3_geo_spherical(q1) ];
      }
    }
    function code(λ, φ) {
      var r = smallRadius ? radius : π - radius, code = 0;
      if (λ < -r) code |= 1; else if (λ > r) code |= 2;
      if (φ < -r) code |= 4; else if (φ > r) code |= 8;
      return code;
    }
  }
  function d3_geom_clipLine(x0, y0, x1, y1) {
    return function(line) {
      var a = line.a, b = line.b, ax = a.x, ay = a.y, bx = b.x, by = b.y, t0 = 0, t1 = 1, dx = bx - ax, dy = by - ay, r;
      r = x0 - ax;
      if (!dx && r > 0) return;
      r /= dx;
      if (dx < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dx > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }
      r = x1 - ax;
      if (!dx && r < 0) return;
      r /= dx;
      if (dx < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dx > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }
      r = y0 - ay;
      if (!dy && r > 0) return;
      r /= dy;
      if (dy < 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      } else if (dy > 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      }
      r = y1 - ay;
      if (!dy && r < 0) return;
      r /= dy;
      if (dy < 0) {
        if (r > t1) return;
        if (r > t0) t0 = r;
      } else if (dy > 0) {
        if (r < t0) return;
        if (r < t1) t1 = r;
      }
      if (t0 > 0) line.a = {
        x: ax + t0 * dx,
        y: ay + t0 * dy
      };
      if (t1 < 1) line.b = {
        x: ax + t1 * dx,
        y: ay + t1 * dy
      };
      return line;
    };
  }
  var d3_geo_clipExtentMAX = 1e9;
  d3.geo.clipExtent = function() {
    var x0, y0, x1, y1, stream, clip, clipExtent = {
      stream: function(output) {
        if (stream) stream.valid = false;
        stream = clip(output);
        stream.valid = true;
        return stream;
      },
      extent: function(_) {
        if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
        clip = d3_geo_clipExtent(x0 = +_[0][0], y0 = +_[0][1], x1 = +_[1][0], y1 = +_[1][1]);
        if (stream) stream.valid = false, stream = null;
        return clipExtent;
      }
    };
    return clipExtent.extent([ [ 0, 0 ], [ 960, 500 ] ]);
  };
  function d3_geo_clipExtent(x0, y0, x1, y1) {
    return function(listener) {
      var listener_ = listener, bufferListener = d3_geo_clipBufferListener(), clipLine = d3_geom_clipLine(x0, y0, x1, y1), segments, polygon, ring;
      var clip = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          listener = bufferListener;
          segments = [];
          polygon = [];
          clean = true;
        },
        polygonEnd: function() {
          listener = listener_;
          segments = d3.merge(segments);
          var clipStartInside = insidePolygon([ x0, y1 ]), inside = clean && clipStartInside, visible = segments.length;
          if (inside || visible) {
            listener.polygonStart();
            if (inside) {
              listener.lineStart();
              interpolate(null, null, 1, listener);
              listener.lineEnd();
            }
            if (visible) {
              d3_geo_clipPolygon(segments, compare, clipStartInside, interpolate, listener);
            }
            listener.polygonEnd();
          }
          segments = polygon = ring = null;
        }
      };
      function insidePolygon(p) {
        var wn = 0, n = polygon.length, y = p[1];
        for (var i = 0; i < n; ++i) {
          for (var j = 1, v = polygon[i], m = v.length, a = v[0], b; j < m; ++j) {
            b = v[j];
            if (a[1] <= y) {
              if (b[1] > y && d3_cross2d(a, b, p) > 0) ++wn;
            } else {
              if (b[1] <= y && d3_cross2d(a, b, p) < 0) --wn;
            }
            a = b;
          }
        }
        return wn !== 0;
      }
      function interpolate(from, to, direction, listener) {
        var a = 0, a1 = 0;
        if (from == null || (a = corner(from, direction)) !== (a1 = corner(to, direction)) || comparePoints(from, to) < 0 ^ direction > 0) {
          do {
            listener.point(a === 0 || a === 3 ? x0 : x1, a > 1 ? y1 : y0);
          } while ((a = (a + direction + 4) % 4) !== a1);
        } else {
          listener.point(to[0], to[1]);
        }
      }
      function pointVisible(x, y) {
        return x0 <= x && x <= x1 && y0 <= y && y <= y1;
      }
      function point(x, y) {
        if (pointVisible(x, y)) listener.point(x, y);
      }
      var x__, y__, v__, x_, y_, v_, first, clean;
      function lineStart() {
        clip.point = linePoint;
        if (polygon) polygon.push(ring = []);
        first = true;
        v_ = false;
        x_ = y_ = NaN;
      }
      function lineEnd() {
        if (segments) {
          linePoint(x__, y__);
          if (v__ && v_) bufferListener.rejoin();
          segments.push(bufferListener.buffer());
        }
        clip.point = point;
        if (v_) listener.lineEnd();
      }
      function linePoint(x, y) {
        x = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, x));
        y = Math.max(-d3_geo_clipExtentMAX, Math.min(d3_geo_clipExtentMAX, y));
        var v = pointVisible(x, y);
        if (polygon) ring.push([ x, y ]);
        if (first) {
          x__ = x, y__ = y, v__ = v;
          first = false;
          if (v) {
            listener.lineStart();
            listener.point(x, y);
          }
        } else {
          if (v && v_) listener.point(x, y); else {
            var l = {
              a: {
                x: x_,
                y: y_
              },
              b: {
                x: x,
                y: y
              }
            };
            if (clipLine(l)) {
              if (!v_) {
                listener.lineStart();
                listener.point(l.a.x, l.a.y);
              }
              listener.point(l.b.x, l.b.y);
              if (!v) listener.lineEnd();
              clean = false;
            } else if (v) {
              listener.lineStart();
              listener.point(x, y);
              clean = false;
            }
          }
        }
        x_ = x, y_ = y, v_ = v;
      }
      return clip;
    };
    function corner(p, direction) {
      return abs(p[0] - x0) < ε ? direction > 0 ? 0 : 3 : abs(p[0] - x1) < ε ? direction > 0 ? 2 : 1 : abs(p[1] - y0) < ε ? direction > 0 ? 1 : 0 : direction > 0 ? 3 : 2;
    }
    function compare(a, b) {
      return comparePoints(a.x, b.x);
    }
    function comparePoints(a, b) {
      var ca = corner(a, 1), cb = corner(b, 1);
      return ca !== cb ? ca - cb : ca === 0 ? b[1] - a[1] : ca === 1 ? a[0] - b[0] : ca === 2 ? a[1] - b[1] : b[0] - a[0];
    }
  }
  function d3_geo_compose(a, b) {
    function compose(x, y) {
      return x = a(x, y), b(x[0], x[1]);
    }
    if (a.invert && b.invert) compose.invert = function(x, y) {
      return x = b.invert(x, y), x && a.invert(x[0], x[1]);
    };
    return compose;
  }
  function d3_geo_conic(projectAt) {
    var φ0 = 0, φ1 = π / 3, m = d3_geo_projectionMutator(projectAt), p = m(φ0, φ1);
    p.parallels = function(_) {
      if (!arguments.length) return [ φ0 / π * 180, φ1 / π * 180 ];
      return m(φ0 = _[0] * π / 180, φ1 = _[1] * π / 180);
    };
    return p;
  }
  function d3_geo_conicEqualArea(φ0, φ1) {
    var sinφ0 = Math.sin(φ0), n = (sinφ0 + Math.sin(φ1)) / 2, C = 1 + sinφ0 * (2 * n - sinφ0), ρ0 = Math.sqrt(C) / n;
    function forward(λ, φ) {
      var ρ = Math.sqrt(C - 2 * n * Math.sin(φ)) / n;
      return [ ρ * Math.sin(λ *= n), ρ0 - ρ * Math.cos(λ) ];
    }
    forward.invert = function(x, y) {
      var ρ0_y = ρ0 - y;
      return [ Math.atan2(x, ρ0_y) / n, d3_asin((C - (x * x + ρ0_y * ρ0_y) * n * n) / (2 * n)) ];
    };
    return forward;
  }
  (d3.geo.conicEqualArea = function() {
    return d3_geo_conic(d3_geo_conicEqualArea);
  }).raw = d3_geo_conicEqualArea;
  d3.geo.albers = function() {
    return d3.geo.conicEqualArea().rotate([ 96, 0 ]).center([ -.6, 38.7 ]).parallels([ 29.5, 45.5 ]).scale(1070);
  };
  d3.geo.albersUsa = function() {
    var lower48 = d3.geo.albers();
    var alaska = d3.geo.conicEqualArea().rotate([ 154, 0 ]).center([ -2, 58.5 ]).parallels([ 55, 65 ]);
    var hawaii = d3.geo.conicEqualArea().rotate([ 157, 0 ]).center([ -3, 19.9 ]).parallels([ 8, 18 ]);
    var point, pointStream = {
      point: function(x, y) {
        point = [ x, y ];
      }
    }, lower48Point, alaskaPoint, hawaiiPoint;
    function albersUsa(coordinates) {
      var x = coordinates[0], y = coordinates[1];
      point = null;
      (lower48Point(x, y), point) || (alaskaPoint(x, y), point) || hawaiiPoint(x, y);
      return point;
    }
    albersUsa.invert = function(coordinates) {
      var k = lower48.scale(), t = lower48.translate(), x = (coordinates[0] - t[0]) / k, y = (coordinates[1] - t[1]) / k;
      return (y >= .12 && y < .234 && x >= -.425 && x < -.214 ? alaska : y >= .166 && y < .234 && x >= -.214 && x < -.115 ? hawaii : lower48).invert(coordinates);
    };
    albersUsa.stream = function(stream) {
      var lower48Stream = lower48.stream(stream), alaskaStream = alaska.stream(stream), hawaiiStream = hawaii.stream(stream);
      return {
        point: function(x, y) {
          lower48Stream.point(x, y);
          alaskaStream.point(x, y);
          hawaiiStream.point(x, y);
        },
        sphere: function() {
          lower48Stream.sphere();
          alaskaStream.sphere();
          hawaiiStream.sphere();
        },
        lineStart: function() {
          lower48Stream.lineStart();
          alaskaStream.lineStart();
          hawaiiStream.lineStart();
        },
        lineEnd: function() {
          lower48Stream.lineEnd();
          alaskaStream.lineEnd();
          hawaiiStream.lineEnd();
        },
        polygonStart: function() {
          lower48Stream.polygonStart();
          alaskaStream.polygonStart();
          hawaiiStream.polygonStart();
        },
        polygonEnd: function() {
          lower48Stream.polygonEnd();
          alaskaStream.polygonEnd();
          hawaiiStream.polygonEnd();
        }
      };
    };
    albersUsa.precision = function(_) {
      if (!arguments.length) return lower48.precision();
      lower48.precision(_);
      alaska.precision(_);
      hawaii.precision(_);
      return albersUsa;
    };
    albersUsa.scale = function(_) {
      if (!arguments.length) return lower48.scale();
      lower48.scale(_);
      alaska.scale(_ * .35);
      hawaii.scale(_);
      return albersUsa.translate(lower48.translate());
    };
    albersUsa.translate = function(_) {
      if (!arguments.length) return lower48.translate();
      var k = lower48.scale(), x = +_[0], y = +_[1];
      lower48Point = lower48.translate(_).clipExtent([ [ x - .455 * k, y - .238 * k ], [ x + .455 * k, y + .238 * k ] ]).stream(pointStream).point;
      alaskaPoint = alaska.translate([ x - .307 * k, y + .201 * k ]).clipExtent([ [ x - .425 * k + ε, y + .12 * k + ε ], [ x - .214 * k - ε, y + .234 * k - ε ] ]).stream(pointStream).point;
      hawaiiPoint = hawaii.translate([ x - .205 * k, y + .212 * k ]).clipExtent([ [ x - .214 * k + ε, y + .166 * k + ε ], [ x - .115 * k - ε, y + .234 * k - ε ] ]).stream(pointStream).point;
      return albersUsa;
    };
    return albersUsa.scale(1070);
  };
  var d3_geo_pathAreaSum, d3_geo_pathAreaPolygon, d3_geo_pathArea = {
    point: d3_noop,
    lineStart: d3_noop,
    lineEnd: d3_noop,
    polygonStart: function() {
      d3_geo_pathAreaPolygon = 0;
      d3_geo_pathArea.lineStart = d3_geo_pathAreaRingStart;
    },
    polygonEnd: function() {
      d3_geo_pathArea.lineStart = d3_geo_pathArea.lineEnd = d3_geo_pathArea.point = d3_noop;
      d3_geo_pathAreaSum += abs(d3_geo_pathAreaPolygon / 2);
    }
  };
  function d3_geo_pathAreaRingStart() {
    var x00, y00, x0, y0;
    d3_geo_pathArea.point = function(x, y) {
      d3_geo_pathArea.point = nextPoint;
      x00 = x0 = x, y00 = y0 = y;
    };
    function nextPoint(x, y) {
      d3_geo_pathAreaPolygon += y0 * x - x0 * y;
      x0 = x, y0 = y;
    }
    d3_geo_pathArea.lineEnd = function() {
      nextPoint(x00, y00);
    };
  }
  var d3_geo_pathBoundsX0, d3_geo_pathBoundsY0, d3_geo_pathBoundsX1, d3_geo_pathBoundsY1;
  var d3_geo_pathBounds = {
    point: d3_geo_pathBoundsPoint,
    lineStart: d3_noop,
    lineEnd: d3_noop,
    polygonStart: d3_noop,
    polygonEnd: d3_noop
  };
  function d3_geo_pathBoundsPoint(x, y) {
    if (x < d3_geo_pathBoundsX0) d3_geo_pathBoundsX0 = x;
    if (x > d3_geo_pathBoundsX1) d3_geo_pathBoundsX1 = x;
    if (y < d3_geo_pathBoundsY0) d3_geo_pathBoundsY0 = y;
    if (y > d3_geo_pathBoundsY1) d3_geo_pathBoundsY1 = y;
  }
  function d3_geo_pathBuffer() {
    var pointCircle = d3_geo_pathBufferCircle(4.5), buffer = [];
    var stream = {
      point: point,
      lineStart: function() {
        stream.point = pointLineStart;
      },
      lineEnd: lineEnd,
      polygonStart: function() {
        stream.lineEnd = lineEndPolygon;
      },
      polygonEnd: function() {
        stream.lineEnd = lineEnd;
        stream.point = point;
      },
      pointRadius: function(_) {
        pointCircle = d3_geo_pathBufferCircle(_);
        return stream;
      },
      result: function() {
        if (buffer.length) {
          var result = buffer.join("");
          buffer = [];
          return result;
        }
      }
    };
    function point(x, y) {
      buffer.push("M", x, ",", y, pointCircle);
    }
    function pointLineStart(x, y) {
      buffer.push("M", x, ",", y);
      stream.point = pointLine;
    }
    function pointLine(x, y) {
      buffer.push("L", x, ",", y);
    }
    function lineEnd() {
      stream.point = point;
    }
    function lineEndPolygon() {
      buffer.push("Z");
    }
    return stream;
  }
  function d3_geo_pathBufferCircle(radius) {
    return "m0," + radius + "a" + radius + "," + radius + " 0 1,1 0," + -2 * radius + "a" + radius + "," + radius + " 0 1,1 0," + 2 * radius + "z";
  }
  var d3_geo_pathCentroid = {
    point: d3_geo_pathCentroidPoint,
    lineStart: d3_geo_pathCentroidLineStart,
    lineEnd: d3_geo_pathCentroidLineEnd,
    polygonStart: function() {
      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidRingStart;
    },
    polygonEnd: function() {
      d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
      d3_geo_pathCentroid.lineStart = d3_geo_pathCentroidLineStart;
      d3_geo_pathCentroid.lineEnd = d3_geo_pathCentroidLineEnd;
    }
  };
  function d3_geo_pathCentroidPoint(x, y) {
    d3_geo_centroidX0 += x;
    d3_geo_centroidY0 += y;
    ++d3_geo_centroidZ0;
  }
  function d3_geo_pathCentroidLineStart() {
    var x0, y0;
    d3_geo_pathCentroid.point = function(x, y) {
      d3_geo_pathCentroid.point = nextPoint;
      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
    };
    function nextPoint(x, y) {
      var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
      d3_geo_centroidX1 += z * (x0 + x) / 2;
      d3_geo_centroidY1 += z * (y0 + y) / 2;
      d3_geo_centroidZ1 += z;
      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
    }
  }
  function d3_geo_pathCentroidLineEnd() {
    d3_geo_pathCentroid.point = d3_geo_pathCentroidPoint;
  }
  function d3_geo_pathCentroidRingStart() {
    var x00, y00, x0, y0;
    d3_geo_pathCentroid.point = function(x, y) {
      d3_geo_pathCentroid.point = nextPoint;
      d3_geo_pathCentroidPoint(x00 = x0 = x, y00 = y0 = y);
    };
    function nextPoint(x, y) {
      var dx = x - x0, dy = y - y0, z = Math.sqrt(dx * dx + dy * dy);
      d3_geo_centroidX1 += z * (x0 + x) / 2;
      d3_geo_centroidY1 += z * (y0 + y) / 2;
      d3_geo_centroidZ1 += z;
      z = y0 * x - x0 * y;
      d3_geo_centroidX2 += z * (x0 + x);
      d3_geo_centroidY2 += z * (y0 + y);
      d3_geo_centroidZ2 += z * 3;
      d3_geo_pathCentroidPoint(x0 = x, y0 = y);
    }
    d3_geo_pathCentroid.lineEnd = function() {
      nextPoint(x00, y00);
    };
  }
  function d3_geo_pathContext(context) {
    var pointRadius = 4.5;
    var stream = {
      point: point,
      lineStart: function() {
        stream.point = pointLineStart;
      },
      lineEnd: lineEnd,
      polygonStart: function() {
        stream.lineEnd = lineEndPolygon;
      },
      polygonEnd: function() {
        stream.lineEnd = lineEnd;
        stream.point = point;
      },
      pointRadius: function(_) {
        pointRadius = _;
        return stream;
      },
      result: d3_noop
    };
    function point(x, y) {
      context.moveTo(x, y);
      context.arc(x, y, pointRadius, 0, τ);
    }
    function pointLineStart(x, y) {
      context.moveTo(x, y);
      stream.point = pointLine;
    }
    function pointLine(x, y) {
      context.lineTo(x, y);
    }
    function lineEnd() {
      stream.point = point;
    }
    function lineEndPolygon() {
      context.closePath();
    }
    return stream;
  }
  function d3_geo_resample(project) {
    var δ2 = .5, cosMinDistance = Math.cos(30 * d3_radians), maxDepth = 16;
    function resample(stream) {
      return (maxDepth ? resampleRecursive : resampleNone)(stream);
    }
    function resampleNone(stream) {
      return d3_geo_transformPoint(stream, function(x, y) {
        x = project(x, y);
        stream.point(x[0], x[1]);
      });
    }
    function resampleRecursive(stream) {
      var λ00, φ00, x00, y00, a00, b00, c00, λ0, x0, y0, a0, b0, c0;
      var resample = {
        point: point,
        lineStart: lineStart,
        lineEnd: lineEnd,
        polygonStart: function() {
          stream.polygonStart();
          resample.lineStart = ringStart;
        },
        polygonEnd: function() {
          stream.polygonEnd();
          resample.lineStart = lineStart;
        }
      };
      function point(x, y) {
        x = project(x, y);
        stream.point(x[0], x[1]);
      }
      function lineStart() {
        x0 = NaN;
        resample.point = linePoint;
        stream.lineStart();
      }
      function linePoint(λ, φ) {
        var c = d3_geo_cartesian([ λ, φ ]), p = project(λ, φ);
        resampleLineTo(x0, y0, λ0, a0, b0, c0, x0 = p[0], y0 = p[1], λ0 = λ, a0 = c[0], b0 = c[1], c0 = c[2], maxDepth, stream);
        stream.point(x0, y0);
      }
      function lineEnd() {
        resample.point = point;
        stream.lineEnd();
      }
      function ringStart() {
        lineStart();
        resample.point = ringPoint;
        resample.lineEnd = ringEnd;
      }
      function ringPoint(λ, φ) {
        linePoint(λ00 = λ, φ00 = φ), x00 = x0, y00 = y0, a00 = a0, b00 = b0, c00 = c0;
        resample.point = linePoint;
      }
      function ringEnd() {
        resampleLineTo(x0, y0, λ0, a0, b0, c0, x00, y00, λ00, a00, b00, c00, maxDepth, stream);
        resample.lineEnd = lineEnd;
        lineEnd();
      }
      return resample;
    }
    function resampleLineTo(x0, y0, λ0, a0, b0, c0, x1, y1, λ1, a1, b1, c1, depth, stream) {
      var dx = x1 - x0, dy = y1 - y0, d2 = dx * dx + dy * dy;
      if (d2 > 4 * δ2 && depth--) {
        var a = a0 + a1, b = b0 + b1, c = c0 + c1, m = Math.sqrt(a * a + b * b + c * c), φ2 = Math.asin(c /= m), λ2 = abs(abs(c) - 1) < ε || abs(λ0 - λ1) < ε ? (λ0 + λ1) / 2 : Math.atan2(b, a), p = project(λ2, φ2), x2 = p[0], y2 = p[1], dx2 = x2 - x0, dy2 = y2 - y0, dz = dy * dx2 - dx * dy2;
        if (dz * dz / d2 > δ2 || abs((dx * dx2 + dy * dy2) / d2 - .5) > .3 || a0 * a1 + b0 * b1 + c0 * c1 < cosMinDistance) {
          resampleLineTo(x0, y0, λ0, a0, b0, c0, x2, y2, λ2, a /= m, b /= m, c, depth, stream);
          stream.point(x2, y2);
          resampleLineTo(x2, y2, λ2, a, b, c, x1, y1, λ1, a1, b1, c1, depth, stream);
        }
      }
    }
    resample.precision = function(_) {
      if (!arguments.length) return Math.sqrt(δ2);
      maxDepth = (δ2 = _ * _) > 0 && 16;
      return resample;
    };
    return resample;
  }
  d3.geo.path = function() {
    var pointRadius = 4.5, projection, context, projectStream, contextStream, cacheStream;
    function path(object) {
      if (object) {
        if (typeof pointRadius === "function") contextStream.pointRadius(+pointRadius.apply(this, arguments));
        if (!cacheStream || !cacheStream.valid) cacheStream = projectStream(contextStream);
        d3.geo.stream(object, cacheStream);
      }
      return contextStream.result();
    }
    path.area = function(object) {
      d3_geo_pathAreaSum = 0;
      d3.geo.stream(object, projectStream(d3_geo_pathArea));
      return d3_geo_pathAreaSum;
    };
    path.centroid = function(object) {
      d3_geo_centroidX0 = d3_geo_centroidY0 = d3_geo_centroidZ0 = d3_geo_centroidX1 = d3_geo_centroidY1 = d3_geo_centroidZ1 = d3_geo_centroidX2 = d3_geo_centroidY2 = d3_geo_centroidZ2 = 0;
      d3.geo.stream(object, projectStream(d3_geo_pathCentroid));
      return d3_geo_centroidZ2 ? [ d3_geo_centroidX2 / d3_geo_centroidZ2, d3_geo_centroidY2 / d3_geo_centroidZ2 ] : d3_geo_centroidZ1 ? [ d3_geo_centroidX1 / d3_geo_centroidZ1, d3_geo_centroidY1 / d3_geo_centroidZ1 ] : d3_geo_centroidZ0 ? [ d3_geo_centroidX0 / d3_geo_centroidZ0, d3_geo_centroidY0 / d3_geo_centroidZ0 ] : [ NaN, NaN ];
    };
    path.bounds = function(object) {
      d3_geo_pathBoundsX1 = d3_geo_pathBoundsY1 = -(d3_geo_pathBoundsX0 = d3_geo_pathBoundsY0 = Infinity);
      d3.geo.stream(object, projectStream(d3_geo_pathBounds));
      return [ [ d3_geo_pathBoundsX0, d3_geo_pathBoundsY0 ], [ d3_geo_pathBoundsX1, d3_geo_pathBoundsY1 ] ];
    };
    path.projection = function(_) {
      if (!arguments.length) return projection;
      projectStream = (projection = _) ? _.stream || d3_geo_pathProjectStream(_) : d3_identity;
      return reset();
    };
    path.context = function(_) {
      if (!arguments.length) return context;
      contextStream = (context = _) == null ? new d3_geo_pathBuffer() : new d3_geo_pathContext(_);
      if (typeof pointRadius !== "function") contextStream.pointRadius(pointRadius);
      return reset();
    };
    path.pointRadius = function(_) {
      if (!arguments.length) return pointRadius;
      pointRadius = typeof _ === "function" ? _ : (contextStream.pointRadius(+_), +_);
      return path;
    };
    function reset() {
      cacheStream = null;
      return path;
    }
    return path.projection(d3.geo.albersUsa()).context(null);
  };
  function d3_geo_pathProjectStream(project) {
    var resample = d3_geo_resample(function(x, y) {
      return project([ x * d3_degrees, y * d3_degrees ]);
    });
    return function(stream) {
      return d3_geo_projectionRadians(resample(stream));
    };
  }
  d3.geo.transform = function(methods) {
    return {
      stream: function(stream) {
        var transform = new d3_geo_transform(stream);
        for (var k in methods) transform[k] = methods[k];
        return transform;
      }
    };
  };
  function d3_geo_transform(stream) {
    this.stream = stream;
  }
  d3_geo_transform.prototype = {
    point: function(x, y) {
      this.stream.point(x, y);
    },
    sphere: function() {
      this.stream.sphere();
    },
    lineStart: function() {
      this.stream.lineStart();
    },
    lineEnd: function() {
      this.stream.lineEnd();
    },
    polygonStart: function() {
      this.stream.polygonStart();
    },
    polygonEnd: function() {
      this.stream.polygonEnd();
    }
  };
  function d3_geo_transformPoint(stream, point) {
    return {
      point: point,
      sphere: function() {
        stream.sphere();
      },
      lineStart: function() {
        stream.lineStart();
      },
      lineEnd: function() {
        stream.lineEnd();
      },
      polygonStart: function() {
        stream.polygonStart();
      },
      polygonEnd: function() {
        stream.polygonEnd();
      }
    };
  }
  d3.geo.projection = d3_geo_projection;
  d3.geo.projectionMutator = d3_geo_projectionMutator;
  function d3_geo_projection(project) {
    return d3_geo_projectionMutator(function() {
      return project;
    })();
  }
  function d3_geo_projectionMutator(projectAt) {
    var project, rotate, projectRotate, projectResample = d3_geo_resample(function(x, y) {
      x = project(x, y);
      return [ x[0] * k + δx, δy - x[1] * k ];
    }), k = 150, x = 480, y = 250, λ = 0, φ = 0, δλ = 0, δφ = 0, δγ = 0, δx, δy, preclip = d3_geo_clipAntimeridian, postclip = d3_identity, clipAngle = null, clipExtent = null, stream;
    function projection(point) {
      point = projectRotate(point[0] * d3_radians, point[1] * d3_radians);
      return [ point[0] * k + δx, δy - point[1] * k ];
    }
    function invert(point) {
      point = projectRotate.invert((point[0] - δx) / k, (δy - point[1]) / k);
      return point && [ point[0] * d3_degrees, point[1] * d3_degrees ];
    }
    projection.stream = function(output) {
      if (stream) stream.valid = false;
      stream = d3_geo_projectionRadians(preclip(rotate, projectResample(postclip(output))));
      stream.valid = true;
      return stream;
    };
    projection.clipAngle = function(_) {
      if (!arguments.length) return clipAngle;
      preclip = _ == null ? (clipAngle = _, d3_geo_clipAntimeridian) : d3_geo_clipCircle((clipAngle = +_) * d3_radians);
      return invalidate();
    };
    projection.clipExtent = function(_) {
      if (!arguments.length) return clipExtent;
      clipExtent = _;
      postclip = _ ? d3_geo_clipExtent(_[0][0], _[0][1], _[1][0], _[1][1]) : d3_identity;
      return invalidate();
    };
    projection.scale = function(_) {
      if (!arguments.length) return k;
      k = +_;
      return reset();
    };
    projection.translate = function(_) {
      if (!arguments.length) return [ x, y ];
      x = +_[0];
      y = +_[1];
      return reset();
    };
    projection.center = function(_) {
      if (!arguments.length) return [ λ * d3_degrees, φ * d3_degrees ];
      λ = _[0] % 360 * d3_radians;
      φ = _[1] % 360 * d3_radians;
      return reset();
    };
    projection.rotate = function(_) {
      if (!arguments.length) return [ δλ * d3_degrees, δφ * d3_degrees, δγ * d3_degrees ];
      δλ = _[0] % 360 * d3_radians;
      δφ = _[1] % 360 * d3_radians;
      δγ = _.length > 2 ? _[2] % 360 * d3_radians : 0;
      return reset();
    };
    d3.rebind(projection, projectResample, "precision");
    function reset() {
      projectRotate = d3_geo_compose(rotate = d3_geo_rotation(δλ, δφ, δγ), project);
      var center = project(λ, φ);
      δx = x - center[0] * k;
      δy = y + center[1] * k;
      return invalidate();
    }
    function invalidate() {
      if (stream) stream.valid = false, stream = null;
      return projection;
    }
    return function() {
      project = projectAt.apply(this, arguments);
      projection.invert = project.invert && invert;
      return reset();
    };
  }
  function d3_geo_projectionRadians(stream) {
    return d3_geo_transformPoint(stream, function(x, y) {
      stream.point(x * d3_radians, y * d3_radians);
    });
  }
  function d3_geo_equirectangular(λ, φ) {
    return [ λ, φ ];
  }
  (d3.geo.equirectangular = function() {
    return d3_geo_projection(d3_geo_equirectangular);
  }).raw = d3_geo_equirectangular.invert = d3_geo_equirectangular;
  d3.geo.rotation = function(rotate) {
    rotate = d3_geo_rotation(rotate[0] % 360 * d3_radians, rotate[1] * d3_radians, rotate.length > 2 ? rotate[2] * d3_radians : 0);
    function forward(coordinates) {
      coordinates = rotate(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
      return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
    }
    forward.invert = function(coordinates) {
      coordinates = rotate.invert(coordinates[0] * d3_radians, coordinates[1] * d3_radians);
      return coordinates[0] *= d3_degrees, coordinates[1] *= d3_degrees, coordinates;
    };
    return forward;
  };
  function d3_geo_identityRotation(λ, φ) {
    return [ λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ ];
  }
  d3_geo_identityRotation.invert = d3_geo_equirectangular;
  function d3_geo_rotation(δλ, δφ, δγ) {
    return δλ ? δφ || δγ ? d3_geo_compose(d3_geo_rotationλ(δλ), d3_geo_rotationφγ(δφ, δγ)) : d3_geo_rotationλ(δλ) : δφ || δγ ? d3_geo_rotationφγ(δφ, δγ) : d3_geo_identityRotation;
  }
  function d3_geo_forwardRotationλ(δλ) {
    return function(λ, φ) {
      return λ += δλ, [ λ > π ? λ - τ : λ < -π ? λ + τ : λ, φ ];
    };
  }
  function d3_geo_rotationλ(δλ) {
    var rotation = d3_geo_forwardRotationλ(δλ);
    rotation.invert = d3_geo_forwardRotationλ(-δλ);
    return rotation;
  }
  function d3_geo_rotationφγ(δφ, δγ) {
    var cosδφ = Math.cos(δφ), sinδφ = Math.sin(δφ), cosδγ = Math.cos(δγ), sinδγ = Math.sin(δγ);
    function rotation(λ, φ) {
      var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδφ + x * sinδφ;
      return [ Math.atan2(y * cosδγ - k * sinδγ, x * cosδφ - z * sinδφ), d3_asin(k * cosδγ + y * sinδγ) ];
    }
    rotation.invert = function(λ, φ) {
      var cosφ = Math.cos(φ), x = Math.cos(λ) * cosφ, y = Math.sin(λ) * cosφ, z = Math.sin(φ), k = z * cosδγ - y * sinδγ;
      return [ Math.atan2(y * cosδγ + z * sinδγ, x * cosδφ + k * sinδφ), d3_asin(k * cosδφ - x * sinδφ) ];
    };
    return rotation;
  }
  d3.geo.circle = function() {
    var origin = [ 0, 0 ], angle, precision = 6, interpolate;
    function circle() {
      var center = typeof origin === "function" ? origin.apply(this, arguments) : origin, rotate = d3_geo_rotation(-center[0] * d3_radians, -center[1] * d3_radians, 0).invert, ring = [];
      interpolate(null, null, 1, {
        point: function(x, y) {
          ring.push(x = rotate(x, y));
          x[0] *= d3_degrees, x[1] *= d3_degrees;
        }
      });
      return {
        type: "Polygon",
        coordinates: [ ring ]
      };
    }
    circle.origin = function(x) {
      if (!arguments.length) return origin;
      origin = x;
      return circle;
    };
    circle.angle = function(x) {
      if (!arguments.length) return angle;
      interpolate = d3_geo_circleInterpolate((angle = +x) * d3_radians, precision * d3_radians);
      return circle;
    };
    circle.precision = function(_) {
      if (!arguments.length) return precision;
      interpolate = d3_geo_circleInterpolate(angle * d3_radians, (precision = +_) * d3_radians);
      return circle;
    };
    return circle.angle(90);
  };
  function d3_geo_circleInterpolate(radius, precision) {
    var cr = Math.cos(radius), sr = Math.sin(radius);
    return function(from, to, direction, listener) {
      var step = direction * precision;
      if (from != null) {
        from = d3_geo_circleAngle(cr, from);
        to = d3_geo_circleAngle(cr, to);
        if (direction > 0 ? from < to : from > to) from += direction * τ;
      } else {
        from = radius + direction * τ;
        to = radius - .5 * step;
      }
      for (var point, t = from; direction > 0 ? t > to : t < to; t -= step) {
        listener.point((point = d3_geo_spherical([ cr, -sr * Math.cos(t), -sr * Math.sin(t) ]))[0], point[1]);
      }
    };
  }
  function d3_geo_circleAngle(cr, point) {
    var a = d3_geo_cartesian(point);
    a[0] -= cr;
    d3_geo_cartesianNormalize(a);
    var angle = d3_acos(-a[1]);
    return ((-a[2] < 0 ? -angle : angle) + 2 * Math.PI - ε) % (2 * Math.PI);
  }
  d3.geo.distance = function(a, b) {
    var Δλ = (b[0] - a[0]) * d3_radians, φ0 = a[1] * d3_radians, φ1 = b[1] * d3_radians, sinΔλ = Math.sin(Δλ), cosΔλ = Math.cos(Δλ), sinφ0 = Math.sin(φ0), cosφ0 = Math.cos(φ0), sinφ1 = Math.sin(φ1), cosφ1 = Math.cos(φ1), t;
    return Math.atan2(Math.sqrt((t = cosφ1 * sinΔλ) * t + (t = cosφ0 * sinφ1 - sinφ0 * cosφ1 * cosΔλ) * t), sinφ0 * sinφ1 + cosφ0 * cosφ1 * cosΔλ);
  };
  d3.geo.graticule = function() {
    var x1, x0, X1, X0, y1, y0, Y1, Y0, dx = 10, dy = dx, DX = 90, DY = 360, x, y, X, Y, precision = 2.5;
    function graticule() {
      return {
        type: "MultiLineString",
        coordinates: lines()
      };
    }
    function lines() {
      return d3.range(Math.ceil(X0 / DX) * DX, X1, DX).map(X).concat(d3.range(Math.ceil(Y0 / DY) * DY, Y1, DY).map(Y)).concat(d3.range(Math.ceil(x0 / dx) * dx, x1, dx).filter(function(x) {
        return abs(x % DX) > ε;
      }).map(x)).concat(d3.range(Math.ceil(y0 / dy) * dy, y1, dy).filter(function(y) {
        return abs(y % DY) > ε;
      }).map(y));
    }
    graticule.lines = function() {
      return lines().map(function(coordinates) {
        return {
          type: "LineString",
          coordinates: coordinates
        };
      });
    };
    graticule.outline = function() {
      return {
        type: "Polygon",
        coordinates: [ X(X0).concat(Y(Y1).slice(1), X(X1).reverse().slice(1), Y(Y0).reverse().slice(1)) ]
      };
    };
    graticule.extent = function(_) {
      if (!arguments.length) return graticule.minorExtent();
      return graticule.majorExtent(_).minorExtent(_);
    };
    graticule.majorExtent = function(_) {
      if (!arguments.length) return [ [ X0, Y0 ], [ X1, Y1 ] ];
      X0 = +_[0][0], X1 = +_[1][0];
      Y0 = +_[0][1], Y1 = +_[1][1];
      if (X0 > X1) _ = X0, X0 = X1, X1 = _;
      if (Y0 > Y1) _ = Y0, Y0 = Y1, Y1 = _;
      return graticule.precision(precision);
    };
    graticule.minorExtent = function(_) {
      if (!arguments.length) return [ [ x0, y0 ], [ x1, y1 ] ];
      x0 = +_[0][0], x1 = +_[1][0];
      y0 = +_[0][1], y1 = +_[1][1];
      if (x0 > x1) _ = x0, x0 = x1, x1 = _;
      if (y0 > y1) _ = y0, y0 = y1, y1 = _;
      return graticule.precision(precision);
    };
    graticule.step = function(_) {
      if (!arguments.length) return graticule.minorStep();
      return graticule.majorStep(_).minorStep(_);
    };
    graticule.majorStep = function(_) {
      if (!arguments.length) return [ DX, DY ];
      DX = +_[0], DY = +_[1];
      return graticule;
    };
    graticule.minorStep = function(_) {
      if (!arguments.length) return [ dx, dy ];
      dx = +_[0], dy = +_[1];
      return graticule;
    };
    graticule.precision = function(_) {
      if (!arguments.length) return precision;
      precision = +_;
      x = d3_geo_graticuleX(y0, y1, 90);
      y = d3_geo_graticuleY(x0, x1, precision);
      X = d3_geo_graticuleX(Y0, Y1, 90);
      Y = d3_geo_graticuleY(X0, X1, precision);
      return graticule;
    };
    return graticule.majorExtent([ [ -180, -90 + ε ], [ 180, 90 - ε ] ]).minorExtent([ [ -180, -80 - ε ], [ 180, 80 + ε ] ]);
  };
  function d3_geo_graticuleX(y0, y1, dy) {
    var y = d3.range(y0, y1 - ε, dy).concat(y1);
    return function(x) {
      return y.map(function(y) {
        return [ x, y ];
      });
    };
  }
  function d3_geo_graticuleY(x0, x1, dx) {
    var x = d3.range(x0, x1 - ε, dx).concat(x1);
    return function(y) {
      return x.map(function(x) {
        return [ x, y ];
      });
    };
  }
  function d3_source(d) {
    return d.source;
  }
  function d3_target(d) {
    return d.target;
  }
  d3.geo.greatArc = function() {
    var source = d3_source, source_, target = d3_target, target_;
    function greatArc() {
      return {
        type: "LineString",
        coordinates: [ source_ || source.apply(this, arguments), target_ || target.apply(this, arguments) ]
      };
    }
    greatArc.distance = function() {
      return d3.geo.distance(source_ || source.apply(this, arguments), target_ || target.apply(this, arguments));
    };
    greatArc.source = function(_) {
      if (!arguments.length) return source;
      source = _, source_ = typeof _ === "function" ? null : _;
      return greatArc;
    };
    greatArc.target = function(_) {
      if (!arguments.length) return target;
      target = _, target_ = typeof _ === "function" ? null : _;
      return greatArc;
    };
    greatArc.precision = function() {
      return arguments.length ? greatArc : 0;
    };
    return greatArc;
  };
  d3.geo.interpolate = function(source, target) {
    return d3_geo_interpolate(source[0] * d3_radians, source[1] * d3_radians, target[0] * d3_radians, target[1] * d3_radians);
  };
  function d3_geo_interpolate(x0, y0, x1, y1) {
    var cy0 = Math.cos(y0), sy0 = Math.sin(y0), cy1 = Math.cos(y1), sy1 = Math.sin(y1), kx0 = cy0 * Math.cos(x0), ky0 = cy0 * Math.sin(x0), kx1 = cy1 * Math.cos(x1), ky1 = cy1 * Math.sin(x1), d = 2 * Math.asin(Math.sqrt(d3_haversin(y1 - y0) + cy0 * cy1 * d3_haversin(x1 - x0))), k = 1 / Math.sin(d);
    var interpolate = d ? function(t) {
      var B = Math.sin(t *= d) * k, A = Math.sin(d - t) * k, x = A * kx0 + B * kx1, y = A * ky0 + B * ky1, z = A * sy0 + B * sy1;
      return [ Math.atan2(y, x) * d3_degrees, Math.atan2(z, Math.sqrt(x * x + y * y)) * d3_degrees ];
    } : function() {
      return [ x0 * d3_degrees, y0 * d3_degrees ];
    };
    interpolate.distance = d;
    return interpolate;
  }
  d3.geo.length = function(object) {
    d3_geo_lengthSum = 0;
    d3.geo.stream(object, d3_geo_length);
    return d3_geo_lengthSum;
  };
  var d3_geo_lengthSum;
  var d3_geo_length = {
    sphere: d3_noop,
    point: d3_noop,
    lineStart: d3_geo_lengthLineStart,
    lineEnd: d3_noop,
    polygonStart: d3_noop,
    polygonEnd: d3_noop
  };
  function d3_geo_lengthLineStart() {
    var λ0, sinφ0, cosφ0;
    d3_geo_length.point = function(λ, φ) {
      λ0 = λ * d3_radians, sinφ0 = Math.sin(φ *= d3_radians), cosφ0 = Math.cos(φ);
      d3_geo_length.point = nextPoint;
    };
    d3_geo_length.lineEnd = function() {
      d3_geo_length.point = d3_geo_length.lineEnd = d3_noop;
    };
    function nextPoint(λ, φ) {
      var sinφ = Math.sin(φ *= d3_radians), cosφ = Math.cos(φ), t = abs((λ *= d3_radians) - λ0), cosΔλ = Math.cos(t);
      d3_geo_lengthSum += Math.atan2(Math.sqrt((t = cosφ * Math.sin(t)) * t + (t = cosφ0 * sinφ - sinφ0 * cosφ * cosΔλ) * t), sinφ0 * sinφ + cosφ0 * cosφ * cosΔλ);
      λ0 = λ, sinφ0 = sinφ, cosφ0 = cosφ;
    }
  }
  function d3_geo_azimuthal(scale, angle) {
    function azimuthal(λ, φ) {
      var cosλ = Math.cos(λ), cosφ = Math.cos(φ), k = scale(cosλ * cosφ);
      return [ k * cosφ * Math.sin(λ), k * Math.sin(φ) ];
    }
    azimuthal.invert = function(x, y) {
      var ρ = Math.sqrt(x * x + y * y), c = angle(ρ), sinc = Math.sin(c), cosc = Math.cos(c);
      return [ Math.atan2(x * sinc, ρ * cosc), Math.asin(ρ && y * sinc / ρ) ];
    };
    return azimuthal;
  }
  var d3_geo_azimuthalEqualArea = d3_geo_azimuthal(function(cosλcosφ) {
    return Math.sqrt(2 / (1 + cosλcosφ));
  }, function(ρ) {
    return 2 * Math.asin(ρ / 2);
  });
  (d3.geo.azimuthalEqualArea = function() {
    return d3_geo_projection(d3_geo_azimuthalEqualArea);
  }).raw = d3_geo_azimuthalEqualArea;
  var d3_geo_azimuthalEquidistant = d3_geo_azimuthal(function(cosλcosφ) {
    var c = Math.acos(cosλcosφ);
    return c && c / Math.sin(c);
  }, d3_identity);
  (d3.geo.azimuthalEquidistant = function() {
    return d3_geo_projection(d3_geo_azimuthalEquidistant);
  }).raw = d3_geo_azimuthalEquidistant;
  function d3_geo_conicConformal(φ0, φ1) {
    var cosφ0 = Math.cos(φ0), t = function(φ) {
      return Math.tan(π / 4 + φ / 2);
    }, n = φ0 === φ1 ? Math.sin(φ0) : Math.log(cosφ0 / Math.cos(φ1)) / Math.log(t(φ1) / t(φ0)), F = cosφ0 * Math.pow(t(φ0), n) / n;
    if (!n) return d3_geo_mercator;
    function forward(λ, φ) {
      if (F > 0) {
        if (φ < -halfπ + ε) φ = -halfπ + ε;
      } else {
        if (φ > halfπ - ε) φ = halfπ - ε;
      }
      var ρ = F / Math.pow(t(φ), n);
      return [ ρ * Math.sin(n * λ), F - ρ * Math.cos(n * λ) ];
    }
    forward.invert = function(x, y) {
      var ρ0_y = F - y, ρ = d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y);
      return [ Math.atan2(x, ρ0_y) / n, 2 * Math.atan(Math.pow(F / ρ, 1 / n)) - halfπ ];
    };
    return forward;
  }
  (d3.geo.conicConformal = function() {
    return d3_geo_conic(d3_geo_conicConformal);
  }).raw = d3_geo_conicConformal;
  function d3_geo_conicEquidistant(φ0, φ1) {
    var cosφ0 = Math.cos(φ0), n = φ0 === φ1 ? Math.sin(φ0) : (cosφ0 - Math.cos(φ1)) / (φ1 - φ0), G = cosφ0 / n + φ0;
    if (abs(n) < ε) return d3_geo_equirectangular;
    function forward(λ, φ) {
      var ρ = G - φ;
      return [ ρ * Math.sin(n * λ), G - ρ * Math.cos(n * λ) ];
    }
    forward.invert = function(x, y) {
      var ρ0_y = G - y;
      return [ Math.atan2(x, ρ0_y) / n, G - d3_sgn(n) * Math.sqrt(x * x + ρ0_y * ρ0_y) ];
    };
    return forward;
  }
  (d3.geo.conicEquidistant = function() {
    return d3_geo_conic(d3_geo_conicEquidistant);
  }).raw = d3_geo_conicEquidistant;
  var d3_geo_gnomonic = d3_geo_azimuthal(function(cosλcosφ) {
    return 1 / cosλcosφ;
  }, Math.atan);
  (d3.geo.gnomonic = function() {
    return d3_geo_projection(d3_geo_gnomonic);
  }).raw = d3_geo_gnomonic;
  function d3_geo_mercator(λ, φ) {
    return [ λ, Math.log(Math.tan(π / 4 + φ / 2)) ];
  }
  d3_geo_mercator.invert = function(x, y) {
    return [ x, 2 * Math.atan(Math.exp(y)) - halfπ ];
  };
  function d3_geo_mercatorProjection(project) {
    var m = d3_geo_projection(project), scale = m.scale, translate = m.translate, clipExtent = m.clipExtent, clipAuto;
    m.scale = function() {
      var v = scale.apply(m, arguments);
      return v === m ? clipAuto ? m.clipExtent(null) : m : v;
    };
    m.translate = function() {
      var v = translate.apply(m, arguments);
      return v === m ? clipAuto ? m.clipExtent(null) : m : v;
    };
    m.clipExtent = function(_) {
      var v = clipExtent.apply(m, arguments);
      if (v === m) {
        if (clipAuto = _ == null) {
          var k = π * scale(), t = translate();
          clipExtent([ [ t[0] - k, t[1] - k ], [ t[0] + k, t[1] + k ] ]);
        }
      } else if (clipAuto) {
        v = null;
      }
      return v;
    };
    return m.clipExtent(null);
  }
  (d3.geo.mercator = function() {
    return d3_geo_mercatorProjection(d3_geo_mercator);
  }).raw = d3_geo_mercator;
  var d3_geo_orthographic = d3_geo_azimuthal(function() {
    return 1;
  }, Math.asin);
  (d3.geo.orthographic = function() {
    return d3_geo_projection(d3_geo_orthographic);
  }).raw = d3_geo_orthographic;
  var d3_geo_stereographic = d3_geo_azimuthal(function(cosλcosφ) {
    return 1 / (1 + cosλcosφ);
  }, function(ρ) {
    return 2 * Math.atan(ρ);
  });
  (d3.geo.stereographic = function() {
    return d3_geo_projection(d3_geo_stereographic);
  }).raw = d3_geo_stereographic;
  function d3_geo_transverseMercator(λ, φ) {
    return [ Math.log(Math.tan(π / 4 + φ / 2)), -λ ];
  }
  d3_geo_transverseMercator.invert = function(x, y) {
    return [ -y, 2 * Math.atan(Math.exp(x)) - halfπ ];
  };
  (d3.geo.transverseMercator = function() {
    var projection = d3_geo_mercatorProjection(d3_geo_transverseMercator), center = projection.center, rotate = projection.rotate;
    projection.center = function(_) {
      return _ ? center([ -_[1], _[0] ]) : (_ = center(), [ _[1], -_[0] ]);
    };
    projection.rotate = function(_) {
      return _ ? rotate([ _[0], _[1], _.length > 2 ? _[2] + 90 : 90 ]) : (_ = rotate(), 
      [ _[0], _[1], _[2] - 90 ]);
    };
    return rotate([ 0, 0, 90 ]);
  }).raw = d3_geo_transverseMercator;
  d3.geom = {};
  function d3_geom_pointX(d) {
    return d[0];
  }
  function d3_geom_pointY(d) {
    return d[1];
  }
  d3.geom.hull = function(vertices) {
    var x = d3_geom_pointX, y = d3_geom_pointY;
    if (arguments.length) return hull(vertices);
    function hull(data) {
      if (data.length < 3) return [];
      var fx = d3_functor(x), fy = d3_functor(y), i, n = data.length, points = [], flippedPoints = [];
      for (i = 0; i < n; i++) {
        points.push([ +fx.call(this, data[i], i), +fy.call(this, data[i], i), i ]);
      }
      points.sort(d3_geom_hullOrder);
      for (i = 0; i < n; i++) flippedPoints.push([ points[i][0], -points[i][1] ]);
      var upper = d3_geom_hullUpper(points), lower = d3_geom_hullUpper(flippedPoints);
      var skipLeft = lower[0] === upper[0], skipRight = lower[lower.length - 1] === upper[upper.length - 1], polygon = [];
      for (i = upper.length - 1; i >= 0; --i) polygon.push(data[points[upper[i]][2]]);
      for (i = +skipLeft; i < lower.length - skipRight; ++i) polygon.push(data[points[lower[i]][2]]);
      return polygon;
    }
    hull.x = function(_) {
      return arguments.length ? (x = _, hull) : x;
    };
    hull.y = function(_) {
      return arguments.length ? (y = _, hull) : y;
    };
    return hull;
  };
  function d3_geom_hullUpper(points) {
    var n = points.length, hull = [ 0, 1 ], hs = 2;
    for (var i = 2; i < n; i++) {
      while (hs > 1 && d3_cross2d(points[hull[hs - 2]], points[hull[hs - 1]], points[i]) <= 0) --hs;
      hull[hs++] = i;
    }
    return hull.slice(0, hs);
  }
  function d3_geom_hullOrder(a, b) {
    return a[0] - b[0] || a[1] - b[1];
  }
  d3.geom.polygon = function(coordinates) {
    d3_subclass(coordinates, d3_geom_polygonPrototype);
    return coordinates;
  };
  var d3_geom_polygonPrototype = d3.geom.polygon.prototype = [];
  d3_geom_polygonPrototype.area = function() {
    var i = -1, n = this.length, a, b = this[n - 1], area = 0;
    while (++i < n) {
      a = b;
      b = this[i];
      area += a[1] * b[0] - a[0] * b[1];
    }
    return area * .5;
  };
  d3_geom_polygonPrototype.centroid = function(k) {
    var i = -1, n = this.length, x = 0, y = 0, a, b = this[n - 1], c;
    if (!arguments.length) k = -1 / (6 * this.area());
    while (++i < n) {
      a = b;
      b = this[i];
      c = a[0] * b[1] - b[0] * a[1];
      x += (a[0] + b[0]) * c;
      y += (a[1] + b[1]) * c;
    }
    return [ x * k, y * k ];
  };
  d3_geom_polygonPrototype.clip = function(subject) {
    var input, closed = d3_geom_polygonClosed(subject), i = -1, n = this.length - d3_geom_polygonClosed(this), j, m, a = this[n - 1], b, c, d;
    while (++i < n) {
      input = subject.slice();
      subject.length = 0;
      b = this[i];
      c = input[(m = input.length - closed) - 1];
      j = -1;
      while (++j < m) {
        d = input[j];
        if (d3_geom_polygonInside(d, a, b)) {
          if (!d3_geom_polygonInside(c, a, b)) {
            subject.push(d3_geom_polygonIntersect(c, d, a, b));
          }
          subject.push(d);
        } else if (d3_geom_polygonInside(c, a, b)) {
          subject.push(d3_geom_polygonIntersect(c, d, a, b));
        }
        c = d;
      }
      if (closed) subject.push(subject[0]);
      a = b;
    }
    return subject;
  };
  function d3_geom_polygonInside(p, a, b) {
    return (b[0] - a[0]) * (p[1] - a[1]) < (b[1] - a[1]) * (p[0] - a[0]);
  }
  function d3_geom_polygonIntersect(c, d, a, b) {
    var x1 = c[0], x3 = a[0], x21 = d[0] - x1, x43 = b[0] - x3, y1 = c[1], y3 = a[1], y21 = d[1] - y1, y43 = b[1] - y3, ua = (x43 * (y1 - y3) - y43 * (x1 - x3)) / (y43 * x21 - x43 * y21);
    return [ x1 + ua * x21, y1 + ua * y21 ];
  }
  function d3_geom_polygonClosed(coordinates) {
    var a = coordinates[0], b = coordinates[coordinates.length - 1];
    return !(a[0] - b[0] || a[1] - b[1]);
  }
  var d3_geom_voronoiEdges, d3_geom_voronoiCells, d3_geom_voronoiBeaches, d3_geom_voronoiBeachPool = [], d3_geom_voronoiFirstCircle, d3_geom_voronoiCircles, d3_geom_voronoiCirclePool = [];
  function d3_geom_voronoiBeach() {
    d3_geom_voronoiRedBlackNode(this);
    this.edge = this.site = this.circle = null;
  }
  function d3_geom_voronoiCreateBeach(site) {
    var beach = d3_geom_voronoiBeachPool.pop() || new d3_geom_voronoiBeach();
    beach.site = site;
    return beach;
  }
  function d3_geom_voronoiDetachBeach(beach) {
    d3_geom_voronoiDetachCircle(beach);
    d3_geom_voronoiBeaches.remove(beach);
    d3_geom_voronoiBeachPool.push(beach);
    d3_geom_voronoiRedBlackNode(beach);
  }
  function d3_geom_voronoiRemoveBeach(beach) {
    var circle = beach.circle, x = circle.x, y = circle.cy, vertex = {
      x: x,
      y: y
    }, previous = beach.P, next = beach.N, disappearing = [ beach ];
    d3_geom_voronoiDetachBeach(beach);
    var lArc = previous;
    while (lArc.circle && abs(x - lArc.circle.x) < ε && abs(y - lArc.circle.cy) < ε) {
      previous = lArc.P;
      disappearing.unshift(lArc);
      d3_geom_voronoiDetachBeach(lArc);
      lArc = previous;
    }
    disappearing.unshift(lArc);
    d3_geom_voronoiDetachCircle(lArc);
    var rArc = next;
    while (rArc.circle && abs(x - rArc.circle.x) < ε && abs(y - rArc.circle.cy) < ε) {
      next = rArc.N;
      disappearing.push(rArc);
      d3_geom_voronoiDetachBeach(rArc);
      rArc = next;
    }
    disappearing.push(rArc);
    d3_geom_voronoiDetachCircle(rArc);
    var nArcs = disappearing.length, iArc;
    for (iArc = 1; iArc < nArcs; ++iArc) {
      rArc = disappearing[iArc];
      lArc = disappearing[iArc - 1];
      d3_geom_voronoiSetEdgeEnd(rArc.edge, lArc.site, rArc.site, vertex);
    }
    lArc = disappearing[0];
    rArc = disappearing[nArcs - 1];
    rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, rArc.site, null, vertex);
    d3_geom_voronoiAttachCircle(lArc);
    d3_geom_voronoiAttachCircle(rArc);
  }
  function d3_geom_voronoiAddBeach(site) {
    var x = site.x, directrix = site.y, lArc, rArc, dxl, dxr, node = d3_geom_voronoiBeaches._;
    while (node) {
      dxl = d3_geom_voronoiLeftBreakPoint(node, directrix) - x;
      if (dxl > ε) node = node.L; else {
        dxr = x - d3_geom_voronoiRightBreakPoint(node, directrix);
        if (dxr > ε) {
          if (!node.R) {
            lArc = node;
            break;
          }
          node = node.R;
        } else {
          if (dxl > -ε) {
            lArc = node.P;
            rArc = node;
          } else if (dxr > -ε) {
            lArc = node;
            rArc = node.N;
          } else {
            lArc = rArc = node;
          }
          break;
        }
      }
    }
    var newArc = d3_geom_voronoiCreateBeach(site);
    d3_geom_voronoiBeaches.insert(lArc, newArc);
    if (!lArc && !rArc) return;
    if (lArc === rArc) {
      d3_geom_voronoiDetachCircle(lArc);
      rArc = d3_geom_voronoiCreateBeach(lArc.site);
      d3_geom_voronoiBeaches.insert(newArc, rArc);
      newArc.edge = rArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
      d3_geom_voronoiAttachCircle(lArc);
      d3_geom_voronoiAttachCircle(rArc);
      return;
    }
    if (!rArc) {
      newArc.edge = d3_geom_voronoiCreateEdge(lArc.site, newArc.site);
      return;
    }
    d3_geom_voronoiDetachCircle(lArc);
    d3_geom_voronoiDetachCircle(rArc);
    var lSite = lArc.site, ax = lSite.x, ay = lSite.y, bx = site.x - ax, by = site.y - ay, rSite = rArc.site, cx = rSite.x - ax, cy = rSite.y - ay, d = 2 * (bx * cy - by * cx), hb = bx * bx + by * by, hc = cx * cx + cy * cy, vertex = {
      x: (cy * hb - by * hc) / d + ax,
      y: (bx * hc - cx * hb) / d + ay
    };
    d3_geom_voronoiSetEdgeEnd(rArc.edge, lSite, rSite, vertex);
    newArc.edge = d3_geom_voronoiCreateEdge(lSite, site, null, vertex);
    rArc.edge = d3_geom_voronoiCreateEdge(site, rSite, null, vertex);
    d3_geom_voronoiAttachCircle(lArc);
    d3_geom_voronoiAttachCircle(rArc);
  }
  function d3_geom_voronoiLeftBreakPoint(arc, directrix) {
    var site = arc.site, rfocx = site.x, rfocy = site.y, pby2 = rfocy - directrix;
    if (!pby2) return rfocx;
    var lArc = arc.P;
    if (!lArc) return -Infinity;
    site = lArc.site;
    var lfocx = site.x, lfocy = site.y, plby2 = lfocy - directrix;
    if (!plby2) return lfocx;
    var hl = lfocx - rfocx, aby2 = 1 / pby2 - 1 / plby2, b = hl / plby2;
    if (aby2) return (-b + Math.sqrt(b * b - 2 * aby2 * (hl * hl / (-2 * plby2) - lfocy + plby2 / 2 + rfocy - pby2 / 2))) / aby2 + rfocx;
    return (rfocx + lfocx) / 2;
  }
  function d3_geom_voronoiRightBreakPoint(arc, directrix) {
    var rArc = arc.N;
    if (rArc) return d3_geom_voronoiLeftBreakPoint(rArc, directrix);
    var site = arc.site;
    return site.y === directrix ? site.x : Infinity;
  }
  function d3_geom_voronoiCell(site) {
    this.site = site;
    this.edges = [];
  }
  d3_geom_voronoiCell.prototype.prepare = function() {
    var halfEdges = this.edges, iHalfEdge = halfEdges.length, edge;
    while (iHalfEdge--) {
      edge = halfEdges[iHalfEdge].edge;
      if (!edge.b || !edge.a) halfEdges.splice(iHalfEdge, 1);
    }
    halfEdges.sort(d3_geom_voronoiHalfEdgeOrder);
    return halfEdges.length;
  };
  function d3_geom_voronoiCloseCells(extent) {
    var x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], x2, y2, x3, y3, cells = d3_geom_voronoiCells, iCell = cells.length, cell, iHalfEdge, halfEdges, nHalfEdges, start, end;
    while (iCell--) {
      cell = cells[iCell];
      if (!cell || !cell.prepare()) continue;
      halfEdges = cell.edges;
      nHalfEdges = halfEdges.length;
      iHalfEdge = 0;
      while (iHalfEdge < nHalfEdges) {
        end = halfEdges[iHalfEdge].end(), x3 = end.x, y3 = end.y;
        start = halfEdges[++iHalfEdge % nHalfEdges].start(), x2 = start.x, y2 = start.y;
        if (abs(x3 - x2) > ε || abs(y3 - y2) > ε) {
          halfEdges.splice(iHalfEdge, 0, new d3_geom_voronoiHalfEdge(d3_geom_voronoiCreateBorderEdge(cell.site, end, abs(x3 - x0) < ε && y1 - y3 > ε ? {
            x: x0,
            y: abs(x2 - x0) < ε ? y2 : y1
          } : abs(y3 - y1) < ε && x1 - x3 > ε ? {
            x: abs(y2 - y1) < ε ? x2 : x1,
            y: y1
          } : abs(x3 - x1) < ε && y3 - y0 > ε ? {
            x: x1,
            y: abs(x2 - x1) < ε ? y2 : y0
          } : abs(y3 - y0) < ε && x3 - x0 > ε ? {
            x: abs(y2 - y0) < ε ? x2 : x0,
            y: y0
          } : null), cell.site, null));
          ++nHalfEdges;
        }
      }
    }
  }
  function d3_geom_voronoiHalfEdgeOrder(a, b) {
    return b.angle - a.angle;
  }
  function d3_geom_voronoiCircle() {
    d3_geom_voronoiRedBlackNode(this);
    this.x = this.y = this.arc = this.site = this.cy = null;
  }
  function d3_geom_voronoiAttachCircle(arc) {
    var lArc = arc.P, rArc = arc.N;
    if (!lArc || !rArc) return;
    var lSite = lArc.site, cSite = arc.site, rSite = rArc.site;
    if (lSite === rSite) return;
    var bx = cSite.x, by = cSite.y, ax = lSite.x - bx, ay = lSite.y - by, cx = rSite.x - bx, cy = rSite.y - by;
    var d = 2 * (ax * cy - ay * cx);
    if (d >= -ε2) return;
    var ha = ax * ax + ay * ay, hc = cx * cx + cy * cy, x = (cy * ha - ay * hc) / d, y = (ax * hc - cx * ha) / d, cy = y + by;
    var circle = d3_geom_voronoiCirclePool.pop() || new d3_geom_voronoiCircle();
    circle.arc = arc;
    circle.site = cSite;
    circle.x = x + bx;
    circle.y = cy + Math.sqrt(x * x + y * y);
    circle.cy = cy;
    arc.circle = circle;
    var before = null, node = d3_geom_voronoiCircles._;
    while (node) {
      if (circle.y < node.y || circle.y === node.y && circle.x <= node.x) {
        if (node.L) node = node.L; else {
          before = node.P;
          break;
        }
      } else {
        if (node.R) node = node.R; else {
          before = node;
          break;
        }
      }
    }
    d3_geom_voronoiCircles.insert(before, circle);
    if (!before) d3_geom_voronoiFirstCircle = circle;
  }
  function d3_geom_voronoiDetachCircle(arc) {
    var circle = arc.circle;
    if (circle) {
      if (!circle.P) d3_geom_voronoiFirstCircle = circle.N;
      d3_geom_voronoiCircles.remove(circle);
      d3_geom_voronoiCirclePool.push(circle);
      d3_geom_voronoiRedBlackNode(circle);
      arc.circle = null;
    }
  }
  function d3_geom_voronoiClipEdges(extent) {
    var edges = d3_geom_voronoiEdges, clip = d3_geom_clipLine(extent[0][0], extent[0][1], extent[1][0], extent[1][1]), i = edges.length, e;
    while (i--) {
      e = edges[i];
      if (!d3_geom_voronoiConnectEdge(e, extent) || !clip(e) || abs(e.a.x - e.b.x) < ε && abs(e.a.y - e.b.y) < ε) {
        e.a = e.b = null;
        edges.splice(i, 1);
      }
    }
  }
  function d3_geom_voronoiConnectEdge(edge, extent) {
    var vb = edge.b;
    if (vb) return true;
    var va = edge.a, x0 = extent[0][0], x1 = extent[1][0], y0 = extent[0][1], y1 = extent[1][1], lSite = edge.l, rSite = edge.r, lx = lSite.x, ly = lSite.y, rx = rSite.x, ry = rSite.y, fx = (lx + rx) / 2, fy = (ly + ry) / 2, fm, fb;
    if (ry === ly) {
      if (fx < x0 || fx >= x1) return;
      if (lx > rx) {
        if (!va) va = {
          x: fx,
          y: y0
        }; else if (va.y >= y1) return;
        vb = {
          x: fx,
          y: y1
        };
      } else {
        if (!va) va = {
          x: fx,
          y: y1
        }; else if (va.y < y0) return;
        vb = {
          x: fx,
          y: y0
        };
      }
    } else {
      fm = (lx - rx) / (ry - ly);
      fb = fy - fm * fx;
      if (fm < -1 || fm > 1) {
        if (lx > rx) {
          if (!va) va = {
            x: (y0 - fb) / fm,
            y: y0
          }; else if (va.y >= y1) return;
          vb = {
            x: (y1 - fb) / fm,
            y: y1
          };
        } else {
          if (!va) va = {
            x: (y1 - fb) / fm,
            y: y1
          }; else if (va.y < y0) return;
          vb = {
            x: (y0 - fb) / fm,
            y: y0
          };
        }
      } else {
        if (ly < ry) {
          if (!va) va = {
            x: x0,
            y: fm * x0 + fb
          }; else if (va.x >= x1) return;
          vb = {
            x: x1,
            y: fm * x1 + fb
          };
        } else {
          if (!va) va = {
            x: x1,
            y: fm * x1 + fb
          }; else if (va.x < x0) return;
          vb = {
            x: x0,
            y: fm * x0 + fb
          };
        }
      }
    }
    edge.a = va;
    edge.b = vb;
    return true;
  }
  function d3_geom_voronoiEdge(lSite, rSite) {
    this.l = lSite;
    this.r = rSite;
    this.a = this.b = null;
  }
  function d3_geom_voronoiCreateEdge(lSite, rSite, va, vb) {
    var edge = new d3_geom_voronoiEdge(lSite, rSite);
    d3_geom_voronoiEdges.push(edge);
    if (va) d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, va);
    if (vb) d3_geom_voronoiSetEdgeEnd(edge, rSite, lSite, vb);
    d3_geom_voronoiCells[lSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, lSite, rSite));
    d3_geom_voronoiCells[rSite.i].edges.push(new d3_geom_voronoiHalfEdge(edge, rSite, lSite));
    return edge;
  }
  function d3_geom_voronoiCreateBorderEdge(lSite, va, vb) {
    var edge = new d3_geom_voronoiEdge(lSite, null);
    edge.a = va;
    edge.b = vb;
    d3_geom_voronoiEdges.push(edge);
    return edge;
  }
  function d3_geom_voronoiSetEdgeEnd(edge, lSite, rSite, vertex) {
    if (!edge.a && !edge.b) {
      edge.a = vertex;
      edge.l = lSite;
      edge.r = rSite;
    } else if (edge.l === rSite) {
      edge.b = vertex;
    } else {
      edge.a = vertex;
    }
  }
  function d3_geom_voronoiHalfEdge(edge, lSite, rSite) {
    var va = edge.a, vb = edge.b;
    this.edge = edge;
    this.site = lSite;
    this.angle = rSite ? Math.atan2(rSite.y - lSite.y, rSite.x - lSite.x) : edge.l === lSite ? Math.atan2(vb.x - va.x, va.y - vb.y) : Math.atan2(va.x - vb.x, vb.y - va.y);
  }
  d3_geom_voronoiHalfEdge.prototype = {
    start: function() {
      return this.edge.l === this.site ? this.edge.a : this.edge.b;
    },
    end: function() {
      return this.edge.l === this.site ? this.edge.b : this.edge.a;
    }
  };
  function d3_geom_voronoiRedBlackTree() {
    this._ = null;
  }
  function d3_geom_voronoiRedBlackNode(node) {
    node.U = node.C = node.L = node.R = node.P = node.N = null;
  }
  d3_geom_voronoiRedBlackTree.prototype = {
    insert: function(after, node) {
      var parent, grandpa, uncle;
      if (after) {
        node.P = after;
        node.N = after.N;
        if (after.N) after.N.P = node;
        after.N = node;
        if (after.R) {
          after = after.R;
          while (after.L) after = after.L;
          after.L = node;
        } else {
          after.R = node;
        }
        parent = after;
      } else if (this._) {
        after = d3_geom_voronoiRedBlackFirst(this._);
        node.P = null;
        node.N = after;
        after.P = after.L = node;
        parent = after;
      } else {
        node.P = node.N = null;
        this._ = node;
        parent = null;
      }
      node.L = node.R = null;
      node.U = parent;
      node.C = true;
      after = node;
      while (parent && parent.C) {
        grandpa = parent.U;
        if (parent === grandpa.L) {
          uncle = grandpa.R;
          if (uncle && uncle.C) {
            parent.C = uncle.C = false;
            grandpa.C = true;
            after = grandpa;
          } else {
            if (after === parent.R) {
              d3_geom_voronoiRedBlackRotateLeft(this, parent);
              after = parent;
              parent = after.U;
            }
            parent.C = false;
            grandpa.C = true;
            d3_geom_voronoiRedBlackRotateRight(this, grandpa);
          }
        } else {
          uncle = grandpa.L;
          if (uncle && uncle.C) {
            parent.C = uncle.C = false;
            grandpa.C = true;
            after = grandpa;
          } else {
            if (after === parent.L) {
              d3_geom_voronoiRedBlackRotateRight(this, parent);
              after = parent;
              parent = after.U;
            }
            parent.C = false;
            grandpa.C = true;
            d3_geom_voronoiRedBlackRotateLeft(this, grandpa);
          }
        }
        parent = after.U;
      }
      this._.C = false;
    },
    remove: function(node) {
      if (node.N) node.N.P = node.P;
      if (node.P) node.P.N = node.N;
      node.N = node.P = null;
      var parent = node.U, sibling, left = node.L, right = node.R, next, red;
      if (!left) next = right; else if (!right) next = left; else next = d3_geom_voronoiRedBlackFirst(right);
      if (parent) {
        if (parent.L === node) parent.L = next; else parent.R = next;
      } else {
        this._ = next;
      }
      if (left && right) {
        red = next.C;
        next.C = node.C;
        next.L = left;
        left.U = next;
        if (next !== right) {
          parent = next.U;
          next.U = node.U;
          node = next.R;
          parent.L = node;
          next.R = right;
          right.U = next;
        } else {
          next.U = parent;
          parent = next;
          node = next.R;
        }
      } else {
        red = node.C;
        node = next;
      }
      if (node) node.U = parent;
      if (red) return;
      if (node && node.C) {
        node.C = false;
        return;
      }
      do {
        if (node === this._) break;
        if (node === parent.L) {
          sibling = parent.R;
          if (sibling.C) {
            sibling.C = false;
            parent.C = true;
            d3_geom_voronoiRedBlackRotateLeft(this, parent);
            sibling = parent.R;
          }
          if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
            if (!sibling.R || !sibling.R.C) {
              sibling.L.C = false;
              sibling.C = true;
              d3_geom_voronoiRedBlackRotateRight(this, sibling);
              sibling = parent.R;
            }
            sibling.C = parent.C;
            parent.C = sibling.R.C = false;
            d3_geom_voronoiRedBlackRotateLeft(this, parent);
            node = this._;
            break;
          }
        } else {
          sibling = parent.L;
          if (sibling.C) {
            sibling.C = false;
            parent.C = true;
            d3_geom_voronoiRedBlackRotateRight(this, parent);
            sibling = parent.L;
          }
          if (sibling.L && sibling.L.C || sibling.R && sibling.R.C) {
            if (!sibling.L || !sibling.L.C) {
              sibling.R.C = false;
              sibling.C = true;
              d3_geom_voronoiRedBlackRotateLeft(this, sibling);
              sibling = parent.L;
            }
            sibling.C = parent.C;
            parent.C = sibling.L.C = false;
            d3_geom_voronoiRedBlackRotateRight(this, parent);
            node = this._;
            break;
          }
        }
        sibling.C = true;
        node = parent;
        parent = parent.U;
      } while (!node.C);
      if (node) node.C = false;
    }
  };
  function d3_geom_voronoiRedBlackRotateLeft(tree, node) {
    var p = node, q = node.R, parent = p.U;
    if (parent) {
      if (parent.L === p) parent.L = q; else parent.R = q;
    } else {
      tree._ = q;
    }
    q.U = parent;
    p.U = q;
    p.R = q.L;
    if (p.R) p.R.U = p;
    q.L = p;
  }
  function d3_geom_voronoiRedBlackRotateRight(tree, node) {
    var p = node, q = node.L, parent = p.U;
    if (parent) {
      if (parent.L === p) parent.L = q; else parent.R = q;
    } else {
      tree._ = q;
    }
    q.U = parent;
    p.U = q;
    p.L = q.R;
    if (p.L) p.L.U = p;
    q.R = p;
  }
  function d3_geom_voronoiRedBlackFirst(node) {
    while (node.L) node = node.L;
    return node;
  }
  function d3_geom_voronoi(sites, bbox) {
    var site = sites.sort(d3_geom_voronoiVertexOrder).pop(), x0, y0, circle;
    d3_geom_voronoiEdges = [];
    d3_geom_voronoiCells = new Array(sites.length);
    d3_geom_voronoiBeaches = new d3_geom_voronoiRedBlackTree();
    d3_geom_voronoiCircles = new d3_geom_voronoiRedBlackTree();
    while (true) {
      circle = d3_geom_voronoiFirstCircle;
      if (site && (!circle || site.y < circle.y || site.y === circle.y && site.x < circle.x)) {
        if (site.x !== x0 || site.y !== y0) {
          d3_geom_voronoiCells[site.i] = new d3_geom_voronoiCell(site);
          d3_geom_voronoiAddBeach(site);
          x0 = site.x, y0 = site.y;
        }
        site = sites.pop();
      } else if (circle) {
        d3_geom_voronoiRemoveBeach(circle.arc);
      } else {
        break;
      }
    }
    if (bbox) d3_geom_voronoiClipEdges(bbox), d3_geom_voronoiCloseCells(bbox);
    var diagram = {
      cells: d3_geom_voronoiCells,
      edges: d3_geom_voronoiEdges
    };
    d3_geom_voronoiBeaches = d3_geom_voronoiCircles = d3_geom_voronoiEdges = d3_geom_voronoiCells = null;
    return diagram;
  }
  function d3_geom_voronoiVertexOrder(a, b) {
    return b.y - a.y || b.x - a.x;
  }
  d3.geom.voronoi = function(points) {
    var x = d3_geom_pointX, y = d3_geom_pointY, fx = x, fy = y, clipExtent = d3_geom_voronoiClipExtent;
    if (points) return voronoi(points);
    function voronoi(data) {
      var polygons = new Array(data.length), x0 = clipExtent[0][0], y0 = clipExtent[0][1], x1 = clipExtent[1][0], y1 = clipExtent[1][1];
      d3_geom_voronoi(sites(data), clipExtent).cells.forEach(function(cell, i) {
        var edges = cell.edges, site = cell.site, polygon = polygons[i] = edges.length ? edges.map(function(e) {
          var s = e.start();
          return [ s.x, s.y ];
        }) : site.x >= x0 && site.x <= x1 && site.y >= y0 && site.y <= y1 ? [ [ x0, y1 ], [ x1, y1 ], [ x1, y0 ], [ x0, y0 ] ] : [];
        polygon.point = data[i];
      });
      return polygons;
    }
    function sites(data) {
      return data.map(function(d, i) {
        return {
          x: Math.round(fx(d, i) / ε) * ε,
          y: Math.round(fy(d, i) / ε) * ε,
          i: i
        };
      });
    }
    voronoi.links = function(data) {
      return d3_geom_voronoi(sites(data)).edges.filter(function(edge) {
        return edge.l && edge.r;
      }).map(function(edge) {
        return {
          source: data[edge.l.i],
          target: data[edge.r.i]
        };
      });
    };
    voronoi.triangles = function(data) {
      var triangles = [];
      d3_geom_voronoi(sites(data)).cells.forEach(function(cell, i) {
        var site = cell.site, edges = cell.edges.sort(d3_geom_voronoiHalfEdgeOrder), j = -1, m = edges.length, e0, s0, e1 = edges[m - 1].edge, s1 = e1.l === site ? e1.r : e1.l;
        while (++j < m) {
          e0 = e1;
          s0 = s1;
          e1 = edges[j].edge;
          s1 = e1.l === site ? e1.r : e1.l;
          if (i < s0.i && i < s1.i && d3_geom_voronoiTriangleArea(site, s0, s1) < 0) {
            triangles.push([ data[i], data[s0.i], data[s1.i] ]);
          }
        }
      });
      return triangles;
    };
    voronoi.x = function(_) {
      return arguments.length ? (fx = d3_functor(x = _), voronoi) : x;
    };
    voronoi.y = function(_) {
      return arguments.length ? (fy = d3_functor(y = _), voronoi) : y;
    };
    voronoi.clipExtent = function(_) {
      if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent;
      clipExtent = _ == null ? d3_geom_voronoiClipExtent : _;
      return voronoi;
    };
    voronoi.size = function(_) {
      if (!arguments.length) return clipExtent === d3_geom_voronoiClipExtent ? null : clipExtent && clipExtent[1];
      return voronoi.clipExtent(_ && [ [ 0, 0 ], _ ]);
    };
    return voronoi;
  };
  var d3_geom_voronoiClipExtent = [ [ -1e6, -1e6 ], [ 1e6, 1e6 ] ];
  function d3_geom_voronoiTriangleArea(a, b, c) {
    return (a.x - c.x) * (b.y - a.y) - (a.x - b.x) * (c.y - a.y);
  }
  d3.geom.delaunay = function(vertices) {
    return d3.geom.voronoi().triangles(vertices);
  };
  d3.geom.quadtree = function(points, x1, y1, x2, y2) {
    var x = d3_geom_pointX, y = d3_geom_pointY, compat;
    if (compat = arguments.length) {
      x = d3_geom_quadtreeCompatX;
      y = d3_geom_quadtreeCompatY;
      if (compat === 3) {
        y2 = y1;
        x2 = x1;
        y1 = x1 = 0;
      }
      return quadtree(points);
    }
    function quadtree(data) {
      var d, fx = d3_functor(x), fy = d3_functor(y), xs, ys, i, n, x1_, y1_, x2_, y2_;
      if (x1 != null) {
        x1_ = x1, y1_ = y1, x2_ = x2, y2_ = y2;
      } else {
        x2_ = y2_ = -(x1_ = y1_ = Infinity);
        xs = [], ys = [];
        n = data.length;
        if (compat) for (i = 0; i < n; ++i) {
          d = data[i];
          if (d.x < x1_) x1_ = d.x;
          if (d.y < y1_) y1_ = d.y;
          if (d.x > x2_) x2_ = d.x;
          if (d.y > y2_) y2_ = d.y;
          xs.push(d.x);
          ys.push(d.y);
        } else for (i = 0; i < n; ++i) {
          var x_ = +fx(d = data[i], i), y_ = +fy(d, i);
          if (x_ < x1_) x1_ = x_;
          if (y_ < y1_) y1_ = y_;
          if (x_ > x2_) x2_ = x_;
          if (y_ > y2_) y2_ = y_;
          xs.push(x_);
          ys.push(y_);
        }
      }
      var dx = x2_ - x1_, dy = y2_ - y1_;
      if (dx > dy) y2_ = y1_ + dx; else x2_ = x1_ + dy;
      function insert(n, d, x, y, x1, y1, x2, y2) {
        if (isNaN(x) || isNaN(y)) return;
        if (n.leaf) {
          var nx = n.x, ny = n.y;
          if (nx != null) {
            if (abs(nx - x) + abs(ny - y) < .01) {
              insertChild(n, d, x, y, x1, y1, x2, y2);
            } else {
              var nPoint = n.point;
              n.x = n.y = n.point = null;
              insertChild(n, nPoint, nx, ny, x1, y1, x2, y2);
              insertChild(n, d, x, y, x1, y1, x2, y2);
            }
          } else {
            n.x = x, n.y = y, n.point = d;
          }
        } else {
          insertChild(n, d, x, y, x1, y1, x2, y2);
        }
      }
      function insertChild(n, d, x, y, x1, y1, x2, y2) {
        var sx = (x1 + x2) * .5, sy = (y1 + y2) * .5, right = x >= sx, bottom = y >= sy, i = (bottom << 1) + right;
        n.leaf = false;
        n = n.nodes[i] || (n.nodes[i] = d3_geom_quadtreeNode());
        if (right) x1 = sx; else x2 = sx;
        if (bottom) y1 = sy; else y2 = sy;
        insert(n, d, x, y, x1, y1, x2, y2);
      }
      var root = d3_geom_quadtreeNode();
      root.add = function(d) {
        insert(root, d, +fx(d, ++i), +fy(d, i), x1_, y1_, x2_, y2_);
      };
      root.visit = function(f) {
        d3_geom_quadtreeVisit(f, root, x1_, y1_, x2_, y2_);
      };
      i = -1;
      if (x1 == null) {
        while (++i < n) {
          insert(root, data[i], xs[i], ys[i], x1_, y1_, x2_, y2_);
        }
        --i;
      } else data.forEach(root.add);
      xs = ys = data = d = null;
      return root;
    }
    quadtree.x = function(_) {
      return arguments.length ? (x = _, quadtree) : x;
    };
    quadtree.y = function(_) {
      return arguments.length ? (y = _, quadtree) : y;
    };
    quadtree.extent = function(_) {
      if (!arguments.length) return x1 == null ? null : [ [ x1, y1 ], [ x2, y2 ] ];
      if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = +_[0][0], y1 = +_[0][1], x2 = +_[1][0], 
      y2 = +_[1][1];
      return quadtree;
    };
    quadtree.size = function(_) {
      if (!arguments.length) return x1 == null ? null : [ x2 - x1, y2 - y1 ];
      if (_ == null) x1 = y1 = x2 = y2 = null; else x1 = y1 = 0, x2 = +_[0], y2 = +_[1];
      return quadtree;
    };
    return quadtree;
  };
  function d3_geom_quadtreeCompatX(d) {
    return d.x;
  }
  function d3_geom_quadtreeCompatY(d) {
    return d.y;
  }
  function d3_geom_quadtreeNode() {
    return {
      leaf: true,
      nodes: [],
      point: null,
      x: null,
      y: null
    };
  }
  function d3_geom_quadtreeVisit(f, node, x1, y1, x2, y2) {
    if (!f(node, x1, y1, x2, y2)) {
      var sx = (x1 + x2) * .5, sy = (y1 + y2) * .5, children = node.nodes;
      if (children[0]) d3_geom_quadtreeVisit(f, children[0], x1, y1, sx, sy);
      if (children[1]) d3_geom_quadtreeVisit(f, children[1], sx, y1, x2, sy);
      if (children[2]) d3_geom_quadtreeVisit(f, children[2], x1, sy, sx, y2);
      if (children[3]) d3_geom_quadtreeVisit(f, children[3], sx, sy, x2, y2);
    }
  }
  d3.interpolateRgb = d3_interpolateRgb;
  function d3_interpolateRgb(a, b) {
    a = d3.rgb(a);
    b = d3.rgb(b);
    var ar = a.r, ag = a.g, ab = a.b, br = b.r - ar, bg = b.g - ag, bb = b.b - ab;
    return function(t) {
      return "#" + d3_rgb_hex(Math.round(ar + br * t)) + d3_rgb_hex(Math.round(ag + bg * t)) + d3_rgb_hex(Math.round(ab + bb * t));
    };
  }
  d3.interpolateObject = d3_interpolateObject;
  function d3_interpolateObject(a, b) {
    var i = {}, c = {}, k;
    for (k in a) {
      if (k in b) {
        i[k] = d3_interpolate(a[k], b[k]);
      } else {
        c[k] = a[k];
      }
    }
    for (k in b) {
      if (!(k in a)) {
        c[k] = b[k];
      }
    }
    return function(t) {
      for (k in i) c[k] = i[k](t);
      return c;
    };
  }
  d3.interpolateNumber = d3_interpolateNumber;
  function d3_interpolateNumber(a, b) {
    b -= a = +a;
    return function(t) {
      return a + b * t;
    };
  }
  d3.interpolateString = d3_interpolateString;
  function d3_interpolateString(a, b) {
    var bi = d3_interpolate_numberA.lastIndex = d3_interpolate_numberB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
    a = a + "", b = b + "";
    while ((am = d3_interpolate_numberA.exec(a)) && (bm = d3_interpolate_numberB.exec(b))) {
      if ((bs = bm.index) > bi) {
        bs = b.substring(bi, bs);
        if (s[i]) s[i] += bs; else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) {
        if (s[i]) s[i] += bm; else s[++i] = bm;
      } else {
        s[++i] = null;
        q.push({
          i: i,
          x: d3_interpolateNumber(am, bm)
        });
      }
      bi = d3_interpolate_numberB.lastIndex;
    }
    if (bi < b.length) {
      bs = b.substring(bi);
      if (s[i]) s[i] += bs; else s[++i] = bs;
    }
    return s.length < 2 ? q[0] ? (b = q[0].x, function(t) {
      return b(t) + "";
    }) : function() {
      return b;
    } : (b = q.length, function(t) {
      for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    });
  }
  var d3_interpolate_numberA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g, d3_interpolate_numberB = new RegExp(d3_interpolate_numberA.source, "g");
  d3.interpolate = d3_interpolate;
  function d3_interpolate(a, b) {
    var i = d3.interpolators.length, f;
    while (--i >= 0 && !(f = d3.interpolators[i](a, b))) ;
    return f;
  }
  d3.interpolators = [ function(a, b) {
    var t = typeof b;
    return (t === "string" ? d3_rgb_names.has(b) || /^(#|rgb\(|hsl\()/.test(b) ? d3_interpolateRgb : d3_interpolateString : b instanceof d3_color ? d3_interpolateRgb : Array.isArray(b) ? d3_interpolateArray : t === "object" && isNaN(b) ? d3_interpolateObject : d3_interpolateNumber)(a, b);
  } ];
  d3.interpolateArray = d3_interpolateArray;
  function d3_interpolateArray(a, b) {
    var x = [], c = [], na = a.length, nb = b.length, n0 = Math.min(a.length, b.length), i;
    for (i = 0; i < n0; ++i) x.push(d3_interpolate(a[i], b[i]));
    for (;i < na; ++i) c[i] = a[i];
    for (;i < nb; ++i) c[i] = b[i];
    return function(t) {
      for (i = 0; i < n0; ++i) c[i] = x[i](t);
      return c;
    };
  }
  var d3_ease_default = function() {
    return d3_identity;
  };
  var d3_ease = d3.map({
    linear: d3_ease_default,
    poly: d3_ease_poly,
    quad: function() {
      return d3_ease_quad;
    },
    cubic: function() {
      return d3_ease_cubic;
    },
    sin: function() {
      return d3_ease_sin;
    },
    exp: function() {
      return d3_ease_exp;
    },
    circle: function() {
      return d3_ease_circle;
    },
    elastic: d3_ease_elastic,
    back: d3_ease_back,
    bounce: function() {
      return d3_ease_bounce;
    }
  });
  var d3_ease_mode = d3.map({
    "in": d3_identity,
    out: d3_ease_reverse,
    "in-out": d3_ease_reflect,
    "out-in": function(f) {
      return d3_ease_reflect(d3_ease_reverse(f));
    }
  });
  d3.ease = function(name) {
    var i = name.indexOf("-"), t = i >= 0 ? name.substring(0, i) : name, m = i >= 0 ? name.substring(i + 1) : "in";
    t = d3_ease.get(t) || d3_ease_default;
    m = d3_ease_mode.get(m) || d3_identity;
    return d3_ease_clamp(m(t.apply(null, d3_arraySlice.call(arguments, 1))));
  };
  function d3_ease_clamp(f) {
    return function(t) {
      return t <= 0 ? 0 : t >= 1 ? 1 : f(t);
    };
  }
  function d3_ease_reverse(f) {
    return function(t) {
      return 1 - f(1 - t);
    };
  }
  function d3_ease_reflect(f) {
    return function(t) {
      return .5 * (t < .5 ? f(2 * t) : 2 - f(2 - 2 * t));
    };
  }
  function d3_ease_quad(t) {
    return t * t;
  }
  function d3_ease_cubic(t) {
    return t * t * t;
  }
  function d3_ease_cubicInOut(t) {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    var t2 = t * t, t3 = t2 * t;
    return 4 * (t < .5 ? t3 : 3 * (t - t2) + t3 - .75);
  }
  function d3_ease_poly(e) {
    return function(t) {
      return Math.pow(t, e);
    };
  }
  function d3_ease_sin(t) {
    return 1 - Math.cos(t * halfπ);
  }
  function d3_ease_exp(t) {
    return Math.pow(2, 10 * (t - 1));
  }
  function d3_ease_circle(t) {
    return 1 - Math.sqrt(1 - t * t);
  }
  function d3_ease_elastic(a, p) {
    var s;
    if (arguments.length < 2) p = .45;
    if (arguments.length) s = p / τ * Math.asin(1 / a); else a = 1, s = p / 4;
    return function(t) {
      return 1 + a * Math.pow(2, -10 * t) * Math.sin((t - s) * τ / p);
    };
  }
  function d3_ease_back(s) {
    if (!s) s = 1.70158;
    return function(t) {
      return t * t * ((s + 1) * t - s);
    };
  }
  function d3_ease_bounce(t) {
    return t < 1 / 2.75 ? 7.5625 * t * t : t < 2 / 2.75 ? 7.5625 * (t -= 1.5 / 2.75) * t + .75 : t < 2.5 / 2.75 ? 7.5625 * (t -= 2.25 / 2.75) * t + .9375 : 7.5625 * (t -= 2.625 / 2.75) * t + .984375;
  }
  d3.interpolateHcl = d3_interpolateHcl;
  function d3_interpolateHcl(a, b) {
    a = d3.hcl(a);
    b = d3.hcl(b);
    var ah = a.h, ac = a.c, al = a.l, bh = b.h - ah, bc = b.c - ac, bl = b.l - al;
    if (isNaN(bc)) bc = 0, ac = isNaN(ac) ? b.c : ac;
    if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
    return function(t) {
      return d3_hcl_lab(ah + bh * t, ac + bc * t, al + bl * t) + "";
    };
  }
  d3.interpolateHsl = d3_interpolateHsl;
  function d3_interpolateHsl(a, b) {
    a = d3.hsl(a);
    b = d3.hsl(b);
    var ah = a.h, as = a.s, al = a.l, bh = b.h - ah, bs = b.s - as, bl = b.l - al;
    if (isNaN(bs)) bs = 0, as = isNaN(as) ? b.s : as;
    if (isNaN(bh)) bh = 0, ah = isNaN(ah) ? b.h : ah; else if (bh > 180) bh -= 360; else if (bh < -180) bh += 360;
    return function(t) {
      return d3_hsl_rgb(ah + bh * t, as + bs * t, al + bl * t) + "";
    };
  }
  d3.interpolateLab = d3_interpolateLab;
  function d3_interpolateLab(a, b) {
    a = d3.lab(a);
    b = d3.lab(b);
    var al = a.l, aa = a.a, ab = a.b, bl = b.l - al, ba = b.a - aa, bb = b.b - ab;
    return function(t) {
      return d3_lab_rgb(al + bl * t, aa + ba * t, ab + bb * t) + "";
    };
  }
  d3.interpolateRound = d3_interpolateRound;
  function d3_interpolateRound(a, b) {
    b -= a;
    return function(t) {
      return Math.round(a + b * t);
    };
  }
  d3.transform = function(string) {
    var g = d3_document.createElementNS(d3.ns.prefix.svg, "g");
    return (d3.transform = function(string) {
      if (string != null) {
        g.setAttribute("transform", string);
        var t = g.transform.baseVal.consolidate();
      }
      return new d3_transform(t ? t.matrix : d3_transformIdentity);
    })(string);
  };
  function d3_transform(m) {
    var r0 = [ m.a, m.b ], r1 = [ m.c, m.d ], kx = d3_transformNormalize(r0), kz = d3_transformDot(r0, r1), ky = d3_transformNormalize(d3_transformCombine(r1, r0, -kz)) || 0;
    if (r0[0] * r1[1] < r1[0] * r0[1]) {
      r0[0] *= -1;
      r0[1] *= -1;
      kx *= -1;
      kz *= -1;
    }
    this.rotate = (kx ? Math.atan2(r0[1], r0[0]) : Math.atan2(-r1[0], r1[1])) * d3_degrees;
    this.translate = [ m.e, m.f ];
    this.scale = [ kx, ky ];
    this.skew = ky ? Math.atan2(kz, ky) * d3_degrees : 0;
  }
  d3_transform.prototype.toString = function() {
    return "translate(" + this.translate + ")rotate(" + this.rotate + ")skewX(" + this.skew + ")scale(" + this.scale + ")";
  };
  function d3_transformDot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
  }
  function d3_transformNormalize(a) {
    var k = Math.sqrt(d3_transformDot(a, a));
    if (k) {
      a[0] /= k;
      a[1] /= k;
    }
    return k;
  }
  function d3_transformCombine(a, b, k) {
    a[0] += k * b[0];
    a[1] += k * b[1];
    return a;
  }
  var d3_transformIdentity = {
    a: 1,
    b: 0,
    c: 0,
    d: 1,
    e: 0,
    f: 0
  };
  d3.interpolateTransform = d3_interpolateTransform;
  function d3_interpolateTransform(a, b) {
    var s = [], q = [], n, A = d3.transform(a), B = d3.transform(b), ta = A.translate, tb = B.translate, ra = A.rotate, rb = B.rotate, wa = A.skew, wb = B.skew, ka = A.scale, kb = B.scale;
    if (ta[0] != tb[0] || ta[1] != tb[1]) {
      s.push("translate(", null, ",", null, ")");
      q.push({
        i: 1,
        x: d3_interpolateNumber(ta[0], tb[0])
      }, {
        i: 3,
        x: d3_interpolateNumber(ta[1], tb[1])
      });
    } else if (tb[0] || tb[1]) {
      s.push("translate(" + tb + ")");
    } else {
      s.push("");
    }
    if (ra != rb) {
      if (ra - rb > 180) rb += 360; else if (rb - ra > 180) ra += 360;
      q.push({
        i: s.push(s.pop() + "rotate(", null, ")") - 2,
        x: d3_interpolateNumber(ra, rb)
      });
    } else if (rb) {
      s.push(s.pop() + "rotate(" + rb + ")");
    }
    if (wa != wb) {
      q.push({
        i: s.push(s.pop() + "skewX(", null, ")") - 2,
        x: d3_interpolateNumber(wa, wb)
      });
    } else if (wb) {
      s.push(s.pop() + "skewX(" + wb + ")");
    }
    if (ka[0] != kb[0] || ka[1] != kb[1]) {
      n = s.push(s.pop() + "scale(", null, ",", null, ")");
      q.push({
        i: n - 4,
        x: d3_interpolateNumber(ka[0], kb[0])
      }, {
        i: n - 2,
        x: d3_interpolateNumber(ka[1], kb[1])
      });
    } else if (kb[0] != 1 || kb[1] != 1) {
      s.push(s.pop() + "scale(" + kb + ")");
    }
    n = q.length;
    return function(t) {
      var i = -1, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  }
  function d3_uninterpolateNumber(a, b) {
    b = b - (a = +a) ? 1 / (b - a) : 0;
    return function(x) {
      return (x - a) * b;
    };
  }
  function d3_uninterpolateClamp(a, b) {
    b = b - (a = +a) ? 1 / (b - a) : 0;
    return function(x) {
      return Math.max(0, Math.min(1, (x - a) * b));
    };
  }
  d3.layout = {};
  d3.layout.bundle = function() {
    return function(links) {
      var paths = [], i = -1, n = links.length;
      while (++i < n) paths.push(d3_layout_bundlePath(links[i]));
      return paths;
    };
  };
  function d3_layout_bundlePath(link) {
    var start = link.source, end = link.target, lca = d3_layout_bundleLeastCommonAncestor(start, end), points = [ start ];
    while (start !== lca) {
      start = start.parent;
      points.push(start);
    }
    var k = points.length;
    while (end !== lca) {
      points.splice(k, 0, end);
      end = end.parent;
    }
    return points;
  }
  function d3_layout_bundleAncestors(node) {
    var ancestors = [], parent = node.parent;
    while (parent != null) {
      ancestors.push(node);
      node = parent;
      parent = parent.parent;
    }
    ancestors.push(node);
    return ancestors;
  }
  function d3_layout_bundleLeastCommonAncestor(a, b) {
    if (a === b) return a;
    var aNodes = d3_layout_bundleAncestors(a), bNodes = d3_layout_bundleAncestors(b), aNode = aNodes.pop(), bNode = bNodes.pop(), sharedNode = null;
    while (aNode === bNode) {
      sharedNode = aNode;
      aNode = aNodes.pop();
      bNode = bNodes.pop();
    }
    return sharedNode;
  }
  d3.layout.chord = function() {
    var chord = {}, chords, groups, matrix, n, padding = 0, sortGroups, sortSubgroups, sortChords;
    function relayout() {
      var subgroups = {}, groupSums = [], groupIndex = d3.range(n), subgroupIndex = [], k, x, x0, i, j;
      chords = [];
      groups = [];
      k = 0, i = -1;
      while (++i < n) {
        x = 0, j = -1;
        while (++j < n) {
          x += matrix[i][j];
        }
        groupSums.push(x);
        subgroupIndex.push(d3.range(n));
        k += x;
      }
      if (sortGroups) {
        groupIndex.sort(function(a, b) {
          return sortGroups(groupSums[a], groupSums[b]);
        });
      }
      if (sortSubgroups) {
        subgroupIndex.forEach(function(d, i) {
          d.sort(function(a, b) {
            return sortSubgroups(matrix[i][a], matrix[i][b]);
          });
        });
      }
      k = (τ - padding * n) / k;
      x = 0, i = -1;
      while (++i < n) {
        x0 = x, j = -1;
        while (++j < n) {
          var di = groupIndex[i], dj = subgroupIndex[di][j], v = matrix[di][dj], a0 = x, a1 = x += v * k;
          subgroups[di + "-" + dj] = {
            index: di,
            subindex: dj,
            startAngle: a0,
            endAngle: a1,
            value: v
          };
        }
        groups[di] = {
          index: di,
          startAngle: x0,
          endAngle: x,
          value: (x - x0) / k
        };
        x += padding;
      }
      i = -1;
      while (++i < n) {
        j = i - 1;
        while (++j < n) {
          var source = subgroups[i + "-" + j], target = subgroups[j + "-" + i];
          if (source.value || target.value) {
            chords.push(source.value < target.value ? {
              source: target,
              target: source
            } : {
              source: source,
              target: target
            });
          }
        }
      }
      if (sortChords) resort();
    }
    function resort() {
      chords.sort(function(a, b) {
        return sortChords((a.source.value + a.target.value) / 2, (b.source.value + b.target.value) / 2);
      });
    }
    chord.matrix = function(x) {
      if (!arguments.length) return matrix;
      n = (matrix = x) && matrix.length;
      chords = groups = null;
      return chord;
    };
    chord.padding = function(x) {
      if (!arguments.length) return padding;
      padding = x;
      chords = groups = null;
      return chord;
    };
    chord.sortGroups = function(x) {
      if (!arguments.length) return sortGroups;
      sortGroups = x;
      chords = groups = null;
      return chord;
    };
    chord.sortSubgroups = function(x) {
      if (!arguments.length) return sortSubgroups;
      sortSubgroups = x;
      chords = null;
      return chord;
    };
    chord.sortChords = function(x) {
      if (!arguments.length) return sortChords;
      sortChords = x;
      if (chords) resort();
      return chord;
    };
    chord.chords = function() {
      if (!chords) relayout();
      return chords;
    };
    chord.groups = function() {
      if (!groups) relayout();
      return groups;
    };
    return chord;
  };
  d3.layout.force = function() {
    var force = {}, event = d3.dispatch("start", "tick", "end"), size = [ 1, 1 ], drag, alpha, friction = .9, linkDistance = d3_layout_forceLinkDistance, linkStrength = d3_layout_forceLinkStrength, charge = -30, chargeDistance2 = d3_layout_forceChargeDistance2, gravity = .1, theta2 = .64, nodes = [], links = [], distances, strengths, charges;
    function repulse(node) {
      return function(quad, x1, _, x2) {
        if (quad.point !== node) {
          var dx = quad.cx - node.x, dy = quad.cy - node.y, dw = x2 - x1, dn = dx * dx + dy * dy;
          if (dw * dw / theta2 < dn) {
            if (dn < chargeDistance2) {
              var k = quad.charge / dn;
              node.px -= dx * k;
              node.py -= dy * k;
            }
            return true;
          }
          if (quad.point && dn && dn < chargeDistance2) {
            var k = quad.pointCharge / dn;
            node.px -= dx * k;
            node.py -= dy * k;
          }
        }
        return !quad.charge;
      };
    }
    force.tick = function() {
      if ((alpha *= .99) < .005) {
        event.end({
          type: "end",
          alpha: alpha = 0
        });
        return true;
      }
      var n = nodes.length, m = links.length, q, i, o, s, t, l, k, x, y;
      for (i = 0; i < m; ++i) {
        o = links[i];
        s = o.source;
        t = o.target;
        x = t.x - s.x;
        y = t.y - s.y;
        if (l = x * x + y * y) {
          l = alpha * strengths[i] * ((l = Math.sqrt(l)) - distances[i]) / l;
          x *= l;
          y *= l;
          t.x -= x * (k = s.weight / (t.weight + s.weight));
          t.y -= y * k;
          s.x += x * (k = 1 - k);
          s.y += y * k;
        }
      }
      if (k = alpha * gravity) {
        x = size[0] / 2;
        y = size[1] / 2;
        i = -1;
        if (k) while (++i < n) {
          o = nodes[i];
          o.x += (x - o.x) * k;
          o.y += (y - o.y) * k;
        }
      }
      if (charge) {
        d3_layout_forceAccumulate(q = d3.geom.quadtree(nodes), alpha, charges);
        i = -1;
        while (++i < n) {
          if (!(o = nodes[i]).fixed) {
            q.visit(repulse(o));
          }
        }
      }
      i = -1;
      while (++i < n) {
        o = nodes[i];
        if (o.fixed) {
          o.x = o.px;
          o.y = o.py;
        } else {
          o.x -= (o.px - (o.px = o.x)) * friction;
          o.y -= (o.py - (o.py = o.y)) * friction;
        }
      }
      event.tick({
        type: "tick",
        alpha: alpha
      });
    };
    force.nodes = function(x) {
      if (!arguments.length) return nodes;
      nodes = x;
      return force;
    };
    force.links = function(x) {
      if (!arguments.length) return links;
      links = x;
      return force;
    };
    force.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return force;
    };
    force.linkDistance = function(x) {
      if (!arguments.length) return linkDistance;
      linkDistance = typeof x === "function" ? x : +x;
      return force;
    };
    force.distance = force.linkDistance;
    force.linkStrength = function(x) {
      if (!arguments.length) return linkStrength;
      linkStrength = typeof x === "function" ? x : +x;
      return force;
    };
    force.friction = function(x) {
      if (!arguments.length) return friction;
      friction = +x;
      return force;
    };
    force.charge = function(x) {
      if (!arguments.length) return charge;
      charge = typeof x === "function" ? x : +x;
      return force;
    };
    force.chargeDistance = function(x) {
      if (!arguments.length) return Math.sqrt(chargeDistance2);
      chargeDistance2 = x * x;
      return force;
    };
    force.gravity = function(x) {
      if (!arguments.length) return gravity;
      gravity = +x;
      return force;
    };
    force.theta = function(x) {
      if (!arguments.length) return Math.sqrt(theta2);
      theta2 = x * x;
      return force;
    };
    force.alpha = function(x) {
      if (!arguments.length) return alpha;
      x = +x;
      if (alpha) {
        if (x > 0) alpha = x; else alpha = 0;
      } else if (x > 0) {
        event.start({
          type: "start",
          alpha: alpha = x
        });
        d3.timer(force.tick);
      }
      return force;
    };
    force.start = function() {
      var i, n = nodes.length, m = links.length, w = size[0], h = size[1], neighbors, o;
      for (i = 0; i < n; ++i) {
        (o = nodes[i]).index = i;
        o.weight = 0;
      }
      for (i = 0; i < m; ++i) {
        o = links[i];
        if (typeof o.source == "number") o.source = nodes[o.source];
        if (typeof o.target == "number") o.target = nodes[o.target];
        ++o.source.weight;
        ++o.target.weight;
      }
      for (i = 0; i < n; ++i) {
        o = nodes[i];
        if (isNaN(o.x)) o.x = position("x", w);
        if (isNaN(o.y)) o.y = position("y", h);
        if (isNaN(o.px)) o.px = o.x;
        if (isNaN(o.py)) o.py = o.y;
      }
      distances = [];
      if (typeof linkDistance === "function") for (i = 0; i < m; ++i) distances[i] = +linkDistance.call(this, links[i], i); else for (i = 0; i < m; ++i) distances[i] = linkDistance;
      strengths = [];
      if (typeof linkStrength === "function") for (i = 0; i < m; ++i) strengths[i] = +linkStrength.call(this, links[i], i); else for (i = 0; i < m; ++i) strengths[i] = linkStrength;
      charges = [];
      if (typeof charge === "function") for (i = 0; i < n; ++i) charges[i] = +charge.call(this, nodes[i], i); else for (i = 0; i < n; ++i) charges[i] = charge;
      function position(dimension, size) {
        if (!neighbors) {
          neighbors = new Array(n);
          for (j = 0; j < n; ++j) {
            neighbors[j] = [];
          }
          for (j = 0; j < m; ++j) {
            var o = links[j];
            neighbors[o.source.index].push(o.target);
            neighbors[o.target.index].push(o.source);
          }
        }
        var candidates = neighbors[i], j = -1, m = candidates.length, x;
        while (++j < m) if (!isNaN(x = candidates[j][dimension])) return x;
        return Math.random() * size;
      }
      return force.resume();
    };
    force.resume = function() {
      return force.alpha(.1);
    };
    force.stop = function() {
      return force.alpha(0);
    };
    force.drag = function() {
      if (!drag) drag = d3.behavior.drag().origin(d3_identity).on("dragstart.force", d3_layout_forceDragstart).on("drag.force", dragmove).on("dragend.force", d3_layout_forceDragend);
      if (!arguments.length) return drag;
      this.on("mouseover.force", d3_layout_forceMouseover).on("mouseout.force", d3_layout_forceMouseout).call(drag);
    };
    function dragmove(d) {
      d.px = d3.event.x, d.py = d3.event.y;
      force.resume();
    }
    return d3.rebind(force, event, "on");
  };
  function d3_layout_forceDragstart(d) {
    d.fixed |= 2;
  }
  function d3_layout_forceDragend(d) {
    d.fixed &= ~6;
  }
  function d3_layout_forceMouseover(d) {
    d.fixed |= 4;
    d.px = d.x, d.py = d.y;
  }
  function d3_layout_forceMouseout(d) {
    d.fixed &= ~4;
  }
  function d3_layout_forceAccumulate(quad, alpha, charges) {
    var cx = 0, cy = 0;
    quad.charge = 0;
    if (!quad.leaf) {
      var nodes = quad.nodes, n = nodes.length, i = -1, c;
      while (++i < n) {
        c = nodes[i];
        if (c == null) continue;
        d3_layout_forceAccumulate(c, alpha, charges);
        quad.charge += c.charge;
        cx += c.charge * c.cx;
        cy += c.charge * c.cy;
      }
    }
    if (quad.point) {
      if (!quad.leaf) {
        quad.point.x += Math.random() - .5;
        quad.point.y += Math.random() - .5;
      }
      var k = alpha * charges[quad.point.index];
      quad.charge += quad.pointCharge = k;
      cx += k * quad.point.x;
      cy += k * quad.point.y;
    }
    quad.cx = cx / quad.charge;
    quad.cy = cy / quad.charge;
  }
  var d3_layout_forceLinkDistance = 20, d3_layout_forceLinkStrength = 1, d3_layout_forceChargeDistance2 = Infinity;
  d3.layout.hierarchy = function() {
    var sort = d3_layout_hierarchySort, children = d3_layout_hierarchyChildren, value = d3_layout_hierarchyValue;
    function hierarchy(root) {
      var stack = [ root ], nodes = [], node;
      root.depth = 0;
      while ((node = stack.pop()) != null) {
        nodes.push(node);
        if ((childs = children.call(hierarchy, node, node.depth)) && (n = childs.length)) {
          var n, childs, child;
          while (--n >= 0) {
            stack.push(child = childs[n]);
            child.parent = node;
            child.depth = node.depth + 1;
          }
          if (value) node.value = 0;
          node.children = childs;
        } else {
          if (value) node.value = +value.call(hierarchy, node, node.depth) || 0;
          delete node.children;
        }
      }
      d3_layout_hierarchyVisitAfter(root, function(node) {
        var childs, parent;
        if (sort && (childs = node.children)) childs.sort(sort);
        if (value && (parent = node.parent)) parent.value += node.value;
      });
      return nodes;
    }
    hierarchy.sort = function(x) {
      if (!arguments.length) return sort;
      sort = x;
      return hierarchy;
    };
    hierarchy.children = function(x) {
      if (!arguments.length) return children;
      children = x;
      return hierarchy;
    };
    hierarchy.value = function(x) {
      if (!arguments.length) return value;
      value = x;
      return hierarchy;
    };
    hierarchy.revalue = function(root) {
      if (value) {
        d3_layout_hierarchyVisitBefore(root, function(node) {
          if (node.children) node.value = 0;
        });
        d3_layout_hierarchyVisitAfter(root, function(node) {
          var parent;
          if (!node.children) node.value = +value.call(hierarchy, node, node.depth) || 0;
          if (parent = node.parent) parent.value += node.value;
        });
      }
      return root;
    };
    return hierarchy;
  };
  function d3_layout_hierarchyRebind(object, hierarchy) {
    d3.rebind(object, hierarchy, "sort", "children", "value");
    object.nodes = object;
    object.links = d3_layout_hierarchyLinks;
    return object;
  }
  function d3_layout_hierarchyVisitBefore(node, callback) {
    var nodes = [ node ];
    while ((node = nodes.pop()) != null) {
      callback(node);
      if ((children = node.children) && (n = children.length)) {
        var n, children;
        while (--n >= 0) nodes.push(children[n]);
      }
    }
  }
  function d3_layout_hierarchyVisitAfter(node, callback) {
    var nodes = [ node ], nodes2 = [];
    while ((node = nodes.pop()) != null) {
      nodes2.push(node);
      if ((children = node.children) && (n = children.length)) {
        var i = -1, n, children;
        while (++i < n) nodes.push(children[i]);
      }
    }
    while ((node = nodes2.pop()) != null) {
      callback(node);
    }
  }
  function d3_layout_hierarchyChildren(d) {
    return d.children;
  }
  function d3_layout_hierarchyValue(d) {
    return d.value;
  }
  function d3_layout_hierarchySort(a, b) {
    return b.value - a.value;
  }
  function d3_layout_hierarchyLinks(nodes) {
    return d3.merge(nodes.map(function(parent) {
      return (parent.children || []).map(function(child) {
        return {
          source: parent,
          target: child
        };
      });
    }));
  }
  d3.layout.partition = function() {
    var hierarchy = d3.layout.hierarchy(), size = [ 1, 1 ];
    function position(node, x, dx, dy) {
      var children = node.children;
      node.x = x;
      node.y = node.depth * dy;
      node.dx = dx;
      node.dy = dy;
      if (children && (n = children.length)) {
        var i = -1, n, c, d;
        dx = node.value ? dx / node.value : 0;
        while (++i < n) {
          position(c = children[i], x, d = c.value * dx, dy);
          x += d;
        }
      }
    }
    function depth(node) {
      var children = node.children, d = 0;
      if (children && (n = children.length)) {
        var i = -1, n;
        while (++i < n) d = Math.max(d, depth(children[i]));
      }
      return 1 + d;
    }
    function partition(d, i) {
      var nodes = hierarchy.call(this, d, i);
      position(nodes[0], 0, size[0], size[1] / depth(nodes[0]));
      return nodes;
    }
    partition.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return partition;
    };
    return d3_layout_hierarchyRebind(partition, hierarchy);
  };
  d3.layout.pie = function() {
    var value = Number, sort = d3_layout_pieSortByValue, startAngle = 0, endAngle = τ;
    function pie(data) {
      var values = data.map(function(d, i) {
        return +value.call(pie, d, i);
      });
      var a = +(typeof startAngle === "function" ? startAngle.apply(this, arguments) : startAngle);
      var k = ((typeof endAngle === "function" ? endAngle.apply(this, arguments) : endAngle) - a) / d3.sum(values);
      var index = d3.range(data.length);
      if (sort != null) index.sort(sort === d3_layout_pieSortByValue ? function(i, j) {
        return values[j] - values[i];
      } : function(i, j) {
        return sort(data[i], data[j]);
      });
      var arcs = [];
      index.forEach(function(i) {
        var d;
        arcs[i] = {
          data: data[i],
          value: d = values[i],
          startAngle: a,
          endAngle: a += d * k
        };
      });
      return arcs;
    }
    pie.value = function(x) {
      if (!arguments.length) return value;
      value = x;
      return pie;
    };
    pie.sort = function(x) {
      if (!arguments.length) return sort;
      sort = x;
      return pie;
    };
    pie.startAngle = function(x) {
      if (!arguments.length) return startAngle;
      startAngle = x;
      return pie;
    };
    pie.endAngle = function(x) {
      if (!arguments.length) return endAngle;
      endAngle = x;
      return pie;
    };
    return pie;
  };
  var d3_layout_pieSortByValue = {};
  d3.layout.stack = function() {
    var values = d3_identity, order = d3_layout_stackOrderDefault, offset = d3_layout_stackOffsetZero, out = d3_layout_stackOut, x = d3_layout_stackX, y = d3_layout_stackY;
    function stack(data, index) {
      var series = data.map(function(d, i) {
        return values.call(stack, d, i);
      });
      var points = series.map(function(d) {
        return d.map(function(v, i) {
          return [ x.call(stack, v, i), y.call(stack, v, i) ];
        });
      });
      var orders = order.call(stack, points, index);
      series = d3.permute(series, orders);
      points = d3.permute(points, orders);
      var offsets = offset.call(stack, points, index);
      var n = series.length, m = series[0].length, i, j, o;
      for (j = 0; j < m; ++j) {
        out.call(stack, series[0][j], o = offsets[j], points[0][j][1]);
        for (i = 1; i < n; ++i) {
          out.call(stack, series[i][j], o += points[i - 1][j][1], points[i][j][1]);
        }
      }
      return data;
    }
    stack.values = function(x) {
      if (!arguments.length) return values;
      values = x;
      return stack;
    };
    stack.order = function(x) {
      if (!arguments.length) return order;
      order = typeof x === "function" ? x : d3_layout_stackOrders.get(x) || d3_layout_stackOrderDefault;
      return stack;
    };
    stack.offset = function(x) {
      if (!arguments.length) return offset;
      offset = typeof x === "function" ? x : d3_layout_stackOffsets.get(x) || d3_layout_stackOffsetZero;
      return stack;
    };
    stack.x = function(z) {
      if (!arguments.length) return x;
      x = z;
      return stack;
    };
    stack.y = function(z) {
      if (!arguments.length) return y;
      y = z;
      return stack;
    };
    stack.out = function(z) {
      if (!arguments.length) return out;
      out = z;
      return stack;
    };
    return stack;
  };
  function d3_layout_stackX(d) {
    return d.x;
  }
  function d3_layout_stackY(d) {
    return d.y;
  }
  function d3_layout_stackOut(d, y0, y) {
    d.y0 = y0;
    d.y = y;
  }
  var d3_layout_stackOrders = d3.map({
    "inside-out": function(data) {
      var n = data.length, i, j, max = data.map(d3_layout_stackMaxIndex), sums = data.map(d3_layout_stackReduceSum), index = d3.range(n).sort(function(a, b) {
        return max[a] - max[b];
      }), top = 0, bottom = 0, tops = [], bottoms = [];
      for (i = 0; i < n; ++i) {
        j = index[i];
        if (top < bottom) {
          top += sums[j];
          tops.push(j);
        } else {
          bottom += sums[j];
          bottoms.push(j);
        }
      }
      return bottoms.reverse().concat(tops);
    },
    reverse: function(data) {
      return d3.range(data.length).reverse();
    },
    "default": d3_layout_stackOrderDefault
  });
  var d3_layout_stackOffsets = d3.map({
    silhouette: function(data) {
      var n = data.length, m = data[0].length, sums = [], max = 0, i, j, o, y0 = [];
      for (j = 0; j < m; ++j) {
        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
        if (o > max) max = o;
        sums.push(o);
      }
      for (j = 0; j < m; ++j) {
        y0[j] = (max - sums[j]) / 2;
      }
      return y0;
    },
    wiggle: function(data) {
      var n = data.length, x = data[0], m = x.length, i, j, k, s1, s2, s3, dx, o, o0, y0 = [];
      y0[0] = o = o0 = 0;
      for (j = 1; j < m; ++j) {
        for (i = 0, s1 = 0; i < n; ++i) s1 += data[i][j][1];
        for (i = 0, s2 = 0, dx = x[j][0] - x[j - 1][0]; i < n; ++i) {
          for (k = 0, s3 = (data[i][j][1] - data[i][j - 1][1]) / (2 * dx); k < i; ++k) {
            s3 += (data[k][j][1] - data[k][j - 1][1]) / dx;
          }
          s2 += s3 * data[i][j][1];
        }
        y0[j] = o -= s1 ? s2 / s1 * dx : 0;
        if (o < o0) o0 = o;
      }
      for (j = 0; j < m; ++j) y0[j] -= o0;
      return y0;
    },
    expand: function(data) {
      var n = data.length, m = data[0].length, k = 1 / n, i, j, o, y0 = [];
      for (j = 0; j < m; ++j) {
        for (i = 0, o = 0; i < n; i++) o += data[i][j][1];
        if (o) for (i = 0; i < n; i++) data[i][j][1] /= o; else for (i = 0; i < n; i++) data[i][j][1] = k;
      }
      for (j = 0; j < m; ++j) y0[j] = 0;
      return y0;
    },
    zero: d3_layout_stackOffsetZero
  });
  function d3_layout_stackOrderDefault(data) {
    return d3.range(data.length);
  }
  function d3_layout_stackOffsetZero(data) {
    var j = -1, m = data[0].length, y0 = [];
    while (++j < m) y0[j] = 0;
    return y0;
  }
  function d3_layout_stackMaxIndex(array) {
    var i = 1, j = 0, v = array[0][1], k, n = array.length;
    for (;i < n; ++i) {
      if ((k = array[i][1]) > v) {
        j = i;
        v = k;
      }
    }
    return j;
  }
  function d3_layout_stackReduceSum(d) {
    return d.reduce(d3_layout_stackSum, 0);
  }
  function d3_layout_stackSum(p, d) {
    return p + d[1];
  }
  d3.layout.histogram = function() {
    var frequency = true, valuer = Number, ranger = d3_layout_histogramRange, binner = d3_layout_histogramBinSturges;
    function histogram(data, i) {
      var bins = [], values = data.map(valuer, this), range = ranger.call(this, values, i), thresholds = binner.call(this, range, values, i), bin, i = -1, n = values.length, m = thresholds.length - 1, k = frequency ? 1 : 1 / n, x;
      while (++i < m) {
        bin = bins[i] = [];
        bin.dx = thresholds[i + 1] - (bin.x = thresholds[i]);
        bin.y = 0;
      }
      if (m > 0) {
        i = -1;
        while (++i < n) {
          x = values[i];
          if (x >= range[0] && x <= range[1]) {
            bin = bins[d3.bisect(thresholds, x, 1, m) - 1];
            bin.y += k;
            bin.push(data[i]);
          }
        }
      }
      return bins;
    }
    histogram.value = function(x) {
      if (!arguments.length) return valuer;
      valuer = x;
      return histogram;
    };
    histogram.range = function(x) {
      if (!arguments.length) return ranger;
      ranger = d3_functor(x);
      return histogram;
    };
    histogram.bins = function(x) {
      if (!arguments.length) return binner;
      binner = typeof x === "number" ? function(range) {
        return d3_layout_histogramBinFixed(range, x);
      } : d3_functor(x);
      return histogram;
    };
    histogram.frequency = function(x) {
      if (!arguments.length) return frequency;
      frequency = !!x;
      return histogram;
    };
    return histogram;
  };
  function d3_layout_histogramBinSturges(range, values) {
    return d3_layout_histogramBinFixed(range, Math.ceil(Math.log(values.length) / Math.LN2 + 1));
  }
  function d3_layout_histogramBinFixed(range, n) {
    var x = -1, b = +range[0], m = (range[1] - b) / n, f = [];
    while (++x <= n) f[x] = m * x + b;
    return f;
  }
  function d3_layout_histogramRange(values) {
    return [ d3.min(values), d3.max(values) ];
  }
  d3.layout.pack = function() {
    var hierarchy = d3.layout.hierarchy().sort(d3_layout_packSort), padding = 0, size = [ 1, 1 ], radius;
    function pack(d, i) {
      var nodes = hierarchy.call(this, d, i), root = nodes[0], w = size[0], h = size[1], r = radius == null ? Math.sqrt : typeof radius === "function" ? radius : function() {
        return radius;
      };
      root.x = root.y = 0;
      d3_layout_hierarchyVisitAfter(root, function(d) {
        d.r = +r(d.value);
      });
      d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
      if (padding) {
        var dr = padding * (radius ? 1 : Math.max(2 * root.r / w, 2 * root.r / h)) / 2;
        d3_layout_hierarchyVisitAfter(root, function(d) {
          d.r += dr;
        });
        d3_layout_hierarchyVisitAfter(root, d3_layout_packSiblings);
        d3_layout_hierarchyVisitAfter(root, function(d) {
          d.r -= dr;
        });
      }
      d3_layout_packTransform(root, w / 2, h / 2, radius ? 1 : 1 / Math.max(2 * root.r / w, 2 * root.r / h));
      return nodes;
    }
    pack.size = function(_) {
      if (!arguments.length) return size;
      size = _;
      return pack;
    };
    pack.radius = function(_) {
      if (!arguments.length) return radius;
      radius = _ == null || typeof _ === "function" ? _ : +_;
      return pack;
    };
    pack.padding = function(_) {
      if (!arguments.length) return padding;
      padding = +_;
      return pack;
    };
    return d3_layout_hierarchyRebind(pack, hierarchy);
  };
  function d3_layout_packSort(a, b) {
    return a.value - b.value;
  }
  function d3_layout_packInsert(a, b) {
    var c = a._pack_next;
    a._pack_next = b;
    b._pack_prev = a;
    b._pack_next = c;
    c._pack_prev = b;
  }
  function d3_layout_packSplice(a, b) {
    a._pack_next = b;
    b._pack_prev = a;
  }
  function d3_layout_packIntersects(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, dr = a.r + b.r;
    return .999 * dr * dr > dx * dx + dy * dy;
  }
  function d3_layout_packSiblings(node) {
    if (!(nodes = node.children) || !(n = nodes.length)) return;
    var nodes, xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity, a, b, c, i, j, k, n;
    function bound(node) {
      xMin = Math.min(node.x - node.r, xMin);
      xMax = Math.max(node.x + node.r, xMax);
      yMin = Math.min(node.y - node.r, yMin);
      yMax = Math.max(node.y + node.r, yMax);
    }
    nodes.forEach(d3_layout_packLink);
    a = nodes[0];
    a.x = -a.r;
    a.y = 0;
    bound(a);
    if (n > 1) {
      b = nodes[1];
      b.x = b.r;
      b.y = 0;
      bound(b);
      if (n > 2) {
        c = nodes[2];
        d3_layout_packPlace(a, b, c);
        bound(c);
        d3_layout_packInsert(a, c);
        a._pack_prev = c;
        d3_layout_packInsert(c, b);
        b = a._pack_next;
        for (i = 3; i < n; i++) {
          d3_layout_packPlace(a, b, c = nodes[i]);
          var isect = 0, s1 = 1, s2 = 1;
          for (j = b._pack_next; j !== b; j = j._pack_next, s1++) {
            if (d3_layout_packIntersects(j, c)) {
              isect = 1;
              break;
            }
          }
          if (isect == 1) {
            for (k = a._pack_prev; k !== j._pack_prev; k = k._pack_prev, s2++) {
              if (d3_layout_packIntersects(k, c)) {
                break;
              }
            }
          }
          if (isect) {
            if (s1 < s2 || s1 == s2 && b.r < a.r) d3_layout_packSplice(a, b = j); else d3_layout_packSplice(a = k, b);
            i--;
          } else {
            d3_layout_packInsert(a, c);
            b = c;
            bound(c);
          }
        }
      }
    }
    var cx = (xMin + xMax) / 2, cy = (yMin + yMax) / 2, cr = 0;
    for (i = 0; i < n; i++) {
      c = nodes[i];
      c.x -= cx;
      c.y -= cy;
      cr = Math.max(cr, c.r + Math.sqrt(c.x * c.x + c.y * c.y));
    }
    node.r = cr;
    nodes.forEach(d3_layout_packUnlink);
  }
  function d3_layout_packLink(node) {
    node._pack_next = node._pack_prev = node;
  }
  function d3_layout_packUnlink(node) {
    delete node._pack_next;
    delete node._pack_prev;
  }
  function d3_layout_packTransform(node, x, y, k) {
    var children = node.children;
    node.x = x += k * node.x;
    node.y = y += k * node.y;
    node.r *= k;
    if (children) {
      var i = -1, n = children.length;
      while (++i < n) d3_layout_packTransform(children[i], x, y, k);
    }
  }
  function d3_layout_packPlace(a, b, c) {
    var db = a.r + c.r, dx = b.x - a.x, dy = b.y - a.y;
    if (db && (dx || dy)) {
      var da = b.r + c.r, dc = dx * dx + dy * dy;
      da *= da;
      db *= db;
      var x = .5 + (db - da) / (2 * dc), y = Math.sqrt(Math.max(0, 2 * da * (db + dc) - (db -= dc) * db - da * da)) / (2 * dc);
      c.x = a.x + x * dx + y * dy;
      c.y = a.y + x * dy - y * dx;
    } else {
      c.x = a.x + db;
      c.y = a.y;
    }
  }
  d3.layout.tree = function() {
    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ], nodeSize = null;
    function tree(d, i) {
      var nodes = hierarchy.call(this, d, i), root0 = nodes[0], root1 = wrapTree(root0);
      d3_layout_hierarchyVisitAfter(root1, firstWalk), root1.parent.m = -root1.z;
      d3_layout_hierarchyVisitBefore(root1, secondWalk);
      if (nodeSize) d3_layout_hierarchyVisitBefore(root0, sizeNode); else {
        var left = root0, right = root0, bottom = root0;
        d3_layout_hierarchyVisitBefore(root0, function(node) {
          if (node.x < left.x) left = node;
          if (node.x > right.x) right = node;
          if (node.depth > bottom.depth) bottom = node;
        });
        var tx = separation(left, right) / 2 - left.x, kx = size[0] / (right.x + separation(right, left) / 2 + tx), ky = size[1] / (bottom.depth || 1);
        d3_layout_hierarchyVisitBefore(root0, function(node) {
          node.x = (node.x + tx) * kx;
          node.y = node.depth * ky;
        });
      }
      return nodes;
    }
    function wrapTree(root0) {
      var root1 = {
        A: null,
        children: [ root0 ]
      }, queue = [ root1 ], node1;
      while ((node1 = queue.pop()) != null) {
        for (var children = node1.children, child, i = 0, n = children.length; i < n; ++i) {
          queue.push((children[i] = child = {
            _: children[i],
            parent: node1,
            children: (child = children[i].children) && child.slice() || [],
            A: null,
            a: null,
            z: 0,
            m: 0,
            c: 0,
            s: 0,
            t: null,
            i: i
          }).a = child);
        }
      }
      return root1.children[0];
    }
    function firstWalk(v) {
      var children = v.children, siblings = v.parent.children, w = v.i ? siblings[v.i - 1] : null;
      if (children.length) {
        d3_layout_treeShift(v);
        var midpoint = (children[0].z + children[children.length - 1].z) / 2;
        if (w) {
          v.z = w.z + separation(v._, w._);
          v.m = v.z - midpoint;
        } else {
          v.z = midpoint;
        }
      } else if (w) {
        v.z = w.z + separation(v._, w._);
      }
      v.parent.A = apportion(v, w, v.parent.A || siblings[0]);
    }
    function secondWalk(v) {
      v._.x = v.z + v.parent.m;
      v.m += v.parent.m;
    }
    function apportion(v, w, ancestor) {
      if (w) {
        var vip = v, vop = v, vim = w, vom = vip.parent.children[0], sip = vip.m, sop = vop.m, sim = vim.m, som = vom.m, shift;
        while (vim = d3_layout_treeRight(vim), vip = d3_layout_treeLeft(vip), vim && vip) {
          vom = d3_layout_treeLeft(vom);
          vop = d3_layout_treeRight(vop);
          vop.a = v;
          shift = vim.z + sim - vip.z - sip + separation(vim._, vip._);
          if (shift > 0) {
            d3_layout_treeMove(d3_layout_treeAncestor(vim, v, ancestor), v, shift);
            sip += shift;
            sop += shift;
          }
          sim += vim.m;
          sip += vip.m;
          som += vom.m;
          sop += vop.m;
        }
        if (vim && !d3_layout_treeRight(vop)) {
          vop.t = vim;
          vop.m += sim - sop;
        }
        if (vip && !d3_layout_treeLeft(vom)) {
          vom.t = vip;
          vom.m += sip - som;
          ancestor = v;
        }
      }
      return ancestor;
    }
    function sizeNode(node) {
      node.x *= size[0];
      node.y = node.depth * size[1];
    }
    tree.separation = function(x) {
      if (!arguments.length) return separation;
      separation = x;
      return tree;
    };
    tree.size = function(x) {
      if (!arguments.length) return nodeSize ? null : size;
      nodeSize = (size = x) == null ? sizeNode : null;
      return tree;
    };
    tree.nodeSize = function(x) {
      if (!arguments.length) return nodeSize ? size : null;
      nodeSize = (size = x) == null ? null : sizeNode;
      return tree;
    };
    return d3_layout_hierarchyRebind(tree, hierarchy);
  };
  function d3_layout_treeSeparation(a, b) {
    return a.parent == b.parent ? 1 : 2;
  }
  function d3_layout_treeLeft(v) {
    var children = v.children;
    return children.length ? children[0] : v.t;
  }
  function d3_layout_treeRight(v) {
    var children = v.children, n;
    return (n = children.length) ? children[n - 1] : v.t;
  }
  function d3_layout_treeMove(wm, wp, shift) {
    var change = shift / (wp.i - wm.i);
    wp.c -= change;
    wp.s += shift;
    wm.c += change;
    wp.z += shift;
    wp.m += shift;
  }
  function d3_layout_treeShift(v) {
    var shift = 0, change = 0, children = v.children, i = children.length, w;
    while (--i >= 0) {
      w = children[i];
      w.z += shift;
      w.m += shift;
      shift += w.s + (change += w.c);
    }
  }
  function d3_layout_treeAncestor(vim, v, ancestor) {
    return vim.a.parent === v.parent ? vim.a : ancestor;
  }
  d3.layout.cluster = function() {
    var hierarchy = d3.layout.hierarchy().sort(null).value(null), separation = d3_layout_treeSeparation, size = [ 1, 1 ], nodeSize = false;
    function cluster(d, i) {
      var nodes = hierarchy.call(this, d, i), root = nodes[0], previousNode, x = 0;
      d3_layout_hierarchyVisitAfter(root, function(node) {
        var children = node.children;
        if (children && children.length) {
          node.x = d3_layout_clusterX(children);
          node.y = d3_layout_clusterY(children);
        } else {
          node.x = previousNode ? x += separation(node, previousNode) : 0;
          node.y = 0;
          previousNode = node;
        }
      });
      var left = d3_layout_clusterLeft(root), right = d3_layout_clusterRight(root), x0 = left.x - separation(left, right) / 2, x1 = right.x + separation(right, left) / 2;
      d3_layout_hierarchyVisitAfter(root, nodeSize ? function(node) {
        node.x = (node.x - root.x) * size[0];
        node.y = (root.y - node.y) * size[1];
      } : function(node) {
        node.x = (node.x - x0) / (x1 - x0) * size[0];
        node.y = (1 - (root.y ? node.y / root.y : 1)) * size[1];
      });
      return nodes;
    }
    cluster.separation = function(x) {
      if (!arguments.length) return separation;
      separation = x;
      return cluster;
    };
    cluster.size = function(x) {
      if (!arguments.length) return nodeSize ? null : size;
      nodeSize = (size = x) == null;
      return cluster;
    };
    cluster.nodeSize = function(x) {
      if (!arguments.length) return nodeSize ? size : null;
      nodeSize = (size = x) != null;
      return cluster;
    };
    return d3_layout_hierarchyRebind(cluster, hierarchy);
  };
  function d3_layout_clusterY(children) {
    return 1 + d3.max(children, function(child) {
      return child.y;
    });
  }
  function d3_layout_clusterX(children) {
    return children.reduce(function(x, child) {
      return x + child.x;
    }, 0) / children.length;
  }
  function d3_layout_clusterLeft(node) {
    var children = node.children;
    return children && children.length ? d3_layout_clusterLeft(children[0]) : node;
  }
  function d3_layout_clusterRight(node) {
    var children = node.children, n;
    return children && (n = children.length) ? d3_layout_clusterRight(children[n - 1]) : node;
  }
  d3.layout.treemap = function() {
    var hierarchy = d3.layout.hierarchy(), round = Math.round, size = [ 1, 1 ], padding = null, pad = d3_layout_treemapPadNull, sticky = false, stickies, mode = "squarify", ratio = .5 * (1 + Math.sqrt(5));
    function scale(children, k) {
      var i = -1, n = children.length, child, area;
      while (++i < n) {
        area = (child = children[i]).value * (k < 0 ? 0 : k);
        child.area = isNaN(area) || area <= 0 ? 0 : area;
      }
    }
    function squarify(node) {
      var children = node.children;
      if (children && children.length) {
        var rect = pad(node), row = [], remaining = children.slice(), child, best = Infinity, score, u = mode === "slice" ? rect.dx : mode === "dice" ? rect.dy : mode === "slice-dice" ? node.depth & 1 ? rect.dy : rect.dx : Math.min(rect.dx, rect.dy), n;
        scale(remaining, rect.dx * rect.dy / node.value);
        row.area = 0;
        while ((n = remaining.length) > 0) {
          row.push(child = remaining[n - 1]);
          row.area += child.area;
          if (mode !== "squarify" || (score = worst(row, u)) <= best) {
            remaining.pop();
            best = score;
          } else {
            row.area -= row.pop().area;
            position(row, u, rect, false);
            u = Math.min(rect.dx, rect.dy);
            row.length = row.area = 0;
            best = Infinity;
          }
        }
        if (row.length) {
          position(row, u, rect, true);
          row.length = row.area = 0;
        }
        children.forEach(squarify);
      }
    }
    function stickify(node) {
      var children = node.children;
      if (children && children.length) {
        var rect = pad(node), remaining = children.slice(), child, row = [];
        scale(remaining, rect.dx * rect.dy / node.value);
        row.area = 0;
        while (child = remaining.pop()) {
          row.push(child);
          row.area += child.area;
          if (child.z != null) {
            position(row, child.z ? rect.dx : rect.dy, rect, !remaining.length);
            row.length = row.area = 0;
          }
        }
        children.forEach(stickify);
      }
    }
    function worst(row, u) {
      var s = row.area, r, rmax = 0, rmin = Infinity, i = -1, n = row.length;
      while (++i < n) {
        if (!(r = row[i].area)) continue;
        if (r < rmin) rmin = r;
        if (r > rmax) rmax = r;
      }
      s *= s;
      u *= u;
      return s ? Math.max(u * rmax * ratio / s, s / (u * rmin * ratio)) : Infinity;
    }
    function position(row, u, rect, flush) {
      var i = -1, n = row.length, x = rect.x, y = rect.y, v = u ? round(row.area / u) : 0, o;
      if (u == rect.dx) {
        if (flush || v > rect.dy) v = rect.dy;
        while (++i < n) {
          o = row[i];
          o.x = x;
          o.y = y;
          o.dy = v;
          x += o.dx = Math.min(rect.x + rect.dx - x, v ? round(o.area / v) : 0);
        }
        o.z = true;
        o.dx += rect.x + rect.dx - x;
        rect.y += v;
        rect.dy -= v;
      } else {
        if (flush || v > rect.dx) v = rect.dx;
        while (++i < n) {
          o = row[i];
          o.x = x;
          o.y = y;
          o.dx = v;
          y += o.dy = Math.min(rect.y + rect.dy - y, v ? round(o.area / v) : 0);
        }
        o.z = false;
        o.dy += rect.y + rect.dy - y;
        rect.x += v;
        rect.dx -= v;
      }
    }
    function treemap(d) {
      var nodes = stickies || hierarchy(d), root = nodes[0];
      root.x = 0;
      root.y = 0;
      root.dx = size[0];
      root.dy = size[1];
      if (stickies) hierarchy.revalue(root);
      scale([ root ], root.dx * root.dy / root.value);
      (stickies ? stickify : squarify)(root);
      if (sticky) stickies = nodes;
      return nodes;
    }
    treemap.size = function(x) {
      if (!arguments.length) return size;
      size = x;
      return treemap;
    };
    treemap.padding = function(x) {
      if (!arguments.length) return padding;
      function padFunction(node) {
        var p = x.call(treemap, node, node.depth);
        return p == null ? d3_layout_treemapPadNull(node) : d3_layout_treemapPad(node, typeof p === "number" ? [ p, p, p, p ] : p);
      }
      function padConstant(node) {
        return d3_layout_treemapPad(node, x);
      }
      var type;
      pad = (padding = x) == null ? d3_layout_treemapPadNull : (type = typeof x) === "function" ? padFunction : type === "number" ? (x = [ x, x, x, x ], 
      padConstant) : padConstant;
      return treemap;
    };
    treemap.round = function(x) {
      if (!arguments.length) return round != Number;
      round = x ? Math.round : Number;
      return treemap;
    };
    treemap.sticky = function(x) {
      if (!arguments.length) return sticky;
      sticky = x;
      stickies = null;
      return treemap;
    };
    treemap.ratio = function(x) {
      if (!arguments.length) return ratio;
      ratio = x;
      return treemap;
    };
    treemap.mode = function(x) {
      if (!arguments.length) return mode;
      mode = x + "";
      return treemap;
    };
    return d3_layout_hierarchyRebind(treemap, hierarchy);
  };
  function d3_layout_treemapPadNull(node) {
    return {
      x: node.x,
      y: node.y,
      dx: node.dx,
      dy: node.dy
    };
  }
  function d3_layout_treemapPad(node, padding) {
    var x = node.x + padding[3], y = node.y + padding[0], dx = node.dx - padding[1] - padding[3], dy = node.dy - padding[0] - padding[2];
    if (dx < 0) {
      x += dx / 2;
      dx = 0;
    }
    if (dy < 0) {
      y += dy / 2;
      dy = 0;
    }
    return {
      x: x,
      y: y,
      dx: dx,
      dy: dy
    };
  }
  d3.random = {
    normal: function(µ, σ) {
      var n = arguments.length;
      if (n < 2) σ = 1;
      if (n < 1) µ = 0;
      return function() {
        var x, y, r;
        do {
          x = Math.random() * 2 - 1;
          y = Math.random() * 2 - 1;
          r = x * x + y * y;
        } while (!r || r > 1);
        return µ + σ * x * Math.sqrt(-2 * Math.log(r) / r);
      };
    },
    logNormal: function() {
      var random = d3.random.normal.apply(d3, arguments);
      return function() {
        return Math.exp(random());
      };
    },
    bates: function(m) {
      var random = d3.random.irwinHall(m);
      return function() {
        return random() / m;
      };
    },
    irwinHall: function(m) {
      return function() {
        for (var s = 0, j = 0; j < m; j++) s += Math.random();
        return s;
      };
    }
  };
  d3.scale = {};
  function d3_scaleExtent(domain) {
    var start = domain[0], stop = domain[domain.length - 1];
    return start < stop ? [ start, stop ] : [ stop, start ];
  }
  function d3_scaleRange(scale) {
    return scale.rangeExtent ? scale.rangeExtent() : d3_scaleExtent(scale.range());
  }
  function d3_scale_bilinear(domain, range, uninterpolate, interpolate) {
    var u = uninterpolate(domain[0], domain[1]), i = interpolate(range[0], range[1]);
    return function(x) {
      return i(u(x));
    };
  }
  function d3_scale_nice(domain, nice) {
    var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], dx;
    if (x1 < x0) {
      dx = i0, i0 = i1, i1 = dx;
      dx = x0, x0 = x1, x1 = dx;
    }
    domain[i0] = nice.floor(x0);
    domain[i1] = nice.ceil(x1);
    return domain;
  }
  function d3_scale_niceStep(step) {
    return step ? {
      floor: function(x) {
        return Math.floor(x / step) * step;
      },
      ceil: function(x) {
        return Math.ceil(x / step) * step;
      }
    } : d3_scale_niceIdentity;
  }
  var d3_scale_niceIdentity = {
    floor: d3_identity,
    ceil: d3_identity
  };
  function d3_scale_polylinear(domain, range, uninterpolate, interpolate) {
    var u = [], i = [], j = 0, k = Math.min(domain.length, range.length) - 1;
    if (domain[k] < domain[0]) {
      domain = domain.slice().reverse();
      range = range.slice().reverse();
    }
    while (++j <= k) {
      u.push(uninterpolate(domain[j - 1], domain[j]));
      i.push(interpolate(range[j - 1], range[j]));
    }
    return function(x) {
      var j = d3.bisect(domain, x, 1, k) - 1;
      return i[j](u[j](x));
    };
  }
  d3.scale.linear = function() {
    return d3_scale_linear([ 0, 1 ], [ 0, 1 ], d3_interpolate, false);
  };
  function d3_scale_linear(domain, range, interpolate, clamp) {
    var output, input;
    function rescale() {
      var linear = Math.min(domain.length, range.length) > 2 ? d3_scale_polylinear : d3_scale_bilinear, uninterpolate = clamp ? d3_uninterpolateClamp : d3_uninterpolateNumber;
      output = linear(domain, range, uninterpolate, interpolate);
      input = linear(range, domain, uninterpolate, d3_interpolate);
      return scale;
    }
    function scale(x) {
      return output(x);
    }
    scale.invert = function(y) {
      return input(y);
    };
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = x.map(Number);
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.rangeRound = function(x) {
      return scale.range(x).interpolate(d3_interpolateRound);
    };
    scale.clamp = function(x) {
      if (!arguments.length) return clamp;
      clamp = x;
      return rescale();
    };
    scale.interpolate = function(x) {
      if (!arguments.length) return interpolate;
      interpolate = x;
      return rescale();
    };
    scale.ticks = function(m) {
      return d3_scale_linearTicks(domain, m);
    };
    scale.tickFormat = function(m, format) {
      return d3_scale_linearTickFormat(domain, m, format);
    };
    scale.nice = function(m) {
      d3_scale_linearNice(domain, m);
      return rescale();
    };
    scale.copy = function() {
      return d3_scale_linear(domain, range, interpolate, clamp);
    };
    return rescale();
  }
  function d3_scale_linearRebind(scale, linear) {
    return d3.rebind(scale, linear, "range", "rangeRound", "interpolate", "clamp");
  }
  function d3_scale_linearNice(domain, m) {
    return d3_scale_nice(domain, d3_scale_niceStep(d3_scale_linearTickRange(domain, m)[2]));
  }
  function d3_scale_linearTickRange(domain, m) {
    if (m == null) m = 10;
    var extent = d3_scaleExtent(domain), span = extent[1] - extent[0], step = Math.pow(10, Math.floor(Math.log(span / m) / Math.LN10)), err = m / span * step;
    if (err <= .15) step *= 10; else if (err <= .35) step *= 5; else if (err <= .75) step *= 2;
    extent[0] = Math.ceil(extent[0] / step) * step;
    extent[1] = Math.floor(extent[1] / step) * step + step * .5;
    extent[2] = step;
    return extent;
  }
  function d3_scale_linearTicks(domain, m) {
    return d3.range.apply(d3, d3_scale_linearTickRange(domain, m));
  }
  function d3_scale_linearTickFormat(domain, m, format) {
    var range = d3_scale_linearTickRange(domain, m);
    if (format) {
      var match = d3_format_re.exec(format);
      match.shift();
      if (match[8] === "s") {
        var prefix = d3.formatPrefix(Math.max(abs(range[0]), abs(range[1])));
        if (!match[7]) match[7] = "." + d3_scale_linearPrecision(prefix.scale(range[2]));
        match[8] = "f";
        format = d3.format(match.join(""));
        return function(d) {
          return format(prefix.scale(d)) + prefix.symbol;
        };
      }
      if (!match[7]) match[7] = "." + d3_scale_linearFormatPrecision(match[8], range);
      format = match.join("");
    } else {
      format = ",." + d3_scale_linearPrecision(range[2]) + "f";
    }
    return d3.format(format);
  }
  var d3_scale_linearFormatSignificant = {
    s: 1,
    g: 1,
    p: 1,
    r: 1,
    e: 1
  };
  function d3_scale_linearPrecision(value) {
    return -Math.floor(Math.log(value) / Math.LN10 + .01);
  }
  function d3_scale_linearFormatPrecision(type, range) {
    var p = d3_scale_linearPrecision(range[2]);
    return type in d3_scale_linearFormatSignificant ? Math.abs(p - d3_scale_linearPrecision(Math.max(abs(range[0]), abs(range[1])))) + +(type !== "e") : p - (type === "%") * 2;
  }
  d3.scale.log = function() {
    return d3_scale_log(d3.scale.linear().domain([ 0, 1 ]), 10, true, [ 1, 10 ]);
  };
  function d3_scale_log(linear, base, positive, domain) {
    function log(x) {
      return (positive ? Math.log(x < 0 ? 0 : x) : -Math.log(x > 0 ? 0 : -x)) / Math.log(base);
    }
    function pow(x) {
      return positive ? Math.pow(base, x) : -Math.pow(base, -x);
    }
    function scale(x) {
      return linear(log(x));
    }
    scale.invert = function(x) {
      return pow(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      positive = x[0] >= 0;
      linear.domain((domain = x.map(Number)).map(log));
      return scale;
    };
    scale.base = function(_) {
      if (!arguments.length) return base;
      base = +_;
      linear.domain(domain.map(log));
      return scale;
    };
    scale.nice = function() {
      var niced = d3_scale_nice(domain.map(log), positive ? Math : d3_scale_logNiceNegative);
      linear.domain(niced);
      domain = niced.map(pow);
      return scale;
    };
    scale.ticks = function() {
      var extent = d3_scaleExtent(domain), ticks = [], u = extent[0], v = extent[1], i = Math.floor(log(u)), j = Math.ceil(log(v)), n = base % 1 ? 2 : base;
      if (isFinite(j - i)) {
        if (positive) {
          for (;i < j; i++) for (var k = 1; k < n; k++) ticks.push(pow(i) * k);
          ticks.push(pow(i));
        } else {
          ticks.push(pow(i));
          for (;i++ < j; ) for (var k = n - 1; k > 0; k--) ticks.push(pow(i) * k);
        }
        for (i = 0; ticks[i] < u; i++) {}
        for (j = ticks.length; ticks[j - 1] > v; j--) {}
        ticks = ticks.slice(i, j);
      }
      return ticks;
    };
    scale.tickFormat = function(n, format) {
      if (!arguments.length) return d3_scale_logFormat;
      if (arguments.length < 2) format = d3_scale_logFormat; else if (typeof format !== "function") format = d3.format(format);
      var k = Math.max(.1, n / scale.ticks().length), f = positive ? (e = 1e-12, Math.ceil) : (e = -1e-12, 
      Math.floor), e;
      return function(d) {
        return d / pow(f(log(d) + e)) <= k ? format(d) : "";
      };
    };
    scale.copy = function() {
      return d3_scale_log(linear.copy(), base, positive, domain);
    };
    return d3_scale_linearRebind(scale, linear);
  }
  var d3_scale_logFormat = d3.format(".0e"), d3_scale_logNiceNegative = {
    floor: function(x) {
      return -Math.ceil(-x);
    },
    ceil: function(x) {
      return -Math.floor(-x);
    }
  };
  d3.scale.pow = function() {
    return d3_scale_pow(d3.scale.linear(), 1, [ 0, 1 ]);
  };
  function d3_scale_pow(linear, exponent, domain) {
    var powp = d3_scale_powPow(exponent), powb = d3_scale_powPow(1 / exponent);
    function scale(x) {
      return linear(powp(x));
    }
    scale.invert = function(x) {
      return powb(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      linear.domain((domain = x.map(Number)).map(powp));
      return scale;
    };
    scale.ticks = function(m) {
      return d3_scale_linearTicks(domain, m);
    };
    scale.tickFormat = function(m, format) {
      return d3_scale_linearTickFormat(domain, m, format);
    };
    scale.nice = function(m) {
      return scale.domain(d3_scale_linearNice(domain, m));
    };
    scale.exponent = function(x) {
      if (!arguments.length) return exponent;
      powp = d3_scale_powPow(exponent = x);
      powb = d3_scale_powPow(1 / exponent);
      linear.domain(domain.map(powp));
      return scale;
    };
    scale.copy = function() {
      return d3_scale_pow(linear.copy(), exponent, domain);
    };
    return d3_scale_linearRebind(scale, linear);
  }
  function d3_scale_powPow(e) {
    return function(x) {
      return x < 0 ? -Math.pow(-x, e) : Math.pow(x, e);
    };
  }
  d3.scale.sqrt = function() {
    return d3.scale.pow().exponent(.5);
  };
  d3.scale.ordinal = function() {
    return d3_scale_ordinal([], {
      t: "range",
      a: [ [] ]
    });
  };
  function d3_scale_ordinal(domain, ranger) {
    var index, range, rangeBand;
    function scale(x) {
      return range[((index.get(x) || (ranger.t === "range" ? index.set(x, domain.push(x)) : NaN)) - 1) % range.length];
    }
    function steps(start, step) {
      return d3.range(domain.length).map(function(i) {
        return start + step * i;
      });
    }
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = [];
      index = new d3_Map();
      var i = -1, n = x.length, xi;
      while (++i < n) if (!index.has(xi = x[i])) index.set(xi, domain.push(xi));
      return scale[ranger.t].apply(scale, ranger.a);
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      rangeBand = 0;
      ranger = {
        t: "range",
        a: arguments
      };
      return scale;
    };
    scale.rangePoints = function(x, padding) {
      if (arguments.length < 2) padding = 0;
      var start = x[0], stop = x[1], step = (stop - start) / (Math.max(1, domain.length - 1) + padding);
      range = steps(domain.length < 2 ? (start + stop) / 2 : start + step * padding / 2, step);
      rangeBand = 0;
      ranger = {
        t: "rangePoints",
        a: arguments
      };
      return scale;
    };
    scale.rangeBands = function(x, padding, outerPadding) {
      if (arguments.length < 2) padding = 0;
      if (arguments.length < 3) outerPadding = padding;
      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = (stop - start) / (domain.length - padding + 2 * outerPadding);
      range = steps(start + step * outerPadding, step);
      if (reverse) range.reverse();
      rangeBand = step * (1 - padding);
      ranger = {
        t: "rangeBands",
        a: arguments
      };
      return scale;
    };
    scale.rangeRoundBands = function(x, padding, outerPadding) {
      if (arguments.length < 2) padding = 0;
      if (arguments.length < 3) outerPadding = padding;
      var reverse = x[1] < x[0], start = x[reverse - 0], stop = x[1 - reverse], step = Math.floor((stop - start) / (domain.length - padding + 2 * outerPadding)), error = stop - start - (domain.length - padding) * step;
      range = steps(start + Math.round(error / 2), step);
      if (reverse) range.reverse();
      rangeBand = Math.round(step * (1 - padding));
      ranger = {
        t: "rangeRoundBands",
        a: arguments
      };
      return scale;
    };
    scale.rangeBand = function() {
      return rangeBand;
    };
    scale.rangeExtent = function() {
      return d3_scaleExtent(ranger.a[0]);
    };
    scale.copy = function() {
      return d3_scale_ordinal(domain, ranger);
    };
    return scale.domain(domain);
  }
  d3.scale.category10 = function() {
    return d3.scale.ordinal().range(d3_category10);
  };
  d3.scale.category20 = function() {
    return d3.scale.ordinal().range(d3_category20);
  };
  d3.scale.category20b = function() {
    return d3.scale.ordinal().range(d3_category20b);
  };
  d3.scale.category20c = function() {
    return d3.scale.ordinal().range(d3_category20c);
  };
  var d3_category10 = [ 2062260, 16744206, 2924588, 14034728, 9725885, 9197131, 14907330, 8355711, 12369186, 1556175 ].map(d3_rgbString);
  var d3_category20 = [ 2062260, 11454440, 16744206, 16759672, 2924588, 10018698, 14034728, 16750742, 9725885, 12955861, 9197131, 12885140, 14907330, 16234194, 8355711, 13092807, 12369186, 14408589, 1556175, 10410725 ].map(d3_rgbString);
  var d3_category20b = [ 3750777, 5395619, 7040719, 10264286, 6519097, 9216594, 11915115, 13556636, 9202993, 12426809, 15186514, 15190932, 8666169, 11356490, 14049643, 15177372, 8077683, 10834324, 13528509, 14589654 ].map(d3_rgbString);
  var d3_category20c = [ 3244733, 7057110, 10406625, 13032431, 15095053, 16616764, 16625259, 16634018, 3253076, 7652470, 10607003, 13101504, 7695281, 10394312, 12369372, 14342891, 6513507, 9868950, 12434877, 14277081 ].map(d3_rgbString);
  d3.scale.quantile = function() {
    return d3_scale_quantile([], []);
  };
  function d3_scale_quantile(domain, range) {
    var thresholds;
    function rescale() {
      var k = 0, q = range.length;
      thresholds = [];
      while (++k < q) thresholds[k - 1] = d3.quantile(domain, k / q);
      return scale;
    }
    function scale(x) {
      if (!isNaN(x = +x)) return range[d3.bisect(thresholds, x)];
    }
    scale.domain = function(x) {
      if (!arguments.length) return domain;
      domain = x.filter(d3_number).sort(d3_ascending);
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.quantiles = function() {
      return thresholds;
    };
    scale.invertExtent = function(y) {
      y = range.indexOf(y);
      return y < 0 ? [ NaN, NaN ] : [ y > 0 ? thresholds[y - 1] : domain[0], y < thresholds.length ? thresholds[y] : domain[domain.length - 1] ];
    };
    scale.copy = function() {
      return d3_scale_quantile(domain, range);
    };
    return rescale();
  }
  d3.scale.quantize = function() {
    return d3_scale_quantize(0, 1, [ 0, 1 ]);
  };
  function d3_scale_quantize(x0, x1, range) {
    var kx, i;
    function scale(x) {
      return range[Math.max(0, Math.min(i, Math.floor(kx * (x - x0))))];
    }
    function rescale() {
      kx = range.length / (x1 - x0);
      i = range.length - 1;
      return scale;
    }
    scale.domain = function(x) {
      if (!arguments.length) return [ x0, x1 ];
      x0 = +x[0];
      x1 = +x[x.length - 1];
      return rescale();
    };
    scale.range = function(x) {
      if (!arguments.length) return range;
      range = x;
      return rescale();
    };
    scale.invertExtent = function(y) {
      y = range.indexOf(y);
      y = y < 0 ? NaN : y / kx + x0;
      return [ y, y + 1 / kx ];
    };
    scale.copy = function() {
      return d3_scale_quantize(x0, x1, range);
    };
    return rescale();
  }
  d3.scale.threshold = function() {
    return d3_scale_threshold([ .5 ], [ 0, 1 ]);
  };
  function d3_scale_threshold(domain, range) {
    function scale(x) {
      if (x <= x) return range[d3.bisect(domain, x)];
    }
    scale.domain = function(_) {
      if (!arguments.length) return domain;
      domain = _;
      return scale;
    };
    scale.range = function(_) {
      if (!arguments.length) return range;
      range = _;
      return scale;
    };
    scale.invertExtent = function(y) {
      y = range.indexOf(y);
      return [ domain[y - 1], domain[y] ];
    };
    scale.copy = function() {
      return d3_scale_threshold(domain, range);
    };
    return scale;
  }
  d3.scale.identity = function() {
    return d3_scale_identity([ 0, 1 ]);
  };
  function d3_scale_identity(domain) {
    function identity(x) {
      return +x;
    }
    identity.invert = identity;
    identity.domain = identity.range = function(x) {
      if (!arguments.length) return domain;
      domain = x.map(identity);
      return identity;
    };
    identity.ticks = function(m) {
      return d3_scale_linearTicks(domain, m);
    };
    identity.tickFormat = function(m, format) {
      return d3_scale_linearTickFormat(domain, m, format);
    };
    identity.copy = function() {
      return d3_scale_identity(domain);
    };
    return identity;
  }
  d3.svg = {};
  d3.svg.arc = function() {
    var innerRadius = d3_svg_arcInnerRadius, outerRadius = d3_svg_arcOuterRadius, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;
    function arc() {
      var r0 = innerRadius.apply(this, arguments), r1 = outerRadius.apply(this, arguments), a0 = startAngle.apply(this, arguments) + d3_svg_arcOffset, a1 = endAngle.apply(this, arguments) + d3_svg_arcOffset, da = (a1 < a0 && (da = a0, 
      a0 = a1, a1 = da), a1 - a0), df = da < π ? "0" : "1", c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      return da >= d3_svg_arcMax ? r0 ? "M0," + r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + -r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + r1 + "M0," + r0 + "A" + r0 + "," + r0 + " 0 1,0 0," + -r0 + "A" + r0 + "," + r0 + " 0 1,0 0," + r0 + "Z" : "M0," + r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + -r1 + "A" + r1 + "," + r1 + " 0 1,1 0," + r1 + "Z" : r0 ? "M" + r1 * c0 + "," + r1 * s0 + "A" + r1 + "," + r1 + " 0 " + df + ",1 " + r1 * c1 + "," + r1 * s1 + "L" + r0 * c1 + "," + r0 * s1 + "A" + r0 + "," + r0 + " 0 " + df + ",0 " + r0 * c0 + "," + r0 * s0 + "Z" : "M" + r1 * c0 + "," + r1 * s0 + "A" + r1 + "," + r1 + " 0 " + df + ",1 " + r1 * c1 + "," + r1 * s1 + "L0,0" + "Z";
    }
    arc.innerRadius = function(v) {
      if (!arguments.length) return innerRadius;
      innerRadius = d3_functor(v);
      return arc;
    };
    arc.outerRadius = function(v) {
      if (!arguments.length) return outerRadius;
      outerRadius = d3_functor(v);
      return arc;
    };
    arc.startAngle = function(v) {
      if (!arguments.length) return startAngle;
      startAngle = d3_functor(v);
      return arc;
    };
    arc.endAngle = function(v) {
      if (!arguments.length) return endAngle;
      endAngle = d3_functor(v);
      return arc;
    };
    arc.centroid = function() {
      var r = (innerRadius.apply(this, arguments) + outerRadius.apply(this, arguments)) / 2, a = (startAngle.apply(this, arguments) + endAngle.apply(this, arguments)) / 2 + d3_svg_arcOffset;
      return [ Math.cos(a) * r, Math.sin(a) * r ];
    };
    return arc;
  };
  var d3_svg_arcOffset = -halfπ, d3_svg_arcMax = τ - ε;
  function d3_svg_arcInnerRadius(d) {
    return d.innerRadius;
  }
  function d3_svg_arcOuterRadius(d) {
    return d.outerRadius;
  }
  function d3_svg_arcStartAngle(d) {
    return d.startAngle;
  }
  function d3_svg_arcEndAngle(d) {
    return d.endAngle;
  }
  function d3_svg_line(projection) {
    var x = d3_geom_pointX, y = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, tension = .7;
    function line(data) {
      var segments = [], points = [], i = -1, n = data.length, d, fx = d3_functor(x), fy = d3_functor(y);
      function segment() {
        segments.push("M", interpolate(projection(points), tension));
      }
      while (++i < n) {
        if (defined.call(this, d = data[i], i)) {
          points.push([ +fx.call(this, d, i), +fy.call(this, d, i) ]);
        } else if (points.length) {
          segment();
          points = [];
        }
      }
      if (points.length) segment();
      return segments.length ? segments.join("") : null;
    }
    line.x = function(_) {
      if (!arguments.length) return x;
      x = _;
      return line;
    };
    line.y = function(_) {
      if (!arguments.length) return y;
      y = _;
      return line;
    };
    line.defined = function(_) {
      if (!arguments.length) return defined;
      defined = _;
      return line;
    };
    line.interpolate = function(_) {
      if (!arguments.length) return interpolateKey;
      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
      return line;
    };
    line.tension = function(_) {
      if (!arguments.length) return tension;
      tension = _;
      return line;
    };
    return line;
  }
  d3.svg.line = function() {
    return d3_svg_line(d3_identity);
  };
  var d3_svg_lineInterpolators = d3.map({
    linear: d3_svg_lineLinear,
    "linear-closed": d3_svg_lineLinearClosed,
    step: d3_svg_lineStep,
    "step-before": d3_svg_lineStepBefore,
    "step-after": d3_svg_lineStepAfter,
    basis: d3_svg_lineBasis,
    "basis-open": d3_svg_lineBasisOpen,
    "basis-closed": d3_svg_lineBasisClosed,
    bundle: d3_svg_lineBundle,
    cardinal: d3_svg_lineCardinal,
    "cardinal-open": d3_svg_lineCardinalOpen,
    "cardinal-closed": d3_svg_lineCardinalClosed,
    monotone: d3_svg_lineMonotone
  });
  d3_svg_lineInterpolators.forEach(function(key, value) {
    value.key = key;
    value.closed = /-closed$/.test(key);
  });
  function d3_svg_lineLinear(points) {
    return points.join("L");
  }
  function d3_svg_lineLinearClosed(points) {
    return d3_svg_lineLinear(points) + "Z";
  }
  function d3_svg_lineStep(points) {
    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
    while (++i < n) path.push("H", (p[0] + (p = points[i])[0]) / 2, "V", p[1]);
    if (n > 1) path.push("H", p[0]);
    return path.join("");
  }
  function d3_svg_lineStepBefore(points) {
    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
    while (++i < n) path.push("V", (p = points[i])[1], "H", p[0]);
    return path.join("");
  }
  function d3_svg_lineStepAfter(points) {
    var i = 0, n = points.length, p = points[0], path = [ p[0], ",", p[1] ];
    while (++i < n) path.push("H", (p = points[i])[0], "V", p[1]);
    return path.join("");
  }
  function d3_svg_lineCardinalOpen(points, tension) {
    return points.length < 4 ? d3_svg_lineLinear(points) : points[1] + d3_svg_lineHermite(points.slice(1, points.length - 1), d3_svg_lineCardinalTangents(points, tension));
  }
  function d3_svg_lineCardinalClosed(points, tension) {
    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite((points.push(points[0]), 
    points), d3_svg_lineCardinalTangents([ points[points.length - 2] ].concat(points, [ points[1] ]), tension));
  }
  function d3_svg_lineCardinal(points, tension) {
    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineCardinalTangents(points, tension));
  }
  function d3_svg_lineHermite(points, tangents) {
    if (tangents.length < 1 || points.length != tangents.length && points.length != tangents.length + 2) {
      return d3_svg_lineLinear(points);
    }
    var quad = points.length != tangents.length, path = "", p0 = points[0], p = points[1], t0 = tangents[0], t = t0, pi = 1;
    if (quad) {
      path += "Q" + (p[0] - t0[0] * 2 / 3) + "," + (p[1] - t0[1] * 2 / 3) + "," + p[0] + "," + p[1];
      p0 = points[1];
      pi = 2;
    }
    if (tangents.length > 1) {
      t = tangents[1];
      p = points[pi];
      pi++;
      path += "C" + (p0[0] + t0[0]) + "," + (p0[1] + t0[1]) + "," + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
      for (var i = 2; i < tangents.length; i++, pi++) {
        p = points[pi];
        t = tangents[i];
        path += "S" + (p[0] - t[0]) + "," + (p[1] - t[1]) + "," + p[0] + "," + p[1];
      }
    }
    if (quad) {
      var lp = points[pi];
      path += "Q" + (p[0] + t[0] * 2 / 3) + "," + (p[1] + t[1] * 2 / 3) + "," + lp[0] + "," + lp[1];
    }
    return path;
  }
  function d3_svg_lineCardinalTangents(points, tension) {
    var tangents = [], a = (1 - tension) / 2, p0, p1 = points[0], p2 = points[1], i = 1, n = points.length;
    while (++i < n) {
      p0 = p1;
      p1 = p2;
      p2 = points[i];
      tangents.push([ a * (p2[0] - p0[0]), a * (p2[1] - p0[1]) ]);
    }
    return tangents;
  }
  function d3_svg_lineBasis(points) {
    if (points.length < 3) return d3_svg_lineLinear(points);
    var i = 1, n = points.length, pi = points[0], x0 = pi[0], y0 = pi[1], px = [ x0, x0, x0, (pi = points[1])[0] ], py = [ y0, y0, y0, pi[1] ], path = [ x0, ",", y0, "L", d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py) ];
    points.push(points[n - 1]);
    while (++i <= n) {
      pi = points[i];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    points.pop();
    path.push("L", pi);
    return path.join("");
  }
  function d3_svg_lineBasisOpen(points) {
    if (points.length < 4) return d3_svg_lineLinear(points);
    var path = [], i = -1, n = points.length, pi, px = [ 0 ], py = [ 0 ];
    while (++i < 3) {
      pi = points[i];
      px.push(pi[0]);
      py.push(pi[1]);
    }
    path.push(d3_svg_lineDot4(d3_svg_lineBasisBezier3, px) + "," + d3_svg_lineDot4(d3_svg_lineBasisBezier3, py));
    --i;
    while (++i < n) {
      pi = points[i];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    return path.join("");
  }
  function d3_svg_lineBasisClosed(points) {
    var path, i = -1, n = points.length, m = n + 4, pi, px = [], py = [];
    while (++i < 4) {
      pi = points[i % n];
      px.push(pi[0]);
      py.push(pi[1]);
    }
    path = [ d3_svg_lineDot4(d3_svg_lineBasisBezier3, px), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, py) ];
    --i;
    while (++i < m) {
      pi = points[i % n];
      px.shift();
      px.push(pi[0]);
      py.shift();
      py.push(pi[1]);
      d3_svg_lineBasisBezier(path, px, py);
    }
    return path.join("");
  }
  function d3_svg_lineBundle(points, tension) {
    var n = points.length - 1;
    if (n) {
      var x0 = points[0][0], y0 = points[0][1], dx = points[n][0] - x0, dy = points[n][1] - y0, i = -1, p, t;
      while (++i <= n) {
        p = points[i];
        t = i / n;
        p[0] = tension * p[0] + (1 - tension) * (x0 + t * dx);
        p[1] = tension * p[1] + (1 - tension) * (y0 + t * dy);
      }
    }
    return d3_svg_lineBasis(points);
  }
  function d3_svg_lineDot4(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  }
  var d3_svg_lineBasisBezier1 = [ 0, 2 / 3, 1 / 3, 0 ], d3_svg_lineBasisBezier2 = [ 0, 1 / 3, 2 / 3, 0 ], d3_svg_lineBasisBezier3 = [ 0, 1 / 6, 2 / 3, 1 / 6 ];
  function d3_svg_lineBasisBezier(path, x, y) {
    path.push("C", d3_svg_lineDot4(d3_svg_lineBasisBezier1, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier1, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier2, y), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, x), ",", d3_svg_lineDot4(d3_svg_lineBasisBezier3, y));
  }
  function d3_svg_lineSlope(p0, p1) {
    return (p1[1] - p0[1]) / (p1[0] - p0[0]);
  }
  function d3_svg_lineFiniteDifferences(points) {
    var i = 0, j = points.length - 1, m = [], p0 = points[0], p1 = points[1], d = m[0] = d3_svg_lineSlope(p0, p1);
    while (++i < j) {
      m[i] = (d + (d = d3_svg_lineSlope(p0 = p1, p1 = points[i + 1]))) / 2;
    }
    m[i] = d;
    return m;
  }
  function d3_svg_lineMonotoneTangents(points) {
    var tangents = [], d, a, b, s, m = d3_svg_lineFiniteDifferences(points), i = -1, j = points.length - 1;
    while (++i < j) {
      d = d3_svg_lineSlope(points[i], points[i + 1]);
      if (abs(d) < ε) {
        m[i] = m[i + 1] = 0;
      } else {
        a = m[i] / d;
        b = m[i + 1] / d;
        s = a * a + b * b;
        if (s > 9) {
          s = d * 3 / Math.sqrt(s);
          m[i] = s * a;
          m[i + 1] = s * b;
        }
      }
    }
    i = -1;
    while (++i <= j) {
      s = (points[Math.min(j, i + 1)][0] - points[Math.max(0, i - 1)][0]) / (6 * (1 + m[i] * m[i]));
      tangents.push([ s || 0, m[i] * s || 0 ]);
    }
    return tangents;
  }
  function d3_svg_lineMonotone(points) {
    return points.length < 3 ? d3_svg_lineLinear(points) : points[0] + d3_svg_lineHermite(points, d3_svg_lineMonotoneTangents(points));
  }
  d3.svg.line.radial = function() {
    var line = d3_svg_line(d3_svg_lineRadial);
    line.radius = line.x, delete line.x;
    line.angle = line.y, delete line.y;
    return line;
  };
  function d3_svg_lineRadial(points) {
    var point, i = -1, n = points.length, r, a;
    while (++i < n) {
      point = points[i];
      r = point[0];
      a = point[1] + d3_svg_arcOffset;
      point[0] = r * Math.cos(a);
      point[1] = r * Math.sin(a);
    }
    return points;
  }
  function d3_svg_area(projection) {
    var x0 = d3_geom_pointX, x1 = d3_geom_pointX, y0 = 0, y1 = d3_geom_pointY, defined = d3_true, interpolate = d3_svg_lineLinear, interpolateKey = interpolate.key, interpolateReverse = interpolate, L = "L", tension = .7;
    function area(data) {
      var segments = [], points0 = [], points1 = [], i = -1, n = data.length, d, fx0 = d3_functor(x0), fy0 = d3_functor(y0), fx1 = x0 === x1 ? function() {
        return x;
      } : d3_functor(x1), fy1 = y0 === y1 ? function() {
        return y;
      } : d3_functor(y1), x, y;
      function segment() {
        segments.push("M", interpolate(projection(points1), tension), L, interpolateReverse(projection(points0.reverse()), tension), "Z");
      }
      while (++i < n) {
        if (defined.call(this, d = data[i], i)) {
          points0.push([ x = +fx0.call(this, d, i), y = +fy0.call(this, d, i) ]);
          points1.push([ +fx1.call(this, d, i), +fy1.call(this, d, i) ]);
        } else if (points0.length) {
          segment();
          points0 = [];
          points1 = [];
        }
      }
      if (points0.length) segment();
      return segments.length ? segments.join("") : null;
    }
    area.x = function(_) {
      if (!arguments.length) return x1;
      x0 = x1 = _;
      return area;
    };
    area.x0 = function(_) {
      if (!arguments.length) return x0;
      x0 = _;
      return area;
    };
    area.x1 = function(_) {
      if (!arguments.length) return x1;
      x1 = _;
      return area;
    };
    area.y = function(_) {
      if (!arguments.length) return y1;
      y0 = y1 = _;
      return area;
    };
    area.y0 = function(_) {
      if (!arguments.length) return y0;
      y0 = _;
      return area;
    };
    area.y1 = function(_) {
      if (!arguments.length) return y1;
      y1 = _;
      return area;
    };
    area.defined = function(_) {
      if (!arguments.length) return defined;
      defined = _;
      return area;
    };
    area.interpolate = function(_) {
      if (!arguments.length) return interpolateKey;
      if (typeof _ === "function") interpolateKey = interpolate = _; else interpolateKey = (interpolate = d3_svg_lineInterpolators.get(_) || d3_svg_lineLinear).key;
      interpolateReverse = interpolate.reverse || interpolate;
      L = interpolate.closed ? "M" : "L";
      return area;
    };
    area.tension = function(_) {
      if (!arguments.length) return tension;
      tension = _;
      return area;
    };
    return area;
  }
  d3_svg_lineStepBefore.reverse = d3_svg_lineStepAfter;
  d3_svg_lineStepAfter.reverse = d3_svg_lineStepBefore;
  d3.svg.area = function() {
    return d3_svg_area(d3_identity);
  };
  d3.svg.area.radial = function() {
    var area = d3_svg_area(d3_svg_lineRadial);
    area.radius = area.x, delete area.x;
    area.innerRadius = area.x0, delete area.x0;
    area.outerRadius = area.x1, delete area.x1;
    area.angle = area.y, delete area.y;
    area.startAngle = area.y0, delete area.y0;
    area.endAngle = area.y1, delete area.y1;
    return area;
  };
  d3.svg.chord = function() {
    var source = d3_source, target = d3_target, radius = d3_svg_chordRadius, startAngle = d3_svg_arcStartAngle, endAngle = d3_svg_arcEndAngle;
    function chord(d, i) {
      var s = subgroup(this, source, d, i), t = subgroup(this, target, d, i);
      return "M" + s.p0 + arc(s.r, s.p1, s.a1 - s.a0) + (equals(s, t) ? curve(s.r, s.p1, s.r, s.p0) : curve(s.r, s.p1, t.r, t.p0) + arc(t.r, t.p1, t.a1 - t.a0) + curve(t.r, t.p1, s.r, s.p0)) + "Z";
    }
    function subgroup(self, f, d, i) {
      var subgroup = f.call(self, d, i), r = radius.call(self, subgroup, i), a0 = startAngle.call(self, subgroup, i) + d3_svg_arcOffset, a1 = endAngle.call(self, subgroup, i) + d3_svg_arcOffset;
      return {
        r: r,
        a0: a0,
        a1: a1,
        p0: [ r * Math.cos(a0), r * Math.sin(a0) ],
        p1: [ r * Math.cos(a1), r * Math.sin(a1) ]
      };
    }
    function equals(a, b) {
      return a.a0 == b.a0 && a.a1 == b.a1;
    }
    function arc(r, p, a) {
      return "A" + r + "," + r + " 0 " + +(a > π) + ",1 " + p;
    }
    function curve(r0, p0, r1, p1) {
      return "Q 0,0 " + p1;
    }
    chord.radius = function(v) {
      if (!arguments.length) return radius;
      radius = d3_functor(v);
      return chord;
    };
    chord.source = function(v) {
      if (!arguments.length) return source;
      source = d3_functor(v);
      return chord;
    };
    chord.target = function(v) {
      if (!arguments.length) return target;
      target = d3_functor(v);
      return chord;
    };
    chord.startAngle = function(v) {
      if (!arguments.length) return startAngle;
      startAngle = d3_functor(v);
      return chord;
    };
    chord.endAngle = function(v) {
      if (!arguments.length) return endAngle;
      endAngle = d3_functor(v);
      return chord;
    };
    return chord;
  };
  function d3_svg_chordRadius(d) {
    return d.radius;
  }
  d3.svg.diagonal = function() {
    var source = d3_source, target = d3_target, projection = d3_svg_diagonalProjection;
    function diagonal(d, i) {
      var p0 = source.call(this, d, i), p3 = target.call(this, d, i), m = (p0.y + p3.y) / 2, p = [ p0, {
        x: p0.x,
        y: m
      }, {
        x: p3.x,
        y: m
      }, p3 ];
      p = p.map(projection);
      return "M" + p[0] + "C" + p[1] + " " + p[2] + " " + p[3];
    }
    diagonal.source = function(x) {
      if (!arguments.length) return source;
      source = d3_functor(x);
      return diagonal;
    };
    diagonal.target = function(x) {
      if (!arguments.length) return target;
      target = d3_functor(x);
      return diagonal;
    };
    diagonal.projection = function(x) {
      if (!arguments.length) return projection;
      projection = x;
      return diagonal;
    };
    return diagonal;
  };
  function d3_svg_diagonalProjection(d) {
    return [ d.x, d.y ];
  }
  d3.svg.diagonal.radial = function() {
    var diagonal = d3.svg.diagonal(), projection = d3_svg_diagonalProjection, projection_ = diagonal.projection;
    diagonal.projection = function(x) {
      return arguments.length ? projection_(d3_svg_diagonalRadialProjection(projection = x)) : projection;
    };
    return diagonal;
  };
  function d3_svg_diagonalRadialProjection(projection) {
    return function() {
      var d = projection.apply(this, arguments), r = d[0], a = d[1] + d3_svg_arcOffset;
      return [ r * Math.cos(a), r * Math.sin(a) ];
    };
  }
  d3.svg.symbol = function() {
    var type = d3_svg_symbolType, size = d3_svg_symbolSize;
    function symbol(d, i) {
      return (d3_svg_symbols.get(type.call(this, d, i)) || d3_svg_symbolCircle)(size.call(this, d, i));
    }
    symbol.type = function(x) {
      if (!arguments.length) return type;
      type = d3_functor(x);
      return symbol;
    };
    symbol.size = function(x) {
      if (!arguments.length) return size;
      size = d3_functor(x);
      return symbol;
    };
    return symbol;
  };
  function d3_svg_symbolSize() {
    return 64;
  }
  function d3_svg_symbolType() {
    return "circle";
  }
  function d3_svg_symbolCircle(size) {
    var r = Math.sqrt(size / π);
    return "M0," + r + "A" + r + "," + r + " 0 1,1 0," + -r + "A" + r + "," + r + " 0 1,1 0," + r + "Z";
  }
  var d3_svg_symbols = d3.map({
    circle: d3_svg_symbolCircle,
    cross: function(size) {
      var r = Math.sqrt(size / 5) / 2;
      return "M" + -3 * r + "," + -r + "H" + -r + "V" + -3 * r + "H" + r + "V" + -r + "H" + 3 * r + "V" + r + "H" + r + "V" + 3 * r + "H" + -r + "V" + r + "H" + -3 * r + "Z";
    },
    diamond: function(size) {
      var ry = Math.sqrt(size / (2 * d3_svg_symbolTan30)), rx = ry * d3_svg_symbolTan30;
      return "M0," + -ry + "L" + rx + ",0" + " 0," + ry + " " + -rx + ",0" + "Z";
    },
    square: function(size) {
      var r = Math.sqrt(size) / 2;
      return "M" + -r + "," + -r + "L" + r + "," + -r + " " + r + "," + r + " " + -r + "," + r + "Z";
    },
    "triangle-down": function(size) {
      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
      return "M0," + ry + "L" + rx + "," + -ry + " " + -rx + "," + -ry + "Z";
    },
    "triangle-up": function(size) {
      var rx = Math.sqrt(size / d3_svg_symbolSqrt3), ry = rx * d3_svg_symbolSqrt3 / 2;
      return "M0," + -ry + "L" + rx + "," + ry + " " + -rx + "," + ry + "Z";
    }
  });
  d3.svg.symbolTypes = d3_svg_symbols.keys();
  var d3_svg_symbolSqrt3 = Math.sqrt(3), d3_svg_symbolTan30 = Math.tan(30 * d3_radians);
  function d3_transition(groups, id) {
    d3_subclass(groups, d3_transitionPrototype);
    groups.id = id;
    return groups;
  }
  var d3_transitionPrototype = [], d3_transitionId = 0, d3_transitionInheritId, d3_transitionInherit;
  d3_transitionPrototype.call = d3_selectionPrototype.call;
  d3_transitionPrototype.empty = d3_selectionPrototype.empty;
  d3_transitionPrototype.node = d3_selectionPrototype.node;
  d3_transitionPrototype.size = d3_selectionPrototype.size;
  d3.transition = function(selection) {
    return arguments.length ? d3_transitionInheritId ? selection.transition() : selection : d3_selectionRoot.transition();
  };
  d3.transition.prototype = d3_transitionPrototype;
  d3_transitionPrototype.select = function(selector) {
    var id = this.id, subgroups = [], subgroup, subnode, node;
    selector = d3_selection_selector(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if ((node = group[i]) && (subnode = selector.call(node, node.__data__, i, j))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          d3_transitionNode(subnode, i, id, node.__transition__[id]);
          subgroup.push(subnode);
        } else {
          subgroup.push(null);
        }
      }
    }
    return d3_transition(subgroups, id);
  };
  d3_transitionPrototype.selectAll = function(selector) {
    var id = this.id, subgroups = [], subgroup, subnodes, node, subnode, transition;
    selector = d3_selection_selectorAll(selector);
    for (var j = -1, m = this.length; ++j < m; ) {
      for (var group = this[j], i = -1, n = group.length; ++i < n; ) {
        if (node = group[i]) {
          transition = node.__transition__[id];
          subnodes = selector.call(node, node.__data__, i, j);
          subgroups.push(subgroup = []);
          for (var k = -1, o = subnodes.length; ++k < o; ) {
            if (subnode = subnodes[k]) d3_transitionNode(subnode, k, id, transition);
            subgroup.push(subnode);
          }
        }
      }
    }
    return d3_transition(subgroups, id);
  };
  d3_transitionPrototype.filter = function(filter) {
    var subgroups = [], subgroup, group, node;
    if (typeof filter !== "function") filter = d3_selection_filter(filter);
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        if ((node = group[i]) && filter.call(node, node.__data__, i, j)) {
          subgroup.push(node);
        }
      }
    }
    return d3_transition(subgroups, this.id);
  };
  d3_transitionPrototype.tween = function(name, tween) {
    var id = this.id;
    if (arguments.length < 2) return this.node().__transition__[id].tween.get(name);
    return d3_selection_each(this, tween == null ? function(node) {
      node.__transition__[id].tween.remove(name);
    } : function(node) {
      node.__transition__[id].tween.set(name, tween);
    });
  };
  function d3_transition_tween(groups, name, value, tween) {
    var id = groups.id;
    return d3_selection_each(groups, typeof value === "function" ? function(node, i, j) {
      node.__transition__[id].tween.set(name, tween(value.call(node, node.__data__, i, j)));
    } : (value = tween(value), function(node) {
      node.__transition__[id].tween.set(name, value);
    }));
  }
  d3_transitionPrototype.attr = function(nameNS, value) {
    if (arguments.length < 2) {
      for (value in nameNS) this.attr(value, nameNS[value]);
      return this;
    }
    var interpolate = nameNS == "transform" ? d3_interpolateTransform : d3_interpolate, name = d3.ns.qualify(nameNS);
    function attrNull() {
      this.removeAttribute(name);
    }
    function attrNullNS() {
      this.removeAttributeNS(name.space, name.local);
    }
    function attrTween(b) {
      return b == null ? attrNull : (b += "", function() {
        var a = this.getAttribute(name), i;
        return a !== b && (i = interpolate(a, b), function(t) {
          this.setAttribute(name, i(t));
        });
      });
    }
    function attrTweenNS(b) {
      return b == null ? attrNullNS : (b += "", function() {
        var a = this.getAttributeNS(name.space, name.local), i;
        return a !== b && (i = interpolate(a, b), function(t) {
          this.setAttributeNS(name.space, name.local, i(t));
        });
      });
    }
    return d3_transition_tween(this, "attr." + nameNS, value, name.local ? attrTweenNS : attrTween);
  };
  d3_transitionPrototype.attrTween = function(nameNS, tween) {
    var name = d3.ns.qualify(nameNS);
    function attrTween(d, i) {
      var f = tween.call(this, d, i, this.getAttribute(name));
      return f && function(t) {
        this.setAttribute(name, f(t));
      };
    }
    function attrTweenNS(d, i) {
      var f = tween.call(this, d, i, this.getAttributeNS(name.space, name.local));
      return f && function(t) {
        this.setAttributeNS(name.space, name.local, f(t));
      };
    }
    return this.tween("attr." + nameNS, name.local ? attrTweenNS : attrTween);
  };
  d3_transitionPrototype.style = function(name, value, priority) {
    var n = arguments.length;
    if (n < 3) {
      if (typeof name !== "string") {
        if (n < 2) value = "";
        for (priority in name) this.style(priority, name[priority], value);
        return this;
      }
      priority = "";
    }
    function styleNull() {
      this.style.removeProperty(name);
    }
    function styleString(b) {
      return b == null ? styleNull : (b += "", function() {
        var a = d3_window.getComputedStyle(this, null).getPropertyValue(name), i;
        return a !== b && (i = d3_interpolate(a, b), function(t) {
          this.style.setProperty(name, i(t), priority);
        });
      });
    }
    return d3_transition_tween(this, "style." + name, value, styleString);
  };
  d3_transitionPrototype.styleTween = function(name, tween, priority) {
    if (arguments.length < 3) priority = "";
    function styleTween(d, i) {
      var f = tween.call(this, d, i, d3_window.getComputedStyle(this, null).getPropertyValue(name));
      return f && function(t) {
        this.style.setProperty(name, f(t), priority);
      };
    }
    return this.tween("style." + name, styleTween);
  };
  d3_transitionPrototype.text = function(value) {
    return d3_transition_tween(this, "text", value, d3_transition_text);
  };
  function d3_transition_text(b) {
    if (b == null) b = "";
    return function() {
      this.textContent = b;
    };
  }
  d3_transitionPrototype.remove = function() {
    return this.each("end.transition", function() {
      var p;
      if (this.__transition__.count < 2 && (p = this.parentNode)) p.removeChild(this);
    });
  };
  d3_transitionPrototype.ease = function(value) {
    var id = this.id;
    if (arguments.length < 1) return this.node().__transition__[id].ease;
    if (typeof value !== "function") value = d3.ease.apply(d3, arguments);
    return d3_selection_each(this, function(node) {
      node.__transition__[id].ease = value;
    });
  };
  d3_transitionPrototype.delay = function(value) {
    var id = this.id;
    if (arguments.length < 1) return this.node().__transition__[id].delay;
    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
      node.__transition__[id].delay = +value.call(node, node.__data__, i, j);
    } : (value = +value, function(node) {
      node.__transition__[id].delay = value;
    }));
  };
  d3_transitionPrototype.duration = function(value) {
    var id = this.id;
    if (arguments.length < 1) return this.node().__transition__[id].duration;
    return d3_selection_each(this, typeof value === "function" ? function(node, i, j) {
      node.__transition__[id].duration = Math.max(1, value.call(node, node.__data__, i, j));
    } : (value = Math.max(1, value), function(node) {
      node.__transition__[id].duration = value;
    }));
  };
  d3_transitionPrototype.each = function(type, listener) {
    var id = this.id;
    if (arguments.length < 2) {
      var inherit = d3_transitionInherit, inheritId = d3_transitionInheritId;
      d3_transitionInheritId = id;
      d3_selection_each(this, function(node, i, j) {
        d3_transitionInherit = node.__transition__[id];
        type.call(node, node.__data__, i, j);
      });
      d3_transitionInherit = inherit;
      d3_transitionInheritId = inheritId;
    } else {
      d3_selection_each(this, function(node) {
        var transition = node.__transition__[id];
        (transition.event || (transition.event = d3.dispatch("start", "end"))).on(type, listener);
      });
    }
    return this;
  };
  d3_transitionPrototype.transition = function() {
    var id0 = this.id, id1 = ++d3_transitionId, subgroups = [], subgroup, group, node, transition;
    for (var j = 0, m = this.length; j < m; j++) {
      subgroups.push(subgroup = []);
      for (var group = this[j], i = 0, n = group.length; i < n; i++) {
        if (node = group[i]) {
          transition = Object.create(node.__transition__[id0]);
          transition.delay += transition.duration;
          d3_transitionNode(node, i, id1, transition);
        }
        subgroup.push(node);
      }
    }
    return d3_transition(subgroups, id1);
  };
  function d3_transitionNode(node, i, id, inherit) {
    var lock = node.__transition__ || (node.__transition__ = {
      active: 0,
      count: 0
    }), transition = lock[id];
    if (!transition) {
      var time = inherit.time;
      transition = lock[id] = {
        tween: new d3_Map(),
        time: time,
        ease: inherit.ease,
        delay: inherit.delay,
        duration: inherit.duration
      };
      ++lock.count;
      d3.timer(function(elapsed) {
        var d = node.__data__, ease = transition.ease, delay = transition.delay, duration = transition.duration, timer = d3_timer_active, tweened = [];
        timer.t = delay + time;
        if (delay <= elapsed) return start(elapsed - delay);
        timer.c = start;
        function start(elapsed) {
          if (lock.active > id) return stop();
          lock.active = id;
          transition.event && transition.event.start.call(node, d, i);
          transition.tween.forEach(function(key, value) {
            if (value = value.call(node, d, i)) {
              tweened.push(value);
            }
          });
          d3.timer(function() {
            timer.c = tick(elapsed || 1) ? d3_true : tick;
            return 1;
          }, 0, time);
        }
        function tick(elapsed) {
          if (lock.active !== id) return stop();
          var t = elapsed / duration, e = ease(t), n = tweened.length;
          while (n > 0) {
            tweened[--n].call(node, e);
          }
          if (t >= 1) {
            transition.event && transition.event.end.call(node, d, i);
            return stop();
          }
        }
        function stop() {
          if (--lock.count) delete lock[id]; else delete node.__transition__;
          return 1;
        }
      }, 0, time);
    }
  }
  d3.svg.axis = function() {
    var scale = d3.scale.linear(), orient = d3_svg_axisDefaultOrient, innerTickSize = 6, outerTickSize = 6, tickPadding = 3, tickArguments_ = [ 10 ], tickValues = null, tickFormat_;
    function axis(g) {
      g.each(function() {
        var g = d3.select(this);
        var scale0 = this.__chart__ || scale, scale1 = this.__chart__ = scale.copy();
        var ticks = tickValues == null ? scale1.ticks ? scale1.ticks.apply(scale1, tickArguments_) : scale1.domain() : tickValues, tickFormat = tickFormat_ == null ? scale1.tickFormat ? scale1.tickFormat.apply(scale1, tickArguments_) : d3_identity : tickFormat_, tick = g.selectAll(".tick").data(ticks, scale1), tickEnter = tick.enter().insert("g", ".domain").attr("class", "tick").style("opacity", ε), tickExit = d3.transition(tick.exit()).style("opacity", ε).remove(), tickUpdate = d3.transition(tick.order()).style("opacity", 1), tickTransform;
        var range = d3_scaleRange(scale1), path = g.selectAll(".domain").data([ 0 ]), pathUpdate = (path.enter().append("path").attr("class", "domain"), 
        d3.transition(path));
        tickEnter.append("line");
        tickEnter.append("text");
        var lineEnter = tickEnter.select("line"), lineUpdate = tickUpdate.select("line"), text = tick.select("text").text(tickFormat), textEnter = tickEnter.select("text"), textUpdate = tickUpdate.select("text");
        switch (orient) {
         case "bottom":
          {
            tickTransform = d3_svg_axisX;
            lineEnter.attr("y2", innerTickSize);
            textEnter.attr("y", Math.max(innerTickSize, 0) + tickPadding);
            lineUpdate.attr("x2", 0).attr("y2", innerTickSize);
            textUpdate.attr("x", 0).attr("y", Math.max(innerTickSize, 0) + tickPadding);
            text.attr("dy", ".71em").style("text-anchor", "middle");
            pathUpdate.attr("d", "M" + range[0] + "," + outerTickSize + "V0H" + range[1] + "V" + outerTickSize);
            break;
          }

         case "top":
          {
            tickTransform = d3_svg_axisX;
            lineEnter.attr("y2", -innerTickSize);
            textEnter.attr("y", -(Math.max(innerTickSize, 0) + tickPadding));
            lineUpdate.attr("x2", 0).attr("y2", -innerTickSize);
            textUpdate.attr("x", 0).attr("y", -(Math.max(innerTickSize, 0) + tickPadding));
            text.attr("dy", "0em").style("text-anchor", "middle");
            pathUpdate.attr("d", "M" + range[0] + "," + -outerTickSize + "V0H" + range[1] + "V" + -outerTickSize);
            break;
          }

         case "left":
          {
            tickTransform = d3_svg_axisY;
            lineEnter.attr("x2", -innerTickSize);
            textEnter.attr("x", -(Math.max(innerTickSize, 0) + tickPadding));
            lineUpdate.attr("x2", -innerTickSize).attr("y2", 0);
            textUpdate.attr("x", -(Math.max(innerTickSize, 0) + tickPadding)).attr("y", 0);
            text.attr("dy", ".32em").style("text-anchor", "end");
            pathUpdate.attr("d", "M" + -outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + -outerTickSize);
            break;
          }

         case "right":
          {
            tickTransform = d3_svg_axisY;
            lineEnter.attr("x2", innerTickSize);
            textEnter.attr("x", Math.max(innerTickSize, 0) + tickPadding);
            lineUpdate.attr("x2", innerTickSize).attr("y2", 0);
            textUpdate.attr("x", Math.max(innerTickSize, 0) + tickPadding).attr("y", 0);
            text.attr("dy", ".32em").style("text-anchor", "start");
            pathUpdate.attr("d", "M" + outerTickSize + "," + range[0] + "H0V" + range[1] + "H" + outerTickSize);
            break;
          }
        }
        if (scale1.rangeBand) {
          var x = scale1, dx = x.rangeBand() / 2;
          scale0 = scale1 = function(d) {
            return x(d) + dx;
          };
        } else if (scale0.rangeBand) {
          scale0 = scale1;
        } else {
          tickExit.call(tickTransform, scale1);
        }
        tickEnter.call(tickTransform, scale0);
        tickUpdate.call(tickTransform, scale1);
      });
    }
    axis.scale = function(x) {
      if (!arguments.length) return scale;
      scale = x;
      return axis;
    };
    axis.orient = function(x) {
      if (!arguments.length) return orient;
      orient = x in d3_svg_axisOrients ? x + "" : d3_svg_axisDefaultOrient;
      return axis;
    };
    axis.ticks = function() {
      if (!arguments.length) return tickArguments_;
      tickArguments_ = arguments;
      return axis;
    };
    axis.tickValues = function(x) {
      if (!arguments.length) return tickValues;
      tickValues = x;
      return axis;
    };
    axis.tickFormat = function(x) {
      if (!arguments.length) return tickFormat_;
      tickFormat_ = x;
      return axis;
    };
    axis.tickSize = function(x) {
      var n = arguments.length;
      if (!n) return innerTickSize;
      innerTickSize = +x;
      outerTickSize = +arguments[n - 1];
      return axis;
    };
    axis.innerTickSize = function(x) {
      if (!arguments.length) return innerTickSize;
      innerTickSize = +x;
      return axis;
    };
    axis.outerTickSize = function(x) {
      if (!arguments.length) return outerTickSize;
      outerTickSize = +x;
      return axis;
    };
    axis.tickPadding = function(x) {
      if (!arguments.length) return tickPadding;
      tickPadding = +x;
      return axis;
    };
    axis.tickSubdivide = function() {
      return arguments.length && axis;
    };
    return axis;
  };
  var d3_svg_axisDefaultOrient = "bottom", d3_svg_axisOrients = {
    top: 1,
    right: 1,
    bottom: 1,
    left: 1
  };
  function d3_svg_axisX(selection, x) {
    selection.attr("transform", function(d) {
      return "translate(" + x(d) + ",0)";
    });
  }
  function d3_svg_axisY(selection, y) {
    selection.attr("transform", function(d) {
      return "translate(0," + y(d) + ")";
    });
  }
  d3.svg.brush = function() {
    var event = d3_eventDispatch(brush, "brushstart", "brush", "brushend"), x = null, y = null, xExtent = [ 0, 0 ], yExtent = [ 0, 0 ], xExtentDomain, yExtentDomain, xClamp = true, yClamp = true, resizes = d3_svg_brushResizes[0];
    function brush(g) {
      g.each(function() {
        var g = d3.select(this).style("pointer-events", "all").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)").on("mousedown.brush", brushstart).on("touchstart.brush", brushstart);
        var background = g.selectAll(".background").data([ 0 ]);
        background.enter().append("rect").attr("class", "background").style("visibility", "hidden").style("cursor", "crosshair");
        g.selectAll(".extent").data([ 0 ]).enter().append("rect").attr("class", "extent").style("cursor", "move");
        var resize = g.selectAll(".resize").data(resizes, d3_identity);
        resize.exit().remove();
        resize.enter().append("g").attr("class", function(d) {
          return "resize " + d;
        }).style("cursor", function(d) {
          return d3_svg_brushCursor[d];
        }).append("rect").attr("x", function(d) {
          return /[ew]$/.test(d) ? -3 : null;
        }).attr("y", function(d) {
          return /^[ns]/.test(d) ? -3 : null;
        }).attr("width", 6).attr("height", 6).style("visibility", "hidden");
        resize.style("display", brush.empty() ? "none" : null);
        var gUpdate = d3.transition(g), backgroundUpdate = d3.transition(background), range;
        if (x) {
          range = d3_scaleRange(x);
          backgroundUpdate.attr("x", range[0]).attr("width", range[1] - range[0]);
          redrawX(gUpdate);
        }
        if (y) {
          range = d3_scaleRange(y);
          backgroundUpdate.attr("y", range[0]).attr("height", range[1] - range[0]);
          redrawY(gUpdate);
        }
        redraw(gUpdate);
      });
    }
    brush.event = function(g) {
      g.each(function() {
        var event_ = event.of(this, arguments), extent1 = {
          x: xExtent,
          y: yExtent,
          i: xExtentDomain,
          j: yExtentDomain
        }, extent0 = this.__chart__ || extent1;
        this.__chart__ = extent1;
        if (d3_transitionInheritId) {
          d3.select(this).transition().each("start.brush", function() {
            xExtentDomain = extent0.i;
            yExtentDomain = extent0.j;
            xExtent = extent0.x;
            yExtent = extent0.y;
            event_({
              type: "brushstart"
            });
          }).tween("brush:brush", function() {
            var xi = d3_interpolateArray(xExtent, extent1.x), yi = d3_interpolateArray(yExtent, extent1.y);
            xExtentDomain = yExtentDomain = null;
            return function(t) {
              xExtent = extent1.x = xi(t);
              yExtent = extent1.y = yi(t);
              event_({
                type: "brush",
                mode: "resize"
              });
            };
          }).each("end.brush", function() {
            xExtentDomain = extent1.i;
            yExtentDomain = extent1.j;
            event_({
              type: "brush",
              mode: "resize"
            });
            event_({
              type: "brushend"
            });
          });
        } else {
          event_({
            type: "brushstart"
          });
          event_({
            type: "brush",
            mode: "resize"
          });
          event_({
            type: "brushend"
          });
        }
      });
    };
    function redraw(g) {
      g.selectAll(".resize").attr("transform", function(d) {
        return "translate(" + xExtent[+/e$/.test(d)] + "," + yExtent[+/^s/.test(d)] + ")";
      });
    }
    function redrawX(g) {
      g.select(".extent").attr("x", xExtent[0]);
      g.selectAll(".extent,.n>rect,.s>rect").attr("width", xExtent[1] - xExtent[0]);
    }
    function redrawY(g) {
      g.select(".extent").attr("y", yExtent[0]);
      g.selectAll(".extent,.e>rect,.w>rect").attr("height", yExtent[1] - yExtent[0]);
    }
    function brushstart() {
      var target = this, eventTarget = d3.select(d3.event.target), event_ = event.of(target, arguments), g = d3.select(target), resizing = eventTarget.datum(), resizingX = !/^(n|s)$/.test(resizing) && x, resizingY = !/^(e|w)$/.test(resizing) && y, dragging = eventTarget.classed("extent"), dragRestore = d3_event_dragSuppress(), center, origin = d3.mouse(target), offset;
      var w = d3.select(d3_window).on("keydown.brush", keydown).on("keyup.brush", keyup);
      if (d3.event.changedTouches) {
        w.on("touchmove.brush", brushmove).on("touchend.brush", brushend);
      } else {
        w.on("mousemove.brush", brushmove).on("mouseup.brush", brushend);
      }
      g.interrupt().selectAll("*").interrupt();
      if (dragging) {
        origin[0] = xExtent[0] - origin[0];
        origin[1] = yExtent[0] - origin[1];
      } else if (resizing) {
        var ex = +/w$/.test(resizing), ey = +/^n/.test(resizing);
        offset = [ xExtent[1 - ex] - origin[0], yExtent[1 - ey] - origin[1] ];
        origin[0] = xExtent[ex];
        origin[1] = yExtent[ey];
      } else if (d3.event.altKey) center = origin.slice();
      g.style("pointer-events", "none").selectAll(".resize").style("display", null);
      d3.select("body").style("cursor", eventTarget.style("cursor"));
      event_({
        type: "brushstart"
      });
      brushmove();
      function keydown() {
        if (d3.event.keyCode == 32) {
          if (!dragging) {
            center = null;
            origin[0] -= xExtent[1];
            origin[1] -= yExtent[1];
            dragging = 2;
          }
          d3_eventPreventDefault();
        }
      }
      function keyup() {
        if (d3.event.keyCode == 32 && dragging == 2) {
          origin[0] += xExtent[1];
          origin[1] += yExtent[1];
          dragging = 0;
          d3_eventPreventDefault();
        }
      }
      function brushmove() {
        var point = d3.mouse(target), moved = false;
        if (offset) {
          point[0] += offset[0];
          point[1] += offset[1];
        }
        if (!dragging) {
          if (d3.event.altKey) {
            if (!center) center = [ (xExtent[0] + xExtent[1]) / 2, (yExtent[0] + yExtent[1]) / 2 ];
            origin[0] = xExtent[+(point[0] < center[0])];
            origin[1] = yExtent[+(point[1] < center[1])];
          } else center = null;
        }
        if (resizingX && move1(point, x, 0)) {
          redrawX(g);
          moved = true;
        }
        if (resizingY && move1(point, y, 1)) {
          redrawY(g);
          moved = true;
        }
        if (moved) {
          redraw(g);
          event_({
            type: "brush",
            mode: dragging ? "move" : "resize"
          });
        }
      }
      function move1(point, scale, i) {
        var range = d3_scaleRange(scale), r0 = range[0], r1 = range[1], position = origin[i], extent = i ? yExtent : xExtent, size = extent[1] - extent[0], min, max;
        if (dragging) {
          r0 -= position;
          r1 -= size + position;
        }
        min = (i ? yClamp : xClamp) ? Math.max(r0, Math.min(r1, point[i])) : point[i];
        if (dragging) {
          max = (min += position) + size;
        } else {
          if (center) position = Math.max(r0, Math.min(r1, 2 * center[i] - min));
          if (position < min) {
            max = min;
            min = position;
          } else {
            max = position;
          }
        }
        if (extent[0] != min || extent[1] != max) {
          if (i) yExtentDomain = null; else xExtentDomain = null;
          extent[0] = min;
          extent[1] = max;
          return true;
        }
      }
      function brushend() {
        brushmove();
        g.style("pointer-events", "all").selectAll(".resize").style("display", brush.empty() ? "none" : null);
        d3.select("body").style("cursor", null);
        w.on("mousemove.brush", null).on("mouseup.brush", null).on("touchmove.brush", null).on("touchend.brush", null).on("keydown.brush", null).on("keyup.brush", null);
        dragRestore();
        event_({
          type: "brushend"
        });
      }
    }
    brush.x = function(z) {
      if (!arguments.length) return x;
      x = z;
      resizes = d3_svg_brushResizes[!x << 1 | !y];
      return brush;
    };
    brush.y = function(z) {
      if (!arguments.length) return y;
      y = z;
      resizes = d3_svg_brushResizes[!x << 1 | !y];
      return brush;
    };
    brush.clamp = function(z) {
      if (!arguments.length) return x && y ? [ xClamp, yClamp ] : x ? xClamp : y ? yClamp : null;
      if (x && y) xClamp = !!z[0], yClamp = !!z[1]; else if (x) xClamp = !!z; else if (y) yClamp = !!z;
      return brush;
    };
    brush.extent = function(z) {
      var x0, x1, y0, y1, t;
      if (!arguments.length) {
        if (x) {
          if (xExtentDomain) {
            x0 = xExtentDomain[0], x1 = xExtentDomain[1];
          } else {
            x0 = xExtent[0], x1 = xExtent[1];
            if (x.invert) x0 = x.invert(x0), x1 = x.invert(x1);
            if (x1 < x0) t = x0, x0 = x1, x1 = t;
          }
        }
        if (y) {
          if (yExtentDomain) {
            y0 = yExtentDomain[0], y1 = yExtentDomain[1];
          } else {
            y0 = yExtent[0], y1 = yExtent[1];
            if (y.invert) y0 = y.invert(y0), y1 = y.invert(y1);
            if (y1 < y0) t = y0, y0 = y1, y1 = t;
          }
        }
        return x && y ? [ [ x0, y0 ], [ x1, y1 ] ] : x ? [ x0, x1 ] : y && [ y0, y1 ];
      }
      if (x) {
        x0 = z[0], x1 = z[1];
        if (y) x0 = x0[0], x1 = x1[0];
        xExtentDomain = [ x0, x1 ];
        if (x.invert) x0 = x(x0), x1 = x(x1);
        if (x1 < x0) t = x0, x0 = x1, x1 = t;
        if (x0 != xExtent[0] || x1 != xExtent[1]) xExtent = [ x0, x1 ];
      }
      if (y) {
        y0 = z[0], y1 = z[1];
        if (x) y0 = y0[1], y1 = y1[1];
        yExtentDomain = [ y0, y1 ];
        if (y.invert) y0 = y(y0), y1 = y(y1);
        if (y1 < y0) t = y0, y0 = y1, y1 = t;
        if (y0 != yExtent[0] || y1 != yExtent[1]) yExtent = [ y0, y1 ];
      }
      return brush;
    };
    brush.clear = function() {
      if (!brush.empty()) {
        xExtent = [ 0, 0 ], yExtent = [ 0, 0 ];
        xExtentDomain = yExtentDomain = null;
      }
      return brush;
    };
    brush.empty = function() {
      return !!x && xExtent[0] == xExtent[1] || !!y && yExtent[0] == yExtent[1];
    };
    return d3.rebind(brush, event, "on");
  };
  var d3_svg_brushCursor = {
    n: "ns-resize",
    e: "ew-resize",
    s: "ns-resize",
    w: "ew-resize",
    nw: "nwse-resize",
    ne: "nesw-resize",
    se: "nwse-resize",
    sw: "nesw-resize"
  };
  var d3_svg_brushResizes = [ [ "n", "e", "s", "w", "nw", "ne", "se", "sw" ], [ "e", "w" ], [ "n", "s" ], [] ];
  var d3_time_format = d3_time.format = d3_locale_enUS.timeFormat;
  var d3_time_formatUtc = d3_time_format.utc;
  var d3_time_formatIso = d3_time_formatUtc("%Y-%m-%dT%H:%M:%S.%LZ");
  d3_time_format.iso = Date.prototype.toISOString && +new Date("2000-01-01T00:00:00.000Z") ? d3_time_formatIsoNative : d3_time_formatIso;
  function d3_time_formatIsoNative(date) {
    return date.toISOString();
  }
  d3_time_formatIsoNative.parse = function(string) {
    var date = new Date(string);
    return isNaN(date) ? null : date;
  };
  d3_time_formatIsoNative.toString = d3_time_formatIso.toString;
  d3_time.second = d3_time_interval(function(date) {
    return new d3_date(Math.floor(date / 1e3) * 1e3);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 1e3);
  }, function(date) {
    return date.getSeconds();
  });
  d3_time.seconds = d3_time.second.range;
  d3_time.seconds.utc = d3_time.second.utc.range;
  d3_time.minute = d3_time_interval(function(date) {
    return new d3_date(Math.floor(date / 6e4) * 6e4);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 6e4);
  }, function(date) {
    return date.getMinutes();
  });
  d3_time.minutes = d3_time.minute.range;
  d3_time.minutes.utc = d3_time.minute.utc.range;
  d3_time.hour = d3_time_interval(function(date) {
    var timezone = date.getTimezoneOffset() / 60;
    return new d3_date((Math.floor(date / 36e5 - timezone) + timezone) * 36e5);
  }, function(date, offset) {
    date.setTime(date.getTime() + Math.floor(offset) * 36e5);
  }, function(date) {
    return date.getHours();
  });
  d3_time.hours = d3_time.hour.range;
  d3_time.hours.utc = d3_time.hour.utc.range;
  d3_time.month = d3_time_interval(function(date) {
    date = d3_time.day(date);
    date.setDate(1);
    return date;
  }, function(date, offset) {
    date.setMonth(date.getMonth() + offset);
  }, function(date) {
    return date.getMonth();
  });
  d3_time.months = d3_time.month.range;
  d3_time.months.utc = d3_time.month.utc.range;
  function d3_time_scale(linear, methods, format) {
    function scale(x) {
      return linear(x);
    }
    scale.invert = function(x) {
      return d3_time_scaleDate(linear.invert(x));
    };
    scale.domain = function(x) {
      if (!arguments.length) return linear.domain().map(d3_time_scaleDate);
      linear.domain(x);
      return scale;
    };
    function tickMethod(extent, count) {
      var span = extent[1] - extent[0], target = span / count, i = d3.bisect(d3_time_scaleSteps, target);
      return i == d3_time_scaleSteps.length ? [ methods.year, d3_scale_linearTickRange(extent.map(function(d) {
        return d / 31536e6;
      }), count)[2] ] : !i ? [ d3_time_scaleMilliseconds, d3_scale_linearTickRange(extent, count)[2] ] : methods[target / d3_time_scaleSteps[i - 1] < d3_time_scaleSteps[i] / target ? i - 1 : i];
    }
    scale.nice = function(interval, skip) {
      var domain = scale.domain(), extent = d3_scaleExtent(domain), method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" && tickMethod(extent, interval);
      if (method) interval = method[0], skip = method[1];
      function skipped(date) {
        return !isNaN(date) && !interval.range(date, d3_time_scaleDate(+date + 1), skip).length;
      }
      return scale.domain(d3_scale_nice(domain, skip > 1 ? {
        floor: function(date) {
          while (skipped(date = interval.floor(date))) date = d3_time_scaleDate(date - 1);
          return date;
        },
        ceil: function(date) {
          while (skipped(date = interval.ceil(date))) date = d3_time_scaleDate(+date + 1);
          return date;
        }
      } : interval));
    };
    scale.ticks = function(interval, skip) {
      var extent = d3_scaleExtent(scale.domain()), method = interval == null ? tickMethod(extent, 10) : typeof interval === "number" ? tickMethod(extent, interval) : !interval.range && [ {
        range: interval
      }, skip ];
      if (method) interval = method[0], skip = method[1];
      return interval.range(extent[0], d3_time_scaleDate(+extent[1] + 1), skip < 1 ? 1 : skip);
    };
    scale.tickFormat = function() {
      return format;
    };
    scale.copy = function() {
      return d3_time_scale(linear.copy(), methods, format);
    };
    return d3_scale_linearRebind(scale, linear);
  }
  function d3_time_scaleDate(t) {
    return new Date(t);
  }
  var d3_time_scaleSteps = [ 1e3, 5e3, 15e3, 3e4, 6e4, 3e5, 9e5, 18e5, 36e5, 108e5, 216e5, 432e5, 864e5, 1728e5, 6048e5, 2592e6, 7776e6, 31536e6 ];
  var d3_time_scaleLocalMethods = [ [ d3_time.second, 1 ], [ d3_time.second, 5 ], [ d3_time.second, 15 ], [ d3_time.second, 30 ], [ d3_time.minute, 1 ], [ d3_time.minute, 5 ], [ d3_time.minute, 15 ], [ d3_time.minute, 30 ], [ d3_time.hour, 1 ], [ d3_time.hour, 3 ], [ d3_time.hour, 6 ], [ d3_time.hour, 12 ], [ d3_time.day, 1 ], [ d3_time.day, 2 ], [ d3_time.week, 1 ], [ d3_time.month, 1 ], [ d3_time.month, 3 ], [ d3_time.year, 1 ] ];
  var d3_time_scaleLocalFormat = d3_time_format.multi([ [ ".%L", function(d) {
    return d.getMilliseconds();
  } ], [ ":%S", function(d) {
    return d.getSeconds();
  } ], [ "%I:%M", function(d) {
    return d.getMinutes();
  } ], [ "%I %p", function(d) {
    return d.getHours();
  } ], [ "%a %d", function(d) {
    return d.getDay() && d.getDate() != 1;
  } ], [ "%b %d", function(d) {
    return d.getDate() != 1;
  } ], [ "%B", function(d) {
    return d.getMonth();
  } ], [ "%Y", d3_true ] ]);
  var d3_time_scaleMilliseconds = {
    range: function(start, stop, step) {
      return d3.range(Math.ceil(start / step) * step, +stop, step).map(d3_time_scaleDate);
    },
    floor: d3_identity,
    ceil: d3_identity
  };
  d3_time_scaleLocalMethods.year = d3_time.year;
  d3_time.scale = function() {
    return d3_time_scale(d3.scale.linear(), d3_time_scaleLocalMethods, d3_time_scaleLocalFormat);
  };
  var d3_time_scaleUtcMethods = d3_time_scaleLocalMethods.map(function(m) {
    return [ m[0].utc, m[1] ];
  });
  var d3_time_scaleUtcFormat = d3_time_formatUtc.multi([ [ ".%L", function(d) {
    return d.getUTCMilliseconds();
  } ], [ ":%S", function(d) {
    return d.getUTCSeconds();
  } ], [ "%I:%M", function(d) {
    return d.getUTCMinutes();
  } ], [ "%I %p", function(d) {
    return d.getUTCHours();
  } ], [ "%a %d", function(d) {
    return d.getUTCDay() && d.getUTCDate() != 1;
  } ], [ "%b %d", function(d) {
    return d.getUTCDate() != 1;
  } ], [ "%B", function(d) {
    return d.getUTCMonth();
  } ], [ "%Y", d3_true ] ]);
  d3_time_scaleUtcMethods.year = d3_time.year.utc;
  d3_time.scale.utc = function() {
    return d3_time_scale(d3.scale.linear(), d3_time_scaleUtcMethods, d3_time_scaleUtcFormat);
  };
  d3.text = d3_xhrType(function(request) {
    return request.responseText;
  });
  d3.json = function(url, callback) {
    return d3_xhr(url, "application/json", d3_json, callback);
  };
  function d3_json(request) {
    return JSON.parse(request.responseText);
  }
  d3.html = function(url, callback) {
    return d3_xhr(url, "text/html", d3_html, callback);
  };
  function d3_html(request) {
    var range = d3_document.createRange();
    range.selectNode(d3_document.body);
    return range.createContextualFragment(request.responseText);
  }
  d3.xml = d3_xhrType(function(request) {
    return request.responseXML;
  });
  if (typeof define === "function" && define.amd) define(d3); else if (typeof module === "object" && module.exports) module.exports = d3;
  this.d3 = d3;
}();
},{}]},{},["./js/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL25vZGUuZ3JhcGhpY3Mvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4vanMvaW5kZXguanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9ub2RlLmdyYXBoaWNzL2pzL2NvbnN0YW50cy9rZXlzLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvbm9kZS5ncmFwaGljcy9qcy9jb25zdGFudHMvbW91c2UuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9ub2RlLmdyYXBoaWNzL2pzL2Vudmlyb25tZW50L3Nob3J0Y3V0cy9ub2RlRWRpdG9yLnNob3J0Y3V0cy5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL25vZGUuZ3JhcGhpY3MvanMvbm9kZUVkaXRvci9Ob2RlRWRpdG9yLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvbm9kZS5ncmFwaGljcy9qcy9ub2RlRWRpdG9yL1RyZWUuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9ub2RlLmdyYXBoaWNzL2pzL25vZGVFZGl0b3Ivbm9kZVR5cGVzL2dyb3VwLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvbm9kZS5ncmFwaGljcy9qcy9ub2RlRWRpdG9yL25vZGVUeXBlcy9pbmRleC5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL25vZGUuZ3JhcGhpY3MvanMvbm9kZUVkaXRvci9ub2RlVHlwZXMvcm9vdC5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL25vZGUuZ3JhcGhpY3MvanMvbm9kZUVkaXRvci9ub2RlVHlwZXMvdmVjdG9yLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvbm9kZS5ncmFwaGljcy9qcy9ub2RlRWRpdG9yL3Rvb2xzL0N1cnNvci5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL25vZGUuZ3JhcGhpY3MvanMvbm9kZUVkaXRvci90b29scy9Ob2RlTGFzc28uanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9ub2RlLmdyYXBoaWNzL2pzL3V0aWxzL0V2ZW50RGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL25vZGUuZ3JhcGhpY3MvanMvdXRpbHMvSElEL0tleWJvYXJkLmpzIiwiL1VzZXJzL2dyZWd0YXR1bS9Ecm9wYm94L2dyZWctc2l0ZXMvbm9kZS5ncmFwaGljcy9qcy91dGlscy9ISUQvTW91c2UuanMiLCIvVXNlcnMvZ3JlZ3RhdHVtL0Ryb3Bib3gvZ3JlZy1zaXRlcy9ub2RlLmdyYXBoaWNzL2pzL3V0aWxzL3dyYXBTY29wZS5qcyIsIi9Vc2Vycy9ncmVndGF0dW0vRHJvcGJveC9ncmVnLXNpdGVzL25vZGUuZ3JhcGhpY3Mvbm9kZV9tb2R1bGVzL2QzL2QzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hXQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgbm9kZUVkaXRvciA9IHJlcXVpcmUoJy4vbm9kZUVkaXRvci9Ob2RlRWRpdG9yJyk7XG5cbndpbmRvdy5lZGl0b3IgPSBuZXcgbm9kZUVkaXRvcigpOyIsIm1vZHVsZS5leHBvcnRzID0ge1xuXHRcImJhY2tzcGFjZVwiOlx0XHQ4LFxuXHRcInRhYlwiOlx0XHRcdFx0OSxcblx0XCJlbnRlclwiOlx0XHRcdDEzLFxuXHRcInNoaWZ0XCI6XHRcdFx0MTYsXG5cdFwiY3RybFwiOlx0XHRcdFx0MTcsXG5cdFwiYWx0XCI6XHRcdFx0XHQxOCxcblx0XCJwYXVzZVwiOlx0XHRcdDE5LFxuXHRcImNhcHMgbG9ja1wiOlx0XHQyMCxcblx0XCJlc2NhcGVcIjpcdFx0XHQyNyxcblx0XCJzcGFjZWJhclwiOlx0XHRcdDMyLFxuXHRcInBhZ2V1cFwiOlx0XHRcdDMzLFxuXHRcInBhZ2Vkb3duXCI6XHRcdFx0MzQsXG5cdFwiZW5kXCI6XHRcdFx0XHQzNSxcblx0XCJob21lXCI6XHRcdFx0XHQzNixcblx0XCJsZWZ0XCI6XHRcdFx0XHQzNyxcblx0XCJ1cFwiOlx0XHRcdFx0MzgsXG5cdFwicmlnaHRcIjpcdFx0XHQzOSxcblx0XCJkb3duXCI6XHRcdFx0XHQ0MCxcblx0XCJpbnNlcnRcIjpcdFx0XHQ0NSxcblx0XCJkZWxldGVcIjpcdFx0XHQ0Nixcblx0XCJudW0wXCI6XHRcdFx0XHQ0OCxcblx0XCJudW0xXCI6XHRcdFx0XHQ0OSxcblx0XCJudW0yXCI6XHRcdFx0XHQ1MCxcblx0XCJudW0zXCI6XHRcdFx0XHQ1MSxcblx0XCJudW00XCI6XHRcdFx0XHQ1Mixcblx0XCJudW01XCI6XHRcdFx0XHQ1Myxcblx0XCJudW02XCI6XHRcdFx0XHQ1NCxcblx0XCJudW03XCI6XHRcdFx0XHQ1NSxcblx0XCJudW04XCI6XHRcdFx0XHQ1Nixcblx0XCJudW05XCI6XHRcdFx0XHQ1Nyxcblx0XCJhXCI6XHRcdFx0XHQ2NSxcblx0XCJiXCI6XHRcdFx0XHQ2Nixcblx0XCJjXCI6XHRcdFx0XHQ2Nyxcblx0XCJkXCI6XHRcdFx0XHQ2OCxcblx0XCJlXCI6XHRcdFx0XHQ2OSxcblx0XCJmXCI6XHRcdFx0XHQ3MCxcblx0XCJnXCI6XHRcdFx0XHQ3MSxcblx0XCJoXCI6XHRcdFx0XHQ3Mixcblx0XCJpXCI6XHRcdFx0XHQ3Myxcblx0XCJqXCI6XHRcdFx0XHQ3NCxcblx0XCJrXCI6XHRcdFx0XHQ3NSxcblx0XCJsXCI6XHRcdFx0XHQ3Nixcblx0XCJtXCI6XHRcdFx0XHQ3Nyxcblx0XCJuXCI6XHRcdFx0XHQ3OCxcblx0XCJvXCI6XHRcdFx0XHQ3OSxcblx0XCJwXCI6XHRcdFx0XHQ4MCxcblx0XCJxXCI6XHRcdFx0XHQ4MSxcblx0XCJyXCI6XHRcdFx0XHQ4Mixcblx0XCJzXCI6XHRcdFx0XHQ4Myxcblx0XCJ0XCI6XHRcdFx0XHQ4NCxcblx0XCJ1XCI6XHRcdFx0XHQ4NSxcblx0XCJ2XCI6XHRcdFx0XHQ4Nixcblx0XCJ3XCI6XHRcdFx0XHQ4Nyxcblx0XCJ4XCI6XHRcdFx0XHQ4OCxcblx0XCJ5XCI6XHRcdFx0XHQ4OSxcblx0XCJ6XCI6XHRcdFx0XHQ5MCxcblx0XCJjb21tYW5kXCI6XHRcdFx0OTEsXG5cdFwicmlnaHRXaW5kb3dLZXlcIjpcdDkyLFxuXHRcInNlbGVjdCBrZXlcIjpcdFx0OTMsXG5cdFwibnVtcGFkMFwiOlx0XHRcdDk2LFxuXHRcIm51bXBhZDFcIjpcdFx0XHQ5Nyxcblx0XCJudW1wYWQyXCI6XHRcdFx0OTgsXG5cdFwibnVtcGFkM1wiOlx0XHRcdDk5LFxuXHRcIm51bXBhZDRcIjpcdFx0XHQxMDAsXG5cdFwibnVtcGFkNVwiOlx0XHRcdDEwMSxcblx0XCJudW1wYWQ2XCI6XHRcdFx0MTAyLFxuXHRcIm51bXBhZDdcIjpcdFx0XHQxMDMsXG5cdFwibnVtcGFkOFwiOlx0XHRcdDEwNCxcblx0XCJudW1wYWQ5XCI6XHRcdFx0MTA1LFxuXHRcIm11bHRpcGx5XCI6XHRcdFx0MTA2LFxuXHRcImFkZFwiOlx0XHRcdFx0MTA3LFxuXHRcInN1YnRyYWN0XCI6XHRcdFx0MTA5LFxuXHRcImRlY2ltYWxcIjpcdFx0XHQxMTAsXG5cdFwiZGl2aWRlXCI6XHRcdFx0MTExLFxuXHRcImYxXCI6XHRcdFx0XHQxMTIsXG5cdFwiZjJcIjpcdFx0XHRcdDExMyxcblx0XCJmM1wiOlx0XHRcdFx0MTE0LFxuXHRcImY0XCI6XHRcdFx0XHQxMTUsXG5cdFwiZjVcIjpcdFx0XHRcdDExNixcblx0XCJmNlwiOlx0XHRcdFx0MTE3LFxuXHRcImY3XCI6XHRcdFx0XHQxMTgsXG5cdFwiZjhcIjpcdFx0XHRcdDExOSxcblx0XCJmOVwiOlx0XHRcdFx0MTIwLFxuXHRcImYxMFwiOlx0XHRcdFx0MTIxLFxuXHRcImYxMVwiOlx0XHRcdFx0MTIyLFxuXHRcImYxMlwiOlx0XHRcdFx0MTIzLFxuXHRcIm51bUxvY2tcIjpcdFx0XHQxNDQsXG5cdFwic2Nyb2xsTG9ja1wiOlx0XHQxNDUsXG5cdFwic2VtaWNvbG9uXCI6XHRcdDE4Nixcblx0XCJlcXVhbHNcIjpcdFx0XHQxODcsXG5cdFwiY29tbWFcIjpcdFx0XHQxODgsXG5cdFwiZGFzaFwiOlx0XHRcdFx0MTg5LFxuXHRcInBlcmlvZFwiOlx0XHRcdDE5MCxcblx0XCJmb3J3YXJkU2xhc2hcIjpcdFx0MTkxLFxuXHRcImdyYXZlQWNjZW50XCI6XHRcdDE5Mixcblx0XCJvcGVuQnJhY2tldFwiOlx0XHQyMTksXG5cdFwiYmFja3NsYXNoXCI6XHRcdDIyMCxcblx0XCJjbG9zZUJyYWNrZXRcIjpcdFx0MjIxLFxuXHRcInNpbmdsZVF1b3RlXCI6XHRcdDIyMlxufTsiLCJ2YXIgaXNNYWMgPSBuYXZpZ2F0b3IucGxhdGZvcm0udG9VcHBlckNhc2UoKS5pbmRleE9mKCdNQUMnKT49MDtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdFwibGVmdFwiXHRcdDogMSxcblx0XCJtaWRkbGVcIlx0OiAyLFxuXHRcInJpZ2h0XCJcdFx0OiAzLFxuXHRcImNvbW1hbmRcIlx0OiBpc01hYyA/IFwibWV0YUtleVwiIDogXCJjdHJsS2V5XCIsXG5cdFwiY29udHJvbFwiXHQ6IGlzTWFjID8gXCJjdHJsS2V5XCIgOiBcIm1ldGFLZXlcIixcblx0XCJvcHRpb25cIlx0OiBpc01hYyA/IFwiYWx0S2V5XCIgOiBcImFsdEtleVwiLFxuXHRcInNoaWZ0XCJcdFx0OiBcInNoaWZ0S2V5XCJcbn07IiwidmFyIGtleXNcdD0gcmVxdWlyZSgnLi4vLi4vY29uc3RhbnRzL2tleXMnKSxcblx0bW91c2VcdD0gcmVxdWlyZSgnLi4vLi4vY29uc3RhbnRzL21vdXNlJyk7XG5cdFxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdGV4aXRcdFx0XHRcdDogW2tleXMuZXNjYXBlXSxcblx0ZWRpdE1vZGVcdFx0XHQ6IFtrZXlzLnNwYWNlYmFyXSxcblx0bm9kZUxhc3NvXHRcdDogeyBtb2RpZmllcnM6IFttb3VzZS5jb21tYW5kXSwgY2xpY2s6IG1vdXNlLmxlZnQgfSxcblx0bm9kZVR5cGVzIDoge1xuXHRcdGdyb3VwIDoge1xuXHRcdFx0ZHJhd0xpbmUgOiB7IG1vZGlmaWVyczogW21vdXNlLmNvbW1hbmRdLCBjbGljazogbW91c2UubGVmdCB9XG5cdFx0fVxuXHR9LFxuXHRjdXJzb3IgOiB7XG5cdFx0dXBcdFx0XHRcdDogW3sga2V5OiBrZXlzLnVwIH1dLFxuXHRcdGRvd25cdFx0XHQ6IFt7IGtleToga2V5cy5kb3duIH1dLFxuXHRcdGxlZnRcdFx0XHQ6IFt7IGtleToga2V5cy5sZWZ0IH1dLFxuXHRcdHJpZ2h0XHRcdFx0OiBbeyBrZXk6IGtleXMucmlnaHQgfV0sXG5cdFx0c2libGluZ1VwXHRcdDogW3sgbW9kaWZpZXJzOiBbbW91c2Uuc2hpZnRdLCBrZXk6IGtleXMudXAgfV0sXG5cdFx0c2libGluZ0Rvd25cdFx0OiBbeyBtb2RpZmllcnM6IFttb3VzZS5zaGlmdF0sIGtleToga2V5cy5kb3duIH1dLFxuXHRcdHNpYmxpbmdMZWZ0XHRcdDogW3sgbW9kaWZpZXJzOiBbbW91c2Uuc2hpZnRdLCBrZXk6IGtleXMubGVmdCB9XSxcblx0XHRzaWJsaW5nUmlnaHRcdDogW3sgbW9kaWZpZXJzOiBbbW91c2Uuc2hpZnRdLCBrZXk6IGtleXMucmlnaHQgfV1cblx0fVxufTsiLCJ2YXJcdGQzXHRcdFx0XHQ9IHJlcXVpcmUoJ2QzJyksXG5cdEV2ZW50RGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uL3V0aWxzL0V2ZW50RGlzcGF0Y2hlcicpLFxuXHR3cmFwU2NvcGVcdFx0PSByZXF1aXJlKCcuLi91dGlscy93cmFwU2NvcGUnKSxcblx0bm9kZVR5cGVDbGFzc2VzXHQ9IHJlcXVpcmUoJy4vbm9kZVR5cGVzJyksXG5cdGtleXNcdFx0XHQ9IHJlcXVpcmUoJy4uL2Vudmlyb25tZW50L3Nob3J0Y3V0cy9ub2RlRWRpdG9yLnNob3J0Y3V0cycpLFxuXHRLZXlib2FyZFx0XHQ9IHJlcXVpcmUoJy4uL3V0aWxzL0hJRC9LZXlib2FyZCcpLFxuXHRNb3VzZVx0XHRcdD0gcmVxdWlyZSgnLi4vdXRpbHMvSElEL01vdXNlJyksXG5cdEN1cnNvclx0XHRcdD0gcmVxdWlyZSgnLi90b29scy9DdXJzb3InKSxcblx0VHJlZVx0XHRcdD0gcmVxdWlyZSgnLi9UcmVlJyk7XG5cbmZ1bmN0aW9uIGdldElkKCBkICkge1xuXHRyZXR1cm4gZC5pZDtcbn1cblxudmFyIE5vZGVFZGl0b3IgPSBmdW5jdGlvbigpIHtcblx0dGhpcy53aWR0aCA9ICQod2luZG93KS53aWR0aCgpO1xuXHR0aGlzLmhlaWdodCA9ICQod2luZG93KS5oZWlnaHQoKTtcblx0dGhpcy5yYWRpdXMgPSAxMDtcblx0dGhpcy5kcmFnZ2luZyA9IGZhbHNlO1xuXHRcblx0dmFyIHJvb3QgPSB7XG5cdFx0eDogdGhpcy53aWR0aCAqIDAuNixcblx0XHR5OiB0aGlzLmhlaWdodCAqIDAuNixcblx0XHRkZXB0aDogMCxcblx0XHR0eXBlOiBcInJvb3RcIixcblx0XHRpZDogMFxuXHR9O1xuXG5cdHRoaXMua2V5Ym9hcmQgPSBuZXcgS2V5Ym9hcmQoIGQzLnNlbGVjdCgnYm9keScpICk7XG5cdHRoaXMubW91c2UgPSBuZXcgTW91c2UoKTtcblx0dGhpcy5mb3JjZSA9IHRoaXMuY3JlYXRlRm9yY2UoIHJvb3QgKTtcblx0dGhpcy4kc2NvcGUgPSB0aGlzLmNyZWF0ZVN2ZygpO1xuXHR0aGlzLmJhY2tkcm9wID0gdGhpcy5jcmVhdGVCYWNrZHJvcCgpO1xuXHRcblx0dGhpcy50cmVlID0gbmV3IFRyZWUoIHJvb3QsIHRoaXMuZm9yY2Uubm9kZXMoKSwgdGhpcy5mb3JjZS5saW5rcygpICk7XG5cdFxuXHR0aGlzLiRub2RlcyA9IHRoaXMuJHNjb3BlLnNlbGVjdEFsbChcIi5ub2RlXCIpO1xuXHR0aGlzLiRsaW5rcyA9IHRoaXMuJHNjb3BlLnNlbGVjdEFsbChcIi5saW5rXCIpO1xuXHRcblx0dGhpcy5ub2RlVHlwZXMgPSB7fTtcblx0dGhpcy5pbml0aWF0ZWROb2RlVHlwZXMgPSBbXTtcblxuXHR0aGlzLnNldEhhbmRsZXJzKCk7XG5cdHRoaXMucmVzdGFydCgpO1xuXHRcblx0dGhpcy5jdXJzb3IgPSBuZXcgQ3Vyc29yKCB0aGlzLCB0aGlzLmdldCRFbEZyb21Ob2RlKCByb290ICkgKTtcblx0XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE5vZGVFZGl0b3I7XG5cbk5vZGVFZGl0b3IucHJvdG90eXBlID0ge1xuXHRcblx0Y3JlYXRlRm9yY2UgOiBmdW5jdGlvbiggcm9vdCApIHtcblx0XHRcblx0XHRyZXR1cm4gZDMubGF5b3V0LmZvcmNlKClcblx0XHRcdC5zaXplKFt0aGlzLndpZHRoLCB0aGlzLmhlaWdodF0pXG5cdFx0XHQubm9kZXMoWyByb290IF0pIC8vIGluaXRpYWxpemUgd2l0aCBhIHNpbmdsZSBub2RlXG5cdFx0XHQubGlua0Rpc3RhbmNlKGZ1bmN0aW9uKGQpIHtcblx0XHRcdFx0cmV0dXJuIE1hdGgubWF4KDEwMCAtIGQuc291cmNlLmRlcHRoICogMjAsIDEwKTtcblx0XHRcdH0pXG5cdFx0XHQuY2hhcmdlKGZ1bmN0aW9uKGQpIHtcblx0XHRcdFx0cmV0dXJuIE1hdGgubWluKC0xMDAwIC8gKGQuZGVwdGggKyAxKSAsIC02MCk7XG5cdFx0XHR9KVxuXHRcdFx0Lm9uKFwidGlja1wiLCB0aGlzLnRpY2suYmluZCh0aGlzKSApO1xuXHRcdFx0XG5cdH0sXG5cdFxuXHRjcmVhdGVTdmcgOiBmdW5jdGlvbigpIHtcblx0XHRcblx0XHR2YXIgc3ZnID0gZDMuc2VsZWN0KFwiYm9keVwiKS5hcHBlbmQoXCJzdmdcIilcblx0XHQgICAgLmF0dHIoXCJ3aWR0aFwiLCB0aGlzLndpZHRoKVxuXHRcdCAgICAuYXR0cihcImhlaWdodFwiLCB0aGlzLmhlaWdodCk7XG4vL1x0XHQgICAgLm9uKFwibW91c2Vtb3ZlXCIsIHRoaXMubW91c2Vtb3ZlLmJpbmQodGhpcykgKTtcblx0XHRcdFxuXHRcdHJldHVybiBzdmc7XG5cdH0sXG5cdFxuXHRjcmVhdGVCYWNrZHJvcCA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHJldHVybiB0aGlzLiRzY29wZS5hcHBlbmQoXCJyZWN0XCIpXG5cdFx0ICAgIC5hdHRyKFwid2lkdGhcIiwgdGhpcy53aWR0aClcblx0XHQgICAgLmF0dHIoXCJoZWlnaHRcIiwgdGhpcy5oZWlnaHQpXG5cdFx0XHQuYXR0cihcImlkXCIsIFwibm9kZS1lZGl0b3ItYmFja2Ryb3BcIik7XG5cdFx0XHRcblx0fSxcblx0XG5cdHNldEhhbmRsZXJzIDogZnVuY3Rpb24oKSB7XG5cdFx0Ly90aGlzLnRyZWUub24oXCJjaGFuZ2VkXCIsIF8uZGVib3VuY2UoIHRoaXMucmVzdGFydC5iaW5kKHRoaXMpLCAxICkgKTtcblx0XHR0aGlzLnRyZWUub24oXCJjaGFuZ2VkXCIsIHRoaXMucmVzdGFydC5iaW5kKHRoaXMpICk7XG5cdH0sXG5cdFxuXHR0aWNrIDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0dGhpcy4kbGlua3MuYXR0cihcIngxXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc291cmNlLng7IH0pXG5cdFx0XHQuYXR0cihcInkxXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQuc291cmNlLnk7IH0pXG5cdFx0XHQuYXR0cihcIngyXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGFyZ2V0Lng7IH0pXG5cdFx0XHQuYXR0cihcInkyXCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQudGFyZ2V0Lnk7IH0pO1xuXG5cdFx0dGhpcy4kbm9kZXMuYXR0cihcImN4XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIGQueDsgfSlcblx0XHRcdC5hdHRyKFwiY3lcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gZC55OyB9KTtcblx0fSxcblx0XG5cdHJlc3RhcnQgOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdHlwZXM7XG5cdFxuXHRcdHRoaXMuJGxpbmtzID0gdGhpcy4kbGlua3MuZGF0YSggdGhpcy50cmVlLmxpbmtzICk7XG5cblx0XHR0aGlzLiRsaW5rcy5lbnRlcigpLmluc2VydChcImxpbmVcIiwgXCIubm9kZVwiKVxuXHRcdFx0LmF0dHIoXCJjbGFzc1wiLCBcImxpbmtcIik7XG5cblx0XG5cdFx0Ly8gdmFyIGRyYWcgPSB0aGlzLmZvcmNlLmRyYWcoKVxuXHRcdC8vIC5vbihcImRyYWdzdGFydFwiLCB3cmFwU2NvcGUoZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdC8vXG5cdFx0Ly8gXHRkMy5ldmVudC5zb3VyY2VFdmVudFxuXHRcdC8vIFx0dGhpcy5kcmFnZ2luZyA9IHRydWU7XG5cdFx0Ly9cblx0XHQvLyBcdHRoaXMuJG5vZGVzLmNsYXNzZWQoIFwiZml4ZWRcIiwgZnVuY3Rpb24oZCkge1xuXHRcdC8vIFx0XHRyZXR1cm4gZC5maXhlZCA9IHRydWVcblx0XHQvLyBcdH0pO1xuXHRcdC8vXG5cdFx0Ly8gfSwgdGhpcykgKVxuXHRcdC8vIC5vbihcImRyYWdlbmRcIiwgZnVuY3Rpb24oIGQgKSB7XG5cdFx0Ly9cblx0XHQvLyBcdHRoaXMuZHJhZ2dpbmcgPSBmYWxzZTtcblx0XHQvL1xuXHRcdC8vIFx0dGhpcy4kbm9kZXMuY2xhc3NlZCggXCJmaXhlZFwiLCBmdW5jdGlvbihkKSB7XG5cdFx0Ly8gXHRcdHJldHVybiBkLmZpeGVkID0gZmFsc2Vcblx0XHQvLyBcdH0pO1xuXHRcdC8vXG5cdFx0Ly9cblx0XHQvLyB9LmJpbmQodGhpcykgKVxuXG5cdFx0dGhpcy51cGRhdGVOb2RlcygpO1xuXHRcdFx0XG5cdFx0dGhpcy4kbm9kZXMgPSB0aGlzLiRzY29wZS5zZWxlY3RBbGwoXCIubm9kZVwiKTtcblx0XHRcblx0XHQvL3RoaXMuJG5vZGVzLmNhbGwoZHJhZyk7XG5cdFx0dGhpcy5mb3JjZS5zdGFydCgpO1xuXHRcdFxuXHRcdHRoaXMuZGlzcGF0Y2goeyB0eXBlOiBcIm5vZGVzQWRkZWRcIiB9KTtcblx0fSxcblx0XG5cdHVwZGF0ZU5vZGVzIDogZnVuY3Rpb24oKSB7XG5cdFx0XG5cdFx0Ly9jdXJyZW50LCBuZXdcblx0XHR2YXIgY1R5cGVzUHJlc2VudCwgblR5cGVzUHJlc2VudCwgbm9kZURhdGFCeVR5cGU7XG5cblx0XHRub2RlRGF0YUJ5VHlwZSA9IF8uZ3JvdXBCeSggdGhpcy50cmVlLm5vZGVzLCBmdW5jdGlvbiggbm9kZSApIHtcblx0XHRcdHJldHVybiBub2RlLnR5cGU7XG5cdFx0fSk7XG5cdFx0Y1R5cGVzUHJlc2VudCA9IF8ua2V5cyggbm9kZURhdGFCeVR5cGUgKTtcblx0XHRuVHlwZXNQcmVzZW50ID0gXy5kaWZmZXJlbmNlKCBjVHlwZXNQcmVzZW50LCB0aGlzLmluaXRpYXRlZE5vZGVUeXBlcyApO1xuXHRcdFxuXHRcdHRoaXMuaW5pdGlhdGVOb2RlVHlwZXMoIG5UeXBlc1ByZXNlbnQgKTtcblx0XHR0aGlzLmFkZE5ld05vZGVzKCBub2RlRGF0YUJ5VHlwZSApO1xuXHRcdFxuXHRcdFxuXHR9LFxuXHRcblx0aW5pdGlhdGVOb2RlVHlwZXMgOiBmdW5jdGlvbiggbmV3VHlwZXMgKSB7XG5cdFx0XG5cdFx0aWYobmV3VHlwZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cdFx0XG5cdFx0dGhpcy5pbml0aWF0ZWROb2RlVHlwZXMgPSBfLmZsYXR0ZW4oIFt0aGlzLmluaXRpYXRlZE5vZGVUeXBlcywgbmV3VHlwZXNdICk7XG5cdFx0XG5cdFx0Xy5lYWNoKCBuZXdUeXBlcywgZnVuY3Rpb24oIHR5cGUgKSB7XG5cdFx0XHRcblx0XHRcdHRoaXMubm9kZVR5cGVzW3R5cGVdID0gbmV3IG5vZGVUeXBlQ2xhc3Nlc1t0eXBlXSggdGhpcyApO1xuXHRcdFx0XG5cdFx0fSwgdGhpcyk7XG5cdFx0XG5cdH0sXG5cdFxuXHRhZGROZXdOb2RlcyA6IGZ1bmN0aW9uKCBub2RlRGF0YUJ5VHlwZSApe1xuXHRcdFxuXHRcdF8uZWFjaChub2RlRGF0YUJ5VHlwZSwgZnVuY3Rpb24oIG5vZGVEYXRhLCB0eXBlICkge1xuXHRcdFx0XG5cdFx0XHR0aGlzLm5vZGVUeXBlc1t0eXBlXS5hcHBlbmROZXdOb2Rlcyggbm9kZURhdGEgKTtcblx0XHRcdFxuXHRcdH0sIHRoaXMpO1xuXHRcdFxuXHR9LFxuXHRcblx0Z2V0JEVsRnJvbU5vZGUgOiBmdW5jdGlvbiggbm9kZSApIHtcblx0XHRyZXR1cm4gdGhpcy4kbm9kZXMuZmlsdGVyKGZ1bmN0aW9uKGQpIHtcblx0XHRcdHJldHVybiBkLmlkID09PSBub2RlLmlkO1xuXHRcdH0pO1xuXHR9XG5cdFxufTtcblxuRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5hcHBseSggTm9kZUVkaXRvci5wcm90b3R5cGUgKTtcbiIsInZhciBFdmVudERpc3BhdGNoZXIgPSByZXF1aXJlKCcuLi91dGlscy9FdmVudERpc3BhdGNoZXInKTtcbnZhciBUcmVlID0gZnVuY3Rpb24oIHJvb3QsIG5vZGVzLCBsaW5rcyApIHtcblx0XG5cdHRoaXMucm9vdCA9IHJvb3Q7XG5cdHRoaXMubm9kZXMgPSBub2Rlcztcblx0dGhpcy5saW5rcyA9IGxpbmtzO1xuXHRcblx0dGhpcy5kaXNwYXRjaCh7XG5cdFx0dHlwZTogXCJjaGFuZ2VkXCJcblx0fSk7XG5cdFxufTtcblxudmFyIGNvbXBhcmVUb1Byb3BlcnR5ID0gZnVuY3Rpb24oIG5vZGUsIGtleSApIHtcblx0cmV0dXJuIGZ1bmN0aW9uKCBsaW5rICkge1xuXHRcdHJldHVybiBsaW5rW2tleV0gPT09IG5vZGU7XG5cdH07XHRcdFxufTtcblxuVHJlZS5wcm90b3R5cGUgPSB7XG5cdFxuXHRpZCA6IDAsXG5cdFxuXHRpc0NoaWxkIDogZnVuY3Rpb24oIHBhcmVudCwgY2hpbGQgKSB7XG5cdFx0XG5cdFx0dmFyIGxpbmtzID0gXy5maWx0ZXIoIHRoaXMubGlua3MsIGNvbXBhcmVUb1Byb3BlcnR5KHBhcmVudCwgXCJzb3VyY2VcIikgKTtcblx0XHRcdFx0XG5cdFx0cmV0dXJuIF8ucmVkdWNlKCBsaW5rcywgZnVuY3Rpb24oIG1lbW8sIGxpbmsgKSB7XG5cdFx0XHRcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdG1lbW8gfHxcblx0XHRcdFx0bGluay50YXJnZXQgPT09IGNoaWxkIHx8XG5cdFx0XHRcdHRoaXMuaXNDaGlsZCggbGluay50YXJnZXQsIGNoaWxkIClcblx0XHRcdCk7XG5cdFx0XHRcblx0XHR9LCBmYWxzZSwgdGhpcyk7XG5cdFx0XG5cdH0sXG5cdFxuXHRpc0ltbWVkaWF0ZUNoaWxkIDogZnVuY3Rpb24oIHRyZWUsIHBhcmVudCwgY2hpbGQgKSB7XG5cdFx0XG5cdFx0dmFyIGxpbmtzID0gXy5maWx0ZXIoIHRoaXMubGlua3MsIGNvbXBhcmVUb1Byb3BlcnR5KHBhcmVudCwgXCJzb3VyY2VcIikgKTtcblx0XHRcdFx0XG5cdFx0cmV0dXJuIF8uZWFjaCggbGlua3MsIGZ1bmN0aW9uKCBtZW1vLCBsaW5rICkge1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gbWVtbyB8fCBsaW5rLnRhcmdldCA9PT0gY2hpbGQ7XG5cdFx0XHRcblx0XHR9LCBmYWxzZSk7XG5cdFx0XG5cdH0sXG5cdFxuXHRoYXNQYXJlbnRzIDogZnVuY3Rpb24oIG5vZGUgKSB7XG5cdFx0dmFyIGxpbmtzID0gXy5maWx0ZXIoIHRoaXMubGlua3MsIGNvbXBhcmVUb1Byb3BlcnR5KG5vZGUsIFwidGFyZ2V0XCIpICk7XG5cdFx0XG5cdFx0cmV0dXJuIGxpbmtzLmxlbmd0aCA+IDA7XG5cdH0sXG5cdFxuXHRnZXROb2RlQnlJZCA6IGZ1bmN0aW9uKCBpZCApIHtcblx0XHRcblx0XHRyZXR1cm4gXy5maWx0ZXIoIHRoaXMubm9kZXMsIGZ1bmN0aW9uKCBub2RlICkge1xuXHRcdFx0cmV0dXJuIG5vZGUuaWQgPT09IGlkO1xuXHRcdH0pO1xuXHRcdFxuXHR9LFxuXHRcblx0bGlua0FuZ2xlIDogZnVuY3Rpb24oIGxpbmsgKSB7XG5cdFx0XG5cdFx0cmV0dXJuIE1hdGguYXRhbjIobGluay5zb3VyY2UueSAtIGxpbmsudGFyZ2V0LnksIGxpbmsuc291cmNlLnggLSBsaW5rLnRhcmdldC54KTtcblx0XHRcblx0fSxcblx0XG5cdG5hdmlnYXRlVXAgOiBmdW5jdGlvbiggbm9kZSApIHtcblx0XHRcblx0XHR2YXIgbGluayA9IF8uZmluZCggdGhpcy5saW5rcywgZnVuY3Rpb24oIGxpbmsgKSB7XG5cdFx0XHRyZXR1cm4gbGluay50YXJnZXQgPT09IG5vZGU7XG5cdFx0fSk7XG5cdFx0XG5cdFx0XG5cdFx0aWYobGluaykge1xuXHRcdFx0cmV0dXJuIGxpbmsuc291cmNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cdFx0XG5cdH0sXG5cdFxuXHRuYXZpZ2F0ZURvd24gOiBmdW5jdGlvbiggbm9kZSApIHtcblx0XHRcblx0XHQvL1RFU1QgTUVcblx0XHRcblx0XHR2YXIgcGFyZW50TGluaywgbGlua3MsIHBhcmVudEFuZ2xlLCBsaW5rV2l0aE1vc3RTaW1pbGFyQW5nbGU7XG5cdFx0XG5cdFx0bGlua3MgPSBfLmZpbHRlciggdGhpcy5saW5rcywgZnVuY3Rpb24oIGxpbmsgKSB7XG5cdFx0XHRyZXR1cm4gbGluay5zb3VyY2UgPT09IG5vZGU7XG5cdFx0fSk7XG5cdFx0XG5cdFx0XG5cdFx0aWYobGlua3MubGVuZ3RoID49IDEpIHtcblx0XHRcdFxuXHRcdFx0cGFyZW50TGluayA9IF8uZmluZCggdGhpcy5saW5rcywgZnVuY3Rpb24oIGxpbmsgKSB7XG5cdFx0XHRcdHJldHVybiBsaW5rLnRhcmdldCA9PT0gbm9kZTtcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHRpZihwYXJlbnRMaW5rKSB7XG5cdFx0XHRcdHBhcmVudEFuZ2xlID0gdGhpcy5saW5rQW5nbGUoIHBhcmVudExpbmsgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHBhcmVudEFuZ2xlID0gTWF0aC5QSSAqIDEuNTtcblx0XHRcdH1cblx0XHRcdFxuXHRcdFx0dmFyIGFuZ2xlcyA9IF8ubWFwKCBsaW5rcywgdGhpcy5saW5rQW5nbGUgKTtcblx0XHRcdFxuXHRcdFx0bGlua1dpdGhNb3N0U2ltaWxhckFuZ2xlID0gXy5yZWR1Y2UoIGFuZ2xlcywgZnVuY3Rpb24oIG1lbW8sIGFuZ2xlLCBpICkge1xuXHRcdFx0XHRcblx0XHRcdFx0dmFyIGFuZ2xlRGlmZiA9IE1hdGguYWJzKCBwYXJlbnRBbmdsZSAtIGFuZ2xlICk7XG5cdFx0XHRcdFxuXHRcdFx0XHRpZiggbWVtby5saW5rICkge1xuXHRcdFx0XHRcdFxuXHRcdFx0XHRcdGlmKCBtZW1vLmFuZ2xlRGlmZiA8IGFuZ2xlRGlmZiApIHtcblx0XHRcdFx0XHRcdHJldHVybiBtZW1vO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRsaW5rOiBsaW5rc1tpXSxcblx0XHRcdFx0XHRcdFx0YW5nbGVEaWZmOiBhbmdsZURpZmZcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRsaW5rOiBsaW5rc1tpXSxcblx0XHRcdFx0XHRcdGFuZ2xlRGlmZjogYW5nbGVEaWZmXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0XHRcblx0XHRcdH0sIHt9ICk7XG5cdFx0XHRcblx0XHRcdHJldHVybiBsaW5rV2l0aE1vc3RTaW1pbGFyQW5nbGUubGluay50YXJnZXQ7XG5cdFx0XHRcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdFxuXHR9LFxuXHRcblx0X25hdmlnYXRlU2libGluZ3MgOiBmdW5jdGlvbiggbm9kZSwgZGlyZWN0aW9uICkge1xuXHRcdFxuXHRcdHZhciBwYXJlbnRMaW5rLCBwYXJlbnRBbmdsZSwgc2libGluZ0xpbmtzLCBuZXh0TGluaywgc2libGluZ0FuZ2xlcztcblx0XHRcblx0XHRwYXJlbnRMaW5rID0gXy5maW5kKCB0aGlzLmxpbmtzLCBmdW5jdGlvbiggbGluayApIHtcblx0XHRcdHJldHVybiBsaW5rLnRhcmdldCA9PT0gbm9kZTtcblx0XHR9KTtcblx0XHRcblx0XHRpZighcGFyZW50TGluaykgcmV0dXJuIG51bGw7XG5cdFx0XG5cdFx0c2libGluZ0xpbmtzID0gXy5maWx0ZXIoIHRoaXMubGlua3MsIGZ1bmN0aW9uKCBsaW5rICkge1xuXHRcdFx0cmV0dXJuIHBhcmVudExpbmsuc291cmNlID09PSBsaW5rLnNvdXJjZSAmJiBsaW5rLnRhcmdldCAhPT0gbm9kZTtcblx0XHR9KTtcblx0XG5cdFx0aWYoIHBhcmVudExpbmsgJiYgc2libGluZ0xpbmtzLmxlbmd0aCA+PSAxICkge1xuXHRcdFx0XG5cdFx0XHRwYXJlbnRBbmdsZSA9IHRoaXMubGlua0FuZ2xlKCBwYXJlbnRMaW5rICk7XG5cdFx0XHRcblx0XHRcdHNpYmxpbmdBbmdsZXMgPSBfLm1hcCggc2libGluZ0xpbmtzLCB0aGlzLmxpbmtBbmdsZSApO1xuXHRcdFxuXHRcdFx0bmV4dExpbmsgPSBfLnJlZHVjZSggc2libGluZ0FuZ2xlcywgZnVuY3Rpb24oIG1lbW8sIGFuZ2xlLCBpICkge1xuXHRcdFx0XG5cdFx0XHRcdHZhciBhbmdsZURpZmYgPSAoICggcGFyZW50QW5nbGUgLSBhbmdsZSApICogZGlyZWN0aW9uICkgJSAoIDIgKiBNYXRoLlBJICk7XG5cdFx0XHRcdGlmKCBhbmdsZURpZmYgPCAwICkgYW5nbGVEaWZmICs9IDIgKiBNYXRoLlBJO1xuXHRcdFx0XG5cdFx0XHRcdGlmKCBtZW1vLmxpbmsgKSB7XG5cdFx0XHRcdFxuXHRcdFx0XHRcdGlmKCBtZW1vLmFuZ2xlRGlmZiA8IGFuZ2xlRGlmZiApIHtcblx0XHRcdFx0XHRcdHJldHVybiBtZW1vO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRsaW5rOiBzaWJsaW5nTGlua3NbaV0sXG5cdFx0XHRcdFx0XHRcdGFuZ2xlRGlmZjogYW5nbGVEaWZmXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdGxpbms6IHNpYmxpbmdMaW5rc1tpXSxcblx0XHRcdFx0XHRcdGFuZ2xlRGlmZjogYW5nbGVEaWZmXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR9LCB7fSApO1xuXHRcdFx0XG5cdFx0XHRyZXR1cm4gbmV4dExpbmsubGluay50YXJnZXQ7XG5cdFx0fVxuXHRcdFxuXHR9LFxuXHRcblx0bmF2aWdhdGVMZWZ0IDogZnVuY3Rpb24oIG5vZGUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuX25hdmlnYXRlU2libGluZ3MoIG5vZGUsIC0xICk7XG5cdH0sXG5cdFxuXHRuYXZpZ2F0ZVJpZ2h0IDogZnVuY3Rpb24oIG5vZGUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuX25hdmlnYXRlU2libGluZ3MoIG5vZGUsIDEgKTtcblx0fSxcblx0XG5cdF9uZWFyZXN0SW5SYW5nZSA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdGZ1bmN0aW9uIHJhbmdlSXNQb29ybHlGb3JtZWQoIGxvd2VyUmFkaWFucywgdXBwZXJSYWRpYW5zICkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0bG93ZXJSYWRpYW5zID49IHVwcGVyUmFkaWFucyB8fFxuXHRcdFx0XHR1cHBlclJhZGlhbnMgLSBsb3dlclJhZGlhbnMgPiAyICogTWF0aC5QSSB8fFxuXHRcdFx0XHRsb3dlclJhZGlhbnMgPiAyICogTWF0aC5QSVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0XG5cdFx0ZnVuY3Rpb24gaXNJblJhbmdlKCBhbmdsZSwgbG93ZXJSYWRpYW5zLCB1cHBlclJhZGlhbnMpIHtcblx0XHRcdFxuXHRcdFx0YW5nbGUgJT0gMiAqIE1hdGguUEk7XG5cdFx0XHRpZiggYW5nbGUgPCAwICkgYW5nbGUgKz0gMiAqIE1hdGguUEk7XG5cdFx0XHRcblx0XHRcdGlmKCBhbmdsZSA8IGxvd2VyUmFkaWFucyApIHtcblx0XHRcdFx0YW5nbGUgKz0gMiAqIE1hdGguUEk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHJldHVybiBhbmdsZSA+PSBsb3dlclJhZGlhbnMgJiYgYW5nbGUgPCB1cHBlclJhZGlhbnM7XG5cdFx0XHRcblx0XHRcdFxuXHRcdH1cblx0XHRcblx0XHRyZXR1cm4gZnVuY3Rpb24oIG5vZGVBLCBsb3dlclJhZGlhbnMsIHVwcGVyUmFkaWFucyApIHtcblx0XHRcblx0XHRcdGlmKCByYW5nZUlzUG9vcmx5Rm9ybWVkKCBsb3dlclJhZGlhbnMsIHVwcGVyUmFkaWFucyApICkge1xuXHRcdFx0XHR0aHJvdyBcIlRoZSBkZWZpbmVkIHJhbmdlIGlzIHBvb3JseSBmb3JtZWQuXCI7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdHZhciByZXN1bHQgPSBfLnJlZHVjZSh0aGlzLm5vZGVzLCBmdW5jdGlvbiggbWVtbywgbm9kZUIgKSB7XG5cdFx0XHRcblx0XHRcdFx0aWYoIG5vZGVBID09PSBub2RlQiApIHJldHVybiBtZW1vO1xuXHRcdFx0XHRcblx0XHRcdFx0dmFyIGRpc3RhbmNlU3E7XG5cdFx0XHRcdHZhciBkZWx0YVggPSBub2RlQi54IC0gbm9kZUEueDtcblx0XHRcdFx0dmFyIGRlbHRhWSA9IG5vZGVCLnkgLSBub2RlQS55O1xuXHRcdFx0XHR2YXIgYW5nbGUgPSBNYXRoLmF0YW4yKCBkZWx0YVksIGRlbHRhWCApXG5cdFx0XHRcblx0XHRcdFx0aWYoIGlzSW5SYW5nZSggYW5nbGUsIGxvd2VyUmFkaWFucywgdXBwZXJSYWRpYW5zICkgKSB7XG5cdFx0XHRcblx0XHRcdFx0XHRkaXN0YW5jZVNxID0gZGVsdGFYICogZGVsdGFYICsgZGVsdGFZICogZGVsdGFZO1xuXHRcdFx0XHRcblx0XHRcdFx0XHRpZiggIW1lbW8gfHwgZGlzdGFuY2VTcSA8IG1lbW8uZGlzdGFuY2VTcSApIHtcblx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdGRpc3RhbmNlU3EgOiBkaXN0YW5jZVNxLFxuXHRcdFx0XHRcdFx0XHRub2RlOiBub2RlQlxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbWVtbztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiBtZW1vO1xuXHRcdFx0XHR9XG5cdFx0XHRcblx0XHRcdH0sIG51bGwpO1xuXHRcdFx0XG5cdFx0XHRpZihyZXN1bHQpIHtcblx0XHRcdFx0cmV0dXJuIHJlc3VsdC5ub2RlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSgpLFxuXHRcblx0bmVhcmVzdERvd24gOiBmdW5jdGlvbiggbm9kZSApIHtcblx0XHRyZXR1cm4gdGhpcy5fbmVhcmVzdEluUmFuZ2UoIG5vZGUsIChNYXRoLlBJKjAuMjApLCAoTWF0aC5QSSowLjgwKSApO1xuXHR9LFxuXHRcblx0bmVhcmVzdExlZnQgOiBmdW5jdGlvbiggbm9kZSApIHtcblx0XHRyZXR1cm4gdGhpcy5fbmVhcmVzdEluUmFuZ2UoIG5vZGUsIChNYXRoLlBJKjAuODApLCAoTWF0aC5QSSoxLjIwKSApO1xuXHR9LFxuXHRcblx0bmVhcmVzdFVwIDogZnVuY3Rpb24oIG5vZGUgKSB7XG5cdFx0cmV0dXJuIHRoaXMuX25lYXJlc3RJblJhbmdlKCBub2RlLCAoTWF0aC5QSSoxLjIwKSwgKE1hdGguUEkqMS44MCkgKTtcblx0fSxcblx0XG5cdG5lYXJlc3RSaWdodCA6IGZ1bmN0aW9uKCBub2RlICkge1xuXHRcdHJldHVybiB0aGlzLl9uZWFyZXN0SW5SYW5nZSggbm9kZSwgKE1hdGguUEkqMS44MCksIChNYXRoLlBJKjIuMjApICk7XG5cdH0sXG5cdFxuXHRhZGRMaW5rIDogZnVuY3Rpb24oIHNvdXJjZSwgdGFyZ2V0ICkge1xuXHRcdFxuXHRcdHRoaXMubGlua3MucHVzaCh7c291cmNlOiBzb3VyY2UsIHRhcmdldDogdGFyZ2V0fSk7XG5cdFxuXHRcdHRoaXMuZGlzcGF0Y2goe1xuXHRcdFx0dHlwZTogXCJjaGFuZ2VkXCJcblx0XHR9KTtcblx0XHRcblx0fSxcblx0XG5cdGFkZE5vZGUgOiBmdW5jdGlvbiggbm9kZSwgcGFyZW50ICkge1xuXHRcdHRoaXMubm9kZXMucHVzaCggbm9kZSApO1xuXHRcdFxuXHRcdGlmKCBwYXJlbnQgKSB7XG5cdFx0XHR0aGlzLmxpbmtzLnB1c2goe3NvdXJjZTogcGFyZW50LCB0YXJnZXQ6IG5vZGV9KTtcblx0XHR9XG5cdFx0XG5cdFx0dGhpcy5kaXNwYXRjaCh7XG5cdFx0XHR0eXBlOiBcImNoYW5nZWRcIlxuXHRcdH0pO1xuXHRcdFxuXHRcdHJldHVybiBub2RlO1xuXHR9LFxuXHRcblx0aGFzTmFOIDogZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coXG5cdFx0XHRfLnJlZHVjZSggdGhpcy5ub2RlcywgZnVuY3Rpb24oIG1lbW8sIG5vZGUgKSB7XG5cdFx0XHRcdHJldHVybiBpc05hTihub2RlLngpIHx8IG1lbW87XG5cdFx0XHR9LCBmYWxzZSlcblx0XHQpO1xuXHR9LFxuXHRcblx0YWRkTm9kZUJ5VHlwZSA6IGZ1bmN0aW9uKCB0eXBlLCB4LCB5LCBwYXJlbnQgKSB7XG5cdFx0XG5cdFx0dmFyIG5vZGUgPSB7XG5cdFx0XHR4OiB4LFxuXHRcdFx0eTogeSxcblx0XHRcdHB4OiB4LFxuXHRcdFx0cHk6IHksXG5cdFx0XHR0eXBlOiB0eXBlLFxuXHRcdFx0ZGVwdGg6IChwYXJlbnQgPyBwYXJlbnQuZGVwdGggKyAxIDogMCksXG5cdFx0XHRpZDogKytUcmVlLnByb3RvdHlwZS5pZFxuXHRcdH07XG5cdFx0XG5cdFx0cmV0dXJuIHRoaXMuYWRkTm9kZSggbm9kZSwgcGFyZW50ICk7XG5cdFx0XG5cdH0sXG5cdFxuXHRzZWxlY3QgOiBmdW5jdGlvbiggbm9kZSApIHtcblx0XHRcblx0fSxcblx0XG5cdGNoYW5nZUxpbmtTb3VyY2UgOiBmdW5jdGlvbiggc291cmNlLCB0YXJnZXQgKSB7XG5cdFx0XG5cdFx0aWYoIHRoaXMuaXNDaGlsZCggc291cmNlLCB0YXJnZXQgKSApIHJldHVybjtcblx0XHRcblx0XHR2YXIgbGlua1RvUmVtb3ZlID0gXy5maW5kKCB0aGlzLmxpbmtzLCBmdW5jdGlvbiggbGluayApIHtcblx0XHRcdHJldHVybiBsaW5rLnRhcmdldCA9PT0gc291cmNlO1xuXHRcdH0pO1xuXHRcdFxuXHRcdHRoaXMubGlua3Muc3BsaWNlKCB0aGlzLmxpbmtzLmluZGV4T2YoIGxpbmtUb1JlbW92ZSApLCAxICk7XG5cdFx0XG5cdFx0dGhpcy5hZGRMaW5rKCB0YXJnZXQsIHNvdXJjZSApO1xuXHR9XG5cdFxufTtcblxuRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5hcHBseSggVHJlZS5wcm90b3R5cGUgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBUcmVlOyIsInZhciBzaG9ydGN1dHMgPSByZXF1aXJlKCcuLi8uLi9lbnZpcm9ubWVudC9zaG9ydGN1dHMvbm9kZUVkaXRvci5zaG9ydGN1dHMuanMnKSxcblx0Tm9kZUxhc3NvID0gcmVxdWlyZSgnLi4vdG9vbHMvTm9kZUxhc3NvJyk7XG5cbnZhciBHcm91cE5vZGUgPSBmdW5jdGlvbiggbm9kZUVkaXRvciwgc2V0dGluZ3MgKSB7XG5cdFxuXHR0aGlzLnNob3J0Y3V0cyA9IHNob3J0Y3V0cy5ub2RlVHlwZXMuZ3JvdXA7XG5cdFxuXHR0aGlzLm5vZGVFZGl0b3IgPSBub2RlRWRpdG9yO1xuXHR0aGlzLiRzY29wZSA9IG5vZGVFZGl0b3IuJHNjb3BlO1xuXHRcblx0dGhpcy5jc3NDbGFzcyA9IFwibm9kZS10eXBlLWdyb3VwXCI7XG5cdHRoaXMuJG5vZGVzID0gdGhpcy4kc2NvcGUuc2VsZWN0QWxsKFwiLlwiK3RoaXMuY3NzQ2xhc3MpO1xuXHR0aGlzLm5vZGVMYXNzbyA9IG5ldyBOb2RlTGFzc28oIHRoaXMubm9kZUVkaXRvciwgdGhpcy5zaG9ydGN1dHMuZHJhd0xpbmUgKTtcblx0XG5cdHRoaXMubm9kZUxhc3NvLm9uKCAnbGFzc28nLCB0aGlzLm9uTGFzc28uYmluZCh0aGlzKSApO1xuXHR0aGlzLm5vZGVMYXNzby5vbiggJ2VtcHR5UmVsZWFzZScsIHRoaXMub25FbXB0eVJlbGVhc2UuYmluZCh0aGlzKSApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBHcm91cE5vZGU7XG5cbkdyb3VwTm9kZS5wcm90b3R5cGUgPSB7XG5cdFxuXHRhcHBlbmROZXdOb2RlcyA6IGZ1bmN0aW9uKCBkYXRhICkge1xuXHRcdFxuXHRcdHZhciAkbm9kZXMgPSB0aGlzLiRub2Rlc1xuXHRcdFx0LmRhdGEoIGRhdGEsIGZ1bmN0aW9uKGQpIHtyZXR1cm4gZC5pZDt9IClcblx0XHRcdC5lbnRlcigpLmFwcGVuZChcImNpcmNsZVwiKVxuXHRcdFx0LmF0dHIoXCJjbGFzc1wiLCBcIm5vZGUgXCIgKyB0aGlzLmNzc0NsYXNzKVxuXHRcdFx0LmF0dHIoXCJyXCIsIGZ1bmN0aW9uKGQpIHtcblx0XHRcdFx0cmV0dXJuIE1hdGgubWF4KDEwIC0gZC5kZXB0aCwgMyk7XG5cdFx0XHR9KTtcblx0XHRcdFxuXHRcdHRoaXMuc2V0SGFuZGxlcnMoICRub2RlcyApO1xuXHRcdFx0XG5cdFx0cmV0dXJuICRub2Rlcztcblx0XHRcdFxuXHR9LFxuXHRcblx0c2V0SGFuZGxlcnMgOiBmdW5jdGlvbiggJG5ld05vZGVzICkge1xuXHRcdFxuXHRcdHRoaXMubm9kZUxhc3NvLnNldEhhbmRsZXJzKCAkbmV3Tm9kZXMgKTtcblxuXHR9LFxuXHRcblx0b25MYXNzbyA6IGZ1bmN0aW9uKCBlICkge1xuXHRcdHRoaXMubm9kZUVkaXRvci50cmVlLmNoYW5nZUxpbmtTb3VyY2UoIGUuc291cmNlLCBlLnRhcmdldCApO1xuXHR9LFxuXHRcblx0b25FbXB0eVJlbGVhc2UgOiBmdW5jdGlvbiggZSApIHtcblx0XHRcblx0XHR2YXIgcGFyZW50ID0gZDMuc2VsZWN0KGUuc291cmNlKS5kYXRhKClbMF07XG5cdFx0dmFyIG5vZGUgPSB0aGlzLm5vZGVFZGl0b3IudHJlZS5hZGROb2RlQnlUeXBlKCBcImdyb3VwXCIsIGUueCwgZS55LCBwYXJlbnQgKTtcblx0XHRcblx0fVxuXHRcbn07IiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cdGdyb3VwIDogcmVxdWlyZSgnLi9ncm91cCcpLFxuXHRyb290IDogcmVxdWlyZSgnLi9yb290JyksXG5cdHZlY3RvciA6IHJlcXVpcmUoJy4vdmVjdG9yJylcbn07IiwidmFyIEdyb3VwTm9kZSA9IHJlcXVpcmUoJy4vZ3JvdXAnKTtcblxudmFyIFJvb3ROb2RlID0gZnVuY3Rpb24oKSB7XG5cdFxuXHRHcm91cE5vZGUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcblx0Ly9DaGFuZ2UgY3NzQ2xhc3Ncblx0dGhpcy5jc3NDbGFzcyA9IFwibm9kZS10eXBlLXJvb3RcIjtcblx0dGhpcy4kbm9kZXMgPSB0aGlzLiRzY29wZS5zZWxlY3RBbGwoXCIuXCIrdGhpcy5jc3NDbGFzcyk7XG5cdFxufTtcblxuUm9vdE5vZGUucHJvdG90eXBlID0gXy5leHRlbmQoIHt9LCBHcm91cE5vZGUucHJvdG90eXBlLCB7XG5cdFxuXHRcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJvb3ROb2RlOyIsInZhciBWZWN0b3JOb2RlID0gZnVuY3Rpb24oIG5vZGVFZGl0b3IgKSB7XG5cdFxuXHR0aGlzLm5vZGVFZGl0b3IgPSBub2RlRWRpdG9yO1xuXHR0aGlzLiRzY29wZSA9IG5vZGVFZGl0b3IuJHNjb3BlO1xuXHRcblx0dGhpcy5jc3NDbGFzcyA9IFwibm9kZS10eXBlLXZlY3RvclwiO1xuXHR0aGlzLiRub2RlcyA9IHRoaXMuJHNjb3BlLnNlbGVjdEFsbChcIi5cIit0aGlzLmNzc0NsYXNzKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVmVjdG9yTm9kZTtcblxuVmVjdG9yTm9kZS5wcm90b3R5cGUgPSB7XG5cblx0YXBwZW5kTmV3Tm9kZXMgOiBmdW5jdGlvbiggZGF0YSApIHtcblx0XHRcblx0XHRyZXR1cm4gdGhpcy4kbm9kZXNcblx0XHRcdC5kYXRhKCBkYXRhLCBmdW5jdGlvbihkKSB7cmV0dXJuIGQuaWQ7fSApXG5cdFx0XHQuZW50ZXIoKS5hcHBlbmQoXCJjaXJjbGVcIilcblx0XHRcdC5hdHRyKFwiY2xhc3NcIiwgXCJub2RlIFwiICsgdGhpcy5jc3NDbGFzcylcblx0XHRcdC5hdHRyKFwiclwiLCA1KTtcblx0XHRcdFxuXHR9LFxuXHRcbn07IiwidmFyXHRzaG9ydGN1dHMgPSByZXF1aXJlKCcuLi8uLi9lbnZpcm9ubWVudC9zaG9ydGN1dHMvbm9kZUVkaXRvci5zaG9ydGN1dHMnKS5jdXJzb3IsXG5cdHdyYXBTY29wZSA9IHJlcXVpcmUoXCIuLi8uLi91dGlscy93cmFwU2NvcGVcIik7XG5cbnZhciBDdXJzb3IgPSBmdW5jdGlvbiggbm9kZUVkaXRvciwgJG5vZGUgKSB7XG5cdFxuXHR0aGlzLm5vZGVFZGl0b3IgPSBub2RlRWRpdG9yO1xuXHR0aGlzLiRub2RlID0gbnVsbDtcblx0XG5cdGlmKCAkbm9kZSApIHtcblx0XHR0aGlzLnNldE5vZGUoICRub2RlICk7XG5cdH1cblx0dGhpcy5hZGRIYW5kbGVycygpO1xuXHR0aGlzLmFkZCgpO1xuXHRcblx0dGhpcy5oYW5kbGVIb3ZlciA9IHdyYXBTY29wZSggdGhpcy5ob3ZlciwgdGhpcyApO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBDdXJzb3I7XG5cbkN1cnNvci5wcm90b3R5cGUgPSB7XG5cdFxuXHRhZGRIYW5kbGVycyA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMubm9kZUVkaXRvci5rZXlib2FyZC5vbiggc2hvcnRjdXRzLnVwLCB0aGlzLnVwLCB0aGlzICk7XG5cdFx0dGhpcy5ub2RlRWRpdG9yLmtleWJvYXJkLm9uKCBzaG9ydGN1dHMuZG93biwgdGhpcy5kb3duLCB0aGlzICk7XG5cdFx0dGhpcy5ub2RlRWRpdG9yLmtleWJvYXJkLm9uKCBzaG9ydGN1dHMubGVmdCwgdGhpcy5sZWZ0LCB0aGlzICk7XG5cdFx0dGhpcy5ub2RlRWRpdG9yLmtleWJvYXJkLm9uKCBzaG9ydGN1dHMucmlnaHQsIHRoaXMucmlnaHQsIHRoaXMgKTtcblx0XHR0aGlzLm5vZGVFZGl0b3Iua2V5Ym9hcmQub24oIHNob3J0Y3V0cy5zaWJsaW5nVXAsIHRoaXMuc2libGluZ1VwLCB0aGlzICk7XG5cdFx0dGhpcy5ub2RlRWRpdG9yLmtleWJvYXJkLm9uKCBzaG9ydGN1dHMuc2libGluZ0Rvd24sIHRoaXMuc2libGluZ0Rvd24sIHRoaXMgKTtcblx0XHR0aGlzLm5vZGVFZGl0b3Iua2V5Ym9hcmQub24oIHNob3J0Y3V0cy5zaWJsaW5nTGVmdCwgdGhpcy5zaWJsaW5nTGVmdCwgdGhpcyApO1xuXHRcdHRoaXMubm9kZUVkaXRvci5rZXlib2FyZC5vbiggc2hvcnRjdXRzLnNpYmxpbmdSaWdodCwgdGhpcy5zaWJsaW5nUmlnaHQsIHRoaXMgKTtcblx0XHR0aGlzLm5vZGVFZGl0b3Iub24oJ25vZGVzQWRkZWQnLCB0aGlzLmhhbmRsZU5vZGVzQWRkZWQuYmluZCh0aGlzKSApO1xuXHR9LFxuXHRcblx0cmVtb3ZlSGFuZGxlcnMgOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm5vZGVFZGl0b3Iua2V5Ym9hcmQub2ZmKCBzaG9ydGN1dHMudXAsIHRoaXMudXAsIHRoaXMgKTtcblx0XHR0aGlzLm5vZGVFZGl0b3Iua2V5Ym9hcmQub2ZmKCBzaG9ydGN1dHMuZG93biwgdGhpcy5kb3duLCB0aGlzICk7XG5cdFx0dGhpcy5ub2RlRWRpdG9yLmtleWJvYXJkLm9mZiggc2hvcnRjdXRzLmxlZnQsIHRoaXMubGVmdCwgdGhpcyApO1xuXHRcdHRoaXMubm9kZUVkaXRvci5rZXlib2FyZC5vZmYoIHNob3J0Y3V0cy5yaWdodCwgdGhpcy5yaWdodCwgdGhpcyApO1xuXHRcdHRoaXMubm9kZUVkaXRvci5rZXlib2FyZC5vZmYoIHNob3J0Y3V0cy5zaWJsaW5nVXAsIHRoaXMuc2libGluZ1VwLCB0aGlzICk7XG5cdFx0dGhpcy5ub2RlRWRpdG9yLmtleWJvYXJkLm9mZiggc2hvcnRjdXRzLnNpYmxpbmdEb3duLCB0aGlzLnNpYmxpbmdEb3duLCB0aGlzICk7XG5cdFx0dGhpcy5ub2RlRWRpdG9yLmtleWJvYXJkLm9mZiggc2hvcnRjdXRzLnNpYmxpbmdMZWZ0LCB0aGlzLnNpYmxpbmdMZWZ0LCB0aGlzICk7XG5cdFx0dGhpcy5ub2RlRWRpdG9yLmtleWJvYXJkLm9mZiggc2hvcnRjdXRzLnNpYmxpbmdSaWdodCwgdGhpcy5zaWJsaW5nUmlnaHQsIHRoaXMgKTtcblx0fSxcblx0XG5cdG5hdmlnYXRlQ2hlY2sgOiBmdW5jdGlvbiggbm9kZSApIHtcblx0XHR2YXIgJGVsO1xuXHRcdFxuXHRcdGlmKCBub2RlICkge1xuXHRcdFx0XG5cdFx0XHQkZWwgPSB0aGlzLm5vZGVFZGl0b3IuZ2V0JEVsRnJvbU5vZGUoIG5vZGUgKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5zZXROb2RlKCAkZWwsIG5vZGUgKTtcblx0XHR9XHRcblx0fSxcblx0XG5cdGhhbmRsZU5vZGVzQWRkZWQgOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dGhpcy5ub2RlRWRpdG9yLiRub2Rlcy5vbignbW91c2VvdmVyLkN1cnNvcicsIHRoaXMuaGFuZGxlSG92ZXIgKTtcblxuXHR9LFxuXHRcblx0aG92ZXIgOiBmdW5jdGlvbiggZWwgKSB7XG5cblx0XHR2YXIgJG5vZGUgPSBkMy5zZWxlY3QoZWwpO1xuXHRcdHZhciBub2RlID0gJG5vZGUuZGF0YSgpWzBdO1xuXHRcdFxuXHRcdGlmKCBub2RlICkge1xuXHRcdFx0dGhpcy5zZXROb2RlKCAkbm9kZSwgbm9kZSApO1xuXHRcdH1cblx0XHRcblx0fSxcblx0XG5cdHVwIDogZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coJ3VwJyk7XG5cdFx0dGhpcy5uYXZpZ2F0ZUNoZWNrKCB0aGlzLm5vZGVFZGl0b3IudHJlZS5uZWFyZXN0VXAoIHRoaXMubm9kZSApICk7XG5cdH0sXG5cdFxuXHRkb3duIDogZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coJ2Rvd24nKTtcblx0XHR0aGlzLm5hdmlnYXRlQ2hlY2soIHRoaXMubm9kZUVkaXRvci50cmVlLm5lYXJlc3REb3duKCB0aGlzLm5vZGUgKSApO1xuXHR9LFxuXHRcblx0bGVmdCA6IGZ1bmN0aW9uKCkge1xuXHRcdGNvbnNvbGUubG9nKCdsZWZ0Jyk7XG5cdFx0XG5cdFx0dGhpcy5uYXZpZ2F0ZUNoZWNrKCB0aGlzLm5vZGVFZGl0b3IudHJlZS5uZWFyZXN0TGVmdCggdGhpcy5ub2RlICkgKTtcblx0fSxcblx0XG5cdHJpZ2h0IDogZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coJ3JpZ2h0Jyk7XG5cdFx0XG5cdFx0dGhpcy5uYXZpZ2F0ZUNoZWNrKCB0aGlzLm5vZGVFZGl0b3IudHJlZS5uZWFyZXN0UmlnaHQoIHRoaXMubm9kZSApICk7XG5cdH0sXG5cdFxuXHRzaWJsaW5nVXAgOiBmdW5jdGlvbigpIHtcblx0XHRjb25zb2xlLmxvZygnc2libGluZ1VwJyk7XG5cdFx0dGhpcy5uYXZpZ2F0ZUNoZWNrKCB0aGlzLm5vZGVFZGl0b3IudHJlZS5uYXZpZ2F0ZVVwKCB0aGlzLm5vZGUgKSApO1xuXHR9LFxuXHRcblx0c2libGluZ0Rvd24gOiBmdW5jdGlvbigpIHtcblx0XHRjb25zb2xlLmxvZygnc2libGluZ0Rvd24nKTtcblx0XHR0aGlzLm5hdmlnYXRlQ2hlY2soIHRoaXMubm9kZUVkaXRvci50cmVlLm5hdmlnYXRlRG93biggdGhpcy5ub2RlICkgKTtcblx0fSxcblx0XG5cdHNpYmxpbmdMZWZ0IDogZnVuY3Rpb24oKSB7XG5cdFx0Y29uc29sZS5sb2coJ3NpYmxpbmdMZWZ0Jyk7XG5cdFx0XG5cdFx0dGhpcy5uYXZpZ2F0ZUNoZWNrKCB0aGlzLm5vZGVFZGl0b3IudHJlZS5uYXZpZ2F0ZUxlZnQoIHRoaXMubm9kZSApICk7XG5cdH0sXG5cdFxuXHRzaWJsaW5nUmlnaHQgOiBmdW5jdGlvbigpIHtcblx0XHRjb25zb2xlLmxvZygnc2libGluZ1JpZ2h0Jyk7XG5cdFx0XG5cdFx0dGhpcy5uYXZpZ2F0ZUNoZWNrKCB0aGlzLm5vZGVFZGl0b3IudHJlZS5uYXZpZ2F0ZVJpZ2h0KCB0aGlzLm5vZGUgKSApO1xuXHR9LFxuXHRcblx0c2V0Tm9kZSA6IGZ1bmN0aW9uKCAkbm9kZSwgbm9kZSApIHtcblx0XHRcblx0XHR0aGlzLiRub2RlID0gJG5vZGU7XG5cdFx0XG5cdFx0aWYoIHRoaXMuJG5vZGUgJiYgbm9kZSApIHtcblx0XHRcdHRoaXMubm9kZSA9IG5vZGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMubm9kZSA9ICRub2RlLmRhdGEoKVswXTtcblx0XHR9XG5cdFx0XG5cdFx0aWYoIHRoaXMuJGNpcmNsZSApIHtcblx0XHRcdHRoaXMudXBkYXRlU2l6ZSgpO1xuXHRcdFx0dGhpcy51cGRhdGVQb3NpdGlvbigpO1xuXHRcdH1cblx0XHRcblx0fSxcblx0XG5cdGFkZCA6IGZ1bmN0aW9uKCkge1xuXHRcdFxuXHRcdHRoaXMuJGNpcmNsZSA9IHRoaXMubm9kZUVkaXRvci4kc2NvcGVcblx0XHRcdC5hcHBlbmQoXCJjaXJjbGVcIilcblx0XHRcdC5hdHRyKFwiY2xhc3NcIiwgXCJub2RlLWN1cnNvclwiKTtcblx0XHRcdFxuXHRcdHRoaXMudXBkYXRlU2l6ZSgpO1xuXHRcdHRoaXMudXBkYXRlUG9zaXRpb24oKTtcblx0XHRcblx0XHR0aGlzLm5vZGVFZGl0b3IuZm9yY2Uub24oJ3RpY2subm9kZS1jdXJzb3InLCB0aGlzLnVwZGF0ZVBvc2l0aW9uLmJpbmQodGhpcykpO1xuXHRcdFxuXHR9LFxuXHRcblx0dXBkYXRlU2l6ZSA6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJGNpcmNsZS5hdHRyKFwiclwiLCBwYXJzZUludCh0aGlzLiRub2RlLmF0dHIoJ3InKSwgMTApICsgNCApO1xuXHR9LFxuXHRcblx0dXBkYXRlUG9zaXRpb24gOiBmdW5jdGlvbigpIHtcblxuXHRcdHRoaXMuJGNpcmNsZVxuXHRcdFx0LmF0dHIoJ2N4JywgdGhpcy4kbm9kZS5hdHRyKCdjeCcpKVxuXHRcdFx0LmF0dHIoJ2N5JywgdGhpcy4kbm9kZS5hdHRyKCdjeScpKTtcblx0XHRcblx0fSxcblx0XG5cdHJlbW92ZSA6IGZ1bmN0aW9uKCkge1xuXHRcdGlmKCB0aGlzLiRjaXJjbGUpIHtcblx0XHRcdHRoaXMuJGNpcmNsZS5yZW1vdmUoKTtcblx0XHR9XG5cdH1cblx0XG59OyIsInZhclx0RXZlbnREaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvRXZlbnREaXNwYXRjaGVyJyk7XG5cbnZhciBOb2RlTGFzc28gPSBmdW5jdGlvbiggbm9kZUVkaXRvciwgc2hvcnRjdXQgKSB7XG5cdFxuXHR0aGlzLm5vZGVFZGl0b3IgPSBub2RlRWRpdG9yO1xuXHR0aGlzLiRzY29wZSA9IG5vZGVFZGl0b3IuJHNjb3BlO1xuXHRcblx0dGhpcy4kbm9kZXMgPSBudWxsO1xuXHR0aGlzLiRzb3VyY2VOb2RlID0gbnVsbDtcblx0dGhpcy4kdGFyZ2V0Tm9kZSA9IG51bGw7XG5cdHRoaXMuc291cmNlTm9kZSA9IG51bGw7XG5cdHRoaXMudGFyZ2V0Tm9kZSA9IG51bGw7XG5cdFxuXHR0aGlzLiRsaW5lID0gbnVsbDtcblx0dGhpcy4kaG92ZXJDaXJjbGUgPSBudWxsO1xuXHR0aGlzLiRsYXNzb1RpcCA9IG51bGw7XG5cdFxuXHR0aGlzLmhhbmRsZXJzTW91c2Vkb3duXHRcdD0gdGhpcy5ub2RlRWRpdG9yLm1vdXNlLndyYXBNb3VzZSggc2hvcnRjdXQsIHRoaXMuc3RhcnQsIHRoaXMgKTtcblx0dGhpcy5oYW5kbGVyc01vdXNldXBcdFx0PSB0aGlzLm5vZGVFZGl0b3IubW91c2Uud3JhcE1vdXNlVXAoIHNob3J0Y3V0LCB0aGlzLnN0b3AsIHRoaXMgKTtcblx0dGhpcy5oYW5kbGVyc01vdXNlbW92ZVx0XHQ9IHRoaXMubm9kZUVkaXRvci5tb3VzZS53cmFwU2NvcGUoIHRoaXMubW92ZSwgdGhpcyApO1xuXHR0aGlzLmhhbmRsZXJzTW91c2VvdmVyTm9kZVx0PSB0aGlzLm5vZGVFZGl0b3IubW91c2Uud3JhcFNjb3BlKCB0aGlzLm1vdXNlb3Zlck5vZGUsIHRoaXMgKTtcblx0dGhpcy5oYW5kbGVyc01vdXNlb3V0Tm9kZVx0PSB0aGlzLm5vZGVFZGl0b3IubW91c2Uud3JhcFNjb3BlKCB0aGlzLm1vdXNlb3V0Tm9kZSwgdGhpcyApO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE5vZGVMYXNzbztcblxuTm9kZUxhc3NvLnByb3RvdHlwZSA9IHtcblx0XG5cdHN0YXJ0IDogZnVuY3Rpb24oIG5vZGUgKSB7XG5cblx0XHRkMy5ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFxuXHRcdHRoaXMuc291cmNlTm9kZSA9IG5vZGU7XG5cdFx0dGhpcy4kc291cmNlTm9kZSA9IGQzLnNlbGVjdChub2RlKVxuXHRcdFx0LmNsYXNzZWQoXCJub2RlLWxhc3NvLWFjdGl2ZVwiLCB0cnVlKTtcblxuXHRcdHRoaXMuJG5vZGVzID0gdGhpcy4kc2NvcGUuc2VsZWN0QWxsKCcubm9kZScpO1xuXG5cdFx0dGhpcy4kc2NvcGUuY2xhc3NlZCgnYWN0aXZlLW5vZGUtbGFzc28nLCB0cnVlKTtcblx0XHRcblx0XHR0aGlzLiRsaW5lID0gdGhpcy4kc2NvcGUuaW5zZXJ0KCdsaW5lJywgJzpmaXJzdC1jaGlsZCcpXG5cdFx0XHQuY2xhc3NlZChcIm5vZGUtbGFzc29cIiwgdHJ1ZSk7XG5cblx0XHR2YXIgcG9zaXRpb24gPSBkMy5tb3VzZSggbm9kZSApO1xuXHRcdFxuXHRcdHRoaXMuZW50ZXJTdGFnZSggcG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdICk7XG5cdFx0XG5cdFx0dGhpcy4kc2NvcGUub24oJ21vdXNlbW92ZS5ub2RlLWxhc3NvJywgdGhpcy5oYW5kbGVyc01vdXNlbW92ZSk7XG5cdFx0dGhpcy4kc2NvcGUub24oJ21vdXNldXAubm9kZS1sYXNzbycsIHRoaXMuaGFuZGxlcnNNb3VzZXVwKTtcblx0XHR0aGlzLiRzY29wZS5vbignbW91c2VsZWF2ZS5ub2RlLWxhc3NvJywgdGhpcy5oYW5kbGVyc01vdXNldXApO1xuXHRcdFxuXHRcdHRoaXMuJG5vZGVzLm9uKCdtb3VzZW92ZXIubm9kZS1sYXNzbycsIHRoaXMuaGFuZGxlcnNNb3VzZW92ZXJOb2RlKTtcblx0XHR0aGlzLiRub2Rlcy5vbignbW91c2VvdXQubm9kZS1sYXNzbycsIHRoaXMuaGFuZGxlcnNNb3VzZW91dE5vZGUpO1xuXHR9LFxuXHRcblx0c3RvcCA6IGZ1bmN0aW9uKCBjb250YWluZXIgKSB7XG5cdFx0XG5cdFx0dGhpcy4kc2NvcGUub24oJ21vdXNlbW92ZS5ub2RlLWxhc3NvJywgbnVsbCk7XG5cdFx0dGhpcy4kc2NvcGUub24oJ21vdXNldXAubm9kZS1sYXNzbycsIG51bGwpO1xuXHRcdHRoaXMuJHNjb3BlLm9uKCdtb3VzZWxlYXZlLm5vZGUtbGFzc28nLCBudWxsKTtcblx0XHRcblx0XHR0aGlzLiRub2Rlcy5vbignbW91c2VvdmVyLm5vZGUtbGFzc28nLCBudWxsKTtcblx0XHR0aGlzLiRub2Rlcy5vbignbW91c2VvdXQubm9kZS1sYXNzbycsIG51bGwpO1xuXHRcdFxuXHRcdGlmKCB0aGlzLiRob3ZlckNpcmNsZSApIHtcblx0XHRcdHRoaXMuJGhvdmVyQ2lyY2xlLnJlbW92ZSgpO1xuXHRcdFx0dGhpcy4kaG92ZXJDaXJjbGUgPSBudWxsO1xuXHRcdH1cblx0XHRpZiggdGhpcy4kbGFzc29UaXAgKSB7XG5cdFx0XHR0aGlzLiRsYXNzb1RpcC5yZW1vdmUoKTtcblx0XHRcdHRoaXMuJGxhc3NvVGlwID0gbnVsbDtcblx0XHR9XG5cblx0XHR0aGlzLiRzY29wZS5jbGFzc2VkKCdhY3RpdmUtbm9kZS1sYXNzbycsIGZhbHNlKTtcblx0XHR0aGlzLiRub2Rlcy5jbGFzc2VkKCdub2RlLWxhc3NvLWhvdmVyJywgZmFsc2UpO1xuXHRcdHRoaXMuJHNvdXJjZU5vZGUuY2xhc3NlZChcIm5vZGUtbGFzc28tYWN0aXZlXCIsIGZhbHNlKTtcblx0XHRcblx0XHRpZih0aGlzLnRhcmdldE5vZGUpIHtcblx0XHRcdHRoaXMuZGlzcGF0Y2goe1xuXHRcdFx0XHR0eXBlOiBcImxhc3NvXCIsXG5cdFx0XHRcdGVsOiB0aGlzLnRhcmdldE5vZGUsXG5cdFx0XHRcdCRlbDogdGhpcy4kdGFyZ2V0Tm9kZSxcblx0XHRcdFx0c291cmNlOiB0aGlzLiRzb3VyY2VOb2RlLmRhdGEoKVswXSxcblx0XHRcdFx0dGFyZ2V0OiB0aGlzLiR0YXJnZXROb2RlLmRhdGEoKVswXVxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBwb3NpdGlvbiA9IGQzLm1vdXNlKCBjb250YWluZXIgKTtcblx0XHRcdFxuXHRcdFx0dGhpcy5kaXNwYXRjaCh7XG5cdFx0XHRcdHR5cGU6IFwiZW1wdHlSZWxlYXNlXCIsXG5cdFx0XHRcdHNvdXJjZTogdGhpcy5zb3VyY2VOb2RlLFxuXHRcdFx0XHR4OiBwb3NpdGlvblswXSxcblx0XHRcdFx0eTogcG9zaXRpb25bMV1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRcblx0XHR0aGlzLiRzb3VyY2VOb2RlID0gbnVsbDtcblx0XHR0aGlzLnNvdXJjZU5vZGUgPSBudWxsO1xuXHRcdFxuXHRcdHRoaXMuJHRhcmdldE5vZGUgPSBudWxsO1xuXHRcdHRoaXMudGFyZ2V0Tm9kZSA9IG51bGw7XG5cdFx0XG5cdFx0dGhpcy4kbGluZS5yZW1vdmUoKTtcblx0XHRcblx0fSxcblxuXHRtb3VzZW92ZXJOb2RlIDogZnVuY3Rpb24oIGVsICkge1xuXHRcdFxuXHRcdHZhciBub2RlLFxuXHRcdFx0JGVsLFxuXHRcdFx0dXNlTm9kZSA9IHRydWUsXG5cdFx0XHRwcmV2VGFyZ2V0ID0gdGhpcy50YXJnZXROb2RlO1xuXG5cdFx0aWYoIGVsICE9PSB0aGlzLnNvdXJjZU5vZGUgKSB7XG5cdFx0XHRcdFx0XG5cdFx0XHRpZiggIXByZXZUYXJnZXQgKSB7XG5cdFx0XHRcdHZhciBwb3NpdGlvbiA9IGQzLm1vdXNlKCBlbCApO1xuXHRcdFx0XHR0aGlzLmV4aXRTdGFnZSggcG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdICk7XG5cdFx0XHR9XG5cdFx0XHRcblx0XHRcdCRlbCA9IGQzLnNlbGVjdChlbCk7XG5cdFx0XHRcblx0XHRcdHRoaXMuZGlzcGF0Y2goe1xuXHRcdFx0XHR0eXBlOiBcIm1vdXNlb3ZlclwiLFxuXHRcdFx0XHRlbDogZWwsXG5cdFx0XHRcdCRlbDogJGVsLFxuXHRcdFx0XHRub2RlOiAkZWwuZGF0YSgpWzBdLFxuXHRcdFx0XHRwcmV2ZW50RGVmYXVsdDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dXNlTm9kZSA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdFx0XHRcdFxuXHRcdFx0aWYodXNlTm9kZSA9PT0gZmFsc2UpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHR0aGlzLnRhcmdldE5vZGUgPSBlbDtcblx0XHRcdHRoaXMuJHRhcmdldE5vZGUgPSAkZWw7XG5cdFx0XHRcblx0XHRcdFxuXHRcdFx0dGhpcy4kdGFyZ2V0Tm9kZS5jbGFzc2VkKCdub2RlLWxhc3NvLWhvdmVyJywgdHJ1ZSk7XG5cdFx0XHRcblx0XHRcdGlmKCAhcHJldlRhcmdldCApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFxuXHRcdFx0XHR0aGlzLiRob3ZlckNpcmNsZSA9IHRoaXMuJHNjb3BlLmFwcGVuZCgnY2lyY2xlJywgJzpmaXJzdC1jaGlsZCcpXG5cdFx0XHRcdFx0LmNsYXNzZWQoXCJub2RlLWxhc3NvLWhvdmVyLWNpcmNsZVwiLCB0cnVlKTtcblxuXHRcdFx0fVxuXHRcdFx0XG5cdFx0XHRub2RlID0gdGhpcy4kdGFyZ2V0Tm9kZS5kYXRhKClbMF07XG5cdFx0XHRcblx0XHRcdHRoaXMuJGhvdmVyQ2lyY2xlXG5cdFx0XHRcdC5hdHRyKFwiclwiLCBwYXJzZUludCh0aGlzLiR0YXJnZXROb2RlLmF0dHIoXCJyXCIpLCAxMCkgKyAzKVxuXHRcdFx0XHQuYXR0cihcImN4XCIsIG5vZGUueClcblx0XHRcdFx0LmF0dHIoXCJjeVwiLCBub2RlLnkpXG5cdFx0XHRcdC5zdHlsZShcInRyYW5zZm9ybS1vcmlnaW5cIiwgbm9kZS54ICsgXCJweCBcIiArIG5vZGUueSArIFwicHhcIilcblx0XHRcdDtcblx0XHRcdFxuXHRcdH1cblx0XHRcblx0fSxcblx0XG5cdG1vdXNlb3V0Tm9kZSA6IGZ1bmN0aW9uKCBlbCApIHtcblx0XHRcblx0XHRkMy5zZWxlY3QoZWwpLmNsYXNzZWQoJ25vZGUtbGFzc28taG92ZXInLCBmYWxzZSk7XG5cdFx0XG5cdFx0aWYoZWwgPT09IHRoaXMudGFyZ2V0Tm9kZSkge1xuXHRcdFx0dGhpcy50YXJnZXROb2RlID0gbnVsbDtcblx0XHRcdHRoaXMuJHRhcmdldE5vZGUgPSBudWxsO1xuXHRcdFx0XG5cdFx0XHR0aGlzLiRob3ZlckNpcmNsZS5yZW1vdmUoKTtcblx0XHRcdHRoaXMuJGhvdmVyQ2lyY2xlID0gbnVsbDtcblx0XHRcdFxuXHRcdFx0dmFyIHBvc2l0aW9uID0gZDMubW91c2UoIGVsICk7XG5cdFx0XHRcblx0XHRcdHRoaXMuZW50ZXJTdGFnZSggcG9zaXRpb25bMF0sIHBvc2l0aW9uWzFdICk7XG5cdFx0fVxuXHRcdFxuXHR9LFxuXHRcblx0ZW50ZXJTdGFnZSA6IGZ1bmN0aW9uKCB4LCB5ICkge1xuXHRcdFxuXHRcdHRoaXMuZGlzcGF0Y2goe1xuXHRcdFx0dHlwZTogXCJlbnRlclN0YWdlXCIsXG5cdFx0XHR4OiB4LFxuXHRcdFx0eTogeVxuXHRcdH0pO1xuXHRcdFxuXHRcdHRoaXMuJGxhc3NvVGlwID0gdGhpcy4kc2NvcGUuYXBwZW5kKCdjaXJjbGUnLCAnOmZpcnN0LWNoaWxkJylcblx0XHRcdC5jbGFzc2VkKCdub2RlLWxhc3NvLXRpcCcsIHRydWUpXG5cdFx0XHQuYXR0cigncicsIDUpXG5cdFx0XHQuYXR0cignY3gnLCB4KVxuXHRcdFx0LmF0dHIoJ2N5JywgeSk7XG5cdFx0XG5cdH0sXG5cdFxuXHRleGl0U3RhZ2UgOiBmdW5jdGlvbiggeCwgeSApIHtcblx0XHRcblx0XHR0aGlzLiRsYXNzb1RpcC5yZW1vdmUoKTtcblx0XHR0aGlzLiRsYXNzb1RpcCA9IG51bGw7XG5cdFx0XG5cdFx0dGhpcy5kaXNwYXRjaCh7XG5cdFx0XHR0eXBlOiBcImV4aXRTdGFnZVwiLFxuXHRcdFx0eDogeCxcblx0XHRcdHk6IHlcblx0XHR9KTtcblx0XHRcblx0fSxcblx0XG5cdG1vdmUgOiBmdW5jdGlvbiggY29udGFpbmVyICkge1xuXG5cdFx0dmFyIG1vdXNlUG9pbnQgPSBkMy5tb3VzZSggY29udGFpbmVyICk7XG5cdFx0dmFyIG5vZGVQb2ludCA9IHRoaXMuJHNvdXJjZU5vZGUuZGF0YSgpWzBdO1xuXHRcdFxuXHRcdHRoaXMuJGxpbmVcblx0XHRcdC5hdHRyKFwieDFcIiwgdGhpcy4kdGFyZ2V0Tm9kZSA/IHRoaXMuJHRhcmdldE5vZGUuYXR0cihcImN4XCIpIDogbW91c2VQb2ludFswXSApXG5cdFx0XHQuYXR0cihcInkxXCIsIHRoaXMuJHRhcmdldE5vZGUgPyB0aGlzLiR0YXJnZXROb2RlLmF0dHIoXCJjeVwiKSA6IG1vdXNlUG9pbnRbMV0gKVxuXHRcdFx0LmF0dHIoXCJ4MlwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBub2RlUG9pbnQueDsgfSlcblx0XHRcdC5hdHRyKFwieTJcIiwgZnVuY3Rpb24oZCkgeyByZXR1cm4gbm9kZVBvaW50Lnk7IH0pO1xuXHRcdFx0XG5cdFx0aWYoIHRoaXMuJGxhc3NvVGlwICkge1xuXHRcdFx0dGhpcy4kbGFzc29UaXBcblx0XHRcdFx0LmF0dHIoJ2N4JywgbW91c2VQb2ludFswXSlcblx0XHRcdFx0LmF0dHIoJ2N5JywgbW91c2VQb2ludFsxXSk7XG5cdFx0fVxuXHR9LFxuXHRcblx0c2V0SGFuZGxlcnMgOiBmdW5jdGlvbiggJG5ld05vZGVzICkge1xuXHRcdFxuXHRcdCRuZXdOb2Rlcy5vbignbW91c2Vkb3duLm5vZGUtbGFzc28nLCB0aGlzLmhhbmRsZXJzTW91c2Vkb3duICk7XG5cdFx0XG5cdH1cbn07XG5cbkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuYXBwbHkoIE5vZGVMYXNzby5wcm90b3R5cGUgKTsiLCIvKipcbiAqIEBhdXRob3IgbXJkb29iIC8gaHR0cDovL21yZG9vYi5jb20vXG4gKlxuICogTW9kaWZpY2F0aW9uczogR3JlZyBUYXR1bVxuICpcbiAqIHVzYWdlOlxuICogXG4gKiBcdFx0RXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5hcHBseSggTXlPYmplY3QucHJvdG90eXBlICk7XG4gKiBcbiAqIFx0XHRNeU9iamVjdC5kaXNwYXRjaCh7XG4gKiBcdFx0XHR0eXBlOiBcImNsaWNrXCIsXG4gKiBcdFx0XHRkYXR1bTE6IFwiZm9vXCIsXG4gKiBcdFx0XHRkYXR1bTI6IFwiYmFyXCJcbiAqIFx0XHR9KTtcbiAqIFxuICogXHRcdE15T2JqZWN0Lm9uKCBcImNsaWNrXCIsIGZ1bmN0aW9uKCBldmVudCApIHtcbiAqIFx0XHRcdGV2ZW50LmRhdHVtMTsgLy9Gb29cbiAqIFx0XHRcdC8vZXZlbnQudGFyZ2V0OyAvL015T2JqZWN0IChkaXNhYmxlZCBub3cpXG4gKiBcdFx0fSk7XG4gKiBcbiAqXG4gKi9cblxudmFyIEV2ZW50RGlzcGF0Y2hlciA9IGZ1bmN0aW9uICgpIHt9O1xuXG5FdmVudERpc3BhdGNoZXIucHJvdG90eXBlID0ge1xuXG5cdGNvbnN0cnVjdG9yOiBFdmVudERpc3BhdGNoZXIsXG5cblx0YXBwbHk6IGZ1bmN0aW9uICggb2JqZWN0ICkge1xuXG5cdFx0b2JqZWN0Lm9uXHRcdFx0XHRcdD0gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5vbjtcblx0XHRvYmplY3QuaGFzRXZlbnRMaXN0ZW5lclx0XHQ9IEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuaGFzRXZlbnRMaXN0ZW5lcjtcblx0XHRvYmplY3Qub2ZmXHRcdFx0XHRcdD0gRXZlbnREaXNwYXRjaGVyLnByb3RvdHlwZS5vZmY7XG5cdFx0b2JqZWN0LmRpc3BhdGNoXHRcdFx0XHQ9IEV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuZGlzcGF0Y2g7XG5cblx0fSxcblxuXHRvbjogZnVuY3Rpb24gKCB0eXBlLCBsaXN0ZW5lciApIHtcblxuXHRcdGlmICggdGhpcy5fbGlzdGVuZXJzID09PSB1bmRlZmluZWQgKSB0aGlzLl9saXN0ZW5lcnMgPSB7fTtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdID09PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdGxpc3RlbmVyc1sgdHlwZSBdID0gW107XG5cblx0XHR9XG5cblx0XHRpZiAoIGxpc3RlbmVyc1sgdHlwZSBdLmluZGV4T2YoIGxpc3RlbmVyICkgPT09IC0gMSApIHtcblxuXHRcdFx0bGlzdGVuZXJzWyB0eXBlIF0ucHVzaCggbGlzdGVuZXIgKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdGhhc0V2ZW50TGlzdGVuZXI6IGZ1bmN0aW9uICggdHlwZSwgbGlzdGVuZXIgKSB7XG5cblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuIGZhbHNlO1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblxuXHRcdGlmICggbGlzdGVuZXJzWyB0eXBlIF0gIT09IHVuZGVmaW5lZCAmJiBsaXN0ZW5lcnNbIHR5cGUgXS5pbmRleE9mKCBsaXN0ZW5lciApICE9PSAtIDEgKSB7XG5cblx0XHRcdHJldHVybiB0cnVlO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIGZhbHNlO1xuXG5cdH0sXG5cblx0b2ZmOiBmdW5jdGlvbiAoIHR5cGUsIGxpc3RlbmVyICkge1xuXG5cdFx0aWYgKCB0aGlzLl9saXN0ZW5lcnMgPT09IHVuZGVmaW5lZCApIHJldHVybjtcblxuXHRcdHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9saXN0ZW5lcnM7XG5cdFx0dmFyIGxpc3RlbmVyQXJyYXkgPSBsaXN0ZW5lcnNbIHR5cGUgXTtcblxuXHRcdGlmICggbGlzdGVuZXJBcnJheSAhPT0gdW5kZWZpbmVkICkge1xuXG5cdFx0XHR2YXIgaW5kZXggPSBsaXN0ZW5lckFycmF5LmluZGV4T2YoIGxpc3RlbmVyICk7XG5cblx0XHRcdGlmICggaW5kZXggIT09IC0gMSApIHtcblxuXHRcdFx0XHRsaXN0ZW5lckFycmF5LnNwbGljZSggaW5kZXgsIDEgKTtcblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdH0sXG5cblx0ZGlzcGF0Y2g6IGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0XHRcblx0XHRpZiAoIHRoaXMuX2xpc3RlbmVycyA9PT0gdW5kZWZpbmVkICkgcmV0dXJuO1xuXG5cdFx0dmFyIGxpc3RlbmVycyA9IHRoaXMuX2xpc3RlbmVycztcblx0XHR2YXIgbGlzdGVuZXJBcnJheSA9IGxpc3RlbmVyc1sgZXZlbnQudHlwZSBdO1xuXG5cdFx0aWYgKCBsaXN0ZW5lckFycmF5ICE9PSB1bmRlZmluZWQgKSB7XG5cblx0XHRcdC8vZXZlbnQudGFyZ2V0ID0gdGhpcztcblxuXHRcdFx0dmFyIGFycmF5ID0gW107XG5cdFx0XHR2YXIgbGVuZ3RoID0gbGlzdGVuZXJBcnJheS5sZW5ndGg7XG5cdFx0XHR2YXIgaTtcblxuXHRcdFx0Zm9yICggaSA9IDA7IGkgPCBsZW5ndGg7IGkgKysgKSB7XG5cblx0XHRcdFx0YXJyYXlbIGkgXSA9IGxpc3RlbmVyQXJyYXlbIGkgXTtcblxuXHRcdFx0fVxuXG5cdFx0XHRmb3IgKCBpID0gMDsgaSA8IGxlbmd0aDsgaSArKyApIHtcblxuXHRcdFx0XHRhcnJheVsgaSBdLmNhbGwoIHRoaXMsIGV2ZW50ICk7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHR9XG5cbn07XG5cbmlmICggdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcgKSB7XG5cblx0bW9kdWxlLmV4cG9ydHMgPSBFdmVudERpc3BhdGNoZXI7XG5cbn0iLCJ2YXIgd3JhcFNjb3BlXHRcdD0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvd3JhcFNjb3BlJyksXG5cdG1vdXNlXHRcdFx0PSByZXF1aXJlKCcuLi8uLi9jb25zdGFudHMvbW91c2UnKSxcblx0RXZlbnREaXNwYXRjaGVyID0gcmVxdWlyZSgnLi4vLi4vdXRpbHMvRXZlbnREaXNwYXRjaGVyJyk7XG5cdFxudmFyIG1vZGlmaWVyS2V5cyA9IFtcblx0XCJjb21tYW5kXCIsXG5cdFwiY29udHJvbFwiLFxuXHRcIm9wdGlvblwiLFxuICAgIFwic2hpZnRcIlxuXTtcblx0XG52YXIgS2V5Ym9hcmQgPSBmdW5jdGlvbiggJHNjb3BlICkge1xuXHRcblx0dGhpcy4kc2NvcGUgPSAkc2NvcGU7XG5cdHRoaXMuZGlzcGF0Y2hlciA9IG5ldyBFdmVudERpc3BhdGNoZXIoKTtcblx0dGhpcy5yZWdpc3RlcmVkS2V5cHJlc3NlcyA9IFtdO1xuXHR0aGlzLmV2ZW50U2NvcGUgPSBcIi5ISUQuS2V5Ym9hcmRcIiArIEtleWJvYXJkLnByb3RvdHlwZS5faWQ7XG5cdEtleWJvYXJkLnByb3RvdHlwZS5faWQrKztcblx0XG5cdHRoaXMuX2hhbmRsZUtleURvd25XcmFwcGVkXHQ9IHdyYXBTY29wZSggdGhpcy5faGFuZGxlS2V5RG93biwgdGhpcyApO1xuXHR0aGlzLl9oYW5kbGVLZXlVcFdyYXBwZWRcdD0gd3JhcFNjb3BlKCB0aGlzLl9oYW5kbGVLZXlVcCwgdGhpcyApO1xuXG5cdGlmKCB0aGlzLiRzY29wZSApIHtcblx0XHR0aGlzLnN0YXJ0KCB0aGlzLiRzY29wZSApO1xuXHR9XG5cdFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBLZXlib2FyZDtcblxuS2V5Ym9hcmQucHJvdG90eXBlID0ge1xuXHRcblx0X2lkIDogMCxcblx0XG5cdHN0YXJ0IDogZnVuY3Rpb24oICRzY29wZSApIHtcblx0XHR0aGlzLiRzY29wZSA9ICRzY29wZTtcblx0XHR0aGlzLiRzY29wZS5vbigna2V5ZG93bicrdGhpcy5ldmVudFNjb3BlLCB0aGlzLl9oYW5kbGVLZXlEb3duV3JhcHBlZCApO1xuXHR9LFxuXHRcblx0ZW5kIDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kc2NvcGUub24oJ2tleWRvd24nK3RoaXMuZXZlbnRTY29wZSwgbnVsbCApO1xuXHRcdHRoaXMuY2xlYXJLZXlwcmVzc2VzKCk7XG5cdH0sXG5cblx0X2hhbmRsZUtleURvd24gOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmRpc3BhdGNoZXIuZGlzcGF0Y2goe3R5cGU6J2tleXByZXNzJ30pO1xuXHR9LFxuXG5cdG9uIDogZnVuY3Rpb24oIHNob3J0Y3V0cywgY2FsbGJhY2ssIGNvbnRleHQgKSB7XG5cdFx0XG5cdFx0XG5cdFx0aWYoIV8uaXNBcnJheSggc2hvcnRjdXRzICkpIHtcblx0XHRcdHNob3J0Y3V0cyA9IFtzaG9ydGN1dHNdO1xuXHRcdH1cblx0XHRcblx0XHRfLmVhY2goIHNob3J0Y3V0cywgZnVuY3Rpb24oIHNob3J0Y3V0ICkge1xuXHRcdFx0XG5cdFx0XHR2YXIga2V5Q2hlY2tlciA9IGZ1bmN0aW9uKCBqUXVlcnlFdmVudCApIHtcblx0XHRcdFx0XG5cdFx0XHRcdHZhciBtb2RpZmllcnNDb3JyZWN0LCBrZXlzQ29ycmVjdDtcblx0XHRcdFx0XG5cdFx0XHRcdHZhciBtb2RpZmllcnMgPSBzaG9ydGN1dC5tb2RpZmllcnMgfHwge307XG5cdFx0XHRcblx0XHRcdFx0bW9kaWZpZXJzQ29ycmVjdCA9IF8ucmVkdWNlKCBtb2RpZmllcktleXMsIGZ1bmN0aW9uKCBtZW1vLCBtb2RpZmllcktleSApIHtcblx0XHRcdFx0XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFx0cmV0dXJuIG1lbW8gJiYgZDMuZXZlbnRbIG1vdXNlW21vZGlmaWVyS2V5XSBdID09PSAhIW1vZGlmaWVyc1ttb2RpZmllcktleV07XG5cdFx0XHRcdFxuXHRcdFx0XHR9LCB0cnVlICk7XG5cdFx0XHRcdFx0XG5cdFx0XHRcdFxuXHRcdFx0XHRrZXlzQ29ycmVjdCA9IGQzLmV2ZW50LmtleUNvZGUgPT09IHNob3J0Y3V0LmtleTtcblx0XHRcdFx0XG5cdFx0XHRcdGlmKCBtb2RpZmllcnNDb3JyZWN0ICYmIGtleXNDb3JyZWN0ICkge1xuXHRcdFx0XHRcdGNhbGxiYWNrLmFwcGx5KGNvbnRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0XG5cdFx0XHR0aGlzLmRpc3BhdGNoZXIub24oJ2tleXByZXNzJywga2V5Q2hlY2tlcik7XG5cdFx0XG5cdFx0XHR0aGlzLnJlZ2lzdGVyZWRLZXlwcmVzc2VzLnB1c2goe1xuXHRcdFx0XHRrZXlDaGVja2VyOiBrZXlDaGVja2VyLFxuXHRcdFx0XHRjYWxsYmFjazogY2FsbGJhY2tcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0fSwgdGhpcyk7XG5cdFx0XHRcdFxuXHR9LFxuXHRcblx0b2ZmIDogZnVuY3Rpb24oIGNhbGxiYWNrICkge1xuXHRcdFxuXHRcdHZhciBrZXlwcmVzc2VzID0gXy5maWx0ZXIoIHRoaXMucmVnaXN0ZXJlZEtleXByZXNzZXMsIGZ1bmN0aW9uKCBrZXlwcmVzcyApIHtcblx0XHRcdHJldHVybiBrZXlwcmVzcy5jYWxsYmFjayA9PT0gY2FsbGJhY2s7XG5cdFx0fSk7XG5cdFx0XG5cdFx0Xy5lYWNoKCBrZXlwcmVzc2VzLCBmdW5jdGlvbigga2V5cHJlc3MgKSB7XG5cblx0XHRcdHRoaXMub2ZmKCBrZXlwcmVzcy5rZXlDaGVja2VyICk7XG5cdFx0XG5cdFx0XHR0aGlzLnJlZ2lzdGVyZWRLZXlwcmVzcy5zcGxpY2UoIHRoaXMucmVnaXN0ZXJlZEtleXByZXNzLmluZGV4T2Yoa2V5cHJlc3MpLCAxKTtcblx0XHRcdFxuXHRcdH0sIHRoaXMpO1xuXHRcdFxuXHR9XG59O1xuIiwidmFyIHdyYXBTY29wZVx0XHQ9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL3dyYXBTY29wZScpLFxuXHRtb3VzZVx0XHRcdD0gcmVxdWlyZSgnLi4vLi4vY29uc3RhbnRzL21vdXNlJyksXG5cdEV2ZW50RGlzcGF0Y2hlciA9IHJlcXVpcmUoJy4uLy4uL3V0aWxzL0V2ZW50RGlzcGF0Y2hlcicpO1xuXG52YXIgTW91c2UgPSBmdW5jdGlvbigpIHt9O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1vdXNlO1xuXG5Nb3VzZS5wcm90b3R5cGUgPSB7XG5cdFxuXHR3cmFwU2NvcGUgOiB3cmFwU2NvcGUsXG5cdFxuXHR3cmFwTW91c2UgOiBmdW5jdGlvbiggc2hvcnRjdXRzLCBjYWxsYmFjaywgY29udGV4dCApIHtcblx0XHRcblx0XHR2YXIgc2NvcGUgPSB0aGlzO1xuXHRcdFxuXHRcdHJldHVybiBmdW5jdGlvbigpIHtcblx0XHRcdFxuXHRcdFx0dmFyIG1vZGlmaWVyc0NvcnJlY3QsIGNsaWNrQ29ycmVjdDtcblx0XHRcdFx0XG5cdFx0XHRtb2RpZmllcnNDb3JyZWN0ID0gXy5yZWR1Y2UoIHNob3J0Y3V0cy5tb2RpZmllcnMsIGZ1bmN0aW9uKCBtZW1vLCBtb2RpZmllciApIHtcblx0XHRcdFxuXHRcdFx0XHRyZXR1cm4gbWVtbyAmJiBkMy5ldmVudFttb2RpZmllcl07XG5cdFx0XHRcblx0XHRcdH0sIHRydWUgKTtcblx0XHRcblx0XHRcdGNsaWNrQ29ycmVjdCA9IHNob3J0Y3V0cy5jbGljayA9PT0gc2NvcGUubm9ybWFsaXplV2hpY2goIGQzLmV2ZW50ICk7XG5cdFx0XG5cdFx0XHRpZiggbW9kaWZpZXJzQ29ycmVjdCAmJiBjbGlja0NvcnJlY3QgKSB7XG5cdFx0XHRcdGNhbGxiYWNrLmNhbGwoY29udGV4dCwgdGhpcyApO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0XG5cdH0sXG5cdFxuXHR3cmFwTW91c2VVcCA6IGZ1bmN0aW9uKCBzaG9ydGN1dHMsIGNhbGxiYWNrLCBjb250ZXh0ICkge1xuXHRcdFxuXHRcdC8vU3RyaXAgb3V0IG1vZGlmaWVyc1xuXHRcdHJldHVybiB0aGlzLndyYXBNb3VzZSgge1xuXHRcdFx0XG5cdFx0XHRtb2RpZmllcnM6IG51bGwsXG5cdFx0XHRjbGljazogc2hvcnRjdXRzLmNsaWNrXG5cdFx0XHRcblx0XHR9LCBjYWxsYmFjaywgY29udGV4dCApO1xuXHRcdFxuXHR9LFxuXHRcdFxuXHRub3JtYWxpemVXaGljaCA6IGZ1bmN0aW9uKCBlICkge1xuXHRcdGlmICggIWUud2hpY2ggJiYgZS5idXR0b24gIT09IHVuZGVmaW5lZCApIHtcblx0XHRcdGUud2hpY2ggPSAoIGUuYnV0dG9uICYgMSA/IDEgOiAoIGUuYnV0dG9uICYgMiA/IDMgOiAoIGUuYnV0dG9uICYgNCA/IDIgOiAwICkgKSApO1xuXHRcdH1cblx0XHRzd2l0Y2ggKGUud2hpY2gpIHtcblx0XHRcdGNhc2UgMTogcmV0dXJuIG1vdXNlLmxlZnQ7XG5cdFx0XHRjYXNlIDI6IHJldHVybiBtb3VzZS5taWRkbGU7XG5cdFx0XHRjYXNlIDM6IHJldHVybiBtb3VzZS5yaWdodDtcblx0XHRcdGRlZmF1bHQ6IHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxuXHRcbn07XG5cbkV2ZW50RGlzcGF0Y2hlci5wcm90b3R5cGUuYXBwbHkoIE1vdXNlLnByb3RvdHlwZSApOyIsIi8qKlxuICpcdEQzIGV2ZW50IGhhbmRsZXMgdGFrZSBvdmVyIHRoZSBjb250ZXh0IG9mIHRoZSBmdW5jdGlvbi4gSWYgeW91IC5iaW5kKHRoaXMpIHRvIHRoZSBmdW5jdGlvblxuICpcdHRoZW4geW91IGxvc2UgdGhlIGFiaWxpdHkgdG8gYWNjZXNzIHRoZSBjdXJyZW50IGNvbnRhaW5lciBmb3IgdGhhdCBldmVudC4gVGhpcyBsaXR0bGVcbiAqXHRmdW5jdGlvbiB3aWxsIHdyYXAgdGhlIHNjb3BlIGZvciB0aGUgb2JqZWN0LCBhbmQgcGFzcyB0aGUgbmF0aXZlIGQzIGNvbnRleHQgaW4gYXNcbiAqXHR0aGUgZmlyc3QgcGFyYW1ldGVyIGluIHRoZSBmdW5jdGlvbi5cbiAqXHRcbiAqXHRVc2FnZTpcbiAqXHRcbiAqXHRcdHN2Zy5hcHBlbmQoXCJyZWN0XCIpLm9uKFwibW91c2Vkb3duXCIsIHdyYXBTY29wZSh0aGlzLm1vdXNlZG93biwgdGhpcykgKTtcbiAqXHRcdFxuICpcdFx0Li4uXG4gKlx0XHRcbiAqXHRcdG1vdXNlZG93biA6IGZ1bmN0aW9uKCBjb250YWluZXIgKSB7XG4gKlx0XHRcdHZhciBwdCA9IGQzLm1vdXNlKCBjb250YWluZXIgKVxuICpcdFx0XHR0aGlzLm1ldGhvZE5hbWUoKTtcbiAqXHRcdH1cbiAqL1xuXG52YXIgd3JhcFNjb3BlID0gZnVuY3Rpb24oY2FsbGJhY2ssIHNjb3BlKSB7XG5cdFxuXHRyZXR1cm4gZnVuY3Rpb24oKSB7XG5cdFx0Y2FsbGJhY2suY2FsbChzY29wZSwgdGhpcyApO1xuXHR9O1xuXHRcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gd3JhcFNjb3BlOyIsIiFmdW5jdGlvbigpIHtcbiAgdmFyIGQzID0ge1xuICAgIHZlcnNpb246IFwiMy40LjExXCJcbiAgfTtcbiAgaWYgKCFEYXRlLm5vdykgRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gK25ldyBEYXRlKCk7XG4gIH07XG4gIHZhciBkM19hcnJheVNsaWNlID0gW10uc2xpY2UsIGQzX2FycmF5ID0gZnVuY3Rpb24obGlzdCkge1xuICAgIHJldHVybiBkM19hcnJheVNsaWNlLmNhbGwobGlzdCk7XG4gIH07XG4gIHZhciBkM19kb2N1bWVudCA9IGRvY3VtZW50LCBkM19kb2N1bWVudEVsZW1lbnQgPSBkM19kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsIGQzX3dpbmRvdyA9IHdpbmRvdztcbiAgdHJ5IHtcbiAgICBkM19hcnJheShkM19kb2N1bWVudEVsZW1lbnQuY2hpbGROb2RlcylbMF0ubm9kZVR5cGU7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBkM19hcnJheSA9IGZ1bmN0aW9uKGxpc3QpIHtcbiAgICAgIHZhciBpID0gbGlzdC5sZW5ndGgsIGFycmF5ID0gbmV3IEFycmF5KGkpO1xuICAgICAgd2hpbGUgKGktLSkgYXJyYXlbaV0gPSBsaXN0W2ldO1xuICAgICAgcmV0dXJuIGFycmF5O1xuICAgIH07XG4gIH1cbiAgdHJ5IHtcbiAgICBkM19kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLnN0eWxlLnNldFByb3BlcnR5KFwib3BhY2l0eVwiLCAwLCBcIlwiKTtcbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICB2YXIgZDNfZWxlbWVudF9wcm90b3R5cGUgPSBkM193aW5kb3cuRWxlbWVudC5wcm90b3R5cGUsIGQzX2VsZW1lbnRfc2V0QXR0cmlidXRlID0gZDNfZWxlbWVudF9wcm90b3R5cGUuc2V0QXR0cmlidXRlLCBkM19lbGVtZW50X3NldEF0dHJpYnV0ZU5TID0gZDNfZWxlbWVudF9wcm90b3R5cGUuc2V0QXR0cmlidXRlTlMsIGQzX3N0eWxlX3Byb3RvdHlwZSA9IGQzX3dpbmRvdy5DU1NTdHlsZURlY2xhcmF0aW9uLnByb3RvdHlwZSwgZDNfc3R5bGVfc2V0UHJvcGVydHkgPSBkM19zdHlsZV9wcm90b3R5cGUuc2V0UHJvcGVydHk7XG4gICAgZDNfZWxlbWVudF9wcm90b3R5cGUuc2V0QXR0cmlidXRlID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICAgIGQzX2VsZW1lbnRfc2V0QXR0cmlidXRlLmNhbGwodGhpcywgbmFtZSwgdmFsdWUgKyBcIlwiKTtcbiAgICB9O1xuICAgIGQzX2VsZW1lbnRfcHJvdG90eXBlLnNldEF0dHJpYnV0ZU5TID0gZnVuY3Rpb24oc3BhY2UsIGxvY2FsLCB2YWx1ZSkge1xuICAgICAgZDNfZWxlbWVudF9zZXRBdHRyaWJ1dGVOUy5jYWxsKHRoaXMsIHNwYWNlLCBsb2NhbCwgdmFsdWUgKyBcIlwiKTtcbiAgICB9O1xuICAgIGQzX3N0eWxlX3Byb3RvdHlwZS5zZXRQcm9wZXJ0eSA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICAgICAgZDNfc3R5bGVfc2V0UHJvcGVydHkuY2FsbCh0aGlzLCBuYW1lLCB2YWx1ZSArIFwiXCIsIHByaW9yaXR5KTtcbiAgICB9O1xuICB9XG4gIGQzLmFzY2VuZGluZyA9IGQzX2FzY2VuZGluZztcbiAgZnVuY3Rpb24gZDNfYXNjZW5kaW5nKGEsIGIpIHtcbiAgICByZXR1cm4gYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IGEgPj0gYiA/IDAgOiBOYU47XG4gIH1cbiAgZDMuZGVzY2VuZGluZyA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gYiA8IGEgPyAtMSA6IGIgPiBhID8gMSA6IGIgPj0gYSA/IDAgOiBOYU47XG4gIH07XG4gIGQzLm1pbiA9IGZ1bmN0aW9uKGFycmF5LCBmKSB7XG4gICAgdmFyIGkgPSAtMSwgbiA9IGFycmF5Lmxlbmd0aCwgYSwgYjtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgd2hpbGUgKCsraSA8IG4gJiYgISgoYSA9IGFycmF5W2ldKSAhPSBudWxsICYmIGEgPD0gYSkpIGEgPSB1bmRlZmluZWQ7XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKChiID0gYXJyYXlbaV0pICE9IG51bGwgJiYgYSA+IGIpIGEgPSBiO1xuICAgIH0gZWxzZSB7XG4gICAgICB3aGlsZSAoKytpIDwgbiAmJiAhKChhID0gZi5jYWxsKGFycmF5LCBhcnJheVtpXSwgaSkpICE9IG51bGwgJiYgYSA8PSBhKSkgYSA9IHVuZGVmaW5lZDtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoKGIgPSBmLmNhbGwoYXJyYXksIGFycmF5W2ldLCBpKSkgIT0gbnVsbCAmJiBhID4gYikgYSA9IGI7XG4gICAgfVxuICAgIHJldHVybiBhO1xuICB9O1xuICBkMy5tYXggPSBmdW5jdGlvbihhcnJheSwgZikge1xuICAgIHZhciBpID0gLTEsIG4gPSBhcnJheS5sZW5ndGgsIGEsIGI7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHdoaWxlICgrK2kgPCBuICYmICEoKGEgPSBhcnJheVtpXSkgIT0gbnVsbCAmJiBhIDw9IGEpKSBhID0gdW5kZWZpbmVkO1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmICgoYiA9IGFycmF5W2ldKSAhPSBudWxsICYmIGIgPiBhKSBhID0gYjtcbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKCsraSA8IG4gJiYgISgoYSA9IGYuY2FsbChhcnJheSwgYXJyYXlbaV0sIGkpKSAhPSBudWxsICYmIGEgPD0gYSkpIGEgPSB1bmRlZmluZWQ7XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKChiID0gZi5jYWxsKGFycmF5LCBhcnJheVtpXSwgaSkpICE9IG51bGwgJiYgYiA+IGEpIGEgPSBiO1xuICAgIH1cbiAgICByZXR1cm4gYTtcbiAgfTtcbiAgZDMuZXh0ZW50ID0gZnVuY3Rpb24oYXJyYXksIGYpIHtcbiAgICB2YXIgaSA9IC0xLCBuID0gYXJyYXkubGVuZ3RoLCBhLCBiLCBjO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICB3aGlsZSAoKytpIDwgbiAmJiAhKChhID0gYyA9IGFycmF5W2ldKSAhPSBudWxsICYmIGEgPD0gYSkpIGEgPSBjID0gdW5kZWZpbmVkO1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmICgoYiA9IGFycmF5W2ldKSAhPSBudWxsKSB7XG4gICAgICAgIGlmIChhID4gYikgYSA9IGI7XG4gICAgICAgIGlmIChjIDwgYikgYyA9IGI7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHdoaWxlICgrK2kgPCBuICYmICEoKGEgPSBjID0gZi5jYWxsKGFycmF5LCBhcnJheVtpXSwgaSkpICE9IG51bGwgJiYgYSA8PSBhKSkgYSA9IHVuZGVmaW5lZDtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoKGIgPSBmLmNhbGwoYXJyYXksIGFycmF5W2ldLCBpKSkgIT0gbnVsbCkge1xuICAgICAgICBpZiAoYSA+IGIpIGEgPSBiO1xuICAgICAgICBpZiAoYyA8IGIpIGMgPSBiO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gWyBhLCBjIF07XG4gIH07XG4gIGQzLnN1bSA9IGZ1bmN0aW9uKGFycmF5LCBmKSB7XG4gICAgdmFyIHMgPSAwLCBuID0gYXJyYXkubGVuZ3RoLCBhLCBpID0gLTE7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDEpIHtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoIWlzTmFOKGEgPSArYXJyYXlbaV0pKSBzICs9IGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoIWlzTmFOKGEgPSArZi5jYWxsKGFycmF5LCBhcnJheVtpXSwgaSkpKSBzICs9IGE7XG4gICAgfVxuICAgIHJldHVybiBzO1xuICB9O1xuICBmdW5jdGlvbiBkM19udW1iZXIoeCkge1xuICAgIHJldHVybiB4ICE9IG51bGwgJiYgIWlzTmFOKHgpO1xuICB9XG4gIGQzLm1lYW4gPSBmdW5jdGlvbihhcnJheSwgZikge1xuICAgIHZhciBzID0gMCwgbiA9IGFycmF5Lmxlbmd0aCwgYSwgaSA9IC0xLCBqID0gbjtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmIChkM19udW1iZXIoYSA9IGFycmF5W2ldKSkgcyArPSBhOyBlbHNlIC0tajtcbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmIChkM19udW1iZXIoYSA9IGYuY2FsbChhcnJheSwgYXJyYXlbaV0sIGkpKSkgcyArPSBhOyBlbHNlIC0tajtcbiAgICB9XG4gICAgcmV0dXJuIGogPyBzIC8gaiA6IHVuZGVmaW5lZDtcbiAgfTtcbiAgZDMucXVhbnRpbGUgPSBmdW5jdGlvbih2YWx1ZXMsIHApIHtcbiAgICB2YXIgSCA9ICh2YWx1ZXMubGVuZ3RoIC0gMSkgKiBwICsgMSwgaCA9IE1hdGguZmxvb3IoSCksIHYgPSArdmFsdWVzW2ggLSAxXSwgZSA9IEggLSBoO1xuICAgIHJldHVybiBlID8gdiArIGUgKiAodmFsdWVzW2hdIC0gdikgOiB2O1xuICB9O1xuICBkMy5tZWRpYW4gPSBmdW5jdGlvbihhcnJheSwgZikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkgYXJyYXkgPSBhcnJheS5tYXAoZik7XG4gICAgYXJyYXkgPSBhcnJheS5maWx0ZXIoZDNfbnVtYmVyKTtcbiAgICByZXR1cm4gYXJyYXkubGVuZ3RoID8gZDMucXVhbnRpbGUoYXJyYXkuc29ydChkM19hc2NlbmRpbmcpLCAuNSkgOiB1bmRlZmluZWQ7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2Jpc2VjdG9yKGNvbXBhcmUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGVmdDogZnVuY3Rpb24oYSwgeCwgbG8sIGhpKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykgbG8gPSAwO1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDQpIGhpID0gYS5sZW5ndGg7XG4gICAgICAgIHdoaWxlIChsbyA8IGhpKSB7XG4gICAgICAgICAgdmFyIG1pZCA9IGxvICsgaGkgPj4+IDE7XG4gICAgICAgICAgaWYgKGNvbXBhcmUoYVttaWRdLCB4KSA8IDApIGxvID0gbWlkICsgMTsgZWxzZSBoaSA9IG1pZDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbG87XG4gICAgICB9LFxuICAgICAgcmlnaHQ6IGZ1bmN0aW9uKGEsIHgsIGxvLCBoaSkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIGxvID0gMDtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCA0KSBoaSA9IGEubGVuZ3RoO1xuICAgICAgICB3aGlsZSAobG8gPCBoaSkge1xuICAgICAgICAgIHZhciBtaWQgPSBsbyArIGhpID4+PiAxO1xuICAgICAgICAgIGlmIChjb21wYXJlKGFbbWlkXSwgeCkgPiAwKSBoaSA9IG1pZDsgZWxzZSBsbyA9IG1pZCArIDE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxvO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgdmFyIGQzX2Jpc2VjdCA9IGQzX2Jpc2VjdG9yKGQzX2FzY2VuZGluZyk7XG4gIGQzLmJpc2VjdExlZnQgPSBkM19iaXNlY3QubGVmdDtcbiAgZDMuYmlzZWN0ID0gZDMuYmlzZWN0UmlnaHQgPSBkM19iaXNlY3QucmlnaHQ7XG4gIGQzLmJpc2VjdG9yID0gZnVuY3Rpb24oZikge1xuICAgIHJldHVybiBkM19iaXNlY3RvcihmLmxlbmd0aCA9PT0gMSA/IGZ1bmN0aW9uKGQsIHgpIHtcbiAgICAgIHJldHVybiBkM19hc2NlbmRpbmcoZihkKSwgeCk7XG4gICAgfSA6IGYpO1xuICB9O1xuICBkMy5zaHVmZmxlID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgbSA9IGFycmF5Lmxlbmd0aCwgdCwgaTtcbiAgICB3aGlsZSAobSkge1xuICAgICAgaSA9IE1hdGgucmFuZG9tKCkgKiBtLS0gfCAwO1xuICAgICAgdCA9IGFycmF5W21dLCBhcnJheVttXSA9IGFycmF5W2ldLCBhcnJheVtpXSA9IHQ7XG4gICAgfVxuICAgIHJldHVybiBhcnJheTtcbiAgfTtcbiAgZDMucGVybXV0ZSA9IGZ1bmN0aW9uKGFycmF5LCBpbmRleGVzKSB7XG4gICAgdmFyIGkgPSBpbmRleGVzLmxlbmd0aCwgcGVybXV0ZXMgPSBuZXcgQXJyYXkoaSk7XG4gICAgd2hpbGUgKGktLSkgcGVybXV0ZXNbaV0gPSBhcnJheVtpbmRleGVzW2ldXTtcbiAgICByZXR1cm4gcGVybXV0ZXM7XG4gIH07XG4gIGQzLnBhaXJzID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgaSA9IDAsIG4gPSBhcnJheS5sZW5ndGggLSAxLCBwMCwgcDEgPSBhcnJheVswXSwgcGFpcnMgPSBuZXcgQXJyYXkobiA8IDAgPyAwIDogbik7XG4gICAgd2hpbGUgKGkgPCBuKSBwYWlyc1tpXSA9IFsgcDAgPSBwMSwgcDEgPSBhcnJheVsrK2ldIF07XG4gICAgcmV0dXJuIHBhaXJzO1xuICB9O1xuICBkMy56aXAgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIShuID0gYXJndW1lbnRzLmxlbmd0aCkpIHJldHVybiBbXTtcbiAgICBmb3IgKHZhciBpID0gLTEsIG0gPSBkMy5taW4oYXJndW1lbnRzLCBkM196aXBMZW5ndGgpLCB6aXBzID0gbmV3IEFycmF5KG0pOyArK2kgPCBtOyApIHtcbiAgICAgIGZvciAodmFyIGogPSAtMSwgbiwgemlwID0gemlwc1tpXSA9IG5ldyBBcnJheShuKTsgKytqIDwgbjsgKSB7XG4gICAgICAgIHppcFtqXSA9IGFyZ3VtZW50c1tqXVtpXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHppcHM7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3ppcExlbmd0aChkKSB7XG4gICAgcmV0dXJuIGQubGVuZ3RoO1xuICB9XG4gIGQzLnRyYW5zcG9zZSA9IGZ1bmN0aW9uKG1hdHJpeCkge1xuICAgIHJldHVybiBkMy56aXAuYXBwbHkoZDMsIG1hdHJpeCk7XG4gIH07XG4gIGQzLmtleXMgPSBmdW5jdGlvbihtYXApIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBtYXApIGtleXMucHVzaChrZXkpO1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xuICBkMy52YWx1ZXMgPSBmdW5jdGlvbihtYXApIHtcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG1hcCkgdmFsdWVzLnB1c2gobWFwW2tleV0pO1xuICAgIHJldHVybiB2YWx1ZXM7XG4gIH07XG4gIGQzLmVudHJpZXMgPSBmdW5jdGlvbihtYXApIHtcbiAgICB2YXIgZW50cmllcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBtYXApIGVudHJpZXMucHVzaCh7XG4gICAgICBrZXk6IGtleSxcbiAgICAgIHZhbHVlOiBtYXBba2V5XVxuICAgIH0pO1xuICAgIHJldHVybiBlbnRyaWVzO1xuICB9O1xuICBkMy5tZXJnZSA9IGZ1bmN0aW9uKGFycmF5cykge1xuICAgIHZhciBuID0gYXJyYXlzLmxlbmd0aCwgbSwgaSA9IC0xLCBqID0gMCwgbWVyZ2VkLCBhcnJheTtcbiAgICB3aGlsZSAoKytpIDwgbikgaiArPSBhcnJheXNbaV0ubGVuZ3RoO1xuICAgIG1lcmdlZCA9IG5ldyBBcnJheShqKTtcbiAgICB3aGlsZSAoLS1uID49IDApIHtcbiAgICAgIGFycmF5ID0gYXJyYXlzW25dO1xuICAgICAgbSA9IGFycmF5Lmxlbmd0aDtcbiAgICAgIHdoaWxlICgtLW0gPj0gMCkge1xuICAgICAgICBtZXJnZWRbLS1qXSA9IGFycmF5W21dO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWVyZ2VkO1xuICB9O1xuICB2YXIgYWJzID0gTWF0aC5hYnM7XG4gIGQzLnJhbmdlID0gZnVuY3Rpb24oc3RhcnQsIHN0b3AsIHN0ZXApIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgIHN0ZXAgPSAxO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICAgIHN0b3AgPSBzdGFydDtcbiAgICAgICAgc3RhcnQgPSAwO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoKHN0b3AgLSBzdGFydCkgLyBzdGVwID09PSBJbmZpbml0eSkgdGhyb3cgbmV3IEVycm9yKFwiaW5maW5pdGUgcmFuZ2VcIik7XG4gICAgdmFyIHJhbmdlID0gW10sIGsgPSBkM19yYW5nZV9pbnRlZ2VyU2NhbGUoYWJzKHN0ZXApKSwgaSA9IC0xLCBqO1xuICAgIHN0YXJ0ICo9IGssIHN0b3AgKj0gaywgc3RlcCAqPSBrO1xuICAgIGlmIChzdGVwIDwgMCkgd2hpbGUgKChqID0gc3RhcnQgKyBzdGVwICogKytpKSA+IHN0b3ApIHJhbmdlLnB1c2goaiAvIGspOyBlbHNlIHdoaWxlICgoaiA9IHN0YXJ0ICsgc3RlcCAqICsraSkgPCBzdG9wKSByYW5nZS5wdXNoKGogLyBrKTtcbiAgICByZXR1cm4gcmFuZ2U7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3JhbmdlX2ludGVnZXJTY2FsZSh4KSB7XG4gICAgdmFyIGsgPSAxO1xuICAgIHdoaWxlICh4ICogayAlIDEpIGsgKj0gMTA7XG4gICAgcmV0dXJuIGs7XG4gIH1cbiAgZnVuY3Rpb24gZDNfY2xhc3MoY3RvciwgcHJvcGVydGllcykge1xuICAgIHRyeSB7XG4gICAgICBmb3IgKHZhciBrZXkgaW4gcHJvcGVydGllcykge1xuICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoY3Rvci5wcm90b3R5cGUsIGtleSwge1xuICAgICAgICAgIHZhbHVlOiBwcm9wZXJ0aWVzW2tleV0sXG4gICAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgY3Rvci5wcm90b3R5cGUgPSBwcm9wZXJ0aWVzO1xuICAgIH1cbiAgfVxuICBkMy5tYXAgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICB2YXIgbWFwID0gbmV3IGQzX01hcCgpO1xuICAgIGlmIChvYmplY3QgaW5zdGFuY2VvZiBkM19NYXApIG9iamVjdC5mb3JFYWNoKGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAgIG1hcC5zZXQoa2V5LCB2YWx1ZSk7XG4gICAgfSk7IGVsc2UgZm9yICh2YXIga2V5IGluIG9iamVjdCkgbWFwLnNldChrZXksIG9iamVjdFtrZXldKTtcbiAgICByZXR1cm4gbWFwO1xuICB9O1xuICBmdW5jdGlvbiBkM19NYXAoKSB7fVxuICBkM19jbGFzcyhkM19NYXAsIHtcbiAgICBoYXM6IGQzX21hcF9oYXMsXG4gICAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiB0aGlzW2QzX21hcF9wcmVmaXggKyBrZXldO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICByZXR1cm4gdGhpc1tkM19tYXBfcHJlZml4ICsga2V5XSA9IHZhbHVlO1xuICAgIH0sXG4gICAgcmVtb3ZlOiBkM19tYXBfcmVtb3ZlLFxuICAgIGtleXM6IGQzX21hcF9rZXlzLFxuICAgIHZhbHVlczogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdmFsdWVzID0gW107XG4gICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICB2YWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB2YWx1ZXM7XG4gICAgfSxcbiAgICBlbnRyaWVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBlbnRyaWVzID0gW107XG4gICAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgICAgICBlbnRyaWVzLnB1c2goe1xuICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgIHZhbHVlOiB2YWx1ZVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIGVudHJpZXM7XG4gICAgfSxcbiAgICBzaXplOiBkM19tYXBfc2l6ZSxcbiAgICBlbXB0eTogZDNfbWFwX2VtcHR5LFxuICAgIGZvckVhY2g6IGZ1bmN0aW9uKGYpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzKSBpZiAoa2V5LmNoYXJDb2RlQXQoMCkgPT09IGQzX21hcF9wcmVmaXhDb2RlKSBmLmNhbGwodGhpcywga2V5LnN1YnN0cmluZygxKSwgdGhpc1trZXldKTtcbiAgICB9XG4gIH0pO1xuICB2YXIgZDNfbWFwX3ByZWZpeCA9IFwiXFx4MDBcIiwgZDNfbWFwX3ByZWZpeENvZGUgPSBkM19tYXBfcHJlZml4LmNoYXJDb2RlQXQoMCk7XG4gIGZ1bmN0aW9uIGQzX21hcF9oYXMoa2V5KSB7XG4gICAgcmV0dXJuIGQzX21hcF9wcmVmaXggKyBrZXkgaW4gdGhpcztcbiAgfVxuICBmdW5jdGlvbiBkM19tYXBfcmVtb3ZlKGtleSkge1xuICAgIGtleSA9IGQzX21hcF9wcmVmaXggKyBrZXk7XG4gICAgcmV0dXJuIGtleSBpbiB0aGlzICYmIGRlbGV0ZSB0aGlzW2tleV07XG4gIH1cbiAgZnVuY3Rpb24gZDNfbWFwX2tleXMoKSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICBrZXlzLnB1c2goa2V5KTtcbiAgICB9KTtcbiAgICByZXR1cm4ga2V5cztcbiAgfVxuICBmdW5jdGlvbiBkM19tYXBfc2l6ZSgpIHtcbiAgICB2YXIgc2l6ZSA9IDA7XG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMpIGlmIChrZXkuY2hhckNvZGVBdCgwKSA9PT0gZDNfbWFwX3ByZWZpeENvZGUpICsrc2l6ZTtcbiAgICByZXR1cm4gc2l6ZTtcbiAgfVxuICBmdW5jdGlvbiBkM19tYXBfZW1wdHkoKSB7XG4gICAgZm9yICh2YXIga2V5IGluIHRoaXMpIGlmIChrZXkuY2hhckNvZGVBdCgwKSA9PT0gZDNfbWFwX3ByZWZpeENvZGUpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBkMy5uZXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG5lc3QgPSB7fSwga2V5cyA9IFtdLCBzb3J0S2V5cyA9IFtdLCBzb3J0VmFsdWVzLCByb2xsdXA7XG4gICAgZnVuY3Rpb24gbWFwKG1hcFR5cGUsIGFycmF5LCBkZXB0aCkge1xuICAgICAgaWYgKGRlcHRoID49IGtleXMubGVuZ3RoKSByZXR1cm4gcm9sbHVwID8gcm9sbHVwLmNhbGwobmVzdCwgYXJyYXkpIDogc29ydFZhbHVlcyA/IGFycmF5LnNvcnQoc29ydFZhbHVlcykgOiBhcnJheTtcbiAgICAgIHZhciBpID0gLTEsIG4gPSBhcnJheS5sZW5ndGgsIGtleSA9IGtleXNbZGVwdGgrK10sIGtleVZhbHVlLCBvYmplY3QsIHNldHRlciwgdmFsdWVzQnlLZXkgPSBuZXcgZDNfTWFwKCksIHZhbHVlcztcbiAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgIGlmICh2YWx1ZXMgPSB2YWx1ZXNCeUtleS5nZXQoa2V5VmFsdWUgPSBrZXkob2JqZWN0ID0gYXJyYXlbaV0pKSkge1xuICAgICAgICAgIHZhbHVlcy5wdXNoKG9iamVjdCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWVzQnlLZXkuc2V0KGtleVZhbHVlLCBbIG9iamVjdCBdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKG1hcFR5cGUpIHtcbiAgICAgICAgb2JqZWN0ID0gbWFwVHlwZSgpO1xuICAgICAgICBzZXR0ZXIgPSBmdW5jdGlvbihrZXlWYWx1ZSwgdmFsdWVzKSB7XG4gICAgICAgICAgb2JqZWN0LnNldChrZXlWYWx1ZSwgbWFwKG1hcFR5cGUsIHZhbHVlcywgZGVwdGgpKTtcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9iamVjdCA9IHt9O1xuICAgICAgICBzZXR0ZXIgPSBmdW5jdGlvbihrZXlWYWx1ZSwgdmFsdWVzKSB7XG4gICAgICAgICAgb2JqZWN0W2tleVZhbHVlXSA9IG1hcChtYXBUeXBlLCB2YWx1ZXMsIGRlcHRoKTtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIHZhbHVlc0J5S2V5LmZvckVhY2goc2V0dGVyKTtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGVudHJpZXMobWFwLCBkZXB0aCkge1xuICAgICAgaWYgKGRlcHRoID49IGtleXMubGVuZ3RoKSByZXR1cm4gbWFwO1xuICAgICAgdmFyIGFycmF5ID0gW10sIHNvcnRLZXkgPSBzb3J0S2V5c1tkZXB0aCsrXTtcbiAgICAgIG1hcC5mb3JFYWNoKGZ1bmN0aW9uKGtleSwga2V5TWFwKSB7XG4gICAgICAgIGFycmF5LnB1c2goe1xuICAgICAgICAgIGtleToga2V5LFxuICAgICAgICAgIHZhbHVlczogZW50cmllcyhrZXlNYXAsIGRlcHRoKVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHNvcnRLZXkgPyBhcnJheS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIHNvcnRLZXkoYS5rZXksIGIua2V5KTtcbiAgICAgIH0pIDogYXJyYXk7XG4gICAgfVxuICAgIG5lc3QubWFwID0gZnVuY3Rpb24oYXJyYXksIG1hcFR5cGUpIHtcbiAgICAgIHJldHVybiBtYXAobWFwVHlwZSwgYXJyYXksIDApO1xuICAgIH07XG4gICAgbmVzdC5lbnRyaWVzID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICAgIHJldHVybiBlbnRyaWVzKG1hcChkMy5tYXAsIGFycmF5LCAwKSwgMCk7XG4gICAgfTtcbiAgICBuZXN0LmtleSA9IGZ1bmN0aW9uKGQpIHtcbiAgICAgIGtleXMucHVzaChkKTtcbiAgICAgIHJldHVybiBuZXN0O1xuICAgIH07XG4gICAgbmVzdC5zb3J0S2V5cyA9IGZ1bmN0aW9uKG9yZGVyKSB7XG4gICAgICBzb3J0S2V5c1trZXlzLmxlbmd0aCAtIDFdID0gb3JkZXI7XG4gICAgICByZXR1cm4gbmVzdDtcbiAgICB9O1xuICAgIG5lc3Quc29ydFZhbHVlcyA9IGZ1bmN0aW9uKG9yZGVyKSB7XG4gICAgICBzb3J0VmFsdWVzID0gb3JkZXI7XG4gICAgICByZXR1cm4gbmVzdDtcbiAgICB9O1xuICAgIG5lc3Qucm9sbHVwID0gZnVuY3Rpb24oZikge1xuICAgICAgcm9sbHVwID0gZjtcbiAgICAgIHJldHVybiBuZXN0O1xuICAgIH07XG4gICAgcmV0dXJuIG5lc3Q7XG4gIH07XG4gIGQzLnNldCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHNldCA9IG5ldyBkM19TZXQoKTtcbiAgICBpZiAoYXJyYXkpIGZvciAodmFyIGkgPSAwLCBuID0gYXJyYXkubGVuZ3RoOyBpIDwgbjsgKytpKSBzZXQuYWRkKGFycmF5W2ldKTtcbiAgICByZXR1cm4gc2V0O1xuICB9O1xuICBmdW5jdGlvbiBkM19TZXQoKSB7fVxuICBkM19jbGFzcyhkM19TZXQsIHtcbiAgICBoYXM6IGQzX21hcF9oYXMsXG4gICAgYWRkOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdGhpc1tkM19tYXBfcHJlZml4ICsgdmFsdWVdID0gdHJ1ZTtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHZhbHVlID0gZDNfbWFwX3ByZWZpeCArIHZhbHVlO1xuICAgICAgcmV0dXJuIHZhbHVlIGluIHRoaXMgJiYgZGVsZXRlIHRoaXNbdmFsdWVdO1xuICAgIH0sXG4gICAgdmFsdWVzOiBkM19tYXBfa2V5cyxcbiAgICBzaXplOiBkM19tYXBfc2l6ZSxcbiAgICBlbXB0eTogZDNfbWFwX2VtcHR5LFxuICAgIGZvckVhY2g6IGZ1bmN0aW9uKGYpIHtcbiAgICAgIGZvciAodmFyIHZhbHVlIGluIHRoaXMpIGlmICh2YWx1ZS5jaGFyQ29kZUF0KDApID09PSBkM19tYXBfcHJlZml4Q29kZSkgZi5jYWxsKHRoaXMsIHZhbHVlLnN1YnN0cmluZygxKSk7XG4gICAgfVxuICB9KTtcbiAgZDMuYmVoYXZpb3IgPSB7fTtcbiAgZDMucmViaW5kID0gZnVuY3Rpb24odGFyZ2V0LCBzb3VyY2UpIHtcbiAgICB2YXIgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoLCBtZXRob2Q7XG4gICAgd2hpbGUgKCsraSA8IG4pIHRhcmdldFttZXRob2QgPSBhcmd1bWVudHNbaV1dID0gZDNfcmViaW5kKHRhcmdldCwgc291cmNlLCBzb3VyY2VbbWV0aG9kXSk7XG4gICAgcmV0dXJuIHRhcmdldDtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfcmViaW5kKHRhcmdldCwgc291cmNlLCBtZXRob2QpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdmFsdWUgPSBtZXRob2QuYXBwbHkoc291cmNlLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIHZhbHVlID09PSBzb3VyY2UgPyB0YXJnZXQgOiB2YWx1ZTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGQzX3ZlbmRvclN5bWJvbChvYmplY3QsIG5hbWUpIHtcbiAgICBpZiAobmFtZSBpbiBvYmplY3QpIHJldHVybiBuYW1lO1xuICAgIG5hbWUgPSBuYW1lLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgbmFtZS5zdWJzdHJpbmcoMSk7XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSBkM192ZW5kb3JQcmVmaXhlcy5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgIHZhciBwcmVmaXhOYW1lID0gZDNfdmVuZG9yUHJlZml4ZXNbaV0gKyBuYW1lO1xuICAgICAgaWYgKHByZWZpeE5hbWUgaW4gb2JqZWN0KSByZXR1cm4gcHJlZml4TmFtZTtcbiAgICB9XG4gIH1cbiAgdmFyIGQzX3ZlbmRvclByZWZpeGVzID0gWyBcIndlYmtpdFwiLCBcIm1zXCIsIFwibW96XCIsIFwiTW96XCIsIFwib1wiLCBcIk9cIiBdO1xuICBmdW5jdGlvbiBkM19ub29wKCkge31cbiAgZDMuZGlzcGF0Y2ggPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGlzcGF0Y2ggPSBuZXcgZDNfZGlzcGF0Y2goKSwgaSA9IC0xLCBuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikgZGlzcGF0Y2hbYXJndW1lbnRzW2ldXSA9IGQzX2Rpc3BhdGNoX2V2ZW50KGRpc3BhdGNoKTtcbiAgICByZXR1cm4gZGlzcGF0Y2g7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2Rpc3BhdGNoKCkge31cbiAgZDNfZGlzcGF0Y2gucHJvdG90eXBlLm9uID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgICB2YXIgaSA9IHR5cGUuaW5kZXhPZihcIi5cIiksIG5hbWUgPSBcIlwiO1xuICAgIGlmIChpID49IDApIHtcbiAgICAgIG5hbWUgPSB0eXBlLnN1YnN0cmluZyhpICsgMSk7XG4gICAgICB0eXBlID0gdHlwZS5zdWJzdHJpbmcoMCwgaSk7XG4gICAgfVxuICAgIGlmICh0eXBlKSByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA8IDIgPyB0aGlzW3R5cGVdLm9uKG5hbWUpIDogdGhpc1t0eXBlXS5vbihuYW1lLCBsaXN0ZW5lcik7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIpIHtcbiAgICAgIGlmIChsaXN0ZW5lciA9PSBudWxsKSBmb3IgKHR5cGUgaW4gdGhpcykge1xuICAgICAgICBpZiAodGhpcy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgdGhpc1t0eXBlXS5vbihuYW1lLCBudWxsKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgfTtcbiAgZnVuY3Rpb24gZDNfZGlzcGF0Y2hfZXZlbnQoZGlzcGF0Y2gpIHtcbiAgICB2YXIgbGlzdGVuZXJzID0gW10sIGxpc3RlbmVyQnlOYW1lID0gbmV3IGQzX01hcCgpO1xuICAgIGZ1bmN0aW9uIGV2ZW50KCkge1xuICAgICAgdmFyIHogPSBsaXN0ZW5lcnMsIGkgPSAtMSwgbiA9IHoubGVuZ3RoLCBsO1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmIChsID0geltpXS5vbikgbC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIGRpc3BhdGNoO1xuICAgIH1cbiAgICBldmVudC5vbiA9IGZ1bmN0aW9uKG5hbWUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgbCA9IGxpc3RlbmVyQnlOYW1lLmdldChuYW1lKSwgaTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcmV0dXJuIGwgJiYgbC5vbjtcbiAgICAgIGlmIChsKSB7XG4gICAgICAgIGwub24gPSBudWxsO1xuICAgICAgICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuc2xpY2UoMCwgaSA9IGxpc3RlbmVycy5pbmRleE9mKGwpKS5jb25jYXQobGlzdGVuZXJzLnNsaWNlKGkgKyAxKSk7XG4gICAgICAgIGxpc3RlbmVyQnlOYW1lLnJlbW92ZShuYW1lKTtcbiAgICAgIH1cbiAgICAgIGlmIChsaXN0ZW5lcikgbGlzdGVuZXJzLnB1c2gobGlzdGVuZXJCeU5hbWUuc2V0KG5hbWUsIHtcbiAgICAgICAgb246IGxpc3RlbmVyXG4gICAgICB9KSk7XG4gICAgICByZXR1cm4gZGlzcGF0Y2g7XG4gICAgfTtcbiAgICByZXR1cm4gZXZlbnQ7XG4gIH1cbiAgZDMuZXZlbnQgPSBudWxsO1xuICBmdW5jdGlvbiBkM19ldmVudFByZXZlbnREZWZhdWx0KCkge1xuICAgIGQzLmV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZXZlbnRTb3VyY2UoKSB7XG4gICAgdmFyIGUgPSBkMy5ldmVudCwgcztcbiAgICB3aGlsZSAocyA9IGUuc291cmNlRXZlbnQpIGUgPSBzO1xuICAgIHJldHVybiBlO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2V2ZW50RGlzcGF0Y2godGFyZ2V0KSB7XG4gICAgdmFyIGRpc3BhdGNoID0gbmV3IGQzX2Rpc3BhdGNoKCksIGkgPSAwLCBuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikgZGlzcGF0Y2hbYXJndW1lbnRzW2ldXSA9IGQzX2Rpc3BhdGNoX2V2ZW50KGRpc3BhdGNoKTtcbiAgICBkaXNwYXRjaC5vZiA9IGZ1bmN0aW9uKHRoaXosIGFyZ3VtZW50eikge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGUxKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmFyIGUwID0gZTEuc291cmNlRXZlbnQgPSBkMy5ldmVudDtcbiAgICAgICAgICBlMS50YXJnZXQgPSB0YXJnZXQ7XG4gICAgICAgICAgZDMuZXZlbnQgPSBlMTtcbiAgICAgICAgICBkaXNwYXRjaFtlMS50eXBlXS5hcHBseSh0aGl6LCBhcmd1bWVudHopO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIGQzLmV2ZW50ID0gZTA7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcbiAgICByZXR1cm4gZGlzcGF0Y2g7XG4gIH1cbiAgZDMucmVxdW90ZSA9IGZ1bmN0aW9uKHMpIHtcbiAgICByZXR1cm4gcy5yZXBsYWNlKGQzX3JlcXVvdGVfcmUsIFwiXFxcXCQmXCIpO1xuICB9O1xuICB2YXIgZDNfcmVxdW90ZV9yZSA9IC9bXFxcXFxcXlxcJFxcKlxcK1xcP1xcfFxcW1xcXVxcKFxcKVxcLlxce1xcfV0vZztcbiAgdmFyIGQzX3N1YmNsYXNzID0ge30uX19wcm90b19fID8gZnVuY3Rpb24ob2JqZWN0LCBwcm90b3R5cGUpIHtcbiAgICBvYmplY3QuX19wcm90b19fID0gcHJvdG90eXBlO1xuICB9IDogZnVuY3Rpb24ob2JqZWN0LCBwcm90b3R5cGUpIHtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiBwcm90b3R5cGUpIG9iamVjdFtwcm9wZXJ0eV0gPSBwcm90b3R5cGVbcHJvcGVydHldO1xuICB9O1xuICBmdW5jdGlvbiBkM19zZWxlY3Rpb24oZ3JvdXBzKSB7XG4gICAgZDNfc3ViY2xhc3MoZ3JvdXBzLCBkM19zZWxlY3Rpb25Qcm90b3R5cGUpO1xuICAgIHJldHVybiBncm91cHM7XG4gIH1cbiAgdmFyIGQzX3NlbGVjdCA9IGZ1bmN0aW9uKHMsIG4pIHtcbiAgICByZXR1cm4gbi5xdWVyeVNlbGVjdG9yKHMpO1xuICB9LCBkM19zZWxlY3RBbGwgPSBmdW5jdGlvbihzLCBuKSB7XG4gICAgcmV0dXJuIG4ucXVlcnlTZWxlY3RvckFsbChzKTtcbiAgfSwgZDNfc2VsZWN0TWF0Y2hlciA9IGQzX2RvY3VtZW50RWxlbWVudC5tYXRjaGVzIHx8IGQzX2RvY3VtZW50RWxlbWVudFtkM192ZW5kb3JTeW1ib2woZDNfZG9jdW1lbnRFbGVtZW50LCBcIm1hdGNoZXNTZWxlY3RvclwiKV0sIGQzX3NlbGVjdE1hdGNoZXMgPSBmdW5jdGlvbihuLCBzKSB7XG4gICAgcmV0dXJuIGQzX3NlbGVjdE1hdGNoZXIuY2FsbChuLCBzKTtcbiAgfTtcbiAgaWYgKHR5cGVvZiBTaXp6bGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGQzX3NlbGVjdCA9IGZ1bmN0aW9uKHMsIG4pIHtcbiAgICAgIHJldHVybiBTaXp6bGUocywgbilbMF0gfHwgbnVsbDtcbiAgICB9O1xuICAgIGQzX3NlbGVjdEFsbCA9IFNpenpsZTtcbiAgICBkM19zZWxlY3RNYXRjaGVzID0gU2l6emxlLm1hdGNoZXNTZWxlY3RvcjtcbiAgfVxuICBkMy5zZWxlY3Rpb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfc2VsZWN0aW9uUm9vdDtcbiAgfTtcbiAgdmFyIGQzX3NlbGVjdGlvblByb3RvdHlwZSA9IGQzLnNlbGVjdGlvbi5wcm90b3R5cGUgPSBbXTtcbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLnNlbGVjdCA9IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gICAgdmFyIHN1Ymdyb3VwcyA9IFtdLCBzdWJncm91cCwgc3Vibm9kZSwgZ3JvdXAsIG5vZGU7XG4gICAgc2VsZWN0b3IgPSBkM19zZWxlY3Rpb25fc2VsZWN0b3Ioc2VsZWN0b3IpO1xuICAgIGZvciAodmFyIGogPSAtMSwgbSA9IHRoaXMubGVuZ3RoOyArK2ogPCBtOyApIHtcbiAgICAgIHN1Ymdyb3Vwcy5wdXNoKHN1Ymdyb3VwID0gW10pO1xuICAgICAgc3ViZ3JvdXAucGFyZW50Tm9kZSA9IChncm91cCA9IHRoaXNbal0pLnBhcmVudE5vZGU7XG4gICAgICBmb3IgKHZhciBpID0gLTEsIG4gPSBncm91cC5sZW5ndGg7ICsraSA8IG47ICkge1xuICAgICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgICAgc3ViZ3JvdXAucHVzaChzdWJub2RlID0gc2VsZWN0b3IuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBqKSk7XG4gICAgICAgICAgaWYgKHN1Ym5vZGUgJiYgXCJfX2RhdGFfX1wiIGluIG5vZGUpIHN1Ym5vZGUuX19kYXRhX18gPSBub2RlLl9fZGF0YV9fO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN1Ymdyb3VwLnB1c2gobnVsbCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGQzX3NlbGVjdGlvbihzdWJncm91cHMpO1xuICB9O1xuICBmdW5jdGlvbiBkM19zZWxlY3Rpb25fc2VsZWN0b3Ioc2VsZWN0b3IpIHtcbiAgICByZXR1cm4gdHlwZW9mIHNlbGVjdG9yID09PSBcImZ1bmN0aW9uXCIgPyBzZWxlY3RvciA6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGQzX3NlbGVjdChzZWxlY3RvciwgdGhpcyk7XG4gICAgfTtcbiAgfVxuICBkM19zZWxlY3Rpb25Qcm90b3R5cGUuc2VsZWN0QWxsID0gZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICB2YXIgc3ViZ3JvdXBzID0gW10sIHN1Ymdyb3VwLCBub2RlO1xuICAgIHNlbGVjdG9yID0gZDNfc2VsZWN0aW9uX3NlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgICBmb3IgKHZhciBqID0gLTEsIG0gPSB0aGlzLmxlbmd0aDsgKytqIDwgbTsgKSB7XG4gICAgICBmb3IgKHZhciBncm91cCA9IHRoaXNbal0sIGkgPSAtMSwgbiA9IGdyb3VwLmxlbmd0aDsgKytpIDwgbjsgKSB7XG4gICAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgICBzdWJncm91cHMucHVzaChzdWJncm91cCA9IGQzX2FycmF5KHNlbGVjdG9yLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgaikpKTtcbiAgICAgICAgICBzdWJncm91cC5wYXJlbnROb2RlID0gbm9kZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZDNfc2VsZWN0aW9uKHN1Ymdyb3Vwcyk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9zZWxlY3RvckFsbChzZWxlY3Rvcikge1xuICAgIHJldHVybiB0eXBlb2Ygc2VsZWN0b3IgPT09IFwiZnVuY3Rpb25cIiA/IHNlbGVjdG9yIDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZDNfc2VsZWN0QWxsKHNlbGVjdG9yLCB0aGlzKTtcbiAgICB9O1xuICB9XG4gIHZhciBkM19uc1ByZWZpeCA9IHtcbiAgICBzdmc6IFwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIixcbiAgICB4aHRtbDogXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIsXG4gICAgeGxpbms6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLFxuICAgIHhtbDogXCJodHRwOi8vd3d3LnczLm9yZy9YTUwvMTk5OC9uYW1lc3BhY2VcIixcbiAgICB4bWxuczogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3htbG5zL1wiXG4gIH07XG4gIGQzLm5zID0ge1xuICAgIHByZWZpeDogZDNfbnNQcmVmaXgsXG4gICAgcXVhbGlmeTogZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGkgPSBuYW1lLmluZGV4T2YoXCI6XCIpLCBwcmVmaXggPSBuYW1lO1xuICAgICAgaWYgKGkgPj0gMCkge1xuICAgICAgICBwcmVmaXggPSBuYW1lLnN1YnN0cmluZygwLCBpKTtcbiAgICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyaW5nKGkgKyAxKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBkM19uc1ByZWZpeC5oYXNPd25Qcm9wZXJ0eShwcmVmaXgpID8ge1xuICAgICAgICBzcGFjZTogZDNfbnNQcmVmaXhbcHJlZml4XSxcbiAgICAgICAgbG9jYWw6IG5hbWVcbiAgICAgIH0gOiBuYW1lO1xuICAgIH1cbiAgfTtcbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLmF0dHIgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5ub2RlKCk7XG4gICAgICAgIG5hbWUgPSBkMy5ucy5xdWFsaWZ5KG5hbWUpO1xuICAgICAgICByZXR1cm4gbmFtZS5sb2NhbCA/IG5vZGUuZ2V0QXR0cmlidXRlTlMobmFtZS5zcGFjZSwgbmFtZS5sb2NhbCkgOiBub2RlLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICAgIH1cbiAgICAgIGZvciAodmFsdWUgaW4gbmFtZSkgdGhpcy5lYWNoKGQzX3NlbGVjdGlvbl9hdHRyKHZhbHVlLCBuYW1lW3ZhbHVlXSkpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVhY2goZDNfc2VsZWN0aW9uX2F0dHIobmFtZSwgdmFsdWUpKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc2VsZWN0aW9uX2F0dHIobmFtZSwgdmFsdWUpIHtcbiAgICBuYW1lID0gZDMubnMucXVhbGlmeShuYW1lKTtcbiAgICBmdW5jdGlvbiBhdHRyTnVsbCgpIHtcbiAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhdHRyTnVsbE5TKCkge1xuICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhuYW1lLnNwYWNlLCBuYW1lLmxvY2FsKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYXR0ckNvbnN0YW50KCkge1xuICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhdHRyQ29uc3RhbnROUygpIHtcbiAgICAgIHRoaXMuc2V0QXR0cmlidXRlTlMobmFtZS5zcGFjZSwgbmFtZS5sb2NhbCwgdmFsdWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhdHRyRnVuY3Rpb24oKSB7XG4gICAgICB2YXIgeCA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoeCA9PSBudWxsKSB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTsgZWxzZSB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCB4KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYXR0ckZ1bmN0aW9uTlMoKSB7XG4gICAgICB2YXIgeCA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoeCA9PSBudWxsKSB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKG5hbWUuc3BhY2UsIG5hbWUubG9jYWwpOyBlbHNlIHRoaXMuc2V0QXR0cmlidXRlTlMobmFtZS5zcGFjZSwgbmFtZS5sb2NhbCwgeCk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZSA9PSBudWxsID8gbmFtZS5sb2NhbCA/IGF0dHJOdWxsTlMgOiBhdHRyTnVsbCA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gbmFtZS5sb2NhbCA/IGF0dHJGdW5jdGlvbk5TIDogYXR0ckZ1bmN0aW9uIDogbmFtZS5sb2NhbCA/IGF0dHJDb25zdGFudE5TIDogYXR0ckNvbnN0YW50O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2NvbGxhcHNlKHMpIHtcbiAgICByZXR1cm4gcy50cmltKCkucmVwbGFjZSgvXFxzKy9nLCBcIiBcIik7XG4gIH1cbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLmNsYXNzZWQgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHZhciBub2RlID0gdGhpcy5ub2RlKCksIG4gPSAobmFtZSA9IGQzX3NlbGVjdGlvbl9jbGFzc2VzKG5hbWUpKS5sZW5ndGgsIGkgPSAtMTtcbiAgICAgICAgaWYgKHZhbHVlID0gbm9kZS5jbGFzc0xpc3QpIHtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikgaWYgKCF2YWx1ZS5jb250YWlucyhuYW1lW2ldKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gbm9kZS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKTtcbiAgICAgICAgICB3aGlsZSAoKytpIDwgbikgaWYgKCFkM19zZWxlY3Rpb25fY2xhc3NlZFJlKG5hbWVbaV0pLnRlc3QodmFsdWUpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICBmb3IgKHZhbHVlIGluIG5hbWUpIHRoaXMuZWFjaChkM19zZWxlY3Rpb25fY2xhc3NlZCh2YWx1ZSwgbmFtZVt2YWx1ZV0pKTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lYWNoKGQzX3NlbGVjdGlvbl9jbGFzc2VkKG5hbWUsIHZhbHVlKSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9jbGFzc2VkUmUobmFtZSkge1xuICAgIHJldHVybiBuZXcgUmVnRXhwKFwiKD86XnxcXFxccyspXCIgKyBkMy5yZXF1b3RlKG5hbWUpICsgXCIoPzpcXFxccyt8JClcIiwgXCJnXCIpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9jbGFzc2VzKG5hbWUpIHtcbiAgICByZXR1cm4gKG5hbWUgKyBcIlwiKS50cmltKCkuc3BsaXQoL158XFxzKy8pO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9jbGFzc2VkKG5hbWUsIHZhbHVlKSB7XG4gICAgbmFtZSA9IGQzX3NlbGVjdGlvbl9jbGFzc2VzKG5hbWUpLm1hcChkM19zZWxlY3Rpb25fY2xhc3NlZE5hbWUpO1xuICAgIHZhciBuID0gbmFtZS5sZW5ndGg7XG4gICAgZnVuY3Rpb24gY2xhc3NlZENvbnN0YW50KCkge1xuICAgICAgdmFyIGkgPSAtMTtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBuYW1lW2ldKHRoaXMsIHZhbHVlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY2xhc3NlZEZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGkgPSAtMSwgeCA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB3aGlsZSAoKytpIDwgbikgbmFtZVtpXSh0aGlzLCB4KTtcbiAgICB9XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gY2xhc3NlZEZ1bmN0aW9uIDogY2xhc3NlZENvbnN0YW50O1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9jbGFzc2VkTmFtZShuYW1lKSB7XG4gICAgdmFyIHJlID0gZDNfc2VsZWN0aW9uX2NsYXNzZWRSZShuYW1lKTtcbiAgICByZXR1cm4gZnVuY3Rpb24obm9kZSwgdmFsdWUpIHtcbiAgICAgIGlmIChjID0gbm9kZS5jbGFzc0xpc3QpIHJldHVybiB2YWx1ZSA/IGMuYWRkKG5hbWUpIDogYy5yZW1vdmUobmFtZSk7XG4gICAgICB2YXIgYyA9IG5vZGUuZ2V0QXR0cmlidXRlKFwiY2xhc3NcIikgfHwgXCJcIjtcbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICByZS5sYXN0SW5kZXggPSAwO1xuICAgICAgICBpZiAoIXJlLnRlc3QoYykpIG5vZGUuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgZDNfY29sbGFwc2UoYyArIFwiIFwiICsgbmFtZSkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBkM19jb2xsYXBzZShjLnJlcGxhY2UocmUsIFwiIFwiKSkpO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLnN0eWxlID0gZnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gICAgdmFyIG4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGlmIChuIDwgMykge1xuICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIGlmIChuIDwgMikgdmFsdWUgPSBcIlwiO1xuICAgICAgICBmb3IgKHByaW9yaXR5IGluIG5hbWUpIHRoaXMuZWFjaChkM19zZWxlY3Rpb25fc3R5bGUocHJpb3JpdHksIG5hbWVbcHJpb3JpdHldLCB2YWx1ZSkpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIGlmIChuIDwgMikgcmV0dXJuIGQzX3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMubm9kZSgpLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKG5hbWUpO1xuICAgICAgcHJpb3JpdHkgPSBcIlwiO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lYWNoKGQzX3NlbGVjdGlvbl9zdHlsZShuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc2VsZWN0aW9uX3N0eWxlKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICAgIGZ1bmN0aW9uIHN0eWxlTnVsbCgpIHtcbiAgICAgIHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHN0eWxlQ29uc3RhbnQoKSB7XG4gICAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHZhbHVlLCBwcmlvcml0eSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHN0eWxlRnVuY3Rpb24oKSB7XG4gICAgICB2YXIgeCA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoeCA9PSBudWxsKSB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpOyBlbHNlIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkobmFtZSwgeCwgcHJpb3JpdHkpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/IHN0eWxlTnVsbCA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gc3R5bGVGdW5jdGlvbiA6IHN0eWxlQ29uc3RhbnQ7XG4gIH1cbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLnByb3BlcnR5ID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIHRoaXMubm9kZSgpW25hbWVdO1xuICAgICAgZm9yICh2YWx1ZSBpbiBuYW1lKSB0aGlzLmVhY2goZDNfc2VsZWN0aW9uX3Byb3BlcnR5KHZhbHVlLCBuYW1lW3ZhbHVlXSkpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmVhY2goZDNfc2VsZWN0aW9uX3Byb3BlcnR5KG5hbWUsIHZhbHVlKSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9wcm9wZXJ0eShuYW1lLCB2YWx1ZSkge1xuICAgIGZ1bmN0aW9uIHByb3BlcnR5TnVsbCgpIHtcbiAgICAgIGRlbGV0ZSB0aGlzW25hbWVdO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwcm9wZXJ0eUNvbnN0YW50KCkge1xuICAgICAgdGhpc1tuYW1lXSA9IHZhbHVlO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwcm9wZXJ0eUZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHggPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgaWYgKHggPT0gbnVsbCkgZGVsZXRlIHRoaXNbbmFtZV07IGVsc2UgdGhpc1tuYW1lXSA9IHg7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZSA9PSBudWxsID8gcHJvcGVydHlOdWxsIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyBwcm9wZXJ0eUZ1bmN0aW9uIDogcHJvcGVydHlDb25zdGFudDtcbiAgfVxuICBkM19zZWxlY3Rpb25Qcm90b3R5cGUudGV4dCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyB0aGlzLmVhY2godHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHRoaXMudGV4dENvbnRlbnQgPSB2ID09IG51bGwgPyBcIlwiIDogdjtcbiAgICB9IDogdmFsdWUgPT0gbnVsbCA/IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy50ZXh0Q29udGVudCA9IFwiXCI7XG4gICAgfSA6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy50ZXh0Q29udGVudCA9IHZhbHVlO1xuICAgIH0pIDogdGhpcy5ub2RlKCkudGV4dENvbnRlbnQ7XG4gIH07XG4gIGQzX3NlbGVjdGlvblByb3RvdHlwZS5odG1sID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IHRoaXMuZWFjaCh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgdGhpcy5pbm5lckhUTUwgPSB2ID09IG51bGwgPyBcIlwiIDogdjtcbiAgICB9IDogdmFsdWUgPT0gbnVsbCA/IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5pbm5lckhUTUwgPSBcIlwiO1xuICAgIH0gOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuaW5uZXJIVE1MID0gdmFsdWU7XG4gICAgfSkgOiB0aGlzLm5vZGUoKS5pbm5lckhUTUw7XG4gIH07XG4gIGQzX3NlbGVjdGlvblByb3RvdHlwZS5hcHBlbmQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgbmFtZSA9IGQzX3NlbGVjdGlvbl9jcmVhdG9yKG5hbWUpO1xuICAgIHJldHVybiB0aGlzLnNlbGVjdChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmFwcGVuZENoaWxkKG5hbWUuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gICAgfSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9jcmVhdG9yKG5hbWUpIHtcbiAgICByZXR1cm4gdHlwZW9mIG5hbWUgPT09IFwiZnVuY3Rpb25cIiA/IG5hbWUgOiAobmFtZSA9IGQzLm5zLnF1YWxpZnkobmFtZSkpLmxvY2FsID8gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhuYW1lLnNwYWNlLCBuYW1lLmxvY2FsKTtcbiAgICB9IDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyh0aGlzLm5hbWVzcGFjZVVSSSwgbmFtZSk7XG4gICAgfTtcbiAgfVxuICBkM19zZWxlY3Rpb25Qcm90b3R5cGUuaW5zZXJ0ID0gZnVuY3Rpb24obmFtZSwgYmVmb3JlKSB7XG4gICAgbmFtZSA9IGQzX3NlbGVjdGlvbl9jcmVhdG9yKG5hbWUpO1xuICAgIGJlZm9yZSA9IGQzX3NlbGVjdGlvbl9zZWxlY3RvcihiZWZvcmUpO1xuICAgIHJldHVybiB0aGlzLnNlbGVjdChmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmluc2VydEJlZm9yZShuYW1lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksIGJlZm9yZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpIHx8IG51bGwpO1xuICAgIH0pO1xuICB9O1xuICBkM19zZWxlY3Rpb25Qcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gICAgICBpZiAocGFyZW50KSBwYXJlbnQucmVtb3ZlQ2hpbGQodGhpcyk7XG4gICAgfSk7XG4gIH07XG4gIGQzX3NlbGVjdGlvblByb3RvdHlwZS5kYXRhID0gZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgIHZhciBpID0gLTEsIG4gPSB0aGlzLmxlbmd0aCwgZ3JvdXAsIG5vZGU7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICB2YWx1ZSA9IG5ldyBBcnJheShuID0gKGdyb3VwID0gdGhpc1swXSkubGVuZ3RoKTtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgICB2YWx1ZVtpXSA9IG5vZGUuX19kYXRhX187XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYmluZChncm91cCwgZ3JvdXBEYXRhKSB7XG4gICAgICB2YXIgaSwgbiA9IGdyb3VwLmxlbmd0aCwgbSA9IGdyb3VwRGF0YS5sZW5ndGgsIG4wID0gTWF0aC5taW4obiwgbSksIHVwZGF0ZU5vZGVzID0gbmV3IEFycmF5KG0pLCBlbnRlck5vZGVzID0gbmV3IEFycmF5KG0pLCBleGl0Tm9kZXMgPSBuZXcgQXJyYXkobiksIG5vZGUsIG5vZGVEYXRhO1xuICAgICAgaWYgKGtleSkge1xuICAgICAgICB2YXIgbm9kZUJ5S2V5VmFsdWUgPSBuZXcgZDNfTWFwKCksIGRhdGFCeUtleVZhbHVlID0gbmV3IGQzX01hcCgpLCBrZXlWYWx1ZXMgPSBbXSwga2V5VmFsdWU7XG4gICAgICAgIGZvciAoaSA9IC0xOyArK2kgPCBuOyApIHtcbiAgICAgICAgICBrZXlWYWx1ZSA9IGtleS5jYWxsKG5vZGUgPSBncm91cFtpXSwgbm9kZS5fX2RhdGFfXywgaSk7XG4gICAgICAgICAgaWYgKG5vZGVCeUtleVZhbHVlLmhhcyhrZXlWYWx1ZSkpIHtcbiAgICAgICAgICAgIGV4aXROb2Rlc1tpXSA9IG5vZGU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG5vZGVCeUtleVZhbHVlLnNldChrZXlWYWx1ZSwgbm9kZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGtleVZhbHVlcy5wdXNoKGtleVZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAtMTsgKytpIDwgbTsgKSB7XG4gICAgICAgICAga2V5VmFsdWUgPSBrZXkuY2FsbChncm91cERhdGEsIG5vZGVEYXRhID0gZ3JvdXBEYXRhW2ldLCBpKTtcbiAgICAgICAgICBpZiAobm9kZSA9IG5vZGVCeUtleVZhbHVlLmdldChrZXlWYWx1ZSkpIHtcbiAgICAgICAgICAgIHVwZGF0ZU5vZGVzW2ldID0gbm9kZTtcbiAgICAgICAgICAgIG5vZGUuX19kYXRhX18gPSBub2RlRGF0YTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCFkYXRhQnlLZXlWYWx1ZS5oYXMoa2V5VmFsdWUpKSB7XG4gICAgICAgICAgICBlbnRlck5vZGVzW2ldID0gZDNfc2VsZWN0aW9uX2RhdGFOb2RlKG5vZGVEYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGF0YUJ5S2V5VmFsdWUuc2V0KGtleVZhbHVlLCBub2RlRGF0YSk7XG4gICAgICAgICAgbm9kZUJ5S2V5VmFsdWUucmVtb3ZlKGtleVZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICBmb3IgKGkgPSAtMTsgKytpIDwgbjsgKSB7XG4gICAgICAgICAgaWYgKG5vZGVCeUtleVZhbHVlLmhhcyhrZXlWYWx1ZXNbaV0pKSB7XG4gICAgICAgICAgICBleGl0Tm9kZXNbaV0gPSBncm91cFtpXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoaSA9IC0xOyArK2kgPCBuMDsgKSB7XG4gICAgICAgICAgbm9kZSA9IGdyb3VwW2ldO1xuICAgICAgICAgIG5vZGVEYXRhID0gZ3JvdXBEYXRhW2ldO1xuICAgICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgICBub2RlLl9fZGF0YV9fID0gbm9kZURhdGE7XG4gICAgICAgICAgICB1cGRhdGVOb2Rlc1tpXSA9IG5vZGU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVudGVyTm9kZXNbaV0gPSBkM19zZWxlY3Rpb25fZGF0YU5vZGUobm9kZURhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBmb3IgKDtpIDwgbTsgKytpKSB7XG4gICAgICAgICAgZW50ZXJOb2Rlc1tpXSA9IGQzX3NlbGVjdGlvbl9kYXRhTm9kZShncm91cERhdGFbaV0pO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoO2kgPCBuOyArK2kpIHtcbiAgICAgICAgICBleGl0Tm9kZXNbaV0gPSBncm91cFtpXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZW50ZXJOb2Rlcy51cGRhdGUgPSB1cGRhdGVOb2RlcztcbiAgICAgIGVudGVyTm9kZXMucGFyZW50Tm9kZSA9IHVwZGF0ZU5vZGVzLnBhcmVudE5vZGUgPSBleGl0Tm9kZXMucGFyZW50Tm9kZSA9IGdyb3VwLnBhcmVudE5vZGU7XG4gICAgICBlbnRlci5wdXNoKGVudGVyTm9kZXMpO1xuICAgICAgdXBkYXRlLnB1c2godXBkYXRlTm9kZXMpO1xuICAgICAgZXhpdC5wdXNoKGV4aXROb2Rlcyk7XG4gICAgfVxuICAgIHZhciBlbnRlciA9IGQzX3NlbGVjdGlvbl9lbnRlcihbXSksIHVwZGF0ZSA9IGQzX3NlbGVjdGlvbihbXSksIGV4aXQgPSBkM19zZWxlY3Rpb24oW10pO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgYmluZChncm91cCA9IHRoaXNbaV0sIHZhbHVlLmNhbGwoZ3JvdXAsIGdyb3VwLnBhcmVudE5vZGUuX19kYXRhX18sIGkpKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgYmluZChncm91cCA9IHRoaXNbaV0sIHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgdXBkYXRlLmVudGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZW50ZXI7XG4gICAgfTtcbiAgICB1cGRhdGUuZXhpdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4aXQ7XG4gICAgfTtcbiAgICByZXR1cm4gdXBkYXRlO1xuICB9O1xuICBmdW5jdGlvbiBkM19zZWxlY3Rpb25fZGF0YU5vZGUoZGF0YSkge1xuICAgIHJldHVybiB7XG4gICAgICBfX2RhdGFfXzogZGF0YVxuICAgIH07XG4gIH1cbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLmRhdHVtID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IHRoaXMucHJvcGVydHkoXCJfX2RhdGFfX1wiLCB2YWx1ZSkgOiB0aGlzLnByb3BlcnR5KFwiX19kYXRhX19cIik7XG4gIH07XG4gIGQzX3NlbGVjdGlvblByb3RvdHlwZS5maWx0ZXIgPSBmdW5jdGlvbihmaWx0ZXIpIHtcbiAgICB2YXIgc3ViZ3JvdXBzID0gW10sIHN1Ymdyb3VwLCBncm91cCwgbm9kZTtcbiAgICBpZiAodHlwZW9mIGZpbHRlciAhPT0gXCJmdW5jdGlvblwiKSBmaWx0ZXIgPSBkM19zZWxlY3Rpb25fZmlsdGVyKGZpbHRlcik7XG4gICAgZm9yICh2YXIgaiA9IDAsIG0gPSB0aGlzLmxlbmd0aDsgaiA8IG07IGorKykge1xuICAgICAgc3ViZ3JvdXBzLnB1c2goc3ViZ3JvdXAgPSBbXSk7XG4gICAgICBzdWJncm91cC5wYXJlbnROb2RlID0gKGdyb3VwID0gdGhpc1tqXSkucGFyZW50Tm9kZTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiBmaWx0ZXIuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBqKSkge1xuICAgICAgICAgIHN1Ymdyb3VwLnB1c2gobm9kZSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGQzX3NlbGVjdGlvbihzdWJncm91cHMpO1xuICB9O1xuICBmdW5jdGlvbiBkM19zZWxlY3Rpb25fZmlsdGVyKHNlbGVjdG9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGQzX3NlbGVjdE1hdGNoZXModGhpcywgc2VsZWN0b3IpO1xuICAgIH07XG4gIH1cbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLm9yZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaiA9IC0xLCBtID0gdGhpcy5sZW5ndGg7ICsraiA8IG07ICkge1xuICAgICAgZm9yICh2YXIgZ3JvdXAgPSB0aGlzW2pdLCBpID0gZ3JvdXAubGVuZ3RoIC0gMSwgbmV4dCA9IGdyb3VwW2ldLCBub2RlOyAtLWkgPj0gMDsgKSB7XG4gICAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgICBpZiAobmV4dCAmJiBuZXh0ICE9PSBub2RlLm5leHRTaWJsaW5nKSBuZXh0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG5vZGUsIG5leHQpO1xuICAgICAgICAgIG5leHQgPSBub2RlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzO1xuICB9O1xuICBkM19zZWxlY3Rpb25Qcm90b3R5cGUuc29ydCA9IGZ1bmN0aW9uKGNvbXBhcmF0b3IpIHtcbiAgICBjb21wYXJhdG9yID0gZDNfc2VsZWN0aW9uX3NvcnRDb21wYXJhdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgZm9yICh2YXIgaiA9IC0xLCBtID0gdGhpcy5sZW5ndGg7ICsraiA8IG07ICkgdGhpc1tqXS5zb3J0KGNvbXBhcmF0b3IpO1xuICAgIHJldHVybiB0aGlzLm9yZGVyKCk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9zb3J0Q29tcGFyYXRvcihjb21wYXJhdG9yKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSBjb21wYXJhdG9yID0gZDNfYXNjZW5kaW5nO1xuICAgIHJldHVybiBmdW5jdGlvbihhLCBiKSB7XG4gICAgICByZXR1cm4gYSAmJiBiID8gY29tcGFyYXRvcihhLl9fZGF0YV9fLCBiLl9fZGF0YV9fKSA6ICFhIC0gIWI7XG4gICAgfTtcbiAgfVxuICBkM19zZWxlY3Rpb25Qcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGQzX3NlbGVjdGlvbl9lYWNoKHRoaXMsIGZ1bmN0aW9uKG5vZGUsIGksIGopIHtcbiAgICAgIGNhbGxiYWNrLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgaik7XG4gICAgfSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9lYWNoKGdyb3VwcywgY2FsbGJhY2spIHtcbiAgICBmb3IgKHZhciBqID0gMCwgbSA9IGdyb3Vwcy5sZW5ndGg7IGogPCBtOyBqKyspIHtcbiAgICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gMCwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZTsgaSA8IG47IGkrKykge1xuICAgICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSBjYWxsYmFjayhub2RlLCBpLCBqKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGdyb3VwcztcbiAgfVxuICBkM19zZWxlY3Rpb25Qcm90b3R5cGUuY2FsbCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIGFyZ3MgPSBkM19hcnJheShhcmd1bWVudHMpO1xuICAgIGNhbGxiYWNrLmFwcGx5KGFyZ3NbMF0gPSB0aGlzLCBhcmdzKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLmVtcHR5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICF0aGlzLm5vZGUoKTtcbiAgfTtcbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLm5vZGUgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBqID0gMCwgbSA9IHRoaXMubGVuZ3RoOyBqIDwgbTsgaisrKSB7XG4gICAgICBmb3IgKHZhciBncm91cCA9IHRoaXNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgIHZhciBub2RlID0gZ3JvdXBbaV07XG4gICAgICAgIGlmIChub2RlKSByZXR1cm4gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH07XG4gIGQzX3NlbGVjdGlvblByb3RvdHlwZS5zaXplID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG4gPSAwO1xuICAgIHRoaXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICsrbjtcbiAgICB9KTtcbiAgICByZXR1cm4gbjtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc2VsZWN0aW9uX2VudGVyKHNlbGVjdGlvbikge1xuICAgIGQzX3N1YmNsYXNzKHNlbGVjdGlvbiwgZDNfc2VsZWN0aW9uX2VudGVyUHJvdG90eXBlKTtcbiAgICByZXR1cm4gc2VsZWN0aW9uO1xuICB9XG4gIHZhciBkM19zZWxlY3Rpb25fZW50ZXJQcm90b3R5cGUgPSBbXTtcbiAgZDMuc2VsZWN0aW9uLmVudGVyID0gZDNfc2VsZWN0aW9uX2VudGVyO1xuICBkMy5zZWxlY3Rpb24uZW50ZXIucHJvdG90eXBlID0gZDNfc2VsZWN0aW9uX2VudGVyUHJvdG90eXBlO1xuICBkM19zZWxlY3Rpb25fZW50ZXJQcm90b3R5cGUuYXBwZW5kID0gZDNfc2VsZWN0aW9uUHJvdG90eXBlLmFwcGVuZDtcbiAgZDNfc2VsZWN0aW9uX2VudGVyUHJvdG90eXBlLmVtcHR5ID0gZDNfc2VsZWN0aW9uUHJvdG90eXBlLmVtcHR5O1xuICBkM19zZWxlY3Rpb25fZW50ZXJQcm90b3R5cGUubm9kZSA9IGQzX3NlbGVjdGlvblByb3RvdHlwZS5ub2RlO1xuICBkM19zZWxlY3Rpb25fZW50ZXJQcm90b3R5cGUuY2FsbCA9IGQzX3NlbGVjdGlvblByb3RvdHlwZS5jYWxsO1xuICBkM19zZWxlY3Rpb25fZW50ZXJQcm90b3R5cGUuc2l6ZSA9IGQzX3NlbGVjdGlvblByb3RvdHlwZS5zaXplO1xuICBkM19zZWxlY3Rpb25fZW50ZXJQcm90b3R5cGUuc2VsZWN0ID0gZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgICB2YXIgc3ViZ3JvdXBzID0gW10sIHN1Ymdyb3VwLCBzdWJub2RlLCB1cGdyb3VwLCBncm91cCwgbm9kZTtcbiAgICBmb3IgKHZhciBqID0gLTEsIG0gPSB0aGlzLmxlbmd0aDsgKytqIDwgbTsgKSB7XG4gICAgICB1cGdyb3VwID0gKGdyb3VwID0gdGhpc1tqXSkudXBkYXRlO1xuICAgICAgc3ViZ3JvdXBzLnB1c2goc3ViZ3JvdXAgPSBbXSk7XG4gICAgICBzdWJncm91cC5wYXJlbnROb2RlID0gZ3JvdXAucGFyZW50Tm9kZTtcbiAgICAgIGZvciAodmFyIGkgPSAtMSwgbiA9IGdyb3VwLmxlbmd0aDsgKytpIDwgbjsgKSB7XG4gICAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgICBzdWJncm91cC5wdXNoKHVwZ3JvdXBbaV0gPSBzdWJub2RlID0gc2VsZWN0b3IuY2FsbChncm91cC5wYXJlbnROb2RlLCBub2RlLl9fZGF0YV9fLCBpLCBqKSk7XG4gICAgICAgICAgc3Vibm9kZS5fX2RhdGFfXyA9IG5vZGUuX19kYXRhX187XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3ViZ3JvdXAucHVzaChudWxsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZDNfc2VsZWN0aW9uKHN1Ymdyb3Vwcyk7XG4gIH07XG4gIGQzX3NlbGVjdGlvbl9lbnRlclByb3RvdHlwZS5pbnNlcnQgPSBmdW5jdGlvbihuYW1lLCBiZWZvcmUpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIGJlZm9yZSA9IGQzX3NlbGVjdGlvbl9lbnRlckluc2VydEJlZm9yZSh0aGlzKTtcbiAgICByZXR1cm4gZDNfc2VsZWN0aW9uUHJvdG90eXBlLmluc2VydC5jYWxsKHRoaXMsIG5hbWUsIGJlZm9yZSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9lbnRlckluc2VydEJlZm9yZShlbnRlcikge1xuICAgIHZhciBpMCwgajA7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGQsIGksIGopIHtcbiAgICAgIHZhciBncm91cCA9IGVudGVyW2pdLnVwZGF0ZSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZTtcbiAgICAgIGlmIChqICE9IGowKSBqMCA9IGosIGkwID0gMDtcbiAgICAgIGlmIChpID49IGkwKSBpMCA9IGkgKyAxO1xuICAgICAgd2hpbGUgKCEobm9kZSA9IGdyb3VwW2kwXSkgJiYgKytpMCA8IG4pIDtcbiAgICAgIHJldHVybiBub2RlO1xuICAgIH07XG4gIH1cbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLnRyYW5zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaWQgPSBkM190cmFuc2l0aW9uSW5oZXJpdElkIHx8ICsrZDNfdHJhbnNpdGlvbklkLCBzdWJncm91cHMgPSBbXSwgc3ViZ3JvdXAsIG5vZGUsIHRyYW5zaXRpb24gPSBkM190cmFuc2l0aW9uSW5oZXJpdCB8fCB7XG4gICAgICB0aW1lOiBEYXRlLm5vdygpLFxuICAgICAgZWFzZTogZDNfZWFzZV9jdWJpY0luT3V0LFxuICAgICAgZGVsYXk6IDAsXG4gICAgICBkdXJhdGlvbjogMjUwXG4gICAgfTtcbiAgICBmb3IgKHZhciBqID0gLTEsIG0gPSB0aGlzLmxlbmd0aDsgKytqIDwgbTsgKSB7XG4gICAgICBzdWJncm91cHMucHVzaChzdWJncm91cCA9IFtdKTtcbiAgICAgIGZvciAodmFyIGdyb3VwID0gdGhpc1tqXSwgaSA9IC0xLCBuID0gZ3JvdXAubGVuZ3RoOyArK2kgPCBuOyApIHtcbiAgICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkgZDNfdHJhbnNpdGlvbk5vZGUobm9kZSwgaSwgaWQsIHRyYW5zaXRpb24pO1xuICAgICAgICBzdWJncm91cC5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZDNfdHJhbnNpdGlvbihzdWJncm91cHMsIGlkKTtcbiAgfTtcbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLmludGVycnVwdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmVhY2goZDNfc2VsZWN0aW9uX2ludGVycnVwdCk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9pbnRlcnJ1cHQoKSB7XG4gICAgdmFyIGxvY2sgPSB0aGlzLl9fdHJhbnNpdGlvbl9fO1xuICAgIGlmIChsb2NrKSArK2xvY2suYWN0aXZlO1xuICB9XG4gIGQzLnNlbGVjdCA9IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICB2YXIgZ3JvdXAgPSBbIHR5cGVvZiBub2RlID09PSBcInN0cmluZ1wiID8gZDNfc2VsZWN0KG5vZGUsIGQzX2RvY3VtZW50KSA6IG5vZGUgXTtcbiAgICBncm91cC5wYXJlbnROb2RlID0gZDNfZG9jdW1lbnRFbGVtZW50O1xuICAgIHJldHVybiBkM19zZWxlY3Rpb24oWyBncm91cCBdKTtcbiAgfTtcbiAgZDMuc2VsZWN0QWxsID0gZnVuY3Rpb24obm9kZXMpIHtcbiAgICB2YXIgZ3JvdXAgPSBkM19hcnJheSh0eXBlb2Ygbm9kZXMgPT09IFwic3RyaW5nXCIgPyBkM19zZWxlY3RBbGwobm9kZXMsIGQzX2RvY3VtZW50KSA6IG5vZGVzKTtcbiAgICBncm91cC5wYXJlbnROb2RlID0gZDNfZG9jdW1lbnRFbGVtZW50O1xuICAgIHJldHVybiBkM19zZWxlY3Rpb24oWyBncm91cCBdKTtcbiAgfTtcbiAgdmFyIGQzX3NlbGVjdGlvblJvb3QgPSBkMy5zZWxlY3QoZDNfZG9jdW1lbnRFbGVtZW50KTtcbiAgZDNfc2VsZWN0aW9uUHJvdG90eXBlLm9uID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpIHtcbiAgICB2YXIgbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgaWYgKG4gPCAzKSB7XG4gICAgICBpZiAodHlwZW9mIHR5cGUgIT09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgaWYgKG4gPCAyKSBsaXN0ZW5lciA9IGZhbHNlO1xuICAgICAgICBmb3IgKGNhcHR1cmUgaW4gdHlwZSkgdGhpcy5lYWNoKGQzX3NlbGVjdGlvbl9vbihjYXB0dXJlLCB0eXBlW2NhcHR1cmVdLCBsaXN0ZW5lcikpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIGlmIChuIDwgMikgcmV0dXJuIChuID0gdGhpcy5ub2RlKClbXCJfX29uXCIgKyB0eXBlXSkgJiYgbi5fO1xuICAgICAgY2FwdHVyZSA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5lYWNoKGQzX3NlbGVjdGlvbl9vbih0eXBlLCBsaXN0ZW5lciwgY2FwdHVyZSkpO1xuICB9O1xuICBmdW5jdGlvbiBkM19zZWxlY3Rpb25fb24odHlwZSwgbGlzdGVuZXIsIGNhcHR1cmUpIHtcbiAgICB2YXIgbmFtZSA9IFwiX19vblwiICsgdHlwZSwgaSA9IHR5cGUuaW5kZXhPZihcIi5cIiksIHdyYXAgPSBkM19zZWxlY3Rpb25fb25MaXN0ZW5lcjtcbiAgICBpZiAoaSA+IDApIHR5cGUgPSB0eXBlLnN1YnN0cmluZygwLCBpKTtcbiAgICB2YXIgZmlsdGVyID0gZDNfc2VsZWN0aW9uX29uRmlsdGVycy5nZXQodHlwZSk7XG4gICAgaWYgKGZpbHRlcikgdHlwZSA9IGZpbHRlciwgd3JhcCA9IGQzX3NlbGVjdGlvbl9vbkZpbHRlcjtcbiAgICBmdW5jdGlvbiBvblJlbW92ZSgpIHtcbiAgICAgIHZhciBsID0gdGhpc1tuYW1lXTtcbiAgICAgIGlmIChsKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsLCBsLiQpO1xuICAgICAgICBkZWxldGUgdGhpc1tuYW1lXTtcbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gb25BZGQoKSB7XG4gICAgICB2YXIgbCA9IHdyYXAobGlzdGVuZXIsIGQzX2FycmF5KGFyZ3VtZW50cykpO1xuICAgICAgb25SZW1vdmUuY2FsbCh0aGlzKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCB0aGlzW25hbWVdID0gbCwgbC4kID0gY2FwdHVyZSk7XG4gICAgICBsLl8gPSBsaXN0ZW5lcjtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVtb3ZlQWxsKCkge1xuICAgICAgdmFyIHJlID0gbmV3IFJlZ0V4cChcIl5fX29uKFteLl0rKVwiICsgZDMucmVxdW90ZSh0eXBlKSArIFwiJFwiKSwgbWF0Y2g7XG4gICAgICBmb3IgKHZhciBuYW1lIGluIHRoaXMpIHtcbiAgICAgICAgaWYgKG1hdGNoID0gbmFtZS5tYXRjaChyZSkpIHtcbiAgICAgICAgICB2YXIgbCA9IHRoaXNbbmFtZV07XG4gICAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG1hdGNoWzFdLCBsLCBsLiQpO1xuICAgICAgICAgIGRlbGV0ZSB0aGlzW25hbWVdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBpID8gbGlzdGVuZXIgPyBvbkFkZCA6IG9uUmVtb3ZlIDogbGlzdGVuZXIgPyBkM19ub29wIDogcmVtb3ZlQWxsO1xuICB9XG4gIHZhciBkM19zZWxlY3Rpb25fb25GaWx0ZXJzID0gZDMubWFwKHtcbiAgICBtb3VzZWVudGVyOiBcIm1vdXNlb3ZlclwiLFxuICAgIG1vdXNlbGVhdmU6IFwibW91c2VvdXRcIlxuICB9KTtcbiAgZDNfc2VsZWN0aW9uX29uRmlsdGVycy5mb3JFYWNoKGZ1bmN0aW9uKGspIHtcbiAgICBpZiAoXCJvblwiICsgayBpbiBkM19kb2N1bWVudCkgZDNfc2VsZWN0aW9uX29uRmlsdGVycy5yZW1vdmUoayk7XG4gIH0pO1xuICBmdW5jdGlvbiBkM19zZWxlY3Rpb25fb25MaXN0ZW5lcihsaXN0ZW5lciwgYXJndW1lbnR6KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGUpIHtcbiAgICAgIHZhciBvID0gZDMuZXZlbnQ7XG4gICAgICBkMy5ldmVudCA9IGU7XG4gICAgICBhcmd1bWVudHpbMF0gPSB0aGlzLl9fZGF0YV9fO1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnR6KTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGQzLmV2ZW50ID0gbztcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NlbGVjdGlvbl9vbkZpbHRlcihsaXN0ZW5lciwgYXJndW1lbnR6KSB7XG4gICAgdmFyIGwgPSBkM19zZWxlY3Rpb25fb25MaXN0ZW5lcihsaXN0ZW5lciwgYXJndW1lbnR6KTtcbiAgICByZXR1cm4gZnVuY3Rpb24oZSkge1xuICAgICAgdmFyIHRhcmdldCA9IHRoaXMsIHJlbGF0ZWQgPSBlLnJlbGF0ZWRUYXJnZXQ7XG4gICAgICBpZiAoIXJlbGF0ZWQgfHwgcmVsYXRlZCAhPT0gdGFyZ2V0ICYmICEocmVsYXRlZC5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbih0YXJnZXQpICYgOCkpIHtcbiAgICAgICAgbC5jYWxsKHRhcmdldCwgZSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICB2YXIgZDNfZXZlbnRfZHJhZ1NlbGVjdCA9IFwib25zZWxlY3RzdGFydFwiIGluIGQzX2RvY3VtZW50ID8gbnVsbCA6IGQzX3ZlbmRvclN5bWJvbChkM19kb2N1bWVudEVsZW1lbnQuc3R5bGUsIFwidXNlclNlbGVjdFwiKSwgZDNfZXZlbnRfZHJhZ0lkID0gMDtcbiAgZnVuY3Rpb24gZDNfZXZlbnRfZHJhZ1N1cHByZXNzKCkge1xuICAgIHZhciBuYW1lID0gXCIuZHJhZ3N1cHByZXNzLVwiICsgKytkM19ldmVudF9kcmFnSWQsIGNsaWNrID0gXCJjbGlja1wiICsgbmFtZSwgdyA9IGQzLnNlbGVjdChkM193aW5kb3cpLm9uKFwidG91Y2htb3ZlXCIgKyBuYW1lLCBkM19ldmVudFByZXZlbnREZWZhdWx0KS5vbihcImRyYWdzdGFydFwiICsgbmFtZSwgZDNfZXZlbnRQcmV2ZW50RGVmYXVsdCkub24oXCJzZWxlY3RzdGFydFwiICsgbmFtZSwgZDNfZXZlbnRQcmV2ZW50RGVmYXVsdCk7XG4gICAgaWYgKGQzX2V2ZW50X2RyYWdTZWxlY3QpIHtcbiAgICAgIHZhciBzdHlsZSA9IGQzX2RvY3VtZW50RWxlbWVudC5zdHlsZSwgc2VsZWN0ID0gc3R5bGVbZDNfZXZlbnRfZHJhZ1NlbGVjdF07XG4gICAgICBzdHlsZVtkM19ldmVudF9kcmFnU2VsZWN0XSA9IFwibm9uZVwiO1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24oc3VwcHJlc3NDbGljaykge1xuICAgICAgdy5vbihuYW1lLCBudWxsKTtcbiAgICAgIGlmIChkM19ldmVudF9kcmFnU2VsZWN0KSBzdHlsZVtkM19ldmVudF9kcmFnU2VsZWN0XSA9IHNlbGVjdDtcbiAgICAgIGlmIChzdXBwcmVzc0NsaWNrKSB7XG4gICAgICAgIGZ1bmN0aW9uIG9mZigpIHtcbiAgICAgICAgICB3Lm9uKGNsaWNrLCBudWxsKTtcbiAgICAgICAgfVxuICAgICAgICB3Lm9uKGNsaWNrLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBkM19ldmVudFByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgb2ZmKCk7XG4gICAgICAgIH0sIHRydWUpO1xuICAgICAgICBzZXRUaW1lb3V0KG9mZiwgMCk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICBkMy5tb3VzZSA9IGZ1bmN0aW9uKGNvbnRhaW5lcikge1xuICAgIHJldHVybiBkM19tb3VzZVBvaW50KGNvbnRhaW5lciwgZDNfZXZlbnRTb3VyY2UoKSk7XG4gIH07XG4gIHZhciBkM19tb3VzZV9idWc0NDA4MyA9IC9XZWJLaXQvLnRlc3QoZDNfd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpID8gLTEgOiAwO1xuICBmdW5jdGlvbiBkM19tb3VzZVBvaW50KGNvbnRhaW5lciwgZSkge1xuICAgIGlmIChlLmNoYW5nZWRUb3VjaGVzKSBlID0gZS5jaGFuZ2VkVG91Y2hlc1swXTtcbiAgICB2YXIgc3ZnID0gY29udGFpbmVyLm93bmVyU1ZHRWxlbWVudCB8fCBjb250YWluZXI7XG4gICAgaWYgKHN2Zy5jcmVhdGVTVkdQb2ludCkge1xuICAgICAgdmFyIHBvaW50ID0gc3ZnLmNyZWF0ZVNWR1BvaW50KCk7XG4gICAgICBpZiAoZDNfbW91c2VfYnVnNDQwODMgPCAwICYmIChkM193aW5kb3cuc2Nyb2xsWCB8fCBkM193aW5kb3cuc2Nyb2xsWSkpIHtcbiAgICAgICAgc3ZnID0gZDMuc2VsZWN0KFwiYm9keVwiKS5hcHBlbmQoXCJzdmdcIikuc3R5bGUoe1xuICAgICAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXG4gICAgICAgICAgdG9wOiAwLFxuICAgICAgICAgIGxlZnQ6IDAsXG4gICAgICAgICAgbWFyZ2luOiAwLFxuICAgICAgICAgIHBhZGRpbmc6IDAsXG4gICAgICAgICAgYm9yZGVyOiBcIm5vbmVcIlxuICAgICAgICB9LCBcImltcG9ydGFudFwiKTtcbiAgICAgICAgdmFyIGN0bSA9IHN2Z1swXVswXS5nZXRTY3JlZW5DVE0oKTtcbiAgICAgICAgZDNfbW91c2VfYnVnNDQwODMgPSAhKGN0bS5mIHx8IGN0bS5lKTtcbiAgICAgICAgc3ZnLnJlbW92ZSgpO1xuICAgICAgfVxuICAgICAgaWYgKGQzX21vdXNlX2J1ZzQ0MDgzKSBwb2ludC54ID0gZS5wYWdlWCwgcG9pbnQueSA9IGUucGFnZVk7IGVsc2UgcG9pbnQueCA9IGUuY2xpZW50WCwgXG4gICAgICBwb2ludC55ID0gZS5jbGllbnRZO1xuICAgICAgcG9pbnQgPSBwb2ludC5tYXRyaXhUcmFuc2Zvcm0oY29udGFpbmVyLmdldFNjcmVlbkNUTSgpLmludmVyc2UoKSk7XG4gICAgICByZXR1cm4gWyBwb2ludC54LCBwb2ludC55IF07XG4gICAgfVxuICAgIHZhciByZWN0ID0gY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIHJldHVybiBbIGUuY2xpZW50WCAtIHJlY3QubGVmdCAtIGNvbnRhaW5lci5jbGllbnRMZWZ0LCBlLmNsaWVudFkgLSByZWN0LnRvcCAtIGNvbnRhaW5lci5jbGllbnRUb3AgXTtcbiAgfVxuICBkMy50b3VjaGVzID0gZnVuY3Rpb24oY29udGFpbmVyLCB0b3VjaGVzKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB0b3VjaGVzID0gZDNfZXZlbnRTb3VyY2UoKS50b3VjaGVzO1xuICAgIHJldHVybiB0b3VjaGVzID8gZDNfYXJyYXkodG91Y2hlcykubWFwKGZ1bmN0aW9uKHRvdWNoKSB7XG4gICAgICB2YXIgcG9pbnQgPSBkM19tb3VzZVBvaW50KGNvbnRhaW5lciwgdG91Y2gpO1xuICAgICAgcG9pbnQuaWRlbnRpZmllciA9IHRvdWNoLmlkZW50aWZpZXI7XG4gICAgICByZXR1cm4gcG9pbnQ7XG4gICAgfSkgOiBbXTtcbiAgfTtcbiAgZDMuYmVoYXZpb3IuZHJhZyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBldmVudCA9IGQzX2V2ZW50RGlzcGF0Y2goZHJhZywgXCJkcmFnXCIsIFwiZHJhZ3N0YXJ0XCIsIFwiZHJhZ2VuZFwiKSwgb3JpZ2luID0gbnVsbCwgbW91c2Vkb3duID0gZHJhZ3N0YXJ0KGQzX25vb3AsIGQzLm1vdXNlLCBkM19iZWhhdmlvcl9kcmFnTW91c2VTdWJqZWN0LCBcIm1vdXNlbW92ZVwiLCBcIm1vdXNldXBcIiksIHRvdWNoc3RhcnQgPSBkcmFnc3RhcnQoZDNfYmVoYXZpb3JfZHJhZ1RvdWNoSWQsIGQzLnRvdWNoLCBkM19iZWhhdmlvcl9kcmFnVG91Y2hTdWJqZWN0LCBcInRvdWNobW92ZVwiLCBcInRvdWNoZW5kXCIpO1xuICAgIGZ1bmN0aW9uIGRyYWcoKSB7XG4gICAgICB0aGlzLm9uKFwibW91c2Vkb3duLmRyYWdcIiwgbW91c2Vkb3duKS5vbihcInRvdWNoc3RhcnQuZHJhZ1wiLCB0b3VjaHN0YXJ0KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZHJhZ3N0YXJ0KGlkLCBwb3NpdGlvbiwgc3ViamVjdCwgbW92ZSwgZW5kKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB0aGF0ID0gdGhpcywgdGFyZ2V0ID0gZDMuZXZlbnQudGFyZ2V0LCBwYXJlbnQgPSB0aGF0LnBhcmVudE5vZGUsIGRpc3BhdGNoID0gZXZlbnQub2YodGhhdCwgYXJndW1lbnRzKSwgZHJhZ2dlZCA9IDAsIGRyYWdJZCA9IGlkKCksIGRyYWdOYW1lID0gXCIuZHJhZ1wiICsgKGRyYWdJZCA9PSBudWxsID8gXCJcIiA6IFwiLVwiICsgZHJhZ0lkKSwgZHJhZ09mZnNldCwgZHJhZ1N1YmplY3QgPSBkMy5zZWxlY3Qoc3ViamVjdCgpKS5vbihtb3ZlICsgZHJhZ05hbWUsIG1vdmVkKS5vbihlbmQgKyBkcmFnTmFtZSwgZW5kZWQpLCBkcmFnUmVzdG9yZSA9IGQzX2V2ZW50X2RyYWdTdXBwcmVzcygpLCBwb3NpdGlvbjAgPSBwb3NpdGlvbihwYXJlbnQsIGRyYWdJZCk7XG4gICAgICAgIGlmIChvcmlnaW4pIHtcbiAgICAgICAgICBkcmFnT2Zmc2V0ID0gb3JpZ2luLmFwcGx5KHRoYXQsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgZHJhZ09mZnNldCA9IFsgZHJhZ09mZnNldC54IC0gcG9zaXRpb24wWzBdLCBkcmFnT2Zmc2V0LnkgLSBwb3NpdGlvbjBbMV0gXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkcmFnT2Zmc2V0ID0gWyAwLCAwIF07XG4gICAgICAgIH1cbiAgICAgICAgZGlzcGF0Y2goe1xuICAgICAgICAgIHR5cGU6IFwiZHJhZ3N0YXJ0XCJcbiAgICAgICAgfSk7XG4gICAgICAgIGZ1bmN0aW9uIG1vdmVkKCkge1xuICAgICAgICAgIHZhciBwb3NpdGlvbjEgPSBwb3NpdGlvbihwYXJlbnQsIGRyYWdJZCksIGR4LCBkeTtcbiAgICAgICAgICBpZiAoIXBvc2l0aW9uMSkgcmV0dXJuO1xuICAgICAgICAgIGR4ID0gcG9zaXRpb24xWzBdIC0gcG9zaXRpb24wWzBdO1xuICAgICAgICAgIGR5ID0gcG9zaXRpb24xWzFdIC0gcG9zaXRpb24wWzFdO1xuICAgICAgICAgIGRyYWdnZWQgfD0gZHggfCBkeTtcbiAgICAgICAgICBwb3NpdGlvbjAgPSBwb3NpdGlvbjE7XG4gICAgICAgICAgZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogXCJkcmFnXCIsXG4gICAgICAgICAgICB4OiBwb3NpdGlvbjFbMF0gKyBkcmFnT2Zmc2V0WzBdLFxuICAgICAgICAgICAgeTogcG9zaXRpb24xWzFdICsgZHJhZ09mZnNldFsxXSxcbiAgICAgICAgICAgIGR4OiBkeCxcbiAgICAgICAgICAgIGR5OiBkeVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIGVuZGVkKCkge1xuICAgICAgICAgIGlmICghcG9zaXRpb24ocGFyZW50LCBkcmFnSWQpKSByZXR1cm47XG4gICAgICAgICAgZHJhZ1N1YmplY3Qub24obW92ZSArIGRyYWdOYW1lLCBudWxsKS5vbihlbmQgKyBkcmFnTmFtZSwgbnVsbCk7XG4gICAgICAgICAgZHJhZ1Jlc3RvcmUoZHJhZ2dlZCAmJiBkMy5ldmVudC50YXJnZXQgPT09IHRhcmdldCk7XG4gICAgICAgICAgZGlzcGF0Y2goe1xuICAgICAgICAgICAgdHlwZTogXCJkcmFnZW5kXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9XG4gICAgZHJhZy5vcmlnaW4gPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBvcmlnaW47XG4gICAgICBvcmlnaW4gPSB4O1xuICAgICAgcmV0dXJuIGRyYWc7XG4gICAgfTtcbiAgICByZXR1cm4gZDMucmViaW5kKGRyYWcsIGV2ZW50LCBcIm9uXCIpO1xuICB9O1xuICBmdW5jdGlvbiBkM19iZWhhdmlvcl9kcmFnVG91Y2hJZCgpIHtcbiAgICByZXR1cm4gZDMuZXZlbnQuY2hhbmdlZFRvdWNoZXNbMF0uaWRlbnRpZmllcjtcbiAgfVxuICBmdW5jdGlvbiBkM19iZWhhdmlvcl9kcmFnVG91Y2hTdWJqZWN0KCkge1xuICAgIHJldHVybiBkMy5ldmVudC50YXJnZXQ7XG4gIH1cbiAgZnVuY3Rpb24gZDNfYmVoYXZpb3JfZHJhZ01vdXNlU3ViamVjdCgpIHtcbiAgICByZXR1cm4gZDNfd2luZG93O1xuICB9XG4gIHZhciDPgCA9IE1hdGguUEksIM+EID0gMiAqIM+ALCBoYWxmz4AgPSDPgCAvIDIsIM61ID0gMWUtNiwgzrUyID0gzrUgKiDOtSwgZDNfcmFkaWFucyA9IM+AIC8gMTgwLCBkM19kZWdyZWVzID0gMTgwIC8gz4A7XG4gIGZ1bmN0aW9uIGQzX3Nnbih4KSB7XG4gICAgcmV0dXJuIHggPiAwID8gMSA6IHggPCAwID8gLTEgOiAwO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2Nyb3NzMmQoYSwgYiwgYykge1xuICAgIHJldHVybiAoYlswXSAtIGFbMF0pICogKGNbMV0gLSBhWzFdKSAtIChiWzFdIC0gYVsxXSkgKiAoY1swXSAtIGFbMF0pO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2Fjb3MoeCkge1xuICAgIHJldHVybiB4ID4gMSA/IDAgOiB4IDwgLTEgPyDPgCA6IE1hdGguYWNvcyh4KTtcbiAgfVxuICBmdW5jdGlvbiBkM19hc2luKHgpIHtcbiAgICByZXR1cm4geCA+IDEgPyBoYWxmz4AgOiB4IDwgLTEgPyAtaGFsZs+AIDogTWF0aC5hc2luKHgpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NpbmgoeCkge1xuICAgIHJldHVybiAoKHggPSBNYXRoLmV4cCh4KSkgLSAxIC8geCkgLyAyO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2Nvc2goeCkge1xuICAgIHJldHVybiAoKHggPSBNYXRoLmV4cCh4KSkgKyAxIC8geCkgLyAyO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RhbmgoeCkge1xuICAgIHJldHVybiAoKHggPSBNYXRoLmV4cCgyICogeCkpIC0gMSkgLyAoeCArIDEpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2hhdmVyc2luKHgpIHtcbiAgICByZXR1cm4gKHggPSBNYXRoLnNpbih4IC8gMikpICogeDtcbiAgfVxuICB2YXIgz4EgPSBNYXRoLlNRUlQyLCDPgTIgPSAyLCDPgTQgPSA0O1xuICBkMy5pbnRlcnBvbGF0ZVpvb20gPSBmdW5jdGlvbihwMCwgcDEpIHtcbiAgICB2YXIgdXgwID0gcDBbMF0sIHV5MCA9IHAwWzFdLCB3MCA9IHAwWzJdLCB1eDEgPSBwMVswXSwgdXkxID0gcDFbMV0sIHcxID0gcDFbMl07XG4gICAgdmFyIGR4ID0gdXgxIC0gdXgwLCBkeSA9IHV5MSAtIHV5MCwgZDIgPSBkeCAqIGR4ICsgZHkgKiBkeSwgZDEgPSBNYXRoLnNxcnQoZDIpLCBiMCA9ICh3MSAqIHcxIC0gdzAgKiB3MCArIM+BNCAqIGQyKSAvICgyICogdzAgKiDPgTIgKiBkMSksIGIxID0gKHcxICogdzEgLSB3MCAqIHcwIC0gz4E0ICogZDIpIC8gKDIgKiB3MSAqIM+BMiAqIGQxKSwgcjAgPSBNYXRoLmxvZyhNYXRoLnNxcnQoYjAgKiBiMCArIDEpIC0gYjApLCByMSA9IE1hdGgubG9nKE1hdGguc3FydChiMSAqIGIxICsgMSkgLSBiMSksIGRyID0gcjEgLSByMCwgUyA9IChkciB8fCBNYXRoLmxvZyh3MSAvIHcwKSkgLyDPgTtcbiAgICBmdW5jdGlvbiBpbnRlcnBvbGF0ZSh0KSB7XG4gICAgICB2YXIgcyA9IHQgKiBTO1xuICAgICAgaWYgKGRyKSB7XG4gICAgICAgIHZhciBjb3NocjAgPSBkM19jb3NoKHIwKSwgdSA9IHcwIC8gKM+BMiAqIGQxKSAqIChjb3NocjAgKiBkM190YW5oKM+BICogcyArIHIwKSAtIGQzX3NpbmgocjApKTtcbiAgICAgICAgcmV0dXJuIFsgdXgwICsgdSAqIGR4LCB1eTAgKyB1ICogZHksIHcwICogY29zaHIwIC8gZDNfY29zaCjPgSAqIHMgKyByMCkgXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBbIHV4MCArIHQgKiBkeCwgdXkwICsgdCAqIGR5LCB3MCAqIE1hdGguZXhwKM+BICogcykgXTtcbiAgICB9XG4gICAgaW50ZXJwb2xhdGUuZHVyYXRpb24gPSBTICogMWUzO1xuICAgIHJldHVybiBpbnRlcnBvbGF0ZTtcbiAgfTtcbiAgZDMuYmVoYXZpb3Iuem9vbSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2aWV3ID0ge1xuICAgICAgeDogMCxcbiAgICAgIHk6IDAsXG4gICAgICBrOiAxXG4gICAgfSwgdHJhbnNsYXRlMCwgY2VudGVyMCwgY2VudGVyLCBzaXplID0gWyA5NjAsIDUwMCBdLCBzY2FsZUV4dGVudCA9IGQzX2JlaGF2aW9yX3pvb21JbmZpbml0eSwgbW91c2Vkb3duID0gXCJtb3VzZWRvd24uem9vbVwiLCBtb3VzZW1vdmUgPSBcIm1vdXNlbW92ZS56b29tXCIsIG1vdXNldXAgPSBcIm1vdXNldXAuem9vbVwiLCBtb3VzZXdoZWVsVGltZXIsIHRvdWNoc3RhcnQgPSBcInRvdWNoc3RhcnQuem9vbVwiLCB0b3VjaHRpbWUsIGV2ZW50ID0gZDNfZXZlbnREaXNwYXRjaCh6b29tLCBcInpvb21zdGFydFwiLCBcInpvb21cIiwgXCJ6b29tZW5kXCIpLCB4MCwgeDEsIHkwLCB5MTtcbiAgICBmdW5jdGlvbiB6b29tKGcpIHtcbiAgICAgIGcub24obW91c2Vkb3duLCBtb3VzZWRvd25lZCkub24oZDNfYmVoYXZpb3Jfem9vbVdoZWVsICsgXCIuem9vbVwiLCBtb3VzZXdoZWVsZWQpLm9uKFwiZGJsY2xpY2suem9vbVwiLCBkYmxjbGlja2VkKS5vbih0b3VjaHN0YXJ0LCB0b3VjaHN0YXJ0ZWQpO1xuICAgIH1cbiAgICB6b29tLmV2ZW50ID0gZnVuY3Rpb24oZykge1xuICAgICAgZy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZGlzcGF0Y2ggPSBldmVudC5vZih0aGlzLCBhcmd1bWVudHMpLCB2aWV3MSA9IHZpZXc7XG4gICAgICAgIGlmIChkM190cmFuc2l0aW9uSW5oZXJpdElkKSB7XG4gICAgICAgICAgZDMuc2VsZWN0KHRoaXMpLnRyYW5zaXRpb24oKS5lYWNoKFwic3RhcnQuem9vbVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZpZXcgPSB0aGlzLl9fY2hhcnRfXyB8fCB7XG4gICAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICAgIGs6IDFcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB6b29tc3RhcnRlZChkaXNwYXRjaCk7XG4gICAgICAgICAgfSkudHdlZW4oXCJ6b29tOnpvb21cIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZHggPSBzaXplWzBdLCBkeSA9IHNpemVbMV0sIGN4ID0gZHggLyAyLCBjeSA9IGR5IC8gMiwgaSA9IGQzLmludGVycG9sYXRlWm9vbShbIChjeCAtIHZpZXcueCkgLyB2aWV3LmssIChjeSAtIHZpZXcueSkgLyB2aWV3LmssIGR4IC8gdmlldy5rIF0sIFsgKGN4IC0gdmlldzEueCkgLyB2aWV3MS5rLCAoY3kgLSB2aWV3MS55KSAvIHZpZXcxLmssIGR4IC8gdmlldzEuayBdKTtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICAgICAgICAgIHZhciBsID0gaSh0KSwgayA9IGR4IC8gbFsyXTtcbiAgICAgICAgICAgICAgdGhpcy5fX2NoYXJ0X18gPSB2aWV3ID0ge1xuICAgICAgICAgICAgICAgIHg6IGN4IC0gbFswXSAqIGssXG4gICAgICAgICAgICAgICAgeTogY3kgLSBsWzFdICogayxcbiAgICAgICAgICAgICAgICBrOiBrXG4gICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgIHpvb21lZChkaXNwYXRjaCk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH0pLmVhY2goXCJlbmQuem9vbVwiLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHpvb21lbmRlZChkaXNwYXRjaCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fX2NoYXJ0X18gPSB2aWV3O1xuICAgICAgICAgIHpvb21zdGFydGVkKGRpc3BhdGNoKTtcbiAgICAgICAgICB6b29tZWQoZGlzcGF0Y2gpO1xuICAgICAgICAgIHpvb21lbmRlZChkaXNwYXRjaCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH07XG4gICAgem9vbS50cmFuc2xhdGUgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBbIHZpZXcueCwgdmlldy55IF07XG4gICAgICB2aWV3ID0ge1xuICAgICAgICB4OiArX1swXSxcbiAgICAgICAgeTogK19bMV0sXG4gICAgICAgIGs6IHZpZXcua1xuICAgICAgfTtcbiAgICAgIHJlc2NhbGUoKTtcbiAgICAgIHJldHVybiB6b29tO1xuICAgIH07XG4gICAgem9vbS5zY2FsZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHZpZXcuaztcbiAgICAgIHZpZXcgPSB7XG4gICAgICAgIHg6IHZpZXcueCxcbiAgICAgICAgeTogdmlldy55LFxuICAgICAgICBrOiArX1xuICAgICAgfTtcbiAgICAgIHJlc2NhbGUoKTtcbiAgICAgIHJldHVybiB6b29tO1xuICAgIH07XG4gICAgem9vbS5zY2FsZUV4dGVudCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNjYWxlRXh0ZW50O1xuICAgICAgc2NhbGVFeHRlbnQgPSBfID09IG51bGwgPyBkM19iZWhhdmlvcl96b29tSW5maW5pdHkgOiBbICtfWzBdLCArX1sxXSBdO1xuICAgICAgcmV0dXJuIHpvb207XG4gICAgfTtcbiAgICB6b29tLmNlbnRlciA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGNlbnRlcjtcbiAgICAgIGNlbnRlciA9IF8gJiYgWyArX1swXSwgK19bMV0gXTtcbiAgICAgIHJldHVybiB6b29tO1xuICAgIH07XG4gICAgem9vbS5zaXplID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc2l6ZTtcbiAgICAgIHNpemUgPSBfICYmIFsgK19bMF0sICtfWzFdIF07XG4gICAgICByZXR1cm4gem9vbTtcbiAgICB9O1xuICAgIHpvb20ueCA9IGZ1bmN0aW9uKHopIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHgxO1xuICAgICAgeDEgPSB6O1xuICAgICAgeDAgPSB6LmNvcHkoKTtcbiAgICAgIHZpZXcgPSB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDAsXG4gICAgICAgIGs6IDFcbiAgICAgIH07XG4gICAgICByZXR1cm4gem9vbTtcbiAgICB9O1xuICAgIHpvb20ueSA9IGZ1bmN0aW9uKHopIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHkxO1xuICAgICAgeTEgPSB6O1xuICAgICAgeTAgPSB6LmNvcHkoKTtcbiAgICAgIHZpZXcgPSB7XG4gICAgICAgIHg6IDAsXG4gICAgICAgIHk6IDAsXG4gICAgICAgIGs6IDFcbiAgICAgIH07XG4gICAgICByZXR1cm4gem9vbTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGxvY2F0aW9uKHApIHtcbiAgICAgIHJldHVybiBbIChwWzBdIC0gdmlldy54KSAvIHZpZXcuaywgKHBbMV0gLSB2aWV3LnkpIC8gdmlldy5rIF07XG4gICAgfVxuICAgIGZ1bmN0aW9uIHBvaW50KGwpIHtcbiAgICAgIHJldHVybiBbIGxbMF0gKiB2aWV3LmsgKyB2aWV3LngsIGxbMV0gKiB2aWV3LmsgKyB2aWV3LnkgXTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2NhbGVUbyhzKSB7XG4gICAgICB2aWV3LmsgPSBNYXRoLm1heChzY2FsZUV4dGVudFswXSwgTWF0aC5taW4oc2NhbGVFeHRlbnRbMV0sIHMpKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdHJhbnNsYXRlVG8ocCwgbCkge1xuICAgICAgbCA9IHBvaW50KGwpO1xuICAgICAgdmlldy54ICs9IHBbMF0gLSBsWzBdO1xuICAgICAgdmlldy55ICs9IHBbMV0gLSBsWzFdO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZXNjYWxlKCkge1xuICAgICAgaWYgKHgxKSB4MS5kb21haW4oeDAucmFuZ2UoKS5tYXAoZnVuY3Rpb24oeCkge1xuICAgICAgICByZXR1cm4gKHggLSB2aWV3LngpIC8gdmlldy5rO1xuICAgICAgfSkubWFwKHgwLmludmVydCkpO1xuICAgICAgaWYgKHkxKSB5MS5kb21haW4oeTAucmFuZ2UoKS5tYXAoZnVuY3Rpb24oeSkge1xuICAgICAgICByZXR1cm4gKHkgLSB2aWV3LnkpIC8gdmlldy5rO1xuICAgICAgfSkubWFwKHkwLmludmVydCkpO1xuICAgIH1cbiAgICBmdW5jdGlvbiB6b29tc3RhcnRlZChkaXNwYXRjaCkge1xuICAgICAgZGlzcGF0Y2goe1xuICAgICAgICB0eXBlOiBcInpvb21zdGFydFwiXG4gICAgICB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gem9vbWVkKGRpc3BhdGNoKSB7XG4gICAgICByZXNjYWxlKCk7XG4gICAgICBkaXNwYXRjaCh7XG4gICAgICAgIHR5cGU6IFwiem9vbVwiLFxuICAgICAgICBzY2FsZTogdmlldy5rLFxuICAgICAgICB0cmFuc2xhdGU6IFsgdmlldy54LCB2aWV3LnkgXVxuICAgICAgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHpvb21lbmRlZChkaXNwYXRjaCkge1xuICAgICAgZGlzcGF0Y2goe1xuICAgICAgICB0eXBlOiBcInpvb21lbmRcIlxuICAgICAgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG1vdXNlZG93bmVkKCkge1xuICAgICAgdmFyIHRoYXQgPSB0aGlzLCB0YXJnZXQgPSBkMy5ldmVudC50YXJnZXQsIGRpc3BhdGNoID0gZXZlbnQub2YodGhhdCwgYXJndW1lbnRzKSwgZHJhZ2dlZCA9IDAsIHN1YmplY3QgPSBkMy5zZWxlY3QoZDNfd2luZG93KS5vbihtb3VzZW1vdmUsIG1vdmVkKS5vbihtb3VzZXVwLCBlbmRlZCksIGxvY2F0aW9uMCA9IGxvY2F0aW9uKGQzLm1vdXNlKHRoYXQpKSwgZHJhZ1Jlc3RvcmUgPSBkM19ldmVudF9kcmFnU3VwcHJlc3MoKTtcbiAgICAgIGQzX3NlbGVjdGlvbl9pbnRlcnJ1cHQuY2FsbCh0aGF0KTtcbiAgICAgIHpvb21zdGFydGVkKGRpc3BhdGNoKTtcbiAgICAgIGZ1bmN0aW9uIG1vdmVkKCkge1xuICAgICAgICBkcmFnZ2VkID0gMTtcbiAgICAgICAgdHJhbnNsYXRlVG8oZDMubW91c2UodGhhdCksIGxvY2F0aW9uMCk7XG4gICAgICAgIHpvb21lZChkaXNwYXRjaCk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBlbmRlZCgpIHtcbiAgICAgICAgc3ViamVjdC5vbihtb3VzZW1vdmUsIG51bGwpLm9uKG1vdXNldXAsIG51bGwpO1xuICAgICAgICBkcmFnUmVzdG9yZShkcmFnZ2VkICYmIGQzLmV2ZW50LnRhcmdldCA9PT0gdGFyZ2V0KTtcbiAgICAgICAgem9vbWVuZGVkKGRpc3BhdGNoKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gdG91Y2hzdGFydGVkKCkge1xuICAgICAgdmFyIHRoYXQgPSB0aGlzLCBkaXNwYXRjaCA9IGV2ZW50Lm9mKHRoYXQsIGFyZ3VtZW50cyksIGxvY2F0aW9uczAgPSB7fSwgZGlzdGFuY2UwID0gMCwgc2NhbGUwLCB6b29tTmFtZSA9IFwiLnpvb20tXCIgKyBkMy5ldmVudC5jaGFuZ2VkVG91Y2hlc1swXS5pZGVudGlmaWVyLCB0b3VjaG1vdmUgPSBcInRvdWNobW92ZVwiICsgem9vbU5hbWUsIHRvdWNoZW5kID0gXCJ0b3VjaGVuZFwiICsgem9vbU5hbWUsIHRhcmdldHMgPSBbXSwgc3ViamVjdCA9IGQzLnNlbGVjdCh0aGF0KS5vbihtb3VzZWRvd24sIG51bGwpLm9uKHRvdWNoc3RhcnQsIHN0YXJ0ZWQpLCBkcmFnUmVzdG9yZSA9IGQzX2V2ZW50X2RyYWdTdXBwcmVzcygpO1xuICAgICAgZDNfc2VsZWN0aW9uX2ludGVycnVwdC5jYWxsKHRoYXQpO1xuICAgICAgc3RhcnRlZCgpO1xuICAgICAgem9vbXN0YXJ0ZWQoZGlzcGF0Y2gpO1xuICAgICAgZnVuY3Rpb24gcmVsb2NhdGUoKSB7XG4gICAgICAgIHZhciB0b3VjaGVzID0gZDMudG91Y2hlcyh0aGF0KTtcbiAgICAgICAgc2NhbGUwID0gdmlldy5rO1xuICAgICAgICB0b3VjaGVzLmZvckVhY2goZnVuY3Rpb24odCkge1xuICAgICAgICAgIGlmICh0LmlkZW50aWZpZXIgaW4gbG9jYXRpb25zMCkgbG9jYXRpb25zMFt0LmlkZW50aWZpZXJdID0gbG9jYXRpb24odCk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdG91Y2hlcztcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHN0YXJ0ZWQoKSB7XG4gICAgICAgIHZhciB0YXJnZXQgPSBkMy5ldmVudC50YXJnZXQ7XG4gICAgICAgIGQzLnNlbGVjdCh0YXJnZXQpLm9uKHRvdWNobW92ZSwgbW92ZWQpLm9uKHRvdWNoZW5kLCBlbmRlZCk7XG4gICAgICAgIHRhcmdldHMucHVzaCh0YXJnZXQpO1xuICAgICAgICB2YXIgY2hhbmdlZCA9IGQzLmV2ZW50LmNoYW5nZWRUb3VjaGVzO1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbiA9IGNoYW5nZWQubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICAgICAgbG9jYXRpb25zMFtjaGFuZ2VkW2ldLmlkZW50aWZpZXJdID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgdG91Y2hlcyA9IHJlbG9jYXRlKCksIG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIGlmICh0b3VjaGVzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgIGlmIChub3cgLSB0b3VjaHRpbWUgPCA1MDApIHtcbiAgICAgICAgICAgIHZhciBwID0gdG91Y2hlc1swXSwgbCA9IGxvY2F0aW9uczBbcC5pZGVudGlmaWVyXTtcbiAgICAgICAgICAgIHNjYWxlVG8odmlldy5rICogMik7XG4gICAgICAgICAgICB0cmFuc2xhdGVUbyhwLCBsKTtcbiAgICAgICAgICAgIGQzX2V2ZW50UHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHpvb21lZChkaXNwYXRjaCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRvdWNodGltZSA9IG5vdztcbiAgICAgICAgfSBlbHNlIGlmICh0b3VjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICB2YXIgcCA9IHRvdWNoZXNbMF0sIHEgPSB0b3VjaGVzWzFdLCBkeCA9IHBbMF0gLSBxWzBdLCBkeSA9IHBbMV0gLSBxWzFdO1xuICAgICAgICAgIGRpc3RhbmNlMCA9IGR4ICogZHggKyBkeSAqIGR5O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBtb3ZlZCgpIHtcbiAgICAgICAgdmFyIHRvdWNoZXMgPSBkMy50b3VjaGVzKHRoYXQpLCBwMCwgbDAsIHAxLCBsMTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSB0b3VjaGVzLmxlbmd0aDsgaSA8IG47ICsraSwgbDEgPSBudWxsKSB7XG4gICAgICAgICAgcDEgPSB0b3VjaGVzW2ldO1xuICAgICAgICAgIGlmIChsMSA9IGxvY2F0aW9uczBbcDEuaWRlbnRpZmllcl0pIHtcbiAgICAgICAgICAgIGlmIChsMCkgYnJlYWs7XG4gICAgICAgICAgICBwMCA9IHAxLCBsMCA9IGwxO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAobDEpIHtcbiAgICAgICAgICB2YXIgZGlzdGFuY2UxID0gKGRpc3RhbmNlMSA9IHAxWzBdIC0gcDBbMF0pICogZGlzdGFuY2UxICsgKGRpc3RhbmNlMSA9IHAxWzFdIC0gcDBbMV0pICogZGlzdGFuY2UxLCBzY2FsZTEgPSBkaXN0YW5jZTAgJiYgTWF0aC5zcXJ0KGRpc3RhbmNlMSAvIGRpc3RhbmNlMCk7XG4gICAgICAgICAgcDAgPSBbIChwMFswXSArIHAxWzBdKSAvIDIsIChwMFsxXSArIHAxWzFdKSAvIDIgXTtcbiAgICAgICAgICBsMCA9IFsgKGwwWzBdICsgbDFbMF0pIC8gMiwgKGwwWzFdICsgbDFbMV0pIC8gMiBdO1xuICAgICAgICAgIHNjYWxlVG8oc2NhbGUxICogc2NhbGUwKTtcbiAgICAgICAgfVxuICAgICAgICB0b3VjaHRpbWUgPSBudWxsO1xuICAgICAgICB0cmFuc2xhdGVUbyhwMCwgbDApO1xuICAgICAgICB6b29tZWQoZGlzcGF0Y2gpO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gZW5kZWQoKSB7XG4gICAgICAgIGlmIChkMy5ldmVudC50b3VjaGVzLmxlbmd0aCkge1xuICAgICAgICAgIHZhciBjaGFuZ2VkID0gZDMuZXZlbnQuY2hhbmdlZFRvdWNoZXM7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBjaGFuZ2VkLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgICAgICAgZGVsZXRlIGxvY2F0aW9uczBbY2hhbmdlZFtpXS5pZGVudGlmaWVyXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yICh2YXIgaWRlbnRpZmllciBpbiBsb2NhdGlvbnMwKSB7XG4gICAgICAgICAgICByZXR1cm4gdm9pZCByZWxvY2F0ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBkMy5zZWxlY3RBbGwodGFyZ2V0cykub24oem9vbU5hbWUsIG51bGwpO1xuICAgICAgICBzdWJqZWN0Lm9uKG1vdXNlZG93biwgbW91c2Vkb3duZWQpLm9uKHRvdWNoc3RhcnQsIHRvdWNoc3RhcnRlZCk7XG4gICAgICAgIGRyYWdSZXN0b3JlKCk7XG4gICAgICAgIHpvb21lbmRlZChkaXNwYXRjaCk7XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIG1vdXNld2hlZWxlZCgpIHtcbiAgICAgIHZhciBkaXNwYXRjaCA9IGV2ZW50Lm9mKHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICBpZiAobW91c2V3aGVlbFRpbWVyKSBjbGVhclRpbWVvdXQobW91c2V3aGVlbFRpbWVyKTsgZWxzZSB0cmFuc2xhdGUwID0gbG9jYXRpb24oY2VudGVyMCA9IGNlbnRlciB8fCBkMy5tb3VzZSh0aGlzKSksIFxuICAgICAgZDNfc2VsZWN0aW9uX2ludGVycnVwdC5jYWxsKHRoaXMpLCB6b29tc3RhcnRlZChkaXNwYXRjaCk7XG4gICAgICBtb3VzZXdoZWVsVGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBtb3VzZXdoZWVsVGltZXIgPSBudWxsO1xuICAgICAgICB6b29tZW5kZWQoZGlzcGF0Y2gpO1xuICAgICAgfSwgNTApO1xuICAgICAgZDNfZXZlbnRQcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgc2NhbGVUbyhNYXRoLnBvdygyLCBkM19iZWhhdmlvcl96b29tRGVsdGEoKSAqIC4wMDIpICogdmlldy5rKTtcbiAgICAgIHRyYW5zbGF0ZVRvKGNlbnRlcjAsIHRyYW5zbGF0ZTApO1xuICAgICAgem9vbWVkKGRpc3BhdGNoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZGJsY2xpY2tlZCgpIHtcbiAgICAgIHZhciBkaXNwYXRjaCA9IGV2ZW50Lm9mKHRoaXMsIGFyZ3VtZW50cyksIHAgPSBkMy5tb3VzZSh0aGlzKSwgbCA9IGxvY2F0aW9uKHApLCBrID0gTWF0aC5sb2codmlldy5rKSAvIE1hdGguTE4yO1xuICAgICAgem9vbXN0YXJ0ZWQoZGlzcGF0Y2gpO1xuICAgICAgc2NhbGVUbyhNYXRoLnBvdygyLCBkMy5ldmVudC5zaGlmdEtleSA/IE1hdGguY2VpbChrKSAtIDEgOiBNYXRoLmZsb29yKGspICsgMSkpO1xuICAgICAgdHJhbnNsYXRlVG8ocCwgbCk7XG4gICAgICB6b29tZWQoZGlzcGF0Y2gpO1xuICAgICAgem9vbWVuZGVkKGRpc3BhdGNoKTtcbiAgICB9XG4gICAgcmV0dXJuIGQzLnJlYmluZCh6b29tLCBldmVudCwgXCJvblwiKTtcbiAgfTtcbiAgdmFyIGQzX2JlaGF2aW9yX3pvb21JbmZpbml0eSA9IFsgMCwgSW5maW5pdHkgXTtcbiAgdmFyIGQzX2JlaGF2aW9yX3pvb21EZWx0YSwgZDNfYmVoYXZpb3Jfem9vbVdoZWVsID0gXCJvbndoZWVsXCIgaW4gZDNfZG9jdW1lbnQgPyAoZDNfYmVoYXZpb3Jfem9vbURlbHRhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIC1kMy5ldmVudC5kZWx0YVkgKiAoZDMuZXZlbnQuZGVsdGFNb2RlID8gMTIwIDogMSk7XG4gIH0sIFwid2hlZWxcIikgOiBcIm9ubW91c2V3aGVlbFwiIGluIGQzX2RvY3VtZW50ID8gKGQzX2JlaGF2aW9yX3pvb21EZWx0YSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkMy5ldmVudC53aGVlbERlbHRhO1xuICB9LCBcIm1vdXNld2hlZWxcIikgOiAoZDNfYmVoYXZpb3Jfem9vbURlbHRhID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIC1kMy5ldmVudC5kZXRhaWw7XG4gIH0sIFwiTW96TW91c2VQaXhlbFNjcm9sbFwiKTtcbiAgZDMuY29sb3IgPSBkM19jb2xvcjtcbiAgZnVuY3Rpb24gZDNfY29sb3IoKSB7fVxuICBkM19jb2xvci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZ2IoKSArIFwiXCI7XG4gIH07XG4gIGQzLmhzbCA9IGQzX2hzbDtcbiAgZnVuY3Rpb24gZDNfaHNsKGgsIHMsIGwpIHtcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIGQzX2hzbCA/IHZvaWQgKHRoaXMuaCA9ICtoLCB0aGlzLnMgPSArcywgdGhpcy5sID0gK2wpIDogYXJndW1lbnRzLmxlbmd0aCA8IDIgPyBoIGluc3RhbmNlb2YgZDNfaHNsID8gbmV3IGQzX2hzbChoLmgsIGgucywgaC5sKSA6IGQzX3JnYl9wYXJzZShcIlwiICsgaCwgZDNfcmdiX2hzbCwgZDNfaHNsKSA6IG5ldyBkM19oc2woaCwgcywgbCk7XG4gIH1cbiAgdmFyIGQzX2hzbFByb3RvdHlwZSA9IGQzX2hzbC5wcm90b3R5cGUgPSBuZXcgZDNfY29sb3IoKTtcbiAgZDNfaHNsUHJvdG90eXBlLmJyaWdodGVyID0gZnVuY3Rpb24oaykge1xuICAgIGsgPSBNYXRoLnBvdyguNywgYXJndW1lbnRzLmxlbmd0aCA/IGsgOiAxKTtcbiAgICByZXR1cm4gbmV3IGQzX2hzbCh0aGlzLmgsIHRoaXMucywgdGhpcy5sIC8gayk7XG4gIH07XG4gIGQzX2hzbFByb3RvdHlwZS5kYXJrZXIgPSBmdW5jdGlvbihrKSB7XG4gICAgayA9IE1hdGgucG93KC43LCBhcmd1bWVudHMubGVuZ3RoID8gayA6IDEpO1xuICAgIHJldHVybiBuZXcgZDNfaHNsKHRoaXMuaCwgdGhpcy5zLCBrICogdGhpcy5sKTtcbiAgfTtcbiAgZDNfaHNsUHJvdG90eXBlLnJnYiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM19oc2xfcmdiKHRoaXMuaCwgdGhpcy5zLCB0aGlzLmwpO1xuICB9O1xuICBmdW5jdGlvbiBkM19oc2xfcmdiKGgsIHMsIGwpIHtcbiAgICB2YXIgbTEsIG0yO1xuICAgIGggPSBpc05hTihoKSA/IDAgOiAoaCAlPSAzNjApIDwgMCA/IGggKyAzNjAgOiBoO1xuICAgIHMgPSBpc05hTihzKSA/IDAgOiBzIDwgMCA/IDAgOiBzID4gMSA/IDEgOiBzO1xuICAgIGwgPSBsIDwgMCA/IDAgOiBsID4gMSA/IDEgOiBsO1xuICAgIG0yID0gbCA8PSAuNSA/IGwgKiAoMSArIHMpIDogbCArIHMgLSBsICogcztcbiAgICBtMSA9IDIgKiBsIC0gbTI7XG4gICAgZnVuY3Rpb24gdihoKSB7XG4gICAgICBpZiAoaCA+IDM2MCkgaCAtPSAzNjA7IGVsc2UgaWYgKGggPCAwKSBoICs9IDM2MDtcbiAgICAgIGlmIChoIDwgNjApIHJldHVybiBtMSArIChtMiAtIG0xKSAqIGggLyA2MDtcbiAgICAgIGlmIChoIDwgMTgwKSByZXR1cm4gbTI7XG4gICAgICBpZiAoaCA8IDI0MCkgcmV0dXJuIG0xICsgKG0yIC0gbTEpICogKDI0MCAtIGgpIC8gNjA7XG4gICAgICByZXR1cm4gbTE7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHZ2KGgpIHtcbiAgICAgIHJldHVybiBNYXRoLnJvdW5kKHYoaCkgKiAyNTUpO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IGQzX3JnYih2dihoICsgMTIwKSwgdnYoaCksIHZ2KGggLSAxMjApKTtcbiAgfVxuICBkMy5oY2wgPSBkM19oY2w7XG4gIGZ1bmN0aW9uIGQzX2hjbChoLCBjLCBsKSB7XG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBkM19oY2wgPyB2b2lkICh0aGlzLmggPSAraCwgdGhpcy5jID0gK2MsIHRoaXMubCA9ICtsKSA6IGFyZ3VtZW50cy5sZW5ndGggPCAyID8gaCBpbnN0YW5jZW9mIGQzX2hjbCA/IG5ldyBkM19oY2woaC5oLCBoLmMsIGgubCkgOiBoIGluc3RhbmNlb2YgZDNfbGFiID8gZDNfbGFiX2hjbChoLmwsIGguYSwgaC5iKSA6IGQzX2xhYl9oY2woKGggPSBkM19yZ2JfbGFiKChoID0gZDMucmdiKGgpKS5yLCBoLmcsIGguYikpLmwsIGguYSwgaC5iKSA6IG5ldyBkM19oY2woaCwgYywgbCk7XG4gIH1cbiAgdmFyIGQzX2hjbFByb3RvdHlwZSA9IGQzX2hjbC5wcm90b3R5cGUgPSBuZXcgZDNfY29sb3IoKTtcbiAgZDNfaGNsUHJvdG90eXBlLmJyaWdodGVyID0gZnVuY3Rpb24oaykge1xuICAgIHJldHVybiBuZXcgZDNfaGNsKHRoaXMuaCwgdGhpcy5jLCBNYXRoLm1pbigxMDAsIHRoaXMubCArIGQzX2xhYl9LICogKGFyZ3VtZW50cy5sZW5ndGggPyBrIDogMSkpKTtcbiAgfTtcbiAgZDNfaGNsUHJvdG90eXBlLmRhcmtlciA9IGZ1bmN0aW9uKGspIHtcbiAgICByZXR1cm4gbmV3IGQzX2hjbCh0aGlzLmgsIHRoaXMuYywgTWF0aC5tYXgoMCwgdGhpcy5sIC0gZDNfbGFiX0sgKiAoYXJndW1lbnRzLmxlbmd0aCA/IGsgOiAxKSkpO1xuICB9O1xuICBkM19oY2xQcm90b3R5cGUucmdiID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX2hjbF9sYWIodGhpcy5oLCB0aGlzLmMsIHRoaXMubCkucmdiKCk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2hjbF9sYWIoaCwgYywgbCkge1xuICAgIGlmIChpc05hTihoKSkgaCA9IDA7XG4gICAgaWYgKGlzTmFOKGMpKSBjID0gMDtcbiAgICByZXR1cm4gbmV3IGQzX2xhYihsLCBNYXRoLmNvcyhoICo9IGQzX3JhZGlhbnMpICogYywgTWF0aC5zaW4oaCkgKiBjKTtcbiAgfVxuICBkMy5sYWIgPSBkM19sYWI7XG4gIGZ1bmN0aW9uIGQzX2xhYihsLCBhLCBiKSB7XG4gICAgcmV0dXJuIHRoaXMgaW5zdGFuY2VvZiBkM19sYWIgPyB2b2lkICh0aGlzLmwgPSArbCwgdGhpcy5hID0gK2EsIHRoaXMuYiA9ICtiKSA6IGFyZ3VtZW50cy5sZW5ndGggPCAyID8gbCBpbnN0YW5jZW9mIGQzX2xhYiA/IG5ldyBkM19sYWIobC5sLCBsLmEsIGwuYikgOiBsIGluc3RhbmNlb2YgZDNfaGNsID8gZDNfaGNsX2xhYihsLmwsIGwuYywgbC5oKSA6IGQzX3JnYl9sYWIoKGwgPSBkM19yZ2IobCkpLnIsIGwuZywgbC5iKSA6IG5ldyBkM19sYWIobCwgYSwgYik7XG4gIH1cbiAgdmFyIGQzX2xhYl9LID0gMTg7XG4gIHZhciBkM19sYWJfWCA9IC45NTA0NywgZDNfbGFiX1kgPSAxLCBkM19sYWJfWiA9IDEuMDg4ODM7XG4gIHZhciBkM19sYWJQcm90b3R5cGUgPSBkM19sYWIucHJvdG90eXBlID0gbmV3IGQzX2NvbG9yKCk7XG4gIGQzX2xhYlByb3RvdHlwZS5icmlnaHRlciA9IGZ1bmN0aW9uKGspIHtcbiAgICByZXR1cm4gbmV3IGQzX2xhYihNYXRoLm1pbigxMDAsIHRoaXMubCArIGQzX2xhYl9LICogKGFyZ3VtZW50cy5sZW5ndGggPyBrIDogMSkpLCB0aGlzLmEsIHRoaXMuYik7XG4gIH07XG4gIGQzX2xhYlByb3RvdHlwZS5kYXJrZXIgPSBmdW5jdGlvbihrKSB7XG4gICAgcmV0dXJuIG5ldyBkM19sYWIoTWF0aC5tYXgoMCwgdGhpcy5sIC0gZDNfbGFiX0sgKiAoYXJndW1lbnRzLmxlbmd0aCA/IGsgOiAxKSksIHRoaXMuYSwgdGhpcy5iKTtcbiAgfTtcbiAgZDNfbGFiUHJvdG90eXBlLnJnYiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM19sYWJfcmdiKHRoaXMubCwgdGhpcy5hLCB0aGlzLmIpO1xuICB9O1xuICBmdW5jdGlvbiBkM19sYWJfcmdiKGwsIGEsIGIpIHtcbiAgICB2YXIgeSA9IChsICsgMTYpIC8gMTE2LCB4ID0geSArIGEgLyA1MDAsIHogPSB5IC0gYiAvIDIwMDtcbiAgICB4ID0gZDNfbGFiX3h5eih4KSAqIGQzX2xhYl9YO1xuICAgIHkgPSBkM19sYWJfeHl6KHkpICogZDNfbGFiX1k7XG4gICAgeiA9IGQzX2xhYl94eXooeikgKiBkM19sYWJfWjtcbiAgICByZXR1cm4gbmV3IGQzX3JnYihkM194eXpfcmdiKDMuMjQwNDU0MiAqIHggLSAxLjUzNzEzODUgKiB5IC0gLjQ5ODUzMTQgKiB6KSwgZDNfeHl6X3JnYigtLjk2OTI2NiAqIHggKyAxLjg3NjAxMDggKiB5ICsgLjA0MTU1NiAqIHopLCBkM194eXpfcmdiKC4wNTU2NDM0ICogeCAtIC4yMDQwMjU5ICogeSArIDEuMDU3MjI1MiAqIHopKTtcbiAgfVxuICBmdW5jdGlvbiBkM19sYWJfaGNsKGwsIGEsIGIpIHtcbiAgICByZXR1cm4gbCA+IDAgPyBuZXcgZDNfaGNsKE1hdGguYXRhbjIoYiwgYSkgKiBkM19kZWdyZWVzLCBNYXRoLnNxcnQoYSAqIGEgKyBiICogYiksIGwpIDogbmV3IGQzX2hjbChOYU4sIE5hTiwgbCk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGFiX3h5eih4KSB7XG4gICAgcmV0dXJuIHggPiAuMjA2ODkzMDM0ID8geCAqIHggKiB4IDogKHggLSA0IC8gMjkpIC8gNy43ODcwMzc7XG4gIH1cbiAgZnVuY3Rpb24gZDNfeHl6X2xhYih4KSB7XG4gICAgcmV0dXJuIHggPiAuMDA4ODU2ID8gTWF0aC5wb3coeCwgMSAvIDMpIDogNy43ODcwMzcgKiB4ICsgNCAvIDI5O1xuICB9XG4gIGZ1bmN0aW9uIGQzX3h5el9yZ2Iocikge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKDI1NSAqIChyIDw9IC4wMDMwNCA/IDEyLjkyICogciA6IDEuMDU1ICogTWF0aC5wb3cociwgMSAvIDIuNCkgLSAuMDU1KSk7XG4gIH1cbiAgZDMucmdiID0gZDNfcmdiO1xuICBmdW5jdGlvbiBkM19yZ2IociwgZywgYikge1xuICAgIHJldHVybiB0aGlzIGluc3RhbmNlb2YgZDNfcmdiID8gdm9pZCAodGhpcy5yID0gfn5yLCB0aGlzLmcgPSB+fmcsIHRoaXMuYiA9IH5+YikgOiBhcmd1bWVudHMubGVuZ3RoIDwgMiA/IHIgaW5zdGFuY2VvZiBkM19yZ2IgPyBuZXcgZDNfcmdiKHIuciwgci5nLCByLmIpIDogZDNfcmdiX3BhcnNlKFwiXCIgKyByLCBkM19yZ2IsIGQzX2hzbF9yZ2IpIDogbmV3IGQzX3JnYihyLCBnLCBiKTtcbiAgfVxuICBmdW5jdGlvbiBkM19yZ2JOdW1iZXIodmFsdWUpIHtcbiAgICByZXR1cm4gbmV3IGQzX3JnYih2YWx1ZSA+PiAxNiwgdmFsdWUgPj4gOCAmIDI1NSwgdmFsdWUgJiAyNTUpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3JnYlN0cmluZyh2YWx1ZSkge1xuICAgIHJldHVybiBkM19yZ2JOdW1iZXIodmFsdWUpICsgXCJcIjtcbiAgfVxuICB2YXIgZDNfcmdiUHJvdG90eXBlID0gZDNfcmdiLnByb3RvdHlwZSA9IG5ldyBkM19jb2xvcigpO1xuICBkM19yZ2JQcm90b3R5cGUuYnJpZ2h0ZXIgPSBmdW5jdGlvbihrKSB7XG4gICAgayA9IE1hdGgucG93KC43LCBhcmd1bWVudHMubGVuZ3RoID8gayA6IDEpO1xuICAgIHZhciByID0gdGhpcy5yLCBnID0gdGhpcy5nLCBiID0gdGhpcy5iLCBpID0gMzA7XG4gICAgaWYgKCFyICYmICFnICYmICFiKSByZXR1cm4gbmV3IGQzX3JnYihpLCBpLCBpKTtcbiAgICBpZiAociAmJiByIDwgaSkgciA9IGk7XG4gICAgaWYgKGcgJiYgZyA8IGkpIGcgPSBpO1xuICAgIGlmIChiICYmIGIgPCBpKSBiID0gaTtcbiAgICByZXR1cm4gbmV3IGQzX3JnYihNYXRoLm1pbigyNTUsIHIgLyBrKSwgTWF0aC5taW4oMjU1LCBnIC8gayksIE1hdGgubWluKDI1NSwgYiAvIGspKTtcbiAgfTtcbiAgZDNfcmdiUHJvdG90eXBlLmRhcmtlciA9IGZ1bmN0aW9uKGspIHtcbiAgICBrID0gTWF0aC5wb3coLjcsIGFyZ3VtZW50cy5sZW5ndGggPyBrIDogMSk7XG4gICAgcmV0dXJuIG5ldyBkM19yZ2IoayAqIHRoaXMuciwgayAqIHRoaXMuZywgayAqIHRoaXMuYik7XG4gIH07XG4gIGQzX3JnYlByb3RvdHlwZS5oc2wgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfcmdiX2hzbCh0aGlzLnIsIHRoaXMuZywgdGhpcy5iKTtcbiAgfTtcbiAgZDNfcmdiUHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiI1wiICsgZDNfcmdiX2hleCh0aGlzLnIpICsgZDNfcmdiX2hleCh0aGlzLmcpICsgZDNfcmdiX2hleCh0aGlzLmIpO1xuICB9O1xuICBmdW5jdGlvbiBkM19yZ2JfaGV4KHYpIHtcbiAgICByZXR1cm4gdiA8IDE2ID8gXCIwXCIgKyBNYXRoLm1heCgwLCB2KS50b1N0cmluZygxNikgOiBNYXRoLm1pbigyNTUsIHYpLnRvU3RyaW5nKDE2KTtcbiAgfVxuICBmdW5jdGlvbiBkM19yZ2JfcGFyc2UoZm9ybWF0LCByZ2IsIGhzbCkge1xuICAgIHZhciByID0gMCwgZyA9IDAsIGIgPSAwLCBtMSwgbTIsIGNvbG9yO1xuICAgIG0xID0gLyhbYS16XSspXFwoKC4qKVxcKS9pLmV4ZWMoZm9ybWF0KTtcbiAgICBpZiAobTEpIHtcbiAgICAgIG0yID0gbTFbMl0uc3BsaXQoXCIsXCIpO1xuICAgICAgc3dpdGNoIChtMVsxXSkge1xuICAgICAgIGNhc2UgXCJoc2xcIjpcbiAgICAgICAge1xuICAgICAgICAgIHJldHVybiBoc2wocGFyc2VGbG9hdChtMlswXSksIHBhcnNlRmxvYXQobTJbMV0pIC8gMTAwLCBwYXJzZUZsb2F0KG0yWzJdKSAvIDEwMCk7XG4gICAgICAgIH1cblxuICAgICAgIGNhc2UgXCJyZ2JcIjpcbiAgICAgICAge1xuICAgICAgICAgIHJldHVybiByZ2IoZDNfcmdiX3BhcnNlTnVtYmVyKG0yWzBdKSwgZDNfcmdiX3BhcnNlTnVtYmVyKG0yWzFdKSwgZDNfcmdiX3BhcnNlTnVtYmVyKG0yWzJdKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNvbG9yID0gZDNfcmdiX25hbWVzLmdldChmb3JtYXQpKSByZXR1cm4gcmdiKGNvbG9yLnIsIGNvbG9yLmcsIGNvbG9yLmIpO1xuICAgIGlmIChmb3JtYXQgIT0gbnVsbCAmJiBmb3JtYXQuY2hhckF0KDApID09PSBcIiNcIiAmJiAhaXNOYU4oY29sb3IgPSBwYXJzZUludChmb3JtYXQuc3Vic3RyaW5nKDEpLCAxNikpKSB7XG4gICAgICBpZiAoZm9ybWF0Lmxlbmd0aCA9PT0gNCkge1xuICAgICAgICByID0gKGNvbG9yICYgMzg0MCkgPj4gNDtcbiAgICAgICAgciA9IHIgPj4gNCB8IHI7XG4gICAgICAgIGcgPSBjb2xvciAmIDI0MDtcbiAgICAgICAgZyA9IGcgPj4gNCB8IGc7XG4gICAgICAgIGIgPSBjb2xvciAmIDE1O1xuICAgICAgICBiID0gYiA8PCA0IHwgYjtcbiAgICAgIH0gZWxzZSBpZiAoZm9ybWF0Lmxlbmd0aCA9PT0gNykge1xuICAgICAgICByID0gKGNvbG9yICYgMTY3MTE2ODApID4+IDE2O1xuICAgICAgICBnID0gKGNvbG9yICYgNjUyODApID4+IDg7XG4gICAgICAgIGIgPSBjb2xvciAmIDI1NTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJnYihyLCBnLCBiKTtcbiAgfVxuICBmdW5jdGlvbiBkM19yZ2JfaHNsKHIsIGcsIGIpIHtcbiAgICB2YXIgbWluID0gTWF0aC5taW4ociAvPSAyNTUsIGcgLz0gMjU1LCBiIC89IDI1NSksIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLCBkID0gbWF4IC0gbWluLCBoLCBzLCBsID0gKG1heCArIG1pbikgLyAyO1xuICAgIGlmIChkKSB7XG4gICAgICBzID0gbCA8IC41ID8gZCAvIChtYXggKyBtaW4pIDogZCAvICgyIC0gbWF4IC0gbWluKTtcbiAgICAgIGlmIChyID09IG1heCkgaCA9IChnIC0gYikgLyBkICsgKGcgPCBiID8gNiA6IDApOyBlbHNlIGlmIChnID09IG1heCkgaCA9IChiIC0gcikgLyBkICsgMjsgZWxzZSBoID0gKHIgLSBnKSAvIGQgKyA0O1xuICAgICAgaCAqPSA2MDtcbiAgICB9IGVsc2Uge1xuICAgICAgaCA9IE5hTjtcbiAgICAgIHMgPSBsID4gMCAmJiBsIDwgMSA/IDAgOiBoO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IGQzX2hzbChoLCBzLCBsKTtcbiAgfVxuICBmdW5jdGlvbiBkM19yZ2JfbGFiKHIsIGcsIGIpIHtcbiAgICByID0gZDNfcmdiX3h5eihyKTtcbiAgICBnID0gZDNfcmdiX3h5eihnKTtcbiAgICBiID0gZDNfcmdiX3h5eihiKTtcbiAgICB2YXIgeCA9IGQzX3h5el9sYWIoKC40MTI0NTY0ICogciArIC4zNTc1NzYxICogZyArIC4xODA0Mzc1ICogYikgLyBkM19sYWJfWCksIHkgPSBkM194eXpfbGFiKCguMjEyNjcyOSAqIHIgKyAuNzE1MTUyMiAqIGcgKyAuMDcyMTc1ICogYikgLyBkM19sYWJfWSksIHogPSBkM194eXpfbGFiKCguMDE5MzMzOSAqIHIgKyAuMTE5MTkyICogZyArIC45NTAzMDQxICogYikgLyBkM19sYWJfWik7XG4gICAgcmV0dXJuIGQzX2xhYigxMTYgKiB5IC0gMTYsIDUwMCAqICh4IC0geSksIDIwMCAqICh5IC0geikpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3JnYl94eXoocikge1xuICAgIHJldHVybiAociAvPSAyNTUpIDw9IC4wNDA0NSA/IHIgLyAxMi45MiA6IE1hdGgucG93KChyICsgLjA1NSkgLyAxLjA1NSwgMi40KTtcbiAgfVxuICBmdW5jdGlvbiBkM19yZ2JfcGFyc2VOdW1iZXIoYykge1xuICAgIHZhciBmID0gcGFyc2VGbG9hdChjKTtcbiAgICByZXR1cm4gYy5jaGFyQXQoYy5sZW5ndGggLSAxKSA9PT0gXCIlXCIgPyBNYXRoLnJvdW5kKGYgKiAyLjU1KSA6IGY7XG4gIH1cbiAgdmFyIGQzX3JnYl9uYW1lcyA9IGQzLm1hcCh7XG4gICAgYWxpY2VibHVlOiAxNTc5MjM4MyxcbiAgICBhbnRpcXVld2hpdGU6IDE2NDQ0Mzc1LFxuICAgIGFxdWE6IDY1NTM1LFxuICAgIGFxdWFtYXJpbmU6IDgzODg1NjQsXG4gICAgYXp1cmU6IDE1Nzk0MTc1LFxuICAgIGJlaWdlOiAxNjExOTI2MCxcbiAgICBiaXNxdWU6IDE2NzcwMjQ0LFxuICAgIGJsYWNrOiAwLFxuICAgIGJsYW5jaGVkYWxtb25kOiAxNjc3MjA0NSxcbiAgICBibHVlOiAyNTUsXG4gICAgYmx1ZXZpb2xldDogOTA1NTIwMixcbiAgICBicm93bjogMTA4MjQyMzQsXG4gICAgYnVybHl3b29kOiAxNDU5NjIzMSxcbiAgICBjYWRldGJsdWU6IDYyNjY1MjgsXG4gICAgY2hhcnRyZXVzZTogODM4ODM1MixcbiAgICBjaG9jb2xhdGU6IDEzNzg5NDcwLFxuICAgIGNvcmFsOiAxNjc0NDI3MixcbiAgICBjb3JuZmxvd2VyYmx1ZTogNjU5MTk4MSxcbiAgICBjb3Juc2lsazogMTY3NzUzODgsXG4gICAgY3JpbXNvbjogMTQ0MjMxMDAsXG4gICAgY3lhbjogNjU1MzUsXG4gICAgZGFya2JsdWU6IDEzOSxcbiAgICBkYXJrY3lhbjogMzU3MjMsXG4gICAgZGFya2dvbGRlbnJvZDogMTIwOTI5MzksXG4gICAgZGFya2dyYXk6IDExMTE5MDE3LFxuICAgIGRhcmtncmVlbjogMjU2MDAsXG4gICAgZGFya2dyZXk6IDExMTE5MDE3LFxuICAgIGRhcmtraGFraTogMTI0MzMyNTksXG4gICAgZGFya21hZ2VudGE6IDkxMDk2NDMsXG4gICAgZGFya29saXZlZ3JlZW46IDU1OTc5OTksXG4gICAgZGFya29yYW5nZTogMTY3NDc1MjAsXG4gICAgZGFya29yY2hpZDogMTAwNDAwMTIsXG4gICAgZGFya3JlZDogOTEwOTUwNCxcbiAgICBkYXJrc2FsbW9uOiAxNTMwODQxMCxcbiAgICBkYXJrc2VhZ3JlZW46IDk0MTk5MTksXG4gICAgZGFya3NsYXRlYmx1ZTogNDczNDM0NyxcbiAgICBkYXJrc2xhdGVncmF5OiAzMTAwNDk1LFxuICAgIGRhcmtzbGF0ZWdyZXk6IDMxMDA0OTUsXG4gICAgZGFya3R1cnF1b2lzZTogNTI5NDUsXG4gICAgZGFya3Zpb2xldDogOTY5OTUzOSxcbiAgICBkZWVwcGluazogMTY3MTY5NDcsXG4gICAgZGVlcHNreWJsdWU6IDQ5MTUxLFxuICAgIGRpbWdyYXk6IDY5MDgyNjUsXG4gICAgZGltZ3JleTogNjkwODI2NSxcbiAgICBkb2RnZXJibHVlOiAyMDAzMTk5LFxuICAgIGZpcmVicmljazogMTE2NzQxNDYsXG4gICAgZmxvcmFsd2hpdGU6IDE2Nzc1OTIwLFxuICAgIGZvcmVzdGdyZWVuOiAyMjYzODQyLFxuICAgIGZ1Y2hzaWE6IDE2NzExOTM1LFxuICAgIGdhaW5zYm9ybzogMTQ0NzQ0NjAsXG4gICAgZ2hvc3R3aGl0ZTogMTYzMTY2NzEsXG4gICAgZ29sZDogMTY3NjY3MjAsXG4gICAgZ29sZGVucm9kOiAxNDMyOTEyMCxcbiAgICBncmF5OiA4NDIxNTA0LFxuICAgIGdyZWVuOiAzMjc2OCxcbiAgICBncmVlbnllbGxvdzogMTE0MDMwNTUsXG4gICAgZ3JleTogODQyMTUwNCxcbiAgICBob25leWRldzogMTU3OTQxNjAsXG4gICAgaG90cGluazogMTY3Mzg3NDAsXG4gICAgaW5kaWFucmVkOiAxMzQ1ODUyNCxcbiAgICBpbmRpZ286IDQ5MTUzMzAsXG4gICAgaXZvcnk6IDE2Nzc3MjAwLFxuICAgIGtoYWtpOiAxNTc4NzY2MCxcbiAgICBsYXZlbmRlcjogMTUxMzI0MTAsXG4gICAgbGF2ZW5kZXJibHVzaDogMTY3NzMzNjUsXG4gICAgbGF3bmdyZWVuOiA4MTkwOTc2LFxuICAgIGxlbW9uY2hpZmZvbjogMTY3NzU4ODUsXG4gICAgbGlnaHRibHVlOiAxMTM5MzI1NCxcbiAgICBsaWdodGNvcmFsOiAxNTc2MTUzNixcbiAgICBsaWdodGN5YW46IDE0NzQ1NTk5LFxuICAgIGxpZ2h0Z29sZGVucm9keWVsbG93OiAxNjQ0ODIxMCxcbiAgICBsaWdodGdyYXk6IDEzODgyMzIzLFxuICAgIGxpZ2h0Z3JlZW46IDk0OTgyNTYsXG4gICAgbGlnaHRncmV5OiAxMzg4MjMyMyxcbiAgICBsaWdodHBpbms6IDE2NzU4NDY1LFxuICAgIGxpZ2h0c2FsbW9uOiAxNjc1Mjc2MixcbiAgICBsaWdodHNlYWdyZWVuOiAyMTQyODkwLFxuICAgIGxpZ2h0c2t5Ymx1ZTogODkwMDM0NixcbiAgICBsaWdodHNsYXRlZ3JheTogNzgzMzc1MyxcbiAgICBsaWdodHNsYXRlZ3JleTogNzgzMzc1MyxcbiAgICBsaWdodHN0ZWVsYmx1ZTogMTE1ODQ3MzQsXG4gICAgbGlnaHR5ZWxsb3c6IDE2Nzc3MTg0LFxuICAgIGxpbWU6IDY1MjgwLFxuICAgIGxpbWVncmVlbjogMzMyOTMzMCxcbiAgICBsaW5lbjogMTY0NDU2NzAsXG4gICAgbWFnZW50YTogMTY3MTE5MzUsXG4gICAgbWFyb29uOiA4Mzg4NjA4LFxuICAgIG1lZGl1bWFxdWFtYXJpbmU6IDY3MzczMjIsXG4gICAgbWVkaXVtYmx1ZTogMjA1LFxuICAgIG1lZGl1bW9yY2hpZDogMTIyMTE2NjcsXG4gICAgbWVkaXVtcHVycGxlOiA5NjYyNjgzLFxuICAgIG1lZGl1bXNlYWdyZWVuOiAzOTc4MDk3LFxuICAgIG1lZGl1bXNsYXRlYmx1ZTogODA4Nzc5MCxcbiAgICBtZWRpdW1zcHJpbmdncmVlbjogNjQxNTQsXG4gICAgbWVkaXVtdHVycXVvaXNlOiA0NzcyMzAwLFxuICAgIG1lZGl1bXZpb2xldHJlZDogMTMwNDcxNzMsXG4gICAgbWlkbmlnaHRibHVlOiAxNjQ0OTEyLFxuICAgIG1pbnRjcmVhbTogMTYxMjE4NTAsXG4gICAgbWlzdHlyb3NlOiAxNjc3MDI3MyxcbiAgICBtb2NjYXNpbjogMTY3NzAyMjksXG4gICAgbmF2YWpvd2hpdGU6IDE2NzY4Njg1LFxuICAgIG5hdnk6IDEyOCxcbiAgICBvbGRsYWNlOiAxNjY0MzU1OCxcbiAgICBvbGl2ZTogODQyMTM3NixcbiAgICBvbGl2ZWRyYWI6IDcwNDg3MzksXG4gICAgb3JhbmdlOiAxNjc1MzkyMCxcbiAgICBvcmFuZ2VyZWQ6IDE2NzI5MzQ0LFxuICAgIG9yY2hpZDogMTQzMTU3MzQsXG4gICAgcGFsZWdvbGRlbnJvZDogMTU2NTcxMzAsXG4gICAgcGFsZWdyZWVuOiAxMDAyNTg4MCxcbiAgICBwYWxldHVycXVvaXNlOiAxMTUyOTk2NixcbiAgICBwYWxldmlvbGV0cmVkOiAxNDM4MTIwMyxcbiAgICBwYXBheWF3aGlwOiAxNjc3MzA3NyxcbiAgICBwZWFjaHB1ZmY6IDE2NzY3NjczLFxuICAgIHBlcnU6IDEzNDY4OTkxLFxuICAgIHBpbms6IDE2NzYxMDM1LFxuICAgIHBsdW06IDE0NTI0NjM3LFxuICAgIHBvd2RlcmJsdWU6IDExNTkxOTEwLFxuICAgIHB1cnBsZTogODM4ODczNixcbiAgICByZWQ6IDE2NzExNjgwLFxuICAgIHJvc3licm93bjogMTIzNTc1MTksXG4gICAgcm95YWxibHVlOiA0Mjg2OTQ1LFxuICAgIHNhZGRsZWJyb3duOiA5MTI3MTg3LFxuICAgIHNhbG1vbjogMTY0MTY4ODIsXG4gICAgc2FuZHlicm93bjogMTYwMzI4NjQsXG4gICAgc2VhZ3JlZW46IDMwNTAzMjcsXG4gICAgc2Vhc2hlbGw6IDE2Nzc0NjM4LFxuICAgIHNpZW5uYTogMTA1MDY3OTcsXG4gICAgc2lsdmVyOiAxMjYzMjI1NixcbiAgICBza3libHVlOiA4OTAwMzMxLFxuICAgIHNsYXRlYmx1ZTogNjk3MDA2MSxcbiAgICBzbGF0ZWdyYXk6IDczNzI5NDQsXG4gICAgc2xhdGVncmV5OiA3MzcyOTQ0LFxuICAgIHNub3c6IDE2Nzc1OTMwLFxuICAgIHNwcmluZ2dyZWVuOiA2NTQwNyxcbiAgICBzdGVlbGJsdWU6IDQ2MjA5ODAsXG4gICAgdGFuOiAxMzgwODc4MCxcbiAgICB0ZWFsOiAzMjg5NixcbiAgICB0aGlzdGxlOiAxNDIwNDg4OCxcbiAgICB0b21hdG86IDE2NzM3MDk1LFxuICAgIHR1cnF1b2lzZTogNDI1MTg1NixcbiAgICB2aW9sZXQ6IDE1NjMxMDg2LFxuICAgIHdoZWF0OiAxNjExMzMzMSxcbiAgICB3aGl0ZTogMTY3NzcyMTUsXG4gICAgd2hpdGVzbW9rZTogMTYxMTkyODUsXG4gICAgeWVsbG93OiAxNjc3Njk2MCxcbiAgICB5ZWxsb3dncmVlbjogMTAxNDUwNzRcbiAgfSk7XG4gIGQzX3JnYl9uYW1lcy5mb3JFYWNoKGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICBkM19yZ2JfbmFtZXMuc2V0KGtleSwgZDNfcmdiTnVtYmVyKHZhbHVlKSk7XG4gIH0pO1xuICBmdW5jdGlvbiBkM19mdW5jdG9yKHYpIHtcbiAgICByZXR1cm4gdHlwZW9mIHYgPT09IFwiZnVuY3Rpb25cIiA/IHYgOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB2O1xuICAgIH07XG4gIH1cbiAgZDMuZnVuY3RvciA9IGQzX2Z1bmN0b3I7XG4gIGZ1bmN0aW9uIGQzX2lkZW50aXR5KGQpIHtcbiAgICByZXR1cm4gZDtcbiAgfVxuICBkMy54aHIgPSBkM194aHJUeXBlKGQzX2lkZW50aXR5KTtcbiAgZnVuY3Rpb24gZDNfeGhyVHlwZShyZXNwb25zZSkge1xuICAgIHJldHVybiBmdW5jdGlvbih1cmwsIG1pbWVUeXBlLCBjYWxsYmFjaykge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDIgJiYgdHlwZW9mIG1pbWVUeXBlID09PSBcImZ1bmN0aW9uXCIpIGNhbGxiYWNrID0gbWltZVR5cGUsIFxuICAgICAgbWltZVR5cGUgPSBudWxsO1xuICAgICAgcmV0dXJuIGQzX3hocih1cmwsIG1pbWVUeXBlLCByZXNwb25zZSwgY2FsbGJhY2spO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfeGhyKHVybCwgbWltZVR5cGUsIHJlc3BvbnNlLCBjYWxsYmFjaykge1xuICAgIHZhciB4aHIgPSB7fSwgZGlzcGF0Y2ggPSBkMy5kaXNwYXRjaChcImJlZm9yZXNlbmRcIiwgXCJwcm9ncmVzc1wiLCBcImxvYWRcIiwgXCJlcnJvclwiKSwgaGVhZGVycyA9IHt9LCByZXF1ZXN0ID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksIHJlc3BvbnNlVHlwZSA9IG51bGw7XG4gICAgaWYgKGQzX3dpbmRvdy5YRG9tYWluUmVxdWVzdCAmJiAhKFwid2l0aENyZWRlbnRpYWxzXCIgaW4gcmVxdWVzdCkgJiYgL14oaHR0cChzKT86KT9cXC9cXC8vLnRlc3QodXJsKSkgcmVxdWVzdCA9IG5ldyBYRG9tYWluUmVxdWVzdCgpO1xuICAgIFwib25sb2FkXCIgaW4gcmVxdWVzdCA/IHJlcXVlc3Qub25sb2FkID0gcmVxdWVzdC5vbmVycm9yID0gcmVzcG9uZCA6IHJlcXVlc3Qub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXF1ZXN0LnJlYWR5U3RhdGUgPiAzICYmIHJlc3BvbmQoKTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIHJlc3BvbmQoKSB7XG4gICAgICB2YXIgc3RhdHVzID0gcmVxdWVzdC5zdGF0dXMsIHJlc3VsdDtcbiAgICAgIGlmICghc3RhdHVzICYmIHJlcXVlc3QucmVzcG9uc2VUZXh0IHx8IHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwIHx8IHN0YXR1cyA9PT0gMzA0KSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzdWx0ID0gcmVzcG9uc2UuY2FsbCh4aHIsIHJlcXVlc3QpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgZGlzcGF0Y2guZXJyb3IuY2FsbCh4aHIsIGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBkaXNwYXRjaC5sb2FkLmNhbGwoeGhyLCByZXN1bHQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgZGlzcGF0Y2guZXJyb3IuY2FsbCh4aHIsIHJlcXVlc3QpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXF1ZXN0Lm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgdmFyIG8gPSBkMy5ldmVudDtcbiAgICAgIGQzLmV2ZW50ID0gZXZlbnQ7XG4gICAgICB0cnkge1xuICAgICAgICBkaXNwYXRjaC5wcm9ncmVzcy5jYWxsKHhociwgcmVxdWVzdCk7XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICBkMy5ldmVudCA9IG87XG4gICAgICB9XG4gICAgfTtcbiAgICB4aHIuaGVhZGVyID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICAgIG5hbWUgPSAobmFtZSArIFwiXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHJldHVybiBoZWFkZXJzW25hbWVdO1xuICAgICAgaWYgKHZhbHVlID09IG51bGwpIGRlbGV0ZSBoZWFkZXJzW25hbWVdOyBlbHNlIGhlYWRlcnNbbmFtZV0gPSB2YWx1ZSArIFwiXCI7XG4gICAgICByZXR1cm4geGhyO1xuICAgIH07XG4gICAgeGhyLm1pbWVUeXBlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG1pbWVUeXBlO1xuICAgICAgbWltZVR5cGUgPSB2YWx1ZSA9PSBudWxsID8gbnVsbCA6IHZhbHVlICsgXCJcIjtcbiAgICAgIHJldHVybiB4aHI7XG4gICAgfTtcbiAgICB4aHIucmVzcG9uc2VUeXBlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHJlc3BvbnNlVHlwZTtcbiAgICAgIHJlc3BvbnNlVHlwZSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHhocjtcbiAgICB9O1xuICAgIHhoci5yZXNwb25zZSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXNwb25zZSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHhocjtcbiAgICB9O1xuICAgIFsgXCJnZXRcIiwgXCJwb3N0XCIgXS5mb3JFYWNoKGZ1bmN0aW9uKG1ldGhvZCkge1xuICAgICAgeGhyW21ldGhvZF0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHhoci5zZW5kLmFwcGx5KHhociwgWyBtZXRob2QgXS5jb25jYXQoZDNfYXJyYXkoYXJndW1lbnRzKSkpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgICB4aHIuc2VuZCA9IGZ1bmN0aW9uKG1ldGhvZCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAyICYmIHR5cGVvZiBkYXRhID09PSBcImZ1bmN0aW9uXCIpIGNhbGxiYWNrID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gICAgICByZXF1ZXN0Lm9wZW4obWV0aG9kLCB1cmwsIHRydWUpO1xuICAgICAgaWYgKG1pbWVUeXBlICE9IG51bGwgJiYgIShcImFjY2VwdFwiIGluIGhlYWRlcnMpKSBoZWFkZXJzW1wiYWNjZXB0XCJdID0gbWltZVR5cGUgKyBcIiwqLypcIjtcbiAgICAgIGlmIChyZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIpIGZvciAodmFyIG5hbWUgaW4gaGVhZGVycykgcmVxdWVzdC5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIGhlYWRlcnNbbmFtZV0pO1xuICAgICAgaWYgKG1pbWVUeXBlICE9IG51bGwgJiYgcmVxdWVzdC5vdmVycmlkZU1pbWVUeXBlKSByZXF1ZXN0Lm92ZXJyaWRlTWltZVR5cGUobWltZVR5cGUpO1xuICAgICAgaWYgKHJlc3BvbnNlVHlwZSAhPSBudWxsKSByZXF1ZXN0LnJlc3BvbnNlVHlwZSA9IHJlc3BvbnNlVHlwZTtcbiAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsKSB4aHIub24oXCJlcnJvclwiLCBjYWxsYmFjaykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKHJlcXVlc3QpIHtcbiAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVxdWVzdCk7XG4gICAgICB9KTtcbiAgICAgIGRpc3BhdGNoLmJlZm9yZXNlbmQuY2FsbCh4aHIsIHJlcXVlc3QpO1xuICAgICAgcmVxdWVzdC5zZW5kKGRhdGEgPT0gbnVsbCA/IG51bGwgOiBkYXRhKTtcbiAgICAgIHJldHVybiB4aHI7XG4gICAgfTtcbiAgICB4aHIuYWJvcnQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJlcXVlc3QuYWJvcnQoKTtcbiAgICAgIHJldHVybiB4aHI7XG4gICAgfTtcbiAgICBkMy5yZWJpbmQoeGhyLCBkaXNwYXRjaCwgXCJvblwiKTtcbiAgICByZXR1cm4gY2FsbGJhY2sgPT0gbnVsbCA/IHhociA6IHhoci5nZXQoZDNfeGhyX2ZpeENhbGxiYWNrKGNhbGxiYWNrKSk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfeGhyX2ZpeENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGNhbGxiYWNrLmxlbmd0aCA9PT0gMSA/IGZ1bmN0aW9uKGVycm9yLCByZXF1ZXN0KSB7XG4gICAgICBjYWxsYmFjayhlcnJvciA9PSBudWxsID8gcmVxdWVzdCA6IG51bGwpO1xuICAgIH0gOiBjYWxsYmFjaztcbiAgfVxuICBkMy5kc3YgPSBmdW5jdGlvbihkZWxpbWl0ZXIsIG1pbWVUeXBlKSB7XG4gICAgdmFyIHJlRm9ybWF0ID0gbmV3IFJlZ0V4cCgnW1wiJyArIGRlbGltaXRlciArIFwiXFxuXVwiKSwgZGVsaW1pdGVyQ29kZSA9IGRlbGltaXRlci5jaGFyQ29kZUF0KDApO1xuICAgIGZ1bmN0aW9uIGRzdih1cmwsIHJvdywgY2FsbGJhY2spIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykgY2FsbGJhY2sgPSByb3csIHJvdyA9IG51bGw7XG4gICAgICB2YXIgeGhyID0gZDNfeGhyKHVybCwgbWltZVR5cGUsIHJvdyA9PSBudWxsID8gcmVzcG9uc2UgOiB0eXBlZFJlc3BvbnNlKHJvdyksIGNhbGxiYWNrKTtcbiAgICAgIHhoci5yb3cgPSBmdW5jdGlvbihfKSB7XG4gICAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8geGhyLnJlc3BvbnNlKChyb3cgPSBfKSA9PSBudWxsID8gcmVzcG9uc2UgOiB0eXBlZFJlc3BvbnNlKF8pKSA6IHJvdztcbiAgICAgIH07XG4gICAgICByZXR1cm4geGhyO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZXNwb25zZShyZXF1ZXN0KSB7XG4gICAgICByZXR1cm4gZHN2LnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gdHlwZWRSZXNwb25zZShmKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24ocmVxdWVzdCkge1xuICAgICAgICByZXR1cm4gZHN2LnBhcnNlKHJlcXVlc3QucmVzcG9uc2VUZXh0LCBmKTtcbiAgICAgIH07XG4gICAgfVxuICAgIGRzdi5wYXJzZSA9IGZ1bmN0aW9uKHRleHQsIGYpIHtcbiAgICAgIHZhciBvO1xuICAgICAgcmV0dXJuIGRzdi5wYXJzZVJvd3ModGV4dCwgZnVuY3Rpb24ocm93LCBpKSB7XG4gICAgICAgIGlmIChvKSByZXR1cm4gbyhyb3csIGkgLSAxKTtcbiAgICAgICAgdmFyIGEgPSBuZXcgRnVuY3Rpb24oXCJkXCIsIFwicmV0dXJuIHtcIiArIHJvdy5tYXAoZnVuY3Rpb24obmFtZSwgaSkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShuYW1lKSArIFwiOiBkW1wiICsgaSArIFwiXVwiO1xuICAgICAgICB9KS5qb2luKFwiLFwiKSArIFwifVwiKTtcbiAgICAgICAgbyA9IGYgPyBmdW5jdGlvbihyb3csIGkpIHtcbiAgICAgICAgICByZXR1cm4gZihhKHJvdyksIGkpO1xuICAgICAgICB9IDogYTtcbiAgICAgIH0pO1xuICAgIH07XG4gICAgZHN2LnBhcnNlUm93cyA9IGZ1bmN0aW9uKHRleHQsIGYpIHtcbiAgICAgIHZhciBFT0wgPSB7fSwgRU9GID0ge30sIHJvd3MgPSBbXSwgTiA9IHRleHQubGVuZ3RoLCBJID0gMCwgbiA9IDAsIHQsIGVvbDtcbiAgICAgIGZ1bmN0aW9uIHRva2VuKCkge1xuICAgICAgICBpZiAoSSA+PSBOKSByZXR1cm4gRU9GO1xuICAgICAgICBpZiAoZW9sKSByZXR1cm4gZW9sID0gZmFsc2UsIEVPTDtcbiAgICAgICAgdmFyIGogPSBJO1xuICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGopID09PSAzNCkge1xuICAgICAgICAgIHZhciBpID0gajtcbiAgICAgICAgICB3aGlsZSAoaSsrIDwgTikge1xuICAgICAgICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChpKSA9PT0gMzQpIHtcbiAgICAgICAgICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChpICsgMSkgIT09IDM0KSBicmVhaztcbiAgICAgICAgICAgICAgKytpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBJID0gaSArIDI7XG4gICAgICAgICAgdmFyIGMgPSB0ZXh0LmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgICAgIGlmIChjID09PSAxMykge1xuICAgICAgICAgICAgZW9sID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSArIDIpID09PSAxMCkgKytJO1xuICAgICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gMTApIHtcbiAgICAgICAgICAgIGVvbCA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0ZXh0LnN1YnN0cmluZyhqICsgMSwgaSkucmVwbGFjZSgvXCJcIi9nLCAnXCInKTtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAoSSA8IE4pIHtcbiAgICAgICAgICB2YXIgYyA9IHRleHQuY2hhckNvZGVBdChJKyspLCBrID0gMTtcbiAgICAgICAgICBpZiAoYyA9PT0gMTApIGVvbCA9IHRydWU7IGVsc2UgaWYgKGMgPT09IDEzKSB7XG4gICAgICAgICAgICBlb2wgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChJKSA9PT0gMTApICsrSSwgKytrO1xuICAgICAgICAgIH0gZWxzZSBpZiAoYyAhPT0gZGVsaW1pdGVyQ29kZSkgY29udGludWU7XG4gICAgICAgICAgcmV0dXJuIHRleHQuc3Vic3RyaW5nKGosIEkgLSBrKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGV4dC5zdWJzdHJpbmcoaik7XG4gICAgICB9XG4gICAgICB3aGlsZSAoKHQgPSB0b2tlbigpKSAhPT0gRU9GKSB7XG4gICAgICAgIHZhciBhID0gW107XG4gICAgICAgIHdoaWxlICh0ICE9PSBFT0wgJiYgdCAhPT0gRU9GKSB7XG4gICAgICAgICAgYS5wdXNoKHQpO1xuICAgICAgICAgIHQgPSB0b2tlbigpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmICYmICEoYSA9IGYoYSwgbisrKSkpIGNvbnRpbnVlO1xuICAgICAgICByb3dzLnB1c2goYSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcm93cztcbiAgICB9O1xuICAgIGRzdi5mb3JtYXQgPSBmdW5jdGlvbihyb3dzKSB7XG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShyb3dzWzBdKSkgcmV0dXJuIGRzdi5mb3JtYXRSb3dzKHJvd3MpO1xuICAgICAgdmFyIGZpZWxkU2V0ID0gbmV3IGQzX1NldCgpLCBmaWVsZHMgPSBbXTtcbiAgICAgIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpIHtcbiAgICAgICAgZm9yICh2YXIgZmllbGQgaW4gcm93KSB7XG4gICAgICAgICAgaWYgKCFmaWVsZFNldC5oYXMoZmllbGQpKSB7XG4gICAgICAgICAgICBmaWVsZHMucHVzaChmaWVsZFNldC5hZGQoZmllbGQpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIFsgZmllbGRzLm1hcChmb3JtYXRWYWx1ZSkuam9pbihkZWxpbWl0ZXIpIF0uY29uY2F0KHJvd3MubWFwKGZ1bmN0aW9uKHJvdykge1xuICAgICAgICByZXR1cm4gZmllbGRzLm1hcChmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAgIHJldHVybiBmb3JtYXRWYWx1ZShyb3dbZmllbGRdKTtcbiAgICAgICAgfSkuam9pbihkZWxpbWl0ZXIpO1xuICAgICAgfSkpLmpvaW4oXCJcXG5cIik7XG4gICAgfTtcbiAgICBkc3YuZm9ybWF0Um93cyA9IGZ1bmN0aW9uKHJvd3MpIHtcbiAgICAgIHJldHVybiByb3dzLm1hcChmb3JtYXRSb3cpLmpvaW4oXCJcXG5cIik7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBmb3JtYXRSb3cocm93KSB7XG4gICAgICByZXR1cm4gcm93Lm1hcChmb3JtYXRWYWx1ZSkuam9pbihkZWxpbWl0ZXIpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBmb3JtYXRWYWx1ZSh0ZXh0KSB7XG4gICAgICByZXR1cm4gcmVGb3JtYXQudGVzdCh0ZXh0KSA/ICdcIicgKyB0ZXh0LnJlcGxhY2UoL1xcXCIvZywgJ1wiXCInKSArICdcIicgOiB0ZXh0O1xuICAgIH1cbiAgICByZXR1cm4gZHN2O1xuICB9O1xuICBkMy5jc3YgPSBkMy5kc3YoXCIsXCIsIFwidGV4dC9jc3ZcIik7XG4gIGQzLnRzdiA9IGQzLmRzdihcIlx0XCIsIFwidGV4dC90YWItc2VwYXJhdGVkLXZhbHVlc1wiKTtcbiAgZDMudG91Y2ggPSBmdW5jdGlvbihjb250YWluZXIsIHRvdWNoZXMsIGlkZW50aWZpZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIGlkZW50aWZpZXIgPSB0b3VjaGVzLCB0b3VjaGVzID0gZDNfZXZlbnRTb3VyY2UoKS5jaGFuZ2VkVG91Y2hlcztcbiAgICBpZiAodG91Y2hlcykgZm9yICh2YXIgaSA9IDAsIG4gPSB0b3VjaGVzLmxlbmd0aCwgdG91Y2g7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgodG91Y2ggPSB0b3VjaGVzW2ldKS5pZGVudGlmaWVyID09PSBpZGVudGlmaWVyKSB7XG4gICAgICAgIHJldHVybiBkM19tb3VzZVBvaW50KGNvbnRhaW5lciwgdG91Y2gpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcbiAgdmFyIGQzX3RpbWVyX3F1ZXVlSGVhZCwgZDNfdGltZXJfcXVldWVUYWlsLCBkM190aW1lcl9pbnRlcnZhbCwgZDNfdGltZXJfdGltZW91dCwgZDNfdGltZXJfYWN0aXZlLCBkM190aW1lcl9mcmFtZSA9IGQzX3dpbmRvd1tkM192ZW5kb3JTeW1ib2woZDNfd2luZG93LCBcInJlcXVlc3RBbmltYXRpb25GcmFtZVwiKV0gfHwgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICBzZXRUaW1lb3V0KGNhbGxiYWNrLCAxNyk7XG4gIH07XG4gIGQzLnRpbWVyID0gZnVuY3Rpb24oY2FsbGJhY2ssIGRlbGF5LCB0aGVuKSB7XG4gICAgdmFyIG4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGlmIChuIDwgMikgZGVsYXkgPSAwO1xuICAgIGlmIChuIDwgMykgdGhlbiA9IERhdGUubm93KCk7XG4gICAgdmFyIHRpbWUgPSB0aGVuICsgZGVsYXksIHRpbWVyID0ge1xuICAgICAgYzogY2FsbGJhY2ssXG4gICAgICB0OiB0aW1lLFxuICAgICAgZjogZmFsc2UsXG4gICAgICBuOiBudWxsXG4gICAgfTtcbiAgICBpZiAoZDNfdGltZXJfcXVldWVUYWlsKSBkM190aW1lcl9xdWV1ZVRhaWwubiA9IHRpbWVyOyBlbHNlIGQzX3RpbWVyX3F1ZXVlSGVhZCA9IHRpbWVyO1xuICAgIGQzX3RpbWVyX3F1ZXVlVGFpbCA9IHRpbWVyO1xuICAgIGlmICghZDNfdGltZXJfaW50ZXJ2YWwpIHtcbiAgICAgIGQzX3RpbWVyX3RpbWVvdXQgPSBjbGVhclRpbWVvdXQoZDNfdGltZXJfdGltZW91dCk7XG4gICAgICBkM190aW1lcl9pbnRlcnZhbCA9IDE7XG4gICAgICBkM190aW1lcl9mcmFtZShkM190aW1lcl9zdGVwKTtcbiAgICB9XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3RpbWVyX3N0ZXAoKSB7XG4gICAgdmFyIG5vdyA9IGQzX3RpbWVyX21hcmsoKSwgZGVsYXkgPSBkM190aW1lcl9zd2VlcCgpIC0gbm93O1xuICAgIGlmIChkZWxheSA+IDI0KSB7XG4gICAgICBpZiAoaXNGaW5pdGUoZGVsYXkpKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChkM190aW1lcl90aW1lb3V0KTtcbiAgICAgICAgZDNfdGltZXJfdGltZW91dCA9IHNldFRpbWVvdXQoZDNfdGltZXJfc3RlcCwgZGVsYXkpO1xuICAgICAgfVxuICAgICAgZDNfdGltZXJfaW50ZXJ2YWwgPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBkM190aW1lcl9pbnRlcnZhbCA9IDE7XG4gICAgICBkM190aW1lcl9mcmFtZShkM190aW1lcl9zdGVwKTtcbiAgICB9XG4gIH1cbiAgZDMudGltZXIuZmx1c2ggPSBmdW5jdGlvbigpIHtcbiAgICBkM190aW1lcl9tYXJrKCk7XG4gICAgZDNfdGltZXJfc3dlZXAoKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfdGltZXJfbWFyaygpIHtcbiAgICB2YXIgbm93ID0gRGF0ZS5ub3coKTtcbiAgICBkM190aW1lcl9hY3RpdmUgPSBkM190aW1lcl9xdWV1ZUhlYWQ7XG4gICAgd2hpbGUgKGQzX3RpbWVyX2FjdGl2ZSkge1xuICAgICAgaWYgKG5vdyA+PSBkM190aW1lcl9hY3RpdmUudCkgZDNfdGltZXJfYWN0aXZlLmYgPSBkM190aW1lcl9hY3RpdmUuYyhub3cgLSBkM190aW1lcl9hY3RpdmUudCk7XG4gICAgICBkM190aW1lcl9hY3RpdmUgPSBkM190aW1lcl9hY3RpdmUubjtcbiAgICB9XG4gICAgcmV0dXJuIG5vdztcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lcl9zd2VlcCgpIHtcbiAgICB2YXIgdDAsIHQxID0gZDNfdGltZXJfcXVldWVIZWFkLCB0aW1lID0gSW5maW5pdHk7XG4gICAgd2hpbGUgKHQxKSB7XG4gICAgICBpZiAodDEuZikge1xuICAgICAgICB0MSA9IHQwID8gdDAubiA9IHQxLm4gOiBkM190aW1lcl9xdWV1ZUhlYWQgPSB0MS5uO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHQxLnQgPCB0aW1lKSB0aW1lID0gdDEudDtcbiAgICAgICAgdDEgPSAodDAgPSB0MSkubjtcbiAgICAgIH1cbiAgICB9XG4gICAgZDNfdGltZXJfcXVldWVUYWlsID0gdDA7XG4gICAgcmV0dXJuIHRpbWU7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZm9ybWF0X3ByZWNpc2lvbih4LCBwKSB7XG4gICAgcmV0dXJuIHAgLSAoeCA/IE1hdGguY2VpbChNYXRoLmxvZyh4KSAvIE1hdGguTE4xMCkgOiAxKTtcbiAgfVxuICBkMy5yb3VuZCA9IGZ1bmN0aW9uKHgsIG4pIHtcbiAgICByZXR1cm4gbiA/IE1hdGgucm91bmQoeCAqIChuID0gTWF0aC5wb3coMTAsIG4pKSkgLyBuIDogTWF0aC5yb3VuZCh4KTtcbiAgfTtcbiAgdmFyIGQzX2Zvcm1hdFByZWZpeGVzID0gWyBcInlcIiwgXCJ6XCIsIFwiYVwiLCBcImZcIiwgXCJwXCIsIFwiblwiLCBcIsK1XCIsIFwibVwiLCBcIlwiLCBcImtcIiwgXCJNXCIsIFwiR1wiLCBcIlRcIiwgXCJQXCIsIFwiRVwiLCBcIlpcIiwgXCJZXCIgXS5tYXAoZDNfZm9ybWF0UHJlZml4KTtcbiAgZDMuZm9ybWF0UHJlZml4ID0gZnVuY3Rpb24odmFsdWUsIHByZWNpc2lvbikge1xuICAgIHZhciBpID0gMDtcbiAgICBpZiAodmFsdWUpIHtcbiAgICAgIGlmICh2YWx1ZSA8IDApIHZhbHVlICo9IC0xO1xuICAgICAgaWYgKHByZWNpc2lvbikgdmFsdWUgPSBkMy5yb3VuZCh2YWx1ZSwgZDNfZm9ybWF0X3ByZWNpc2lvbih2YWx1ZSwgcHJlY2lzaW9uKSk7XG4gICAgICBpID0gMSArIE1hdGguZmxvb3IoMWUtMTIgKyBNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMTApO1xuICAgICAgaSA9IE1hdGgubWF4KC0yNCwgTWF0aC5taW4oMjQsIE1hdGguZmxvb3IoKGkgLSAxKSAvIDMpICogMykpO1xuICAgIH1cbiAgICByZXR1cm4gZDNfZm9ybWF0UHJlZml4ZXNbOCArIGkgLyAzXTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfZm9ybWF0UHJlZml4KGQsIGkpIHtcbiAgICB2YXIgayA9IE1hdGgucG93KDEwLCBhYnMoOCAtIGkpICogMyk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHNjYWxlOiBpID4gOCA/IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQgLyBrO1xuICAgICAgfSA6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQgKiBrO1xuICAgICAgfSxcbiAgICAgIHN5bWJvbDogZFxuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfbG9jYWxlX251bWJlckZvcm1hdChsb2NhbGUpIHtcbiAgICB2YXIgbG9jYWxlX2RlY2ltYWwgPSBsb2NhbGUuZGVjaW1hbCwgbG9jYWxlX3Rob3VzYW5kcyA9IGxvY2FsZS50aG91c2FuZHMsIGxvY2FsZV9ncm91cGluZyA9IGxvY2FsZS5ncm91cGluZywgbG9jYWxlX2N1cnJlbmN5ID0gbG9jYWxlLmN1cnJlbmN5LCBmb3JtYXRHcm91cCA9IGxvY2FsZV9ncm91cGluZyA/IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICB2YXIgaSA9IHZhbHVlLmxlbmd0aCwgdCA9IFtdLCBqID0gMCwgZyA9IGxvY2FsZV9ncm91cGluZ1swXTtcbiAgICAgIHdoaWxlIChpID4gMCAmJiBnID4gMCkge1xuICAgICAgICB0LnB1c2godmFsdWUuc3Vic3RyaW5nKGkgLT0gZywgaSArIGcpKTtcbiAgICAgICAgZyA9IGxvY2FsZV9ncm91cGluZ1tqID0gKGogKyAxKSAlIGxvY2FsZV9ncm91cGluZy5sZW5ndGhdO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHQucmV2ZXJzZSgpLmpvaW4obG9jYWxlX3Rob3VzYW5kcyk7XG4gICAgfSA6IGQzX2lkZW50aXR5O1xuICAgIHJldHVybiBmdW5jdGlvbihzcGVjaWZpZXIpIHtcbiAgICAgIHZhciBtYXRjaCA9IGQzX2Zvcm1hdF9yZS5leGVjKHNwZWNpZmllciksIGZpbGwgPSBtYXRjaFsxXSB8fCBcIiBcIiwgYWxpZ24gPSBtYXRjaFsyXSB8fCBcIj5cIiwgc2lnbiA9IG1hdGNoWzNdIHx8IFwiXCIsIHN5bWJvbCA9IG1hdGNoWzRdIHx8IFwiXCIsIHpmaWxsID0gbWF0Y2hbNV0sIHdpZHRoID0gK21hdGNoWzZdLCBjb21tYSA9IG1hdGNoWzddLCBwcmVjaXNpb24gPSBtYXRjaFs4XSwgdHlwZSA9IG1hdGNoWzldLCBzY2FsZSA9IDEsIHByZWZpeCA9IFwiXCIsIHN1ZmZpeCA9IFwiXCIsIGludGVnZXIgPSBmYWxzZTtcbiAgICAgIGlmIChwcmVjaXNpb24pIHByZWNpc2lvbiA9ICtwcmVjaXNpb24uc3Vic3RyaW5nKDEpO1xuICAgICAgaWYgKHpmaWxsIHx8IGZpbGwgPT09IFwiMFwiICYmIGFsaWduID09PSBcIj1cIikge1xuICAgICAgICB6ZmlsbCA9IGZpbGwgPSBcIjBcIjtcbiAgICAgICAgYWxpZ24gPSBcIj1cIjtcbiAgICAgICAgaWYgKGNvbW1hKSB3aWR0aCAtPSBNYXRoLmZsb29yKCh3aWR0aCAtIDEpIC8gNCk7XG4gICAgICB9XG4gICAgICBzd2l0Y2ggKHR5cGUpIHtcbiAgICAgICBjYXNlIFwiblwiOlxuICAgICAgICBjb21tYSA9IHRydWU7XG4gICAgICAgIHR5cGUgPSBcImdcIjtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgICBjYXNlIFwiJVwiOlxuICAgICAgICBzY2FsZSA9IDEwMDtcbiAgICAgICAgc3VmZml4ID0gXCIlXCI7XG4gICAgICAgIHR5cGUgPSBcImZcIjtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgICBjYXNlIFwicFwiOlxuICAgICAgICBzY2FsZSA9IDEwMDtcbiAgICAgICAgc3VmZml4ID0gXCIlXCI7XG4gICAgICAgIHR5cGUgPSBcInJcIjtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgICBjYXNlIFwiYlwiOlxuICAgICAgIGNhc2UgXCJvXCI6XG4gICAgICAgY2FzZSBcInhcIjpcbiAgICAgICBjYXNlIFwiWFwiOlxuICAgICAgICBpZiAoc3ltYm9sID09PSBcIiNcIikgcHJlZml4ID0gXCIwXCIgKyB0eXBlLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICBjYXNlIFwiY1wiOlxuICAgICAgIGNhc2UgXCJkXCI6XG4gICAgICAgIGludGVnZXIgPSB0cnVlO1xuICAgICAgICBwcmVjaXNpb24gPSAwO1xuICAgICAgICBicmVhaztcblxuICAgICAgIGNhc2UgXCJzXCI6XG4gICAgICAgIHNjYWxlID0gLTE7XG4gICAgICAgIHR5cGUgPSBcInJcIjtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoc3ltYm9sID09PSBcIiRcIikgcHJlZml4ID0gbG9jYWxlX2N1cnJlbmN5WzBdLCBzdWZmaXggPSBsb2NhbGVfY3VycmVuY3lbMV07XG4gICAgICBpZiAodHlwZSA9PSBcInJcIiAmJiAhcHJlY2lzaW9uKSB0eXBlID0gXCJnXCI7XG4gICAgICBpZiAocHJlY2lzaW9uICE9IG51bGwpIHtcbiAgICAgICAgaWYgKHR5cGUgPT0gXCJnXCIpIHByZWNpc2lvbiA9IE1hdGgubWF4KDEsIE1hdGgubWluKDIxLCBwcmVjaXNpb24pKTsgZWxzZSBpZiAodHlwZSA9PSBcImVcIiB8fCB0eXBlID09IFwiZlwiKSBwcmVjaXNpb24gPSBNYXRoLm1heCgwLCBNYXRoLm1pbigyMCwgcHJlY2lzaW9uKSk7XG4gICAgICB9XG4gICAgICB0eXBlID0gZDNfZm9ybWF0X3R5cGVzLmdldCh0eXBlKSB8fCBkM19mb3JtYXRfdHlwZURlZmF1bHQ7XG4gICAgICB2YXIgemNvbW1hID0gemZpbGwgJiYgY29tbWE7XG4gICAgICByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgdmFyIGZ1bGxTdWZmaXggPSBzdWZmaXg7XG4gICAgICAgIGlmIChpbnRlZ2VyICYmIHZhbHVlICUgMSkgcmV0dXJuIFwiXCI7XG4gICAgICAgIHZhciBuZWdhdGl2ZSA9IHZhbHVlIDwgMCB8fCB2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwID8gKHZhbHVlID0gLXZhbHVlLCBcIi1cIikgOiBzaWduO1xuICAgICAgICBpZiAoc2NhbGUgPCAwKSB7XG4gICAgICAgICAgdmFyIHVuaXQgPSBkMy5mb3JtYXRQcmVmaXgodmFsdWUsIHByZWNpc2lvbik7XG4gICAgICAgICAgdmFsdWUgPSB1bml0LnNjYWxlKHZhbHVlKTtcbiAgICAgICAgICBmdWxsU3VmZml4ID0gdW5pdC5zeW1ib2wgKyBzdWZmaXg7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgKj0gc2NhbGU7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWUgPSB0eXBlKHZhbHVlLCBwcmVjaXNpb24pO1xuICAgICAgICB2YXIgaSA9IHZhbHVlLmxhc3RJbmRleE9mKFwiLlwiKSwgYmVmb3JlID0gaSA8IDAgPyB2YWx1ZSA6IHZhbHVlLnN1YnN0cmluZygwLCBpKSwgYWZ0ZXIgPSBpIDwgMCA/IFwiXCIgOiBsb2NhbGVfZGVjaW1hbCArIHZhbHVlLnN1YnN0cmluZyhpICsgMSk7XG4gICAgICAgIGlmICghemZpbGwgJiYgY29tbWEpIGJlZm9yZSA9IGZvcm1hdEdyb3VwKGJlZm9yZSk7XG4gICAgICAgIHZhciBsZW5ndGggPSBwcmVmaXgubGVuZ3RoICsgYmVmb3JlLmxlbmd0aCArIGFmdGVyLmxlbmd0aCArICh6Y29tbWEgPyAwIDogbmVnYXRpdmUubGVuZ3RoKSwgcGFkZGluZyA9IGxlbmd0aCA8IHdpZHRoID8gbmV3IEFycmF5KGxlbmd0aCA9IHdpZHRoIC0gbGVuZ3RoICsgMSkuam9pbihmaWxsKSA6IFwiXCI7XG4gICAgICAgIGlmICh6Y29tbWEpIGJlZm9yZSA9IGZvcm1hdEdyb3VwKHBhZGRpbmcgKyBiZWZvcmUpO1xuICAgICAgICBuZWdhdGl2ZSArPSBwcmVmaXg7XG4gICAgICAgIHZhbHVlID0gYmVmb3JlICsgYWZ0ZXI7XG4gICAgICAgIHJldHVybiAoYWxpZ24gPT09IFwiPFwiID8gbmVnYXRpdmUgKyB2YWx1ZSArIHBhZGRpbmcgOiBhbGlnbiA9PT0gXCI+XCIgPyBwYWRkaW5nICsgbmVnYXRpdmUgKyB2YWx1ZSA6IGFsaWduID09PSBcIl5cIiA/IHBhZGRpbmcuc3Vic3RyaW5nKDAsIGxlbmd0aCA+Pj0gMSkgKyBuZWdhdGl2ZSArIHZhbHVlICsgcGFkZGluZy5zdWJzdHJpbmcobGVuZ3RoKSA6IG5lZ2F0aXZlICsgKHpjb21tYSA/IHZhbHVlIDogcGFkZGluZyArIHZhbHVlKSkgKyBmdWxsU3VmZml4O1xuICAgICAgfTtcbiAgICB9O1xuICB9XG4gIHZhciBkM19mb3JtYXRfcmUgPSAvKD86KFtee10pPyhbPD49Xl0pKT8oWytcXC0gXSk/KFskI10pPygwKT8oXFxkKyk/KCwpPyhcXC4tP1xcZCspPyhbYS16JV0pPy9pO1xuICB2YXIgZDNfZm9ybWF0X3R5cGVzID0gZDMubWFwKHtcbiAgICBiOiBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4geC50b1N0cmluZygyKTtcbiAgICB9LFxuICAgIGM6IGZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKHgpO1xuICAgIH0sXG4gICAgbzogZnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHgudG9TdHJpbmcoOCk7XG4gICAgfSxcbiAgICB4OiBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4geC50b1N0cmluZygxNik7XG4gICAgfSxcbiAgICBYOiBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4geC50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcbiAgICB9LFxuICAgIGc6IGZ1bmN0aW9uKHgsIHApIHtcbiAgICAgIHJldHVybiB4LnRvUHJlY2lzaW9uKHApO1xuICAgIH0sXG4gICAgZTogZnVuY3Rpb24oeCwgcCkge1xuICAgICAgcmV0dXJuIHgudG9FeHBvbmVudGlhbChwKTtcbiAgICB9LFxuICAgIGY6IGZ1bmN0aW9uKHgsIHApIHtcbiAgICAgIHJldHVybiB4LnRvRml4ZWQocCk7XG4gICAgfSxcbiAgICByOiBmdW5jdGlvbih4LCBwKSB7XG4gICAgICByZXR1cm4gKHggPSBkMy5yb3VuZCh4LCBkM19mb3JtYXRfcHJlY2lzaW9uKHgsIHApKSkudG9GaXhlZChNYXRoLm1heCgwLCBNYXRoLm1pbigyMCwgZDNfZm9ybWF0X3ByZWNpc2lvbih4ICogKDEgKyAxZS0xNSksIHApKSkpO1xuICAgIH1cbiAgfSk7XG4gIGZ1bmN0aW9uIGQzX2Zvcm1hdF90eXBlRGVmYXVsdCh4KSB7XG4gICAgcmV0dXJuIHggKyBcIlwiO1xuICB9XG4gIHZhciBkM190aW1lID0gZDMudGltZSA9IHt9LCBkM19kYXRlID0gRGF0ZTtcbiAgZnVuY3Rpb24gZDNfZGF0ZV91dGMoKSB7XG4gICAgdGhpcy5fID0gbmV3IERhdGUoYXJndW1lbnRzLmxlbmd0aCA+IDEgPyBEYXRlLlVUQy5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDogYXJndW1lbnRzWzBdKTtcbiAgfVxuICBkM19kYXRlX3V0Yy5wcm90b3R5cGUgPSB7XG4gICAgZ2V0RGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fLmdldFVUQ0RhdGUoKTtcbiAgICB9LFxuICAgIGdldERheTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fLmdldFVUQ0RheSgpO1xuICAgIH0sXG4gICAgZ2V0RnVsbFllYXI6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuXy5nZXRVVENGdWxsWWVhcigpO1xuICAgIH0sXG4gICAgZ2V0SG91cnM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuXy5nZXRVVENIb3VycygpO1xuICAgIH0sXG4gICAgZ2V0TWlsbGlzZWNvbmRzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl8uZ2V0VVRDTWlsbGlzZWNvbmRzKCk7XG4gICAgfSxcbiAgICBnZXRNaW51dGVzOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLl8uZ2V0VVRDTWludXRlcygpO1xuICAgIH0sXG4gICAgZ2V0TW9udGg6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuXy5nZXRVVENNb250aCgpO1xuICAgIH0sXG4gICAgZ2V0U2Vjb25kczogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fLmdldFVUQ1NlY29uZHMoKTtcbiAgICB9LFxuICAgIGdldFRpbWU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuXy5nZXRUaW1lKCk7XG4gICAgfSxcbiAgICBnZXRUaW1lem9uZU9mZnNldDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9LFxuICAgIHZhbHVlT2Y6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuXy52YWx1ZU9mKCk7XG4gICAgfSxcbiAgICBzZXREYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIGQzX3RpbWVfcHJvdG90eXBlLnNldFVUQ0RhdGUuYXBwbHkodGhpcy5fLCBhcmd1bWVudHMpO1xuICAgIH0sXG4gICAgc2V0RGF5OiBmdW5jdGlvbigpIHtcbiAgICAgIGQzX3RpbWVfcHJvdG90eXBlLnNldFVUQ0RheS5hcHBseSh0aGlzLl8sIGFyZ3VtZW50cyk7XG4gICAgfSxcbiAgICBzZXRGdWxsWWVhcjogZnVuY3Rpb24oKSB7XG4gICAgICBkM190aW1lX3Byb3RvdHlwZS5zZXRVVENGdWxsWWVhci5hcHBseSh0aGlzLl8sIGFyZ3VtZW50cyk7XG4gICAgfSxcbiAgICBzZXRIb3VyczogZnVuY3Rpb24oKSB7XG4gICAgICBkM190aW1lX3Byb3RvdHlwZS5zZXRVVENIb3Vycy5hcHBseSh0aGlzLl8sIGFyZ3VtZW50cyk7XG4gICAgfSxcbiAgICBzZXRNaWxsaXNlY29uZHM6IGZ1bmN0aW9uKCkge1xuICAgICAgZDNfdGltZV9wcm90b3R5cGUuc2V0VVRDTWlsbGlzZWNvbmRzLmFwcGx5KHRoaXMuXywgYXJndW1lbnRzKTtcbiAgICB9LFxuICAgIHNldE1pbnV0ZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgZDNfdGltZV9wcm90b3R5cGUuc2V0VVRDTWludXRlcy5hcHBseSh0aGlzLl8sIGFyZ3VtZW50cyk7XG4gICAgfSxcbiAgICBzZXRNb250aDogZnVuY3Rpb24oKSB7XG4gICAgICBkM190aW1lX3Byb3RvdHlwZS5zZXRVVENNb250aC5hcHBseSh0aGlzLl8sIGFyZ3VtZW50cyk7XG4gICAgfSxcbiAgICBzZXRTZWNvbmRzOiBmdW5jdGlvbigpIHtcbiAgICAgIGQzX3RpbWVfcHJvdG90eXBlLnNldFVUQ1NlY29uZHMuYXBwbHkodGhpcy5fLCBhcmd1bWVudHMpO1xuICAgIH0sXG4gICAgc2V0VGltZTogZnVuY3Rpb24oKSB7XG4gICAgICBkM190aW1lX3Byb3RvdHlwZS5zZXRUaW1lLmFwcGx5KHRoaXMuXywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH07XG4gIHZhciBkM190aW1lX3Byb3RvdHlwZSA9IERhdGUucHJvdG90eXBlO1xuICBmdW5jdGlvbiBkM190aW1lX2ludGVydmFsKGxvY2FsLCBzdGVwLCBudW1iZXIpIHtcbiAgICBmdW5jdGlvbiByb3VuZChkYXRlKSB7XG4gICAgICB2YXIgZDAgPSBsb2NhbChkYXRlKSwgZDEgPSBvZmZzZXQoZDAsIDEpO1xuICAgICAgcmV0dXJuIGRhdGUgLSBkMCA8IGQxIC0gZGF0ZSA/IGQwIDogZDE7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNlaWwoZGF0ZSkge1xuICAgICAgc3RlcChkYXRlID0gbG9jYWwobmV3IGQzX2RhdGUoZGF0ZSAtIDEpKSwgMSk7XG4gICAgICByZXR1cm4gZGF0ZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gb2Zmc2V0KGRhdGUsIGspIHtcbiAgICAgIHN0ZXAoZGF0ZSA9IG5ldyBkM19kYXRlKCtkYXRlKSwgayk7XG4gICAgICByZXR1cm4gZGF0ZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmFuZ2UodDAsIHQxLCBkdCkge1xuICAgICAgdmFyIHRpbWUgPSBjZWlsKHQwKSwgdGltZXMgPSBbXTtcbiAgICAgIGlmIChkdCA+IDEpIHtcbiAgICAgICAgd2hpbGUgKHRpbWUgPCB0MSkge1xuICAgICAgICAgIGlmICghKG51bWJlcih0aW1lKSAlIGR0KSkgdGltZXMucHVzaChuZXcgRGF0ZSgrdGltZSkpO1xuICAgICAgICAgIHN0ZXAodGltZSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdoaWxlICh0aW1lIDwgdDEpIHRpbWVzLnB1c2gobmV3IERhdGUoK3RpbWUpKSwgc3RlcCh0aW1lLCAxKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aW1lcztcbiAgICB9XG4gICAgZnVuY3Rpb24gcmFuZ2VfdXRjKHQwLCB0MSwgZHQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGQzX2RhdGUgPSBkM19kYXRlX3V0YztcbiAgICAgICAgdmFyIHV0YyA9IG5ldyBkM19kYXRlX3V0YygpO1xuICAgICAgICB1dGMuXyA9IHQwO1xuICAgICAgICByZXR1cm4gcmFuZ2UodXRjLCB0MSwgZHQpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgZDNfZGF0ZSA9IERhdGU7XG4gICAgICB9XG4gICAgfVxuICAgIGxvY2FsLmZsb29yID0gbG9jYWw7XG4gICAgbG9jYWwucm91bmQgPSByb3VuZDtcbiAgICBsb2NhbC5jZWlsID0gY2VpbDtcbiAgICBsb2NhbC5vZmZzZXQgPSBvZmZzZXQ7XG4gICAgbG9jYWwucmFuZ2UgPSByYW5nZTtcbiAgICB2YXIgdXRjID0gbG9jYWwudXRjID0gZDNfdGltZV9pbnRlcnZhbF91dGMobG9jYWwpO1xuICAgIHV0Yy5mbG9vciA9IHV0YztcbiAgICB1dGMucm91bmQgPSBkM190aW1lX2ludGVydmFsX3V0Yyhyb3VuZCk7XG4gICAgdXRjLmNlaWwgPSBkM190aW1lX2ludGVydmFsX3V0YyhjZWlsKTtcbiAgICB1dGMub2Zmc2V0ID0gZDNfdGltZV9pbnRlcnZhbF91dGMob2Zmc2V0KTtcbiAgICB1dGMucmFuZ2UgPSByYW5nZV91dGM7XG4gICAgcmV0dXJuIGxvY2FsO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RpbWVfaW50ZXJ2YWxfdXRjKG1ldGhvZCkge1xuICAgIHJldHVybiBmdW5jdGlvbihkYXRlLCBrKSB7XG4gICAgICB0cnkge1xuICAgICAgICBkM19kYXRlID0gZDNfZGF0ZV91dGM7XG4gICAgICAgIHZhciB1dGMgPSBuZXcgZDNfZGF0ZV91dGMoKTtcbiAgICAgICAgdXRjLl8gPSBkYXRlO1xuICAgICAgICByZXR1cm4gbWV0aG9kKHV0YywgaykuXztcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIGQzX2RhdGUgPSBEYXRlO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgZDNfdGltZS55ZWFyID0gZDNfdGltZV9pbnRlcnZhbChmdW5jdGlvbihkYXRlKSB7XG4gICAgZGF0ZSA9IGQzX3RpbWUuZGF5KGRhdGUpO1xuICAgIGRhdGUuc2V0TW9udGgoMCwgMSk7XG4gICAgcmV0dXJuIGRhdGU7XG4gIH0sIGZ1bmN0aW9uKGRhdGUsIG9mZnNldCkge1xuICAgIGRhdGUuc2V0RnVsbFllYXIoZGF0ZS5nZXRGdWxsWWVhcigpICsgb2Zmc2V0KTtcbiAgfSwgZnVuY3Rpb24oZGF0ZSkge1xuICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCk7XG4gIH0pO1xuICBkM190aW1lLnllYXJzID0gZDNfdGltZS55ZWFyLnJhbmdlO1xuICBkM190aW1lLnllYXJzLnV0YyA9IGQzX3RpbWUueWVhci51dGMucmFuZ2U7XG4gIGQzX3RpbWUuZGF5ID0gZDNfdGltZV9pbnRlcnZhbChmdW5jdGlvbihkYXRlKSB7XG4gICAgdmFyIGRheSA9IG5ldyBkM19kYXRlKDJlMywgMCk7XG4gICAgZGF5LnNldEZ1bGxZZWFyKGRhdGUuZ2V0RnVsbFllYXIoKSwgZGF0ZS5nZXRNb250aCgpLCBkYXRlLmdldERhdGUoKSk7XG4gICAgcmV0dXJuIGRheTtcbiAgfSwgZnVuY3Rpb24oZGF0ZSwgb2Zmc2V0KSB7XG4gICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpICsgb2Zmc2V0KTtcbiAgfSwgZnVuY3Rpb24oZGF0ZSkge1xuICAgIHJldHVybiBkYXRlLmdldERhdGUoKSAtIDE7XG4gIH0pO1xuICBkM190aW1lLmRheXMgPSBkM190aW1lLmRheS5yYW5nZTtcbiAgZDNfdGltZS5kYXlzLnV0YyA9IGQzX3RpbWUuZGF5LnV0Yy5yYW5nZTtcbiAgZDNfdGltZS5kYXlPZlllYXIgPSBmdW5jdGlvbihkYXRlKSB7XG4gICAgdmFyIHllYXIgPSBkM190aW1lLnllYXIoZGF0ZSk7XG4gICAgcmV0dXJuIE1hdGguZmxvb3IoKGRhdGUgLSB5ZWFyIC0gKGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKSAtIHllYXIuZ2V0VGltZXpvbmVPZmZzZXQoKSkgKiA2ZTQpIC8gODY0ZTUpO1xuICB9O1xuICBbIFwic3VuZGF5XCIsIFwibW9uZGF5XCIsIFwidHVlc2RheVwiLCBcIndlZG5lc2RheVwiLCBcInRodXJzZGF5XCIsIFwiZnJpZGF5XCIsIFwic2F0dXJkYXlcIiBdLmZvckVhY2goZnVuY3Rpb24oZGF5LCBpKSB7XG4gICAgaSA9IDcgLSBpO1xuICAgIHZhciBpbnRlcnZhbCA9IGQzX3RpbWVbZGF5XSA9IGQzX3RpbWVfaW50ZXJ2YWwoZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgKGRhdGUgPSBkM190aW1lLmRheShkYXRlKSkuc2V0RGF0ZShkYXRlLmdldERhdGUoKSAtIChkYXRlLmdldERheSgpICsgaSkgJSA3KTtcbiAgICAgIHJldHVybiBkYXRlO1xuICAgIH0sIGZ1bmN0aW9uKGRhdGUsIG9mZnNldCkge1xuICAgICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpICsgTWF0aC5mbG9vcihvZmZzZXQpICogNyk7XG4gICAgfSwgZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgdmFyIGRheSA9IGQzX3RpbWUueWVhcihkYXRlKS5nZXREYXkoKTtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKChkM190aW1lLmRheU9mWWVhcihkYXRlKSArIChkYXkgKyBpKSAlIDcpIC8gNykgLSAoZGF5ICE9PSBpKTtcbiAgICB9KTtcbiAgICBkM190aW1lW2RheSArIFwic1wiXSA9IGludGVydmFsLnJhbmdlO1xuICAgIGQzX3RpbWVbZGF5ICsgXCJzXCJdLnV0YyA9IGludGVydmFsLnV0Yy5yYW5nZTtcbiAgICBkM190aW1lW2RheSArIFwiT2ZZZWFyXCJdID0gZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgdmFyIGRheSA9IGQzX3RpbWUueWVhcihkYXRlKS5nZXREYXkoKTtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKChkM190aW1lLmRheU9mWWVhcihkYXRlKSArIChkYXkgKyBpKSAlIDcpIC8gNyk7XG4gICAgfTtcbiAgfSk7XG4gIGQzX3RpbWUud2VlayA9IGQzX3RpbWUuc3VuZGF5O1xuICBkM190aW1lLndlZWtzID0gZDNfdGltZS5zdW5kYXkucmFuZ2U7XG4gIGQzX3RpbWUud2Vla3MudXRjID0gZDNfdGltZS5zdW5kYXkudXRjLnJhbmdlO1xuICBkM190aW1lLndlZWtPZlllYXIgPSBkM190aW1lLnN1bmRheU9mWWVhcjtcbiAgZnVuY3Rpb24gZDNfbG9jYWxlX3RpbWVGb3JtYXQobG9jYWxlKSB7XG4gICAgdmFyIGxvY2FsZV9kYXRlVGltZSA9IGxvY2FsZS5kYXRlVGltZSwgbG9jYWxlX2RhdGUgPSBsb2NhbGUuZGF0ZSwgbG9jYWxlX3RpbWUgPSBsb2NhbGUudGltZSwgbG9jYWxlX3BlcmlvZHMgPSBsb2NhbGUucGVyaW9kcywgbG9jYWxlX2RheXMgPSBsb2NhbGUuZGF5cywgbG9jYWxlX3Nob3J0RGF5cyA9IGxvY2FsZS5zaG9ydERheXMsIGxvY2FsZV9tb250aHMgPSBsb2NhbGUubW9udGhzLCBsb2NhbGVfc2hvcnRNb250aHMgPSBsb2NhbGUuc2hvcnRNb250aHM7XG4gICAgZnVuY3Rpb24gZDNfdGltZV9mb3JtYXQodGVtcGxhdGUpIHtcbiAgICAgIHZhciBuID0gdGVtcGxhdGUubGVuZ3RoO1xuICAgICAgZnVuY3Rpb24gZm9ybWF0KGRhdGUpIHtcbiAgICAgICAgdmFyIHN0cmluZyA9IFtdLCBpID0gLTEsIGogPSAwLCBjLCBwLCBmO1xuICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgIGlmICh0ZW1wbGF0ZS5jaGFyQ29kZUF0KGkpID09PSAzNykge1xuICAgICAgICAgICAgc3RyaW5nLnB1c2godGVtcGxhdGUuc3Vic3RyaW5nKGosIGkpKTtcbiAgICAgICAgICAgIGlmICgocCA9IGQzX3RpbWVfZm9ybWF0UGFkc1tjID0gdGVtcGxhdGUuY2hhckF0KCsraSldKSAhPSBudWxsKSBjID0gdGVtcGxhdGUuY2hhckF0KCsraSk7XG4gICAgICAgICAgICBpZiAoZiA9IGQzX3RpbWVfZm9ybWF0c1tjXSkgYyA9IGYoZGF0ZSwgcCA9PSBudWxsID8gYyA9PT0gXCJlXCIgPyBcIiBcIiA6IFwiMFwiIDogcCk7XG4gICAgICAgICAgICBzdHJpbmcucHVzaChjKTtcbiAgICAgICAgICAgIGogPSBpICsgMTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3RyaW5nLnB1c2godGVtcGxhdGUuc3Vic3RyaW5nKGosIGkpKTtcbiAgICAgICAgcmV0dXJuIHN0cmluZy5qb2luKFwiXCIpO1xuICAgICAgfVxuICAgICAgZm9ybWF0LnBhcnNlID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICAgIHZhciBkID0ge1xuICAgICAgICAgIHk6IDE5MDAsXG4gICAgICAgICAgbTogMCxcbiAgICAgICAgICBkOiAxLFxuICAgICAgICAgIEg6IDAsXG4gICAgICAgICAgTTogMCxcbiAgICAgICAgICBTOiAwLFxuICAgICAgICAgIEw6IDAsXG4gICAgICAgICAgWjogbnVsbFxuICAgICAgICB9LCBpID0gZDNfdGltZV9wYXJzZShkLCB0ZW1wbGF0ZSwgc3RyaW5nLCAwKTtcbiAgICAgICAgaWYgKGkgIT0gc3RyaW5nLmxlbmd0aCkgcmV0dXJuIG51bGw7XG4gICAgICAgIGlmIChcInBcIiBpbiBkKSBkLkggPSBkLkggJSAxMiArIGQucCAqIDEyO1xuICAgICAgICB2YXIgbG9jYWxaID0gZC5aICE9IG51bGwgJiYgZDNfZGF0ZSAhPT0gZDNfZGF0ZV91dGMsIGRhdGUgPSBuZXcgKGxvY2FsWiA/IGQzX2RhdGVfdXRjIDogZDNfZGF0ZSkoKTtcbiAgICAgICAgaWYgKFwialwiIGluIGQpIGRhdGUuc2V0RnVsbFllYXIoZC55LCAwLCBkLmopOyBlbHNlIGlmIChcIndcIiBpbiBkICYmIChcIldcIiBpbiBkIHx8IFwiVVwiIGluIGQpKSB7XG4gICAgICAgICAgZGF0ZS5zZXRGdWxsWWVhcihkLnksIDAsIDEpO1xuICAgICAgICAgIGRhdGUuc2V0RnVsbFllYXIoZC55LCAwLCBcIldcIiBpbiBkID8gKGQudyArIDYpICUgNyArIGQuVyAqIDcgLSAoZGF0ZS5nZXREYXkoKSArIDUpICUgNyA6IGQudyArIGQuVSAqIDcgLSAoZGF0ZS5nZXREYXkoKSArIDYpICUgNyk7XG4gICAgICAgIH0gZWxzZSBkYXRlLnNldEZ1bGxZZWFyKGQueSwgZC5tLCBkLmQpO1xuICAgICAgICBkYXRlLnNldEhvdXJzKGQuSCArIE1hdGguZmxvb3IoZC5aIC8gMTAwKSwgZC5NICsgZC5aICUgMTAwLCBkLlMsIGQuTCk7XG4gICAgICAgIHJldHVybiBsb2NhbFogPyBkYXRlLl8gOiBkYXRlO1xuICAgICAgfTtcbiAgICAgIGZvcm1hdC50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIGZvcm1hdDtcbiAgICB9XG4gICAgZnVuY3Rpb24gZDNfdGltZV9wYXJzZShkYXRlLCB0ZW1wbGF0ZSwgc3RyaW5nLCBqKSB7XG4gICAgICB2YXIgYywgcCwgdCwgaSA9IDAsIG4gPSB0ZW1wbGF0ZS5sZW5ndGgsIG0gPSBzdHJpbmcubGVuZ3RoO1xuICAgICAgd2hpbGUgKGkgPCBuKSB7XG4gICAgICAgIGlmIChqID49IG0pIHJldHVybiAtMTtcbiAgICAgICAgYyA9IHRlbXBsYXRlLmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgICAgaWYgKGMgPT09IDM3KSB7XG4gICAgICAgICAgdCA9IHRlbXBsYXRlLmNoYXJBdChpKyspO1xuICAgICAgICAgIHAgPSBkM190aW1lX3BhcnNlcnNbdCBpbiBkM190aW1lX2Zvcm1hdFBhZHMgPyB0ZW1wbGF0ZS5jaGFyQXQoaSsrKSA6IHRdO1xuICAgICAgICAgIGlmICghcCB8fCAoaiA9IHAoZGF0ZSwgc3RyaW5nLCBqKSkgPCAwKSByZXR1cm4gLTE7XG4gICAgICAgIH0gZWxzZSBpZiAoYyAhPSBzdHJpbmcuY2hhckNvZGVBdChqKyspKSB7XG4gICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gajtcbiAgICB9XG4gICAgZDNfdGltZV9mb3JtYXQudXRjID0gZnVuY3Rpb24odGVtcGxhdGUpIHtcbiAgICAgIHZhciBsb2NhbCA9IGQzX3RpbWVfZm9ybWF0KHRlbXBsYXRlKTtcbiAgICAgIGZ1bmN0aW9uIGZvcm1hdChkYXRlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZDNfZGF0ZSA9IGQzX2RhdGVfdXRjO1xuICAgICAgICAgIHZhciB1dGMgPSBuZXcgZDNfZGF0ZSgpO1xuICAgICAgICAgIHV0Yy5fID0gZGF0ZTtcbiAgICAgICAgICByZXR1cm4gbG9jYWwodXRjKTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICBkM19kYXRlID0gRGF0ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZm9ybWF0LnBhcnNlID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgZDNfZGF0ZSA9IGQzX2RhdGVfdXRjO1xuICAgICAgICAgIHZhciBkYXRlID0gbG9jYWwucGFyc2Uoc3RyaW5nKTtcbiAgICAgICAgICByZXR1cm4gZGF0ZSAmJiBkYXRlLl87XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgZDNfZGF0ZSA9IERhdGU7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBmb3JtYXQudG9TdHJpbmcgPSBsb2NhbC50b1N0cmluZztcbiAgICAgIHJldHVybiBmb3JtYXQ7XG4gICAgfTtcbiAgICBkM190aW1lX2Zvcm1hdC5tdWx0aSA9IGQzX3RpbWVfZm9ybWF0LnV0Yy5tdWx0aSA9IGQzX3RpbWVfZm9ybWF0TXVsdGk7XG4gICAgdmFyIGQzX3RpbWVfcGVyaW9kTG9va3VwID0gZDMubWFwKCksIGQzX3RpbWVfZGF5UmUgPSBkM190aW1lX2Zvcm1hdFJlKGxvY2FsZV9kYXlzKSwgZDNfdGltZV9kYXlMb29rdXAgPSBkM190aW1lX2Zvcm1hdExvb2t1cChsb2NhbGVfZGF5cyksIGQzX3RpbWVfZGF5QWJicmV2UmUgPSBkM190aW1lX2Zvcm1hdFJlKGxvY2FsZV9zaG9ydERheXMpLCBkM190aW1lX2RheUFiYnJldkxvb2t1cCA9IGQzX3RpbWVfZm9ybWF0TG9va3VwKGxvY2FsZV9zaG9ydERheXMpLCBkM190aW1lX21vbnRoUmUgPSBkM190aW1lX2Zvcm1hdFJlKGxvY2FsZV9tb250aHMpLCBkM190aW1lX21vbnRoTG9va3VwID0gZDNfdGltZV9mb3JtYXRMb29rdXAobG9jYWxlX21vbnRocyksIGQzX3RpbWVfbW9udGhBYmJyZXZSZSA9IGQzX3RpbWVfZm9ybWF0UmUobG9jYWxlX3Nob3J0TW9udGhzKSwgZDNfdGltZV9tb250aEFiYnJldkxvb2t1cCA9IGQzX3RpbWVfZm9ybWF0TG9va3VwKGxvY2FsZV9zaG9ydE1vbnRocyk7XG4gICAgbG9jYWxlX3BlcmlvZHMuZm9yRWFjaChmdW5jdGlvbihwLCBpKSB7XG4gICAgICBkM190aW1lX3BlcmlvZExvb2t1cC5zZXQocC50b0xvd2VyQ2FzZSgpLCBpKTtcbiAgICB9KTtcbiAgICB2YXIgZDNfdGltZV9mb3JtYXRzID0ge1xuICAgICAgYTogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gbG9jYWxlX3Nob3J0RGF5c1tkLmdldERheSgpXTtcbiAgICAgIH0sXG4gICAgICBBOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBsb2NhbGVfZGF5c1tkLmdldERheSgpXTtcbiAgICAgIH0sXG4gICAgICBiOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBsb2NhbGVfc2hvcnRNb250aHNbZC5nZXRNb250aCgpXTtcbiAgICAgIH0sXG4gICAgICBCOiBmdW5jdGlvbihkKSB7XG4gICAgICAgIHJldHVybiBsb2NhbGVfbW9udGhzW2QuZ2V0TW9udGgoKV07XG4gICAgICB9LFxuICAgICAgYzogZDNfdGltZV9mb3JtYXQobG9jYWxlX2RhdGVUaW1lKSxcbiAgICAgIGQ6IGZ1bmN0aW9uKGQsIHApIHtcbiAgICAgICAgcmV0dXJuIGQzX3RpbWVfZm9ybWF0UGFkKGQuZ2V0RGF0ZSgpLCBwLCAyKTtcbiAgICAgIH0sXG4gICAgICBlOiBmdW5jdGlvbihkLCBwKSB7XG4gICAgICAgIHJldHVybiBkM190aW1lX2Zvcm1hdFBhZChkLmdldERhdGUoKSwgcCwgMik7XG4gICAgICB9LFxuICAgICAgSDogZnVuY3Rpb24oZCwgcCkge1xuICAgICAgICByZXR1cm4gZDNfdGltZV9mb3JtYXRQYWQoZC5nZXRIb3VycygpLCBwLCAyKTtcbiAgICAgIH0sXG4gICAgICBJOiBmdW5jdGlvbihkLCBwKSB7XG4gICAgICAgIHJldHVybiBkM190aW1lX2Zvcm1hdFBhZChkLmdldEhvdXJzKCkgJSAxMiB8fCAxMiwgcCwgMik7XG4gICAgICB9LFxuICAgICAgajogZnVuY3Rpb24oZCwgcCkge1xuICAgICAgICByZXR1cm4gZDNfdGltZV9mb3JtYXRQYWQoMSArIGQzX3RpbWUuZGF5T2ZZZWFyKGQpLCBwLCAzKTtcbiAgICAgIH0sXG4gICAgICBMOiBmdW5jdGlvbihkLCBwKSB7XG4gICAgICAgIHJldHVybiBkM190aW1lX2Zvcm1hdFBhZChkLmdldE1pbGxpc2Vjb25kcygpLCBwLCAzKTtcbiAgICAgIH0sXG4gICAgICBtOiBmdW5jdGlvbihkLCBwKSB7XG4gICAgICAgIHJldHVybiBkM190aW1lX2Zvcm1hdFBhZChkLmdldE1vbnRoKCkgKyAxLCBwLCAyKTtcbiAgICAgIH0sXG4gICAgICBNOiBmdW5jdGlvbihkLCBwKSB7XG4gICAgICAgIHJldHVybiBkM190aW1lX2Zvcm1hdFBhZChkLmdldE1pbnV0ZXMoKSwgcCwgMik7XG4gICAgICB9LFxuICAgICAgcDogZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gbG9jYWxlX3BlcmlvZHNbKyhkLmdldEhvdXJzKCkgPj0gMTIpXTtcbiAgICAgIH0sXG4gICAgICBTOiBmdW5jdGlvbihkLCBwKSB7XG4gICAgICAgIHJldHVybiBkM190aW1lX2Zvcm1hdFBhZChkLmdldFNlY29uZHMoKSwgcCwgMik7XG4gICAgICB9LFxuICAgICAgVTogZnVuY3Rpb24oZCwgcCkge1xuICAgICAgICByZXR1cm4gZDNfdGltZV9mb3JtYXRQYWQoZDNfdGltZS5zdW5kYXlPZlllYXIoZCksIHAsIDIpO1xuICAgICAgfSxcbiAgICAgIHc6IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQuZ2V0RGF5KCk7XG4gICAgICB9LFxuICAgICAgVzogZnVuY3Rpb24oZCwgcCkge1xuICAgICAgICByZXR1cm4gZDNfdGltZV9mb3JtYXRQYWQoZDNfdGltZS5tb25kYXlPZlllYXIoZCksIHAsIDIpO1xuICAgICAgfSxcbiAgICAgIHg6IGQzX3RpbWVfZm9ybWF0KGxvY2FsZV9kYXRlKSxcbiAgICAgIFg6IGQzX3RpbWVfZm9ybWF0KGxvY2FsZV90aW1lKSxcbiAgICAgIHk6IGZ1bmN0aW9uKGQsIHApIHtcbiAgICAgICAgcmV0dXJuIGQzX3RpbWVfZm9ybWF0UGFkKGQuZ2V0RnVsbFllYXIoKSAlIDEwMCwgcCwgMik7XG4gICAgICB9LFxuICAgICAgWTogZnVuY3Rpb24oZCwgcCkge1xuICAgICAgICByZXR1cm4gZDNfdGltZV9mb3JtYXRQYWQoZC5nZXRGdWxsWWVhcigpICUgMWU0LCBwLCA0KTtcbiAgICAgIH0sXG4gICAgICBaOiBkM190aW1lX3pvbmUsXG4gICAgICBcIiVcIjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBcIiVcIjtcbiAgICAgIH1cbiAgICB9O1xuICAgIHZhciBkM190aW1lX3BhcnNlcnMgPSB7XG4gICAgICBhOiBkM190aW1lX3BhcnNlV2Vla2RheUFiYnJldixcbiAgICAgIEE6IGQzX3RpbWVfcGFyc2VXZWVrZGF5LFxuICAgICAgYjogZDNfdGltZV9wYXJzZU1vbnRoQWJicmV2LFxuICAgICAgQjogZDNfdGltZV9wYXJzZU1vbnRoLFxuICAgICAgYzogZDNfdGltZV9wYXJzZUxvY2FsZUZ1bGwsXG4gICAgICBkOiBkM190aW1lX3BhcnNlRGF5LFxuICAgICAgZTogZDNfdGltZV9wYXJzZURheSxcbiAgICAgIEg6IGQzX3RpbWVfcGFyc2VIb3VyMjQsXG4gICAgICBJOiBkM190aW1lX3BhcnNlSG91cjI0LFxuICAgICAgajogZDNfdGltZV9wYXJzZURheU9mWWVhcixcbiAgICAgIEw6IGQzX3RpbWVfcGFyc2VNaWxsaXNlY29uZHMsXG4gICAgICBtOiBkM190aW1lX3BhcnNlTW9udGhOdW1iZXIsXG4gICAgICBNOiBkM190aW1lX3BhcnNlTWludXRlcyxcbiAgICAgIHA6IGQzX3RpbWVfcGFyc2VBbVBtLFxuICAgICAgUzogZDNfdGltZV9wYXJzZVNlY29uZHMsXG4gICAgICBVOiBkM190aW1lX3BhcnNlV2Vla051bWJlclN1bmRheSxcbiAgICAgIHc6IGQzX3RpbWVfcGFyc2VXZWVrZGF5TnVtYmVyLFxuICAgICAgVzogZDNfdGltZV9wYXJzZVdlZWtOdW1iZXJNb25kYXksXG4gICAgICB4OiBkM190aW1lX3BhcnNlTG9jYWxlRGF0ZSxcbiAgICAgIFg6IGQzX3RpbWVfcGFyc2VMb2NhbGVUaW1lLFxuICAgICAgeTogZDNfdGltZV9wYXJzZVllYXIsXG4gICAgICBZOiBkM190aW1lX3BhcnNlRnVsbFllYXIsXG4gICAgICBaOiBkM190aW1lX3BhcnNlWm9uZSxcbiAgICAgIFwiJVwiOiBkM190aW1lX3BhcnNlTGl0ZXJhbFBlcmNlbnRcbiAgICB9O1xuICAgIGZ1bmN0aW9uIGQzX3RpbWVfcGFyc2VXZWVrZGF5QWJicmV2KGRhdGUsIHN0cmluZywgaSkge1xuICAgICAgZDNfdGltZV9kYXlBYmJyZXZSZS5sYXN0SW5kZXggPSAwO1xuICAgICAgdmFyIG4gPSBkM190aW1lX2RheUFiYnJldlJlLmV4ZWMoc3RyaW5nLnN1YnN0cmluZyhpKSk7XG4gICAgICByZXR1cm4gbiA/IChkYXRlLncgPSBkM190aW1lX2RheUFiYnJldkxvb2t1cC5nZXQoblswXS50b0xvd2VyQ2FzZSgpKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkM190aW1lX3BhcnNlV2Vla2RheShkYXRlLCBzdHJpbmcsIGkpIHtcbiAgICAgIGQzX3RpbWVfZGF5UmUubGFzdEluZGV4ID0gMDtcbiAgICAgIHZhciBuID0gZDNfdGltZV9kYXlSZS5leGVjKHN0cmluZy5zdWJzdHJpbmcoaSkpO1xuICAgICAgcmV0dXJuIG4gPyAoZGF0ZS53ID0gZDNfdGltZV9kYXlMb29rdXAuZ2V0KG5bMF0udG9Mb3dlckNhc2UoKSksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZDNfdGltZV9wYXJzZU1vbnRoQWJicmV2KGRhdGUsIHN0cmluZywgaSkge1xuICAgICAgZDNfdGltZV9tb250aEFiYnJldlJlLmxhc3RJbmRleCA9IDA7XG4gICAgICB2YXIgbiA9IGQzX3RpbWVfbW9udGhBYmJyZXZSZS5leGVjKHN0cmluZy5zdWJzdHJpbmcoaSkpO1xuICAgICAgcmV0dXJuIG4gPyAoZGF0ZS5tID0gZDNfdGltZV9tb250aEFiYnJldkxvb2t1cC5nZXQoblswXS50b0xvd2VyQ2FzZSgpKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkM190aW1lX3BhcnNlTW9udGgoZGF0ZSwgc3RyaW5nLCBpKSB7XG4gICAgICBkM190aW1lX21vbnRoUmUubGFzdEluZGV4ID0gMDtcbiAgICAgIHZhciBuID0gZDNfdGltZV9tb250aFJlLmV4ZWMoc3RyaW5nLnN1YnN0cmluZyhpKSk7XG4gICAgICByZXR1cm4gbiA/IChkYXRlLm0gPSBkM190aW1lX21vbnRoTG9va3VwLmdldChuWzBdLnRvTG93ZXJDYXNlKCkpLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGQzX3RpbWVfcGFyc2VMb2NhbGVGdWxsKGRhdGUsIHN0cmluZywgaSkge1xuICAgICAgcmV0dXJuIGQzX3RpbWVfcGFyc2UoZGF0ZSwgZDNfdGltZV9mb3JtYXRzLmMudG9TdHJpbmcoKSwgc3RyaW5nLCBpKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZDNfdGltZV9wYXJzZUxvY2FsZURhdGUoZGF0ZSwgc3RyaW5nLCBpKSB7XG4gICAgICByZXR1cm4gZDNfdGltZV9wYXJzZShkYXRlLCBkM190aW1lX2Zvcm1hdHMueC50b1N0cmluZygpLCBzdHJpbmcsIGkpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBkM190aW1lX3BhcnNlTG9jYWxlVGltZShkYXRlLCBzdHJpbmcsIGkpIHtcbiAgICAgIHJldHVybiBkM190aW1lX3BhcnNlKGRhdGUsIGQzX3RpbWVfZm9ybWF0cy5YLnRvU3RyaW5nKCksIHN0cmluZywgaSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGQzX3RpbWVfcGFyc2VBbVBtKGRhdGUsIHN0cmluZywgaSkge1xuICAgICAgdmFyIG4gPSBkM190aW1lX3BlcmlvZExvb2t1cC5nZXQoc3RyaW5nLnN1YnN0cmluZyhpLCBpICs9IDIpLnRvTG93ZXJDYXNlKCkpO1xuICAgICAgcmV0dXJuIG4gPT0gbnVsbCA/IC0xIDogKGRhdGUucCA9IG4sIGkpO1xuICAgIH1cbiAgICByZXR1cm4gZDNfdGltZV9mb3JtYXQ7XG4gIH1cbiAgdmFyIGQzX3RpbWVfZm9ybWF0UGFkcyA9IHtcbiAgICBcIi1cIjogXCJcIixcbiAgICBfOiBcIiBcIixcbiAgICBcIjBcIjogXCIwXCJcbiAgfSwgZDNfdGltZV9udW1iZXJSZSA9IC9eXFxzKlxcZCsvLCBkM190aW1lX3BlcmNlbnRSZSA9IC9eJS87XG4gIGZ1bmN0aW9uIGQzX3RpbWVfZm9ybWF0UGFkKHZhbHVlLCBmaWxsLCB3aWR0aCkge1xuICAgIHZhciBzaWduID0gdmFsdWUgPCAwID8gXCItXCIgOiBcIlwiLCBzdHJpbmcgPSAoc2lnbiA/IC12YWx1ZSA6IHZhbHVlKSArIFwiXCIsIGxlbmd0aCA9IHN0cmluZy5sZW5ndGg7XG4gICAgcmV0dXJuIHNpZ24gKyAobGVuZ3RoIDwgd2lkdGggPyBuZXcgQXJyYXkod2lkdGggLSBsZW5ndGggKyAxKS5qb2luKGZpbGwpICsgc3RyaW5nIDogc3RyaW5nKTtcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lX2Zvcm1hdFJlKG5hbWVzKSB7XG4gICAgcmV0dXJuIG5ldyBSZWdFeHAoXCJeKD86XCIgKyBuYW1lcy5tYXAoZDMucmVxdW90ZSkuam9pbihcInxcIikgKyBcIilcIiwgXCJpXCIpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RpbWVfZm9ybWF0TG9va3VwKG5hbWVzKSB7XG4gICAgdmFyIG1hcCA9IG5ldyBkM19NYXAoKSwgaSA9IC0xLCBuID0gbmFtZXMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSBtYXAuc2V0KG5hbWVzW2ldLnRvTG93ZXJDYXNlKCksIGkpO1xuICAgIHJldHVybiBtYXA7XG4gIH1cbiAgZnVuY3Rpb24gZDNfdGltZV9wYXJzZVdlZWtkYXlOdW1iZXIoZGF0ZSwgc3RyaW5nLCBpKSB7XG4gICAgZDNfdGltZV9udW1iZXJSZS5sYXN0SW5kZXggPSAwO1xuICAgIHZhciBuID0gZDNfdGltZV9udW1iZXJSZS5leGVjKHN0cmluZy5zdWJzdHJpbmcoaSwgaSArIDEpKTtcbiAgICByZXR1cm4gbiA/IChkYXRlLncgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RpbWVfcGFyc2VXZWVrTnVtYmVyU3VuZGF5KGRhdGUsIHN0cmluZywgaSkge1xuICAgIGQzX3RpbWVfbnVtYmVyUmUubGFzdEluZGV4ID0gMDtcbiAgICB2YXIgbiA9IGQzX3RpbWVfbnVtYmVyUmUuZXhlYyhzdHJpbmcuc3Vic3RyaW5nKGkpKTtcbiAgICByZXR1cm4gbiA/IChkYXRlLlUgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RpbWVfcGFyc2VXZWVrTnVtYmVyTW9uZGF5KGRhdGUsIHN0cmluZywgaSkge1xuICAgIGQzX3RpbWVfbnVtYmVyUmUubGFzdEluZGV4ID0gMDtcbiAgICB2YXIgbiA9IGQzX3RpbWVfbnVtYmVyUmUuZXhlYyhzdHJpbmcuc3Vic3RyaW5nKGkpKTtcbiAgICByZXR1cm4gbiA/IChkYXRlLlcgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RpbWVfcGFyc2VGdWxsWWVhcihkYXRlLCBzdHJpbmcsIGkpIHtcbiAgICBkM190aW1lX251bWJlclJlLmxhc3RJbmRleCA9IDA7XG4gICAgdmFyIG4gPSBkM190aW1lX251bWJlclJlLmV4ZWMoc3RyaW5nLnN1YnN0cmluZyhpLCBpICsgNCkpO1xuICAgIHJldHVybiBuID8gKGRhdGUueSA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cbiAgZnVuY3Rpb24gZDNfdGltZV9wYXJzZVllYXIoZGF0ZSwgc3RyaW5nLCBpKSB7XG4gICAgZDNfdGltZV9udW1iZXJSZS5sYXN0SW5kZXggPSAwO1xuICAgIHZhciBuID0gZDNfdGltZV9udW1iZXJSZS5leGVjKHN0cmluZy5zdWJzdHJpbmcoaSwgaSArIDIpKTtcbiAgICByZXR1cm4gbiA/IChkYXRlLnkgPSBkM190aW1lX2V4cGFuZFllYXIoK25bMF0pLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cbiAgZnVuY3Rpb24gZDNfdGltZV9wYXJzZVpvbmUoZGF0ZSwgc3RyaW5nLCBpKSB7XG4gICAgcmV0dXJuIC9eWystXVxcZHs0fSQvLnRlc3Qoc3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZyhpLCBpICsgNSkpID8gKGRhdGUuWiA9IC1zdHJpbmcsIFxuICAgIGkgKyA1KSA6IC0xO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RpbWVfZXhwYW5kWWVhcihkKSB7XG4gICAgcmV0dXJuIGQgKyAoZCA+IDY4ID8gMTkwMCA6IDJlMyk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfdGltZV9wYXJzZU1vbnRoTnVtYmVyKGRhdGUsIHN0cmluZywgaSkge1xuICAgIGQzX3RpbWVfbnVtYmVyUmUubGFzdEluZGV4ID0gMDtcbiAgICB2YXIgbiA9IGQzX3RpbWVfbnVtYmVyUmUuZXhlYyhzdHJpbmcuc3Vic3RyaW5nKGksIGkgKyAyKSk7XG4gICAgcmV0dXJuIG4gPyAoZGF0ZS5tID0gblswXSAtIDEsIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lX3BhcnNlRGF5KGRhdGUsIHN0cmluZywgaSkge1xuICAgIGQzX3RpbWVfbnVtYmVyUmUubGFzdEluZGV4ID0gMDtcbiAgICB2YXIgbiA9IGQzX3RpbWVfbnVtYmVyUmUuZXhlYyhzdHJpbmcuc3Vic3RyaW5nKGksIGkgKyAyKSk7XG4gICAgcmV0dXJuIG4gPyAoZGF0ZS5kID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lX3BhcnNlRGF5T2ZZZWFyKGRhdGUsIHN0cmluZywgaSkge1xuICAgIGQzX3RpbWVfbnVtYmVyUmUubGFzdEluZGV4ID0gMDtcbiAgICB2YXIgbiA9IGQzX3RpbWVfbnVtYmVyUmUuZXhlYyhzdHJpbmcuc3Vic3RyaW5nKGksIGkgKyAzKSk7XG4gICAgcmV0dXJuIG4gPyAoZGF0ZS5qID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lX3BhcnNlSG91cjI0KGRhdGUsIHN0cmluZywgaSkge1xuICAgIGQzX3RpbWVfbnVtYmVyUmUubGFzdEluZGV4ID0gMDtcbiAgICB2YXIgbiA9IGQzX3RpbWVfbnVtYmVyUmUuZXhlYyhzdHJpbmcuc3Vic3RyaW5nKGksIGkgKyAyKSk7XG4gICAgcmV0dXJuIG4gPyAoZGF0ZS5IID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lX3BhcnNlTWludXRlcyhkYXRlLCBzdHJpbmcsIGkpIHtcbiAgICBkM190aW1lX251bWJlclJlLmxhc3RJbmRleCA9IDA7XG4gICAgdmFyIG4gPSBkM190aW1lX251bWJlclJlLmV4ZWMoc3RyaW5nLnN1YnN0cmluZyhpLCBpICsgMikpO1xuICAgIHJldHVybiBuID8gKGRhdGUuTSA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cbiAgZnVuY3Rpb24gZDNfdGltZV9wYXJzZVNlY29uZHMoZGF0ZSwgc3RyaW5nLCBpKSB7XG4gICAgZDNfdGltZV9udW1iZXJSZS5sYXN0SW5kZXggPSAwO1xuICAgIHZhciBuID0gZDNfdGltZV9udW1iZXJSZS5leGVjKHN0cmluZy5zdWJzdHJpbmcoaSwgaSArIDIpKTtcbiAgICByZXR1cm4gbiA/IChkYXRlLlMgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RpbWVfcGFyc2VNaWxsaXNlY29uZHMoZGF0ZSwgc3RyaW5nLCBpKSB7XG4gICAgZDNfdGltZV9udW1iZXJSZS5sYXN0SW5kZXggPSAwO1xuICAgIHZhciBuID0gZDNfdGltZV9udW1iZXJSZS5leGVjKHN0cmluZy5zdWJzdHJpbmcoaSwgaSArIDMpKTtcbiAgICByZXR1cm4gbiA/IChkYXRlLkwgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RpbWVfem9uZShkKSB7XG4gICAgdmFyIHogPSBkLmdldFRpbWV6b25lT2Zmc2V0KCksIHpzID0geiA+IDAgPyBcIi1cIiA6IFwiK1wiLCB6aCA9IH5+KGFicyh6KSAvIDYwKSwgem0gPSBhYnMoeikgJSA2MDtcbiAgICByZXR1cm4genMgKyBkM190aW1lX2Zvcm1hdFBhZCh6aCwgXCIwXCIsIDIpICsgZDNfdGltZV9mb3JtYXRQYWQoem0sIFwiMFwiLCAyKTtcbiAgfVxuICBmdW5jdGlvbiBkM190aW1lX3BhcnNlTGl0ZXJhbFBlcmNlbnQoZGF0ZSwgc3RyaW5nLCBpKSB7XG4gICAgZDNfdGltZV9wZXJjZW50UmUubGFzdEluZGV4ID0gMDtcbiAgICB2YXIgbiA9IGQzX3RpbWVfcGVyY2VudFJlLmV4ZWMoc3RyaW5nLnN1YnN0cmluZyhpLCBpICsgMSkpO1xuICAgIHJldHVybiBuID8gaSArIG5bMF0ubGVuZ3RoIDogLTE7XG4gIH1cbiAgZnVuY3Rpb24gZDNfdGltZV9mb3JtYXRNdWx0aShmb3JtYXRzKSB7XG4gICAgdmFyIG4gPSBmb3JtYXRzLmxlbmd0aCwgaSA9IC0xO1xuICAgIHdoaWxlICgrK2kgPCBuKSBmb3JtYXRzW2ldWzBdID0gdGhpcyhmb3JtYXRzW2ldWzBdKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgdmFyIGkgPSAwLCBmID0gZm9ybWF0c1tpXTtcbiAgICAgIHdoaWxlICghZlsxXShkYXRlKSkgZiA9IGZvcm1hdHNbKytpXTtcbiAgICAgIHJldHVybiBmWzBdKGRhdGUpO1xuICAgIH07XG4gIH1cbiAgZDMubG9jYWxlID0gZnVuY3Rpb24obG9jYWxlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG51bWJlckZvcm1hdDogZDNfbG9jYWxlX251bWJlckZvcm1hdChsb2NhbGUpLFxuICAgICAgdGltZUZvcm1hdDogZDNfbG9jYWxlX3RpbWVGb3JtYXQobG9jYWxlKVxuICAgIH07XG4gIH07XG4gIHZhciBkM19sb2NhbGVfZW5VUyA9IGQzLmxvY2FsZSh7XG4gICAgZGVjaW1hbDogXCIuXCIsXG4gICAgdGhvdXNhbmRzOiBcIixcIixcbiAgICBncm91cGluZzogWyAzIF0sXG4gICAgY3VycmVuY3k6IFsgXCIkXCIsIFwiXCIgXSxcbiAgICBkYXRlVGltZTogXCIlYSAlYiAlZSAlWCAlWVwiLFxuICAgIGRhdGU6IFwiJW0vJWQvJVlcIixcbiAgICB0aW1lOiBcIiVIOiVNOiVTXCIsXG4gICAgcGVyaW9kczogWyBcIkFNXCIsIFwiUE1cIiBdLFxuICAgIGRheXM6IFsgXCJTdW5kYXlcIiwgXCJNb25kYXlcIiwgXCJUdWVzZGF5XCIsIFwiV2VkbmVzZGF5XCIsIFwiVGh1cnNkYXlcIiwgXCJGcmlkYXlcIiwgXCJTYXR1cmRheVwiIF0sXG4gICAgc2hvcnREYXlzOiBbIFwiU3VuXCIsIFwiTW9uXCIsIFwiVHVlXCIsIFwiV2VkXCIsIFwiVGh1XCIsIFwiRnJpXCIsIFwiU2F0XCIgXSxcbiAgICBtb250aHM6IFsgXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiIF0sXG4gICAgc2hvcnRNb250aHM6IFsgXCJKYW5cIiwgXCJGZWJcIiwgXCJNYXJcIiwgXCJBcHJcIiwgXCJNYXlcIiwgXCJKdW5cIiwgXCJKdWxcIiwgXCJBdWdcIiwgXCJTZXBcIiwgXCJPY3RcIiwgXCJOb3ZcIiwgXCJEZWNcIiBdXG4gIH0pO1xuICBkMy5mb3JtYXQgPSBkM19sb2NhbGVfZW5VUy5udW1iZXJGb3JtYXQ7XG4gIGQzLmdlbyA9IHt9O1xuICBmdW5jdGlvbiBkM19hZGRlcigpIHt9XG4gIGQzX2FkZGVyLnByb3RvdHlwZSA9IHtcbiAgICBzOiAwLFxuICAgIHQ6IDAsXG4gICAgYWRkOiBmdW5jdGlvbih5KSB7XG4gICAgICBkM19hZGRlclN1bSh5LCB0aGlzLnQsIGQzX2FkZGVyVGVtcCk7XG4gICAgICBkM19hZGRlclN1bShkM19hZGRlclRlbXAucywgdGhpcy5zLCB0aGlzKTtcbiAgICAgIGlmICh0aGlzLnMpIHRoaXMudCArPSBkM19hZGRlclRlbXAudDsgZWxzZSB0aGlzLnMgPSBkM19hZGRlclRlbXAudDtcbiAgICB9LFxuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMucyA9IHRoaXMudCA9IDA7XG4gICAgfSxcbiAgICB2YWx1ZU9mOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLnM7XG4gICAgfVxuICB9O1xuICB2YXIgZDNfYWRkZXJUZW1wID0gbmV3IGQzX2FkZGVyKCk7XG4gIGZ1bmN0aW9uIGQzX2FkZGVyU3VtKGEsIGIsIG8pIHtcbiAgICB2YXIgeCA9IG8ucyA9IGEgKyBiLCBidiA9IHggLSBhLCBhdiA9IHggLSBidjtcbiAgICBvLnQgPSBhIC0gYXYgKyAoYiAtIGJ2KTtcbiAgfVxuICBkMy5nZW8uc3RyZWFtID0gZnVuY3Rpb24ob2JqZWN0LCBsaXN0ZW5lcikge1xuICAgIGlmIChvYmplY3QgJiYgZDNfZ2VvX3N0cmVhbU9iamVjdFR5cGUuaGFzT3duUHJvcGVydHkob2JqZWN0LnR5cGUpKSB7XG4gICAgICBkM19nZW9fc3RyZWFtT2JqZWN0VHlwZVtvYmplY3QudHlwZV0ob2JqZWN0LCBsaXN0ZW5lcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGQzX2dlb19zdHJlYW1HZW9tZXRyeShvYmplY3QsIGxpc3RlbmVyKTtcbiAgICB9XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2dlb19zdHJlYW1HZW9tZXRyeShnZW9tZXRyeSwgbGlzdGVuZXIpIHtcbiAgICBpZiAoZ2VvbWV0cnkgJiYgZDNfZ2VvX3N0cmVhbUdlb21ldHJ5VHlwZS5oYXNPd25Qcm9wZXJ0eShnZW9tZXRyeS50eXBlKSkge1xuICAgICAgZDNfZ2VvX3N0cmVhbUdlb21ldHJ5VHlwZVtnZW9tZXRyeS50eXBlXShnZW9tZXRyeSwgbGlzdGVuZXIpO1xuICAgIH1cbiAgfVxuICB2YXIgZDNfZ2VvX3N0cmVhbU9iamVjdFR5cGUgPSB7XG4gICAgRmVhdHVyZTogZnVuY3Rpb24oZmVhdHVyZSwgbGlzdGVuZXIpIHtcbiAgICAgIGQzX2dlb19zdHJlYW1HZW9tZXRyeShmZWF0dXJlLmdlb21ldHJ5LCBsaXN0ZW5lcik7XG4gICAgfSxcbiAgICBGZWF0dXJlQ29sbGVjdGlvbjogZnVuY3Rpb24ob2JqZWN0LCBsaXN0ZW5lcikge1xuICAgICAgdmFyIGZlYXR1cmVzID0gb2JqZWN0LmZlYXR1cmVzLCBpID0gLTEsIG4gPSBmZWF0dXJlcy5sZW5ndGg7XG4gICAgICB3aGlsZSAoKytpIDwgbikgZDNfZ2VvX3N0cmVhbUdlb21ldHJ5KGZlYXR1cmVzW2ldLmdlb21ldHJ5LCBsaXN0ZW5lcik7XG4gICAgfVxuICB9O1xuICB2YXIgZDNfZ2VvX3N0cmVhbUdlb21ldHJ5VHlwZSA9IHtcbiAgICBTcGhlcmU6IGZ1bmN0aW9uKG9iamVjdCwgbGlzdGVuZXIpIHtcbiAgICAgIGxpc3RlbmVyLnNwaGVyZSgpO1xuICAgIH0sXG4gICAgUG9pbnQ6IGZ1bmN0aW9uKG9iamVjdCwgbGlzdGVuZXIpIHtcbiAgICAgIG9iamVjdCA9IG9iamVjdC5jb29yZGluYXRlcztcbiAgICAgIGxpc3RlbmVyLnBvaW50KG9iamVjdFswXSwgb2JqZWN0WzFdLCBvYmplY3RbMl0pO1xuICAgIH0sXG4gICAgTXVsdGlQb2ludDogZnVuY3Rpb24ob2JqZWN0LCBsaXN0ZW5lcikge1xuICAgICAgdmFyIGNvb3JkaW5hdGVzID0gb2JqZWN0LmNvb3JkaW5hdGVzLCBpID0gLTEsIG4gPSBjb29yZGluYXRlcy5sZW5ndGg7XG4gICAgICB3aGlsZSAoKytpIDwgbikgb2JqZWN0ID0gY29vcmRpbmF0ZXNbaV0sIGxpc3RlbmVyLnBvaW50KG9iamVjdFswXSwgb2JqZWN0WzFdLCBvYmplY3RbMl0pO1xuICAgIH0sXG4gICAgTGluZVN0cmluZzogZnVuY3Rpb24ob2JqZWN0LCBsaXN0ZW5lcikge1xuICAgICAgZDNfZ2VvX3N0cmVhbUxpbmUob2JqZWN0LmNvb3JkaW5hdGVzLCBsaXN0ZW5lciwgMCk7XG4gICAgfSxcbiAgICBNdWx0aUxpbmVTdHJpbmc6IGZ1bmN0aW9uKG9iamVjdCwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBjb29yZGluYXRlcyA9IG9iamVjdC5jb29yZGluYXRlcywgaSA9IC0xLCBuID0gY29vcmRpbmF0ZXMubGVuZ3RoO1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGQzX2dlb19zdHJlYW1MaW5lKGNvb3JkaW5hdGVzW2ldLCBsaXN0ZW5lciwgMCk7XG4gICAgfSxcbiAgICBQb2x5Z29uOiBmdW5jdGlvbihvYmplY3QsIGxpc3RlbmVyKSB7XG4gICAgICBkM19nZW9fc3RyZWFtUG9seWdvbihvYmplY3QuY29vcmRpbmF0ZXMsIGxpc3RlbmVyKTtcbiAgICB9LFxuICAgIE11bHRpUG9seWdvbjogZnVuY3Rpb24ob2JqZWN0LCBsaXN0ZW5lcikge1xuICAgICAgdmFyIGNvb3JkaW5hdGVzID0gb2JqZWN0LmNvb3JkaW5hdGVzLCBpID0gLTEsIG4gPSBjb29yZGluYXRlcy5sZW5ndGg7XG4gICAgICB3aGlsZSAoKytpIDwgbikgZDNfZ2VvX3N0cmVhbVBvbHlnb24oY29vcmRpbmF0ZXNbaV0sIGxpc3RlbmVyKTtcbiAgICB9LFxuICAgIEdlb21ldHJ5Q29sbGVjdGlvbjogZnVuY3Rpb24ob2JqZWN0LCBsaXN0ZW5lcikge1xuICAgICAgdmFyIGdlb21ldHJpZXMgPSBvYmplY3QuZ2VvbWV0cmllcywgaSA9IC0xLCBuID0gZ2VvbWV0cmllcy5sZW5ndGg7XG4gICAgICB3aGlsZSAoKytpIDwgbikgZDNfZ2VvX3N0cmVhbUdlb21ldHJ5KGdlb21ldHJpZXNbaV0sIGxpc3RlbmVyKTtcbiAgICB9XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2dlb19zdHJlYW1MaW5lKGNvb3JkaW5hdGVzLCBsaXN0ZW5lciwgY2xvc2VkKSB7XG4gICAgdmFyIGkgPSAtMSwgbiA9IGNvb3JkaW5hdGVzLmxlbmd0aCAtIGNsb3NlZCwgY29vcmRpbmF0ZTtcbiAgICBsaXN0ZW5lci5saW5lU3RhcnQoKTtcbiAgICB3aGlsZSAoKytpIDwgbikgY29vcmRpbmF0ZSA9IGNvb3JkaW5hdGVzW2ldLCBsaXN0ZW5lci5wb2ludChjb29yZGluYXRlWzBdLCBjb29yZGluYXRlWzFdLCBjb29yZGluYXRlWzJdKTtcbiAgICBsaXN0ZW5lci5saW5lRW5kKCk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX3N0cmVhbVBvbHlnb24oY29vcmRpbmF0ZXMsIGxpc3RlbmVyKSB7XG4gICAgdmFyIGkgPSAtMSwgbiA9IGNvb3JkaW5hdGVzLmxlbmd0aDtcbiAgICBsaXN0ZW5lci5wb2x5Z29uU3RhcnQoKTtcbiAgICB3aGlsZSAoKytpIDwgbikgZDNfZ2VvX3N0cmVhbUxpbmUoY29vcmRpbmF0ZXNbaV0sIGxpc3RlbmVyLCAxKTtcbiAgICBsaXN0ZW5lci5wb2x5Z29uRW5kKCk7XG4gIH1cbiAgZDMuZ2VvLmFyZWEgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICBkM19nZW9fYXJlYVN1bSA9IDA7XG4gICAgZDMuZ2VvLnN0cmVhbShvYmplY3QsIGQzX2dlb19hcmVhKTtcbiAgICByZXR1cm4gZDNfZ2VvX2FyZWFTdW07XG4gIH07XG4gIHZhciBkM19nZW9fYXJlYVN1bSwgZDNfZ2VvX2FyZWFSaW5nU3VtID0gbmV3IGQzX2FkZGVyKCk7XG4gIHZhciBkM19nZW9fYXJlYSA9IHtcbiAgICBzcGhlcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgZDNfZ2VvX2FyZWFTdW0gKz0gNCAqIM+AO1xuICAgIH0sXG4gICAgcG9pbnQ6IGQzX25vb3AsXG4gICAgbGluZVN0YXJ0OiBkM19ub29wLFxuICAgIGxpbmVFbmQ6IGQzX25vb3AsXG4gICAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGQzX2dlb19hcmVhUmluZ1N1bS5yZXNldCgpO1xuICAgICAgZDNfZ2VvX2FyZWEubGluZVN0YXJ0ID0gZDNfZ2VvX2FyZWFSaW5nU3RhcnQ7XG4gICAgfSxcbiAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBhcmVhID0gMiAqIGQzX2dlb19hcmVhUmluZ1N1bTtcbiAgICAgIGQzX2dlb19hcmVhU3VtICs9IGFyZWEgPCAwID8gNCAqIM+AICsgYXJlYSA6IGFyZWE7XG4gICAgICBkM19nZW9fYXJlYS5saW5lU3RhcnQgPSBkM19nZW9fYXJlYS5saW5lRW5kID0gZDNfZ2VvX2FyZWEucG9pbnQgPSBkM19ub29wO1xuICAgIH1cbiAgfTtcbiAgZnVuY3Rpb24gZDNfZ2VvX2FyZWFSaW5nU3RhcnQoKSB7XG4gICAgdmFyIM67MDAsIM+GMDAsIM67MCwgY29zz4YwLCBzaW7PhjA7XG4gICAgZDNfZ2VvX2FyZWEucG9pbnQgPSBmdW5jdGlvbijOuywgz4YpIHtcbiAgICAgIGQzX2dlb19hcmVhLnBvaW50ID0gbmV4dFBvaW50O1xuICAgICAgzrswID0gKM67MDAgPSDOuykgKiBkM19yYWRpYW5zLCBjb3PPhjAgPSBNYXRoLmNvcyjPhiA9ICjPhjAwID0gz4YpICogZDNfcmFkaWFucyAvIDIgKyDPgCAvIDQpLCBcbiAgICAgIHNpbs+GMCA9IE1hdGguc2luKM+GKTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIG5leHRQb2ludCjOuywgz4YpIHtcbiAgICAgIM67ICo9IGQzX3JhZGlhbnM7XG4gICAgICDPhiA9IM+GICogZDNfcmFkaWFucyAvIDIgKyDPgCAvIDQ7XG4gICAgICB2YXIgZM67ID0gzrsgLSDOuzAsIHNkzrsgPSBkzrsgPj0gMCA/IDEgOiAtMSwgYWTOuyA9IHNkzrsgKiBkzrssIGNvc8+GID0gTWF0aC5jb3Moz4YpLCBzaW7PhiA9IE1hdGguc2luKM+GKSwgayA9IHNpbs+GMCAqIHNpbs+GLCB1ID0gY29zz4YwICogY29zz4YgKyBrICogTWF0aC5jb3MoYWTOuyksIHYgPSBrICogc2TOuyAqIE1hdGguc2luKGFkzrspO1xuICAgICAgZDNfZ2VvX2FyZWFSaW5nU3VtLmFkZChNYXRoLmF0YW4yKHYsIHUpKTtcbiAgICAgIM67MCA9IM67LCBjb3PPhjAgPSBjb3PPhiwgc2luz4YwID0gc2luz4Y7XG4gICAgfVxuICAgIGQzX2dlb19hcmVhLmxpbmVFbmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIG5leHRQb2ludCjOuzAwLCDPhjAwKTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19jYXJ0ZXNpYW4oc3BoZXJpY2FsKSB7XG4gICAgdmFyIM67ID0gc3BoZXJpY2FsWzBdLCDPhiA9IHNwaGVyaWNhbFsxXSwgY29zz4YgPSBNYXRoLmNvcyjPhik7XG4gICAgcmV0dXJuIFsgY29zz4YgKiBNYXRoLmNvcyjOuyksIGNvc8+GICogTWF0aC5zaW4ozrspLCBNYXRoLnNpbijPhikgXTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY2FydGVzaWFuRG90KGEsIGIpIHtcbiAgICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19jYXJ0ZXNpYW5Dcm9zcyhhLCBiKSB7XG4gICAgcmV0dXJuIFsgYVsxXSAqIGJbMl0gLSBhWzJdICogYlsxXSwgYVsyXSAqIGJbMF0gLSBhWzBdICogYlsyXSwgYVswXSAqIGJbMV0gLSBhWzFdICogYlswXSBdO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19jYXJ0ZXNpYW5BZGQoYSwgYikge1xuICAgIGFbMF0gKz0gYlswXTtcbiAgICBhWzFdICs9IGJbMV07XG4gICAgYVsyXSArPSBiWzJdO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19jYXJ0ZXNpYW5TY2FsZSh2ZWN0b3IsIGspIHtcbiAgICByZXR1cm4gWyB2ZWN0b3JbMF0gKiBrLCB2ZWN0b3JbMV0gKiBrLCB2ZWN0b3JbMl0gKiBrIF07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2NhcnRlc2lhbk5vcm1hbGl6ZShkKSB7XG4gICAgdmFyIGwgPSBNYXRoLnNxcnQoZFswXSAqIGRbMF0gKyBkWzFdICogZFsxXSArIGRbMl0gKiBkWzJdKTtcbiAgICBkWzBdIC89IGw7XG4gICAgZFsxXSAvPSBsO1xuICAgIGRbMl0gLz0gbDtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fc3BoZXJpY2FsKGNhcnRlc2lhbikge1xuICAgIHJldHVybiBbIE1hdGguYXRhbjIoY2FydGVzaWFuWzFdLCBjYXJ0ZXNpYW5bMF0pLCBkM19hc2luKGNhcnRlc2lhblsyXSkgXTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fc3BoZXJpY2FsRXF1YWwoYSwgYikge1xuICAgIHJldHVybiBhYnMoYVswXSAtIGJbMF0pIDwgzrUgJiYgYWJzKGFbMV0gLSBiWzFdKSA8IM61O1xuICB9XG4gIGQzLmdlby5ib3VuZHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgzrswLCDPhjAsIM67MSwgz4YxLCDOu18sIM67X18sIM+GX18sIHAwLCBkzrtTdW0sIHJhbmdlcywgcmFuZ2U7XG4gICAgdmFyIGJvdW5kID0ge1xuICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgbGluZVN0YXJ0OiBsaW5lU3RhcnQsXG4gICAgICBsaW5lRW5kOiBsaW5lRW5kLFxuICAgICAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgYm91bmQucG9pbnQgPSByaW5nUG9pbnQ7XG4gICAgICAgIGJvdW5kLmxpbmVTdGFydCA9IHJpbmdTdGFydDtcbiAgICAgICAgYm91bmQubGluZUVuZCA9IHJpbmdFbmQ7XG4gICAgICAgIGTOu1N1bSA9IDA7XG4gICAgICAgIGQzX2dlb19hcmVhLnBvbHlnb25TdGFydCgpO1xuICAgICAgfSxcbiAgICAgIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBkM19nZW9fYXJlYS5wb2x5Z29uRW5kKCk7XG4gICAgICAgIGJvdW5kLnBvaW50ID0gcG9pbnQ7XG4gICAgICAgIGJvdW5kLmxpbmVTdGFydCA9IGxpbmVTdGFydDtcbiAgICAgICAgYm91bmQubGluZUVuZCA9IGxpbmVFbmQ7XG4gICAgICAgIGlmIChkM19nZW9fYXJlYVJpbmdTdW0gPCAwKSDOuzAgPSAtKM67MSA9IDE4MCksIM+GMCA9IC0oz4YxID0gOTApOyBlbHNlIGlmIChkzrtTdW0gPiDOtSkgz4YxID0gOTA7IGVsc2UgaWYgKGTOu1N1bSA8IC3OtSkgz4YwID0gLTkwO1xuICAgICAgICByYW5nZVswXSA9IM67MCwgcmFuZ2VbMV0gPSDOuzE7XG4gICAgICB9XG4gICAgfTtcbiAgICBmdW5jdGlvbiBwb2ludCjOuywgz4YpIHtcbiAgICAgIHJhbmdlcy5wdXNoKHJhbmdlID0gWyDOuzAgPSDOuywgzrsxID0gzrsgXSk7XG4gICAgICBpZiAoz4YgPCDPhjApIM+GMCA9IM+GO1xuICAgICAgaWYgKM+GID4gz4YxKSDPhjEgPSDPhjtcbiAgICB9XG4gICAgZnVuY3Rpb24gbGluZVBvaW50KM67LCDPhikge1xuICAgICAgdmFyIHAgPSBkM19nZW9fY2FydGVzaWFuKFsgzrsgKiBkM19yYWRpYW5zLCDPhiAqIGQzX3JhZGlhbnMgXSk7XG4gICAgICBpZiAocDApIHtcbiAgICAgICAgdmFyIG5vcm1hbCA9IGQzX2dlb19jYXJ0ZXNpYW5Dcm9zcyhwMCwgcCksIGVxdWF0b3JpYWwgPSBbIG5vcm1hbFsxXSwgLW5vcm1hbFswXSwgMCBdLCBpbmZsZWN0aW9uID0gZDNfZ2VvX2NhcnRlc2lhbkNyb3NzKGVxdWF0b3JpYWwsIG5vcm1hbCk7XG4gICAgICAgIGQzX2dlb19jYXJ0ZXNpYW5Ob3JtYWxpemUoaW5mbGVjdGlvbik7XG4gICAgICAgIGluZmxlY3Rpb24gPSBkM19nZW9fc3BoZXJpY2FsKGluZmxlY3Rpb24pO1xuICAgICAgICB2YXIgZM67ID0gzrsgLSDOu18sIHMgPSBkzrsgPiAwID8gMSA6IC0xLCDOu2kgPSBpbmZsZWN0aW9uWzBdICogZDNfZGVncmVlcyAqIHMsIGFudGltZXJpZGlhbiA9IGFicyhkzrspID4gMTgwO1xuICAgICAgICBpZiAoYW50aW1lcmlkaWFuIF4gKHMgKiDOu18gPCDOu2kgJiYgzrtpIDwgcyAqIM67KSkge1xuICAgICAgICAgIHZhciDPhmkgPSBpbmZsZWN0aW9uWzFdICogZDNfZGVncmVlcztcbiAgICAgICAgICBpZiAoz4ZpID4gz4YxKSDPhjEgPSDPhmk7XG4gICAgICAgIH0gZWxzZSBpZiAozrtpID0gKM67aSArIDM2MCkgJSAzNjAgLSAxODAsIGFudGltZXJpZGlhbiBeIChzICogzrtfIDwgzrtpICYmIM67aSA8IHMgKiDOuykpIHtcbiAgICAgICAgICB2YXIgz4ZpID0gLWluZmxlY3Rpb25bMV0gKiBkM19kZWdyZWVzO1xuICAgICAgICAgIGlmICjPhmkgPCDPhjApIM+GMCA9IM+GaTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoz4YgPCDPhjApIM+GMCA9IM+GO1xuICAgICAgICAgIGlmICjPhiA+IM+GMSkgz4YxID0gz4Y7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGFudGltZXJpZGlhbikge1xuICAgICAgICAgIGlmICjOuyA8IM67Xykge1xuICAgICAgICAgICAgaWYgKGFuZ2xlKM67MCwgzrspID4gYW5nbGUozrswLCDOuzEpKSDOuzEgPSDOuztcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGFuZ2xlKM67LCDOuzEpID4gYW5nbGUozrswLCDOuzEpKSDOuzAgPSDOuztcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKM67MSA+PSDOuzApIHtcbiAgICAgICAgICAgIGlmICjOuyA8IM67MCkgzrswID0gzrs7XG4gICAgICAgICAgICBpZiAozrsgPiDOuzEpIM67MSA9IM67O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAozrsgPiDOu18pIHtcbiAgICAgICAgICAgICAgaWYgKGFuZ2xlKM67MCwgzrspID4gYW5nbGUozrswLCDOuzEpKSDOuzEgPSDOuztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChhbmdsZSjOuywgzrsxKSA+IGFuZ2xlKM67MCwgzrsxKSkgzrswID0gzrs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwb2ludCjOuywgz4YpO1xuICAgICAgfVxuICAgICAgcDAgPSBwLCDOu18gPSDOuztcbiAgICB9XG4gICAgZnVuY3Rpb24gbGluZVN0YXJ0KCkge1xuICAgICAgYm91bmQucG9pbnQgPSBsaW5lUG9pbnQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGxpbmVFbmQoKSB7XG4gICAgICByYW5nZVswXSA9IM67MCwgcmFuZ2VbMV0gPSDOuzE7XG4gICAgICBib3VuZC5wb2ludCA9IHBvaW50O1xuICAgICAgcDAgPSBudWxsO1xuICAgIH1cbiAgICBmdW5jdGlvbiByaW5nUG9pbnQozrssIM+GKSB7XG4gICAgICBpZiAocDApIHtcbiAgICAgICAgdmFyIGTOuyA9IM67IC0gzrtfO1xuICAgICAgICBkzrtTdW0gKz0gYWJzKGTOuykgPiAxODAgPyBkzrsgKyAoZM67ID4gMCA/IDM2MCA6IC0zNjApIDogZM67O1xuICAgICAgfSBlbHNlIM67X18gPSDOuywgz4ZfXyA9IM+GO1xuICAgICAgZDNfZ2VvX2FyZWEucG9pbnQozrssIM+GKTtcbiAgICAgIGxpbmVQb2ludCjOuywgz4YpO1xuICAgIH1cbiAgICBmdW5jdGlvbiByaW5nU3RhcnQoKSB7XG4gICAgICBkM19nZW9fYXJlYS5saW5lU3RhcnQoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmluZ0VuZCgpIHtcbiAgICAgIHJpbmdQb2ludCjOu19fLCDPhl9fKTtcbiAgICAgIGQzX2dlb19hcmVhLmxpbmVFbmQoKTtcbiAgICAgIGlmIChhYnMoZM67U3VtKSA+IM61KSDOuzAgPSAtKM67MSA9IDE4MCk7XG4gICAgICByYW5nZVswXSA9IM67MCwgcmFuZ2VbMV0gPSDOuzE7XG4gICAgICBwMCA9IG51bGw7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGFuZ2xlKM67MCwgzrsxKSB7XG4gICAgICByZXR1cm4gKM67MSAtPSDOuzApIDwgMCA/IM67MSArIDM2MCA6IM67MTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29tcGFyZVJhbmdlcyhhLCBiKSB7XG4gICAgICByZXR1cm4gYVswXSAtIGJbMF07XG4gICAgfVxuICAgIGZ1bmN0aW9uIHdpdGhpblJhbmdlKHgsIHJhbmdlKSB7XG4gICAgICByZXR1cm4gcmFuZ2VbMF0gPD0gcmFuZ2VbMV0gPyByYW5nZVswXSA8PSB4ICYmIHggPD0gcmFuZ2VbMV0gOiB4IDwgcmFuZ2VbMF0gfHwgcmFuZ2VbMV0gPCB4O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24oZmVhdHVyZSkge1xuICAgICAgz4YxID0gzrsxID0gLSjOuzAgPSDPhjAgPSBJbmZpbml0eSk7XG4gICAgICByYW5nZXMgPSBbXTtcbiAgICAgIGQzLmdlby5zdHJlYW0oZmVhdHVyZSwgYm91bmQpO1xuICAgICAgdmFyIG4gPSByYW5nZXMubGVuZ3RoO1xuICAgICAgaWYgKG4pIHtcbiAgICAgICAgcmFuZ2VzLnNvcnQoY29tcGFyZVJhbmdlcyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAxLCBhID0gcmFuZ2VzWzBdLCBiLCBtZXJnZWQgPSBbIGEgXTsgaSA8IG47ICsraSkge1xuICAgICAgICAgIGIgPSByYW5nZXNbaV07XG4gICAgICAgICAgaWYgKHdpdGhpblJhbmdlKGJbMF0sIGEpIHx8IHdpdGhpblJhbmdlKGJbMV0sIGEpKSB7XG4gICAgICAgICAgICBpZiAoYW5nbGUoYVswXSwgYlsxXSkgPiBhbmdsZShhWzBdLCBhWzFdKSkgYVsxXSA9IGJbMV07XG4gICAgICAgICAgICBpZiAoYW5nbGUoYlswXSwgYVsxXSkgPiBhbmdsZShhWzBdLCBhWzFdKSkgYVswXSA9IGJbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lcmdlZC5wdXNoKGEgPSBiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGJlc3QgPSAtSW5maW5pdHksIGTOuztcbiAgICAgICAgZm9yICh2YXIgbiA9IG1lcmdlZC5sZW5ndGggLSAxLCBpID0gMCwgYSA9IG1lcmdlZFtuXSwgYjsgaSA8PSBuOyBhID0gYiwgKytpKSB7XG4gICAgICAgICAgYiA9IG1lcmdlZFtpXTtcbiAgICAgICAgICBpZiAoKGTOuyA9IGFuZ2xlKGFbMV0sIGJbMF0pKSA+IGJlc3QpIGJlc3QgPSBkzrssIM67MCA9IGJbMF0sIM67MSA9IGFbMV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJhbmdlcyA9IHJhbmdlID0gbnVsbDtcbiAgICAgIHJldHVybiDOuzAgPT09IEluZmluaXR5IHx8IM+GMCA9PT0gSW5maW5pdHkgPyBbIFsgTmFOLCBOYU4gXSwgWyBOYU4sIE5hTiBdIF0gOiBbIFsgzrswLCDPhjAgXSwgWyDOuzEsIM+GMSBdIF07XG4gICAgfTtcbiAgfSgpO1xuICBkMy5nZW8uY2VudHJvaWQgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICBkM19nZW9fY2VudHJvaWRXMCA9IGQzX2dlb19jZW50cm9pZFcxID0gZDNfZ2VvX2NlbnRyb2lkWDAgPSBkM19nZW9fY2VudHJvaWRZMCA9IGQzX2dlb19jZW50cm9pZFowID0gZDNfZ2VvX2NlbnRyb2lkWDEgPSBkM19nZW9fY2VudHJvaWRZMSA9IGQzX2dlb19jZW50cm9pZFoxID0gZDNfZ2VvX2NlbnRyb2lkWDIgPSBkM19nZW9fY2VudHJvaWRZMiA9IGQzX2dlb19jZW50cm9pZFoyID0gMDtcbiAgICBkMy5nZW8uc3RyZWFtKG9iamVjdCwgZDNfZ2VvX2NlbnRyb2lkKTtcbiAgICB2YXIgeCA9IGQzX2dlb19jZW50cm9pZFgyLCB5ID0gZDNfZ2VvX2NlbnRyb2lkWTIsIHogPSBkM19nZW9fY2VudHJvaWRaMiwgbSA9IHggKiB4ICsgeSAqIHkgKyB6ICogejtcbiAgICBpZiAobSA8IM61Mikge1xuICAgICAgeCA9IGQzX2dlb19jZW50cm9pZFgxLCB5ID0gZDNfZ2VvX2NlbnRyb2lkWTEsIHogPSBkM19nZW9fY2VudHJvaWRaMTtcbiAgICAgIGlmIChkM19nZW9fY2VudHJvaWRXMSA8IM61KSB4ID0gZDNfZ2VvX2NlbnRyb2lkWDAsIHkgPSBkM19nZW9fY2VudHJvaWRZMCwgeiA9IGQzX2dlb19jZW50cm9pZFowO1xuICAgICAgbSA9IHggKiB4ICsgeSAqIHkgKyB6ICogejtcbiAgICAgIGlmIChtIDwgzrUyKSByZXR1cm4gWyBOYU4sIE5hTiBdO1xuICAgIH1cbiAgICByZXR1cm4gWyBNYXRoLmF0YW4yKHksIHgpICogZDNfZGVncmVlcywgZDNfYXNpbih6IC8gTWF0aC5zcXJ0KG0pKSAqIGQzX2RlZ3JlZXMgXTtcbiAgfTtcbiAgdmFyIGQzX2dlb19jZW50cm9pZFcwLCBkM19nZW9fY2VudHJvaWRXMSwgZDNfZ2VvX2NlbnRyb2lkWDAsIGQzX2dlb19jZW50cm9pZFkwLCBkM19nZW9fY2VudHJvaWRaMCwgZDNfZ2VvX2NlbnRyb2lkWDEsIGQzX2dlb19jZW50cm9pZFkxLCBkM19nZW9fY2VudHJvaWRaMSwgZDNfZ2VvX2NlbnRyb2lkWDIsIGQzX2dlb19jZW50cm9pZFkyLCBkM19nZW9fY2VudHJvaWRaMjtcbiAgdmFyIGQzX2dlb19jZW50cm9pZCA9IHtcbiAgICBzcGhlcmU6IGQzX25vb3AsXG4gICAgcG9pbnQ6IGQzX2dlb19jZW50cm9pZFBvaW50LFxuICAgIGxpbmVTdGFydDogZDNfZ2VvX2NlbnRyb2lkTGluZVN0YXJ0LFxuICAgIGxpbmVFbmQ6IGQzX2dlb19jZW50cm9pZExpbmVFbmQsXG4gICAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGQzX2dlb19jZW50cm9pZC5saW5lU3RhcnQgPSBkM19nZW9fY2VudHJvaWRSaW5nU3RhcnQ7XG4gICAgfSxcbiAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgIGQzX2dlb19jZW50cm9pZC5saW5lU3RhcnQgPSBkM19nZW9fY2VudHJvaWRMaW5lU3RhcnQ7XG4gICAgfVxuICB9O1xuICBmdW5jdGlvbiBkM19nZW9fY2VudHJvaWRQb2ludCjOuywgz4YpIHtcbiAgICDOuyAqPSBkM19yYWRpYW5zO1xuICAgIHZhciBjb3PPhiA9IE1hdGguY29zKM+GICo9IGQzX3JhZGlhbnMpO1xuICAgIGQzX2dlb19jZW50cm9pZFBvaW50WFlaKGNvc8+GICogTWF0aC5jb3MozrspLCBjb3PPhiAqIE1hdGguc2luKM67KSwgTWF0aC5zaW4oz4YpKTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY2VudHJvaWRQb2ludFhZWih4LCB5LCB6KSB7XG4gICAgKytkM19nZW9fY2VudHJvaWRXMDtcbiAgICBkM19nZW9fY2VudHJvaWRYMCArPSAoeCAtIGQzX2dlb19jZW50cm9pZFgwKSAvIGQzX2dlb19jZW50cm9pZFcwO1xuICAgIGQzX2dlb19jZW50cm9pZFkwICs9ICh5IC0gZDNfZ2VvX2NlbnRyb2lkWTApIC8gZDNfZ2VvX2NlbnRyb2lkVzA7XG4gICAgZDNfZ2VvX2NlbnRyb2lkWjAgKz0gKHogLSBkM19nZW9fY2VudHJvaWRaMCkgLyBkM19nZW9fY2VudHJvaWRXMDtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY2VudHJvaWRMaW5lU3RhcnQoKSB7XG4gICAgdmFyIHgwLCB5MCwgejA7XG4gICAgZDNfZ2VvX2NlbnRyb2lkLnBvaW50ID0gZnVuY3Rpb24ozrssIM+GKSB7XG4gICAgICDOuyAqPSBkM19yYWRpYW5zO1xuICAgICAgdmFyIGNvc8+GID0gTWF0aC5jb3Moz4YgKj0gZDNfcmFkaWFucyk7XG4gICAgICB4MCA9IGNvc8+GICogTWF0aC5jb3MozrspO1xuICAgICAgeTAgPSBjb3PPhiAqIE1hdGguc2luKM67KTtcbiAgICAgIHowID0gTWF0aC5zaW4oz4YpO1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkLnBvaW50ID0gbmV4dFBvaW50O1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkUG9pbnRYWVooeDAsIHkwLCB6MCk7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBuZXh0UG9pbnQozrssIM+GKSB7XG4gICAgICDOuyAqPSBkM19yYWRpYW5zO1xuICAgICAgdmFyIGNvc8+GID0gTWF0aC5jb3Moz4YgKj0gZDNfcmFkaWFucyksIHggPSBjb3PPhiAqIE1hdGguY29zKM67KSwgeSA9IGNvc8+GICogTWF0aC5zaW4ozrspLCB6ID0gTWF0aC5zaW4oz4YpLCB3ID0gTWF0aC5hdGFuMihNYXRoLnNxcnQoKHcgPSB5MCAqIHogLSB6MCAqIHkpICogdyArICh3ID0gejAgKiB4IC0geDAgKiB6KSAqIHcgKyAodyA9IHgwICogeSAtIHkwICogeCkgKiB3KSwgeDAgKiB4ICsgeTAgKiB5ICsgejAgKiB6KTtcbiAgICAgIGQzX2dlb19jZW50cm9pZFcxICs9IHc7XG4gICAgICBkM19nZW9fY2VudHJvaWRYMSArPSB3ICogKHgwICsgKHgwID0geCkpO1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkWTEgKz0gdyAqICh5MCArICh5MCA9IHkpKTtcbiAgICAgIGQzX2dlb19jZW50cm9pZFoxICs9IHcgKiAoejAgKyAoejAgPSB6KSk7XG4gICAgICBkM19nZW9fY2VudHJvaWRQb2ludFhZWih4MCwgeTAsIHowKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2NlbnRyb2lkTGluZUVuZCgpIHtcbiAgICBkM19nZW9fY2VudHJvaWQucG9pbnQgPSBkM19nZW9fY2VudHJvaWRQb2ludDtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY2VudHJvaWRSaW5nU3RhcnQoKSB7XG4gICAgdmFyIM67MDAsIM+GMDAsIHgwLCB5MCwgejA7XG4gICAgZDNfZ2VvX2NlbnRyb2lkLnBvaW50ID0gZnVuY3Rpb24ozrssIM+GKSB7XG4gICAgICDOuzAwID0gzrssIM+GMDAgPSDPhjtcbiAgICAgIGQzX2dlb19jZW50cm9pZC5wb2ludCA9IG5leHRQb2ludDtcbiAgICAgIM67ICo9IGQzX3JhZGlhbnM7XG4gICAgICB2YXIgY29zz4YgPSBNYXRoLmNvcyjPhiAqPSBkM19yYWRpYW5zKTtcbiAgICAgIHgwID0gY29zz4YgKiBNYXRoLmNvcyjOuyk7XG4gICAgICB5MCA9IGNvc8+GICogTWF0aC5zaW4ozrspO1xuICAgICAgejAgPSBNYXRoLnNpbijPhik7XG4gICAgICBkM19nZW9fY2VudHJvaWRQb2ludFhZWih4MCwgeTAsIHowKTtcbiAgICB9O1xuICAgIGQzX2dlb19jZW50cm9pZC5saW5lRW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICBuZXh0UG9pbnQozrswMCwgz4YwMCk7XG4gICAgICBkM19nZW9fY2VudHJvaWQubGluZUVuZCA9IGQzX2dlb19jZW50cm9pZExpbmVFbmQ7XG4gICAgICBkM19nZW9fY2VudHJvaWQucG9pbnQgPSBkM19nZW9fY2VudHJvaWRQb2ludDtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIG5leHRQb2ludCjOuywgz4YpIHtcbiAgICAgIM67ICo9IGQzX3JhZGlhbnM7XG4gICAgICB2YXIgY29zz4YgPSBNYXRoLmNvcyjPhiAqPSBkM19yYWRpYW5zKSwgeCA9IGNvc8+GICogTWF0aC5jb3MozrspLCB5ID0gY29zz4YgKiBNYXRoLnNpbijOuyksIHogPSBNYXRoLnNpbijPhiksIGN4ID0geTAgKiB6IC0gejAgKiB5LCBjeSA9IHowICogeCAtIHgwICogeiwgY3ogPSB4MCAqIHkgLSB5MCAqIHgsIG0gPSBNYXRoLnNxcnQoY3ggKiBjeCArIGN5ICogY3kgKyBjeiAqIGN6KSwgdSA9IHgwICogeCArIHkwICogeSArIHowICogeiwgdiA9IG0gJiYgLWQzX2Fjb3ModSkgLyBtLCB3ID0gTWF0aC5hdGFuMihtLCB1KTtcbiAgICAgIGQzX2dlb19jZW50cm9pZFgyICs9IHYgKiBjeDtcbiAgICAgIGQzX2dlb19jZW50cm9pZFkyICs9IHYgKiBjeTtcbiAgICAgIGQzX2dlb19jZW50cm9pZFoyICs9IHYgKiBjejtcbiAgICAgIGQzX2dlb19jZW50cm9pZFcxICs9IHc7XG4gICAgICBkM19nZW9fY2VudHJvaWRYMSArPSB3ICogKHgwICsgKHgwID0geCkpO1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkWTEgKz0gdyAqICh5MCArICh5MCA9IHkpKTtcbiAgICAgIGQzX2dlb19jZW50cm9pZFoxICs9IHcgKiAoejAgKyAoejAgPSB6KSk7XG4gICAgICBkM19nZW9fY2VudHJvaWRQb2ludFhZWih4MCwgeTAsIHowKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZDNfdHJ1ZSgpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY2xpcFBvbHlnb24oc2VnbWVudHMsIGNvbXBhcmUsIGNsaXBTdGFydEluc2lkZSwgaW50ZXJwb2xhdGUsIGxpc3RlbmVyKSB7XG4gICAgdmFyIHN1YmplY3QgPSBbXSwgY2xpcCA9IFtdO1xuICAgIHNlZ21lbnRzLmZvckVhY2goZnVuY3Rpb24oc2VnbWVudCkge1xuICAgICAgaWYgKChuID0gc2VnbWVudC5sZW5ndGggLSAxKSA8PSAwKSByZXR1cm47XG4gICAgICB2YXIgbiwgcDAgPSBzZWdtZW50WzBdLCBwMSA9IHNlZ21lbnRbbl07XG4gICAgICBpZiAoZDNfZ2VvX3NwaGVyaWNhbEVxdWFsKHAwLCBwMSkpIHtcbiAgICAgICAgbGlzdGVuZXIubGluZVN0YXJ0KCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgKytpKSBsaXN0ZW5lci5wb2ludCgocDAgPSBzZWdtZW50W2ldKVswXSwgcDBbMV0pO1xuICAgICAgICBsaXN0ZW5lci5saW5lRW5kKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciBhID0gbmV3IGQzX2dlb19jbGlwUG9seWdvbkludGVyc2VjdGlvbihwMCwgc2VnbWVudCwgbnVsbCwgdHJ1ZSksIGIgPSBuZXcgZDNfZ2VvX2NsaXBQb2x5Z29uSW50ZXJzZWN0aW9uKHAwLCBudWxsLCBhLCBmYWxzZSk7XG4gICAgICBhLm8gPSBiO1xuICAgICAgc3ViamVjdC5wdXNoKGEpO1xuICAgICAgY2xpcC5wdXNoKGIpO1xuICAgICAgYSA9IG5ldyBkM19nZW9fY2xpcFBvbHlnb25JbnRlcnNlY3Rpb24ocDEsIHNlZ21lbnQsIG51bGwsIGZhbHNlKTtcbiAgICAgIGIgPSBuZXcgZDNfZ2VvX2NsaXBQb2x5Z29uSW50ZXJzZWN0aW9uKHAxLCBudWxsLCBhLCB0cnVlKTtcbiAgICAgIGEubyA9IGI7XG4gICAgICBzdWJqZWN0LnB1c2goYSk7XG4gICAgICBjbGlwLnB1c2goYik7XG4gICAgfSk7XG4gICAgY2xpcC5zb3J0KGNvbXBhcmUpO1xuICAgIGQzX2dlb19jbGlwUG9seWdvbkxpbmtDaXJjdWxhcihzdWJqZWN0KTtcbiAgICBkM19nZW9fY2xpcFBvbHlnb25MaW5rQ2lyY3VsYXIoY2xpcCk7XG4gICAgaWYgKCFzdWJqZWN0Lmxlbmd0aCkgcmV0dXJuO1xuICAgIGZvciAodmFyIGkgPSAwLCBlbnRyeSA9IGNsaXBTdGFydEluc2lkZSwgbiA9IGNsaXAubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICBjbGlwW2ldLmUgPSBlbnRyeSA9ICFlbnRyeTtcbiAgICB9XG4gICAgdmFyIHN0YXJ0ID0gc3ViamVjdFswXSwgcG9pbnRzLCBwb2ludDtcbiAgICB3aGlsZSAoMSkge1xuICAgICAgdmFyIGN1cnJlbnQgPSBzdGFydCwgaXNTdWJqZWN0ID0gdHJ1ZTtcbiAgICAgIHdoaWxlIChjdXJyZW50LnYpIGlmICgoY3VycmVudCA9IGN1cnJlbnQubikgPT09IHN0YXJ0KSByZXR1cm47XG4gICAgICBwb2ludHMgPSBjdXJyZW50Lno7XG4gICAgICBsaXN0ZW5lci5saW5lU3RhcnQoKTtcbiAgICAgIGRvIHtcbiAgICAgICAgY3VycmVudC52ID0gY3VycmVudC5vLnYgPSB0cnVlO1xuICAgICAgICBpZiAoY3VycmVudC5lKSB7XG4gICAgICAgICAgaWYgKGlzU3ViamVjdCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDAsIG4gPSBwb2ludHMubGVuZ3RoOyBpIDwgbjsgKytpKSBsaXN0ZW5lci5wb2ludCgocG9pbnQgPSBwb2ludHNbaV0pWzBdLCBwb2ludFsxXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGludGVycG9sYXRlKGN1cnJlbnQueCwgY3VycmVudC5uLngsIDEsIGxpc3RlbmVyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQubjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoaXNTdWJqZWN0KSB7XG4gICAgICAgICAgICBwb2ludHMgPSBjdXJyZW50LnAuejtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSBwb2ludHMubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIGxpc3RlbmVyLnBvaW50KChwb2ludCA9IHBvaW50c1tpXSlbMF0sIHBvaW50WzFdKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaW50ZXJwb2xhdGUoY3VycmVudC54LCBjdXJyZW50LnAueCwgLTEsIGxpc3RlbmVyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY3VycmVudCA9IGN1cnJlbnQucDtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50ID0gY3VycmVudC5vO1xuICAgICAgICBwb2ludHMgPSBjdXJyZW50Lno7XG4gICAgICAgIGlzU3ViamVjdCA9ICFpc1N1YmplY3Q7XG4gICAgICB9IHdoaWxlICghY3VycmVudC52KTtcbiAgICAgIGxpc3RlbmVyLmxpbmVFbmQoKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2NsaXBQb2x5Z29uTGlua0NpcmN1bGFyKGFycmF5KSB7XG4gICAgaWYgKCEobiA9IGFycmF5Lmxlbmd0aCkpIHJldHVybjtcbiAgICB2YXIgbiwgaSA9IDAsIGEgPSBhcnJheVswXSwgYjtcbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgYS5uID0gYiA9IGFycmF5W2ldO1xuICAgICAgYi5wID0gYTtcbiAgICAgIGEgPSBiO1xuICAgIH1cbiAgICBhLm4gPSBiID0gYXJyYXlbMF07XG4gICAgYi5wID0gYTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY2xpcFBvbHlnb25JbnRlcnNlY3Rpb24ocG9pbnQsIHBvaW50cywgb3RoZXIsIGVudHJ5KSB7XG4gICAgdGhpcy54ID0gcG9pbnQ7XG4gICAgdGhpcy56ID0gcG9pbnRzO1xuICAgIHRoaXMubyA9IG90aGVyO1xuICAgIHRoaXMuZSA9IGVudHJ5O1xuICAgIHRoaXMudiA9IGZhbHNlO1xuICAgIHRoaXMubiA9IHRoaXMucCA9IG51bGw7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2NsaXAocG9pbnRWaXNpYmxlLCBjbGlwTGluZSwgaW50ZXJwb2xhdGUsIGNsaXBTdGFydCkge1xuICAgIHJldHVybiBmdW5jdGlvbihyb3RhdGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgbGluZSA9IGNsaXBMaW5lKGxpc3RlbmVyKSwgcm90YXRlZENsaXBTdGFydCA9IHJvdGF0ZS5pbnZlcnQoY2xpcFN0YXJ0WzBdLCBjbGlwU3RhcnRbMV0pO1xuICAgICAgdmFyIGNsaXAgPSB7XG4gICAgICAgIHBvaW50OiBwb2ludCxcbiAgICAgICAgbGluZVN0YXJ0OiBsaW5lU3RhcnQsXG4gICAgICAgIGxpbmVFbmQ6IGxpbmVFbmQsXG4gICAgICAgIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY2xpcC5wb2ludCA9IHBvaW50UmluZztcbiAgICAgICAgICBjbGlwLmxpbmVTdGFydCA9IHJpbmdTdGFydDtcbiAgICAgICAgICBjbGlwLmxpbmVFbmQgPSByaW5nRW5kO1xuICAgICAgICAgIHNlZ21lbnRzID0gW107XG4gICAgICAgICAgcG9seWdvbiA9IFtdO1xuICAgICAgICB9LFxuICAgICAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjbGlwLnBvaW50ID0gcG9pbnQ7XG4gICAgICAgICAgY2xpcC5saW5lU3RhcnQgPSBsaW5lU3RhcnQ7XG4gICAgICAgICAgY2xpcC5saW5lRW5kID0gbGluZUVuZDtcbiAgICAgICAgICBzZWdtZW50cyA9IGQzLm1lcmdlKHNlZ21lbnRzKTtcbiAgICAgICAgICB2YXIgY2xpcFN0YXJ0SW5zaWRlID0gZDNfZ2VvX3BvaW50SW5Qb2x5Z29uKHJvdGF0ZWRDbGlwU3RhcnQsIHBvbHlnb24pO1xuICAgICAgICAgIGlmIChzZWdtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmICghcG9seWdvblN0YXJ0ZWQpIGxpc3RlbmVyLnBvbHlnb25TdGFydCgpLCBwb2x5Z29uU3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBkM19nZW9fY2xpcFBvbHlnb24oc2VnbWVudHMsIGQzX2dlb19jbGlwU29ydCwgY2xpcFN0YXJ0SW5zaWRlLCBpbnRlcnBvbGF0ZSwgbGlzdGVuZXIpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoY2xpcFN0YXJ0SW5zaWRlKSB7XG4gICAgICAgICAgICBpZiAoIXBvbHlnb25TdGFydGVkKSBsaXN0ZW5lci5wb2x5Z29uU3RhcnQoKSwgcG9seWdvblN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgbGlzdGVuZXIubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICBpbnRlcnBvbGF0ZShudWxsLCBudWxsLCAxLCBsaXN0ZW5lcik7XG4gICAgICAgICAgICBsaXN0ZW5lci5saW5lRW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwb2x5Z29uU3RhcnRlZCkgbGlzdGVuZXIucG9seWdvbkVuZCgpLCBwb2x5Z29uU3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICAgIHNlZ21lbnRzID0gcG9seWdvbiA9IG51bGw7XG4gICAgICAgIH0sXG4gICAgICAgIHNwaGVyZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbGlzdGVuZXIucG9seWdvblN0YXJ0KCk7XG4gICAgICAgICAgbGlzdGVuZXIubGluZVN0YXJ0KCk7XG4gICAgICAgICAgaW50ZXJwb2xhdGUobnVsbCwgbnVsbCwgMSwgbGlzdGVuZXIpO1xuICAgICAgICAgIGxpc3RlbmVyLmxpbmVFbmQoKTtcbiAgICAgICAgICBsaXN0ZW5lci5wb2x5Z29uRW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICBmdW5jdGlvbiBwb2ludCjOuywgz4YpIHtcbiAgICAgICAgdmFyIHBvaW50ID0gcm90YXRlKM67LCDPhik7XG4gICAgICAgIGlmIChwb2ludFZpc2libGUozrsgPSBwb2ludFswXSwgz4YgPSBwb2ludFsxXSkpIGxpc3RlbmVyLnBvaW50KM67LCDPhik7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBwb2ludExpbmUozrssIM+GKSB7XG4gICAgICAgIHZhciBwb2ludCA9IHJvdGF0ZSjOuywgz4YpO1xuICAgICAgICBsaW5lLnBvaW50KHBvaW50WzBdLCBwb2ludFsxXSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBsaW5lU3RhcnQoKSB7XG4gICAgICAgIGNsaXAucG9pbnQgPSBwb2ludExpbmU7XG4gICAgICAgIGxpbmUubGluZVN0YXJ0KCk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBsaW5lRW5kKCkge1xuICAgICAgICBjbGlwLnBvaW50ID0gcG9pbnQ7XG4gICAgICAgIGxpbmUubGluZUVuZCgpO1xuICAgICAgfVxuICAgICAgdmFyIHNlZ21lbnRzO1xuICAgICAgdmFyIGJ1ZmZlciA9IGQzX2dlb19jbGlwQnVmZmVyTGlzdGVuZXIoKSwgcmluZ0xpc3RlbmVyID0gY2xpcExpbmUoYnVmZmVyKSwgcG9seWdvblN0YXJ0ZWQgPSBmYWxzZSwgcG9seWdvbiwgcmluZztcbiAgICAgIGZ1bmN0aW9uIHBvaW50UmluZyjOuywgz4YpIHtcbiAgICAgICAgcmluZy5wdXNoKFsgzrssIM+GIF0pO1xuICAgICAgICB2YXIgcG9pbnQgPSByb3RhdGUozrssIM+GKTtcbiAgICAgICAgcmluZ0xpc3RlbmVyLnBvaW50KHBvaW50WzBdLCBwb2ludFsxXSk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiByaW5nU3RhcnQoKSB7XG4gICAgICAgIHJpbmdMaXN0ZW5lci5saW5lU3RhcnQoKTtcbiAgICAgICAgcmluZyA9IFtdO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gcmluZ0VuZCgpIHtcbiAgICAgICAgcG9pbnRSaW5nKHJpbmdbMF1bMF0sIHJpbmdbMF1bMV0pO1xuICAgICAgICByaW5nTGlzdGVuZXIubGluZUVuZCgpO1xuICAgICAgICB2YXIgY2xlYW4gPSByaW5nTGlzdGVuZXIuY2xlYW4oKSwgcmluZ1NlZ21lbnRzID0gYnVmZmVyLmJ1ZmZlcigpLCBzZWdtZW50LCBuID0gcmluZ1NlZ21lbnRzLmxlbmd0aDtcbiAgICAgICAgcmluZy5wb3AoKTtcbiAgICAgICAgcG9seWdvbi5wdXNoKHJpbmcpO1xuICAgICAgICByaW5nID0gbnVsbDtcbiAgICAgICAgaWYgKCFuKSByZXR1cm47XG4gICAgICAgIGlmIChjbGVhbiAmIDEpIHtcbiAgICAgICAgICBzZWdtZW50ID0gcmluZ1NlZ21lbnRzWzBdO1xuICAgICAgICAgIHZhciBuID0gc2VnbWVudC5sZW5ndGggLSAxLCBpID0gLTEsIHBvaW50O1xuICAgICAgICAgIGlmIChuID4gMCkge1xuICAgICAgICAgICAgaWYgKCFwb2x5Z29uU3RhcnRlZCkgbGlzdGVuZXIucG9seWdvblN0YXJ0KCksIHBvbHlnb25TdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGxpc3RlbmVyLmxpbmVTdGFydCgpO1xuICAgICAgICAgICAgd2hpbGUgKCsraSA8IG4pIGxpc3RlbmVyLnBvaW50KChwb2ludCA9IHNlZ21lbnRbaV0pWzBdLCBwb2ludFsxXSk7XG4gICAgICAgICAgICBsaXN0ZW5lci5saW5lRW5kKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobiA+IDEgJiYgY2xlYW4gJiAyKSByaW5nU2VnbWVudHMucHVzaChyaW5nU2VnbWVudHMucG9wKCkuY29uY2F0KHJpbmdTZWdtZW50cy5zaGlmdCgpKSk7XG4gICAgICAgIHNlZ21lbnRzLnB1c2gocmluZ1NlZ21lbnRzLmZpbHRlcihkM19nZW9fY2xpcFNlZ21lbnRMZW5ndGgxKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gY2xpcDtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19jbGlwU2VnbWVudExlbmd0aDEoc2VnbWVudCkge1xuICAgIHJldHVybiBzZWdtZW50Lmxlbmd0aCA+IDE7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2NsaXBCdWZmZXJMaXN0ZW5lcigpIHtcbiAgICB2YXIgbGluZXMgPSBbXSwgbGluZTtcbiAgICByZXR1cm4ge1xuICAgICAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGluZXMucHVzaChsaW5lID0gW10pO1xuICAgICAgfSxcbiAgICAgIHBvaW50OiBmdW5jdGlvbijOuywgz4YpIHtcbiAgICAgICAgbGluZS5wdXNoKFsgzrssIM+GIF0pO1xuICAgICAgfSxcbiAgICAgIGxpbmVFbmQ6IGQzX25vb3AsXG4gICAgICBidWZmZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYnVmZmVyID0gbGluZXM7XG4gICAgICAgIGxpbmVzID0gW107XG4gICAgICAgIGxpbmUgPSBudWxsO1xuICAgICAgICByZXR1cm4gYnVmZmVyO1xuICAgICAgfSxcbiAgICAgIHJlam9pbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChsaW5lcy5sZW5ndGggPiAxKSBsaW5lcy5wdXNoKGxpbmVzLnBvcCgpLmNvbmNhdChsaW5lcy5zaGlmdCgpKSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY2xpcFNvcnQoYSwgYikge1xuICAgIHJldHVybiAoKGEgPSBhLngpWzBdIDwgMCA/IGFbMV0gLSBoYWxmz4AgLSDOtSA6IGhhbGbPgCAtIGFbMV0pIC0gKChiID0gYi54KVswXSA8IDAgPyBiWzFdIC0gaGFsZs+AIC0gzrUgOiBoYWxmz4AgLSBiWzFdKTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fcG9pbnRJblBvbHlnb24ocG9pbnQsIHBvbHlnb24pIHtcbiAgICB2YXIgbWVyaWRpYW4gPSBwb2ludFswXSwgcGFyYWxsZWwgPSBwb2ludFsxXSwgbWVyaWRpYW5Ob3JtYWwgPSBbIE1hdGguc2luKG1lcmlkaWFuKSwgLU1hdGguY29zKG1lcmlkaWFuKSwgMCBdLCBwb2xhckFuZ2xlID0gMCwgd2luZGluZyA9IDA7XG4gICAgZDNfZ2VvX2FyZWFSaW5nU3VtLnJlc2V0KCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSBwb2x5Z29uLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgdmFyIHJpbmcgPSBwb2x5Z29uW2ldLCBtID0gcmluZy5sZW5ndGg7XG4gICAgICBpZiAoIW0pIGNvbnRpbnVlO1xuICAgICAgdmFyIHBvaW50MCA9IHJpbmdbMF0sIM67MCA9IHBvaW50MFswXSwgz4YwID0gcG9pbnQwWzFdIC8gMiArIM+AIC8gNCwgc2luz4YwID0gTWF0aC5zaW4oz4YwKSwgY29zz4YwID0gTWF0aC5jb3Moz4YwKSwgaiA9IDE7XG4gICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICBpZiAoaiA9PT0gbSkgaiA9IDA7XG4gICAgICAgIHBvaW50ID0gcmluZ1tqXTtcbiAgICAgICAgdmFyIM67ID0gcG9pbnRbMF0sIM+GID0gcG9pbnRbMV0gLyAyICsgz4AgLyA0LCBzaW7PhiA9IE1hdGguc2luKM+GKSwgY29zz4YgPSBNYXRoLmNvcyjPhiksIGTOuyA9IM67IC0gzrswLCBzZM67ID0gZM67ID49IDAgPyAxIDogLTEsIGFkzrsgPSBzZM67ICogZM67LCBhbnRpbWVyaWRpYW4gPSBhZM67ID4gz4AsIGsgPSBzaW7PhjAgKiBzaW7PhjtcbiAgICAgICAgZDNfZ2VvX2FyZWFSaW5nU3VtLmFkZChNYXRoLmF0YW4yKGsgKiBzZM67ICogTWF0aC5zaW4oYWTOuyksIGNvc8+GMCAqIGNvc8+GICsgayAqIE1hdGguY29zKGFkzrspKSk7XG4gICAgICAgIHBvbGFyQW5nbGUgKz0gYW50aW1lcmlkaWFuID8gZM67ICsgc2TOuyAqIM+EIDogZM67O1xuICAgICAgICBpZiAoYW50aW1lcmlkaWFuIF4gzrswID49IG1lcmlkaWFuIF4gzrsgPj0gbWVyaWRpYW4pIHtcbiAgICAgICAgICB2YXIgYXJjID0gZDNfZ2VvX2NhcnRlc2lhbkNyb3NzKGQzX2dlb19jYXJ0ZXNpYW4ocG9pbnQwKSwgZDNfZ2VvX2NhcnRlc2lhbihwb2ludCkpO1xuICAgICAgICAgIGQzX2dlb19jYXJ0ZXNpYW5Ob3JtYWxpemUoYXJjKTtcbiAgICAgICAgICB2YXIgaW50ZXJzZWN0aW9uID0gZDNfZ2VvX2NhcnRlc2lhbkNyb3NzKG1lcmlkaWFuTm9ybWFsLCBhcmMpO1xuICAgICAgICAgIGQzX2dlb19jYXJ0ZXNpYW5Ob3JtYWxpemUoaW50ZXJzZWN0aW9uKTtcbiAgICAgICAgICB2YXIgz4ZhcmMgPSAoYW50aW1lcmlkaWFuIF4gZM67ID49IDAgPyAtMSA6IDEpICogZDNfYXNpbihpbnRlcnNlY3Rpb25bMl0pO1xuICAgICAgICAgIGlmIChwYXJhbGxlbCA+IM+GYXJjIHx8IHBhcmFsbGVsID09PSDPhmFyYyAmJiAoYXJjWzBdIHx8IGFyY1sxXSkpIHtcbiAgICAgICAgICAgIHdpbmRpbmcgKz0gYW50aW1lcmlkaWFuIF4gZM67ID49IDAgPyAxIDogLTE7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghaisrKSBicmVhaztcbiAgICAgICAgzrswID0gzrssIHNpbs+GMCA9IHNpbs+GLCBjb3PPhjAgPSBjb3PPhiwgcG9pbnQwID0gcG9pbnQ7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAocG9sYXJBbmdsZSA8IC3OtSB8fCBwb2xhckFuZ2xlIDwgzrUgJiYgZDNfZ2VvX2FyZWFSaW5nU3VtIDwgMCkgXiB3aW5kaW5nICYgMTtcbiAgfVxuICB2YXIgZDNfZ2VvX2NsaXBBbnRpbWVyaWRpYW4gPSBkM19nZW9fY2xpcChkM190cnVlLCBkM19nZW9fY2xpcEFudGltZXJpZGlhbkxpbmUsIGQzX2dlb19jbGlwQW50aW1lcmlkaWFuSW50ZXJwb2xhdGUsIFsgLc+ALCAtz4AgLyAyIF0pO1xuICBmdW5jdGlvbiBkM19nZW9fY2xpcEFudGltZXJpZGlhbkxpbmUobGlzdGVuZXIpIHtcbiAgICB2YXIgzrswID0gTmFOLCDPhjAgPSBOYU4sIHPOuzAgPSBOYU4sIGNsZWFuO1xuICAgIHJldHVybiB7XG4gICAgICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBsaXN0ZW5lci5saW5lU3RhcnQoKTtcbiAgICAgICAgY2xlYW4gPSAxO1xuICAgICAgfSxcbiAgICAgIHBvaW50OiBmdW5jdGlvbijOuzEsIM+GMSkge1xuICAgICAgICB2YXIgc867MSA9IM67MSA+IDAgPyDPgCA6IC3PgCwgZM67ID0gYWJzKM67MSAtIM67MCk7XG4gICAgICAgIGlmIChhYnMoZM67IC0gz4ApIDwgzrUpIHtcbiAgICAgICAgICBsaXN0ZW5lci5wb2ludCjOuzAsIM+GMCA9ICjPhjAgKyDPhjEpIC8gMiA+IDAgPyBoYWxmz4AgOiAtaGFsZs+AKTtcbiAgICAgICAgICBsaXN0ZW5lci5wb2ludChzzrswLCDPhjApO1xuICAgICAgICAgIGxpc3RlbmVyLmxpbmVFbmQoKTtcbiAgICAgICAgICBsaXN0ZW5lci5saW5lU3RhcnQoKTtcbiAgICAgICAgICBsaXN0ZW5lci5wb2ludChzzrsxLCDPhjApO1xuICAgICAgICAgIGxpc3RlbmVyLnBvaW50KM67MSwgz4YwKTtcbiAgICAgICAgICBjbGVhbiA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoc867MCAhPT0gc867MSAmJiBkzrsgPj0gz4ApIHtcbiAgICAgICAgICBpZiAoYWJzKM67MCAtIHPOuzApIDwgzrUpIM67MCAtPSBzzrswICogzrU7XG4gICAgICAgICAgaWYgKGFicyjOuzEgLSBzzrsxKSA8IM61KSDOuzEgLT0gc867MSAqIM61O1xuICAgICAgICAgIM+GMCA9IGQzX2dlb19jbGlwQW50aW1lcmlkaWFuSW50ZXJzZWN0KM67MCwgz4YwLCDOuzEsIM+GMSk7XG4gICAgICAgICAgbGlzdGVuZXIucG9pbnQoc867MCwgz4YwKTtcbiAgICAgICAgICBsaXN0ZW5lci5saW5lRW5kKCk7XG4gICAgICAgICAgbGlzdGVuZXIubGluZVN0YXJ0KCk7XG4gICAgICAgICAgbGlzdGVuZXIucG9pbnQoc867MSwgz4YwKTtcbiAgICAgICAgICBjbGVhbiA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgbGlzdGVuZXIucG9pbnQozrswID0gzrsxLCDPhjAgPSDPhjEpO1xuICAgICAgICBzzrswID0gc867MTtcbiAgICAgIH0sXG4gICAgICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgbGlzdGVuZXIubGluZUVuZCgpO1xuICAgICAgICDOuzAgPSDPhjAgPSBOYU47XG4gICAgICB9LFxuICAgICAgY2xlYW46IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gMiAtIGNsZWFuO1xuICAgICAgfVxuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2NsaXBBbnRpbWVyaWRpYW5JbnRlcnNlY3QozrswLCDPhjAsIM67MSwgz4YxKSB7XG4gICAgdmFyIGNvc8+GMCwgY29zz4YxLCBzaW7OuzBfzrsxID0gTWF0aC5zaW4ozrswIC0gzrsxKTtcbiAgICByZXR1cm4gYWJzKHNpbs67MF/OuzEpID4gzrUgPyBNYXRoLmF0YW4oKE1hdGguc2luKM+GMCkgKiAoY29zz4YxID0gTWF0aC5jb3Moz4YxKSkgKiBNYXRoLnNpbijOuzEpIC0gTWF0aC5zaW4oz4YxKSAqIChjb3PPhjAgPSBNYXRoLmNvcyjPhjApKSAqIE1hdGguc2luKM67MCkpIC8gKGNvc8+GMCAqIGNvc8+GMSAqIHNpbs67MF/OuzEpKSA6ICjPhjAgKyDPhjEpIC8gMjtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY2xpcEFudGltZXJpZGlhbkludGVycG9sYXRlKGZyb20sIHRvLCBkaXJlY3Rpb24sIGxpc3RlbmVyKSB7XG4gICAgdmFyIM+GO1xuICAgIGlmIChmcm9tID09IG51bGwpIHtcbiAgICAgIM+GID0gZGlyZWN0aW9uICogaGFsZs+AO1xuICAgICAgbGlzdGVuZXIucG9pbnQoLc+ALCDPhik7XG4gICAgICBsaXN0ZW5lci5wb2ludCgwLCDPhik7XG4gICAgICBsaXN0ZW5lci5wb2ludCjPgCwgz4YpO1xuICAgICAgbGlzdGVuZXIucG9pbnQoz4AsIDApO1xuICAgICAgbGlzdGVuZXIucG9pbnQoz4AsIC3Phik7XG4gICAgICBsaXN0ZW5lci5wb2ludCgwLCAtz4YpO1xuICAgICAgbGlzdGVuZXIucG9pbnQoLc+ALCAtz4YpO1xuICAgICAgbGlzdGVuZXIucG9pbnQoLc+ALCAwKTtcbiAgICAgIGxpc3RlbmVyLnBvaW50KC3PgCwgz4YpO1xuICAgIH0gZWxzZSBpZiAoYWJzKGZyb21bMF0gLSB0b1swXSkgPiDOtSkge1xuICAgICAgdmFyIHMgPSBmcm9tWzBdIDwgdG9bMF0gPyDPgCA6IC3PgDtcbiAgICAgIM+GID0gZGlyZWN0aW9uICogcyAvIDI7XG4gICAgICBsaXN0ZW5lci5wb2ludCgtcywgz4YpO1xuICAgICAgbGlzdGVuZXIucG9pbnQoMCwgz4YpO1xuICAgICAgbGlzdGVuZXIucG9pbnQocywgz4YpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0ZW5lci5wb2ludCh0b1swXSwgdG9bMV0pO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY2xpcENpcmNsZShyYWRpdXMpIHtcbiAgICB2YXIgY3IgPSBNYXRoLmNvcyhyYWRpdXMpLCBzbWFsbFJhZGl1cyA9IGNyID4gMCwgbm90SGVtaXNwaGVyZSA9IGFicyhjcikgPiDOtSwgaW50ZXJwb2xhdGUgPSBkM19nZW9fY2lyY2xlSW50ZXJwb2xhdGUocmFkaXVzLCA2ICogZDNfcmFkaWFucyk7XG4gICAgcmV0dXJuIGQzX2dlb19jbGlwKHZpc2libGUsIGNsaXBMaW5lLCBpbnRlcnBvbGF0ZSwgc21hbGxSYWRpdXMgPyBbIDAsIC1yYWRpdXMgXSA6IFsgLc+ALCByYWRpdXMgLSDPgCBdKTtcbiAgICBmdW5jdGlvbiB2aXNpYmxlKM67LCDPhikge1xuICAgICAgcmV0dXJuIE1hdGguY29zKM67KSAqIE1hdGguY29zKM+GKSA+IGNyO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjbGlwTGluZShsaXN0ZW5lcikge1xuICAgICAgdmFyIHBvaW50MCwgYzAsIHYwLCB2MDAsIGNsZWFuO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICB2MDAgPSB2MCA9IGZhbHNlO1xuICAgICAgICAgIGNsZWFuID0gMTtcbiAgICAgICAgfSxcbiAgICAgICAgcG9pbnQ6IGZ1bmN0aW9uKM67LCDPhikge1xuICAgICAgICAgIHZhciBwb2ludDEgPSBbIM67LCDPhiBdLCBwb2ludDIsIHYgPSB2aXNpYmxlKM67LCDPhiksIGMgPSBzbWFsbFJhZGl1cyA/IHYgPyAwIDogY29kZSjOuywgz4YpIDogdiA/IGNvZGUozrsgKyAozrsgPCAwID8gz4AgOiAtz4ApLCDPhikgOiAwO1xuICAgICAgICAgIGlmICghcG9pbnQwICYmICh2MDAgPSB2MCA9IHYpKSBsaXN0ZW5lci5saW5lU3RhcnQoKTtcbiAgICAgICAgICBpZiAodiAhPT0gdjApIHtcbiAgICAgICAgICAgIHBvaW50MiA9IGludGVyc2VjdChwb2ludDAsIHBvaW50MSk7XG4gICAgICAgICAgICBpZiAoZDNfZ2VvX3NwaGVyaWNhbEVxdWFsKHBvaW50MCwgcG9pbnQyKSB8fCBkM19nZW9fc3BoZXJpY2FsRXF1YWwocG9pbnQxLCBwb2ludDIpKSB7XG4gICAgICAgICAgICAgIHBvaW50MVswXSArPSDOtTtcbiAgICAgICAgICAgICAgcG9pbnQxWzFdICs9IM61O1xuICAgICAgICAgICAgICB2ID0gdmlzaWJsZShwb2ludDFbMF0sIHBvaW50MVsxXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh2ICE9PSB2MCkge1xuICAgICAgICAgICAgY2xlYW4gPSAwO1xuICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgbGlzdGVuZXIubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICAgIHBvaW50MiA9IGludGVyc2VjdChwb2ludDEsIHBvaW50MCk7XG4gICAgICAgICAgICAgIGxpc3RlbmVyLnBvaW50KHBvaW50MlswXSwgcG9pbnQyWzFdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHBvaW50MiA9IGludGVyc2VjdChwb2ludDAsIHBvaW50MSk7XG4gICAgICAgICAgICAgIGxpc3RlbmVyLnBvaW50KHBvaW50MlswXSwgcG9pbnQyWzFdKTtcbiAgICAgICAgICAgICAgbGlzdGVuZXIubGluZUVuZCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcG9pbnQwID0gcG9pbnQyO1xuICAgICAgICAgIH0gZWxzZSBpZiAobm90SGVtaXNwaGVyZSAmJiBwb2ludDAgJiYgc21hbGxSYWRpdXMgXiB2KSB7XG4gICAgICAgICAgICB2YXIgdDtcbiAgICAgICAgICAgIGlmICghKGMgJiBjMCkgJiYgKHQgPSBpbnRlcnNlY3QocG9pbnQxLCBwb2ludDAsIHRydWUpKSkge1xuICAgICAgICAgICAgICBjbGVhbiA9IDA7XG4gICAgICAgICAgICAgIGlmIChzbWFsbFJhZGl1cykge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLmxpbmVTdGFydCgpO1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLnBvaW50KHRbMF1bMF0sIHRbMF1bMV0pO1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLnBvaW50KHRbMV1bMF0sIHRbMV1bMV0pO1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLmxpbmVFbmQoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5wb2ludCh0WzFdWzBdLCB0WzFdWzFdKTtcbiAgICAgICAgICAgICAgICBsaXN0ZW5lci5saW5lRW5kKCk7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICAgICAgbGlzdGVuZXIucG9pbnQodFswXVswXSwgdFswXVsxXSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHYgJiYgKCFwb2ludDAgfHwgIWQzX2dlb19zcGhlcmljYWxFcXVhbChwb2ludDAsIHBvaW50MSkpKSB7XG4gICAgICAgICAgICBsaXN0ZW5lci5wb2ludChwb2ludDFbMF0sIHBvaW50MVsxXSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHBvaW50MCA9IHBvaW50MSwgdjAgPSB2LCBjMCA9IGM7XG4gICAgICAgIH0sXG4gICAgICAgIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGlmICh2MCkgbGlzdGVuZXIubGluZUVuZCgpO1xuICAgICAgICAgIHBvaW50MCA9IG51bGw7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFuOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gY2xlYW4gfCAodjAwICYmIHYwKSA8PCAxO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbnRlcnNlY3QoYSwgYiwgdHdvKSB7XG4gICAgICB2YXIgcGEgPSBkM19nZW9fY2FydGVzaWFuKGEpLCBwYiA9IGQzX2dlb19jYXJ0ZXNpYW4oYik7XG4gICAgICB2YXIgbjEgPSBbIDEsIDAsIDAgXSwgbjIgPSBkM19nZW9fY2FydGVzaWFuQ3Jvc3MocGEsIHBiKSwgbjJuMiA9IGQzX2dlb19jYXJ0ZXNpYW5Eb3QobjIsIG4yKSwgbjFuMiA9IG4yWzBdLCBkZXRlcm1pbmFudCA9IG4ybjIgLSBuMW4yICogbjFuMjtcbiAgICAgIGlmICghZGV0ZXJtaW5hbnQpIHJldHVybiAhdHdvICYmIGE7XG4gICAgICB2YXIgYzEgPSBjciAqIG4ybjIgLyBkZXRlcm1pbmFudCwgYzIgPSAtY3IgKiBuMW4yIC8gZGV0ZXJtaW5hbnQsIG4xeG4yID0gZDNfZ2VvX2NhcnRlc2lhbkNyb3NzKG4xLCBuMiksIEEgPSBkM19nZW9fY2FydGVzaWFuU2NhbGUobjEsIGMxKSwgQiA9IGQzX2dlb19jYXJ0ZXNpYW5TY2FsZShuMiwgYzIpO1xuICAgICAgZDNfZ2VvX2NhcnRlc2lhbkFkZChBLCBCKTtcbiAgICAgIHZhciB1ID0gbjF4bjIsIHcgPSBkM19nZW9fY2FydGVzaWFuRG90KEEsIHUpLCB1dSA9IGQzX2dlb19jYXJ0ZXNpYW5Eb3QodSwgdSksIHQyID0gdyAqIHcgLSB1dSAqIChkM19nZW9fY2FydGVzaWFuRG90KEEsIEEpIC0gMSk7XG4gICAgICBpZiAodDIgPCAwKSByZXR1cm47XG4gICAgICB2YXIgdCA9IE1hdGguc3FydCh0MiksIHEgPSBkM19nZW9fY2FydGVzaWFuU2NhbGUodSwgKC13IC0gdCkgLyB1dSk7XG4gICAgICBkM19nZW9fY2FydGVzaWFuQWRkKHEsIEEpO1xuICAgICAgcSA9IGQzX2dlb19zcGhlcmljYWwocSk7XG4gICAgICBpZiAoIXR3bykgcmV0dXJuIHE7XG4gICAgICB2YXIgzrswID0gYVswXSwgzrsxID0gYlswXSwgz4YwID0gYVsxXSwgz4YxID0gYlsxXSwgejtcbiAgICAgIGlmICjOuzEgPCDOuzApIHogPSDOuzAsIM67MCA9IM67MSwgzrsxID0gejtcbiAgICAgIHZhciDOtM67ID0gzrsxIC0gzrswLCBwb2xhciA9IGFicyjOtM67IC0gz4ApIDwgzrUsIG1lcmlkaWFuID0gcG9sYXIgfHwgzrTOuyA8IM61O1xuICAgICAgaWYgKCFwb2xhciAmJiDPhjEgPCDPhjApIHogPSDPhjAsIM+GMCA9IM+GMSwgz4YxID0gejtcbiAgICAgIGlmIChtZXJpZGlhbiA/IHBvbGFyID8gz4YwICsgz4YxID4gMCBeIHFbMV0gPCAoYWJzKHFbMF0gLSDOuzApIDwgzrUgPyDPhjAgOiDPhjEpIDogz4YwIDw9IHFbMV0gJiYgcVsxXSA8PSDPhjEgOiDOtM67ID4gz4AgXiAozrswIDw9IHFbMF0gJiYgcVswXSA8PSDOuzEpKSB7XG4gICAgICAgIHZhciBxMSA9IGQzX2dlb19jYXJ0ZXNpYW5TY2FsZSh1LCAoLXcgKyB0KSAvIHV1KTtcbiAgICAgICAgZDNfZ2VvX2NhcnRlc2lhbkFkZChxMSwgQSk7XG4gICAgICAgIHJldHVybiBbIHEsIGQzX2dlb19zcGhlcmljYWwocTEpIF07XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNvZGUozrssIM+GKSB7XG4gICAgICB2YXIgciA9IHNtYWxsUmFkaXVzID8gcmFkaXVzIDogz4AgLSByYWRpdXMsIGNvZGUgPSAwO1xuICAgICAgaWYgKM67IDwgLXIpIGNvZGUgfD0gMTsgZWxzZSBpZiAozrsgPiByKSBjb2RlIHw9IDI7XG4gICAgICBpZiAoz4YgPCAtcikgY29kZSB8PSA0OyBlbHNlIGlmICjPhiA+IHIpIGNvZGUgfD0gODtcbiAgICAgIHJldHVybiBjb2RlO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX2NsaXBMaW5lKHgwLCB5MCwgeDEsIHkxKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgIHZhciBhID0gbGluZS5hLCBiID0gbGluZS5iLCBheCA9IGEueCwgYXkgPSBhLnksIGJ4ID0gYi54LCBieSA9IGIueSwgdDAgPSAwLCB0MSA9IDEsIGR4ID0gYnggLSBheCwgZHkgPSBieSAtIGF5LCByO1xuICAgICAgciA9IHgwIC0gYXg7XG4gICAgICBpZiAoIWR4ICYmIHIgPiAwKSByZXR1cm47XG4gICAgICByIC89IGR4O1xuICAgICAgaWYgKGR4IDwgMCkge1xuICAgICAgICBpZiAociA8IHQwKSByZXR1cm47XG4gICAgICAgIGlmIChyIDwgdDEpIHQxID0gcjtcbiAgICAgIH0gZWxzZSBpZiAoZHggPiAwKSB7XG4gICAgICAgIGlmIChyID4gdDEpIHJldHVybjtcbiAgICAgICAgaWYgKHIgPiB0MCkgdDAgPSByO1xuICAgICAgfVxuICAgICAgciA9IHgxIC0gYXg7XG4gICAgICBpZiAoIWR4ICYmIHIgPCAwKSByZXR1cm47XG4gICAgICByIC89IGR4O1xuICAgICAgaWYgKGR4IDwgMCkge1xuICAgICAgICBpZiAociA+IHQxKSByZXR1cm47XG4gICAgICAgIGlmIChyID4gdDApIHQwID0gcjtcbiAgICAgIH0gZWxzZSBpZiAoZHggPiAwKSB7XG4gICAgICAgIGlmIChyIDwgdDApIHJldHVybjtcbiAgICAgICAgaWYgKHIgPCB0MSkgdDEgPSByO1xuICAgICAgfVxuICAgICAgciA9IHkwIC0gYXk7XG4gICAgICBpZiAoIWR5ICYmIHIgPiAwKSByZXR1cm47XG4gICAgICByIC89IGR5O1xuICAgICAgaWYgKGR5IDwgMCkge1xuICAgICAgICBpZiAociA8IHQwKSByZXR1cm47XG4gICAgICAgIGlmIChyIDwgdDEpIHQxID0gcjtcbiAgICAgIH0gZWxzZSBpZiAoZHkgPiAwKSB7XG4gICAgICAgIGlmIChyID4gdDEpIHJldHVybjtcbiAgICAgICAgaWYgKHIgPiB0MCkgdDAgPSByO1xuICAgICAgfVxuICAgICAgciA9IHkxIC0gYXk7XG4gICAgICBpZiAoIWR5ICYmIHIgPCAwKSByZXR1cm47XG4gICAgICByIC89IGR5O1xuICAgICAgaWYgKGR5IDwgMCkge1xuICAgICAgICBpZiAociA+IHQxKSByZXR1cm47XG4gICAgICAgIGlmIChyID4gdDApIHQwID0gcjtcbiAgICAgIH0gZWxzZSBpZiAoZHkgPiAwKSB7XG4gICAgICAgIGlmIChyIDwgdDApIHJldHVybjtcbiAgICAgICAgaWYgKHIgPCB0MSkgdDEgPSByO1xuICAgICAgfVxuICAgICAgaWYgKHQwID4gMCkgbGluZS5hID0ge1xuICAgICAgICB4OiBheCArIHQwICogZHgsXG4gICAgICAgIHk6IGF5ICsgdDAgKiBkeVxuICAgICAgfTtcbiAgICAgIGlmICh0MSA8IDEpIGxpbmUuYiA9IHtcbiAgICAgICAgeDogYXggKyB0MSAqIGR4LFxuICAgICAgICB5OiBheSArIHQxICogZHlcbiAgICAgIH07XG4gICAgICByZXR1cm4gbGluZTtcbiAgICB9O1xuICB9XG4gIHZhciBkM19nZW9fY2xpcEV4dGVudE1BWCA9IDFlOTtcbiAgZDMuZ2VvLmNsaXBFeHRlbnQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgeDAsIHkwLCB4MSwgeTEsIHN0cmVhbSwgY2xpcCwgY2xpcEV4dGVudCA9IHtcbiAgICAgIHN0cmVhbTogZnVuY3Rpb24ob3V0cHV0KSB7XG4gICAgICAgIGlmIChzdHJlYW0pIHN0cmVhbS52YWxpZCA9IGZhbHNlO1xuICAgICAgICBzdHJlYW0gPSBjbGlwKG91dHB1dCk7XG4gICAgICAgIHN0cmVhbS52YWxpZCA9IHRydWU7XG4gICAgICAgIHJldHVybiBzdHJlYW07XG4gICAgICB9LFxuICAgICAgZXh0ZW50OiBmdW5jdGlvbihfKSB7XG4gICAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIFsgWyB4MCwgeTAgXSwgWyB4MSwgeTEgXSBdO1xuICAgICAgICBjbGlwID0gZDNfZ2VvX2NsaXBFeHRlbnQoeDAgPSArX1swXVswXSwgeTAgPSArX1swXVsxXSwgeDEgPSArX1sxXVswXSwgeTEgPSArX1sxXVsxXSk7XG4gICAgICAgIGlmIChzdHJlYW0pIHN0cmVhbS52YWxpZCA9IGZhbHNlLCBzdHJlYW0gPSBudWxsO1xuICAgICAgICByZXR1cm4gY2xpcEV4dGVudDtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiBjbGlwRXh0ZW50LmV4dGVudChbIFsgMCwgMCBdLCBbIDk2MCwgNTAwIF0gXSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2dlb19jbGlwRXh0ZW50KHgwLCB5MCwgeDEsIHkxKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGxpc3RlbmVyKSB7XG4gICAgICB2YXIgbGlzdGVuZXJfID0gbGlzdGVuZXIsIGJ1ZmZlckxpc3RlbmVyID0gZDNfZ2VvX2NsaXBCdWZmZXJMaXN0ZW5lcigpLCBjbGlwTGluZSA9IGQzX2dlb21fY2xpcExpbmUoeDAsIHkwLCB4MSwgeTEpLCBzZWdtZW50cywgcG9seWdvbiwgcmluZztcbiAgICAgIHZhciBjbGlwID0ge1xuICAgICAgICBwb2ludDogcG9pbnQsXG4gICAgICAgIGxpbmVTdGFydDogbGluZVN0YXJ0LFxuICAgICAgICBsaW5lRW5kOiBsaW5lRW5kLFxuICAgICAgICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGxpc3RlbmVyID0gYnVmZmVyTGlzdGVuZXI7XG4gICAgICAgICAgc2VnbWVudHMgPSBbXTtcbiAgICAgICAgICBwb2x5Z29uID0gW107XG4gICAgICAgICAgY2xlYW4gPSB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsaXN0ZW5lciA9IGxpc3RlbmVyXztcbiAgICAgICAgICBzZWdtZW50cyA9IGQzLm1lcmdlKHNlZ21lbnRzKTtcbiAgICAgICAgICB2YXIgY2xpcFN0YXJ0SW5zaWRlID0gaW5zaWRlUG9seWdvbihbIHgwLCB5MSBdKSwgaW5zaWRlID0gY2xlYW4gJiYgY2xpcFN0YXJ0SW5zaWRlLCB2aXNpYmxlID0gc2VnbWVudHMubGVuZ3RoO1xuICAgICAgICAgIGlmIChpbnNpZGUgfHwgdmlzaWJsZSkge1xuICAgICAgICAgICAgbGlzdGVuZXIucG9seWdvblN0YXJ0KCk7XG4gICAgICAgICAgICBpZiAoaW5zaWRlKSB7XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpbmVTdGFydCgpO1xuICAgICAgICAgICAgICBpbnRlcnBvbGF0ZShudWxsLCBudWxsLCAxLCBsaXN0ZW5lcik7XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpbmVFbmQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh2aXNpYmxlKSB7XG4gICAgICAgICAgICAgIGQzX2dlb19jbGlwUG9seWdvbihzZWdtZW50cywgY29tcGFyZSwgY2xpcFN0YXJ0SW5zaWRlLCBpbnRlcnBvbGF0ZSwgbGlzdGVuZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGlzdGVuZXIucG9seWdvbkVuZCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzZWdtZW50cyA9IHBvbHlnb24gPSByaW5nID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIGZ1bmN0aW9uIGluc2lkZVBvbHlnb24ocCkge1xuICAgICAgICB2YXIgd24gPSAwLCBuID0gcG9seWdvbi5sZW5ndGgsIHkgPSBwWzFdO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgICAgIGZvciAodmFyIGogPSAxLCB2ID0gcG9seWdvbltpXSwgbSA9IHYubGVuZ3RoLCBhID0gdlswXSwgYjsgaiA8IG07ICsraikge1xuICAgICAgICAgICAgYiA9IHZbal07XG4gICAgICAgICAgICBpZiAoYVsxXSA8PSB5KSB7XG4gICAgICAgICAgICAgIGlmIChiWzFdID4geSAmJiBkM19jcm9zczJkKGEsIGIsIHApID4gMCkgKyt3bjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChiWzFdIDw9IHkgJiYgZDNfY3Jvc3MyZChhLCBiLCBwKSA8IDApIC0td247XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhID0gYjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHduICE9PSAwO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gaW50ZXJwb2xhdGUoZnJvbSwgdG8sIGRpcmVjdGlvbiwgbGlzdGVuZXIpIHtcbiAgICAgICAgdmFyIGEgPSAwLCBhMSA9IDA7XG4gICAgICAgIGlmIChmcm9tID09IG51bGwgfHwgKGEgPSBjb3JuZXIoZnJvbSwgZGlyZWN0aW9uKSkgIT09IChhMSA9IGNvcm5lcih0bywgZGlyZWN0aW9uKSkgfHwgY29tcGFyZVBvaW50cyhmcm9tLCB0bykgPCAwIF4gZGlyZWN0aW9uID4gMCkge1xuICAgICAgICAgIGRvIHtcbiAgICAgICAgICAgIGxpc3RlbmVyLnBvaW50KGEgPT09IDAgfHwgYSA9PT0gMyA/IHgwIDogeDEsIGEgPiAxID8geTEgOiB5MCk7XG4gICAgICAgICAgfSB3aGlsZSAoKGEgPSAoYSArIGRpcmVjdGlvbiArIDQpICUgNCkgIT09IGExKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsaXN0ZW5lci5wb2ludCh0b1swXSwgdG9bMV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBwb2ludFZpc2libGUoeCwgeSkge1xuICAgICAgICByZXR1cm4geDAgPD0geCAmJiB4IDw9IHgxICYmIHkwIDw9IHkgJiYgeSA8PSB5MTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIHBvaW50KHgsIHkpIHtcbiAgICAgICAgaWYgKHBvaW50VmlzaWJsZSh4LCB5KSkgbGlzdGVuZXIucG9pbnQoeCwgeSk7XG4gICAgICB9XG4gICAgICB2YXIgeF9fLCB5X18sIHZfXywgeF8sIHlfLCB2XywgZmlyc3QsIGNsZWFuO1xuICAgICAgZnVuY3Rpb24gbGluZVN0YXJ0KCkge1xuICAgICAgICBjbGlwLnBvaW50ID0gbGluZVBvaW50O1xuICAgICAgICBpZiAocG9seWdvbikgcG9seWdvbi5wdXNoKHJpbmcgPSBbXSk7XG4gICAgICAgIGZpcnN0ID0gdHJ1ZTtcbiAgICAgICAgdl8gPSBmYWxzZTtcbiAgICAgICAgeF8gPSB5XyA9IE5hTjtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGxpbmVFbmQoKSB7XG4gICAgICAgIGlmIChzZWdtZW50cykge1xuICAgICAgICAgIGxpbmVQb2ludCh4X18sIHlfXyk7XG4gICAgICAgICAgaWYgKHZfXyAmJiB2XykgYnVmZmVyTGlzdGVuZXIucmVqb2luKCk7XG4gICAgICAgICAgc2VnbWVudHMucHVzaChidWZmZXJMaXN0ZW5lci5idWZmZXIoKSk7XG4gICAgICAgIH1cbiAgICAgICAgY2xpcC5wb2ludCA9IHBvaW50O1xuICAgICAgICBpZiAodl8pIGxpc3RlbmVyLmxpbmVFbmQoKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGxpbmVQb2ludCh4LCB5KSB7XG4gICAgICAgIHggPSBNYXRoLm1heCgtZDNfZ2VvX2NsaXBFeHRlbnRNQVgsIE1hdGgubWluKGQzX2dlb19jbGlwRXh0ZW50TUFYLCB4KSk7XG4gICAgICAgIHkgPSBNYXRoLm1heCgtZDNfZ2VvX2NsaXBFeHRlbnRNQVgsIE1hdGgubWluKGQzX2dlb19jbGlwRXh0ZW50TUFYLCB5KSk7XG4gICAgICAgIHZhciB2ID0gcG9pbnRWaXNpYmxlKHgsIHkpO1xuICAgICAgICBpZiAocG9seWdvbikgcmluZy5wdXNoKFsgeCwgeSBdKTtcbiAgICAgICAgaWYgKGZpcnN0KSB7XG4gICAgICAgICAgeF9fID0geCwgeV9fID0geSwgdl9fID0gdjtcbiAgICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgICAgIGlmICh2KSB7XG4gICAgICAgICAgICBsaXN0ZW5lci5saW5lU3RhcnQoKTtcbiAgICAgICAgICAgIGxpc3RlbmVyLnBvaW50KHgsIHkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAodiAmJiB2XykgbGlzdGVuZXIucG9pbnQoeCwgeSk7IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGwgPSB7XG4gICAgICAgICAgICAgIGE6IHtcbiAgICAgICAgICAgICAgICB4OiB4XyxcbiAgICAgICAgICAgICAgICB5OiB5X1xuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBiOiB7XG4gICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICB5OiB5XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAoY2xpcExpbmUobCkpIHtcbiAgICAgICAgICAgICAgaWYgKCF2Xykge1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLmxpbmVTdGFydCgpO1xuICAgICAgICAgICAgICAgIGxpc3RlbmVyLnBvaW50KGwuYS54LCBsLmEueSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgbGlzdGVuZXIucG9pbnQobC5iLngsIGwuYi55KTtcbiAgICAgICAgICAgICAgaWYgKCF2KSBsaXN0ZW5lci5saW5lRW5kKCk7XG4gICAgICAgICAgICAgIGNsZWFuID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHYpIHtcbiAgICAgICAgICAgICAgbGlzdGVuZXIubGluZVN0YXJ0KCk7XG4gICAgICAgICAgICAgIGxpc3RlbmVyLnBvaW50KHgsIHkpO1xuICAgICAgICAgICAgICBjbGVhbiA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB4XyA9IHgsIHlfID0geSwgdl8gPSB2O1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNsaXA7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBjb3JuZXIocCwgZGlyZWN0aW9uKSB7XG4gICAgICByZXR1cm4gYWJzKHBbMF0gLSB4MCkgPCDOtSA/IGRpcmVjdGlvbiA+IDAgPyAwIDogMyA6IGFicyhwWzBdIC0geDEpIDwgzrUgPyBkaXJlY3Rpb24gPiAwID8gMiA6IDEgOiBhYnMocFsxXSAtIHkwKSA8IM61ID8gZGlyZWN0aW9uID4gMCA/IDEgOiAwIDogZGlyZWN0aW9uID4gMCA/IDMgOiAyO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjb21wYXJlKGEsIGIpIHtcbiAgICAgIHJldHVybiBjb21wYXJlUG9pbnRzKGEueCwgYi54KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29tcGFyZVBvaW50cyhhLCBiKSB7XG4gICAgICB2YXIgY2EgPSBjb3JuZXIoYSwgMSksIGNiID0gY29ybmVyKGIsIDEpO1xuICAgICAgcmV0dXJuIGNhICE9PSBjYiA/IGNhIC0gY2IgOiBjYSA9PT0gMCA/IGJbMV0gLSBhWzFdIDogY2EgPT09IDEgPyBhWzBdIC0gYlswXSA6IGNhID09PSAyID8gYVsxXSAtIGJbMV0gOiBiWzBdIC0gYVswXTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2NvbXBvc2UoYSwgYikge1xuICAgIGZ1bmN0aW9uIGNvbXBvc2UoeCwgeSkge1xuICAgICAgcmV0dXJuIHggPSBhKHgsIHkpLCBiKHhbMF0sIHhbMV0pO1xuICAgIH1cbiAgICBpZiAoYS5pbnZlcnQgJiYgYi5pbnZlcnQpIGNvbXBvc2UuaW52ZXJ0ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAgcmV0dXJuIHggPSBiLmludmVydCh4LCB5KSwgeCAmJiBhLmludmVydCh4WzBdLCB4WzFdKTtcbiAgICB9O1xuICAgIHJldHVybiBjb21wb3NlO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19jb25pYyhwcm9qZWN0QXQpIHtcbiAgICB2YXIgz4YwID0gMCwgz4YxID0gz4AgLyAzLCBtID0gZDNfZ2VvX3Byb2plY3Rpb25NdXRhdG9yKHByb2plY3RBdCksIHAgPSBtKM+GMCwgz4YxKTtcbiAgICBwLnBhcmFsbGVscyA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIFsgz4YwIC8gz4AgKiAxODAsIM+GMSAvIM+AICogMTgwIF07XG4gICAgICByZXR1cm4gbSjPhjAgPSBfWzBdICogz4AgLyAxODAsIM+GMSA9IF9bMV0gKiDPgCAvIDE4MCk7XG4gICAgfTtcbiAgICByZXR1cm4gcDtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY29uaWNFcXVhbEFyZWEoz4YwLCDPhjEpIHtcbiAgICB2YXIgc2luz4YwID0gTWF0aC5zaW4oz4YwKSwgbiA9IChzaW7PhjAgKyBNYXRoLnNpbijPhjEpKSAvIDIsIEMgPSAxICsgc2luz4YwICogKDIgKiBuIC0gc2luz4YwKSwgz4EwID0gTWF0aC5zcXJ0KEMpIC8gbjtcbiAgICBmdW5jdGlvbiBmb3J3YXJkKM67LCDPhikge1xuICAgICAgdmFyIM+BID0gTWF0aC5zcXJ0KEMgLSAyICogbiAqIE1hdGguc2luKM+GKSkgLyBuO1xuICAgICAgcmV0dXJuIFsgz4EgKiBNYXRoLnNpbijOuyAqPSBuKSwgz4EwIC0gz4EgKiBNYXRoLmNvcyjOuykgXTtcbiAgICB9XG4gICAgZm9yd2FyZC5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB2YXIgz4EwX3kgPSDPgTAgLSB5O1xuICAgICAgcmV0dXJuIFsgTWF0aC5hdGFuMih4LCDPgTBfeSkgLyBuLCBkM19hc2luKChDIC0gKHggKiB4ICsgz4EwX3kgKiDPgTBfeSkgKiBuICogbikgLyAoMiAqIG4pKSBdO1xuICAgIH07XG4gICAgcmV0dXJuIGZvcndhcmQ7XG4gIH1cbiAgKGQzLmdlby5jb25pY0VxdWFsQXJlYSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM19nZW9fY29uaWMoZDNfZ2VvX2NvbmljRXF1YWxBcmVhKTtcbiAgfSkucmF3ID0gZDNfZ2VvX2NvbmljRXF1YWxBcmVhO1xuICBkMy5nZW8uYWxiZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLmdlby5jb25pY0VxdWFsQXJlYSgpLnJvdGF0ZShbIDk2LCAwIF0pLmNlbnRlcihbIC0uNiwgMzguNyBdKS5wYXJhbGxlbHMoWyAyOS41LCA0NS41IF0pLnNjYWxlKDEwNzApO1xuICB9O1xuICBkMy5nZW8uYWxiZXJzVXNhID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxvd2VyNDggPSBkMy5nZW8uYWxiZXJzKCk7XG4gICAgdmFyIGFsYXNrYSA9IGQzLmdlby5jb25pY0VxdWFsQXJlYSgpLnJvdGF0ZShbIDE1NCwgMCBdKS5jZW50ZXIoWyAtMiwgNTguNSBdKS5wYXJhbGxlbHMoWyA1NSwgNjUgXSk7XG4gICAgdmFyIGhhd2FpaSA9IGQzLmdlby5jb25pY0VxdWFsQXJlYSgpLnJvdGF0ZShbIDE1NywgMCBdKS5jZW50ZXIoWyAtMywgMTkuOSBdKS5wYXJhbGxlbHMoWyA4LCAxOCBdKTtcbiAgICB2YXIgcG9pbnQsIHBvaW50U3RyZWFtID0ge1xuICAgICAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgcG9pbnQgPSBbIHgsIHkgXTtcbiAgICAgIH1cbiAgICB9LCBsb3dlcjQ4UG9pbnQsIGFsYXNrYVBvaW50LCBoYXdhaWlQb2ludDtcbiAgICBmdW5jdGlvbiBhbGJlcnNVc2EoY29vcmRpbmF0ZXMpIHtcbiAgICAgIHZhciB4ID0gY29vcmRpbmF0ZXNbMF0sIHkgPSBjb29yZGluYXRlc1sxXTtcbiAgICAgIHBvaW50ID0gbnVsbDtcbiAgICAgIChsb3dlcjQ4UG9pbnQoeCwgeSksIHBvaW50KSB8fCAoYWxhc2thUG9pbnQoeCwgeSksIHBvaW50KSB8fCBoYXdhaWlQb2ludCh4LCB5KTtcbiAgICAgIHJldHVybiBwb2ludDtcbiAgICB9XG4gICAgYWxiZXJzVXNhLmludmVydCA9IGZ1bmN0aW9uKGNvb3JkaW5hdGVzKSB7XG4gICAgICB2YXIgayA9IGxvd2VyNDguc2NhbGUoKSwgdCA9IGxvd2VyNDgudHJhbnNsYXRlKCksIHggPSAoY29vcmRpbmF0ZXNbMF0gLSB0WzBdKSAvIGssIHkgPSAoY29vcmRpbmF0ZXNbMV0gLSB0WzFdKSAvIGs7XG4gICAgICByZXR1cm4gKHkgPj0gLjEyICYmIHkgPCAuMjM0ICYmIHggPj0gLS40MjUgJiYgeCA8IC0uMjE0ID8gYWxhc2thIDogeSA+PSAuMTY2ICYmIHkgPCAuMjM0ICYmIHggPj0gLS4yMTQgJiYgeCA8IC0uMTE1ID8gaGF3YWlpIDogbG93ZXI0OCkuaW52ZXJ0KGNvb3JkaW5hdGVzKTtcbiAgICB9O1xuICAgIGFsYmVyc1VzYS5zdHJlYW0gPSBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgIHZhciBsb3dlcjQ4U3RyZWFtID0gbG93ZXI0OC5zdHJlYW0oc3RyZWFtKSwgYWxhc2thU3RyZWFtID0gYWxhc2thLnN0cmVhbShzdHJlYW0pLCBoYXdhaWlTdHJlYW0gPSBoYXdhaWkuc3RyZWFtKHN0cmVhbSk7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBwb2ludDogZnVuY3Rpb24oeCwgeSkge1xuICAgICAgICAgIGxvd2VyNDhTdHJlYW0ucG9pbnQoeCwgeSk7XG4gICAgICAgICAgYWxhc2thU3RyZWFtLnBvaW50KHgsIHkpO1xuICAgICAgICAgIGhhd2FpaVN0cmVhbS5wb2ludCh4LCB5KTtcbiAgICAgICAgfSxcbiAgICAgICAgc3BoZXJlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsb3dlcjQ4U3RyZWFtLnNwaGVyZSgpO1xuICAgICAgICAgIGFsYXNrYVN0cmVhbS5zcGhlcmUoKTtcbiAgICAgICAgICBoYXdhaWlTdHJlYW0uc3BoZXJlKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbG93ZXI0OFN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgICAgICBhbGFza2FTdHJlYW0ubGluZVN0YXJ0KCk7XG4gICAgICAgICAgaGF3YWlpU3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgICB9LFxuICAgICAgICBsaW5lRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsb3dlcjQ4U3RyZWFtLmxpbmVFbmQoKTtcbiAgICAgICAgICBhbGFza2FTdHJlYW0ubGluZUVuZCgpO1xuICAgICAgICAgIGhhd2FpaVN0cmVhbS5saW5lRW5kKCk7XG4gICAgICAgIH0sXG4gICAgICAgIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbG93ZXI0OFN0cmVhbS5wb2x5Z29uU3RhcnQoKTtcbiAgICAgICAgICBhbGFza2FTdHJlYW0ucG9seWdvblN0YXJ0KCk7XG4gICAgICAgICAgaGF3YWlpU3RyZWFtLnBvbHlnb25TdGFydCgpO1xuICAgICAgICB9LFxuICAgICAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBsb3dlcjQ4U3RyZWFtLnBvbHlnb25FbmQoKTtcbiAgICAgICAgICBhbGFza2FTdHJlYW0ucG9seWdvbkVuZCgpO1xuICAgICAgICAgIGhhd2FpaVN0cmVhbS5wb2x5Z29uRW5kKCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfTtcbiAgICBhbGJlcnNVc2EucHJlY2lzaW9uID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbG93ZXI0OC5wcmVjaXNpb24oKTtcbiAgICAgIGxvd2VyNDgucHJlY2lzaW9uKF8pO1xuICAgICAgYWxhc2thLnByZWNpc2lvbihfKTtcbiAgICAgIGhhd2FpaS5wcmVjaXNpb24oXyk7XG4gICAgICByZXR1cm4gYWxiZXJzVXNhO1xuICAgIH07XG4gICAgYWxiZXJzVXNhLnNjYWxlID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbG93ZXI0OC5zY2FsZSgpO1xuICAgICAgbG93ZXI0OC5zY2FsZShfKTtcbiAgICAgIGFsYXNrYS5zY2FsZShfICogLjM1KTtcbiAgICAgIGhhd2FpaS5zY2FsZShfKTtcbiAgICAgIHJldHVybiBhbGJlcnNVc2EudHJhbnNsYXRlKGxvd2VyNDgudHJhbnNsYXRlKCkpO1xuICAgIH07XG4gICAgYWxiZXJzVXNhLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGxvd2VyNDgudHJhbnNsYXRlKCk7XG4gICAgICB2YXIgayA9IGxvd2VyNDguc2NhbGUoKSwgeCA9ICtfWzBdLCB5ID0gK19bMV07XG4gICAgICBsb3dlcjQ4UG9pbnQgPSBsb3dlcjQ4LnRyYW5zbGF0ZShfKS5jbGlwRXh0ZW50KFsgWyB4IC0gLjQ1NSAqIGssIHkgLSAuMjM4ICogayBdLCBbIHggKyAuNDU1ICogaywgeSArIC4yMzggKiBrIF0gXSkuc3RyZWFtKHBvaW50U3RyZWFtKS5wb2ludDtcbiAgICAgIGFsYXNrYVBvaW50ID0gYWxhc2thLnRyYW5zbGF0ZShbIHggLSAuMzA3ICogaywgeSArIC4yMDEgKiBrIF0pLmNsaXBFeHRlbnQoWyBbIHggLSAuNDI1ICogayArIM61LCB5ICsgLjEyICogayArIM61IF0sIFsgeCAtIC4yMTQgKiBrIC0gzrUsIHkgKyAuMjM0ICogayAtIM61IF0gXSkuc3RyZWFtKHBvaW50U3RyZWFtKS5wb2ludDtcbiAgICAgIGhhd2FpaVBvaW50ID0gaGF3YWlpLnRyYW5zbGF0ZShbIHggLSAuMjA1ICogaywgeSArIC4yMTIgKiBrIF0pLmNsaXBFeHRlbnQoWyBbIHggLSAuMjE0ICogayArIM61LCB5ICsgLjE2NiAqIGsgKyDOtSBdLCBbIHggLSAuMTE1ICogayAtIM61LCB5ICsgLjIzNCAqIGsgLSDOtSBdIF0pLnN0cmVhbShwb2ludFN0cmVhbSkucG9pbnQ7XG4gICAgICByZXR1cm4gYWxiZXJzVXNhO1xuICAgIH07XG4gICAgcmV0dXJuIGFsYmVyc1VzYS5zY2FsZSgxMDcwKTtcbiAgfTtcbiAgdmFyIGQzX2dlb19wYXRoQXJlYVN1bSwgZDNfZ2VvX3BhdGhBcmVhUG9seWdvbiwgZDNfZ2VvX3BhdGhBcmVhID0ge1xuICAgIHBvaW50OiBkM19ub29wLFxuICAgIGxpbmVTdGFydDogZDNfbm9vcCxcbiAgICBsaW5lRW5kOiBkM19ub29wLFxuICAgIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICBkM19nZW9fcGF0aEFyZWFQb2x5Z29uID0gMDtcbiAgICAgIGQzX2dlb19wYXRoQXJlYS5saW5lU3RhcnQgPSBkM19nZW9fcGF0aEFyZWFSaW5nU3RhcnQ7XG4gICAgfSxcbiAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgIGQzX2dlb19wYXRoQXJlYS5saW5lU3RhcnQgPSBkM19nZW9fcGF0aEFyZWEubGluZUVuZCA9IGQzX2dlb19wYXRoQXJlYS5wb2ludCA9IGQzX25vb3A7XG4gICAgICBkM19nZW9fcGF0aEFyZWFTdW0gKz0gYWJzKGQzX2dlb19wYXRoQXJlYVBvbHlnb24gLyAyKTtcbiAgICB9XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2dlb19wYXRoQXJlYVJpbmdTdGFydCgpIHtcbiAgICB2YXIgeDAwLCB5MDAsIHgwLCB5MDtcbiAgICBkM19nZW9fcGF0aEFyZWEucG9pbnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgICBkM19nZW9fcGF0aEFyZWEucG9pbnQgPSBuZXh0UG9pbnQ7XG4gICAgICB4MDAgPSB4MCA9IHgsIHkwMCA9IHkwID0geTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIG5leHRQb2ludCh4LCB5KSB7XG4gICAgICBkM19nZW9fcGF0aEFyZWFQb2x5Z29uICs9IHkwICogeCAtIHgwICogeTtcbiAgICAgIHgwID0geCwgeTAgPSB5O1xuICAgIH1cbiAgICBkM19nZW9fcGF0aEFyZWEubGluZUVuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgbmV4dFBvaW50KHgwMCwgeTAwKTtcbiAgICB9O1xuICB9XG4gIHZhciBkM19nZW9fcGF0aEJvdW5kc1gwLCBkM19nZW9fcGF0aEJvdW5kc1kwLCBkM19nZW9fcGF0aEJvdW5kc1gxLCBkM19nZW9fcGF0aEJvdW5kc1kxO1xuICB2YXIgZDNfZ2VvX3BhdGhCb3VuZHMgPSB7XG4gICAgcG9pbnQ6IGQzX2dlb19wYXRoQm91bmRzUG9pbnQsXG4gICAgbGluZVN0YXJ0OiBkM19ub29wLFxuICAgIGxpbmVFbmQ6IGQzX25vb3AsXG4gICAgcG9seWdvblN0YXJ0OiBkM19ub29wLFxuICAgIHBvbHlnb25FbmQ6IGQzX25vb3BcbiAgfTtcbiAgZnVuY3Rpb24gZDNfZ2VvX3BhdGhCb3VuZHNQb2ludCh4LCB5KSB7XG4gICAgaWYgKHggPCBkM19nZW9fcGF0aEJvdW5kc1gwKSBkM19nZW9fcGF0aEJvdW5kc1gwID0geDtcbiAgICBpZiAoeCA+IGQzX2dlb19wYXRoQm91bmRzWDEpIGQzX2dlb19wYXRoQm91bmRzWDEgPSB4O1xuICAgIGlmICh5IDwgZDNfZ2VvX3BhdGhCb3VuZHNZMCkgZDNfZ2VvX3BhdGhCb3VuZHNZMCA9IHk7XG4gICAgaWYgKHkgPiBkM19nZW9fcGF0aEJvdW5kc1kxKSBkM19nZW9fcGF0aEJvdW5kc1kxID0geTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fcGF0aEJ1ZmZlcigpIHtcbiAgICB2YXIgcG9pbnRDaXJjbGUgPSBkM19nZW9fcGF0aEJ1ZmZlckNpcmNsZSg0LjUpLCBidWZmZXIgPSBbXTtcbiAgICB2YXIgc3RyZWFtID0ge1xuICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RyZWFtLnBvaW50ID0gcG9pbnRMaW5lU3RhcnQ7XG4gICAgICB9LFxuICAgICAgbGluZUVuZDogbGluZUVuZCxcbiAgICAgIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0cmVhbS5saW5lRW5kID0gbGluZUVuZFBvbHlnb247XG4gICAgICB9LFxuICAgICAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0cmVhbS5saW5lRW5kID0gbGluZUVuZDtcbiAgICAgICAgc3RyZWFtLnBvaW50ID0gcG9pbnQ7XG4gICAgICB9LFxuICAgICAgcG9pbnRSYWRpdXM6IGZ1bmN0aW9uKF8pIHtcbiAgICAgICAgcG9pbnRDaXJjbGUgPSBkM19nZW9fcGF0aEJ1ZmZlckNpcmNsZShfKTtcbiAgICAgICAgcmV0dXJuIHN0cmVhbTtcbiAgICAgIH0sXG4gICAgICByZXN1bHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoYnVmZmVyLmxlbmd0aCkge1xuICAgICAgICAgIHZhciByZXN1bHQgPSBidWZmZXIuam9pbihcIlwiKTtcbiAgICAgICAgICBidWZmZXIgPSBbXTtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgICBmdW5jdGlvbiBwb2ludCh4LCB5KSB7XG4gICAgICBidWZmZXIucHVzaChcIk1cIiwgeCwgXCIsXCIsIHksIHBvaW50Q2lyY2xlKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcG9pbnRMaW5lU3RhcnQoeCwgeSkge1xuICAgICAgYnVmZmVyLnB1c2goXCJNXCIsIHgsIFwiLFwiLCB5KTtcbiAgICAgIHN0cmVhbS5wb2ludCA9IHBvaW50TGluZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcG9pbnRMaW5lKHgsIHkpIHtcbiAgICAgIGJ1ZmZlci5wdXNoKFwiTFwiLCB4LCBcIixcIiwgeSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGxpbmVFbmQoKSB7XG4gICAgICBzdHJlYW0ucG9pbnQgPSBwb2ludDtcbiAgICB9XG4gICAgZnVuY3Rpb24gbGluZUVuZFBvbHlnb24oKSB7XG4gICAgICBidWZmZXIucHVzaChcIlpcIik7XG4gICAgfVxuICAgIHJldHVybiBzdHJlYW07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX3BhdGhCdWZmZXJDaXJjbGUocmFkaXVzKSB7XG4gICAgcmV0dXJuIFwibTAsXCIgKyByYWRpdXMgKyBcImFcIiArIHJhZGl1cyArIFwiLFwiICsgcmFkaXVzICsgXCIgMCAxLDEgMCxcIiArIC0yICogcmFkaXVzICsgXCJhXCIgKyByYWRpdXMgKyBcIixcIiArIHJhZGl1cyArIFwiIDAgMSwxIDAsXCIgKyAyICogcmFkaXVzICsgXCJ6XCI7XG4gIH1cbiAgdmFyIGQzX2dlb19wYXRoQ2VudHJvaWQgPSB7XG4gICAgcG9pbnQ6IGQzX2dlb19wYXRoQ2VudHJvaWRQb2ludCxcbiAgICBsaW5lU3RhcnQ6IGQzX2dlb19wYXRoQ2VudHJvaWRMaW5lU3RhcnQsXG4gICAgbGluZUVuZDogZDNfZ2VvX3BhdGhDZW50cm9pZExpbmVFbmQsXG4gICAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIGQzX2dlb19wYXRoQ2VudHJvaWQubGluZVN0YXJ0ID0gZDNfZ2VvX3BhdGhDZW50cm9pZFJpbmdTdGFydDtcbiAgICB9LFxuICAgIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgZDNfZ2VvX3BhdGhDZW50cm9pZC5wb2ludCA9IGQzX2dlb19wYXRoQ2VudHJvaWRQb2ludDtcbiAgICAgIGQzX2dlb19wYXRoQ2VudHJvaWQubGluZVN0YXJ0ID0gZDNfZ2VvX3BhdGhDZW50cm9pZExpbmVTdGFydDtcbiAgICAgIGQzX2dlb19wYXRoQ2VudHJvaWQubGluZUVuZCA9IGQzX2dlb19wYXRoQ2VudHJvaWRMaW5lRW5kO1xuICAgIH1cbiAgfTtcbiAgZnVuY3Rpb24gZDNfZ2VvX3BhdGhDZW50cm9pZFBvaW50KHgsIHkpIHtcbiAgICBkM19nZW9fY2VudHJvaWRYMCArPSB4O1xuICAgIGQzX2dlb19jZW50cm9pZFkwICs9IHk7XG4gICAgKytkM19nZW9fY2VudHJvaWRaMDtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fcGF0aENlbnRyb2lkTGluZVN0YXJ0KCkge1xuICAgIHZhciB4MCwgeTA7XG4gICAgZDNfZ2VvX3BhdGhDZW50cm9pZC5wb2ludCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIGQzX2dlb19wYXRoQ2VudHJvaWQucG9pbnQgPSBuZXh0UG9pbnQ7XG4gICAgICBkM19nZW9fcGF0aENlbnRyb2lkUG9pbnQoeDAgPSB4LCB5MCA9IHkpO1xuICAgIH07XG4gICAgZnVuY3Rpb24gbmV4dFBvaW50KHgsIHkpIHtcbiAgICAgIHZhciBkeCA9IHggLSB4MCwgZHkgPSB5IC0geTAsIHogPSBNYXRoLnNxcnQoZHggKiBkeCArIGR5ICogZHkpO1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkWDEgKz0geiAqICh4MCArIHgpIC8gMjtcbiAgICAgIGQzX2dlb19jZW50cm9pZFkxICs9IHogKiAoeTAgKyB5KSAvIDI7XG4gICAgICBkM19nZW9fY2VudHJvaWRaMSArPSB6O1xuICAgICAgZDNfZ2VvX3BhdGhDZW50cm9pZFBvaW50KHgwID0geCwgeTAgPSB5KTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX3BhdGhDZW50cm9pZExpbmVFbmQoKSB7XG4gICAgZDNfZ2VvX3BhdGhDZW50cm9pZC5wb2ludCA9IGQzX2dlb19wYXRoQ2VudHJvaWRQb2ludDtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fcGF0aENlbnRyb2lkUmluZ1N0YXJ0KCkge1xuICAgIHZhciB4MDAsIHkwMCwgeDAsIHkwO1xuICAgIGQzX2dlb19wYXRoQ2VudHJvaWQucG9pbnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgICBkM19nZW9fcGF0aENlbnRyb2lkLnBvaW50ID0gbmV4dFBvaW50O1xuICAgICAgZDNfZ2VvX3BhdGhDZW50cm9pZFBvaW50KHgwMCA9IHgwID0geCwgeTAwID0geTAgPSB5KTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIG5leHRQb2ludCh4LCB5KSB7XG4gICAgICB2YXIgZHggPSB4IC0geDAsIGR5ID0geSAtIHkwLCB6ID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgICAgIGQzX2dlb19jZW50cm9pZFgxICs9IHogKiAoeDAgKyB4KSAvIDI7XG4gICAgICBkM19nZW9fY2VudHJvaWRZMSArPSB6ICogKHkwICsgeSkgLyAyO1xuICAgICAgZDNfZ2VvX2NlbnRyb2lkWjEgKz0gejtcbiAgICAgIHogPSB5MCAqIHggLSB4MCAqIHk7XG4gICAgICBkM19nZW9fY2VudHJvaWRYMiArPSB6ICogKHgwICsgeCk7XG4gICAgICBkM19nZW9fY2VudHJvaWRZMiArPSB6ICogKHkwICsgeSk7XG4gICAgICBkM19nZW9fY2VudHJvaWRaMiArPSB6ICogMztcbiAgICAgIGQzX2dlb19wYXRoQ2VudHJvaWRQb2ludCh4MCA9IHgsIHkwID0geSk7XG4gICAgfVxuICAgIGQzX2dlb19wYXRoQ2VudHJvaWQubGluZUVuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgbmV4dFBvaW50KHgwMCwgeTAwKTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19wYXRoQ29udGV4dChjb250ZXh0KSB7XG4gICAgdmFyIHBvaW50UmFkaXVzID0gNC41O1xuICAgIHZhciBzdHJlYW0gPSB7XG4gICAgICBwb2ludDogcG9pbnQsXG4gICAgICBsaW5lU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdHJlYW0ucG9pbnQgPSBwb2ludExpbmVTdGFydDtcbiAgICAgIH0sXG4gICAgICBsaW5lRW5kOiBsaW5lRW5kLFxuICAgICAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RyZWFtLmxpbmVFbmQgPSBsaW5lRW5kUG9seWdvbjtcbiAgICAgIH0sXG4gICAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RyZWFtLmxpbmVFbmQgPSBsaW5lRW5kO1xuICAgICAgICBzdHJlYW0ucG9pbnQgPSBwb2ludDtcbiAgICAgIH0sXG4gICAgICBwb2ludFJhZGl1czogZnVuY3Rpb24oXykge1xuICAgICAgICBwb2ludFJhZGl1cyA9IF87XG4gICAgICAgIHJldHVybiBzdHJlYW07XG4gICAgICB9LFxuICAgICAgcmVzdWx0OiBkM19ub29wXG4gICAgfTtcbiAgICBmdW5jdGlvbiBwb2ludCh4LCB5KSB7XG4gICAgICBjb250ZXh0Lm1vdmVUbyh4LCB5KTtcbiAgICAgIGNvbnRleHQuYXJjKHgsIHksIHBvaW50UmFkaXVzLCAwLCDPhCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHBvaW50TGluZVN0YXJ0KHgsIHkpIHtcbiAgICAgIGNvbnRleHQubW92ZVRvKHgsIHkpO1xuICAgICAgc3RyZWFtLnBvaW50ID0gcG9pbnRMaW5lO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwb2ludExpbmUoeCwgeSkge1xuICAgICAgY29udGV4dC5saW5lVG8oeCwgeSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGxpbmVFbmQoKSB7XG4gICAgICBzdHJlYW0ucG9pbnQgPSBwb2ludDtcbiAgICB9XG4gICAgZnVuY3Rpb24gbGluZUVuZFBvbHlnb24oKSB7XG4gICAgICBjb250ZXh0LmNsb3NlUGF0aCgpO1xuICAgIH1cbiAgICByZXR1cm4gc3RyZWFtO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19yZXNhbXBsZShwcm9qZWN0KSB7XG4gICAgdmFyIM60MiA9IC41LCBjb3NNaW5EaXN0YW5jZSA9IE1hdGguY29zKDMwICogZDNfcmFkaWFucyksIG1heERlcHRoID0gMTY7XG4gICAgZnVuY3Rpb24gcmVzYW1wbGUoc3RyZWFtKSB7XG4gICAgICByZXR1cm4gKG1heERlcHRoID8gcmVzYW1wbGVSZWN1cnNpdmUgOiByZXNhbXBsZU5vbmUpKHN0cmVhbSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlc2FtcGxlTm9uZShzdHJlYW0pIHtcbiAgICAgIHJldHVybiBkM19nZW9fdHJhbnNmb3JtUG9pbnQoc3RyZWFtLCBmdW5jdGlvbih4LCB5KSB7XG4gICAgICAgIHggPSBwcm9qZWN0KHgsIHkpO1xuICAgICAgICBzdHJlYW0ucG9pbnQoeFswXSwgeFsxXSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVzYW1wbGVSZWN1cnNpdmUoc3RyZWFtKSB7XG4gICAgICB2YXIgzrswMCwgz4YwMCwgeDAwLCB5MDAsIGEwMCwgYjAwLCBjMDAsIM67MCwgeDAsIHkwLCBhMCwgYjAsIGMwO1xuICAgICAgdmFyIHJlc2FtcGxlID0ge1xuICAgICAgICBwb2ludDogcG9pbnQsXG4gICAgICAgIGxpbmVTdGFydDogbGluZVN0YXJ0LFxuICAgICAgICBsaW5lRW5kOiBsaW5lRW5kLFxuICAgICAgICBwb2x5Z29uU3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHN0cmVhbS5wb2x5Z29uU3RhcnQoKTtcbiAgICAgICAgICByZXNhbXBsZS5saW5lU3RhcnQgPSByaW5nU3RhcnQ7XG4gICAgICAgIH0sXG4gICAgICAgIHBvbHlnb25FbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHN0cmVhbS5wb2x5Z29uRW5kKCk7XG4gICAgICAgICAgcmVzYW1wbGUubGluZVN0YXJ0ID0gbGluZVN0YXJ0O1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgZnVuY3Rpb24gcG9pbnQoeCwgeSkge1xuICAgICAgICB4ID0gcHJvamVjdCh4LCB5KTtcbiAgICAgICAgc3RyZWFtLnBvaW50KHhbMF0sIHhbMV0pO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gbGluZVN0YXJ0KCkge1xuICAgICAgICB4MCA9IE5hTjtcbiAgICAgICAgcmVzYW1wbGUucG9pbnQgPSBsaW5lUG9pbnQ7XG4gICAgICAgIHN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGxpbmVQb2ludCjOuywgz4YpIHtcbiAgICAgICAgdmFyIGMgPSBkM19nZW9fY2FydGVzaWFuKFsgzrssIM+GIF0pLCBwID0gcHJvamVjdCjOuywgz4YpO1xuICAgICAgICByZXNhbXBsZUxpbmVUbyh4MCwgeTAsIM67MCwgYTAsIGIwLCBjMCwgeDAgPSBwWzBdLCB5MCA9IHBbMV0sIM67MCA9IM67LCBhMCA9IGNbMF0sIGIwID0gY1sxXSwgYzAgPSBjWzJdLCBtYXhEZXB0aCwgc3RyZWFtKTtcbiAgICAgICAgc3RyZWFtLnBvaW50KHgwLCB5MCk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBsaW5lRW5kKCkge1xuICAgICAgICByZXNhbXBsZS5wb2ludCA9IHBvaW50O1xuICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gcmluZ1N0YXJ0KCkge1xuICAgICAgICBsaW5lU3RhcnQoKTtcbiAgICAgICAgcmVzYW1wbGUucG9pbnQgPSByaW5nUG9pbnQ7XG4gICAgICAgIHJlc2FtcGxlLmxpbmVFbmQgPSByaW5nRW5kO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gcmluZ1BvaW50KM67LCDPhikge1xuICAgICAgICBsaW5lUG9pbnQozrswMCA9IM67LCDPhjAwID0gz4YpLCB4MDAgPSB4MCwgeTAwID0geTAsIGEwMCA9IGEwLCBiMDAgPSBiMCwgYzAwID0gYzA7XG4gICAgICAgIHJlc2FtcGxlLnBvaW50ID0gbGluZVBvaW50O1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gcmluZ0VuZCgpIHtcbiAgICAgICAgcmVzYW1wbGVMaW5lVG8oeDAsIHkwLCDOuzAsIGEwLCBiMCwgYzAsIHgwMCwgeTAwLCDOuzAwLCBhMDAsIGIwMCwgYzAwLCBtYXhEZXB0aCwgc3RyZWFtKTtcbiAgICAgICAgcmVzYW1wbGUubGluZUVuZCA9IGxpbmVFbmQ7XG4gICAgICAgIGxpbmVFbmQoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNhbXBsZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVzYW1wbGVMaW5lVG8oeDAsIHkwLCDOuzAsIGEwLCBiMCwgYzAsIHgxLCB5MSwgzrsxLCBhMSwgYjEsIGMxLCBkZXB0aCwgc3RyZWFtKSB7XG4gICAgICB2YXIgZHggPSB4MSAtIHgwLCBkeSA9IHkxIC0geTAsIGQyID0gZHggKiBkeCArIGR5ICogZHk7XG4gICAgICBpZiAoZDIgPiA0ICogzrQyICYmIGRlcHRoLS0pIHtcbiAgICAgICAgdmFyIGEgPSBhMCArIGExLCBiID0gYjAgKyBiMSwgYyA9IGMwICsgYzEsIG0gPSBNYXRoLnNxcnQoYSAqIGEgKyBiICogYiArIGMgKiBjKSwgz4YyID0gTWF0aC5hc2luKGMgLz0gbSksIM67MiA9IGFicyhhYnMoYykgLSAxKSA8IM61IHx8IGFicyjOuzAgLSDOuzEpIDwgzrUgPyAozrswICsgzrsxKSAvIDIgOiBNYXRoLmF0YW4yKGIsIGEpLCBwID0gcHJvamVjdCjOuzIsIM+GMiksIHgyID0gcFswXSwgeTIgPSBwWzFdLCBkeDIgPSB4MiAtIHgwLCBkeTIgPSB5MiAtIHkwLCBkeiA9IGR5ICogZHgyIC0gZHggKiBkeTI7XG4gICAgICAgIGlmIChkeiAqIGR6IC8gZDIgPiDOtDIgfHwgYWJzKChkeCAqIGR4MiArIGR5ICogZHkyKSAvIGQyIC0gLjUpID4gLjMgfHwgYTAgKiBhMSArIGIwICogYjEgKyBjMCAqIGMxIDwgY29zTWluRGlzdGFuY2UpIHtcbiAgICAgICAgICByZXNhbXBsZUxpbmVUbyh4MCwgeTAsIM67MCwgYTAsIGIwLCBjMCwgeDIsIHkyLCDOuzIsIGEgLz0gbSwgYiAvPSBtLCBjLCBkZXB0aCwgc3RyZWFtKTtcbiAgICAgICAgICBzdHJlYW0ucG9pbnQoeDIsIHkyKTtcbiAgICAgICAgICByZXNhbXBsZUxpbmVUbyh4MiwgeTIsIM67MiwgYSwgYiwgYywgeDEsIHkxLCDOuzEsIGExLCBiMSwgYzEsIGRlcHRoLCBzdHJlYW0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJlc2FtcGxlLnByZWNpc2lvbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIE1hdGguc3FydCjOtDIpO1xuICAgICAgbWF4RGVwdGggPSAozrQyID0gXyAqIF8pID4gMCAmJiAxNjtcbiAgICAgIHJldHVybiByZXNhbXBsZTtcbiAgICB9O1xuICAgIHJldHVybiByZXNhbXBsZTtcbiAgfVxuICBkMy5nZW8ucGF0aCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwb2ludFJhZGl1cyA9IDQuNSwgcHJvamVjdGlvbiwgY29udGV4dCwgcHJvamVjdFN0cmVhbSwgY29udGV4dFN0cmVhbSwgY2FjaGVTdHJlYW07XG4gICAgZnVuY3Rpb24gcGF0aChvYmplY3QpIHtcbiAgICAgIGlmIChvYmplY3QpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwb2ludFJhZGl1cyA9PT0gXCJmdW5jdGlvblwiKSBjb250ZXh0U3RyZWFtLnBvaW50UmFkaXVzKCtwb2ludFJhZGl1cy5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgICAgICAgaWYgKCFjYWNoZVN0cmVhbSB8fCAhY2FjaGVTdHJlYW0udmFsaWQpIGNhY2hlU3RyZWFtID0gcHJvamVjdFN0cmVhbShjb250ZXh0U3RyZWFtKTtcbiAgICAgICAgZDMuZ2VvLnN0cmVhbShvYmplY3QsIGNhY2hlU3RyZWFtKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjb250ZXh0U3RyZWFtLnJlc3VsdCgpO1xuICAgIH1cbiAgICBwYXRoLmFyZWEgPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICAgIGQzX2dlb19wYXRoQXJlYVN1bSA9IDA7XG4gICAgICBkMy5nZW8uc3RyZWFtKG9iamVjdCwgcHJvamVjdFN0cmVhbShkM19nZW9fcGF0aEFyZWEpKTtcbiAgICAgIHJldHVybiBkM19nZW9fcGF0aEFyZWFTdW07XG4gICAgfTtcbiAgICBwYXRoLmNlbnRyb2lkID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICBkM19nZW9fY2VudHJvaWRYMCA9IGQzX2dlb19jZW50cm9pZFkwID0gZDNfZ2VvX2NlbnRyb2lkWjAgPSBkM19nZW9fY2VudHJvaWRYMSA9IGQzX2dlb19jZW50cm9pZFkxID0gZDNfZ2VvX2NlbnRyb2lkWjEgPSBkM19nZW9fY2VudHJvaWRYMiA9IGQzX2dlb19jZW50cm9pZFkyID0gZDNfZ2VvX2NlbnRyb2lkWjIgPSAwO1xuICAgICAgZDMuZ2VvLnN0cmVhbShvYmplY3QsIHByb2plY3RTdHJlYW0oZDNfZ2VvX3BhdGhDZW50cm9pZCkpO1xuICAgICAgcmV0dXJuIGQzX2dlb19jZW50cm9pZFoyID8gWyBkM19nZW9fY2VudHJvaWRYMiAvIGQzX2dlb19jZW50cm9pZFoyLCBkM19nZW9fY2VudHJvaWRZMiAvIGQzX2dlb19jZW50cm9pZFoyIF0gOiBkM19nZW9fY2VudHJvaWRaMSA/IFsgZDNfZ2VvX2NlbnRyb2lkWDEgLyBkM19nZW9fY2VudHJvaWRaMSwgZDNfZ2VvX2NlbnRyb2lkWTEgLyBkM19nZW9fY2VudHJvaWRaMSBdIDogZDNfZ2VvX2NlbnRyb2lkWjAgPyBbIGQzX2dlb19jZW50cm9pZFgwIC8gZDNfZ2VvX2NlbnRyb2lkWjAsIGQzX2dlb19jZW50cm9pZFkwIC8gZDNfZ2VvX2NlbnRyb2lkWjAgXSA6IFsgTmFOLCBOYU4gXTtcbiAgICB9O1xuICAgIHBhdGguYm91bmRzID0gZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICBkM19nZW9fcGF0aEJvdW5kc1gxID0gZDNfZ2VvX3BhdGhCb3VuZHNZMSA9IC0oZDNfZ2VvX3BhdGhCb3VuZHNYMCA9IGQzX2dlb19wYXRoQm91bmRzWTAgPSBJbmZpbml0eSk7XG4gICAgICBkMy5nZW8uc3RyZWFtKG9iamVjdCwgcHJvamVjdFN0cmVhbShkM19nZW9fcGF0aEJvdW5kcykpO1xuICAgICAgcmV0dXJuIFsgWyBkM19nZW9fcGF0aEJvdW5kc1gwLCBkM19nZW9fcGF0aEJvdW5kc1kwIF0sIFsgZDNfZ2VvX3BhdGhCb3VuZHNYMSwgZDNfZ2VvX3BhdGhCb3VuZHNZMSBdIF07XG4gICAgfTtcbiAgICBwYXRoLnByb2plY3Rpb24gPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBwcm9qZWN0aW9uO1xuICAgICAgcHJvamVjdFN0cmVhbSA9IChwcm9qZWN0aW9uID0gXykgPyBfLnN0cmVhbSB8fCBkM19nZW9fcGF0aFByb2plY3RTdHJlYW0oXykgOiBkM19pZGVudGl0eTtcbiAgICAgIHJldHVybiByZXNldCgpO1xuICAgIH07XG4gICAgcGF0aC5jb250ZXh0ID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY29udGV4dDtcbiAgICAgIGNvbnRleHRTdHJlYW0gPSAoY29udGV4dCA9IF8pID09IG51bGwgPyBuZXcgZDNfZ2VvX3BhdGhCdWZmZXIoKSA6IG5ldyBkM19nZW9fcGF0aENvbnRleHQoXyk7XG4gICAgICBpZiAodHlwZW9mIHBvaW50UmFkaXVzICE9PSBcImZ1bmN0aW9uXCIpIGNvbnRleHRTdHJlYW0ucG9pbnRSYWRpdXMocG9pbnRSYWRpdXMpO1xuICAgICAgcmV0dXJuIHJlc2V0KCk7XG4gICAgfTtcbiAgICBwYXRoLnBvaW50UmFkaXVzID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcG9pbnRSYWRpdXM7XG4gICAgICBwb2ludFJhZGl1cyA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogKGNvbnRleHRTdHJlYW0ucG9pbnRSYWRpdXMoK18pLCArXyk7XG4gICAgICByZXR1cm4gcGF0aDtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgICAgY2FjaGVTdHJlYW0gPSBudWxsO1xuICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfVxuICAgIHJldHVybiBwYXRoLnByb2plY3Rpb24oZDMuZ2VvLmFsYmVyc1VzYSgpKS5jb250ZXh0KG51bGwpO1xuICB9O1xuICBmdW5jdGlvbiBkM19nZW9fcGF0aFByb2plY3RTdHJlYW0ocHJvamVjdCkge1xuICAgIHZhciByZXNhbXBsZSA9IGQzX2dlb19yZXNhbXBsZShmdW5jdGlvbih4LCB5KSB7XG4gICAgICByZXR1cm4gcHJvamVjdChbIHggKiBkM19kZWdyZWVzLCB5ICogZDNfZGVncmVlcyBdKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICByZXR1cm4gZDNfZ2VvX3Byb2plY3Rpb25SYWRpYW5zKHJlc2FtcGxlKHN0cmVhbSkpO1xuICAgIH07XG4gIH1cbiAgZDMuZ2VvLnRyYW5zZm9ybSA9IGZ1bmN0aW9uKG1ldGhvZHMpIHtcbiAgICByZXR1cm4ge1xuICAgICAgc3RyZWFtOiBmdW5jdGlvbihzdHJlYW0pIHtcbiAgICAgICAgdmFyIHRyYW5zZm9ybSA9IG5ldyBkM19nZW9fdHJhbnNmb3JtKHN0cmVhbSk7XG4gICAgICAgIGZvciAodmFyIGsgaW4gbWV0aG9kcykgdHJhbnNmb3JtW2tdID0gbWV0aG9kc1trXTtcbiAgICAgICAgcmV0dXJuIHRyYW5zZm9ybTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuICBmdW5jdGlvbiBkM19nZW9fdHJhbnNmb3JtKHN0cmVhbSkge1xuICAgIHRoaXMuc3RyZWFtID0gc3RyZWFtO1xuICB9XG4gIGQzX2dlb190cmFuc2Zvcm0ucHJvdG90eXBlID0ge1xuICAgIHBvaW50OiBmdW5jdGlvbih4LCB5KSB7XG4gICAgICB0aGlzLnN0cmVhbS5wb2ludCh4LCB5KTtcbiAgICB9LFxuICAgIHNwaGVyZTogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnN0cmVhbS5zcGhlcmUoKTtcbiAgICB9LFxuICAgIGxpbmVTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnN0cmVhbS5saW5lU3RhcnQoKTtcbiAgICB9LFxuICAgIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5zdHJlYW0ubGluZUVuZCgpO1xuICAgIH0sXG4gICAgcG9seWdvblN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuc3RyZWFtLnBvbHlnb25TdGFydCgpO1xuICAgIH0sXG4gICAgcG9seWdvbkVuZDogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnN0cmVhbS5wb2x5Z29uRW5kKCk7XG4gICAgfVxuICB9O1xuICBmdW5jdGlvbiBkM19nZW9fdHJhbnNmb3JtUG9pbnQoc3RyZWFtLCBwb2ludCkge1xuICAgIHJldHVybiB7XG4gICAgICBwb2ludDogcG9pbnQsXG4gICAgICBzcGhlcmU6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdHJlYW0uc3BoZXJlKCk7XG4gICAgICB9LFxuICAgICAgbGluZVN0YXJ0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RyZWFtLmxpbmVTdGFydCgpO1xuICAgICAgfSxcbiAgICAgIGxpbmVFbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBzdHJlYW0ubGluZUVuZCgpO1xuICAgICAgfSxcbiAgICAgIHBvbHlnb25TdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHN0cmVhbS5wb2x5Z29uU3RhcnQoKTtcbiAgICAgIH0sXG4gICAgICBwb2x5Z29uRW5kOiBmdW5jdGlvbigpIHtcbiAgICAgICAgc3RyZWFtLnBvbHlnb25FbmQoKTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG4gIGQzLmdlby5wcm9qZWN0aW9uID0gZDNfZ2VvX3Byb2plY3Rpb247XG4gIGQzLmdlby5wcm9qZWN0aW9uTXV0YXRvciA9IGQzX2dlb19wcm9qZWN0aW9uTXV0YXRvcjtcbiAgZnVuY3Rpb24gZDNfZ2VvX3Byb2plY3Rpb24ocHJvamVjdCkge1xuICAgIHJldHVybiBkM19nZW9fcHJvamVjdGlvbk11dGF0b3IoZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcHJvamVjdDtcbiAgICB9KSgpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19wcm9qZWN0aW9uTXV0YXRvcihwcm9qZWN0QXQpIHtcbiAgICB2YXIgcHJvamVjdCwgcm90YXRlLCBwcm9qZWN0Um90YXRlLCBwcm9qZWN0UmVzYW1wbGUgPSBkM19nZW9fcmVzYW1wbGUoZnVuY3Rpb24oeCwgeSkge1xuICAgICAgeCA9IHByb2plY3QoeCwgeSk7XG4gICAgICByZXR1cm4gWyB4WzBdICogayArIM60eCwgzrR5IC0geFsxXSAqIGsgXTtcbiAgICB9KSwgayA9IDE1MCwgeCA9IDQ4MCwgeSA9IDI1MCwgzrsgPSAwLCDPhiA9IDAsIM60zrsgPSAwLCDOtM+GID0gMCwgzrTOsyA9IDAsIM60eCwgzrR5LCBwcmVjbGlwID0gZDNfZ2VvX2NsaXBBbnRpbWVyaWRpYW4sIHBvc3RjbGlwID0gZDNfaWRlbnRpdHksIGNsaXBBbmdsZSA9IG51bGwsIGNsaXBFeHRlbnQgPSBudWxsLCBzdHJlYW07XG4gICAgZnVuY3Rpb24gcHJvamVjdGlvbihwb2ludCkge1xuICAgICAgcG9pbnQgPSBwcm9qZWN0Um90YXRlKHBvaW50WzBdICogZDNfcmFkaWFucywgcG9pbnRbMV0gKiBkM19yYWRpYW5zKTtcbiAgICAgIHJldHVybiBbIHBvaW50WzBdICogayArIM60eCwgzrR5IC0gcG9pbnRbMV0gKiBrIF07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGludmVydChwb2ludCkge1xuICAgICAgcG9pbnQgPSBwcm9qZWN0Um90YXRlLmludmVydCgocG9pbnRbMF0gLSDOtHgpIC8gaywgKM60eSAtIHBvaW50WzFdKSAvIGspO1xuICAgICAgcmV0dXJuIHBvaW50ICYmIFsgcG9pbnRbMF0gKiBkM19kZWdyZWVzLCBwb2ludFsxXSAqIGQzX2RlZ3JlZXMgXTtcbiAgICB9XG4gICAgcHJvamVjdGlvbi5zdHJlYW0gPSBmdW5jdGlvbihvdXRwdXQpIHtcbiAgICAgIGlmIChzdHJlYW0pIHN0cmVhbS52YWxpZCA9IGZhbHNlO1xuICAgICAgc3RyZWFtID0gZDNfZ2VvX3Byb2plY3Rpb25SYWRpYW5zKHByZWNsaXAocm90YXRlLCBwcm9qZWN0UmVzYW1wbGUocG9zdGNsaXAob3V0cHV0KSkpKTtcbiAgICAgIHN0cmVhbS52YWxpZCA9IHRydWU7XG4gICAgICByZXR1cm4gc3RyZWFtO1xuICAgIH07XG4gICAgcHJvamVjdGlvbi5jbGlwQW5nbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjbGlwQW5nbGU7XG4gICAgICBwcmVjbGlwID0gXyA9PSBudWxsID8gKGNsaXBBbmdsZSA9IF8sIGQzX2dlb19jbGlwQW50aW1lcmlkaWFuKSA6IGQzX2dlb19jbGlwQ2lyY2xlKChjbGlwQW5nbGUgPSArXykgKiBkM19yYWRpYW5zKTtcbiAgICAgIHJldHVybiBpbnZhbGlkYXRlKCk7XG4gICAgfTtcbiAgICBwcm9qZWN0aW9uLmNsaXBFeHRlbnQgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjbGlwRXh0ZW50O1xuICAgICAgY2xpcEV4dGVudCA9IF87XG4gICAgICBwb3N0Y2xpcCA9IF8gPyBkM19nZW9fY2xpcEV4dGVudChfWzBdWzBdLCBfWzBdWzFdLCBfWzFdWzBdLCBfWzFdWzFdKSA6IGQzX2lkZW50aXR5O1xuICAgICAgcmV0dXJuIGludmFsaWRhdGUoKTtcbiAgICB9O1xuICAgIHByb2plY3Rpb24uc2NhbGUgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBrO1xuICAgICAgayA9ICtfO1xuICAgICAgcmV0dXJuIHJlc2V0KCk7XG4gICAgfTtcbiAgICBwcm9qZWN0aW9uLnRyYW5zbGF0ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIFsgeCwgeSBdO1xuICAgICAgeCA9ICtfWzBdO1xuICAgICAgeSA9ICtfWzFdO1xuICAgICAgcmV0dXJuIHJlc2V0KCk7XG4gICAgfTtcbiAgICBwcm9qZWN0aW9uLmNlbnRlciA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIFsgzrsgKiBkM19kZWdyZWVzLCDPhiAqIGQzX2RlZ3JlZXMgXTtcbiAgICAgIM67ID0gX1swXSAlIDM2MCAqIGQzX3JhZGlhbnM7XG4gICAgICDPhiA9IF9bMV0gJSAzNjAgKiBkM19yYWRpYW5zO1xuICAgICAgcmV0dXJuIHJlc2V0KCk7XG4gICAgfTtcbiAgICBwcm9qZWN0aW9uLnJvdGF0ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIFsgzrTOuyAqIGQzX2RlZ3JlZXMsIM60z4YgKiBkM19kZWdyZWVzLCDOtM6zICogZDNfZGVncmVlcyBdO1xuICAgICAgzrTOuyA9IF9bMF0gJSAzNjAgKiBkM19yYWRpYW5zO1xuICAgICAgzrTPhiA9IF9bMV0gJSAzNjAgKiBkM19yYWRpYW5zO1xuICAgICAgzrTOsyA9IF8ubGVuZ3RoID4gMiA/IF9bMl0gJSAzNjAgKiBkM19yYWRpYW5zIDogMDtcbiAgICAgIHJldHVybiByZXNldCgpO1xuICAgIH07XG4gICAgZDMucmViaW5kKHByb2plY3Rpb24sIHByb2plY3RSZXNhbXBsZSwgXCJwcmVjaXNpb25cIik7XG4gICAgZnVuY3Rpb24gcmVzZXQoKSB7XG4gICAgICBwcm9qZWN0Um90YXRlID0gZDNfZ2VvX2NvbXBvc2Uocm90YXRlID0gZDNfZ2VvX3JvdGF0aW9uKM60zrssIM60z4YsIM60zrMpLCBwcm9qZWN0KTtcbiAgICAgIHZhciBjZW50ZXIgPSBwcm9qZWN0KM67LCDPhik7XG4gICAgICDOtHggPSB4IC0gY2VudGVyWzBdICogaztcbiAgICAgIM60eSA9IHkgKyBjZW50ZXJbMV0gKiBrO1xuICAgICAgcmV0dXJuIGludmFsaWRhdGUoKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW52YWxpZGF0ZSgpIHtcbiAgICAgIGlmIChzdHJlYW0pIHN0cmVhbS52YWxpZCA9IGZhbHNlLCBzdHJlYW0gPSBudWxsO1xuICAgICAgcmV0dXJuIHByb2plY3Rpb247XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHByb2plY3QgPSBwcm9qZWN0QXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHByb2plY3Rpb24uaW52ZXJ0ID0gcHJvamVjdC5pbnZlcnQgJiYgaW52ZXJ0O1xuICAgICAgcmV0dXJuIHJlc2V0KCk7XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fcHJvamVjdGlvblJhZGlhbnMoc3RyZWFtKSB7XG4gICAgcmV0dXJuIGQzX2dlb190cmFuc2Zvcm1Qb2ludChzdHJlYW0sIGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHN0cmVhbS5wb2ludCh4ICogZDNfcmFkaWFucywgeSAqIGQzX3JhZGlhbnMpO1xuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19lcXVpcmVjdGFuZ3VsYXIozrssIM+GKSB7XG4gICAgcmV0dXJuIFsgzrssIM+GIF07XG4gIH1cbiAgKGQzLmdlby5lcXVpcmVjdGFuZ3VsYXIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfZ2VvX3Byb2plY3Rpb24oZDNfZ2VvX2VxdWlyZWN0YW5ndWxhcik7XG4gIH0pLnJhdyA9IGQzX2dlb19lcXVpcmVjdGFuZ3VsYXIuaW52ZXJ0ID0gZDNfZ2VvX2VxdWlyZWN0YW5ndWxhcjtcbiAgZDMuZ2VvLnJvdGF0aW9uID0gZnVuY3Rpb24ocm90YXRlKSB7XG4gICAgcm90YXRlID0gZDNfZ2VvX3JvdGF0aW9uKHJvdGF0ZVswXSAlIDM2MCAqIGQzX3JhZGlhbnMsIHJvdGF0ZVsxXSAqIGQzX3JhZGlhbnMsIHJvdGF0ZS5sZW5ndGggPiAyID8gcm90YXRlWzJdICogZDNfcmFkaWFucyA6IDApO1xuICAgIGZ1bmN0aW9uIGZvcndhcmQoY29vcmRpbmF0ZXMpIHtcbiAgICAgIGNvb3JkaW5hdGVzID0gcm90YXRlKGNvb3JkaW5hdGVzWzBdICogZDNfcmFkaWFucywgY29vcmRpbmF0ZXNbMV0gKiBkM19yYWRpYW5zKTtcbiAgICAgIHJldHVybiBjb29yZGluYXRlc1swXSAqPSBkM19kZWdyZWVzLCBjb29yZGluYXRlc1sxXSAqPSBkM19kZWdyZWVzLCBjb29yZGluYXRlcztcbiAgICB9XG4gICAgZm9yd2FyZC5pbnZlcnQgPSBmdW5jdGlvbihjb29yZGluYXRlcykge1xuICAgICAgY29vcmRpbmF0ZXMgPSByb3RhdGUuaW52ZXJ0KGNvb3JkaW5hdGVzWzBdICogZDNfcmFkaWFucywgY29vcmRpbmF0ZXNbMV0gKiBkM19yYWRpYW5zKTtcbiAgICAgIHJldHVybiBjb29yZGluYXRlc1swXSAqPSBkM19kZWdyZWVzLCBjb29yZGluYXRlc1sxXSAqPSBkM19kZWdyZWVzLCBjb29yZGluYXRlcztcbiAgICB9O1xuICAgIHJldHVybiBmb3J3YXJkO1xuICB9O1xuICBmdW5jdGlvbiBkM19nZW9faWRlbnRpdHlSb3RhdGlvbijOuywgz4YpIHtcbiAgICByZXR1cm4gWyDOuyA+IM+AID8gzrsgLSDPhCA6IM67IDwgLc+AID8gzrsgKyDPhCA6IM67LCDPhiBdO1xuICB9XG4gIGQzX2dlb19pZGVudGl0eVJvdGF0aW9uLmludmVydCA9IGQzX2dlb19lcXVpcmVjdGFuZ3VsYXI7XG4gIGZ1bmN0aW9uIGQzX2dlb19yb3RhdGlvbijOtM67LCDOtM+GLCDOtM6zKSB7XG4gICAgcmV0dXJuIM60zrsgPyDOtM+GIHx8IM60zrMgPyBkM19nZW9fY29tcG9zZShkM19nZW9fcm90YXRpb27OuyjOtM67KSwgZDNfZ2VvX3JvdGF0aW9uz4bOsyjOtM+GLCDOtM6zKSkgOiBkM19nZW9fcm90YXRpb27OuyjOtM67KSA6IM60z4YgfHwgzrTOsyA/IGQzX2dlb19yb3RhdGlvbs+GzrMozrTPhiwgzrTOsykgOiBkM19nZW9faWRlbnRpdHlSb3RhdGlvbjtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fZm9yd2FyZFJvdGF0aW9uzrsozrTOuykge1xuICAgIHJldHVybiBmdW5jdGlvbijOuywgz4YpIHtcbiAgICAgIHJldHVybiDOuyArPSDOtM67LCBbIM67ID4gz4AgPyDOuyAtIM+EIDogzrsgPCAtz4AgPyDOuyArIM+EIDogzrssIM+GIF07XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fcm90YXRpb27OuyjOtM67KSB7XG4gICAgdmFyIHJvdGF0aW9uID0gZDNfZ2VvX2ZvcndhcmRSb3RhdGlvbs67KM60zrspO1xuICAgIHJvdGF0aW9uLmludmVydCA9IGQzX2dlb19mb3J3YXJkUm90YXRpb27OuygtzrTOuyk7XG4gICAgcmV0dXJuIHJvdGF0aW9uO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb19yb3RhdGlvbs+GzrMozrTPhiwgzrTOsykge1xuICAgIHZhciBjb3POtM+GID0gTWF0aC5jb3MozrTPhiksIHNpbs60z4YgPSBNYXRoLnNpbijOtM+GKSwgY29zzrTOsyA9IE1hdGguY29zKM60zrMpLCBzaW7OtM6zID0gTWF0aC5zaW4ozrTOsyk7XG4gICAgZnVuY3Rpb24gcm90YXRpb24ozrssIM+GKSB7XG4gICAgICB2YXIgY29zz4YgPSBNYXRoLmNvcyjPhiksIHggPSBNYXRoLmNvcyjOuykgKiBjb3PPhiwgeSA9IE1hdGguc2luKM67KSAqIGNvc8+GLCB6ID0gTWF0aC5zaW4oz4YpLCBrID0geiAqIGNvc860z4YgKyB4ICogc2luzrTPhjtcbiAgICAgIHJldHVybiBbIE1hdGguYXRhbjIoeSAqIGNvc860zrMgLSBrICogc2luzrTOsywgeCAqIGNvc860z4YgLSB6ICogc2luzrTPhiksIGQzX2FzaW4oayAqIGNvc860zrMgKyB5ICogc2luzrTOsykgXTtcbiAgICB9XG4gICAgcm90YXRpb24uaW52ZXJ0ID0gZnVuY3Rpb24ozrssIM+GKSB7XG4gICAgICB2YXIgY29zz4YgPSBNYXRoLmNvcyjPhiksIHggPSBNYXRoLmNvcyjOuykgKiBjb3PPhiwgeSA9IE1hdGguc2luKM67KSAqIGNvc8+GLCB6ID0gTWF0aC5zaW4oz4YpLCBrID0geiAqIGNvc860zrMgLSB5ICogc2luzrTOsztcbiAgICAgIHJldHVybiBbIE1hdGguYXRhbjIoeSAqIGNvc860zrMgKyB6ICogc2luzrTOsywgeCAqIGNvc860z4YgKyBrICogc2luzrTPhiksIGQzX2FzaW4oayAqIGNvc860z4YgLSB4ICogc2luzrTPhikgXTtcbiAgICB9O1xuICAgIHJldHVybiByb3RhdGlvbjtcbiAgfVxuICBkMy5nZW8uY2lyY2xlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9yaWdpbiA9IFsgMCwgMCBdLCBhbmdsZSwgcHJlY2lzaW9uID0gNiwgaW50ZXJwb2xhdGU7XG4gICAgZnVuY3Rpb24gY2lyY2xlKCkge1xuICAgICAgdmFyIGNlbnRlciA9IHR5cGVvZiBvcmlnaW4gPT09IFwiZnVuY3Rpb25cIiA/IG9yaWdpbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDogb3JpZ2luLCByb3RhdGUgPSBkM19nZW9fcm90YXRpb24oLWNlbnRlclswXSAqIGQzX3JhZGlhbnMsIC1jZW50ZXJbMV0gKiBkM19yYWRpYW5zLCAwKS5pbnZlcnQsIHJpbmcgPSBbXTtcbiAgICAgIGludGVycG9sYXRlKG51bGwsIG51bGwsIDEsIHtcbiAgICAgICAgcG9pbnQ6IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgICAgICByaW5nLnB1c2goeCA9IHJvdGF0ZSh4LCB5KSk7XG4gICAgICAgICAgeFswXSAqPSBkM19kZWdyZWVzLCB4WzFdICo9IGQzX2RlZ3JlZXM7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogXCJQb2x5Z29uXCIsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBbIHJpbmcgXVxuICAgICAgfTtcbiAgICB9XG4gICAgY2lyY2xlLm9yaWdpbiA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG9yaWdpbjtcbiAgICAgIG9yaWdpbiA9IHg7XG4gICAgICByZXR1cm4gY2lyY2xlO1xuICAgIH07XG4gICAgY2lyY2xlLmFuZ2xlID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYW5nbGU7XG4gICAgICBpbnRlcnBvbGF0ZSA9IGQzX2dlb19jaXJjbGVJbnRlcnBvbGF0ZSgoYW5nbGUgPSAreCkgKiBkM19yYWRpYW5zLCBwcmVjaXNpb24gKiBkM19yYWRpYW5zKTtcbiAgICAgIHJldHVybiBjaXJjbGU7XG4gICAgfTtcbiAgICBjaXJjbGUucHJlY2lzaW9uID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcHJlY2lzaW9uO1xuICAgICAgaW50ZXJwb2xhdGUgPSBkM19nZW9fY2lyY2xlSW50ZXJwb2xhdGUoYW5nbGUgKiBkM19yYWRpYW5zLCAocHJlY2lzaW9uID0gK18pICogZDNfcmFkaWFucyk7XG4gICAgICByZXR1cm4gY2lyY2xlO1xuICAgIH07XG4gICAgcmV0dXJuIGNpcmNsZS5hbmdsZSg5MCk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2dlb19jaXJjbGVJbnRlcnBvbGF0ZShyYWRpdXMsIHByZWNpc2lvbikge1xuICAgIHZhciBjciA9IE1hdGguY29zKHJhZGl1cyksIHNyID0gTWF0aC5zaW4ocmFkaXVzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oZnJvbSwgdG8sIGRpcmVjdGlvbiwgbGlzdGVuZXIpIHtcbiAgICAgIHZhciBzdGVwID0gZGlyZWN0aW9uICogcHJlY2lzaW9uO1xuICAgICAgaWYgKGZyb20gIT0gbnVsbCkge1xuICAgICAgICBmcm9tID0gZDNfZ2VvX2NpcmNsZUFuZ2xlKGNyLCBmcm9tKTtcbiAgICAgICAgdG8gPSBkM19nZW9fY2lyY2xlQW5nbGUoY3IsIHRvKTtcbiAgICAgICAgaWYgKGRpcmVjdGlvbiA+IDAgPyBmcm9tIDwgdG8gOiBmcm9tID4gdG8pIGZyb20gKz0gZGlyZWN0aW9uICogz4Q7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmcm9tID0gcmFkaXVzICsgZGlyZWN0aW9uICogz4Q7XG4gICAgICAgIHRvID0gcmFkaXVzIC0gLjUgKiBzdGVwO1xuICAgICAgfVxuICAgICAgZm9yICh2YXIgcG9pbnQsIHQgPSBmcm9tOyBkaXJlY3Rpb24gPiAwID8gdCA+IHRvIDogdCA8IHRvOyB0IC09IHN0ZXApIHtcbiAgICAgICAgbGlzdGVuZXIucG9pbnQoKHBvaW50ID0gZDNfZ2VvX3NwaGVyaWNhbChbIGNyLCAtc3IgKiBNYXRoLmNvcyh0KSwgLXNyICogTWF0aC5zaW4odCkgXSkpWzBdLCBwb2ludFsxXSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9fY2lyY2xlQW5nbGUoY3IsIHBvaW50KSB7XG4gICAgdmFyIGEgPSBkM19nZW9fY2FydGVzaWFuKHBvaW50KTtcbiAgICBhWzBdIC09IGNyO1xuICAgIGQzX2dlb19jYXJ0ZXNpYW5Ob3JtYWxpemUoYSk7XG4gICAgdmFyIGFuZ2xlID0gZDNfYWNvcygtYVsxXSk7XG4gICAgcmV0dXJuICgoLWFbMl0gPCAwID8gLWFuZ2xlIDogYW5nbGUpICsgMiAqIE1hdGguUEkgLSDOtSkgJSAoMiAqIE1hdGguUEkpO1xuICB9XG4gIGQzLmdlby5kaXN0YW5jZSA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgzpTOuyA9IChiWzBdIC0gYVswXSkgKiBkM19yYWRpYW5zLCDPhjAgPSBhWzFdICogZDNfcmFkaWFucywgz4YxID0gYlsxXSAqIGQzX3JhZGlhbnMsIHNpbs6UzrsgPSBNYXRoLnNpbijOlM67KSwgY29zzpTOuyA9IE1hdGguY29zKM6UzrspLCBzaW7PhjAgPSBNYXRoLnNpbijPhjApLCBjb3PPhjAgPSBNYXRoLmNvcyjPhjApLCBzaW7PhjEgPSBNYXRoLnNpbijPhjEpLCBjb3PPhjEgPSBNYXRoLmNvcyjPhjEpLCB0O1xuICAgIHJldHVybiBNYXRoLmF0YW4yKE1hdGguc3FydCgodCA9IGNvc8+GMSAqIHNpbs6UzrspICogdCArICh0ID0gY29zz4YwICogc2luz4YxIC0gc2luz4YwICogY29zz4YxICogY29zzpTOuykgKiB0KSwgc2luz4YwICogc2luz4YxICsgY29zz4YwICogY29zz4YxICogY29zzpTOuyk7XG4gIH07XG4gIGQzLmdlby5ncmF0aWN1bGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgeDEsIHgwLCBYMSwgWDAsIHkxLCB5MCwgWTEsIFkwLCBkeCA9IDEwLCBkeSA9IGR4LCBEWCA9IDkwLCBEWSA9IDM2MCwgeCwgeSwgWCwgWSwgcHJlY2lzaW9uID0gMi41O1xuICAgIGZ1bmN0aW9uIGdyYXRpY3VsZSgpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IFwiTXVsdGlMaW5lU3RyaW5nXCIsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBsaW5lcygpXG4gICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBsaW5lcygpIHtcbiAgICAgIHJldHVybiBkMy5yYW5nZShNYXRoLmNlaWwoWDAgLyBEWCkgKiBEWCwgWDEsIERYKS5tYXAoWCkuY29uY2F0KGQzLnJhbmdlKE1hdGguY2VpbChZMCAvIERZKSAqIERZLCBZMSwgRFkpLm1hcChZKSkuY29uY2F0KGQzLnJhbmdlKE1hdGguY2VpbCh4MCAvIGR4KSAqIGR4LCB4MSwgZHgpLmZpbHRlcihmdW5jdGlvbih4KSB7XG4gICAgICAgIHJldHVybiBhYnMoeCAlIERYKSA+IM61O1xuICAgICAgfSkubWFwKHgpKS5jb25jYXQoZDMucmFuZ2UoTWF0aC5jZWlsKHkwIC8gZHkpICogZHksIHkxLCBkeSkuZmlsdGVyKGZ1bmN0aW9uKHkpIHtcbiAgICAgICAgcmV0dXJuIGFicyh5ICUgRFkpID4gzrU7XG4gICAgICB9KS5tYXAoeSkpO1xuICAgIH1cbiAgICBncmF0aWN1bGUubGluZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBsaW5lcygpLm1hcChmdW5jdGlvbihjb29yZGluYXRlcykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHR5cGU6IFwiTGluZVN0cmluZ1wiLFxuICAgICAgICAgIGNvb3JkaW5hdGVzOiBjb29yZGluYXRlc1xuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfTtcbiAgICBncmF0aWN1bGUub3V0bGluZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdHlwZTogXCJQb2x5Z29uXCIsXG4gICAgICAgIGNvb3JkaW5hdGVzOiBbIFgoWDApLmNvbmNhdChZKFkxKS5zbGljZSgxKSwgWChYMSkucmV2ZXJzZSgpLnNsaWNlKDEpLCBZKFkwKS5yZXZlcnNlKCkuc2xpY2UoMSkpIF1cbiAgICAgIH07XG4gICAgfTtcbiAgICBncmF0aWN1bGUuZXh0ZW50ID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZ3JhdGljdWxlLm1pbm9yRXh0ZW50KCk7XG4gICAgICByZXR1cm4gZ3JhdGljdWxlLm1ham9yRXh0ZW50KF8pLm1pbm9yRXh0ZW50KF8pO1xuICAgIH07XG4gICAgZ3JhdGljdWxlLm1ham9yRXh0ZW50ID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gWyBbIFgwLCBZMCBdLCBbIFgxLCBZMSBdIF07XG4gICAgICBYMCA9ICtfWzBdWzBdLCBYMSA9ICtfWzFdWzBdO1xuICAgICAgWTAgPSArX1swXVsxXSwgWTEgPSArX1sxXVsxXTtcbiAgICAgIGlmIChYMCA+IFgxKSBfID0gWDAsIFgwID0gWDEsIFgxID0gXztcbiAgICAgIGlmIChZMCA+IFkxKSBfID0gWTAsIFkwID0gWTEsIFkxID0gXztcbiAgICAgIHJldHVybiBncmF0aWN1bGUucHJlY2lzaW9uKHByZWNpc2lvbik7XG4gICAgfTtcbiAgICBncmF0aWN1bGUubWlub3JFeHRlbnQgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBbIFsgeDAsIHkwIF0sIFsgeDEsIHkxIF0gXTtcbiAgICAgIHgwID0gK19bMF1bMF0sIHgxID0gK19bMV1bMF07XG4gICAgICB5MCA9ICtfWzBdWzFdLCB5MSA9ICtfWzFdWzFdO1xuICAgICAgaWYgKHgwID4geDEpIF8gPSB4MCwgeDAgPSB4MSwgeDEgPSBfO1xuICAgICAgaWYgKHkwID4geTEpIF8gPSB5MCwgeTAgPSB5MSwgeTEgPSBfO1xuICAgICAgcmV0dXJuIGdyYXRpY3VsZS5wcmVjaXNpb24ocHJlY2lzaW9uKTtcbiAgICB9O1xuICAgIGdyYXRpY3VsZS5zdGVwID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZ3JhdGljdWxlLm1pbm9yU3RlcCgpO1xuICAgICAgcmV0dXJuIGdyYXRpY3VsZS5tYWpvclN0ZXAoXykubWlub3JTdGVwKF8pO1xuICAgIH07XG4gICAgZ3JhdGljdWxlLm1ham9yU3RlcCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIFsgRFgsIERZIF07XG4gICAgICBEWCA9ICtfWzBdLCBEWSA9ICtfWzFdO1xuICAgICAgcmV0dXJuIGdyYXRpY3VsZTtcbiAgICB9O1xuICAgIGdyYXRpY3VsZS5taW5vclN0ZXAgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBbIGR4LCBkeSBdO1xuICAgICAgZHggPSArX1swXSwgZHkgPSArX1sxXTtcbiAgICAgIHJldHVybiBncmF0aWN1bGU7XG4gICAgfTtcbiAgICBncmF0aWN1bGUucHJlY2lzaW9uID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcHJlY2lzaW9uO1xuICAgICAgcHJlY2lzaW9uID0gK187XG4gICAgICB4ID0gZDNfZ2VvX2dyYXRpY3VsZVgoeTAsIHkxLCA5MCk7XG4gICAgICB5ID0gZDNfZ2VvX2dyYXRpY3VsZVkoeDAsIHgxLCBwcmVjaXNpb24pO1xuICAgICAgWCA9IGQzX2dlb19ncmF0aWN1bGVYKFkwLCBZMSwgOTApO1xuICAgICAgWSA9IGQzX2dlb19ncmF0aWN1bGVZKFgwLCBYMSwgcHJlY2lzaW9uKTtcbiAgICAgIHJldHVybiBncmF0aWN1bGU7XG4gICAgfTtcbiAgICByZXR1cm4gZ3JhdGljdWxlLm1ham9yRXh0ZW50KFsgWyAtMTgwLCAtOTAgKyDOtSBdLCBbIDE4MCwgOTAgLSDOtSBdIF0pLm1pbm9yRXh0ZW50KFsgWyAtMTgwLCAtODAgLSDOtSBdLCBbIDE4MCwgODAgKyDOtSBdIF0pO1xuICB9O1xuICBmdW5jdGlvbiBkM19nZW9fZ3JhdGljdWxlWCh5MCwgeTEsIGR5KSB7XG4gICAgdmFyIHkgPSBkMy5yYW5nZSh5MCwgeTEgLSDOtSwgZHkpLmNvbmNhdCh5MSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB5Lm1hcChmdW5jdGlvbih5KSB7XG4gICAgICAgIHJldHVybiBbIHgsIHkgXTtcbiAgICAgIH0pO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2dyYXRpY3VsZVkoeDAsIHgxLCBkeCkge1xuICAgIHZhciB4ID0gZDMucmFuZ2UoeDAsIHgxIC0gzrUsIGR4KS5jb25jYXQoeDEpO1xuICAgIHJldHVybiBmdW5jdGlvbih5KSB7XG4gICAgICByZXR1cm4geC5tYXAoZnVuY3Rpb24oeCkge1xuICAgICAgICByZXR1cm4gWyB4LCB5IF07XG4gICAgICB9KTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NvdXJjZShkKSB7XG4gICAgcmV0dXJuIGQuc291cmNlO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RhcmdldChkKSB7XG4gICAgcmV0dXJuIGQudGFyZ2V0O1xuICB9XG4gIGQzLmdlby5ncmVhdEFyYyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzb3VyY2UgPSBkM19zb3VyY2UsIHNvdXJjZV8sIHRhcmdldCA9IGQzX3RhcmdldCwgdGFyZ2V0XztcbiAgICBmdW5jdGlvbiBncmVhdEFyYygpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHR5cGU6IFwiTGluZVN0cmluZ1wiLFxuICAgICAgICBjb29yZGluYXRlczogWyBzb3VyY2VfIHx8IHNvdXJjZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpLCB0YXJnZXRfIHx8IHRhcmdldC5hcHBseSh0aGlzLCBhcmd1bWVudHMpIF1cbiAgICAgIH07XG4gICAgfVxuICAgIGdyZWF0QXJjLmRpc3RhbmNlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZDMuZ2VvLmRpc3RhbmNlKHNvdXJjZV8gfHwgc291cmNlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyksIHRhcmdldF8gfHwgdGFyZ2V0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICAgIH07XG4gICAgZ3JlYXRBcmMuc291cmNlID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc291cmNlO1xuICAgICAgc291cmNlID0gXywgc291cmNlXyA9IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBudWxsIDogXztcbiAgICAgIHJldHVybiBncmVhdEFyYztcbiAgICB9O1xuICAgIGdyZWF0QXJjLnRhcmdldCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRhcmdldDtcbiAgICAgIHRhcmdldCA9IF8sIHRhcmdldF8gPSB0eXBlb2YgXyA9PT0gXCJmdW5jdGlvblwiID8gbnVsbCA6IF87XG4gICAgICByZXR1cm4gZ3JlYXRBcmM7XG4gICAgfTtcbiAgICBncmVhdEFyYy5wcmVjaXNpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gZ3JlYXRBcmMgOiAwO1xuICAgIH07XG4gICAgcmV0dXJuIGdyZWF0QXJjO1xuICB9O1xuICBkMy5nZW8uaW50ZXJwb2xhdGUgPSBmdW5jdGlvbihzb3VyY2UsIHRhcmdldCkge1xuICAgIHJldHVybiBkM19nZW9faW50ZXJwb2xhdGUoc291cmNlWzBdICogZDNfcmFkaWFucywgc291cmNlWzFdICogZDNfcmFkaWFucywgdGFyZ2V0WzBdICogZDNfcmFkaWFucywgdGFyZ2V0WzFdICogZDNfcmFkaWFucyk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2dlb19pbnRlcnBvbGF0ZSh4MCwgeTAsIHgxLCB5MSkge1xuICAgIHZhciBjeTAgPSBNYXRoLmNvcyh5MCksIHN5MCA9IE1hdGguc2luKHkwKSwgY3kxID0gTWF0aC5jb3MoeTEpLCBzeTEgPSBNYXRoLnNpbih5MSksIGt4MCA9IGN5MCAqIE1hdGguY29zKHgwKSwga3kwID0gY3kwICogTWF0aC5zaW4oeDApLCBreDEgPSBjeTEgKiBNYXRoLmNvcyh4MSksIGt5MSA9IGN5MSAqIE1hdGguc2luKHgxKSwgZCA9IDIgKiBNYXRoLmFzaW4oTWF0aC5zcXJ0KGQzX2hhdmVyc2luKHkxIC0geTApICsgY3kwICogY3kxICogZDNfaGF2ZXJzaW4oeDEgLSB4MCkpKSwgayA9IDEgLyBNYXRoLnNpbihkKTtcbiAgICB2YXIgaW50ZXJwb2xhdGUgPSBkID8gZnVuY3Rpb24odCkge1xuICAgICAgdmFyIEIgPSBNYXRoLnNpbih0ICo9IGQpICogaywgQSA9IE1hdGguc2luKGQgLSB0KSAqIGssIHggPSBBICoga3gwICsgQiAqIGt4MSwgeSA9IEEgKiBreTAgKyBCICoga3kxLCB6ID0gQSAqIHN5MCArIEIgKiBzeTE7XG4gICAgICByZXR1cm4gWyBNYXRoLmF0YW4yKHksIHgpICogZDNfZGVncmVlcywgTWF0aC5hdGFuMih6LCBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSkpICogZDNfZGVncmVlcyBdO1xuICAgIH0gOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBbIHgwICogZDNfZGVncmVlcywgeTAgKiBkM19kZWdyZWVzIF07XG4gICAgfTtcbiAgICBpbnRlcnBvbGF0ZS5kaXN0YW5jZSA9IGQ7XG4gICAgcmV0dXJuIGludGVycG9sYXRlO1xuICB9XG4gIGQzLmdlby5sZW5ndGggPSBmdW5jdGlvbihvYmplY3QpIHtcbiAgICBkM19nZW9fbGVuZ3RoU3VtID0gMDtcbiAgICBkMy5nZW8uc3RyZWFtKG9iamVjdCwgZDNfZ2VvX2xlbmd0aCk7XG4gICAgcmV0dXJuIGQzX2dlb19sZW5ndGhTdW07XG4gIH07XG4gIHZhciBkM19nZW9fbGVuZ3RoU3VtO1xuICB2YXIgZDNfZ2VvX2xlbmd0aCA9IHtcbiAgICBzcGhlcmU6IGQzX25vb3AsXG4gICAgcG9pbnQ6IGQzX25vb3AsXG4gICAgbGluZVN0YXJ0OiBkM19nZW9fbGVuZ3RoTGluZVN0YXJ0LFxuICAgIGxpbmVFbmQ6IGQzX25vb3AsXG4gICAgcG9seWdvblN0YXJ0OiBkM19ub29wLFxuICAgIHBvbHlnb25FbmQ6IGQzX25vb3BcbiAgfTtcbiAgZnVuY3Rpb24gZDNfZ2VvX2xlbmd0aExpbmVTdGFydCgpIHtcbiAgICB2YXIgzrswLCBzaW7PhjAsIGNvc8+GMDtcbiAgICBkM19nZW9fbGVuZ3RoLnBvaW50ID0gZnVuY3Rpb24ozrssIM+GKSB7XG4gICAgICDOuzAgPSDOuyAqIGQzX3JhZGlhbnMsIHNpbs+GMCA9IE1hdGguc2luKM+GICo9IGQzX3JhZGlhbnMpLCBjb3PPhjAgPSBNYXRoLmNvcyjPhik7XG4gICAgICBkM19nZW9fbGVuZ3RoLnBvaW50ID0gbmV4dFBvaW50O1xuICAgIH07XG4gICAgZDNfZ2VvX2xlbmd0aC5saW5lRW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICBkM19nZW9fbGVuZ3RoLnBvaW50ID0gZDNfZ2VvX2xlbmd0aC5saW5lRW5kID0gZDNfbm9vcDtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIG5leHRQb2ludCjOuywgz4YpIHtcbiAgICAgIHZhciBzaW7PhiA9IE1hdGguc2luKM+GICo9IGQzX3JhZGlhbnMpLCBjb3PPhiA9IE1hdGguY29zKM+GKSwgdCA9IGFicygozrsgKj0gZDNfcmFkaWFucykgLSDOuzApLCBjb3POlM67ID0gTWF0aC5jb3ModCk7XG4gICAgICBkM19nZW9fbGVuZ3RoU3VtICs9IE1hdGguYXRhbjIoTWF0aC5zcXJ0KCh0ID0gY29zz4YgKiBNYXRoLnNpbih0KSkgKiB0ICsgKHQgPSBjb3PPhjAgKiBzaW7PhiAtIHNpbs+GMCAqIGNvc8+GICogY29zzpTOuykgKiB0KSwgc2luz4YwICogc2luz4YgKyBjb3PPhjAgKiBjb3PPhiAqIGNvc86UzrspO1xuICAgICAgzrswID0gzrssIHNpbs+GMCA9IHNpbs+GLCBjb3PPhjAgPSBjb3PPhjtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvX2F6aW11dGhhbChzY2FsZSwgYW5nbGUpIHtcbiAgICBmdW5jdGlvbiBhemltdXRoYWwozrssIM+GKSB7XG4gICAgICB2YXIgY29zzrsgPSBNYXRoLmNvcyjOuyksIGNvc8+GID0gTWF0aC5jb3Moz4YpLCBrID0gc2NhbGUoY29zzrsgKiBjb3PPhik7XG4gICAgICByZXR1cm4gWyBrICogY29zz4YgKiBNYXRoLnNpbijOuyksIGsgKiBNYXRoLnNpbijPhikgXTtcbiAgICB9XG4gICAgYXppbXV0aGFsLmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICAgIHZhciDPgSA9IE1hdGguc3FydCh4ICogeCArIHkgKiB5KSwgYyA9IGFuZ2xlKM+BKSwgc2luYyA9IE1hdGguc2luKGMpLCBjb3NjID0gTWF0aC5jb3MoYyk7XG4gICAgICByZXR1cm4gWyBNYXRoLmF0YW4yKHggKiBzaW5jLCDPgSAqIGNvc2MpLCBNYXRoLmFzaW4oz4EgJiYgeSAqIHNpbmMgLyDPgSkgXTtcbiAgICB9O1xuICAgIHJldHVybiBhemltdXRoYWw7XG4gIH1cbiAgdmFyIGQzX2dlb19hemltdXRoYWxFcXVhbEFyZWEgPSBkM19nZW9fYXppbXV0aGFsKGZ1bmN0aW9uKGNvc867Y29zz4YpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KDIgLyAoMSArIGNvc867Y29zz4YpKTtcbiAgfSwgZnVuY3Rpb24oz4EpIHtcbiAgICByZXR1cm4gMiAqIE1hdGguYXNpbijPgSAvIDIpO1xuICB9KTtcbiAgKGQzLmdlby5hemltdXRoYWxFcXVhbEFyZWEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfZ2VvX3Byb2plY3Rpb24oZDNfZ2VvX2F6aW11dGhhbEVxdWFsQXJlYSk7XG4gIH0pLnJhdyA9IGQzX2dlb19hemltdXRoYWxFcXVhbEFyZWE7XG4gIHZhciBkM19nZW9fYXppbXV0aGFsRXF1aWRpc3RhbnQgPSBkM19nZW9fYXppbXV0aGFsKGZ1bmN0aW9uKGNvc867Y29zz4YpIHtcbiAgICB2YXIgYyA9IE1hdGguYWNvcyhjb3POu2Nvc8+GKTtcbiAgICByZXR1cm4gYyAmJiBjIC8gTWF0aC5zaW4oYyk7XG4gIH0sIGQzX2lkZW50aXR5KTtcbiAgKGQzLmdlby5hemltdXRoYWxFcXVpZGlzdGFudCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM19nZW9fcHJvamVjdGlvbihkM19nZW9fYXppbXV0aGFsRXF1aWRpc3RhbnQpO1xuICB9KS5yYXcgPSBkM19nZW9fYXppbXV0aGFsRXF1aWRpc3RhbnQ7XG4gIGZ1bmN0aW9uIGQzX2dlb19jb25pY0NvbmZvcm1hbCjPhjAsIM+GMSkge1xuICAgIHZhciBjb3PPhjAgPSBNYXRoLmNvcyjPhjApLCB0ID0gZnVuY3Rpb24oz4YpIHtcbiAgICAgIHJldHVybiBNYXRoLnRhbijPgCAvIDQgKyDPhiAvIDIpO1xuICAgIH0sIG4gPSDPhjAgPT09IM+GMSA/IE1hdGguc2luKM+GMCkgOiBNYXRoLmxvZyhjb3PPhjAgLyBNYXRoLmNvcyjPhjEpKSAvIE1hdGgubG9nKHQoz4YxKSAvIHQoz4YwKSksIEYgPSBjb3PPhjAgKiBNYXRoLnBvdyh0KM+GMCksIG4pIC8gbjtcbiAgICBpZiAoIW4pIHJldHVybiBkM19nZW9fbWVyY2F0b3I7XG4gICAgZnVuY3Rpb24gZm9yd2FyZCjOuywgz4YpIHtcbiAgICAgIGlmIChGID4gMCkge1xuICAgICAgICBpZiAoz4YgPCAtaGFsZs+AICsgzrUpIM+GID0gLWhhbGbPgCArIM61O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKM+GID4gaGFsZs+AIC0gzrUpIM+GID0gaGFsZs+AIC0gzrU7XG4gICAgICB9XG4gICAgICB2YXIgz4EgPSBGIC8gTWF0aC5wb3codCjPhiksIG4pO1xuICAgICAgcmV0dXJuIFsgz4EgKiBNYXRoLnNpbihuICogzrspLCBGIC0gz4EgKiBNYXRoLmNvcyhuICogzrspIF07XG4gICAgfVxuICAgIGZvcndhcmQuaW52ZXJ0ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAgdmFyIM+BMF95ID0gRiAtIHksIM+BID0gZDNfc2duKG4pICogTWF0aC5zcXJ0KHggKiB4ICsgz4EwX3kgKiDPgTBfeSk7XG4gICAgICByZXR1cm4gWyBNYXRoLmF0YW4yKHgsIM+BMF95KSAvIG4sIDIgKiBNYXRoLmF0YW4oTWF0aC5wb3coRiAvIM+BLCAxIC8gbikpIC0gaGFsZs+AIF07XG4gICAgfTtcbiAgICByZXR1cm4gZm9yd2FyZDtcbiAgfVxuICAoZDMuZ2VvLmNvbmljQ29uZm9ybWFsID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX2dlb19jb25pYyhkM19nZW9fY29uaWNDb25mb3JtYWwpO1xuICB9KS5yYXcgPSBkM19nZW9fY29uaWNDb25mb3JtYWw7XG4gIGZ1bmN0aW9uIGQzX2dlb19jb25pY0VxdWlkaXN0YW50KM+GMCwgz4YxKSB7XG4gICAgdmFyIGNvc8+GMCA9IE1hdGguY29zKM+GMCksIG4gPSDPhjAgPT09IM+GMSA/IE1hdGguc2luKM+GMCkgOiAoY29zz4YwIC0gTWF0aC5jb3Moz4YxKSkgLyAoz4YxIC0gz4YwKSwgRyA9IGNvc8+GMCAvIG4gKyDPhjA7XG4gICAgaWYgKGFicyhuKSA8IM61KSByZXR1cm4gZDNfZ2VvX2VxdWlyZWN0YW5ndWxhcjtcbiAgICBmdW5jdGlvbiBmb3J3YXJkKM67LCDPhikge1xuICAgICAgdmFyIM+BID0gRyAtIM+GO1xuICAgICAgcmV0dXJuIFsgz4EgKiBNYXRoLnNpbihuICogzrspLCBHIC0gz4EgKiBNYXRoLmNvcyhuICogzrspIF07XG4gICAgfVxuICAgIGZvcndhcmQuaW52ZXJ0ID0gZnVuY3Rpb24oeCwgeSkge1xuICAgICAgdmFyIM+BMF95ID0gRyAtIHk7XG4gICAgICByZXR1cm4gWyBNYXRoLmF0YW4yKHgsIM+BMF95KSAvIG4sIEcgLSBkM19zZ24obikgKiBNYXRoLnNxcnQoeCAqIHggKyDPgTBfeSAqIM+BMF95KSBdO1xuICAgIH07XG4gICAgcmV0dXJuIGZvcndhcmQ7XG4gIH1cbiAgKGQzLmdlby5jb25pY0VxdWlkaXN0YW50ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX2dlb19jb25pYyhkM19nZW9fY29uaWNFcXVpZGlzdGFudCk7XG4gIH0pLnJhdyA9IGQzX2dlb19jb25pY0VxdWlkaXN0YW50O1xuICB2YXIgZDNfZ2VvX2dub21vbmljID0gZDNfZ2VvX2F6aW11dGhhbChmdW5jdGlvbihjb3POu2Nvc8+GKSB7XG4gICAgcmV0dXJuIDEgLyBjb3POu2Nvc8+GO1xuICB9LCBNYXRoLmF0YW4pO1xuICAoZDMuZ2VvLmdub21vbmljID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX2dlb19wcm9qZWN0aW9uKGQzX2dlb19nbm9tb25pYyk7XG4gIH0pLnJhdyA9IGQzX2dlb19nbm9tb25pYztcbiAgZnVuY3Rpb24gZDNfZ2VvX21lcmNhdG9yKM67LCDPhikge1xuICAgIHJldHVybiBbIM67LCBNYXRoLmxvZyhNYXRoLnRhbijPgCAvIDQgKyDPhiAvIDIpKSBdO1xuICB9XG4gIGQzX2dlb19tZXJjYXRvci5pbnZlcnQgPSBmdW5jdGlvbih4LCB5KSB7XG4gICAgcmV0dXJuIFsgeCwgMiAqIE1hdGguYXRhbihNYXRoLmV4cCh5KSkgLSBoYWxmz4AgXTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfZ2VvX21lcmNhdG9yUHJvamVjdGlvbihwcm9qZWN0KSB7XG4gICAgdmFyIG0gPSBkM19nZW9fcHJvamVjdGlvbihwcm9qZWN0KSwgc2NhbGUgPSBtLnNjYWxlLCB0cmFuc2xhdGUgPSBtLnRyYW5zbGF0ZSwgY2xpcEV4dGVudCA9IG0uY2xpcEV4dGVudCwgY2xpcEF1dG87XG4gICAgbS5zY2FsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHYgPSBzY2FsZS5hcHBseShtLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIHYgPT09IG0gPyBjbGlwQXV0byA/IG0uY2xpcEV4dGVudChudWxsKSA6IG0gOiB2O1xuICAgIH07XG4gICAgbS50cmFuc2xhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2ID0gdHJhbnNsYXRlLmFwcGx5KG0sIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdiA9PT0gbSA/IGNsaXBBdXRvID8gbS5jbGlwRXh0ZW50KG51bGwpIDogbSA6IHY7XG4gICAgfTtcbiAgICBtLmNsaXBFeHRlbnQgPSBmdW5jdGlvbihfKSB7XG4gICAgICB2YXIgdiA9IGNsaXBFeHRlbnQuYXBwbHkobSwgYXJndW1lbnRzKTtcbiAgICAgIGlmICh2ID09PSBtKSB7XG4gICAgICAgIGlmIChjbGlwQXV0byA9IF8gPT0gbnVsbCkge1xuICAgICAgICAgIHZhciBrID0gz4AgKiBzY2FsZSgpLCB0ID0gdHJhbnNsYXRlKCk7XG4gICAgICAgICAgY2xpcEV4dGVudChbIFsgdFswXSAtIGssIHRbMV0gLSBrIF0sIFsgdFswXSArIGssIHRbMV0gKyBrIF0gXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoY2xpcEF1dG8pIHtcbiAgICAgICAgdiA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gdjtcbiAgICB9O1xuICAgIHJldHVybiBtLmNsaXBFeHRlbnQobnVsbCk7XG4gIH1cbiAgKGQzLmdlby5tZXJjYXRvciA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM19nZW9fbWVyY2F0b3JQcm9qZWN0aW9uKGQzX2dlb19tZXJjYXRvcik7XG4gIH0pLnJhdyA9IGQzX2dlb19tZXJjYXRvcjtcbiAgdmFyIGQzX2dlb19vcnRob2dyYXBoaWMgPSBkM19nZW9fYXppbXV0aGFsKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAxO1xuICB9LCBNYXRoLmFzaW4pO1xuICAoZDMuZ2VvLm9ydGhvZ3JhcGhpYyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM19nZW9fcHJvamVjdGlvbihkM19nZW9fb3J0aG9ncmFwaGljKTtcbiAgfSkucmF3ID0gZDNfZ2VvX29ydGhvZ3JhcGhpYztcbiAgdmFyIGQzX2dlb19zdGVyZW9ncmFwaGljID0gZDNfZ2VvX2F6aW11dGhhbChmdW5jdGlvbihjb3POu2Nvc8+GKSB7XG4gICAgcmV0dXJuIDEgLyAoMSArIGNvc867Y29zz4YpO1xuICB9LCBmdW5jdGlvbijPgSkge1xuICAgIHJldHVybiAyICogTWF0aC5hdGFuKM+BKTtcbiAgfSk7XG4gIChkMy5nZW8uc3RlcmVvZ3JhcGhpYyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM19nZW9fcHJvamVjdGlvbihkM19nZW9fc3RlcmVvZ3JhcGhpYyk7XG4gIH0pLnJhdyA9IGQzX2dlb19zdGVyZW9ncmFwaGljO1xuICBmdW5jdGlvbiBkM19nZW9fdHJhbnN2ZXJzZU1lcmNhdG9yKM67LCDPhikge1xuICAgIHJldHVybiBbIE1hdGgubG9nKE1hdGgudGFuKM+AIC8gNCArIM+GIC8gMikpLCAtzrsgXTtcbiAgfVxuICBkM19nZW9fdHJhbnN2ZXJzZU1lcmNhdG9yLmludmVydCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgICByZXR1cm4gWyAteSwgMiAqIE1hdGguYXRhbihNYXRoLmV4cCh4KSkgLSBoYWxmz4AgXTtcbiAgfTtcbiAgKGQzLmdlby50cmFuc3ZlcnNlTWVyY2F0b3IgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcHJvamVjdGlvbiA9IGQzX2dlb19tZXJjYXRvclByb2plY3Rpb24oZDNfZ2VvX3RyYW5zdmVyc2VNZXJjYXRvciksIGNlbnRlciA9IHByb2plY3Rpb24uY2VudGVyLCByb3RhdGUgPSBwcm9qZWN0aW9uLnJvdGF0ZTtcbiAgICBwcm9qZWN0aW9uLmNlbnRlciA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIHJldHVybiBfID8gY2VudGVyKFsgLV9bMV0sIF9bMF0gXSkgOiAoXyA9IGNlbnRlcigpLCBbIF9bMV0sIC1fWzBdIF0pO1xuICAgIH07XG4gICAgcHJvamVjdGlvbi5yb3RhdGUgPSBmdW5jdGlvbihfKSB7XG4gICAgICByZXR1cm4gXyA/IHJvdGF0ZShbIF9bMF0sIF9bMV0sIF8ubGVuZ3RoID4gMiA/IF9bMl0gKyA5MCA6IDkwIF0pIDogKF8gPSByb3RhdGUoKSwgXG4gICAgICBbIF9bMF0sIF9bMV0sIF9bMl0gLSA5MCBdKTtcbiAgICB9O1xuICAgIHJldHVybiByb3RhdGUoWyAwLCAwLCA5MCBdKTtcbiAgfSkucmF3ID0gZDNfZ2VvX3RyYW5zdmVyc2VNZXJjYXRvcjtcbiAgZDMuZ2VvbSA9IHt9O1xuICBmdW5jdGlvbiBkM19nZW9tX3BvaW50WChkKSB7XG4gICAgcmV0dXJuIGRbMF07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV9wb2ludFkoZCkge1xuICAgIHJldHVybiBkWzFdO1xuICB9XG4gIGQzLmdlb20uaHVsbCA9IGZ1bmN0aW9uKHZlcnRpY2VzKSB7XG4gICAgdmFyIHggPSBkM19nZW9tX3BvaW50WCwgeSA9IGQzX2dlb21fcG9pbnRZO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gaHVsbCh2ZXJ0aWNlcyk7XG4gICAgZnVuY3Rpb24gaHVsbChkYXRhKSB7XG4gICAgICBpZiAoZGF0YS5sZW5ndGggPCAzKSByZXR1cm4gW107XG4gICAgICB2YXIgZnggPSBkM19mdW5jdG9yKHgpLCBmeSA9IGQzX2Z1bmN0b3IoeSksIGksIG4gPSBkYXRhLmxlbmd0aCwgcG9pbnRzID0gW10sIGZsaXBwZWRQb2ludHMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgcG9pbnRzLnB1c2goWyArZnguY2FsbCh0aGlzLCBkYXRhW2ldLCBpKSwgK2Z5LmNhbGwodGhpcywgZGF0YVtpXSwgaSksIGkgXSk7XG4gICAgICB9XG4gICAgICBwb2ludHMuc29ydChkM19nZW9tX2h1bGxPcmRlcik7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbjsgaSsrKSBmbGlwcGVkUG9pbnRzLnB1c2goWyBwb2ludHNbaV1bMF0sIC1wb2ludHNbaV1bMV0gXSk7XG4gICAgICB2YXIgdXBwZXIgPSBkM19nZW9tX2h1bGxVcHBlcihwb2ludHMpLCBsb3dlciA9IGQzX2dlb21faHVsbFVwcGVyKGZsaXBwZWRQb2ludHMpO1xuICAgICAgdmFyIHNraXBMZWZ0ID0gbG93ZXJbMF0gPT09IHVwcGVyWzBdLCBza2lwUmlnaHQgPSBsb3dlcltsb3dlci5sZW5ndGggLSAxXSA9PT0gdXBwZXJbdXBwZXIubGVuZ3RoIC0gMV0sIHBvbHlnb24gPSBbXTtcbiAgICAgIGZvciAoaSA9IHVwcGVyLmxlbmd0aCAtIDE7IGkgPj0gMDsgLS1pKSBwb2x5Z29uLnB1c2goZGF0YVtwb2ludHNbdXBwZXJbaV1dWzJdXSk7XG4gICAgICBmb3IgKGkgPSArc2tpcExlZnQ7IGkgPCBsb3dlci5sZW5ndGggLSBza2lwUmlnaHQ7ICsraSkgcG9seWdvbi5wdXNoKGRhdGFbcG9pbnRzW2xvd2VyW2ldXVsyXV0pO1xuICAgICAgcmV0dXJuIHBvbHlnb247XG4gICAgfVxuICAgIGh1bGwueCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHggPSBfLCBodWxsKSA6IHg7XG4gICAgfTtcbiAgICBodWxsLnkgPSBmdW5jdGlvbihfKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh5ID0gXywgaHVsbCkgOiB5O1xuICAgIH07XG4gICAgcmV0dXJuIGh1bGw7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2dlb21faHVsbFVwcGVyKHBvaW50cykge1xuICAgIHZhciBuID0gcG9pbnRzLmxlbmd0aCwgaHVsbCA9IFsgMCwgMSBdLCBocyA9IDI7XG4gICAgZm9yICh2YXIgaSA9IDI7IGkgPCBuOyBpKyspIHtcbiAgICAgIHdoaWxlIChocyA+IDEgJiYgZDNfY3Jvc3MyZChwb2ludHNbaHVsbFtocyAtIDJdXSwgcG9pbnRzW2h1bGxbaHMgLSAxXV0sIHBvaW50c1tpXSkgPD0gMCkgLS1ocztcbiAgICAgIGh1bGxbaHMrK10gPSBpO1xuICAgIH1cbiAgICByZXR1cm4gaHVsbC5zbGljZSgwLCBocyk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV9odWxsT3JkZXIoYSwgYikge1xuICAgIHJldHVybiBhWzBdIC0gYlswXSB8fCBhWzFdIC0gYlsxXTtcbiAgfVxuICBkMy5nZW9tLnBvbHlnb24gPSBmdW5jdGlvbihjb29yZGluYXRlcykge1xuICAgIGQzX3N1YmNsYXNzKGNvb3JkaW5hdGVzLCBkM19nZW9tX3BvbHlnb25Qcm90b3R5cGUpO1xuICAgIHJldHVybiBjb29yZGluYXRlcztcbiAgfTtcbiAgdmFyIGQzX2dlb21fcG9seWdvblByb3RvdHlwZSA9IGQzLmdlb20ucG9seWdvbi5wcm90b3R5cGUgPSBbXTtcbiAgZDNfZ2VvbV9wb2x5Z29uUHJvdG90eXBlLmFyZWEgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaSA9IC0xLCBuID0gdGhpcy5sZW5ndGgsIGEsIGIgPSB0aGlzW24gLSAxXSwgYXJlYSA9IDA7XG4gICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgIGEgPSBiO1xuICAgICAgYiA9IHRoaXNbaV07XG4gICAgICBhcmVhICs9IGFbMV0gKiBiWzBdIC0gYVswXSAqIGJbMV07XG4gICAgfVxuICAgIHJldHVybiBhcmVhICogLjU7XG4gIH07XG4gIGQzX2dlb21fcG9seWdvblByb3RvdHlwZS5jZW50cm9pZCA9IGZ1bmN0aW9uKGspIHtcbiAgICB2YXIgaSA9IC0xLCBuID0gdGhpcy5sZW5ndGgsIHggPSAwLCB5ID0gMCwgYSwgYiA9IHRoaXNbbiAtIDFdLCBjO1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgayA9IC0xIC8gKDYgKiB0aGlzLmFyZWEoKSk7XG4gICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgIGEgPSBiO1xuICAgICAgYiA9IHRoaXNbaV07XG4gICAgICBjID0gYVswXSAqIGJbMV0gLSBiWzBdICogYVsxXTtcbiAgICAgIHggKz0gKGFbMF0gKyBiWzBdKSAqIGM7XG4gICAgICB5ICs9IChhWzFdICsgYlsxXSkgKiBjO1xuICAgIH1cbiAgICByZXR1cm4gWyB4ICogaywgeSAqIGsgXTtcbiAgfTtcbiAgZDNfZ2VvbV9wb2x5Z29uUHJvdG90eXBlLmNsaXAgPSBmdW5jdGlvbihzdWJqZWN0KSB7XG4gICAgdmFyIGlucHV0LCBjbG9zZWQgPSBkM19nZW9tX3BvbHlnb25DbG9zZWQoc3ViamVjdCksIGkgPSAtMSwgbiA9IHRoaXMubGVuZ3RoIC0gZDNfZ2VvbV9wb2x5Z29uQ2xvc2VkKHRoaXMpLCBqLCBtLCBhID0gdGhpc1tuIC0gMV0sIGIsIGMsIGQ7XG4gICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgIGlucHV0ID0gc3ViamVjdC5zbGljZSgpO1xuICAgICAgc3ViamVjdC5sZW5ndGggPSAwO1xuICAgICAgYiA9IHRoaXNbaV07XG4gICAgICBjID0gaW5wdXRbKG0gPSBpbnB1dC5sZW5ndGggLSBjbG9zZWQpIC0gMV07XG4gICAgICBqID0gLTE7XG4gICAgICB3aGlsZSAoKytqIDwgbSkge1xuICAgICAgICBkID0gaW5wdXRbal07XG4gICAgICAgIGlmIChkM19nZW9tX3BvbHlnb25JbnNpZGUoZCwgYSwgYikpIHtcbiAgICAgICAgICBpZiAoIWQzX2dlb21fcG9seWdvbkluc2lkZShjLCBhLCBiKSkge1xuICAgICAgICAgICAgc3ViamVjdC5wdXNoKGQzX2dlb21fcG9seWdvbkludGVyc2VjdChjLCBkLCBhLCBiKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHN1YmplY3QucHVzaChkKTtcbiAgICAgICAgfSBlbHNlIGlmIChkM19nZW9tX3BvbHlnb25JbnNpZGUoYywgYSwgYikpIHtcbiAgICAgICAgICBzdWJqZWN0LnB1c2goZDNfZ2VvbV9wb2x5Z29uSW50ZXJzZWN0KGMsIGQsIGEsIGIpKTtcbiAgICAgICAgfVxuICAgICAgICBjID0gZDtcbiAgICAgIH1cbiAgICAgIGlmIChjbG9zZWQpIHN1YmplY3QucHVzaChzdWJqZWN0WzBdKTtcbiAgICAgIGEgPSBiO1xuICAgIH1cbiAgICByZXR1cm4gc3ViamVjdDtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfZ2VvbV9wb2x5Z29uSW5zaWRlKHAsIGEsIGIpIHtcbiAgICByZXR1cm4gKGJbMF0gLSBhWzBdKSAqIChwWzFdIC0gYVsxXSkgPCAoYlsxXSAtIGFbMV0pICogKHBbMF0gLSBhWzBdKTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3BvbHlnb25JbnRlcnNlY3QoYywgZCwgYSwgYikge1xuICAgIHZhciB4MSA9IGNbMF0sIHgzID0gYVswXSwgeDIxID0gZFswXSAtIHgxLCB4NDMgPSBiWzBdIC0geDMsIHkxID0gY1sxXSwgeTMgPSBhWzFdLCB5MjEgPSBkWzFdIC0geTEsIHk0MyA9IGJbMV0gLSB5MywgdWEgPSAoeDQzICogKHkxIC0geTMpIC0geTQzICogKHgxIC0geDMpKSAvICh5NDMgKiB4MjEgLSB4NDMgKiB5MjEpO1xuICAgIHJldHVybiBbIHgxICsgdWEgKiB4MjEsIHkxICsgdWEgKiB5MjEgXTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3BvbHlnb25DbG9zZWQoY29vcmRpbmF0ZXMpIHtcbiAgICB2YXIgYSA9IGNvb3JkaW5hdGVzWzBdLCBiID0gY29vcmRpbmF0ZXNbY29vcmRpbmF0ZXMubGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuICEoYVswXSAtIGJbMF0gfHwgYVsxXSAtIGJbMV0pO1xuICB9XG4gIHZhciBkM19nZW9tX3Zvcm9ub2lFZGdlcywgZDNfZ2VvbV92b3Jvbm9pQ2VsbHMsIGQzX2dlb21fdm9yb25vaUJlYWNoZXMsIGQzX2dlb21fdm9yb25vaUJlYWNoUG9vbCA9IFtdLCBkM19nZW9tX3Zvcm9ub2lGaXJzdENpcmNsZSwgZDNfZ2VvbV92b3Jvbm9pQ2lyY2xlcywgZDNfZ2VvbV92b3Jvbm9pQ2lyY2xlUG9vbCA9IFtdO1xuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lCZWFjaCgpIHtcbiAgICBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja05vZGUodGhpcyk7XG4gICAgdGhpcy5lZGdlID0gdGhpcy5zaXRlID0gdGhpcy5jaXJjbGUgPSBudWxsO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb21fdm9yb25vaUNyZWF0ZUJlYWNoKHNpdGUpIHtcbiAgICB2YXIgYmVhY2ggPSBkM19nZW9tX3Zvcm9ub2lCZWFjaFBvb2wucG9wKCkgfHwgbmV3IGQzX2dlb21fdm9yb25vaUJlYWNoKCk7XG4gICAgYmVhY2guc2l0ZSA9IHNpdGU7XG4gICAgcmV0dXJuIGJlYWNoO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb21fdm9yb25vaURldGFjaEJlYWNoKGJlYWNoKSB7XG4gICAgZDNfZ2VvbV92b3Jvbm9pRGV0YWNoQ2lyY2xlKGJlYWNoKTtcbiAgICBkM19nZW9tX3Zvcm9ub2lCZWFjaGVzLnJlbW92ZShiZWFjaCk7XG4gICAgZDNfZ2VvbV92b3Jvbm9pQmVhY2hQb29sLnB1c2goYmVhY2gpO1xuICAgIGQzX2dlb21fdm9yb25vaVJlZEJsYWNrTm9kZShiZWFjaCk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pUmVtb3ZlQmVhY2goYmVhY2gpIHtcbiAgICB2YXIgY2lyY2xlID0gYmVhY2guY2lyY2xlLCB4ID0gY2lyY2xlLngsIHkgPSBjaXJjbGUuY3ksIHZlcnRleCA9IHtcbiAgICAgIHg6IHgsXG4gICAgICB5OiB5XG4gICAgfSwgcHJldmlvdXMgPSBiZWFjaC5QLCBuZXh0ID0gYmVhY2guTiwgZGlzYXBwZWFyaW5nID0gWyBiZWFjaCBdO1xuICAgIGQzX2dlb21fdm9yb25vaURldGFjaEJlYWNoKGJlYWNoKTtcbiAgICB2YXIgbEFyYyA9IHByZXZpb3VzO1xuICAgIHdoaWxlIChsQXJjLmNpcmNsZSAmJiBhYnMoeCAtIGxBcmMuY2lyY2xlLngpIDwgzrUgJiYgYWJzKHkgLSBsQXJjLmNpcmNsZS5jeSkgPCDOtSkge1xuICAgICAgcHJldmlvdXMgPSBsQXJjLlA7XG4gICAgICBkaXNhcHBlYXJpbmcudW5zaGlmdChsQXJjKTtcbiAgICAgIGQzX2dlb21fdm9yb25vaURldGFjaEJlYWNoKGxBcmMpO1xuICAgICAgbEFyYyA9IHByZXZpb3VzO1xuICAgIH1cbiAgICBkaXNhcHBlYXJpbmcudW5zaGlmdChsQXJjKTtcbiAgICBkM19nZW9tX3Zvcm9ub2lEZXRhY2hDaXJjbGUobEFyYyk7XG4gICAgdmFyIHJBcmMgPSBuZXh0O1xuICAgIHdoaWxlIChyQXJjLmNpcmNsZSAmJiBhYnMoeCAtIHJBcmMuY2lyY2xlLngpIDwgzrUgJiYgYWJzKHkgLSByQXJjLmNpcmNsZS5jeSkgPCDOtSkge1xuICAgICAgbmV4dCA9IHJBcmMuTjtcbiAgICAgIGRpc2FwcGVhcmluZy5wdXNoKHJBcmMpO1xuICAgICAgZDNfZ2VvbV92b3Jvbm9pRGV0YWNoQmVhY2gockFyYyk7XG4gICAgICByQXJjID0gbmV4dDtcbiAgICB9XG4gICAgZGlzYXBwZWFyaW5nLnB1c2gockFyYyk7XG4gICAgZDNfZ2VvbV92b3Jvbm9pRGV0YWNoQ2lyY2xlKHJBcmMpO1xuICAgIHZhciBuQXJjcyA9IGRpc2FwcGVhcmluZy5sZW5ndGgsIGlBcmM7XG4gICAgZm9yIChpQXJjID0gMTsgaUFyYyA8IG5BcmNzOyArK2lBcmMpIHtcbiAgICAgIHJBcmMgPSBkaXNhcHBlYXJpbmdbaUFyY107XG4gICAgICBsQXJjID0gZGlzYXBwZWFyaW5nW2lBcmMgLSAxXTtcbiAgICAgIGQzX2dlb21fdm9yb25vaVNldEVkZ2VFbmQockFyYy5lZGdlLCBsQXJjLnNpdGUsIHJBcmMuc2l0ZSwgdmVydGV4KTtcbiAgICB9XG4gICAgbEFyYyA9IGRpc2FwcGVhcmluZ1swXTtcbiAgICByQXJjID0gZGlzYXBwZWFyaW5nW25BcmNzIC0gMV07XG4gICAgckFyYy5lZGdlID0gZDNfZ2VvbV92b3Jvbm9pQ3JlYXRlRWRnZShsQXJjLnNpdGUsIHJBcmMuc2l0ZSwgbnVsbCwgdmVydGV4KTtcbiAgICBkM19nZW9tX3Zvcm9ub2lBdHRhY2hDaXJjbGUobEFyYyk7XG4gICAgZDNfZ2VvbV92b3Jvbm9pQXR0YWNoQ2lyY2xlKHJBcmMpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb21fdm9yb25vaUFkZEJlYWNoKHNpdGUpIHtcbiAgICB2YXIgeCA9IHNpdGUueCwgZGlyZWN0cml4ID0gc2l0ZS55LCBsQXJjLCByQXJjLCBkeGwsIGR4ciwgbm9kZSA9IGQzX2dlb21fdm9yb25vaUJlYWNoZXMuXztcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgZHhsID0gZDNfZ2VvbV92b3Jvbm9pTGVmdEJyZWFrUG9pbnQobm9kZSwgZGlyZWN0cml4KSAtIHg7XG4gICAgICBpZiAoZHhsID4gzrUpIG5vZGUgPSBub2RlLkw7IGVsc2Uge1xuICAgICAgICBkeHIgPSB4IC0gZDNfZ2VvbV92b3Jvbm9pUmlnaHRCcmVha1BvaW50KG5vZGUsIGRpcmVjdHJpeCk7XG4gICAgICAgIGlmIChkeHIgPiDOtSkge1xuICAgICAgICAgIGlmICghbm9kZS5SKSB7XG4gICAgICAgICAgICBsQXJjID0gbm9kZTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBub2RlID0gbm9kZS5SO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChkeGwgPiAtzrUpIHtcbiAgICAgICAgICAgIGxBcmMgPSBub2RlLlA7XG4gICAgICAgICAgICByQXJjID0gbm9kZTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGR4ciA+IC3OtSkge1xuICAgICAgICAgICAgbEFyYyA9IG5vZGU7XG4gICAgICAgICAgICByQXJjID0gbm9kZS5OO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsQXJjID0gckFyYyA9IG5vZGU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHZhciBuZXdBcmMgPSBkM19nZW9tX3Zvcm9ub2lDcmVhdGVCZWFjaChzaXRlKTtcbiAgICBkM19nZW9tX3Zvcm9ub2lCZWFjaGVzLmluc2VydChsQXJjLCBuZXdBcmMpO1xuICAgIGlmICghbEFyYyAmJiAhckFyYykgcmV0dXJuO1xuICAgIGlmIChsQXJjID09PSByQXJjKSB7XG4gICAgICBkM19nZW9tX3Zvcm9ub2lEZXRhY2hDaXJjbGUobEFyYyk7XG4gICAgICByQXJjID0gZDNfZ2VvbV92b3Jvbm9pQ3JlYXRlQmVhY2gobEFyYy5zaXRlKTtcbiAgICAgIGQzX2dlb21fdm9yb25vaUJlYWNoZXMuaW5zZXJ0KG5ld0FyYywgckFyYyk7XG4gICAgICBuZXdBcmMuZWRnZSA9IHJBcmMuZWRnZSA9IGQzX2dlb21fdm9yb25vaUNyZWF0ZUVkZ2UobEFyYy5zaXRlLCBuZXdBcmMuc2l0ZSk7XG4gICAgICBkM19nZW9tX3Zvcm9ub2lBdHRhY2hDaXJjbGUobEFyYyk7XG4gICAgICBkM19nZW9tX3Zvcm9ub2lBdHRhY2hDaXJjbGUockFyYyk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICghckFyYykge1xuICAgICAgbmV3QXJjLmVkZ2UgPSBkM19nZW9tX3Zvcm9ub2lDcmVhdGVFZGdlKGxBcmMuc2l0ZSwgbmV3QXJjLnNpdGUpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkM19nZW9tX3Zvcm9ub2lEZXRhY2hDaXJjbGUobEFyYyk7XG4gICAgZDNfZ2VvbV92b3Jvbm9pRGV0YWNoQ2lyY2xlKHJBcmMpO1xuICAgIHZhciBsU2l0ZSA9IGxBcmMuc2l0ZSwgYXggPSBsU2l0ZS54LCBheSA9IGxTaXRlLnksIGJ4ID0gc2l0ZS54IC0gYXgsIGJ5ID0gc2l0ZS55IC0gYXksIHJTaXRlID0gckFyYy5zaXRlLCBjeCA9IHJTaXRlLnggLSBheCwgY3kgPSByU2l0ZS55IC0gYXksIGQgPSAyICogKGJ4ICogY3kgLSBieSAqIGN4KSwgaGIgPSBieCAqIGJ4ICsgYnkgKiBieSwgaGMgPSBjeCAqIGN4ICsgY3kgKiBjeSwgdmVydGV4ID0ge1xuICAgICAgeDogKGN5ICogaGIgLSBieSAqIGhjKSAvIGQgKyBheCxcbiAgICAgIHk6IChieCAqIGhjIC0gY3ggKiBoYikgLyBkICsgYXlcbiAgICB9O1xuICAgIGQzX2dlb21fdm9yb25vaVNldEVkZ2VFbmQockFyYy5lZGdlLCBsU2l0ZSwgclNpdGUsIHZlcnRleCk7XG4gICAgbmV3QXJjLmVkZ2UgPSBkM19nZW9tX3Zvcm9ub2lDcmVhdGVFZGdlKGxTaXRlLCBzaXRlLCBudWxsLCB2ZXJ0ZXgpO1xuICAgIHJBcmMuZWRnZSA9IGQzX2dlb21fdm9yb25vaUNyZWF0ZUVkZ2Uoc2l0ZSwgclNpdGUsIG51bGwsIHZlcnRleCk7XG4gICAgZDNfZ2VvbV92b3Jvbm9pQXR0YWNoQ2lyY2xlKGxBcmMpO1xuICAgIGQzX2dlb21fdm9yb25vaUF0dGFjaENpcmNsZShyQXJjKTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lMZWZ0QnJlYWtQb2ludChhcmMsIGRpcmVjdHJpeCkge1xuICAgIHZhciBzaXRlID0gYXJjLnNpdGUsIHJmb2N4ID0gc2l0ZS54LCByZm9jeSA9IHNpdGUueSwgcGJ5MiA9IHJmb2N5IC0gZGlyZWN0cml4O1xuICAgIGlmICghcGJ5MikgcmV0dXJuIHJmb2N4O1xuICAgIHZhciBsQXJjID0gYXJjLlA7XG4gICAgaWYgKCFsQXJjKSByZXR1cm4gLUluZmluaXR5O1xuICAgIHNpdGUgPSBsQXJjLnNpdGU7XG4gICAgdmFyIGxmb2N4ID0gc2l0ZS54LCBsZm9jeSA9IHNpdGUueSwgcGxieTIgPSBsZm9jeSAtIGRpcmVjdHJpeDtcbiAgICBpZiAoIXBsYnkyKSByZXR1cm4gbGZvY3g7XG4gICAgdmFyIGhsID0gbGZvY3ggLSByZm9jeCwgYWJ5MiA9IDEgLyBwYnkyIC0gMSAvIHBsYnkyLCBiID0gaGwgLyBwbGJ5MjtcbiAgICBpZiAoYWJ5MikgcmV0dXJuICgtYiArIE1hdGguc3FydChiICogYiAtIDIgKiBhYnkyICogKGhsICogaGwgLyAoLTIgKiBwbGJ5MikgLSBsZm9jeSArIHBsYnkyIC8gMiArIHJmb2N5IC0gcGJ5MiAvIDIpKSkgLyBhYnkyICsgcmZvY3g7XG4gICAgcmV0dXJuIChyZm9jeCArIGxmb2N4KSAvIDI7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pUmlnaHRCcmVha1BvaW50KGFyYywgZGlyZWN0cml4KSB7XG4gICAgdmFyIHJBcmMgPSBhcmMuTjtcbiAgICBpZiAockFyYykgcmV0dXJuIGQzX2dlb21fdm9yb25vaUxlZnRCcmVha1BvaW50KHJBcmMsIGRpcmVjdHJpeCk7XG4gICAgdmFyIHNpdGUgPSBhcmMuc2l0ZTtcbiAgICByZXR1cm4gc2l0ZS55ID09PSBkaXJlY3RyaXggPyBzaXRlLnggOiBJbmZpbml0eTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lDZWxsKHNpdGUpIHtcbiAgICB0aGlzLnNpdGUgPSBzaXRlO1xuICAgIHRoaXMuZWRnZXMgPSBbXTtcbiAgfVxuICBkM19nZW9tX3Zvcm9ub2lDZWxsLnByb3RvdHlwZS5wcmVwYXJlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGhhbGZFZGdlcyA9IHRoaXMuZWRnZXMsIGlIYWxmRWRnZSA9IGhhbGZFZGdlcy5sZW5ndGgsIGVkZ2U7XG4gICAgd2hpbGUgKGlIYWxmRWRnZS0tKSB7XG4gICAgICBlZGdlID0gaGFsZkVkZ2VzW2lIYWxmRWRnZV0uZWRnZTtcbiAgICAgIGlmICghZWRnZS5iIHx8ICFlZGdlLmEpIGhhbGZFZGdlcy5zcGxpY2UoaUhhbGZFZGdlLCAxKTtcbiAgICB9XG4gICAgaGFsZkVkZ2VzLnNvcnQoZDNfZ2VvbV92b3Jvbm9pSGFsZkVkZ2VPcmRlcik7XG4gICAgcmV0dXJuIGhhbGZFZGdlcy5sZW5ndGg7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2dlb21fdm9yb25vaUNsb3NlQ2VsbHMoZXh0ZW50KSB7XG4gICAgdmFyIHgwID0gZXh0ZW50WzBdWzBdLCB4MSA9IGV4dGVudFsxXVswXSwgeTAgPSBleHRlbnRbMF1bMV0sIHkxID0gZXh0ZW50WzFdWzFdLCB4MiwgeTIsIHgzLCB5MywgY2VsbHMgPSBkM19nZW9tX3Zvcm9ub2lDZWxscywgaUNlbGwgPSBjZWxscy5sZW5ndGgsIGNlbGwsIGlIYWxmRWRnZSwgaGFsZkVkZ2VzLCBuSGFsZkVkZ2VzLCBzdGFydCwgZW5kO1xuICAgIHdoaWxlIChpQ2VsbC0tKSB7XG4gICAgICBjZWxsID0gY2VsbHNbaUNlbGxdO1xuICAgICAgaWYgKCFjZWxsIHx8ICFjZWxsLnByZXBhcmUoKSkgY29udGludWU7XG4gICAgICBoYWxmRWRnZXMgPSBjZWxsLmVkZ2VzO1xuICAgICAgbkhhbGZFZGdlcyA9IGhhbGZFZGdlcy5sZW5ndGg7XG4gICAgICBpSGFsZkVkZ2UgPSAwO1xuICAgICAgd2hpbGUgKGlIYWxmRWRnZSA8IG5IYWxmRWRnZXMpIHtcbiAgICAgICAgZW5kID0gaGFsZkVkZ2VzW2lIYWxmRWRnZV0uZW5kKCksIHgzID0gZW5kLngsIHkzID0gZW5kLnk7XG4gICAgICAgIHN0YXJ0ID0gaGFsZkVkZ2VzWysraUhhbGZFZGdlICUgbkhhbGZFZGdlc10uc3RhcnQoKSwgeDIgPSBzdGFydC54LCB5MiA9IHN0YXJ0Lnk7XG4gICAgICAgIGlmIChhYnMoeDMgLSB4MikgPiDOtSB8fCBhYnMoeTMgLSB5MikgPiDOtSkge1xuICAgICAgICAgIGhhbGZFZGdlcy5zcGxpY2UoaUhhbGZFZGdlLCAwLCBuZXcgZDNfZ2VvbV92b3Jvbm9pSGFsZkVkZ2UoZDNfZ2VvbV92b3Jvbm9pQ3JlYXRlQm9yZGVyRWRnZShjZWxsLnNpdGUsIGVuZCwgYWJzKHgzIC0geDApIDwgzrUgJiYgeTEgLSB5MyA+IM61ID8ge1xuICAgICAgICAgICAgeDogeDAsXG4gICAgICAgICAgICB5OiBhYnMoeDIgLSB4MCkgPCDOtSA/IHkyIDogeTFcbiAgICAgICAgICB9IDogYWJzKHkzIC0geTEpIDwgzrUgJiYgeDEgLSB4MyA+IM61ID8ge1xuICAgICAgICAgICAgeDogYWJzKHkyIC0geTEpIDwgzrUgPyB4MiA6IHgxLFxuICAgICAgICAgICAgeTogeTFcbiAgICAgICAgICB9IDogYWJzKHgzIC0geDEpIDwgzrUgJiYgeTMgLSB5MCA+IM61ID8ge1xuICAgICAgICAgICAgeDogeDEsXG4gICAgICAgICAgICB5OiBhYnMoeDIgLSB4MSkgPCDOtSA/IHkyIDogeTBcbiAgICAgICAgICB9IDogYWJzKHkzIC0geTApIDwgzrUgJiYgeDMgLSB4MCA+IM61ID8ge1xuICAgICAgICAgICAgeDogYWJzKHkyIC0geTApIDwgzrUgPyB4MiA6IHgwLFxuICAgICAgICAgICAgeTogeTBcbiAgICAgICAgICB9IDogbnVsbCksIGNlbGwuc2l0ZSwgbnVsbCkpO1xuICAgICAgICAgICsrbkhhbGZFZGdlcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lIYWxmRWRnZU9yZGVyKGEsIGIpIHtcbiAgICByZXR1cm4gYi5hbmdsZSAtIGEuYW5nbGU7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pQ2lyY2xlKCkge1xuICAgIGQzX2dlb21fdm9yb25vaVJlZEJsYWNrTm9kZSh0aGlzKTtcbiAgICB0aGlzLnggPSB0aGlzLnkgPSB0aGlzLmFyYyA9IHRoaXMuc2l0ZSA9IHRoaXMuY3kgPSBudWxsO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb21fdm9yb25vaUF0dGFjaENpcmNsZShhcmMpIHtcbiAgICB2YXIgbEFyYyA9IGFyYy5QLCByQXJjID0gYXJjLk47XG4gICAgaWYgKCFsQXJjIHx8ICFyQXJjKSByZXR1cm47XG4gICAgdmFyIGxTaXRlID0gbEFyYy5zaXRlLCBjU2l0ZSA9IGFyYy5zaXRlLCByU2l0ZSA9IHJBcmMuc2l0ZTtcbiAgICBpZiAobFNpdGUgPT09IHJTaXRlKSByZXR1cm47XG4gICAgdmFyIGJ4ID0gY1NpdGUueCwgYnkgPSBjU2l0ZS55LCBheCA9IGxTaXRlLnggLSBieCwgYXkgPSBsU2l0ZS55IC0gYnksIGN4ID0gclNpdGUueCAtIGJ4LCBjeSA9IHJTaXRlLnkgLSBieTtcbiAgICB2YXIgZCA9IDIgKiAoYXggKiBjeSAtIGF5ICogY3gpO1xuICAgIGlmIChkID49IC3OtTIpIHJldHVybjtcbiAgICB2YXIgaGEgPSBheCAqIGF4ICsgYXkgKiBheSwgaGMgPSBjeCAqIGN4ICsgY3kgKiBjeSwgeCA9IChjeSAqIGhhIC0gYXkgKiBoYykgLyBkLCB5ID0gKGF4ICogaGMgLSBjeCAqIGhhKSAvIGQsIGN5ID0geSArIGJ5O1xuICAgIHZhciBjaXJjbGUgPSBkM19nZW9tX3Zvcm9ub2lDaXJjbGVQb29sLnBvcCgpIHx8IG5ldyBkM19nZW9tX3Zvcm9ub2lDaXJjbGUoKTtcbiAgICBjaXJjbGUuYXJjID0gYXJjO1xuICAgIGNpcmNsZS5zaXRlID0gY1NpdGU7XG4gICAgY2lyY2xlLnggPSB4ICsgYng7XG4gICAgY2lyY2xlLnkgPSBjeSArIE1hdGguc3FydCh4ICogeCArIHkgKiB5KTtcbiAgICBjaXJjbGUuY3kgPSBjeTtcbiAgICBhcmMuY2lyY2xlID0gY2lyY2xlO1xuICAgIHZhciBiZWZvcmUgPSBudWxsLCBub2RlID0gZDNfZ2VvbV92b3Jvbm9pQ2lyY2xlcy5fO1xuICAgIHdoaWxlIChub2RlKSB7XG4gICAgICBpZiAoY2lyY2xlLnkgPCBub2RlLnkgfHwgY2lyY2xlLnkgPT09IG5vZGUueSAmJiBjaXJjbGUueCA8PSBub2RlLngpIHtcbiAgICAgICAgaWYgKG5vZGUuTCkgbm9kZSA9IG5vZGUuTDsgZWxzZSB7XG4gICAgICAgICAgYmVmb3JlID0gbm9kZS5QO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobm9kZS5SKSBub2RlID0gbm9kZS5SOyBlbHNlIHtcbiAgICAgICAgICBiZWZvcmUgPSBub2RlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGQzX2dlb21fdm9yb25vaUNpcmNsZXMuaW5zZXJ0KGJlZm9yZSwgY2lyY2xlKTtcbiAgICBpZiAoIWJlZm9yZSkgZDNfZ2VvbV92b3Jvbm9pRmlyc3RDaXJjbGUgPSBjaXJjbGU7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pRGV0YWNoQ2lyY2xlKGFyYykge1xuICAgIHZhciBjaXJjbGUgPSBhcmMuY2lyY2xlO1xuICAgIGlmIChjaXJjbGUpIHtcbiAgICAgIGlmICghY2lyY2xlLlApIGQzX2dlb21fdm9yb25vaUZpcnN0Q2lyY2xlID0gY2lyY2xlLk47XG4gICAgICBkM19nZW9tX3Zvcm9ub2lDaXJjbGVzLnJlbW92ZShjaXJjbGUpO1xuICAgICAgZDNfZ2VvbV92b3Jvbm9pQ2lyY2xlUG9vbC5wdXNoKGNpcmNsZSk7XG4gICAgICBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja05vZGUoY2lyY2xlKTtcbiAgICAgIGFyYy5jaXJjbGUgPSBudWxsO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lDbGlwRWRnZXMoZXh0ZW50KSB7XG4gICAgdmFyIGVkZ2VzID0gZDNfZ2VvbV92b3Jvbm9pRWRnZXMsIGNsaXAgPSBkM19nZW9tX2NsaXBMaW5lKGV4dGVudFswXVswXSwgZXh0ZW50WzBdWzFdLCBleHRlbnRbMV1bMF0sIGV4dGVudFsxXVsxXSksIGkgPSBlZGdlcy5sZW5ndGgsIGU7XG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgZSA9IGVkZ2VzW2ldO1xuICAgICAgaWYgKCFkM19nZW9tX3Zvcm9ub2lDb25uZWN0RWRnZShlLCBleHRlbnQpIHx8ICFjbGlwKGUpIHx8IGFicyhlLmEueCAtIGUuYi54KSA8IM61ICYmIGFicyhlLmEueSAtIGUuYi55KSA8IM61KSB7XG4gICAgICAgIGUuYSA9IGUuYiA9IG51bGw7XG4gICAgICAgIGVkZ2VzLnNwbGljZShpLCAxKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pQ29ubmVjdEVkZ2UoZWRnZSwgZXh0ZW50KSB7XG4gICAgdmFyIHZiID0gZWRnZS5iO1xuICAgIGlmICh2YikgcmV0dXJuIHRydWU7XG4gICAgdmFyIHZhID0gZWRnZS5hLCB4MCA9IGV4dGVudFswXVswXSwgeDEgPSBleHRlbnRbMV1bMF0sIHkwID0gZXh0ZW50WzBdWzFdLCB5MSA9IGV4dGVudFsxXVsxXSwgbFNpdGUgPSBlZGdlLmwsIHJTaXRlID0gZWRnZS5yLCBseCA9IGxTaXRlLngsIGx5ID0gbFNpdGUueSwgcnggPSByU2l0ZS54LCByeSA9IHJTaXRlLnksIGZ4ID0gKGx4ICsgcngpIC8gMiwgZnkgPSAobHkgKyByeSkgLyAyLCBmbSwgZmI7XG4gICAgaWYgKHJ5ID09PSBseSkge1xuICAgICAgaWYgKGZ4IDwgeDAgfHwgZnggPj0geDEpIHJldHVybjtcbiAgICAgIGlmIChseCA+IHJ4KSB7XG4gICAgICAgIGlmICghdmEpIHZhID0ge1xuICAgICAgICAgIHg6IGZ4LFxuICAgICAgICAgIHk6IHkwXG4gICAgICAgIH07IGVsc2UgaWYgKHZhLnkgPj0geTEpIHJldHVybjtcbiAgICAgICAgdmIgPSB7XG4gICAgICAgICAgeDogZngsXG4gICAgICAgICAgeTogeTFcbiAgICAgICAgfTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghdmEpIHZhID0ge1xuICAgICAgICAgIHg6IGZ4LFxuICAgICAgICAgIHk6IHkxXG4gICAgICAgIH07IGVsc2UgaWYgKHZhLnkgPCB5MCkgcmV0dXJuO1xuICAgICAgICB2YiA9IHtcbiAgICAgICAgICB4OiBmeCxcbiAgICAgICAgICB5OiB5MFxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmbSA9IChseCAtIHJ4KSAvIChyeSAtIGx5KTtcbiAgICAgIGZiID0gZnkgLSBmbSAqIGZ4O1xuICAgICAgaWYgKGZtIDwgLTEgfHwgZm0gPiAxKSB7XG4gICAgICAgIGlmIChseCA+IHJ4KSB7XG4gICAgICAgICAgaWYgKCF2YSkgdmEgPSB7XG4gICAgICAgICAgICB4OiAoeTAgLSBmYikgLyBmbSxcbiAgICAgICAgICAgIHk6IHkwXG4gICAgICAgICAgfTsgZWxzZSBpZiAodmEueSA+PSB5MSkgcmV0dXJuO1xuICAgICAgICAgIHZiID0ge1xuICAgICAgICAgICAgeDogKHkxIC0gZmIpIC8gZm0sXG4gICAgICAgICAgICB5OiB5MVxuICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKCF2YSkgdmEgPSB7XG4gICAgICAgICAgICB4OiAoeTEgLSBmYikgLyBmbSxcbiAgICAgICAgICAgIHk6IHkxXG4gICAgICAgICAgfTsgZWxzZSBpZiAodmEueSA8IHkwKSByZXR1cm47XG4gICAgICAgICAgdmIgPSB7XG4gICAgICAgICAgICB4OiAoeTAgLSBmYikgLyBmbSxcbiAgICAgICAgICAgIHk6IHkwXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGx5IDwgcnkpIHtcbiAgICAgICAgICBpZiAoIXZhKSB2YSA9IHtcbiAgICAgICAgICAgIHg6IHgwLFxuICAgICAgICAgICAgeTogZm0gKiB4MCArIGZiXG4gICAgICAgICAgfTsgZWxzZSBpZiAodmEueCA+PSB4MSkgcmV0dXJuO1xuICAgICAgICAgIHZiID0ge1xuICAgICAgICAgICAgeDogeDEsXG4gICAgICAgICAgICB5OiBmbSAqIHgxICsgZmJcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICghdmEpIHZhID0ge1xuICAgICAgICAgICAgeDogeDEsXG4gICAgICAgICAgICB5OiBmbSAqIHgxICsgZmJcbiAgICAgICAgICB9OyBlbHNlIGlmICh2YS54IDwgeDApIHJldHVybjtcbiAgICAgICAgICB2YiA9IHtcbiAgICAgICAgICAgIHg6IHgwLFxuICAgICAgICAgICAgeTogZm0gKiB4MCArIGZiXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBlZGdlLmEgPSB2YTtcbiAgICBlZGdlLmIgPSB2YjtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lFZGdlKGxTaXRlLCByU2l0ZSkge1xuICAgIHRoaXMubCA9IGxTaXRlO1xuICAgIHRoaXMuciA9IHJTaXRlO1xuICAgIHRoaXMuYSA9IHRoaXMuYiA9IG51bGw7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pQ3JlYXRlRWRnZShsU2l0ZSwgclNpdGUsIHZhLCB2Yikge1xuICAgIHZhciBlZGdlID0gbmV3IGQzX2dlb21fdm9yb25vaUVkZ2UobFNpdGUsIHJTaXRlKTtcbiAgICBkM19nZW9tX3Zvcm9ub2lFZGdlcy5wdXNoKGVkZ2UpO1xuICAgIGlmICh2YSkgZDNfZ2VvbV92b3Jvbm9pU2V0RWRnZUVuZChlZGdlLCBsU2l0ZSwgclNpdGUsIHZhKTtcbiAgICBpZiAodmIpIGQzX2dlb21fdm9yb25vaVNldEVkZ2VFbmQoZWRnZSwgclNpdGUsIGxTaXRlLCB2Yik7XG4gICAgZDNfZ2VvbV92b3Jvbm9pQ2VsbHNbbFNpdGUuaV0uZWRnZXMucHVzaChuZXcgZDNfZ2VvbV92b3Jvbm9pSGFsZkVkZ2UoZWRnZSwgbFNpdGUsIHJTaXRlKSk7XG4gICAgZDNfZ2VvbV92b3Jvbm9pQ2VsbHNbclNpdGUuaV0uZWRnZXMucHVzaChuZXcgZDNfZ2VvbV92b3Jvbm9pSGFsZkVkZ2UoZWRnZSwgclNpdGUsIGxTaXRlKSk7XG4gICAgcmV0dXJuIGVkZ2U7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pQ3JlYXRlQm9yZGVyRWRnZShsU2l0ZSwgdmEsIHZiKSB7XG4gICAgdmFyIGVkZ2UgPSBuZXcgZDNfZ2VvbV92b3Jvbm9pRWRnZShsU2l0ZSwgbnVsbCk7XG4gICAgZWRnZS5hID0gdmE7XG4gICAgZWRnZS5iID0gdmI7XG4gICAgZDNfZ2VvbV92b3Jvbm9pRWRnZXMucHVzaChlZGdlKTtcbiAgICByZXR1cm4gZWRnZTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lTZXRFZGdlRW5kKGVkZ2UsIGxTaXRlLCByU2l0ZSwgdmVydGV4KSB7XG4gICAgaWYgKCFlZGdlLmEgJiYgIWVkZ2UuYikge1xuICAgICAgZWRnZS5hID0gdmVydGV4O1xuICAgICAgZWRnZS5sID0gbFNpdGU7XG4gICAgICBlZGdlLnIgPSByU2l0ZTtcbiAgICB9IGVsc2UgaWYgKGVkZ2UubCA9PT0gclNpdGUpIHtcbiAgICAgIGVkZ2UuYiA9IHZlcnRleDtcbiAgICB9IGVsc2Uge1xuICAgICAgZWRnZS5hID0gdmVydGV4O1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lIYWxmRWRnZShlZGdlLCBsU2l0ZSwgclNpdGUpIHtcbiAgICB2YXIgdmEgPSBlZGdlLmEsIHZiID0gZWRnZS5iO1xuICAgIHRoaXMuZWRnZSA9IGVkZ2U7XG4gICAgdGhpcy5zaXRlID0gbFNpdGU7XG4gICAgdGhpcy5hbmdsZSA9IHJTaXRlID8gTWF0aC5hdGFuMihyU2l0ZS55IC0gbFNpdGUueSwgclNpdGUueCAtIGxTaXRlLngpIDogZWRnZS5sID09PSBsU2l0ZSA/IE1hdGguYXRhbjIodmIueCAtIHZhLngsIHZhLnkgLSB2Yi55KSA6IE1hdGguYXRhbjIodmEueCAtIHZiLngsIHZiLnkgLSB2YS55KTtcbiAgfVxuICBkM19nZW9tX3Zvcm9ub2lIYWxmRWRnZS5wcm90b3R5cGUgPSB7XG4gICAgc3RhcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZWRnZS5sID09PSB0aGlzLnNpdGUgPyB0aGlzLmVkZ2UuYSA6IHRoaXMuZWRnZS5iO1xuICAgIH0sXG4gICAgZW5kOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aGlzLmVkZ2UubCA9PT0gdGhpcy5zaXRlID8gdGhpcy5lZGdlLmIgOiB0aGlzLmVkZ2UuYTtcbiAgICB9XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2dlb21fdm9yb25vaVJlZEJsYWNrVHJlZSgpIHtcbiAgICB0aGlzLl8gPSBudWxsO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb21fdm9yb25vaVJlZEJsYWNrTm9kZShub2RlKSB7XG4gICAgbm9kZS5VID0gbm9kZS5DID0gbm9kZS5MID0gbm9kZS5SID0gbm9kZS5QID0gbm9kZS5OID0gbnVsbDtcbiAgfVxuICBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja1RyZWUucHJvdG90eXBlID0ge1xuICAgIGluc2VydDogZnVuY3Rpb24oYWZ0ZXIsIG5vZGUpIHtcbiAgICAgIHZhciBwYXJlbnQsIGdyYW5kcGEsIHVuY2xlO1xuICAgICAgaWYgKGFmdGVyKSB7XG4gICAgICAgIG5vZGUuUCA9IGFmdGVyO1xuICAgICAgICBub2RlLk4gPSBhZnRlci5OO1xuICAgICAgICBpZiAoYWZ0ZXIuTikgYWZ0ZXIuTi5QID0gbm9kZTtcbiAgICAgICAgYWZ0ZXIuTiA9IG5vZGU7XG4gICAgICAgIGlmIChhZnRlci5SKSB7XG4gICAgICAgICAgYWZ0ZXIgPSBhZnRlci5SO1xuICAgICAgICAgIHdoaWxlIChhZnRlci5MKSBhZnRlciA9IGFmdGVyLkw7XG4gICAgICAgICAgYWZ0ZXIuTCA9IG5vZGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWZ0ZXIuUiA9IG5vZGU7XG4gICAgICAgIH1cbiAgICAgICAgcGFyZW50ID0gYWZ0ZXI7XG4gICAgICB9IGVsc2UgaWYgKHRoaXMuXykge1xuICAgICAgICBhZnRlciA9IGQzX2dlb21fdm9yb25vaVJlZEJsYWNrRmlyc3QodGhpcy5fKTtcbiAgICAgICAgbm9kZS5QID0gbnVsbDtcbiAgICAgICAgbm9kZS5OID0gYWZ0ZXI7XG4gICAgICAgIGFmdGVyLlAgPSBhZnRlci5MID0gbm9kZTtcbiAgICAgICAgcGFyZW50ID0gYWZ0ZXI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub2RlLlAgPSBub2RlLk4gPSBudWxsO1xuICAgICAgICB0aGlzLl8gPSBub2RlO1xuICAgICAgICBwYXJlbnQgPSBudWxsO1xuICAgICAgfVxuICAgICAgbm9kZS5MID0gbm9kZS5SID0gbnVsbDtcbiAgICAgIG5vZGUuVSA9IHBhcmVudDtcbiAgICAgIG5vZGUuQyA9IHRydWU7XG4gICAgICBhZnRlciA9IG5vZGU7XG4gICAgICB3aGlsZSAocGFyZW50ICYmIHBhcmVudC5DKSB7XG4gICAgICAgIGdyYW5kcGEgPSBwYXJlbnQuVTtcbiAgICAgICAgaWYgKHBhcmVudCA9PT0gZ3JhbmRwYS5MKSB7XG4gICAgICAgICAgdW5jbGUgPSBncmFuZHBhLlI7XG4gICAgICAgICAgaWYgKHVuY2xlICYmIHVuY2xlLkMpIHtcbiAgICAgICAgICAgIHBhcmVudC5DID0gdW5jbGUuQyA9IGZhbHNlO1xuICAgICAgICAgICAgZ3JhbmRwYS5DID0gdHJ1ZTtcbiAgICAgICAgICAgIGFmdGVyID0gZ3JhbmRwYTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGFmdGVyID09PSBwYXJlbnQuUikge1xuICAgICAgICAgICAgICBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja1JvdGF0ZUxlZnQodGhpcywgcGFyZW50KTtcbiAgICAgICAgICAgICAgYWZ0ZXIgPSBwYXJlbnQ7XG4gICAgICAgICAgICAgIHBhcmVudCA9IGFmdGVyLlU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwYXJlbnQuQyA9IGZhbHNlO1xuICAgICAgICAgICAgZ3JhbmRwYS5DID0gdHJ1ZTtcbiAgICAgICAgICAgIGQzX2dlb21fdm9yb25vaVJlZEJsYWNrUm90YXRlUmlnaHQodGhpcywgZ3JhbmRwYSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHVuY2xlID0gZ3JhbmRwYS5MO1xuICAgICAgICAgIGlmICh1bmNsZSAmJiB1bmNsZS5DKSB7XG4gICAgICAgICAgICBwYXJlbnQuQyA9IHVuY2xlLkMgPSBmYWxzZTtcbiAgICAgICAgICAgIGdyYW5kcGEuQyA9IHRydWU7XG4gICAgICAgICAgICBhZnRlciA9IGdyYW5kcGE7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChhZnRlciA9PT0gcGFyZW50LkwpIHtcbiAgICAgICAgICAgICAgZDNfZ2VvbV92b3Jvbm9pUmVkQmxhY2tSb3RhdGVSaWdodCh0aGlzLCBwYXJlbnQpO1xuICAgICAgICAgICAgICBhZnRlciA9IHBhcmVudDtcbiAgICAgICAgICAgICAgcGFyZW50ID0gYWZ0ZXIuVTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcmVudC5DID0gZmFsc2U7XG4gICAgICAgICAgICBncmFuZHBhLkMgPSB0cnVlO1xuICAgICAgICAgICAgZDNfZ2VvbV92b3Jvbm9pUmVkQmxhY2tSb3RhdGVMZWZ0KHRoaXMsIGdyYW5kcGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwYXJlbnQgPSBhZnRlci5VO1xuICAgICAgfVxuICAgICAgdGhpcy5fLkMgPSBmYWxzZTtcbiAgICB9LFxuICAgIHJlbW92ZTogZnVuY3Rpb24obm9kZSkge1xuICAgICAgaWYgKG5vZGUuTikgbm9kZS5OLlAgPSBub2RlLlA7XG4gICAgICBpZiAobm9kZS5QKSBub2RlLlAuTiA9IG5vZGUuTjtcbiAgICAgIG5vZGUuTiA9IG5vZGUuUCA9IG51bGw7XG4gICAgICB2YXIgcGFyZW50ID0gbm9kZS5VLCBzaWJsaW5nLCBsZWZ0ID0gbm9kZS5MLCByaWdodCA9IG5vZGUuUiwgbmV4dCwgcmVkO1xuICAgICAgaWYgKCFsZWZ0KSBuZXh0ID0gcmlnaHQ7IGVsc2UgaWYgKCFyaWdodCkgbmV4dCA9IGxlZnQ7IGVsc2UgbmV4dCA9IGQzX2dlb21fdm9yb25vaVJlZEJsYWNrRmlyc3QocmlnaHQpO1xuICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICBpZiAocGFyZW50LkwgPT09IG5vZGUpIHBhcmVudC5MID0gbmV4dDsgZWxzZSBwYXJlbnQuUiA9IG5leHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl8gPSBuZXh0O1xuICAgICAgfVxuICAgICAgaWYgKGxlZnQgJiYgcmlnaHQpIHtcbiAgICAgICAgcmVkID0gbmV4dC5DO1xuICAgICAgICBuZXh0LkMgPSBub2RlLkM7XG4gICAgICAgIG5leHQuTCA9IGxlZnQ7XG4gICAgICAgIGxlZnQuVSA9IG5leHQ7XG4gICAgICAgIGlmIChuZXh0ICE9PSByaWdodCkge1xuICAgICAgICAgIHBhcmVudCA9IG5leHQuVTtcbiAgICAgICAgICBuZXh0LlUgPSBub2RlLlU7XG4gICAgICAgICAgbm9kZSA9IG5leHQuUjtcbiAgICAgICAgICBwYXJlbnQuTCA9IG5vZGU7XG4gICAgICAgICAgbmV4dC5SID0gcmlnaHQ7XG4gICAgICAgICAgcmlnaHQuVSA9IG5leHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbmV4dC5VID0gcGFyZW50O1xuICAgICAgICAgIHBhcmVudCA9IG5leHQ7XG4gICAgICAgICAgbm9kZSA9IG5leHQuUjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVkID0gbm9kZS5DO1xuICAgICAgICBub2RlID0gbmV4dDtcbiAgICAgIH1cbiAgICAgIGlmIChub2RlKSBub2RlLlUgPSBwYXJlbnQ7XG4gICAgICBpZiAocmVkKSByZXR1cm47XG4gICAgICBpZiAobm9kZSAmJiBub2RlLkMpIHtcbiAgICAgICAgbm9kZS5DID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGRvIHtcbiAgICAgICAgaWYgKG5vZGUgPT09IHRoaXMuXykgYnJlYWs7XG4gICAgICAgIGlmIChub2RlID09PSBwYXJlbnQuTCkge1xuICAgICAgICAgIHNpYmxpbmcgPSBwYXJlbnQuUjtcbiAgICAgICAgICBpZiAoc2libGluZy5DKSB7XG4gICAgICAgICAgICBzaWJsaW5nLkMgPSBmYWxzZTtcbiAgICAgICAgICAgIHBhcmVudC5DID0gdHJ1ZTtcbiAgICAgICAgICAgIGQzX2dlb21fdm9yb25vaVJlZEJsYWNrUm90YXRlTGVmdCh0aGlzLCBwYXJlbnQpO1xuICAgICAgICAgICAgc2libGluZyA9IHBhcmVudC5SO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoc2libGluZy5MICYmIHNpYmxpbmcuTC5DIHx8IHNpYmxpbmcuUiAmJiBzaWJsaW5nLlIuQykge1xuICAgICAgICAgICAgaWYgKCFzaWJsaW5nLlIgfHwgIXNpYmxpbmcuUi5DKSB7XG4gICAgICAgICAgICAgIHNpYmxpbmcuTC5DID0gZmFsc2U7XG4gICAgICAgICAgICAgIHNpYmxpbmcuQyA9IHRydWU7XG4gICAgICAgICAgICAgIGQzX2dlb21fdm9yb25vaVJlZEJsYWNrUm90YXRlUmlnaHQodGhpcywgc2libGluZyk7XG4gICAgICAgICAgICAgIHNpYmxpbmcgPSBwYXJlbnQuUjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNpYmxpbmcuQyA9IHBhcmVudC5DO1xuICAgICAgICAgICAgcGFyZW50LkMgPSBzaWJsaW5nLlIuQyA9IGZhbHNlO1xuICAgICAgICAgICAgZDNfZ2VvbV92b3Jvbm9pUmVkQmxhY2tSb3RhdGVMZWZ0KHRoaXMsIHBhcmVudCk7XG4gICAgICAgICAgICBub2RlID0gdGhpcy5fO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNpYmxpbmcgPSBwYXJlbnQuTDtcbiAgICAgICAgICBpZiAoc2libGluZy5DKSB7XG4gICAgICAgICAgICBzaWJsaW5nLkMgPSBmYWxzZTtcbiAgICAgICAgICAgIHBhcmVudC5DID0gdHJ1ZTtcbiAgICAgICAgICAgIGQzX2dlb21fdm9yb25vaVJlZEJsYWNrUm90YXRlUmlnaHQodGhpcywgcGFyZW50KTtcbiAgICAgICAgICAgIHNpYmxpbmcgPSBwYXJlbnQuTDtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHNpYmxpbmcuTCAmJiBzaWJsaW5nLkwuQyB8fCBzaWJsaW5nLlIgJiYgc2libGluZy5SLkMpIHtcbiAgICAgICAgICAgIGlmICghc2libGluZy5MIHx8ICFzaWJsaW5nLkwuQykge1xuICAgICAgICAgICAgICBzaWJsaW5nLlIuQyA9IGZhbHNlO1xuICAgICAgICAgICAgICBzaWJsaW5nLkMgPSB0cnVlO1xuICAgICAgICAgICAgICBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja1JvdGF0ZUxlZnQodGhpcywgc2libGluZyk7XG4gICAgICAgICAgICAgIHNpYmxpbmcgPSBwYXJlbnQuTDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNpYmxpbmcuQyA9IHBhcmVudC5DO1xuICAgICAgICAgICAgcGFyZW50LkMgPSBzaWJsaW5nLkwuQyA9IGZhbHNlO1xuICAgICAgICAgICAgZDNfZ2VvbV92b3Jvbm9pUmVkQmxhY2tSb3RhdGVSaWdodCh0aGlzLCBwYXJlbnQpO1xuICAgICAgICAgICAgbm9kZSA9IHRoaXMuXztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzaWJsaW5nLkMgPSB0cnVlO1xuICAgICAgICBub2RlID0gcGFyZW50O1xuICAgICAgICBwYXJlbnQgPSBwYXJlbnQuVTtcbiAgICAgIH0gd2hpbGUgKCFub2RlLkMpO1xuICAgICAgaWYgKG5vZGUpIG5vZGUuQyA9IGZhbHNlO1xuICAgIH1cbiAgfTtcbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pUmVkQmxhY2tSb3RhdGVMZWZ0KHRyZWUsIG5vZGUpIHtcbiAgICB2YXIgcCA9IG5vZGUsIHEgPSBub2RlLlIsIHBhcmVudCA9IHAuVTtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICBpZiAocGFyZW50LkwgPT09IHApIHBhcmVudC5MID0gcTsgZWxzZSBwYXJlbnQuUiA9IHE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyZWUuXyA9IHE7XG4gICAgfVxuICAgIHEuVSA9IHBhcmVudDtcbiAgICBwLlUgPSBxO1xuICAgIHAuUiA9IHEuTDtcbiAgICBpZiAocC5SKSBwLlIuVSA9IHA7XG4gICAgcS5MID0gcDtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja1JvdGF0ZVJpZ2h0KHRyZWUsIG5vZGUpIHtcbiAgICB2YXIgcCA9IG5vZGUsIHEgPSBub2RlLkwsIHBhcmVudCA9IHAuVTtcbiAgICBpZiAocGFyZW50KSB7XG4gICAgICBpZiAocGFyZW50LkwgPT09IHApIHBhcmVudC5MID0gcTsgZWxzZSBwYXJlbnQuUiA9IHE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRyZWUuXyA9IHE7XG4gICAgfVxuICAgIHEuVSA9IHBhcmVudDtcbiAgICBwLlUgPSBxO1xuICAgIHAuTCA9IHEuUjtcbiAgICBpZiAocC5MKSBwLkwuVSA9IHA7XG4gICAgcS5SID0gcDtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lSZWRCbGFja0ZpcnN0KG5vZGUpIHtcbiAgICB3aGlsZSAobm9kZS5MKSBub2RlID0gbm9kZS5MO1xuICAgIHJldHVybiBub2RlO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb21fdm9yb25vaShzaXRlcywgYmJveCkge1xuICAgIHZhciBzaXRlID0gc2l0ZXMuc29ydChkM19nZW9tX3Zvcm9ub2lWZXJ0ZXhPcmRlcikucG9wKCksIHgwLCB5MCwgY2lyY2xlO1xuICAgIGQzX2dlb21fdm9yb25vaUVkZ2VzID0gW107XG4gICAgZDNfZ2VvbV92b3Jvbm9pQ2VsbHMgPSBuZXcgQXJyYXkoc2l0ZXMubGVuZ3RoKTtcbiAgICBkM19nZW9tX3Zvcm9ub2lCZWFjaGVzID0gbmV3IGQzX2dlb21fdm9yb25vaVJlZEJsYWNrVHJlZSgpO1xuICAgIGQzX2dlb21fdm9yb25vaUNpcmNsZXMgPSBuZXcgZDNfZ2VvbV92b3Jvbm9pUmVkQmxhY2tUcmVlKCk7XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgIGNpcmNsZSA9IGQzX2dlb21fdm9yb25vaUZpcnN0Q2lyY2xlO1xuICAgICAgaWYgKHNpdGUgJiYgKCFjaXJjbGUgfHwgc2l0ZS55IDwgY2lyY2xlLnkgfHwgc2l0ZS55ID09PSBjaXJjbGUueSAmJiBzaXRlLnggPCBjaXJjbGUueCkpIHtcbiAgICAgICAgaWYgKHNpdGUueCAhPT0geDAgfHwgc2l0ZS55ICE9PSB5MCkge1xuICAgICAgICAgIGQzX2dlb21fdm9yb25vaUNlbGxzW3NpdGUuaV0gPSBuZXcgZDNfZ2VvbV92b3Jvbm9pQ2VsbChzaXRlKTtcbiAgICAgICAgICBkM19nZW9tX3Zvcm9ub2lBZGRCZWFjaChzaXRlKTtcbiAgICAgICAgICB4MCA9IHNpdGUueCwgeTAgPSBzaXRlLnk7XG4gICAgICAgIH1cbiAgICAgICAgc2l0ZSA9IHNpdGVzLnBvcCgpO1xuICAgICAgfSBlbHNlIGlmIChjaXJjbGUpIHtcbiAgICAgICAgZDNfZ2VvbV92b3Jvbm9pUmVtb3ZlQmVhY2goY2lyY2xlLmFyYyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGJib3gpIGQzX2dlb21fdm9yb25vaUNsaXBFZGdlcyhiYm94KSwgZDNfZ2VvbV92b3Jvbm9pQ2xvc2VDZWxscyhiYm94KTtcbiAgICB2YXIgZGlhZ3JhbSA9IHtcbiAgICAgIGNlbGxzOiBkM19nZW9tX3Zvcm9ub2lDZWxscyxcbiAgICAgIGVkZ2VzOiBkM19nZW9tX3Zvcm9ub2lFZGdlc1xuICAgIH07XG4gICAgZDNfZ2VvbV92b3Jvbm9pQmVhY2hlcyA9IGQzX2dlb21fdm9yb25vaUNpcmNsZXMgPSBkM19nZW9tX3Zvcm9ub2lFZGdlcyA9IGQzX2dlb21fdm9yb25vaUNlbGxzID0gbnVsbDtcbiAgICByZXR1cm4gZGlhZ3JhbTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3Zvcm9ub2lWZXJ0ZXhPcmRlcihhLCBiKSB7XG4gICAgcmV0dXJuIGIueSAtIGEueSB8fCBiLnggLSBhLng7XG4gIH1cbiAgZDMuZ2VvbS52b3Jvbm9pID0gZnVuY3Rpb24ocG9pbnRzKSB7XG4gICAgdmFyIHggPSBkM19nZW9tX3BvaW50WCwgeSA9IGQzX2dlb21fcG9pbnRZLCBmeCA9IHgsIGZ5ID0geSwgY2xpcEV4dGVudCA9IGQzX2dlb21fdm9yb25vaUNsaXBFeHRlbnQ7XG4gICAgaWYgKHBvaW50cykgcmV0dXJuIHZvcm9ub2kocG9pbnRzKTtcbiAgICBmdW5jdGlvbiB2b3Jvbm9pKGRhdGEpIHtcbiAgICAgIHZhciBwb2x5Z29ucyA9IG5ldyBBcnJheShkYXRhLmxlbmd0aCksIHgwID0gY2xpcEV4dGVudFswXVswXSwgeTAgPSBjbGlwRXh0ZW50WzBdWzFdLCB4MSA9IGNsaXBFeHRlbnRbMV1bMF0sIHkxID0gY2xpcEV4dGVudFsxXVsxXTtcbiAgICAgIGQzX2dlb21fdm9yb25vaShzaXRlcyhkYXRhKSwgY2xpcEV4dGVudCkuY2VsbHMuZm9yRWFjaChmdW5jdGlvbihjZWxsLCBpKSB7XG4gICAgICAgIHZhciBlZGdlcyA9IGNlbGwuZWRnZXMsIHNpdGUgPSBjZWxsLnNpdGUsIHBvbHlnb24gPSBwb2x5Z29uc1tpXSA9IGVkZ2VzLmxlbmd0aCA/IGVkZ2VzLm1hcChmdW5jdGlvbihlKSB7XG4gICAgICAgICAgdmFyIHMgPSBlLnN0YXJ0KCk7XG4gICAgICAgICAgcmV0dXJuIFsgcy54LCBzLnkgXTtcbiAgICAgICAgfSkgOiBzaXRlLnggPj0geDAgJiYgc2l0ZS54IDw9IHgxICYmIHNpdGUueSA+PSB5MCAmJiBzaXRlLnkgPD0geTEgPyBbIFsgeDAsIHkxIF0sIFsgeDEsIHkxIF0sIFsgeDEsIHkwIF0sIFsgeDAsIHkwIF0gXSA6IFtdO1xuICAgICAgICBwb2x5Z29uLnBvaW50ID0gZGF0YVtpXTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHBvbHlnb25zO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzaXRlcyhkYXRhKSB7XG4gICAgICByZXR1cm4gZGF0YS5tYXAoZnVuY3Rpb24oZCwgaSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHg6IE1hdGgucm91bmQoZngoZCwgaSkgLyDOtSkgKiDOtSxcbiAgICAgICAgICB5OiBNYXRoLnJvdW5kKGZ5KGQsIGkpIC8gzrUpICogzrUsXG4gICAgICAgICAgaTogaVxuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgfVxuICAgIHZvcm9ub2kubGlua3MgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gZDNfZ2VvbV92b3Jvbm9pKHNpdGVzKGRhdGEpKS5lZGdlcy5maWx0ZXIoZnVuY3Rpb24oZWRnZSkge1xuICAgICAgICByZXR1cm4gZWRnZS5sICYmIGVkZ2UucjtcbiAgICAgIH0pLm1hcChmdW5jdGlvbihlZGdlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc291cmNlOiBkYXRhW2VkZ2UubC5pXSxcbiAgICAgICAgICB0YXJnZXQ6IGRhdGFbZWRnZS5yLmldXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9O1xuICAgIHZvcm9ub2kudHJpYW5nbGVzID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIHRyaWFuZ2xlcyA9IFtdO1xuICAgICAgZDNfZ2VvbV92b3Jvbm9pKHNpdGVzKGRhdGEpKS5jZWxscy5mb3JFYWNoKGZ1bmN0aW9uKGNlbGwsIGkpIHtcbiAgICAgICAgdmFyIHNpdGUgPSBjZWxsLnNpdGUsIGVkZ2VzID0gY2VsbC5lZGdlcy5zb3J0KGQzX2dlb21fdm9yb25vaUhhbGZFZGdlT3JkZXIpLCBqID0gLTEsIG0gPSBlZGdlcy5sZW5ndGgsIGUwLCBzMCwgZTEgPSBlZGdlc1ttIC0gMV0uZWRnZSwgczEgPSBlMS5sID09PSBzaXRlID8gZTEuciA6IGUxLmw7XG4gICAgICAgIHdoaWxlICgrK2ogPCBtKSB7XG4gICAgICAgICAgZTAgPSBlMTtcbiAgICAgICAgICBzMCA9IHMxO1xuICAgICAgICAgIGUxID0gZWRnZXNbal0uZWRnZTtcbiAgICAgICAgICBzMSA9IGUxLmwgPT09IHNpdGUgPyBlMS5yIDogZTEubDtcbiAgICAgICAgICBpZiAoaSA8IHMwLmkgJiYgaSA8IHMxLmkgJiYgZDNfZ2VvbV92b3Jvbm9pVHJpYW5nbGVBcmVhKHNpdGUsIHMwLCBzMSkgPCAwKSB7XG4gICAgICAgICAgICB0cmlhbmdsZXMucHVzaChbIGRhdGFbaV0sIGRhdGFbczAuaV0sIGRhdGFbczEuaV0gXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0cmlhbmdsZXM7XG4gICAgfTtcbiAgICB2b3Jvbm9pLnggPSBmdW5jdGlvbihfKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChmeCA9IGQzX2Z1bmN0b3IoeCA9IF8pLCB2b3Jvbm9pKSA6IHg7XG4gICAgfTtcbiAgICB2b3Jvbm9pLnkgPSBmdW5jdGlvbihfKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChmeSA9IGQzX2Z1bmN0b3IoeSA9IF8pLCB2b3Jvbm9pKSA6IHk7XG4gICAgfTtcbiAgICB2b3Jvbm9pLmNsaXBFeHRlbnQgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjbGlwRXh0ZW50ID09PSBkM19nZW9tX3Zvcm9ub2lDbGlwRXh0ZW50ID8gbnVsbCA6IGNsaXBFeHRlbnQ7XG4gICAgICBjbGlwRXh0ZW50ID0gXyA9PSBudWxsID8gZDNfZ2VvbV92b3Jvbm9pQ2xpcEV4dGVudCA6IF87XG4gICAgICByZXR1cm4gdm9yb25vaTtcbiAgICB9O1xuICAgIHZvcm9ub2kuc2l6ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGNsaXBFeHRlbnQgPT09IGQzX2dlb21fdm9yb25vaUNsaXBFeHRlbnQgPyBudWxsIDogY2xpcEV4dGVudCAmJiBjbGlwRXh0ZW50WzFdO1xuICAgICAgcmV0dXJuIHZvcm9ub2kuY2xpcEV4dGVudChfICYmIFsgWyAwLCAwIF0sIF8gXSk7XG4gICAgfTtcbiAgICByZXR1cm4gdm9yb25vaTtcbiAgfTtcbiAgdmFyIGQzX2dlb21fdm9yb25vaUNsaXBFeHRlbnQgPSBbIFsgLTFlNiwgLTFlNiBdLCBbIDFlNiwgMWU2IF0gXTtcbiAgZnVuY3Rpb24gZDNfZ2VvbV92b3Jvbm9pVHJpYW5nbGVBcmVhKGEsIGIsIGMpIHtcbiAgICByZXR1cm4gKGEueCAtIGMueCkgKiAoYi55IC0gYS55KSAtIChhLnggLSBiLngpICogKGMueSAtIGEueSk7XG4gIH1cbiAgZDMuZ2VvbS5kZWxhdW5heSA9IGZ1bmN0aW9uKHZlcnRpY2VzKSB7XG4gICAgcmV0dXJuIGQzLmdlb20udm9yb25vaSgpLnRyaWFuZ2xlcyh2ZXJ0aWNlcyk7XG4gIH07XG4gIGQzLmdlb20ucXVhZHRyZWUgPSBmdW5jdGlvbihwb2ludHMsIHgxLCB5MSwgeDIsIHkyKSB7XG4gICAgdmFyIHggPSBkM19nZW9tX3BvaW50WCwgeSA9IGQzX2dlb21fcG9pbnRZLCBjb21wYXQ7XG4gICAgaWYgKGNvbXBhdCA9IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIHggPSBkM19nZW9tX3F1YWR0cmVlQ29tcGF0WDtcbiAgICAgIHkgPSBkM19nZW9tX3F1YWR0cmVlQ29tcGF0WTtcbiAgICAgIGlmIChjb21wYXQgPT09IDMpIHtcbiAgICAgICAgeTIgPSB5MTtcbiAgICAgICAgeDIgPSB4MTtcbiAgICAgICAgeTEgPSB4MSA9IDA7XG4gICAgICB9XG4gICAgICByZXR1cm4gcXVhZHRyZWUocG9pbnRzKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcXVhZHRyZWUoZGF0YSkge1xuICAgICAgdmFyIGQsIGZ4ID0gZDNfZnVuY3Rvcih4KSwgZnkgPSBkM19mdW5jdG9yKHkpLCB4cywgeXMsIGksIG4sIHgxXywgeTFfLCB4Ml8sIHkyXztcbiAgICAgIGlmICh4MSAhPSBudWxsKSB7XG4gICAgICAgIHgxXyA9IHgxLCB5MV8gPSB5MSwgeDJfID0geDIsIHkyXyA9IHkyO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgeDJfID0geTJfID0gLSh4MV8gPSB5MV8gPSBJbmZpbml0eSk7XG4gICAgICAgIHhzID0gW10sIHlzID0gW107XG4gICAgICAgIG4gPSBkYXRhLmxlbmd0aDtcbiAgICAgICAgaWYgKGNvbXBhdCkgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgICAgIGQgPSBkYXRhW2ldO1xuICAgICAgICAgIGlmIChkLnggPCB4MV8pIHgxXyA9IGQueDtcbiAgICAgICAgICBpZiAoZC55IDwgeTFfKSB5MV8gPSBkLnk7XG4gICAgICAgICAgaWYgKGQueCA+IHgyXykgeDJfID0gZC54O1xuICAgICAgICAgIGlmIChkLnkgPiB5Ml8pIHkyXyA9IGQueTtcbiAgICAgICAgICB4cy5wdXNoKGQueCk7XG4gICAgICAgICAgeXMucHVzaChkLnkpO1xuICAgICAgICB9IGVsc2UgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgICAgIHZhciB4XyA9ICtmeChkID0gZGF0YVtpXSwgaSksIHlfID0gK2Z5KGQsIGkpO1xuICAgICAgICAgIGlmICh4XyA8IHgxXykgeDFfID0geF87XG4gICAgICAgICAgaWYgKHlfIDwgeTFfKSB5MV8gPSB5XztcbiAgICAgICAgICBpZiAoeF8gPiB4Ml8pIHgyXyA9IHhfO1xuICAgICAgICAgIGlmICh5XyA+IHkyXykgeTJfID0geV87XG4gICAgICAgICAgeHMucHVzaCh4Xyk7XG4gICAgICAgICAgeXMucHVzaCh5Xyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciBkeCA9IHgyXyAtIHgxXywgZHkgPSB5Ml8gLSB5MV87XG4gICAgICBpZiAoZHggPiBkeSkgeTJfID0geTFfICsgZHg7IGVsc2UgeDJfID0geDFfICsgZHk7XG4gICAgICBmdW5jdGlvbiBpbnNlcnQobiwgZCwgeCwgeSwgeDEsIHkxLCB4MiwgeTIpIHtcbiAgICAgICAgaWYgKGlzTmFOKHgpIHx8IGlzTmFOKHkpKSByZXR1cm47XG4gICAgICAgIGlmIChuLmxlYWYpIHtcbiAgICAgICAgICB2YXIgbnggPSBuLngsIG55ID0gbi55O1xuICAgICAgICAgIGlmIChueCAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoYWJzKG54IC0geCkgKyBhYnMobnkgLSB5KSA8IC4wMSkge1xuICAgICAgICAgICAgICBpbnNlcnRDaGlsZChuLCBkLCB4LCB5LCB4MSwgeTEsIHgyLCB5Mik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB2YXIgblBvaW50ID0gbi5wb2ludDtcbiAgICAgICAgICAgICAgbi54ID0gbi55ID0gbi5wb2ludCA9IG51bGw7XG4gICAgICAgICAgICAgIGluc2VydENoaWxkKG4sIG5Qb2ludCwgbngsIG55LCB4MSwgeTEsIHgyLCB5Mik7XG4gICAgICAgICAgICAgIGluc2VydENoaWxkKG4sIGQsIHgsIHksIHgxLCB5MSwgeDIsIHkyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbi54ID0geCwgbi55ID0geSwgbi5wb2ludCA9IGQ7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGluc2VydENoaWxkKG4sIGQsIHgsIHksIHgxLCB5MSwgeDIsIHkyKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZnVuY3Rpb24gaW5zZXJ0Q2hpbGQobiwgZCwgeCwgeSwgeDEsIHkxLCB4MiwgeTIpIHtcbiAgICAgICAgdmFyIHN4ID0gKHgxICsgeDIpICogLjUsIHN5ID0gKHkxICsgeTIpICogLjUsIHJpZ2h0ID0geCA+PSBzeCwgYm90dG9tID0geSA+PSBzeSwgaSA9IChib3R0b20gPDwgMSkgKyByaWdodDtcbiAgICAgICAgbi5sZWFmID0gZmFsc2U7XG4gICAgICAgIG4gPSBuLm5vZGVzW2ldIHx8IChuLm5vZGVzW2ldID0gZDNfZ2VvbV9xdWFkdHJlZU5vZGUoKSk7XG4gICAgICAgIGlmIChyaWdodCkgeDEgPSBzeDsgZWxzZSB4MiA9IHN4O1xuICAgICAgICBpZiAoYm90dG9tKSB5MSA9IHN5OyBlbHNlIHkyID0gc3k7XG4gICAgICAgIGluc2VydChuLCBkLCB4LCB5LCB4MSwgeTEsIHgyLCB5Mik7XG4gICAgICB9XG4gICAgICB2YXIgcm9vdCA9IGQzX2dlb21fcXVhZHRyZWVOb2RlKCk7XG4gICAgICByb290LmFkZCA9IGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgaW5zZXJ0KHJvb3QsIGQsICtmeChkLCArK2kpLCArZnkoZCwgaSksIHgxXywgeTFfLCB4Ml8sIHkyXyk7XG4gICAgICB9O1xuICAgICAgcm9vdC52aXNpdCA9IGZ1bmN0aW9uKGYpIHtcbiAgICAgICAgZDNfZ2VvbV9xdWFkdHJlZVZpc2l0KGYsIHJvb3QsIHgxXywgeTFfLCB4Ml8sIHkyXyk7XG4gICAgICB9O1xuICAgICAgaSA9IC0xO1xuICAgICAgaWYgKHgxID09IG51bGwpIHtcbiAgICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgICBpbnNlcnQocm9vdCwgZGF0YVtpXSwgeHNbaV0sIHlzW2ldLCB4MV8sIHkxXywgeDJfLCB5Ml8pO1xuICAgICAgICB9XG4gICAgICAgIC0taTtcbiAgICAgIH0gZWxzZSBkYXRhLmZvckVhY2gocm9vdC5hZGQpO1xuICAgICAgeHMgPSB5cyA9IGRhdGEgPSBkID0gbnVsbDtcbiAgICAgIHJldHVybiByb290O1xuICAgIH1cbiAgICBxdWFkdHJlZS54ID0gZnVuY3Rpb24oXykge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoeCA9IF8sIHF1YWR0cmVlKSA6IHg7XG4gICAgfTtcbiAgICBxdWFkdHJlZS55ID0gZnVuY3Rpb24oXykge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoeSA9IF8sIHF1YWR0cmVlKSA6IHk7XG4gICAgfTtcbiAgICBxdWFkdHJlZS5leHRlbnQgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB4MSA9PSBudWxsID8gbnVsbCA6IFsgWyB4MSwgeTEgXSwgWyB4MiwgeTIgXSBdO1xuICAgICAgaWYgKF8gPT0gbnVsbCkgeDEgPSB5MSA9IHgyID0geTIgPSBudWxsOyBlbHNlIHgxID0gK19bMF1bMF0sIHkxID0gK19bMF1bMV0sIHgyID0gK19bMV1bMF0sIFxuICAgICAgeTIgPSArX1sxXVsxXTtcbiAgICAgIHJldHVybiBxdWFkdHJlZTtcbiAgICB9O1xuICAgIHF1YWR0cmVlLnNpemUgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB4MSA9PSBudWxsID8gbnVsbCA6IFsgeDIgLSB4MSwgeTIgLSB5MSBdO1xuICAgICAgaWYgKF8gPT0gbnVsbCkgeDEgPSB5MSA9IHgyID0geTIgPSBudWxsOyBlbHNlIHgxID0geTEgPSAwLCB4MiA9ICtfWzBdLCB5MiA9ICtfWzFdO1xuICAgICAgcmV0dXJuIHF1YWR0cmVlO1xuICAgIH07XG4gICAgcmV0dXJuIHF1YWR0cmVlO1xuICB9O1xuICBmdW5jdGlvbiBkM19nZW9tX3F1YWR0cmVlQ29tcGF0WChkKSB7XG4gICAgcmV0dXJuIGQueDtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3F1YWR0cmVlQ29tcGF0WShkKSB7XG4gICAgcmV0dXJuIGQueTtcbiAgfVxuICBmdW5jdGlvbiBkM19nZW9tX3F1YWR0cmVlTm9kZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbGVhZjogdHJ1ZSxcbiAgICAgIG5vZGVzOiBbXSxcbiAgICAgIHBvaW50OiBudWxsLFxuICAgICAgeDogbnVsbCxcbiAgICAgIHk6IG51bGxcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2dlb21fcXVhZHRyZWVWaXNpdChmLCBub2RlLCB4MSwgeTEsIHgyLCB5Mikge1xuICAgIGlmICghZihub2RlLCB4MSwgeTEsIHgyLCB5MikpIHtcbiAgICAgIHZhciBzeCA9ICh4MSArIHgyKSAqIC41LCBzeSA9ICh5MSArIHkyKSAqIC41LCBjaGlsZHJlbiA9IG5vZGUubm9kZXM7XG4gICAgICBpZiAoY2hpbGRyZW5bMF0pIGQzX2dlb21fcXVhZHRyZWVWaXNpdChmLCBjaGlsZHJlblswXSwgeDEsIHkxLCBzeCwgc3kpO1xuICAgICAgaWYgKGNoaWxkcmVuWzFdKSBkM19nZW9tX3F1YWR0cmVlVmlzaXQoZiwgY2hpbGRyZW5bMV0sIHN4LCB5MSwgeDIsIHN5KTtcbiAgICAgIGlmIChjaGlsZHJlblsyXSkgZDNfZ2VvbV9xdWFkdHJlZVZpc2l0KGYsIGNoaWxkcmVuWzJdLCB4MSwgc3ksIHN4LCB5Mik7XG4gICAgICBpZiAoY2hpbGRyZW5bM10pIGQzX2dlb21fcXVhZHRyZWVWaXNpdChmLCBjaGlsZHJlblszXSwgc3gsIHN5LCB4MiwgeTIpO1xuICAgIH1cbiAgfVxuICBkMy5pbnRlcnBvbGF0ZVJnYiA9IGQzX2ludGVycG9sYXRlUmdiO1xuICBmdW5jdGlvbiBkM19pbnRlcnBvbGF0ZVJnYihhLCBiKSB7XG4gICAgYSA9IGQzLnJnYihhKTtcbiAgICBiID0gZDMucmdiKGIpO1xuICAgIHZhciBhciA9IGEuciwgYWcgPSBhLmcsIGFiID0gYS5iLCBiciA9IGIuciAtIGFyLCBiZyA9IGIuZyAtIGFnLCBiYiA9IGIuYiAtIGFiO1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICByZXR1cm4gXCIjXCIgKyBkM19yZ2JfaGV4KE1hdGgucm91bmQoYXIgKyBiciAqIHQpKSArIGQzX3JnYl9oZXgoTWF0aC5yb3VuZChhZyArIGJnICogdCkpICsgZDNfcmdiX2hleChNYXRoLnJvdW5kKGFiICsgYmIgKiB0KSk7XG4gICAgfTtcbiAgfVxuICBkMy5pbnRlcnBvbGF0ZU9iamVjdCA9IGQzX2ludGVycG9sYXRlT2JqZWN0O1xuICBmdW5jdGlvbiBkM19pbnRlcnBvbGF0ZU9iamVjdChhLCBiKSB7XG4gICAgdmFyIGkgPSB7fSwgYyA9IHt9LCBrO1xuICAgIGZvciAoayBpbiBhKSB7XG4gICAgICBpZiAoayBpbiBiKSB7XG4gICAgICAgIGlba10gPSBkM19pbnRlcnBvbGF0ZShhW2tdLCBiW2tdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNba10gPSBhW2tdO1xuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGsgaW4gYikge1xuICAgICAgaWYgKCEoayBpbiBhKSkge1xuICAgICAgICBjW2tdID0gYltrXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIGZvciAoayBpbiBpKSBjW2tdID0gaVtrXSh0KTtcbiAgICAgIHJldHVybiBjO1xuICAgIH07XG4gIH1cbiAgZDMuaW50ZXJwb2xhdGVOdW1iZXIgPSBkM19pbnRlcnBvbGF0ZU51bWJlcjtcbiAgZnVuY3Rpb24gZDNfaW50ZXJwb2xhdGVOdW1iZXIoYSwgYikge1xuICAgIGIgLT0gYSA9ICthO1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICByZXR1cm4gYSArIGIgKiB0O1xuICAgIH07XG4gIH1cbiAgZDMuaW50ZXJwb2xhdGVTdHJpbmcgPSBkM19pbnRlcnBvbGF0ZVN0cmluZztcbiAgZnVuY3Rpb24gZDNfaW50ZXJwb2xhdGVTdHJpbmcoYSwgYikge1xuICAgIHZhciBiaSA9IGQzX2ludGVycG9sYXRlX251bWJlckEubGFzdEluZGV4ID0gZDNfaW50ZXJwb2xhdGVfbnVtYmVyQi5sYXN0SW5kZXggPSAwLCBhbSwgYm0sIGJzLCBpID0gLTEsIHMgPSBbXSwgcSA9IFtdO1xuICAgIGEgPSBhICsgXCJcIiwgYiA9IGIgKyBcIlwiO1xuICAgIHdoaWxlICgoYW0gPSBkM19pbnRlcnBvbGF0ZV9udW1iZXJBLmV4ZWMoYSkpICYmIChibSA9IGQzX2ludGVycG9sYXRlX251bWJlckIuZXhlYyhiKSkpIHtcbiAgICAgIGlmICgoYnMgPSBibS5pbmRleCkgPiBiaSkge1xuICAgICAgICBicyA9IGIuc3Vic3RyaW5nKGJpLCBicyk7XG4gICAgICAgIGlmIChzW2ldKSBzW2ldICs9IGJzOyBlbHNlIHNbKytpXSA9IGJzO1xuICAgICAgfVxuICAgICAgaWYgKChhbSA9IGFtWzBdKSA9PT0gKGJtID0gYm1bMF0pKSB7XG4gICAgICAgIGlmIChzW2ldKSBzW2ldICs9IGJtOyBlbHNlIHNbKytpXSA9IGJtO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc1srK2ldID0gbnVsbDtcbiAgICAgICAgcS5wdXNoKHtcbiAgICAgICAgICBpOiBpLFxuICAgICAgICAgIHg6IGQzX2ludGVycG9sYXRlTnVtYmVyKGFtLCBibSlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBiaSA9IGQzX2ludGVycG9sYXRlX251bWJlckIubGFzdEluZGV4O1xuICAgIH1cbiAgICBpZiAoYmkgPCBiLmxlbmd0aCkge1xuICAgICAgYnMgPSBiLnN1YnN0cmluZyhiaSk7XG4gICAgICBpZiAoc1tpXSkgc1tpXSArPSBiczsgZWxzZSBzWysraV0gPSBicztcbiAgICB9XG4gICAgcmV0dXJuIHMubGVuZ3RoIDwgMiA/IHFbMF0gPyAoYiA9IHFbMF0ueCwgZnVuY3Rpb24odCkge1xuICAgICAgcmV0dXJuIGIodCkgKyBcIlwiO1xuICAgIH0pIDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYjtcbiAgICB9IDogKGIgPSBxLmxlbmd0aCwgZnVuY3Rpb24odCkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIG87IGkgPCBiOyArK2kpIHNbKG8gPSBxW2ldKS5pXSA9IG8ueCh0KTtcbiAgICAgIHJldHVybiBzLmpvaW4oXCJcIik7XG4gICAgfSk7XG4gIH1cbiAgdmFyIGQzX2ludGVycG9sYXRlX251bWJlckEgPSAvWy0rXT8oPzpcXGQrXFwuP1xcZCp8XFwuP1xcZCspKD86W2VFXVstK10/XFxkKyk/L2csIGQzX2ludGVycG9sYXRlX251bWJlckIgPSBuZXcgUmVnRXhwKGQzX2ludGVycG9sYXRlX251bWJlckEuc291cmNlLCBcImdcIik7XG4gIGQzLmludGVycG9sYXRlID0gZDNfaW50ZXJwb2xhdGU7XG4gIGZ1bmN0aW9uIGQzX2ludGVycG9sYXRlKGEsIGIpIHtcbiAgICB2YXIgaSA9IGQzLmludGVycG9sYXRvcnMubGVuZ3RoLCBmO1xuICAgIHdoaWxlICgtLWkgPj0gMCAmJiAhKGYgPSBkMy5pbnRlcnBvbGF0b3JzW2ldKGEsIGIpKSkgO1xuICAgIHJldHVybiBmO1xuICB9XG4gIGQzLmludGVycG9sYXRvcnMgPSBbIGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgdCA9IHR5cGVvZiBiO1xuICAgIHJldHVybiAodCA9PT0gXCJzdHJpbmdcIiA/IGQzX3JnYl9uYW1lcy5oYXMoYikgfHwgL14oI3xyZ2JcXCh8aHNsXFwoKS8udGVzdChiKSA/IGQzX2ludGVycG9sYXRlUmdiIDogZDNfaW50ZXJwb2xhdGVTdHJpbmcgOiBiIGluc3RhbmNlb2YgZDNfY29sb3IgPyBkM19pbnRlcnBvbGF0ZVJnYiA6IEFycmF5LmlzQXJyYXkoYikgPyBkM19pbnRlcnBvbGF0ZUFycmF5IDogdCA9PT0gXCJvYmplY3RcIiAmJiBpc05hTihiKSA/IGQzX2ludGVycG9sYXRlT2JqZWN0IDogZDNfaW50ZXJwb2xhdGVOdW1iZXIpKGEsIGIpO1xuICB9IF07XG4gIGQzLmludGVycG9sYXRlQXJyYXkgPSBkM19pbnRlcnBvbGF0ZUFycmF5O1xuICBmdW5jdGlvbiBkM19pbnRlcnBvbGF0ZUFycmF5KGEsIGIpIHtcbiAgICB2YXIgeCA9IFtdLCBjID0gW10sIG5hID0gYS5sZW5ndGgsIG5iID0gYi5sZW5ndGgsIG4wID0gTWF0aC5taW4oYS5sZW5ndGgsIGIubGVuZ3RoKSwgaTtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbjA7ICsraSkgeC5wdXNoKGQzX2ludGVycG9sYXRlKGFbaV0sIGJbaV0pKTtcbiAgICBmb3IgKDtpIDwgbmE7ICsraSkgY1tpXSA9IGFbaV07XG4gICAgZm9yICg7aSA8IG5iOyArK2kpIGNbaV0gPSBiW2ldO1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbjA7ICsraSkgY1tpXSA9IHhbaV0odCk7XG4gICAgICByZXR1cm4gYztcbiAgICB9O1xuICB9XG4gIHZhciBkM19lYXNlX2RlZmF1bHQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfaWRlbnRpdHk7XG4gIH07XG4gIHZhciBkM19lYXNlID0gZDMubWFwKHtcbiAgICBsaW5lYXI6IGQzX2Vhc2VfZGVmYXVsdCxcbiAgICBwb2x5OiBkM19lYXNlX3BvbHksXG4gICAgcXVhZDogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZDNfZWFzZV9xdWFkO1xuICAgIH0sXG4gICAgY3ViaWM6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGQzX2Vhc2VfY3ViaWM7XG4gICAgfSxcbiAgICBzaW46IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGQzX2Vhc2Vfc2luO1xuICAgIH0sXG4gICAgZXhwOiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkM19lYXNlX2V4cDtcbiAgICB9LFxuICAgIGNpcmNsZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZDNfZWFzZV9jaXJjbGU7XG4gICAgfSxcbiAgICBlbGFzdGljOiBkM19lYXNlX2VsYXN0aWMsXG4gICAgYmFjazogZDNfZWFzZV9iYWNrLFxuICAgIGJvdW5jZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZDNfZWFzZV9ib3VuY2U7XG4gICAgfVxuICB9KTtcbiAgdmFyIGQzX2Vhc2VfbW9kZSA9IGQzLm1hcCh7XG4gICAgXCJpblwiOiBkM19pZGVudGl0eSxcbiAgICBvdXQ6IGQzX2Vhc2VfcmV2ZXJzZSxcbiAgICBcImluLW91dFwiOiBkM19lYXNlX3JlZmxlY3QsXG4gICAgXCJvdXQtaW5cIjogZnVuY3Rpb24oZikge1xuICAgICAgcmV0dXJuIGQzX2Vhc2VfcmVmbGVjdChkM19lYXNlX3JldmVyc2UoZikpO1xuICAgIH1cbiAgfSk7XG4gIGQzLmVhc2UgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIGkgPSBuYW1lLmluZGV4T2YoXCItXCIpLCB0ID0gaSA+PSAwID8gbmFtZS5zdWJzdHJpbmcoMCwgaSkgOiBuYW1lLCBtID0gaSA+PSAwID8gbmFtZS5zdWJzdHJpbmcoaSArIDEpIDogXCJpblwiO1xuICAgIHQgPSBkM19lYXNlLmdldCh0KSB8fCBkM19lYXNlX2RlZmF1bHQ7XG4gICAgbSA9IGQzX2Vhc2VfbW9kZS5nZXQobSkgfHwgZDNfaWRlbnRpdHk7XG4gICAgcmV0dXJuIGQzX2Vhc2VfY2xhbXAobSh0LmFwcGx5KG51bGwsIGQzX2FycmF5U2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKSkpO1xuICB9O1xuICBmdW5jdGlvbiBkM19lYXNlX2NsYW1wKGYpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgcmV0dXJuIHQgPD0gMCA/IDAgOiB0ID49IDEgPyAxIDogZih0KTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2Vhc2VfcmV2ZXJzZShmKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHJldHVybiAxIC0gZigxIC0gdCk7XG4gICAgfTtcbiAgfVxuICBmdW5jdGlvbiBkM19lYXNlX3JlZmxlY3QoZikge1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICByZXR1cm4gLjUgKiAodCA8IC41ID8gZigyICogdCkgOiAyIC0gZigyIC0gMiAqIHQpKTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2Vhc2VfcXVhZCh0KSB7XG4gICAgcmV0dXJuIHQgKiB0O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2Vhc2VfY3ViaWModCkge1xuICAgIHJldHVybiB0ICogdCAqIHQ7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZWFzZV9jdWJpY0luT3V0KHQpIHtcbiAgICBpZiAodCA8PSAwKSByZXR1cm4gMDtcbiAgICBpZiAodCA+PSAxKSByZXR1cm4gMTtcbiAgICB2YXIgdDIgPSB0ICogdCwgdDMgPSB0MiAqIHQ7XG4gICAgcmV0dXJuIDQgKiAodCA8IC41ID8gdDMgOiAzICogKHQgLSB0MikgKyB0MyAtIC43NSk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZWFzZV9wb2x5KGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgcmV0dXJuIE1hdGgucG93KHQsIGUpO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZWFzZV9zaW4odCkge1xuICAgIHJldHVybiAxIC0gTWF0aC5jb3ModCAqIGhhbGbPgCk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfZWFzZV9leHAodCkge1xuICAgIHJldHVybiBNYXRoLnBvdygyLCAxMCAqICh0IC0gMSkpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2Vhc2VfY2lyY2xlKHQpIHtcbiAgICByZXR1cm4gMSAtIE1hdGguc3FydCgxIC0gdCAqIHQpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2Vhc2VfZWxhc3RpYyhhLCBwKSB7XG4gICAgdmFyIHM7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSBwID0gLjQ1O1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoKSBzID0gcCAvIM+EICogTWF0aC5hc2luKDEgLyBhKTsgZWxzZSBhID0gMSwgcyA9IHAgLyA0O1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICByZXR1cm4gMSArIGEgKiBNYXRoLnBvdygyLCAtMTAgKiB0KSAqIE1hdGguc2luKCh0IC0gcykgKiDPhCAvIHApO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfZWFzZV9iYWNrKHMpIHtcbiAgICBpZiAoIXMpIHMgPSAxLjcwMTU4O1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICByZXR1cm4gdCAqIHQgKiAoKHMgKyAxKSAqIHQgLSBzKTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2Vhc2VfYm91bmNlKHQpIHtcbiAgICByZXR1cm4gdCA8IDEgLyAyLjc1ID8gNy41NjI1ICogdCAqIHQgOiB0IDwgMiAvIDIuNzUgPyA3LjU2MjUgKiAodCAtPSAxLjUgLyAyLjc1KSAqIHQgKyAuNzUgOiB0IDwgMi41IC8gMi43NSA/IDcuNTYyNSAqICh0IC09IDIuMjUgLyAyLjc1KSAqIHQgKyAuOTM3NSA6IDcuNTYyNSAqICh0IC09IDIuNjI1IC8gMi43NSkgKiB0ICsgLjk4NDM3NTtcbiAgfVxuICBkMy5pbnRlcnBvbGF0ZUhjbCA9IGQzX2ludGVycG9sYXRlSGNsO1xuICBmdW5jdGlvbiBkM19pbnRlcnBvbGF0ZUhjbChhLCBiKSB7XG4gICAgYSA9IGQzLmhjbChhKTtcbiAgICBiID0gZDMuaGNsKGIpO1xuICAgIHZhciBhaCA9IGEuaCwgYWMgPSBhLmMsIGFsID0gYS5sLCBiaCA9IGIuaCAtIGFoLCBiYyA9IGIuYyAtIGFjLCBibCA9IGIubCAtIGFsO1xuICAgIGlmIChpc05hTihiYykpIGJjID0gMCwgYWMgPSBpc05hTihhYykgPyBiLmMgOiBhYztcbiAgICBpZiAoaXNOYU4oYmgpKSBiaCA9IDAsIGFoID0gaXNOYU4oYWgpID8gYi5oIDogYWg7IGVsc2UgaWYgKGJoID4gMTgwKSBiaCAtPSAzNjA7IGVsc2UgaWYgKGJoIDwgLTE4MCkgYmggKz0gMzYwO1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICByZXR1cm4gZDNfaGNsX2xhYihhaCArIGJoICogdCwgYWMgKyBiYyAqIHQsIGFsICsgYmwgKiB0KSArIFwiXCI7XG4gICAgfTtcbiAgfVxuICBkMy5pbnRlcnBvbGF0ZUhzbCA9IGQzX2ludGVycG9sYXRlSHNsO1xuICBmdW5jdGlvbiBkM19pbnRlcnBvbGF0ZUhzbChhLCBiKSB7XG4gICAgYSA9IGQzLmhzbChhKTtcbiAgICBiID0gZDMuaHNsKGIpO1xuICAgIHZhciBhaCA9IGEuaCwgYXMgPSBhLnMsIGFsID0gYS5sLCBiaCA9IGIuaCAtIGFoLCBicyA9IGIucyAtIGFzLCBibCA9IGIubCAtIGFsO1xuICAgIGlmIChpc05hTihicykpIGJzID0gMCwgYXMgPSBpc05hTihhcykgPyBiLnMgOiBhcztcbiAgICBpZiAoaXNOYU4oYmgpKSBiaCA9IDAsIGFoID0gaXNOYU4oYWgpID8gYi5oIDogYWg7IGVsc2UgaWYgKGJoID4gMTgwKSBiaCAtPSAzNjA7IGVsc2UgaWYgKGJoIDwgLTE4MCkgYmggKz0gMzYwO1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICByZXR1cm4gZDNfaHNsX3JnYihhaCArIGJoICogdCwgYXMgKyBicyAqIHQsIGFsICsgYmwgKiB0KSArIFwiXCI7XG4gICAgfTtcbiAgfVxuICBkMy5pbnRlcnBvbGF0ZUxhYiA9IGQzX2ludGVycG9sYXRlTGFiO1xuICBmdW5jdGlvbiBkM19pbnRlcnBvbGF0ZUxhYihhLCBiKSB7XG4gICAgYSA9IGQzLmxhYihhKTtcbiAgICBiID0gZDMubGFiKGIpO1xuICAgIHZhciBhbCA9IGEubCwgYWEgPSBhLmEsIGFiID0gYS5iLCBibCA9IGIubCAtIGFsLCBiYSA9IGIuYSAtIGFhLCBiYiA9IGIuYiAtIGFiO1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICByZXR1cm4gZDNfbGFiX3JnYihhbCArIGJsICogdCwgYWEgKyBiYSAqIHQsIGFiICsgYmIgKiB0KSArIFwiXCI7XG4gICAgfTtcbiAgfVxuICBkMy5pbnRlcnBvbGF0ZVJvdW5kID0gZDNfaW50ZXJwb2xhdGVSb3VuZDtcbiAgZnVuY3Rpb24gZDNfaW50ZXJwb2xhdGVSb3VuZChhLCBiKSB7XG4gICAgYiAtPSBhO1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICByZXR1cm4gTWF0aC5yb3VuZChhICsgYiAqIHQpO1xuICAgIH07XG4gIH1cbiAgZDMudHJhbnNmb3JtID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgdmFyIGcgPSBkM19kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoZDMubnMucHJlZml4LnN2ZywgXCJnXCIpO1xuICAgIHJldHVybiAoZDMudHJhbnNmb3JtID0gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICBpZiAoc3RyaW5nICE9IG51bGwpIHtcbiAgICAgICAgZy5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgc3RyaW5nKTtcbiAgICAgICAgdmFyIHQgPSBnLnRyYW5zZm9ybS5iYXNlVmFsLmNvbnNvbGlkYXRlKCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IGQzX3RyYW5zZm9ybSh0ID8gdC5tYXRyaXggOiBkM190cmFuc2Zvcm1JZGVudGl0eSk7XG4gICAgfSkoc3RyaW5nKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfdHJhbnNmb3JtKG0pIHtcbiAgICB2YXIgcjAgPSBbIG0uYSwgbS5iIF0sIHIxID0gWyBtLmMsIG0uZCBdLCBreCA9IGQzX3RyYW5zZm9ybU5vcm1hbGl6ZShyMCksIGt6ID0gZDNfdHJhbnNmb3JtRG90KHIwLCByMSksIGt5ID0gZDNfdHJhbnNmb3JtTm9ybWFsaXplKGQzX3RyYW5zZm9ybUNvbWJpbmUocjEsIHIwLCAta3opKSB8fCAwO1xuICAgIGlmIChyMFswXSAqIHIxWzFdIDwgcjFbMF0gKiByMFsxXSkge1xuICAgICAgcjBbMF0gKj0gLTE7XG4gICAgICByMFsxXSAqPSAtMTtcbiAgICAgIGt4ICo9IC0xO1xuICAgICAga3ogKj0gLTE7XG4gICAgfVxuICAgIHRoaXMucm90YXRlID0gKGt4ID8gTWF0aC5hdGFuMihyMFsxXSwgcjBbMF0pIDogTWF0aC5hdGFuMigtcjFbMF0sIHIxWzFdKSkgKiBkM19kZWdyZWVzO1xuICAgIHRoaXMudHJhbnNsYXRlID0gWyBtLmUsIG0uZiBdO1xuICAgIHRoaXMuc2NhbGUgPSBbIGt4LCBreSBdO1xuICAgIHRoaXMuc2tldyA9IGt5ID8gTWF0aC5hdGFuMihreiwga3kpICogZDNfZGVncmVlcyA6IDA7XG4gIH1cbiAgZDNfdHJhbnNmb3JtLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcInRyYW5zbGF0ZShcIiArIHRoaXMudHJhbnNsYXRlICsgXCIpcm90YXRlKFwiICsgdGhpcy5yb3RhdGUgKyBcIilza2V3WChcIiArIHRoaXMuc2tldyArIFwiKXNjYWxlKFwiICsgdGhpcy5zY2FsZSArIFwiKVwiO1xuICB9O1xuICBmdW5jdGlvbiBkM190cmFuc2Zvcm1Eb3QoYSwgYikge1xuICAgIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RyYW5zZm9ybU5vcm1hbGl6ZShhKSB7XG4gICAgdmFyIGsgPSBNYXRoLnNxcnQoZDNfdHJhbnNmb3JtRG90KGEsIGEpKTtcbiAgICBpZiAoaykge1xuICAgICAgYVswXSAvPSBrO1xuICAgICAgYVsxXSAvPSBrO1xuICAgIH1cbiAgICByZXR1cm4gaztcbiAgfVxuICBmdW5jdGlvbiBkM190cmFuc2Zvcm1Db21iaW5lKGEsIGIsIGspIHtcbiAgICBhWzBdICs9IGsgKiBiWzBdO1xuICAgIGFbMV0gKz0gayAqIGJbMV07XG4gICAgcmV0dXJuIGE7XG4gIH1cbiAgdmFyIGQzX3RyYW5zZm9ybUlkZW50aXR5ID0ge1xuICAgIGE6IDEsXG4gICAgYjogMCxcbiAgICBjOiAwLFxuICAgIGQ6IDEsXG4gICAgZTogMCxcbiAgICBmOiAwXG4gIH07XG4gIGQzLmludGVycG9sYXRlVHJhbnNmb3JtID0gZDNfaW50ZXJwb2xhdGVUcmFuc2Zvcm07XG4gIGZ1bmN0aW9uIGQzX2ludGVycG9sYXRlVHJhbnNmb3JtKGEsIGIpIHtcbiAgICB2YXIgcyA9IFtdLCBxID0gW10sIG4sIEEgPSBkMy50cmFuc2Zvcm0oYSksIEIgPSBkMy50cmFuc2Zvcm0oYiksIHRhID0gQS50cmFuc2xhdGUsIHRiID0gQi50cmFuc2xhdGUsIHJhID0gQS5yb3RhdGUsIHJiID0gQi5yb3RhdGUsIHdhID0gQS5za2V3LCB3YiA9IEIuc2tldywga2EgPSBBLnNjYWxlLCBrYiA9IEIuc2NhbGU7XG4gICAgaWYgKHRhWzBdICE9IHRiWzBdIHx8IHRhWzFdICE9IHRiWzFdKSB7XG4gICAgICBzLnB1c2goXCJ0cmFuc2xhdGUoXCIsIG51bGwsIFwiLFwiLCBudWxsLCBcIilcIik7XG4gICAgICBxLnB1c2goe1xuICAgICAgICBpOiAxLFxuICAgICAgICB4OiBkM19pbnRlcnBvbGF0ZU51bWJlcih0YVswXSwgdGJbMF0pXG4gICAgICB9LCB7XG4gICAgICAgIGk6IDMsXG4gICAgICAgIHg6IGQzX2ludGVycG9sYXRlTnVtYmVyKHRhWzFdLCB0YlsxXSlcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBpZiAodGJbMF0gfHwgdGJbMV0pIHtcbiAgICAgIHMucHVzaChcInRyYW5zbGF0ZShcIiArIHRiICsgXCIpXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzLnB1c2goXCJcIik7XG4gICAgfVxuICAgIGlmIChyYSAhPSByYikge1xuICAgICAgaWYgKHJhIC0gcmIgPiAxODApIHJiICs9IDM2MDsgZWxzZSBpZiAocmIgLSByYSA+IDE4MCkgcmEgKz0gMzYwO1xuICAgICAgcS5wdXNoKHtcbiAgICAgICAgaTogcy5wdXNoKHMucG9wKCkgKyBcInJvdGF0ZShcIiwgbnVsbCwgXCIpXCIpIC0gMixcbiAgICAgICAgeDogZDNfaW50ZXJwb2xhdGVOdW1iZXIocmEsIHJiKVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChyYikge1xuICAgICAgcy5wdXNoKHMucG9wKCkgKyBcInJvdGF0ZShcIiArIHJiICsgXCIpXCIpO1xuICAgIH1cbiAgICBpZiAod2EgIT0gd2IpIHtcbiAgICAgIHEucHVzaCh7XG4gICAgICAgIGk6IHMucHVzaChzLnBvcCgpICsgXCJza2V3WChcIiwgbnVsbCwgXCIpXCIpIC0gMixcbiAgICAgICAgeDogZDNfaW50ZXJwb2xhdGVOdW1iZXIod2EsIHdiKVxuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmICh3Yikge1xuICAgICAgcy5wdXNoKHMucG9wKCkgKyBcInNrZXdYKFwiICsgd2IgKyBcIilcIik7XG4gICAgfVxuICAgIGlmIChrYVswXSAhPSBrYlswXSB8fCBrYVsxXSAhPSBrYlsxXSkge1xuICAgICAgbiA9IHMucHVzaChzLnBvcCgpICsgXCJzY2FsZShcIiwgbnVsbCwgXCIsXCIsIG51bGwsIFwiKVwiKTtcbiAgICAgIHEucHVzaCh7XG4gICAgICAgIGk6IG4gLSA0LFxuICAgICAgICB4OiBkM19pbnRlcnBvbGF0ZU51bWJlcihrYVswXSwga2JbMF0pXG4gICAgICB9LCB7XG4gICAgICAgIGk6IG4gLSAyLFxuICAgICAgICB4OiBkM19pbnRlcnBvbGF0ZU51bWJlcihrYVsxXSwga2JbMV0pXG4gICAgICB9KTtcbiAgICB9IGVsc2UgaWYgKGtiWzBdICE9IDEgfHwga2JbMV0gIT0gMSkge1xuICAgICAgcy5wdXNoKHMucG9wKCkgKyBcInNjYWxlKFwiICsga2IgKyBcIilcIik7XG4gICAgfVxuICAgIG4gPSBxLmxlbmd0aDtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgdmFyIGkgPSAtMSwgbztcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBzWyhvID0gcVtpXSkuaV0gPSBvLngodCk7XG4gICAgICByZXR1cm4gcy5qb2luKFwiXCIpO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfdW5pbnRlcnBvbGF0ZU51bWJlcihhLCBiKSB7XG4gICAgYiA9IGIgLSAoYSA9ICthKSA/IDEgLyAoYiAtIGEpIDogMDtcbiAgICByZXR1cm4gZnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuICh4IC0gYSkgKiBiO1xuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfdW5pbnRlcnBvbGF0ZUNsYW1wKGEsIGIpIHtcbiAgICBiID0gYiAtIChhID0gK2EpID8gMSAvIChiIC0gYSkgOiAwO1xuICAgIHJldHVybiBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgKHggLSBhKSAqIGIpKTtcbiAgICB9O1xuICB9XG4gIGQzLmxheW91dCA9IHt9O1xuICBkMy5sYXlvdXQuYnVuZGxlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGxpbmtzKSB7XG4gICAgICB2YXIgcGF0aHMgPSBbXSwgaSA9IC0xLCBuID0gbGlua3MubGVuZ3RoO1xuICAgICAgd2hpbGUgKCsraSA8IG4pIHBhdGhzLnB1c2goZDNfbGF5b3V0X2J1bmRsZVBhdGgobGlua3NbaV0pKTtcbiAgICAgIHJldHVybiBwYXRocztcbiAgICB9O1xuICB9O1xuICBmdW5jdGlvbiBkM19sYXlvdXRfYnVuZGxlUGF0aChsaW5rKSB7XG4gICAgdmFyIHN0YXJ0ID0gbGluay5zb3VyY2UsIGVuZCA9IGxpbmsudGFyZ2V0LCBsY2EgPSBkM19sYXlvdXRfYnVuZGxlTGVhc3RDb21tb25BbmNlc3RvcihzdGFydCwgZW5kKSwgcG9pbnRzID0gWyBzdGFydCBdO1xuICAgIHdoaWxlIChzdGFydCAhPT0gbGNhKSB7XG4gICAgICBzdGFydCA9IHN0YXJ0LnBhcmVudDtcbiAgICAgIHBvaW50cy5wdXNoKHN0YXJ0KTtcbiAgICB9XG4gICAgdmFyIGsgPSBwb2ludHMubGVuZ3RoO1xuICAgIHdoaWxlIChlbmQgIT09IGxjYSkge1xuICAgICAgcG9pbnRzLnNwbGljZShrLCAwLCBlbmQpO1xuICAgICAgZW5kID0gZW5kLnBhcmVudDtcbiAgICB9XG4gICAgcmV0dXJuIHBvaW50cztcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfYnVuZGxlQW5jZXN0b3JzKG5vZGUpIHtcbiAgICB2YXIgYW5jZXN0b3JzID0gW10sIHBhcmVudCA9IG5vZGUucGFyZW50O1xuICAgIHdoaWxlIChwYXJlbnQgIT0gbnVsbCkge1xuICAgICAgYW5jZXN0b3JzLnB1c2gobm9kZSk7XG4gICAgICBub2RlID0gcGFyZW50O1xuICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcbiAgICB9XG4gICAgYW5jZXN0b3JzLnB1c2gobm9kZSk7XG4gICAgcmV0dXJuIGFuY2VzdG9ycztcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfYnVuZGxlTGVhc3RDb21tb25BbmNlc3RvcihhLCBiKSB7XG4gICAgaWYgKGEgPT09IGIpIHJldHVybiBhO1xuICAgIHZhciBhTm9kZXMgPSBkM19sYXlvdXRfYnVuZGxlQW5jZXN0b3JzKGEpLCBiTm9kZXMgPSBkM19sYXlvdXRfYnVuZGxlQW5jZXN0b3JzKGIpLCBhTm9kZSA9IGFOb2Rlcy5wb3AoKSwgYk5vZGUgPSBiTm9kZXMucG9wKCksIHNoYXJlZE5vZGUgPSBudWxsO1xuICAgIHdoaWxlIChhTm9kZSA9PT0gYk5vZGUpIHtcbiAgICAgIHNoYXJlZE5vZGUgPSBhTm9kZTtcbiAgICAgIGFOb2RlID0gYU5vZGVzLnBvcCgpO1xuICAgICAgYk5vZGUgPSBiTm9kZXMucG9wKCk7XG4gICAgfVxuICAgIHJldHVybiBzaGFyZWROb2RlO1xuICB9XG4gIGQzLmxheW91dC5jaG9yZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjaG9yZCA9IHt9LCBjaG9yZHMsIGdyb3VwcywgbWF0cml4LCBuLCBwYWRkaW5nID0gMCwgc29ydEdyb3Vwcywgc29ydFN1Ymdyb3Vwcywgc29ydENob3JkcztcbiAgICBmdW5jdGlvbiByZWxheW91dCgpIHtcbiAgICAgIHZhciBzdWJncm91cHMgPSB7fSwgZ3JvdXBTdW1zID0gW10sIGdyb3VwSW5kZXggPSBkMy5yYW5nZShuKSwgc3ViZ3JvdXBJbmRleCA9IFtdLCBrLCB4LCB4MCwgaSwgajtcbiAgICAgIGNob3JkcyA9IFtdO1xuICAgICAgZ3JvdXBzID0gW107XG4gICAgICBrID0gMCwgaSA9IC0xO1xuICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgeCA9IDAsIGogPSAtMTtcbiAgICAgICAgd2hpbGUgKCsraiA8IG4pIHtcbiAgICAgICAgICB4ICs9IG1hdHJpeFtpXVtqXTtcbiAgICAgICAgfVxuICAgICAgICBncm91cFN1bXMucHVzaCh4KTtcbiAgICAgICAgc3ViZ3JvdXBJbmRleC5wdXNoKGQzLnJhbmdlKG4pKTtcbiAgICAgICAgayArPSB4O1xuICAgICAgfVxuICAgICAgaWYgKHNvcnRHcm91cHMpIHtcbiAgICAgICAgZ3JvdXBJbmRleC5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICByZXR1cm4gc29ydEdyb3Vwcyhncm91cFN1bXNbYV0sIGdyb3VwU3Vtc1tiXSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKHNvcnRTdWJncm91cHMpIHtcbiAgICAgICAgc3ViZ3JvdXBJbmRleC5mb3JFYWNoKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgICBkLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgcmV0dXJuIHNvcnRTdWJncm91cHMobWF0cml4W2ldW2FdLCBtYXRyaXhbaV1bYl0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGsgPSAoz4QgLSBwYWRkaW5nICogbikgLyBrO1xuICAgICAgeCA9IDAsIGkgPSAtMTtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgIHgwID0geCwgaiA9IC0xO1xuICAgICAgICB3aGlsZSAoKytqIDwgbikge1xuICAgICAgICAgIHZhciBkaSA9IGdyb3VwSW5kZXhbaV0sIGRqID0gc3ViZ3JvdXBJbmRleFtkaV1bal0sIHYgPSBtYXRyaXhbZGldW2RqXSwgYTAgPSB4LCBhMSA9IHggKz0gdiAqIGs7XG4gICAgICAgICAgc3ViZ3JvdXBzW2RpICsgXCItXCIgKyBkal0gPSB7XG4gICAgICAgICAgICBpbmRleDogZGksXG4gICAgICAgICAgICBzdWJpbmRleDogZGosXG4gICAgICAgICAgICBzdGFydEFuZ2xlOiBhMCxcbiAgICAgICAgICAgIGVuZEFuZ2xlOiBhMSxcbiAgICAgICAgICAgIHZhbHVlOiB2XG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBncm91cHNbZGldID0ge1xuICAgICAgICAgIGluZGV4OiBkaSxcbiAgICAgICAgICBzdGFydEFuZ2xlOiB4MCxcbiAgICAgICAgICBlbmRBbmdsZTogeCxcbiAgICAgICAgICB2YWx1ZTogKHggLSB4MCkgLyBrXG4gICAgICAgIH07XG4gICAgICAgIHggKz0gcGFkZGluZztcbiAgICAgIH1cbiAgICAgIGkgPSAtMTtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgIGogPSBpIC0gMTtcbiAgICAgICAgd2hpbGUgKCsraiA8IG4pIHtcbiAgICAgICAgICB2YXIgc291cmNlID0gc3ViZ3JvdXBzW2kgKyBcIi1cIiArIGpdLCB0YXJnZXQgPSBzdWJncm91cHNbaiArIFwiLVwiICsgaV07XG4gICAgICAgICAgaWYgKHNvdXJjZS52YWx1ZSB8fCB0YXJnZXQudmFsdWUpIHtcbiAgICAgICAgICAgIGNob3Jkcy5wdXNoKHNvdXJjZS52YWx1ZSA8IHRhcmdldC52YWx1ZSA/IHtcbiAgICAgICAgICAgICAgc291cmNlOiB0YXJnZXQsXG4gICAgICAgICAgICAgIHRhcmdldDogc291cmNlXG4gICAgICAgICAgICB9IDoge1xuICAgICAgICAgICAgICBzb3VyY2U6IHNvdXJjZSxcbiAgICAgICAgICAgICAgdGFyZ2V0OiB0YXJnZXRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHNvcnRDaG9yZHMpIHJlc29ydCgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiByZXNvcnQoKSB7XG4gICAgICBjaG9yZHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBzb3J0Q2hvcmRzKChhLnNvdXJjZS52YWx1ZSArIGEudGFyZ2V0LnZhbHVlKSAvIDIsIChiLnNvdXJjZS52YWx1ZSArIGIudGFyZ2V0LnZhbHVlKSAvIDIpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGNob3JkLm1hdHJpeCA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG1hdHJpeDtcbiAgICAgIG4gPSAobWF0cml4ID0geCkgJiYgbWF0cml4Lmxlbmd0aDtcbiAgICAgIGNob3JkcyA9IGdyb3VwcyA9IG51bGw7XG4gICAgICByZXR1cm4gY2hvcmQ7XG4gICAgfTtcbiAgICBjaG9yZC5wYWRkaW5nID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcGFkZGluZztcbiAgICAgIHBhZGRpbmcgPSB4O1xuICAgICAgY2hvcmRzID0gZ3JvdXBzID0gbnVsbDtcbiAgICAgIHJldHVybiBjaG9yZDtcbiAgICB9O1xuICAgIGNob3JkLnNvcnRHcm91cHMgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBzb3J0R3JvdXBzO1xuICAgICAgc29ydEdyb3VwcyA9IHg7XG4gICAgICBjaG9yZHMgPSBncm91cHMgPSBudWxsO1xuICAgICAgcmV0dXJuIGNob3JkO1xuICAgIH07XG4gICAgY2hvcmQuc29ydFN1Ymdyb3VwcyA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNvcnRTdWJncm91cHM7XG4gICAgICBzb3J0U3ViZ3JvdXBzID0geDtcbiAgICAgIGNob3JkcyA9IG51bGw7XG4gICAgICByZXR1cm4gY2hvcmQ7XG4gICAgfTtcbiAgICBjaG9yZC5zb3J0Q2hvcmRzID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc29ydENob3JkcztcbiAgICAgIHNvcnRDaG9yZHMgPSB4O1xuICAgICAgaWYgKGNob3JkcykgcmVzb3J0KCk7XG4gICAgICByZXR1cm4gY2hvcmQ7XG4gICAgfTtcbiAgICBjaG9yZC5jaG9yZHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghY2hvcmRzKSByZWxheW91dCgpO1xuICAgICAgcmV0dXJuIGNob3JkcztcbiAgICB9O1xuICAgIGNob3JkLmdyb3VwcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFncm91cHMpIHJlbGF5b3V0KCk7XG4gICAgICByZXR1cm4gZ3JvdXBzO1xuICAgIH07XG4gICAgcmV0dXJuIGNob3JkO1xuICB9O1xuICBkMy5sYXlvdXQuZm9yY2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZm9yY2UgPSB7fSwgZXZlbnQgPSBkMy5kaXNwYXRjaChcInN0YXJ0XCIsIFwidGlja1wiLCBcImVuZFwiKSwgc2l6ZSA9IFsgMSwgMSBdLCBkcmFnLCBhbHBoYSwgZnJpY3Rpb24gPSAuOSwgbGlua0Rpc3RhbmNlID0gZDNfbGF5b3V0X2ZvcmNlTGlua0Rpc3RhbmNlLCBsaW5rU3RyZW5ndGggPSBkM19sYXlvdXRfZm9yY2VMaW5rU3RyZW5ndGgsIGNoYXJnZSA9IC0zMCwgY2hhcmdlRGlzdGFuY2UyID0gZDNfbGF5b3V0X2ZvcmNlQ2hhcmdlRGlzdGFuY2UyLCBncmF2aXR5ID0gLjEsIHRoZXRhMiA9IC42NCwgbm9kZXMgPSBbXSwgbGlua3MgPSBbXSwgZGlzdGFuY2VzLCBzdHJlbmd0aHMsIGNoYXJnZXM7XG4gICAgZnVuY3Rpb24gcmVwdWxzZShub2RlKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24ocXVhZCwgeDEsIF8sIHgyKSB7XG4gICAgICAgIGlmIChxdWFkLnBvaW50ICE9PSBub2RlKSB7XG4gICAgICAgICAgdmFyIGR4ID0gcXVhZC5jeCAtIG5vZGUueCwgZHkgPSBxdWFkLmN5IC0gbm9kZS55LCBkdyA9IHgyIC0geDEsIGRuID0gZHggKiBkeCArIGR5ICogZHk7XG4gICAgICAgICAgaWYgKGR3ICogZHcgLyB0aGV0YTIgPCBkbikge1xuICAgICAgICAgICAgaWYgKGRuIDwgY2hhcmdlRGlzdGFuY2UyKSB7XG4gICAgICAgICAgICAgIHZhciBrID0gcXVhZC5jaGFyZ2UgLyBkbjtcbiAgICAgICAgICAgICAgbm9kZS5weCAtPSBkeCAqIGs7XG4gICAgICAgICAgICAgIG5vZGUucHkgLT0gZHkgKiBrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChxdWFkLnBvaW50ICYmIGRuICYmIGRuIDwgY2hhcmdlRGlzdGFuY2UyKSB7XG4gICAgICAgICAgICB2YXIgayA9IHF1YWQucG9pbnRDaGFyZ2UgLyBkbjtcbiAgICAgICAgICAgIG5vZGUucHggLT0gZHggKiBrO1xuICAgICAgICAgICAgbm9kZS5weSAtPSBkeSAqIGs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAhcXVhZC5jaGFyZ2U7XG4gICAgICB9O1xuICAgIH1cbiAgICBmb3JjZS50aWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoKGFscGhhICo9IC45OSkgPCAuMDA1KSB7XG4gICAgICAgIGV2ZW50LmVuZCh7XG4gICAgICAgICAgdHlwZTogXCJlbmRcIixcbiAgICAgICAgICBhbHBoYTogYWxwaGEgPSAwXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHZhciBuID0gbm9kZXMubGVuZ3RoLCBtID0gbGlua3MubGVuZ3RoLCBxLCBpLCBvLCBzLCB0LCBsLCBrLCB4LCB5O1xuICAgICAgZm9yIChpID0gMDsgaSA8IG07ICsraSkge1xuICAgICAgICBvID0gbGlua3NbaV07XG4gICAgICAgIHMgPSBvLnNvdXJjZTtcbiAgICAgICAgdCA9IG8udGFyZ2V0O1xuICAgICAgICB4ID0gdC54IC0gcy54O1xuICAgICAgICB5ID0gdC55IC0gcy55O1xuICAgICAgICBpZiAobCA9IHggKiB4ICsgeSAqIHkpIHtcbiAgICAgICAgICBsID0gYWxwaGEgKiBzdHJlbmd0aHNbaV0gKiAoKGwgPSBNYXRoLnNxcnQobCkpIC0gZGlzdGFuY2VzW2ldKSAvIGw7XG4gICAgICAgICAgeCAqPSBsO1xuICAgICAgICAgIHkgKj0gbDtcbiAgICAgICAgICB0LnggLT0geCAqIChrID0gcy53ZWlnaHQgLyAodC53ZWlnaHQgKyBzLndlaWdodCkpO1xuICAgICAgICAgIHQueSAtPSB5ICogaztcbiAgICAgICAgICBzLnggKz0geCAqIChrID0gMSAtIGspO1xuICAgICAgICAgIHMueSArPSB5ICogaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGsgPSBhbHBoYSAqIGdyYXZpdHkpIHtcbiAgICAgICAgeCA9IHNpemVbMF0gLyAyO1xuICAgICAgICB5ID0gc2l6ZVsxXSAvIDI7XG4gICAgICAgIGkgPSAtMTtcbiAgICAgICAgaWYgKGspIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgICAgbyA9IG5vZGVzW2ldO1xuICAgICAgICAgIG8ueCArPSAoeCAtIG8ueCkgKiBrO1xuICAgICAgICAgIG8ueSArPSAoeSAtIG8ueSkgKiBrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoY2hhcmdlKSB7XG4gICAgICAgIGQzX2xheW91dF9mb3JjZUFjY3VtdWxhdGUocSA9IGQzLmdlb20ucXVhZHRyZWUobm9kZXMpLCBhbHBoYSwgY2hhcmdlcyk7XG4gICAgICAgIGkgPSAtMTtcbiAgICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgICBpZiAoIShvID0gbm9kZXNbaV0pLmZpeGVkKSB7XG4gICAgICAgICAgICBxLnZpc2l0KHJlcHVsc2UobykpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaSA9IC0xO1xuICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgbyA9IG5vZGVzW2ldO1xuICAgICAgICBpZiAoby5maXhlZCkge1xuICAgICAgICAgIG8ueCA9IG8ucHg7XG4gICAgICAgICAgby55ID0gby5weTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBvLnggLT0gKG8ucHggLSAoby5weCA9IG8ueCkpICogZnJpY3Rpb247XG4gICAgICAgICAgby55IC09IChvLnB5IC0gKG8ucHkgPSBvLnkpKSAqIGZyaWN0aW9uO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBldmVudC50aWNrKHtcbiAgICAgICAgdHlwZTogXCJ0aWNrXCIsXG4gICAgICAgIGFscGhhOiBhbHBoYVxuICAgICAgfSk7XG4gICAgfTtcbiAgICBmb3JjZS5ub2RlcyA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG5vZGVzO1xuICAgICAgbm9kZXMgPSB4O1xuICAgICAgcmV0dXJuIGZvcmNlO1xuICAgIH07XG4gICAgZm9yY2UubGlua3MgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBsaW5rcztcbiAgICAgIGxpbmtzID0geDtcbiAgICAgIHJldHVybiBmb3JjZTtcbiAgICB9O1xuICAgIGZvcmNlLnNpemUgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBzaXplO1xuICAgICAgc2l6ZSA9IHg7XG4gICAgICByZXR1cm4gZm9yY2U7XG4gICAgfTtcbiAgICBmb3JjZS5saW5rRGlzdGFuY2UgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBsaW5rRGlzdGFuY2U7XG4gICAgICBsaW5rRGlzdGFuY2UgPSB0eXBlb2YgeCA9PT0gXCJmdW5jdGlvblwiID8geCA6ICt4O1xuICAgICAgcmV0dXJuIGZvcmNlO1xuICAgIH07XG4gICAgZm9yY2UuZGlzdGFuY2UgPSBmb3JjZS5saW5rRGlzdGFuY2U7XG4gICAgZm9yY2UubGlua1N0cmVuZ3RoID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbGlua1N0cmVuZ3RoO1xuICAgICAgbGlua1N0cmVuZ3RoID0gdHlwZW9mIHggPT09IFwiZnVuY3Rpb25cIiA/IHggOiAreDtcbiAgICAgIHJldHVybiBmb3JjZTtcbiAgICB9O1xuICAgIGZvcmNlLmZyaWN0aW9uID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZnJpY3Rpb247XG4gICAgICBmcmljdGlvbiA9ICt4O1xuICAgICAgcmV0dXJuIGZvcmNlO1xuICAgIH07XG4gICAgZm9yY2UuY2hhcmdlID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY2hhcmdlO1xuICAgICAgY2hhcmdlID0gdHlwZW9mIHggPT09IFwiZnVuY3Rpb25cIiA/IHggOiAreDtcbiAgICAgIHJldHVybiBmb3JjZTtcbiAgICB9O1xuICAgIGZvcmNlLmNoYXJnZURpc3RhbmNlID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gTWF0aC5zcXJ0KGNoYXJnZURpc3RhbmNlMik7XG4gICAgICBjaGFyZ2VEaXN0YW5jZTIgPSB4ICogeDtcbiAgICAgIHJldHVybiBmb3JjZTtcbiAgICB9O1xuICAgIGZvcmNlLmdyYXZpdHkgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBncmF2aXR5O1xuICAgICAgZ3Jhdml0eSA9ICt4O1xuICAgICAgcmV0dXJuIGZvcmNlO1xuICAgIH07XG4gICAgZm9yY2UudGhldGEgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBNYXRoLnNxcnQodGhldGEyKTtcbiAgICAgIHRoZXRhMiA9IHggKiB4O1xuICAgICAgcmV0dXJuIGZvcmNlO1xuICAgIH07XG4gICAgZm9yY2UuYWxwaGEgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBhbHBoYTtcbiAgICAgIHggPSAreDtcbiAgICAgIGlmIChhbHBoYSkge1xuICAgICAgICBpZiAoeCA+IDApIGFscGhhID0geDsgZWxzZSBhbHBoYSA9IDA7XG4gICAgICB9IGVsc2UgaWYgKHggPiAwKSB7XG4gICAgICAgIGV2ZW50LnN0YXJ0KHtcbiAgICAgICAgICB0eXBlOiBcInN0YXJ0XCIsXG4gICAgICAgICAgYWxwaGE6IGFscGhhID0geFxuICAgICAgICB9KTtcbiAgICAgICAgZDMudGltZXIoZm9yY2UudGljayk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZm9yY2U7XG4gICAgfTtcbiAgICBmb3JjZS5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGksIG4gPSBub2Rlcy5sZW5ndGgsIG0gPSBsaW5rcy5sZW5ndGgsIHcgPSBzaXplWzBdLCBoID0gc2l6ZVsxXSwgbmVpZ2hib3JzLCBvO1xuICAgICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgICAobyA9IG5vZGVzW2ldKS5pbmRleCA9IGk7XG4gICAgICAgIG8ud2VpZ2h0ID0gMDtcbiAgICAgIH1cbiAgICAgIGZvciAoaSA9IDA7IGkgPCBtOyArK2kpIHtcbiAgICAgICAgbyA9IGxpbmtzW2ldO1xuICAgICAgICBpZiAodHlwZW9mIG8uc291cmNlID09IFwibnVtYmVyXCIpIG8uc291cmNlID0gbm9kZXNbby5zb3VyY2VdO1xuICAgICAgICBpZiAodHlwZW9mIG8udGFyZ2V0ID09IFwibnVtYmVyXCIpIG8udGFyZ2V0ID0gbm9kZXNbby50YXJnZXRdO1xuICAgICAgICArK28uc291cmNlLndlaWdodDtcbiAgICAgICAgKytvLnRhcmdldC53ZWlnaHQ7XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIG8gPSBub2Rlc1tpXTtcbiAgICAgICAgaWYgKGlzTmFOKG8ueCkpIG8ueCA9IHBvc2l0aW9uKFwieFwiLCB3KTtcbiAgICAgICAgaWYgKGlzTmFOKG8ueSkpIG8ueSA9IHBvc2l0aW9uKFwieVwiLCBoKTtcbiAgICAgICAgaWYgKGlzTmFOKG8ucHgpKSBvLnB4ID0gby54O1xuICAgICAgICBpZiAoaXNOYU4oby5weSkpIG8ucHkgPSBvLnk7XG4gICAgICB9XG4gICAgICBkaXN0YW5jZXMgPSBbXTtcbiAgICAgIGlmICh0eXBlb2YgbGlua0Rpc3RhbmNlID09PSBcImZ1bmN0aW9uXCIpIGZvciAoaSA9IDA7IGkgPCBtOyArK2kpIGRpc3RhbmNlc1tpXSA9ICtsaW5rRGlzdGFuY2UuY2FsbCh0aGlzLCBsaW5rc1tpXSwgaSk7IGVsc2UgZm9yIChpID0gMDsgaSA8IG07ICsraSkgZGlzdGFuY2VzW2ldID0gbGlua0Rpc3RhbmNlO1xuICAgICAgc3RyZW5ndGhzID0gW107XG4gICAgICBpZiAodHlwZW9mIGxpbmtTdHJlbmd0aCA9PT0gXCJmdW5jdGlvblwiKSBmb3IgKGkgPSAwOyBpIDwgbTsgKytpKSBzdHJlbmd0aHNbaV0gPSArbGlua1N0cmVuZ3RoLmNhbGwodGhpcywgbGlua3NbaV0sIGkpOyBlbHNlIGZvciAoaSA9IDA7IGkgPCBtOyArK2kpIHN0cmVuZ3Roc1tpXSA9IGxpbmtTdHJlbmd0aDtcbiAgICAgIGNoYXJnZXMgPSBbXTtcbiAgICAgIGlmICh0eXBlb2YgY2hhcmdlID09PSBcImZ1bmN0aW9uXCIpIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIGNoYXJnZXNbaV0gPSArY2hhcmdlLmNhbGwodGhpcywgbm9kZXNbaV0sIGkpOyBlbHNlIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIGNoYXJnZXNbaV0gPSBjaGFyZ2U7XG4gICAgICBmdW5jdGlvbiBwb3NpdGlvbihkaW1lbnNpb24sIHNpemUpIHtcbiAgICAgICAgaWYgKCFuZWlnaGJvcnMpIHtcbiAgICAgICAgICBuZWlnaGJvcnMgPSBuZXcgQXJyYXkobik7XG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8IG47ICsraikge1xuICAgICAgICAgICAgbmVpZ2hib3JzW2pdID0gW107XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvciAoaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICAgICAgICAgIHZhciBvID0gbGlua3Nbal07XG4gICAgICAgICAgICBuZWlnaGJvcnNbby5zb3VyY2UuaW5kZXhdLnB1c2goby50YXJnZXQpO1xuICAgICAgICAgICAgbmVpZ2hib3JzW28udGFyZ2V0LmluZGV4XS5wdXNoKG8uc291cmNlKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGNhbmRpZGF0ZXMgPSBuZWlnaGJvcnNbaV0sIGogPSAtMSwgbSA9IGNhbmRpZGF0ZXMubGVuZ3RoLCB4O1xuICAgICAgICB3aGlsZSAoKytqIDwgbSkgaWYgKCFpc05hTih4ID0gY2FuZGlkYXRlc1tqXVtkaW1lbnNpb25dKSkgcmV0dXJuIHg7XG4gICAgICAgIHJldHVybiBNYXRoLnJhbmRvbSgpICogc2l6ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmb3JjZS5yZXN1bWUoKTtcbiAgICB9O1xuICAgIGZvcmNlLnJlc3VtZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZvcmNlLmFscGhhKC4xKTtcbiAgICB9O1xuICAgIGZvcmNlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmb3JjZS5hbHBoYSgwKTtcbiAgICB9O1xuICAgIGZvcmNlLmRyYWcgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghZHJhZykgZHJhZyA9IGQzLmJlaGF2aW9yLmRyYWcoKS5vcmlnaW4oZDNfaWRlbnRpdHkpLm9uKFwiZHJhZ3N0YXJ0LmZvcmNlXCIsIGQzX2xheW91dF9mb3JjZURyYWdzdGFydCkub24oXCJkcmFnLmZvcmNlXCIsIGRyYWdtb3ZlKS5vbihcImRyYWdlbmQuZm9yY2VcIiwgZDNfbGF5b3V0X2ZvcmNlRHJhZ2VuZCk7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBkcmFnO1xuICAgICAgdGhpcy5vbihcIm1vdXNlb3Zlci5mb3JjZVwiLCBkM19sYXlvdXRfZm9yY2VNb3VzZW92ZXIpLm9uKFwibW91c2VvdXQuZm9yY2VcIiwgZDNfbGF5b3V0X2ZvcmNlTW91c2VvdXQpLmNhbGwoZHJhZyk7XG4gICAgfTtcbiAgICBmdW5jdGlvbiBkcmFnbW92ZShkKSB7XG4gICAgICBkLnB4ID0gZDMuZXZlbnQueCwgZC5weSA9IGQzLmV2ZW50Lnk7XG4gICAgICBmb3JjZS5yZXN1bWUoKTtcbiAgICB9XG4gICAgcmV0dXJuIGQzLnJlYmluZChmb3JjZSwgZXZlbnQsIFwib25cIik7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9mb3JjZURyYWdzdGFydChkKSB7XG4gICAgZC5maXhlZCB8PSAyO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9mb3JjZURyYWdlbmQoZCkge1xuICAgIGQuZml4ZWQgJj0gfjY7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X2ZvcmNlTW91c2VvdmVyKGQpIHtcbiAgICBkLmZpeGVkIHw9IDQ7XG4gICAgZC5weCA9IGQueCwgZC5weSA9IGQueTtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfZm9yY2VNb3VzZW91dChkKSB7XG4gICAgZC5maXhlZCAmPSB+NDtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfZm9yY2VBY2N1bXVsYXRlKHF1YWQsIGFscGhhLCBjaGFyZ2VzKSB7XG4gICAgdmFyIGN4ID0gMCwgY3kgPSAwO1xuICAgIHF1YWQuY2hhcmdlID0gMDtcbiAgICBpZiAoIXF1YWQubGVhZikge1xuICAgICAgdmFyIG5vZGVzID0gcXVhZC5ub2RlcywgbiA9IG5vZGVzLmxlbmd0aCwgaSA9IC0xLCBjO1xuICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgYyA9IG5vZGVzW2ldO1xuICAgICAgICBpZiAoYyA9PSBudWxsKSBjb250aW51ZTtcbiAgICAgICAgZDNfbGF5b3V0X2ZvcmNlQWNjdW11bGF0ZShjLCBhbHBoYSwgY2hhcmdlcyk7XG4gICAgICAgIHF1YWQuY2hhcmdlICs9IGMuY2hhcmdlO1xuICAgICAgICBjeCArPSBjLmNoYXJnZSAqIGMuY3g7XG4gICAgICAgIGN5ICs9IGMuY2hhcmdlICogYy5jeTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHF1YWQucG9pbnQpIHtcbiAgICAgIGlmICghcXVhZC5sZWFmKSB7XG4gICAgICAgIHF1YWQucG9pbnQueCArPSBNYXRoLnJhbmRvbSgpIC0gLjU7XG4gICAgICAgIHF1YWQucG9pbnQueSArPSBNYXRoLnJhbmRvbSgpIC0gLjU7XG4gICAgICB9XG4gICAgICB2YXIgayA9IGFscGhhICogY2hhcmdlc1txdWFkLnBvaW50LmluZGV4XTtcbiAgICAgIHF1YWQuY2hhcmdlICs9IHF1YWQucG9pbnRDaGFyZ2UgPSBrO1xuICAgICAgY3ggKz0gayAqIHF1YWQucG9pbnQueDtcbiAgICAgIGN5ICs9IGsgKiBxdWFkLnBvaW50Lnk7XG4gICAgfVxuICAgIHF1YWQuY3ggPSBjeCAvIHF1YWQuY2hhcmdlO1xuICAgIHF1YWQuY3kgPSBjeSAvIHF1YWQuY2hhcmdlO1xuICB9XG4gIHZhciBkM19sYXlvdXRfZm9yY2VMaW5rRGlzdGFuY2UgPSAyMCwgZDNfbGF5b3V0X2ZvcmNlTGlua1N0cmVuZ3RoID0gMSwgZDNfbGF5b3V0X2ZvcmNlQ2hhcmdlRGlzdGFuY2UyID0gSW5maW5pdHk7XG4gIGQzLmxheW91dC5oaWVyYXJjaHkgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc29ydCA9IGQzX2xheW91dF9oaWVyYXJjaHlTb3J0LCBjaGlsZHJlbiA9IGQzX2xheW91dF9oaWVyYXJjaHlDaGlsZHJlbiwgdmFsdWUgPSBkM19sYXlvdXRfaGllcmFyY2h5VmFsdWU7XG4gICAgZnVuY3Rpb24gaGllcmFyY2h5KHJvb3QpIHtcbiAgICAgIHZhciBzdGFjayA9IFsgcm9vdCBdLCBub2RlcyA9IFtdLCBub2RlO1xuICAgICAgcm9vdC5kZXB0aCA9IDA7XG4gICAgICB3aGlsZSAoKG5vZGUgPSBzdGFjay5wb3AoKSkgIT0gbnVsbCkge1xuICAgICAgICBub2Rlcy5wdXNoKG5vZGUpO1xuICAgICAgICBpZiAoKGNoaWxkcyA9IGNoaWxkcmVuLmNhbGwoaGllcmFyY2h5LCBub2RlLCBub2RlLmRlcHRoKSkgJiYgKG4gPSBjaGlsZHMubGVuZ3RoKSkge1xuICAgICAgICAgIHZhciBuLCBjaGlsZHMsIGNoaWxkO1xuICAgICAgICAgIHdoaWxlICgtLW4gPj0gMCkge1xuICAgICAgICAgICAgc3RhY2sucHVzaChjaGlsZCA9IGNoaWxkc1tuXSk7XG4gICAgICAgICAgICBjaGlsZC5wYXJlbnQgPSBub2RlO1xuICAgICAgICAgICAgY2hpbGQuZGVwdGggPSBub2RlLmRlcHRoICsgMTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHZhbHVlKSBub2RlLnZhbHVlID0gMDtcbiAgICAgICAgICBub2RlLmNoaWxkcmVuID0gY2hpbGRzO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICh2YWx1ZSkgbm9kZS52YWx1ZSA9ICt2YWx1ZS5jYWxsKGhpZXJhcmNoeSwgbm9kZSwgbm9kZS5kZXB0aCkgfHwgMDtcbiAgICAgICAgICBkZWxldGUgbm9kZS5jaGlsZHJlbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZDNfbGF5b3V0X2hpZXJhcmNoeVZpc2l0QWZ0ZXIocm9vdCwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICB2YXIgY2hpbGRzLCBwYXJlbnQ7XG4gICAgICAgIGlmIChzb3J0ICYmIChjaGlsZHMgPSBub2RlLmNoaWxkcmVuKSkgY2hpbGRzLnNvcnQoc29ydCk7XG4gICAgICAgIGlmICh2YWx1ZSAmJiAocGFyZW50ID0gbm9kZS5wYXJlbnQpKSBwYXJlbnQudmFsdWUgKz0gbm9kZS52YWx1ZTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIG5vZGVzO1xuICAgIH1cbiAgICBoaWVyYXJjaHkuc29ydCA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNvcnQ7XG4gICAgICBzb3J0ID0geDtcbiAgICAgIHJldHVybiBoaWVyYXJjaHk7XG4gICAgfTtcbiAgICBoaWVyYXJjaHkuY2hpbGRyZW4gPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjaGlsZHJlbjtcbiAgICAgIGNoaWxkcmVuID0geDtcbiAgICAgIHJldHVybiBoaWVyYXJjaHk7XG4gICAgfTtcbiAgICBoaWVyYXJjaHkudmFsdWUgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB2YWx1ZTtcbiAgICAgIHZhbHVlID0geDtcbiAgICAgIHJldHVybiBoaWVyYXJjaHk7XG4gICAgfTtcbiAgICBoaWVyYXJjaHkucmV2YWx1ZSA9IGZ1bmN0aW9uKHJvb3QpIHtcbiAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICBkM19sYXlvdXRfaGllcmFyY2h5VmlzaXRCZWZvcmUocm9vdCwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgIGlmIChub2RlLmNoaWxkcmVuKSBub2RlLnZhbHVlID0gMDtcbiAgICAgICAgfSk7XG4gICAgICAgIGQzX2xheW91dF9oaWVyYXJjaHlWaXNpdEFmdGVyKHJvb3QsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICB2YXIgcGFyZW50O1xuICAgICAgICAgIGlmICghbm9kZS5jaGlsZHJlbikgbm9kZS52YWx1ZSA9ICt2YWx1ZS5jYWxsKGhpZXJhcmNoeSwgbm9kZSwgbm9kZS5kZXB0aCkgfHwgMDtcbiAgICAgICAgICBpZiAocGFyZW50ID0gbm9kZS5wYXJlbnQpIHBhcmVudC52YWx1ZSArPSBub2RlLnZhbHVlO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByb290O1xuICAgIH07XG4gICAgcmV0dXJuIGhpZXJhcmNoeTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfbGF5b3V0X2hpZXJhcmNoeVJlYmluZChvYmplY3QsIGhpZXJhcmNoeSkge1xuICAgIGQzLnJlYmluZChvYmplY3QsIGhpZXJhcmNoeSwgXCJzb3J0XCIsIFwiY2hpbGRyZW5cIiwgXCJ2YWx1ZVwiKTtcbiAgICBvYmplY3Qubm9kZXMgPSBvYmplY3Q7XG4gICAgb2JqZWN0LmxpbmtzID0gZDNfbGF5b3V0X2hpZXJhcmNoeUxpbmtzO1xuICAgIHJldHVybiBvYmplY3Q7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X2hpZXJhcmNoeVZpc2l0QmVmb3JlKG5vZGUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIG5vZGVzID0gWyBub2RlIF07XG4gICAgd2hpbGUgKChub2RlID0gbm9kZXMucG9wKCkpICE9IG51bGwpIHtcbiAgICAgIGNhbGxiYWNrKG5vZGUpO1xuICAgICAgaWYgKChjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4pICYmIChuID0gY2hpbGRyZW4ubGVuZ3RoKSkge1xuICAgICAgICB2YXIgbiwgY2hpbGRyZW47XG4gICAgICAgIHdoaWxlICgtLW4gPj0gMCkgbm9kZXMucHVzaChjaGlsZHJlbltuXSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9oaWVyYXJjaHlWaXNpdEFmdGVyKG5vZGUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIG5vZGVzID0gWyBub2RlIF0sIG5vZGVzMiA9IFtdO1xuICAgIHdoaWxlICgobm9kZSA9IG5vZGVzLnBvcCgpKSAhPSBudWxsKSB7XG4gICAgICBub2RlczIucHVzaChub2RlKTtcbiAgICAgIGlmICgoY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuKSAmJiAobiA9IGNoaWxkcmVuLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbiwgY2hpbGRyZW47XG4gICAgICAgIHdoaWxlICgrK2kgPCBuKSBub2Rlcy5wdXNoKGNoaWxkcmVuW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gICAgd2hpbGUgKChub2RlID0gbm9kZXMyLnBvcCgpKSAhPSBudWxsKSB7XG4gICAgICBjYWxsYmFjayhub2RlKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X2hpZXJhcmNoeUNoaWxkcmVuKGQpIHtcbiAgICByZXR1cm4gZC5jaGlsZHJlbjtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfaGllcmFyY2h5VmFsdWUoZCkge1xuICAgIHJldHVybiBkLnZhbHVlO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9oaWVyYXJjaHlTb3J0KGEsIGIpIHtcbiAgICByZXR1cm4gYi52YWx1ZSAtIGEudmFsdWU7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X2hpZXJhcmNoeUxpbmtzKG5vZGVzKSB7XG4gICAgcmV0dXJuIGQzLm1lcmdlKG5vZGVzLm1hcChmdW5jdGlvbihwYXJlbnQpIHtcbiAgICAgIHJldHVybiAocGFyZW50LmNoaWxkcmVuIHx8IFtdKS5tYXAoZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzb3VyY2U6IHBhcmVudCxcbiAgICAgICAgICB0YXJnZXQ6IGNoaWxkXG4gICAgICAgIH07XG4gICAgICB9KTtcbiAgICB9KSk7XG4gIH1cbiAgZDMubGF5b3V0LnBhcnRpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBoaWVyYXJjaHkgPSBkMy5sYXlvdXQuaGllcmFyY2h5KCksIHNpemUgPSBbIDEsIDEgXTtcbiAgICBmdW5jdGlvbiBwb3NpdGlvbihub2RlLCB4LCBkeCwgZHkpIHtcbiAgICAgIHZhciBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XG4gICAgICBub2RlLnggPSB4O1xuICAgICAgbm9kZS55ID0gbm9kZS5kZXB0aCAqIGR5O1xuICAgICAgbm9kZS5keCA9IGR4O1xuICAgICAgbm9kZS5keSA9IGR5O1xuICAgICAgaWYgKGNoaWxkcmVuICYmIChuID0gY2hpbGRyZW4ubGVuZ3RoKSkge1xuICAgICAgICB2YXIgaSA9IC0xLCBuLCBjLCBkO1xuICAgICAgICBkeCA9IG5vZGUudmFsdWUgPyBkeCAvIG5vZGUudmFsdWUgOiAwO1xuICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgIHBvc2l0aW9uKGMgPSBjaGlsZHJlbltpXSwgeCwgZCA9IGMudmFsdWUgKiBkeCwgZHkpO1xuICAgICAgICAgIHggKz0gZDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBkZXB0aChub2RlKSB7XG4gICAgICB2YXIgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuLCBkID0gMDtcbiAgICAgIGlmIChjaGlsZHJlbiAmJiAobiA9IGNoaWxkcmVuLmxlbmd0aCkpIHtcbiAgICAgICAgdmFyIGkgPSAtMSwgbjtcbiAgICAgICAgd2hpbGUgKCsraSA8IG4pIGQgPSBNYXRoLm1heChkLCBkZXB0aChjaGlsZHJlbltpXSkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIDEgKyBkO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwYXJ0aXRpb24oZCwgaSkge1xuICAgICAgdmFyIG5vZGVzID0gaGllcmFyY2h5LmNhbGwodGhpcywgZCwgaSk7XG4gICAgICBwb3NpdGlvbihub2Rlc1swXSwgMCwgc2l6ZVswXSwgc2l6ZVsxXSAvIGRlcHRoKG5vZGVzWzBdKSk7XG4gICAgICByZXR1cm4gbm9kZXM7XG4gICAgfVxuICAgIHBhcnRpdGlvbi5zaXplID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc2l6ZTtcbiAgICAgIHNpemUgPSB4O1xuICAgICAgcmV0dXJuIHBhcnRpdGlvbjtcbiAgICB9O1xuICAgIHJldHVybiBkM19sYXlvdXRfaGllcmFyY2h5UmViaW5kKHBhcnRpdGlvbiwgaGllcmFyY2h5KTtcbiAgfTtcbiAgZDMubGF5b3V0LnBpZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZSA9IE51bWJlciwgc29ydCA9IGQzX2xheW91dF9waWVTb3J0QnlWYWx1ZSwgc3RhcnRBbmdsZSA9IDAsIGVuZEFuZ2xlID0gz4Q7XG4gICAgZnVuY3Rpb24gcGllKGRhdGEpIHtcbiAgICAgIHZhciB2YWx1ZXMgPSBkYXRhLm1hcChmdW5jdGlvbihkLCBpKSB7XG4gICAgICAgIHJldHVybiArdmFsdWUuY2FsbChwaWUsIGQsIGkpO1xuICAgICAgfSk7XG4gICAgICB2YXIgYSA9ICsodHlwZW9mIHN0YXJ0QW5nbGUgPT09IFwiZnVuY3Rpb25cIiA/IHN0YXJ0QW5nbGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IHN0YXJ0QW5nbGUpO1xuICAgICAgdmFyIGsgPSAoKHR5cGVvZiBlbmRBbmdsZSA9PT0gXCJmdW5jdGlvblwiID8gZW5kQW5nbGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IGVuZEFuZ2xlKSAtIGEpIC8gZDMuc3VtKHZhbHVlcyk7XG4gICAgICB2YXIgaW5kZXggPSBkMy5yYW5nZShkYXRhLmxlbmd0aCk7XG4gICAgICBpZiAoc29ydCAhPSBudWxsKSBpbmRleC5zb3J0KHNvcnQgPT09IGQzX2xheW91dF9waWVTb3J0QnlWYWx1ZSA/IGZ1bmN0aW9uKGksIGopIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlc1tqXSAtIHZhbHVlc1tpXTtcbiAgICAgIH0gOiBmdW5jdGlvbihpLCBqKSB7XG4gICAgICAgIHJldHVybiBzb3J0KGRhdGFbaV0sIGRhdGFbal0pO1xuICAgICAgfSk7XG4gICAgICB2YXIgYXJjcyA9IFtdO1xuICAgICAgaW5kZXguZm9yRWFjaChmdW5jdGlvbihpKSB7XG4gICAgICAgIHZhciBkO1xuICAgICAgICBhcmNzW2ldID0ge1xuICAgICAgICAgIGRhdGE6IGRhdGFbaV0sXG4gICAgICAgICAgdmFsdWU6IGQgPSB2YWx1ZXNbaV0sXG4gICAgICAgICAgc3RhcnRBbmdsZTogYSxcbiAgICAgICAgICBlbmRBbmdsZTogYSArPSBkICoga1xuICAgICAgICB9O1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gYXJjcztcbiAgICB9XG4gICAgcGllLnZhbHVlID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdmFsdWU7XG4gICAgICB2YWx1ZSA9IHg7XG4gICAgICByZXR1cm4gcGllO1xuICAgIH07XG4gICAgcGllLnNvcnQgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBzb3J0O1xuICAgICAgc29ydCA9IHg7XG4gICAgICByZXR1cm4gcGllO1xuICAgIH07XG4gICAgcGllLnN0YXJ0QW5nbGUgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBzdGFydEFuZ2xlO1xuICAgICAgc3RhcnRBbmdsZSA9IHg7XG4gICAgICByZXR1cm4gcGllO1xuICAgIH07XG4gICAgcGllLmVuZEFuZ2xlID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZW5kQW5nbGU7XG4gICAgICBlbmRBbmdsZSA9IHg7XG4gICAgICByZXR1cm4gcGllO1xuICAgIH07XG4gICAgcmV0dXJuIHBpZTtcbiAgfTtcbiAgdmFyIGQzX2xheW91dF9waWVTb3J0QnlWYWx1ZSA9IHt9O1xuICBkMy5sYXlvdXQuc3RhY2sgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVzID0gZDNfaWRlbnRpdHksIG9yZGVyID0gZDNfbGF5b3V0X3N0YWNrT3JkZXJEZWZhdWx0LCBvZmZzZXQgPSBkM19sYXlvdXRfc3RhY2tPZmZzZXRaZXJvLCBvdXQgPSBkM19sYXlvdXRfc3RhY2tPdXQsIHggPSBkM19sYXlvdXRfc3RhY2tYLCB5ID0gZDNfbGF5b3V0X3N0YWNrWTtcbiAgICBmdW5jdGlvbiBzdGFjayhkYXRhLCBpbmRleCkge1xuICAgICAgdmFyIHNlcmllcyA9IGRhdGEubWFwKGZ1bmN0aW9uKGQsIGkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlcy5jYWxsKHN0YWNrLCBkLCBpKTtcbiAgICAgIH0pO1xuICAgICAgdmFyIHBvaW50cyA9IHNlcmllcy5tYXAoZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gZC5tYXAoZnVuY3Rpb24odiwgaSkge1xuICAgICAgICAgIHJldHVybiBbIHguY2FsbChzdGFjaywgdiwgaSksIHkuY2FsbChzdGFjaywgdiwgaSkgXTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIHZhciBvcmRlcnMgPSBvcmRlci5jYWxsKHN0YWNrLCBwb2ludHMsIGluZGV4KTtcbiAgICAgIHNlcmllcyA9IGQzLnBlcm11dGUoc2VyaWVzLCBvcmRlcnMpO1xuICAgICAgcG9pbnRzID0gZDMucGVybXV0ZShwb2ludHMsIG9yZGVycyk7XG4gICAgICB2YXIgb2Zmc2V0cyA9IG9mZnNldC5jYWxsKHN0YWNrLCBwb2ludHMsIGluZGV4KTtcbiAgICAgIHZhciBuID0gc2VyaWVzLmxlbmd0aCwgbSA9IHNlcmllc1swXS5sZW5ndGgsIGksIGosIG87XG4gICAgICBmb3IgKGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgICAgIG91dC5jYWxsKHN0YWNrLCBzZXJpZXNbMF1bal0sIG8gPSBvZmZzZXRzW2pdLCBwb2ludHNbMF1bal1bMV0pO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbjsgKytpKSB7XG4gICAgICAgICAgb3V0LmNhbGwoc3RhY2ssIHNlcmllc1tpXVtqXSwgbyArPSBwb2ludHNbaSAtIDFdW2pdWzFdLCBwb2ludHNbaV1bal1bMV0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgc3RhY2sudmFsdWVzID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdmFsdWVzO1xuICAgICAgdmFsdWVzID0geDtcbiAgICAgIHJldHVybiBzdGFjaztcbiAgICB9O1xuICAgIHN0YWNrLm9yZGVyID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gb3JkZXI7XG4gICAgICBvcmRlciA9IHR5cGVvZiB4ID09PSBcImZ1bmN0aW9uXCIgPyB4IDogZDNfbGF5b3V0X3N0YWNrT3JkZXJzLmdldCh4KSB8fCBkM19sYXlvdXRfc3RhY2tPcmRlckRlZmF1bHQ7XG4gICAgICByZXR1cm4gc3RhY2s7XG4gICAgfTtcbiAgICBzdGFjay5vZmZzZXQgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBvZmZzZXQ7XG4gICAgICBvZmZzZXQgPSB0eXBlb2YgeCA9PT0gXCJmdW5jdGlvblwiID8geCA6IGQzX2xheW91dF9zdGFja09mZnNldHMuZ2V0KHgpIHx8IGQzX2xheW91dF9zdGFja09mZnNldFplcm87XG4gICAgICByZXR1cm4gc3RhY2s7XG4gICAgfTtcbiAgICBzdGFjay54ID0gZnVuY3Rpb24oeikge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geDtcbiAgICAgIHggPSB6O1xuICAgICAgcmV0dXJuIHN0YWNrO1xuICAgIH07XG4gICAgc3RhY2sueSA9IGZ1bmN0aW9uKHopIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHk7XG4gICAgICB5ID0gejtcbiAgICAgIHJldHVybiBzdGFjaztcbiAgICB9O1xuICAgIHN0YWNrLm91dCA9IGZ1bmN0aW9uKHopIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG91dDtcbiAgICAgIG91dCA9IHo7XG4gICAgICByZXR1cm4gc3RhY2s7XG4gICAgfTtcbiAgICByZXR1cm4gc3RhY2s7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9zdGFja1goZCkge1xuICAgIHJldHVybiBkLng7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3N0YWNrWShkKSB7XG4gICAgcmV0dXJuIGQueTtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfc3RhY2tPdXQoZCwgeTAsIHkpIHtcbiAgICBkLnkwID0geTA7XG4gICAgZC55ID0geTtcbiAgfVxuICB2YXIgZDNfbGF5b3V0X3N0YWNrT3JkZXJzID0gZDMubWFwKHtcbiAgICBcImluc2lkZS1vdXRcIjogZnVuY3Rpb24oZGF0YSkge1xuICAgICAgdmFyIG4gPSBkYXRhLmxlbmd0aCwgaSwgaiwgbWF4ID0gZGF0YS5tYXAoZDNfbGF5b3V0X3N0YWNrTWF4SW5kZXgpLCBzdW1zID0gZGF0YS5tYXAoZDNfbGF5b3V0X3N0YWNrUmVkdWNlU3VtKSwgaW5kZXggPSBkMy5yYW5nZShuKS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIG1heFthXSAtIG1heFtiXTtcbiAgICAgIH0pLCB0b3AgPSAwLCBib3R0b20gPSAwLCB0b3BzID0gW10sIGJvdHRvbXMgPSBbXTtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgaiA9IGluZGV4W2ldO1xuICAgICAgICBpZiAodG9wIDwgYm90dG9tKSB7XG4gICAgICAgICAgdG9wICs9IHN1bXNbal07XG4gICAgICAgICAgdG9wcy5wdXNoKGopO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGJvdHRvbSArPSBzdW1zW2pdO1xuICAgICAgICAgIGJvdHRvbXMucHVzaChqKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJvdHRvbXMucmV2ZXJzZSgpLmNvbmNhdCh0b3BzKTtcbiAgICB9LFxuICAgIHJldmVyc2U6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiBkMy5yYW5nZShkYXRhLmxlbmd0aCkucmV2ZXJzZSgpO1xuICAgIH0sXG4gICAgXCJkZWZhdWx0XCI6IGQzX2xheW91dF9zdGFja09yZGVyRGVmYXVsdFxuICB9KTtcbiAgdmFyIGQzX2xheW91dF9zdGFja09mZnNldHMgPSBkMy5tYXAoe1xuICAgIHNpbGhvdWV0dGU6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBuID0gZGF0YS5sZW5ndGgsIG0gPSBkYXRhWzBdLmxlbmd0aCwgc3VtcyA9IFtdLCBtYXggPSAwLCBpLCBqLCBvLCB5MCA9IFtdO1xuICAgICAgZm9yIChqID0gMDsgaiA8IG07ICsraikge1xuICAgICAgICBmb3IgKGkgPSAwLCBvID0gMDsgaSA8IG47IGkrKykgbyArPSBkYXRhW2ldW2pdWzFdO1xuICAgICAgICBpZiAobyA+IG1heCkgbWF4ID0gbztcbiAgICAgICAgc3Vtcy5wdXNoKG8pO1xuICAgICAgfVxuICAgICAgZm9yIChqID0gMDsgaiA8IG07ICsraikge1xuICAgICAgICB5MFtqXSA9IChtYXggLSBzdW1zW2pdKSAvIDI7XG4gICAgICB9XG4gICAgICByZXR1cm4geTA7XG4gICAgfSxcbiAgICB3aWdnbGU6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBuID0gZGF0YS5sZW5ndGgsIHggPSBkYXRhWzBdLCBtID0geC5sZW5ndGgsIGksIGosIGssIHMxLCBzMiwgczMsIGR4LCBvLCBvMCwgeTAgPSBbXTtcbiAgICAgIHkwWzBdID0gbyA9IG8wID0gMDtcbiAgICAgIGZvciAoaiA9IDE7IGogPCBtOyArK2opIHtcbiAgICAgICAgZm9yIChpID0gMCwgczEgPSAwOyBpIDwgbjsgKytpKSBzMSArPSBkYXRhW2ldW2pdWzFdO1xuICAgICAgICBmb3IgKGkgPSAwLCBzMiA9IDAsIGR4ID0geFtqXVswXSAtIHhbaiAtIDFdWzBdOyBpIDwgbjsgKytpKSB7XG4gICAgICAgICAgZm9yIChrID0gMCwgczMgPSAoZGF0YVtpXVtqXVsxXSAtIGRhdGFbaV1baiAtIDFdWzFdKSAvICgyICogZHgpOyBrIDwgaTsgKytrKSB7XG4gICAgICAgICAgICBzMyArPSAoZGF0YVtrXVtqXVsxXSAtIGRhdGFba11baiAtIDFdWzFdKSAvIGR4O1xuICAgICAgICAgIH1cbiAgICAgICAgICBzMiArPSBzMyAqIGRhdGFbaV1bal1bMV07XG4gICAgICAgIH1cbiAgICAgICAgeTBbal0gPSBvIC09IHMxID8gczIgLyBzMSAqIGR4IDogMDtcbiAgICAgICAgaWYgKG8gPCBvMCkgbzAgPSBvO1xuICAgICAgfVxuICAgICAgZm9yIChqID0gMDsgaiA8IG07ICsraikgeTBbal0gLT0gbzA7XG4gICAgICByZXR1cm4geTA7XG4gICAgfSxcbiAgICBleHBhbmQ6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHZhciBuID0gZGF0YS5sZW5ndGgsIG0gPSBkYXRhWzBdLmxlbmd0aCwgayA9IDEgLyBuLCBpLCBqLCBvLCB5MCA9IFtdO1xuICAgICAgZm9yIChqID0gMDsgaiA8IG07ICsraikge1xuICAgICAgICBmb3IgKGkgPSAwLCBvID0gMDsgaSA8IG47IGkrKykgbyArPSBkYXRhW2ldW2pdWzFdO1xuICAgICAgICBpZiAobykgZm9yIChpID0gMDsgaSA8IG47IGkrKykgZGF0YVtpXVtqXVsxXSAvPSBvOyBlbHNlIGZvciAoaSA9IDA7IGkgPCBuOyBpKyspIGRhdGFbaV1bal1bMV0gPSBrO1xuICAgICAgfVxuICAgICAgZm9yIChqID0gMDsgaiA8IG07ICsraikgeTBbal0gPSAwO1xuICAgICAgcmV0dXJuIHkwO1xuICAgIH0sXG4gICAgemVybzogZDNfbGF5b3V0X3N0YWNrT2Zmc2V0WmVyb1xuICB9KTtcbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3N0YWNrT3JkZXJEZWZhdWx0KGRhdGEpIHtcbiAgICByZXR1cm4gZDMucmFuZ2UoZGF0YS5sZW5ndGgpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9zdGFja09mZnNldFplcm8oZGF0YSkge1xuICAgIHZhciBqID0gLTEsIG0gPSBkYXRhWzBdLmxlbmd0aCwgeTAgPSBbXTtcbiAgICB3aGlsZSAoKytqIDwgbSkgeTBbal0gPSAwO1xuICAgIHJldHVybiB5MDtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfc3RhY2tNYXhJbmRleChhcnJheSkge1xuICAgIHZhciBpID0gMSwgaiA9IDAsIHYgPSBhcnJheVswXVsxXSwgaywgbiA9IGFycmF5Lmxlbmd0aDtcbiAgICBmb3IgKDtpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKGsgPSBhcnJheVtpXVsxXSkgPiB2KSB7XG4gICAgICAgIGogPSBpO1xuICAgICAgICB2ID0gaztcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGo7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3N0YWNrUmVkdWNlU3VtKGQpIHtcbiAgICByZXR1cm4gZC5yZWR1Y2UoZDNfbGF5b3V0X3N0YWNrU3VtLCAwKTtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfc3RhY2tTdW0ocCwgZCkge1xuICAgIHJldHVybiBwICsgZFsxXTtcbiAgfVxuICBkMy5sYXlvdXQuaGlzdG9ncmFtID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGZyZXF1ZW5jeSA9IHRydWUsIHZhbHVlciA9IE51bWJlciwgcmFuZ2VyID0gZDNfbGF5b3V0X2hpc3RvZ3JhbVJhbmdlLCBiaW5uZXIgPSBkM19sYXlvdXRfaGlzdG9ncmFtQmluU3R1cmdlcztcbiAgICBmdW5jdGlvbiBoaXN0b2dyYW0oZGF0YSwgaSkge1xuICAgICAgdmFyIGJpbnMgPSBbXSwgdmFsdWVzID0gZGF0YS5tYXAodmFsdWVyLCB0aGlzKSwgcmFuZ2UgPSByYW5nZXIuY2FsbCh0aGlzLCB2YWx1ZXMsIGkpLCB0aHJlc2hvbGRzID0gYmlubmVyLmNhbGwodGhpcywgcmFuZ2UsIHZhbHVlcywgaSksIGJpbiwgaSA9IC0xLCBuID0gdmFsdWVzLmxlbmd0aCwgbSA9IHRocmVzaG9sZHMubGVuZ3RoIC0gMSwgayA9IGZyZXF1ZW5jeSA/IDEgOiAxIC8gbiwgeDtcbiAgICAgIHdoaWxlICgrK2kgPCBtKSB7XG4gICAgICAgIGJpbiA9IGJpbnNbaV0gPSBbXTtcbiAgICAgICAgYmluLmR4ID0gdGhyZXNob2xkc1tpICsgMV0gLSAoYmluLnggPSB0aHJlc2hvbGRzW2ldKTtcbiAgICAgICAgYmluLnkgPSAwO1xuICAgICAgfVxuICAgICAgaWYgKG0gPiAwKSB7XG4gICAgICAgIGkgPSAtMTtcbiAgICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgICB4ID0gdmFsdWVzW2ldO1xuICAgICAgICAgIGlmICh4ID49IHJhbmdlWzBdICYmIHggPD0gcmFuZ2VbMV0pIHtcbiAgICAgICAgICAgIGJpbiA9IGJpbnNbZDMuYmlzZWN0KHRocmVzaG9sZHMsIHgsIDEsIG0pIC0gMV07XG4gICAgICAgICAgICBiaW4ueSArPSBrO1xuICAgICAgICAgICAgYmluLnB1c2goZGF0YVtpXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gYmlucztcbiAgICB9XG4gICAgaGlzdG9ncmFtLnZhbHVlID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdmFsdWVyO1xuICAgICAgdmFsdWVyID0geDtcbiAgICAgIHJldHVybiBoaXN0b2dyYW07XG4gICAgfTtcbiAgICBoaXN0b2dyYW0ucmFuZ2UgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiByYW5nZXI7XG4gICAgICByYW5nZXIgPSBkM19mdW5jdG9yKHgpO1xuICAgICAgcmV0dXJuIGhpc3RvZ3JhbTtcbiAgICB9O1xuICAgIGhpc3RvZ3JhbS5iaW5zID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gYmlubmVyO1xuICAgICAgYmlubmVyID0gdHlwZW9mIHggPT09IFwibnVtYmVyXCIgPyBmdW5jdGlvbihyYW5nZSkge1xuICAgICAgICByZXR1cm4gZDNfbGF5b3V0X2hpc3RvZ3JhbUJpbkZpeGVkKHJhbmdlLCB4KTtcbiAgICAgIH0gOiBkM19mdW5jdG9yKHgpO1xuICAgICAgcmV0dXJuIGhpc3RvZ3JhbTtcbiAgICB9O1xuICAgIGhpc3RvZ3JhbS5mcmVxdWVuY3kgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBmcmVxdWVuY3k7XG4gICAgICBmcmVxdWVuY3kgPSAhIXg7XG4gICAgICByZXR1cm4gaGlzdG9ncmFtO1xuICAgIH07XG4gICAgcmV0dXJuIGhpc3RvZ3JhbTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfbGF5b3V0X2hpc3RvZ3JhbUJpblN0dXJnZXMocmFuZ2UsIHZhbHVlcykge1xuICAgIHJldHVybiBkM19sYXlvdXRfaGlzdG9ncmFtQmluRml4ZWQocmFuZ2UsIE1hdGguY2VpbChNYXRoLmxvZyh2YWx1ZXMubGVuZ3RoKSAvIE1hdGguTE4yICsgMSkpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9oaXN0b2dyYW1CaW5GaXhlZChyYW5nZSwgbikge1xuICAgIHZhciB4ID0gLTEsIGIgPSArcmFuZ2VbMF0sIG0gPSAocmFuZ2VbMV0gLSBiKSAvIG4sIGYgPSBbXTtcbiAgICB3aGlsZSAoKyt4IDw9IG4pIGZbeF0gPSBtICogeCArIGI7XG4gICAgcmV0dXJuIGY7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X2hpc3RvZ3JhbVJhbmdlKHZhbHVlcykge1xuICAgIHJldHVybiBbIGQzLm1pbih2YWx1ZXMpLCBkMy5tYXgodmFsdWVzKSBdO1xuICB9XG4gIGQzLmxheW91dC5wYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGhpZXJhcmNoeSA9IGQzLmxheW91dC5oaWVyYXJjaHkoKS5zb3J0KGQzX2xheW91dF9wYWNrU29ydCksIHBhZGRpbmcgPSAwLCBzaXplID0gWyAxLCAxIF0sIHJhZGl1cztcbiAgICBmdW5jdGlvbiBwYWNrKGQsIGkpIHtcbiAgICAgIHZhciBub2RlcyA9IGhpZXJhcmNoeS5jYWxsKHRoaXMsIGQsIGkpLCByb290ID0gbm9kZXNbMF0sIHcgPSBzaXplWzBdLCBoID0gc2l6ZVsxXSwgciA9IHJhZGl1cyA9PSBudWxsID8gTWF0aC5zcXJ0IDogdHlwZW9mIHJhZGl1cyA9PT0gXCJmdW5jdGlvblwiID8gcmFkaXVzIDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiByYWRpdXM7XG4gICAgICB9O1xuICAgICAgcm9vdC54ID0gcm9vdC55ID0gMDtcbiAgICAgIGQzX2xheW91dF9oaWVyYXJjaHlWaXNpdEFmdGVyKHJvb3QsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgZC5yID0gK3IoZC52YWx1ZSk7XG4gICAgICB9KTtcbiAgICAgIGQzX2xheW91dF9oaWVyYXJjaHlWaXNpdEFmdGVyKHJvb3QsIGQzX2xheW91dF9wYWNrU2libGluZ3MpO1xuICAgICAgaWYgKHBhZGRpbmcpIHtcbiAgICAgICAgdmFyIGRyID0gcGFkZGluZyAqIChyYWRpdXMgPyAxIDogTWF0aC5tYXgoMiAqIHJvb3QuciAvIHcsIDIgKiByb290LnIgLyBoKSkgLyAyO1xuICAgICAgICBkM19sYXlvdXRfaGllcmFyY2h5VmlzaXRBZnRlcihyb290LCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgZC5yICs9IGRyO1xuICAgICAgICB9KTtcbiAgICAgICAgZDNfbGF5b3V0X2hpZXJhcmNoeVZpc2l0QWZ0ZXIocm9vdCwgZDNfbGF5b3V0X3BhY2tTaWJsaW5ncyk7XG4gICAgICAgIGQzX2xheW91dF9oaWVyYXJjaHlWaXNpdEFmdGVyKHJvb3QsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICBkLnIgLT0gZHI7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgZDNfbGF5b3V0X3BhY2tUcmFuc2Zvcm0ocm9vdCwgdyAvIDIsIGggLyAyLCByYWRpdXMgPyAxIDogMSAvIE1hdGgubWF4KDIgKiByb290LnIgLyB3LCAyICogcm9vdC5yIC8gaCkpO1xuICAgICAgcmV0dXJuIG5vZGVzO1xuICAgIH1cbiAgICBwYWNrLnNpemUgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBzaXplO1xuICAgICAgc2l6ZSA9IF87XG4gICAgICByZXR1cm4gcGFjaztcbiAgICB9O1xuICAgIHBhY2sucmFkaXVzID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcmFkaXVzO1xuICAgICAgcmFkaXVzID0gXyA9PSBudWxsIHx8IHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIgPyBfIDogK187XG4gICAgICByZXR1cm4gcGFjaztcbiAgICB9O1xuICAgIHBhY2sucGFkZGluZyA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHBhZGRpbmc7XG4gICAgICBwYWRkaW5nID0gK187XG4gICAgICByZXR1cm4gcGFjaztcbiAgICB9O1xuICAgIHJldHVybiBkM19sYXlvdXRfaGllcmFyY2h5UmViaW5kKHBhY2ssIGhpZXJhcmNoeSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9wYWNrU29ydChhLCBiKSB7XG4gICAgcmV0dXJuIGEudmFsdWUgLSBiLnZhbHVlO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9wYWNrSW5zZXJ0KGEsIGIpIHtcbiAgICB2YXIgYyA9IGEuX3BhY2tfbmV4dDtcbiAgICBhLl9wYWNrX25leHQgPSBiO1xuICAgIGIuX3BhY2tfcHJldiA9IGE7XG4gICAgYi5fcGFja19uZXh0ID0gYztcbiAgICBjLl9wYWNrX3ByZXYgPSBiO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9wYWNrU3BsaWNlKGEsIGIpIHtcbiAgICBhLl9wYWNrX25leHQgPSBiO1xuICAgIGIuX3BhY2tfcHJldiA9IGE7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3BhY2tJbnRlcnNlY3RzKGEsIGIpIHtcbiAgICB2YXIgZHggPSBiLnggLSBhLngsIGR5ID0gYi55IC0gYS55LCBkciA9IGEuciArIGIucjtcbiAgICByZXR1cm4gLjk5OSAqIGRyICogZHIgPiBkeCAqIGR4ICsgZHkgKiBkeTtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfcGFja1NpYmxpbmdzKG5vZGUpIHtcbiAgICBpZiAoIShub2RlcyA9IG5vZGUuY2hpbGRyZW4pIHx8ICEobiA9IG5vZGVzLmxlbmd0aCkpIHJldHVybjtcbiAgICB2YXIgbm9kZXMsIHhNaW4gPSBJbmZpbml0eSwgeE1heCA9IC1JbmZpbml0eSwgeU1pbiA9IEluZmluaXR5LCB5TWF4ID0gLUluZmluaXR5LCBhLCBiLCBjLCBpLCBqLCBrLCBuO1xuICAgIGZ1bmN0aW9uIGJvdW5kKG5vZGUpIHtcbiAgICAgIHhNaW4gPSBNYXRoLm1pbihub2RlLnggLSBub2RlLnIsIHhNaW4pO1xuICAgICAgeE1heCA9IE1hdGgubWF4KG5vZGUueCArIG5vZGUuciwgeE1heCk7XG4gICAgICB5TWluID0gTWF0aC5taW4obm9kZS55IC0gbm9kZS5yLCB5TWluKTtcbiAgICAgIHlNYXggPSBNYXRoLm1heChub2RlLnkgKyBub2RlLnIsIHlNYXgpO1xuICAgIH1cbiAgICBub2Rlcy5mb3JFYWNoKGQzX2xheW91dF9wYWNrTGluayk7XG4gICAgYSA9IG5vZGVzWzBdO1xuICAgIGEueCA9IC1hLnI7XG4gICAgYS55ID0gMDtcbiAgICBib3VuZChhKTtcbiAgICBpZiAobiA+IDEpIHtcbiAgICAgIGIgPSBub2Rlc1sxXTtcbiAgICAgIGIueCA9IGIucjtcbiAgICAgIGIueSA9IDA7XG4gICAgICBib3VuZChiKTtcbiAgICAgIGlmIChuID4gMikge1xuICAgICAgICBjID0gbm9kZXNbMl07XG4gICAgICAgIGQzX2xheW91dF9wYWNrUGxhY2UoYSwgYiwgYyk7XG4gICAgICAgIGJvdW5kKGMpO1xuICAgICAgICBkM19sYXlvdXRfcGFja0luc2VydChhLCBjKTtcbiAgICAgICAgYS5fcGFja19wcmV2ID0gYztcbiAgICAgICAgZDNfbGF5b3V0X3BhY2tJbnNlcnQoYywgYik7XG4gICAgICAgIGIgPSBhLl9wYWNrX25leHQ7XG4gICAgICAgIGZvciAoaSA9IDM7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgICBkM19sYXlvdXRfcGFja1BsYWNlKGEsIGIsIGMgPSBub2Rlc1tpXSk7XG4gICAgICAgICAgdmFyIGlzZWN0ID0gMCwgczEgPSAxLCBzMiA9IDE7XG4gICAgICAgICAgZm9yIChqID0gYi5fcGFja19uZXh0OyBqICE9PSBiOyBqID0gai5fcGFja19uZXh0LCBzMSsrKSB7XG4gICAgICAgICAgICBpZiAoZDNfbGF5b3V0X3BhY2tJbnRlcnNlY3RzKGosIGMpKSB7XG4gICAgICAgICAgICAgIGlzZWN0ID0gMTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChpc2VjdCA9PSAxKSB7XG4gICAgICAgICAgICBmb3IgKGsgPSBhLl9wYWNrX3ByZXY7IGsgIT09IGouX3BhY2tfcHJldjsgayA9IGsuX3BhY2tfcHJldiwgczIrKykge1xuICAgICAgICAgICAgICBpZiAoZDNfbGF5b3V0X3BhY2tJbnRlcnNlY3RzKGssIGMpKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlzZWN0KSB7XG4gICAgICAgICAgICBpZiAoczEgPCBzMiB8fCBzMSA9PSBzMiAmJiBiLnIgPCBhLnIpIGQzX2xheW91dF9wYWNrU3BsaWNlKGEsIGIgPSBqKTsgZWxzZSBkM19sYXlvdXRfcGFja1NwbGljZShhID0gaywgYik7XG4gICAgICAgICAgICBpLS07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGQzX2xheW91dF9wYWNrSW5zZXJ0KGEsIGMpO1xuICAgICAgICAgICAgYiA9IGM7XG4gICAgICAgICAgICBib3VuZChjKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdmFyIGN4ID0gKHhNaW4gKyB4TWF4KSAvIDIsIGN5ID0gKHlNaW4gKyB5TWF4KSAvIDIsIGNyID0gMDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgaSsrKSB7XG4gICAgICBjID0gbm9kZXNbaV07XG4gICAgICBjLnggLT0gY3g7XG4gICAgICBjLnkgLT0gY3k7XG4gICAgICBjciA9IE1hdGgubWF4KGNyLCBjLnIgKyBNYXRoLnNxcnQoYy54ICogYy54ICsgYy55ICogYy55KSk7XG4gICAgfVxuICAgIG5vZGUuciA9IGNyO1xuICAgIG5vZGVzLmZvckVhY2goZDNfbGF5b3V0X3BhY2tVbmxpbmspO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9wYWNrTGluayhub2RlKSB7XG4gICAgbm9kZS5fcGFja19uZXh0ID0gbm9kZS5fcGFja19wcmV2ID0gbm9kZTtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfcGFja1VubGluayhub2RlKSB7XG4gICAgZGVsZXRlIG5vZGUuX3BhY2tfbmV4dDtcbiAgICBkZWxldGUgbm9kZS5fcGFja19wcmV2O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9wYWNrVHJhbnNmb3JtKG5vZGUsIHgsIHksIGspIHtcbiAgICB2YXIgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xuICAgIG5vZGUueCA9IHggKz0gayAqIG5vZGUueDtcbiAgICBub2RlLnkgPSB5ICs9IGsgKiBub2RlLnk7XG4gICAgbm9kZS5yICo9IGs7XG4gICAgaWYgKGNoaWxkcmVuKSB7XG4gICAgICB2YXIgaSA9IC0xLCBuID0gY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGQzX2xheW91dF9wYWNrVHJhbnNmb3JtKGNoaWxkcmVuW2ldLCB4LCB5LCBrKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3BhY2tQbGFjZShhLCBiLCBjKSB7XG4gICAgdmFyIGRiID0gYS5yICsgYy5yLCBkeCA9IGIueCAtIGEueCwgZHkgPSBiLnkgLSBhLnk7XG4gICAgaWYgKGRiICYmIChkeCB8fCBkeSkpIHtcbiAgICAgIHZhciBkYSA9IGIuciArIGMuciwgZGMgPSBkeCAqIGR4ICsgZHkgKiBkeTtcbiAgICAgIGRhICo9IGRhO1xuICAgICAgZGIgKj0gZGI7XG4gICAgICB2YXIgeCA9IC41ICsgKGRiIC0gZGEpIC8gKDIgKiBkYyksIHkgPSBNYXRoLnNxcnQoTWF0aC5tYXgoMCwgMiAqIGRhICogKGRiICsgZGMpIC0gKGRiIC09IGRjKSAqIGRiIC0gZGEgKiBkYSkpIC8gKDIgKiBkYyk7XG4gICAgICBjLnggPSBhLnggKyB4ICogZHggKyB5ICogZHk7XG4gICAgICBjLnkgPSBhLnkgKyB4ICogZHkgLSB5ICogZHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGMueCA9IGEueCArIGRiO1xuICAgICAgYy55ID0gYS55O1xuICAgIH1cbiAgfVxuICBkMy5sYXlvdXQudHJlZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBoaWVyYXJjaHkgPSBkMy5sYXlvdXQuaGllcmFyY2h5KCkuc29ydChudWxsKS52YWx1ZShudWxsKSwgc2VwYXJhdGlvbiA9IGQzX2xheW91dF90cmVlU2VwYXJhdGlvbiwgc2l6ZSA9IFsgMSwgMSBdLCBub2RlU2l6ZSA9IG51bGw7XG4gICAgZnVuY3Rpb24gdHJlZShkLCBpKSB7XG4gICAgICB2YXIgbm9kZXMgPSBoaWVyYXJjaHkuY2FsbCh0aGlzLCBkLCBpKSwgcm9vdDAgPSBub2Rlc1swXSwgcm9vdDEgPSB3cmFwVHJlZShyb290MCk7XG4gICAgICBkM19sYXlvdXRfaGllcmFyY2h5VmlzaXRBZnRlcihyb290MSwgZmlyc3RXYWxrKSwgcm9vdDEucGFyZW50Lm0gPSAtcm9vdDEuejtcbiAgICAgIGQzX2xheW91dF9oaWVyYXJjaHlWaXNpdEJlZm9yZShyb290MSwgc2Vjb25kV2Fsayk7XG4gICAgICBpZiAobm9kZVNpemUpIGQzX2xheW91dF9oaWVyYXJjaHlWaXNpdEJlZm9yZShyb290MCwgc2l6ZU5vZGUpOyBlbHNlIHtcbiAgICAgICAgdmFyIGxlZnQgPSByb290MCwgcmlnaHQgPSByb290MCwgYm90dG9tID0gcm9vdDA7XG4gICAgICAgIGQzX2xheW91dF9oaWVyYXJjaHlWaXNpdEJlZm9yZShyb290MCwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAgIGlmIChub2RlLnggPCBsZWZ0LngpIGxlZnQgPSBub2RlO1xuICAgICAgICAgIGlmIChub2RlLnggPiByaWdodC54KSByaWdodCA9IG5vZGU7XG4gICAgICAgICAgaWYgKG5vZGUuZGVwdGggPiBib3R0b20uZGVwdGgpIGJvdHRvbSA9IG5vZGU7XG4gICAgICAgIH0pO1xuICAgICAgICB2YXIgdHggPSBzZXBhcmF0aW9uKGxlZnQsIHJpZ2h0KSAvIDIgLSBsZWZ0LngsIGt4ID0gc2l6ZVswXSAvIChyaWdodC54ICsgc2VwYXJhdGlvbihyaWdodCwgbGVmdCkgLyAyICsgdHgpLCBreSA9IHNpemVbMV0gLyAoYm90dG9tLmRlcHRoIHx8IDEpO1xuICAgICAgICBkM19sYXlvdXRfaGllcmFyY2h5VmlzaXRCZWZvcmUocm9vdDAsIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgICBub2RlLnggPSAobm9kZS54ICsgdHgpICoga3g7XG4gICAgICAgICAgbm9kZS55ID0gbm9kZS5kZXB0aCAqIGt5O1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBub2RlcztcbiAgICB9XG4gICAgZnVuY3Rpb24gd3JhcFRyZWUocm9vdDApIHtcbiAgICAgIHZhciByb290MSA9IHtcbiAgICAgICAgQTogbnVsbCxcbiAgICAgICAgY2hpbGRyZW46IFsgcm9vdDAgXVxuICAgICAgfSwgcXVldWUgPSBbIHJvb3QxIF0sIG5vZGUxO1xuICAgICAgd2hpbGUgKChub2RlMSA9IHF1ZXVlLnBvcCgpKSAhPSBudWxsKSB7XG4gICAgICAgIGZvciAodmFyIGNoaWxkcmVuID0gbm9kZTEuY2hpbGRyZW4sIGNoaWxkLCBpID0gMCwgbiA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgICAgIHF1ZXVlLnB1c2goKGNoaWxkcmVuW2ldID0gY2hpbGQgPSB7XG4gICAgICAgICAgICBfOiBjaGlsZHJlbltpXSxcbiAgICAgICAgICAgIHBhcmVudDogbm9kZTEsXG4gICAgICAgICAgICBjaGlsZHJlbjogKGNoaWxkID0gY2hpbGRyZW5baV0uY2hpbGRyZW4pICYmIGNoaWxkLnNsaWNlKCkgfHwgW10sXG4gICAgICAgICAgICBBOiBudWxsLFxuICAgICAgICAgICAgYTogbnVsbCxcbiAgICAgICAgICAgIHo6IDAsXG4gICAgICAgICAgICBtOiAwLFxuICAgICAgICAgICAgYzogMCxcbiAgICAgICAgICAgIHM6IDAsXG4gICAgICAgICAgICB0OiBudWxsLFxuICAgICAgICAgICAgaTogaVxuICAgICAgICAgIH0pLmEgPSBjaGlsZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiByb290MS5jaGlsZHJlblswXTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZmlyc3RXYWxrKHYpIHtcbiAgICAgIHZhciBjaGlsZHJlbiA9IHYuY2hpbGRyZW4sIHNpYmxpbmdzID0gdi5wYXJlbnQuY2hpbGRyZW4sIHcgPSB2LmkgPyBzaWJsaW5nc1t2LmkgLSAxXSA6IG51bGw7XG4gICAgICBpZiAoY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgIGQzX2xheW91dF90cmVlU2hpZnQodik7XG4gICAgICAgIHZhciBtaWRwb2ludCA9IChjaGlsZHJlblswXS56ICsgY2hpbGRyZW5bY2hpbGRyZW4ubGVuZ3RoIC0gMV0ueikgLyAyO1xuICAgICAgICBpZiAodykge1xuICAgICAgICAgIHYueiA9IHcueiArIHNlcGFyYXRpb24odi5fLCB3Ll8pO1xuICAgICAgICAgIHYubSA9IHYueiAtIG1pZHBvaW50O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHYueiA9IG1pZHBvaW50O1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHcpIHtcbiAgICAgICAgdi56ID0gdy56ICsgc2VwYXJhdGlvbih2Ll8sIHcuXyk7XG4gICAgICB9XG4gICAgICB2LnBhcmVudC5BID0gYXBwb3J0aW9uKHYsIHcsIHYucGFyZW50LkEgfHwgc2libGluZ3NbMF0pO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzZWNvbmRXYWxrKHYpIHtcbiAgICAgIHYuXy54ID0gdi56ICsgdi5wYXJlbnQubTtcbiAgICAgIHYubSArPSB2LnBhcmVudC5tO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhcHBvcnRpb24odiwgdywgYW5jZXN0b3IpIHtcbiAgICAgIGlmICh3KSB7XG4gICAgICAgIHZhciB2aXAgPSB2LCB2b3AgPSB2LCB2aW0gPSB3LCB2b20gPSB2aXAucGFyZW50LmNoaWxkcmVuWzBdLCBzaXAgPSB2aXAubSwgc29wID0gdm9wLm0sIHNpbSA9IHZpbS5tLCBzb20gPSB2b20ubSwgc2hpZnQ7XG4gICAgICAgIHdoaWxlICh2aW0gPSBkM19sYXlvdXRfdHJlZVJpZ2h0KHZpbSksIHZpcCA9IGQzX2xheW91dF90cmVlTGVmdCh2aXApLCB2aW0gJiYgdmlwKSB7XG4gICAgICAgICAgdm9tID0gZDNfbGF5b3V0X3RyZWVMZWZ0KHZvbSk7XG4gICAgICAgICAgdm9wID0gZDNfbGF5b3V0X3RyZWVSaWdodCh2b3ApO1xuICAgICAgICAgIHZvcC5hID0gdjtcbiAgICAgICAgICBzaGlmdCA9IHZpbS56ICsgc2ltIC0gdmlwLnogLSBzaXAgKyBzZXBhcmF0aW9uKHZpbS5fLCB2aXAuXyk7XG4gICAgICAgICAgaWYgKHNoaWZ0ID4gMCkge1xuICAgICAgICAgICAgZDNfbGF5b3V0X3RyZWVNb3ZlKGQzX2xheW91dF90cmVlQW5jZXN0b3IodmltLCB2LCBhbmNlc3RvciksIHYsIHNoaWZ0KTtcbiAgICAgICAgICAgIHNpcCArPSBzaGlmdDtcbiAgICAgICAgICAgIHNvcCArPSBzaGlmdDtcbiAgICAgICAgICB9XG4gICAgICAgICAgc2ltICs9IHZpbS5tO1xuICAgICAgICAgIHNpcCArPSB2aXAubTtcbiAgICAgICAgICBzb20gKz0gdm9tLm07XG4gICAgICAgICAgc29wICs9IHZvcC5tO1xuICAgICAgICB9XG4gICAgICAgIGlmICh2aW0gJiYgIWQzX2xheW91dF90cmVlUmlnaHQodm9wKSkge1xuICAgICAgICAgIHZvcC50ID0gdmltO1xuICAgICAgICAgIHZvcC5tICs9IHNpbSAtIHNvcDtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmlwICYmICFkM19sYXlvdXRfdHJlZUxlZnQodm9tKSkge1xuICAgICAgICAgIHZvbS50ID0gdmlwO1xuICAgICAgICAgIHZvbS5tICs9IHNpcCAtIHNvbTtcbiAgICAgICAgICBhbmNlc3RvciA9IHY7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBhbmNlc3RvcjtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2l6ZU5vZGUobm9kZSkge1xuICAgICAgbm9kZS54ICo9IHNpemVbMF07XG4gICAgICBub2RlLnkgPSBub2RlLmRlcHRoICogc2l6ZVsxXTtcbiAgICB9XG4gICAgdHJlZS5zZXBhcmF0aW9uID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc2VwYXJhdGlvbjtcbiAgICAgIHNlcGFyYXRpb24gPSB4O1xuICAgICAgcmV0dXJuIHRyZWU7XG4gICAgfTtcbiAgICB0cmVlLnNpemUgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBub2RlU2l6ZSA/IG51bGwgOiBzaXplO1xuICAgICAgbm9kZVNpemUgPSAoc2l6ZSA9IHgpID09IG51bGwgPyBzaXplTm9kZSA6IG51bGw7XG4gICAgICByZXR1cm4gdHJlZTtcbiAgICB9O1xuICAgIHRyZWUubm9kZVNpemUgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBub2RlU2l6ZSA/IHNpemUgOiBudWxsO1xuICAgICAgbm9kZVNpemUgPSAoc2l6ZSA9IHgpID09IG51bGwgPyBudWxsIDogc2l6ZU5vZGU7XG4gICAgICByZXR1cm4gdHJlZTtcbiAgICB9O1xuICAgIHJldHVybiBkM19sYXlvdXRfaGllcmFyY2h5UmViaW5kKHRyZWUsIGhpZXJhcmNoeSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX2xheW91dF90cmVlU2VwYXJhdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGEucGFyZW50ID09IGIucGFyZW50ID8gMSA6IDI7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3RyZWVMZWZ0KHYpIHtcbiAgICB2YXIgY2hpbGRyZW4gPSB2LmNoaWxkcmVuO1xuICAgIHJldHVybiBjaGlsZHJlbi5sZW5ndGggPyBjaGlsZHJlblswXSA6IHYudDtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfdHJlZVJpZ2h0KHYpIHtcbiAgICB2YXIgY2hpbGRyZW4gPSB2LmNoaWxkcmVuLCBuO1xuICAgIHJldHVybiAobiA9IGNoaWxkcmVuLmxlbmd0aCkgPyBjaGlsZHJlbltuIC0gMV0gOiB2LnQ7XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3RyZWVNb3ZlKHdtLCB3cCwgc2hpZnQpIHtcbiAgICB2YXIgY2hhbmdlID0gc2hpZnQgLyAod3AuaSAtIHdtLmkpO1xuICAgIHdwLmMgLT0gY2hhbmdlO1xuICAgIHdwLnMgKz0gc2hpZnQ7XG4gICAgd20uYyArPSBjaGFuZ2U7XG4gICAgd3AueiArPSBzaGlmdDtcbiAgICB3cC5tICs9IHNoaWZ0O1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF90cmVlU2hpZnQodikge1xuICAgIHZhciBzaGlmdCA9IDAsIGNoYW5nZSA9IDAsIGNoaWxkcmVuID0gdi5jaGlsZHJlbiwgaSA9IGNoaWxkcmVuLmxlbmd0aCwgdztcbiAgICB3aGlsZSAoLS1pID49IDApIHtcbiAgICAgIHcgPSBjaGlsZHJlbltpXTtcbiAgICAgIHcueiArPSBzaGlmdDtcbiAgICAgIHcubSArPSBzaGlmdDtcbiAgICAgIHNoaWZ0ICs9IHcucyArIChjaGFuZ2UgKz0gdy5jKTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3RyZWVBbmNlc3Rvcih2aW0sIHYsIGFuY2VzdG9yKSB7XG4gICAgcmV0dXJuIHZpbS5hLnBhcmVudCA9PT0gdi5wYXJlbnQgPyB2aW0uYSA6IGFuY2VzdG9yO1xuICB9XG4gIGQzLmxheW91dC5jbHVzdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGhpZXJhcmNoeSA9IGQzLmxheW91dC5oaWVyYXJjaHkoKS5zb3J0KG51bGwpLnZhbHVlKG51bGwpLCBzZXBhcmF0aW9uID0gZDNfbGF5b3V0X3RyZWVTZXBhcmF0aW9uLCBzaXplID0gWyAxLCAxIF0sIG5vZGVTaXplID0gZmFsc2U7XG4gICAgZnVuY3Rpb24gY2x1c3RlcihkLCBpKSB7XG4gICAgICB2YXIgbm9kZXMgPSBoaWVyYXJjaHkuY2FsbCh0aGlzLCBkLCBpKSwgcm9vdCA9IG5vZGVzWzBdLCBwcmV2aW91c05vZGUsIHggPSAwO1xuICAgICAgZDNfbGF5b3V0X2hpZXJhcmNoeVZpc2l0QWZ0ZXIocm9vdCwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICB2YXIgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xuICAgICAgICBpZiAoY2hpbGRyZW4gJiYgY2hpbGRyZW4ubGVuZ3RoKSB7XG4gICAgICAgICAgbm9kZS54ID0gZDNfbGF5b3V0X2NsdXN0ZXJYKGNoaWxkcmVuKTtcbiAgICAgICAgICBub2RlLnkgPSBkM19sYXlvdXRfY2x1c3RlclkoY2hpbGRyZW4pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5vZGUueCA9IHByZXZpb3VzTm9kZSA/IHggKz0gc2VwYXJhdGlvbihub2RlLCBwcmV2aW91c05vZGUpIDogMDtcbiAgICAgICAgICBub2RlLnkgPSAwO1xuICAgICAgICAgIHByZXZpb3VzTm9kZSA9IG5vZGU7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdmFyIGxlZnQgPSBkM19sYXlvdXRfY2x1c3RlckxlZnQocm9vdCksIHJpZ2h0ID0gZDNfbGF5b3V0X2NsdXN0ZXJSaWdodChyb290KSwgeDAgPSBsZWZ0LnggLSBzZXBhcmF0aW9uKGxlZnQsIHJpZ2h0KSAvIDIsIHgxID0gcmlnaHQueCArIHNlcGFyYXRpb24ocmlnaHQsIGxlZnQpIC8gMjtcbiAgICAgIGQzX2xheW91dF9oaWVyYXJjaHlWaXNpdEFmdGVyKHJvb3QsIG5vZGVTaXplID8gZnVuY3Rpb24obm9kZSkge1xuICAgICAgICBub2RlLnggPSAobm9kZS54IC0gcm9vdC54KSAqIHNpemVbMF07XG4gICAgICAgIG5vZGUueSA9IChyb290LnkgLSBub2RlLnkpICogc2l6ZVsxXTtcbiAgICAgIH0gOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgIG5vZGUueCA9IChub2RlLnggLSB4MCkgLyAoeDEgLSB4MCkgKiBzaXplWzBdO1xuICAgICAgICBub2RlLnkgPSAoMSAtIChyb290LnkgPyBub2RlLnkgLyByb290LnkgOiAxKSkgKiBzaXplWzFdO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gbm9kZXM7XG4gICAgfVxuICAgIGNsdXN0ZXIuc2VwYXJhdGlvbiA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNlcGFyYXRpb247XG4gICAgICBzZXBhcmF0aW9uID0geDtcbiAgICAgIHJldHVybiBjbHVzdGVyO1xuICAgIH07XG4gICAgY2x1c3Rlci5zaXplID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbm9kZVNpemUgPyBudWxsIDogc2l6ZTtcbiAgICAgIG5vZGVTaXplID0gKHNpemUgPSB4KSA9PSBudWxsO1xuICAgICAgcmV0dXJuIGNsdXN0ZXI7XG4gICAgfTtcbiAgICBjbHVzdGVyLm5vZGVTaXplID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbm9kZVNpemUgPyBzaXplIDogbnVsbDtcbiAgICAgIG5vZGVTaXplID0gKHNpemUgPSB4KSAhPSBudWxsO1xuICAgICAgcmV0dXJuIGNsdXN0ZXI7XG4gICAgfTtcbiAgICByZXR1cm4gZDNfbGF5b3V0X2hpZXJhcmNoeVJlYmluZChjbHVzdGVyLCBoaWVyYXJjaHkpO1xuICB9O1xuICBmdW5jdGlvbiBkM19sYXlvdXRfY2x1c3RlclkoY2hpbGRyZW4pIHtcbiAgICByZXR1cm4gMSArIGQzLm1heChjaGlsZHJlbiwgZnVuY3Rpb24oY2hpbGQpIHtcbiAgICAgIHJldHVybiBjaGlsZC55O1xuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9jbHVzdGVyWChjaGlsZHJlbikge1xuICAgIHJldHVybiBjaGlsZHJlbi5yZWR1Y2UoZnVuY3Rpb24oeCwgY2hpbGQpIHtcbiAgICAgIHJldHVybiB4ICsgY2hpbGQueDtcbiAgICB9LCAwKSAvIGNoaWxkcmVuLmxlbmd0aDtcbiAgfVxuICBmdW5jdGlvbiBkM19sYXlvdXRfY2x1c3RlckxlZnQobm9kZSkge1xuICAgIHZhciBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW47XG4gICAgcmV0dXJuIGNoaWxkcmVuICYmIGNoaWxkcmVuLmxlbmd0aCA/IGQzX2xheW91dF9jbHVzdGVyTGVmdChjaGlsZHJlblswXSkgOiBub2RlO1xuICB9XG4gIGZ1bmN0aW9uIGQzX2xheW91dF9jbHVzdGVyUmlnaHQobm9kZSkge1xuICAgIHZhciBjaGlsZHJlbiA9IG5vZGUuY2hpbGRyZW4sIG47XG4gICAgcmV0dXJuIGNoaWxkcmVuICYmIChuID0gY2hpbGRyZW4ubGVuZ3RoKSA/IGQzX2xheW91dF9jbHVzdGVyUmlnaHQoY2hpbGRyZW5bbiAtIDFdKSA6IG5vZGU7XG4gIH1cbiAgZDMubGF5b3V0LnRyZWVtYXAgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgaGllcmFyY2h5ID0gZDMubGF5b3V0LmhpZXJhcmNoeSgpLCByb3VuZCA9IE1hdGgucm91bmQsIHNpemUgPSBbIDEsIDEgXSwgcGFkZGluZyA9IG51bGwsIHBhZCA9IGQzX2xheW91dF90cmVlbWFwUGFkTnVsbCwgc3RpY2t5ID0gZmFsc2UsIHN0aWNraWVzLCBtb2RlID0gXCJzcXVhcmlmeVwiLCByYXRpbyA9IC41ICogKDEgKyBNYXRoLnNxcnQoNSkpO1xuICAgIGZ1bmN0aW9uIHNjYWxlKGNoaWxkcmVuLCBrKSB7XG4gICAgICB2YXIgaSA9IC0xLCBuID0gY2hpbGRyZW4ubGVuZ3RoLCBjaGlsZCwgYXJlYTtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgIGFyZWEgPSAoY2hpbGQgPSBjaGlsZHJlbltpXSkudmFsdWUgKiAoayA8IDAgPyAwIDogayk7XG4gICAgICAgIGNoaWxkLmFyZWEgPSBpc05hTihhcmVhKSB8fCBhcmVhIDw9IDAgPyAwIDogYXJlYTtcbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gc3F1YXJpZnkobm9kZSkge1xuICAgICAgdmFyIGNoaWxkcmVuID0gbm9kZS5jaGlsZHJlbjtcbiAgICAgIGlmIChjaGlsZHJlbiAmJiBjaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgdmFyIHJlY3QgPSBwYWQobm9kZSksIHJvdyA9IFtdLCByZW1haW5pbmcgPSBjaGlsZHJlbi5zbGljZSgpLCBjaGlsZCwgYmVzdCA9IEluZmluaXR5LCBzY29yZSwgdSA9IG1vZGUgPT09IFwic2xpY2VcIiA/IHJlY3QuZHggOiBtb2RlID09PSBcImRpY2VcIiA/IHJlY3QuZHkgOiBtb2RlID09PSBcInNsaWNlLWRpY2VcIiA/IG5vZGUuZGVwdGggJiAxID8gcmVjdC5keSA6IHJlY3QuZHggOiBNYXRoLm1pbihyZWN0LmR4LCByZWN0LmR5KSwgbjtcbiAgICAgICAgc2NhbGUocmVtYWluaW5nLCByZWN0LmR4ICogcmVjdC5keSAvIG5vZGUudmFsdWUpO1xuICAgICAgICByb3cuYXJlYSA9IDA7XG4gICAgICAgIHdoaWxlICgobiA9IHJlbWFpbmluZy5sZW5ndGgpID4gMCkge1xuICAgICAgICAgIHJvdy5wdXNoKGNoaWxkID0gcmVtYWluaW5nW24gLSAxXSk7XG4gICAgICAgICAgcm93LmFyZWEgKz0gY2hpbGQuYXJlYTtcbiAgICAgICAgICBpZiAobW9kZSAhPT0gXCJzcXVhcmlmeVwiIHx8IChzY29yZSA9IHdvcnN0KHJvdywgdSkpIDw9IGJlc3QpIHtcbiAgICAgICAgICAgIHJlbWFpbmluZy5wb3AoKTtcbiAgICAgICAgICAgIGJlc3QgPSBzY29yZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcm93LmFyZWEgLT0gcm93LnBvcCgpLmFyZWE7XG4gICAgICAgICAgICBwb3NpdGlvbihyb3csIHUsIHJlY3QsIGZhbHNlKTtcbiAgICAgICAgICAgIHUgPSBNYXRoLm1pbihyZWN0LmR4LCByZWN0LmR5KTtcbiAgICAgICAgICAgIHJvdy5sZW5ndGggPSByb3cuYXJlYSA9IDA7XG4gICAgICAgICAgICBiZXN0ID0gSW5maW5pdHk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChyb3cubGVuZ3RoKSB7XG4gICAgICAgICAgcG9zaXRpb24ocm93LCB1LCByZWN0LCB0cnVlKTtcbiAgICAgICAgICByb3cubGVuZ3RoID0gcm93LmFyZWEgPSAwO1xuICAgICAgICB9XG4gICAgICAgIGNoaWxkcmVuLmZvckVhY2goc3F1YXJpZnkpO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBzdGlja2lmeShub2RlKSB7XG4gICAgICB2YXIgY2hpbGRyZW4gPSBub2RlLmNoaWxkcmVuO1xuICAgICAgaWYgKGNoaWxkcmVuICYmIGNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICB2YXIgcmVjdCA9IHBhZChub2RlKSwgcmVtYWluaW5nID0gY2hpbGRyZW4uc2xpY2UoKSwgY2hpbGQsIHJvdyA9IFtdO1xuICAgICAgICBzY2FsZShyZW1haW5pbmcsIHJlY3QuZHggKiByZWN0LmR5IC8gbm9kZS52YWx1ZSk7XG4gICAgICAgIHJvdy5hcmVhID0gMDtcbiAgICAgICAgd2hpbGUgKGNoaWxkID0gcmVtYWluaW5nLnBvcCgpKSB7XG4gICAgICAgICAgcm93LnB1c2goY2hpbGQpO1xuICAgICAgICAgIHJvdy5hcmVhICs9IGNoaWxkLmFyZWE7XG4gICAgICAgICAgaWYgKGNoaWxkLnogIT0gbnVsbCkge1xuICAgICAgICAgICAgcG9zaXRpb24ocm93LCBjaGlsZC56ID8gcmVjdC5keCA6IHJlY3QuZHksIHJlY3QsICFyZW1haW5pbmcubGVuZ3RoKTtcbiAgICAgICAgICAgIHJvdy5sZW5ndGggPSByb3cuYXJlYSA9IDA7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNoaWxkcmVuLmZvckVhY2goc3RpY2tpZnkpO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiB3b3JzdChyb3csIHUpIHtcbiAgICAgIHZhciBzID0gcm93LmFyZWEsIHIsIHJtYXggPSAwLCBybWluID0gSW5maW5pdHksIGkgPSAtMSwgbiA9IHJvdy5sZW5ndGg7XG4gICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICBpZiAoIShyID0gcm93W2ldLmFyZWEpKSBjb250aW51ZTtcbiAgICAgICAgaWYgKHIgPCBybWluKSBybWluID0gcjtcbiAgICAgICAgaWYgKHIgPiBybWF4KSBybWF4ID0gcjtcbiAgICAgIH1cbiAgICAgIHMgKj0gcztcbiAgICAgIHUgKj0gdTtcbiAgICAgIHJldHVybiBzID8gTWF0aC5tYXgodSAqIHJtYXggKiByYXRpbyAvIHMsIHMgLyAodSAqIHJtaW4gKiByYXRpbykpIDogSW5maW5pdHk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHBvc2l0aW9uKHJvdywgdSwgcmVjdCwgZmx1c2gpIHtcbiAgICAgIHZhciBpID0gLTEsIG4gPSByb3cubGVuZ3RoLCB4ID0gcmVjdC54LCB5ID0gcmVjdC55LCB2ID0gdSA/IHJvdW5kKHJvdy5hcmVhIC8gdSkgOiAwLCBvO1xuICAgICAgaWYgKHUgPT0gcmVjdC5keCkge1xuICAgICAgICBpZiAoZmx1c2ggfHwgdiA+IHJlY3QuZHkpIHYgPSByZWN0LmR5O1xuICAgICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICAgIG8gPSByb3dbaV07XG4gICAgICAgICAgby54ID0geDtcbiAgICAgICAgICBvLnkgPSB5O1xuICAgICAgICAgIG8uZHkgPSB2O1xuICAgICAgICAgIHggKz0gby5keCA9IE1hdGgubWluKHJlY3QueCArIHJlY3QuZHggLSB4LCB2ID8gcm91bmQoby5hcmVhIC8gdikgOiAwKTtcbiAgICAgICAgfVxuICAgICAgICBvLnogPSB0cnVlO1xuICAgICAgICBvLmR4ICs9IHJlY3QueCArIHJlY3QuZHggLSB4O1xuICAgICAgICByZWN0LnkgKz0gdjtcbiAgICAgICAgcmVjdC5keSAtPSB2O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZsdXNoIHx8IHYgPiByZWN0LmR4KSB2ID0gcmVjdC5keDtcbiAgICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgICBvID0gcm93W2ldO1xuICAgICAgICAgIG8ueCA9IHg7XG4gICAgICAgICAgby55ID0geTtcbiAgICAgICAgICBvLmR4ID0gdjtcbiAgICAgICAgICB5ICs9IG8uZHkgPSBNYXRoLm1pbihyZWN0LnkgKyByZWN0LmR5IC0geSwgdiA/IHJvdW5kKG8uYXJlYSAvIHYpIDogMCk7XG4gICAgICAgIH1cbiAgICAgICAgby56ID0gZmFsc2U7XG4gICAgICAgIG8uZHkgKz0gcmVjdC55ICsgcmVjdC5keSAtIHk7XG4gICAgICAgIHJlY3QueCArPSB2O1xuICAgICAgICByZWN0LmR4IC09IHY7XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRyZWVtYXAoZCkge1xuICAgICAgdmFyIG5vZGVzID0gc3RpY2tpZXMgfHwgaGllcmFyY2h5KGQpLCByb290ID0gbm9kZXNbMF07XG4gICAgICByb290LnggPSAwO1xuICAgICAgcm9vdC55ID0gMDtcbiAgICAgIHJvb3QuZHggPSBzaXplWzBdO1xuICAgICAgcm9vdC5keSA9IHNpemVbMV07XG4gICAgICBpZiAoc3RpY2tpZXMpIGhpZXJhcmNoeS5yZXZhbHVlKHJvb3QpO1xuICAgICAgc2NhbGUoWyByb290IF0sIHJvb3QuZHggKiByb290LmR5IC8gcm9vdC52YWx1ZSk7XG4gICAgICAoc3RpY2tpZXMgPyBzdGlja2lmeSA6IHNxdWFyaWZ5KShyb290KTtcbiAgICAgIGlmIChzdGlja3kpIHN0aWNraWVzID0gbm9kZXM7XG4gICAgICByZXR1cm4gbm9kZXM7XG4gICAgfVxuICAgIHRyZWVtYXAuc2l6ZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNpemU7XG4gICAgICBzaXplID0geDtcbiAgICAgIHJldHVybiB0cmVlbWFwO1xuICAgIH07XG4gICAgdHJlZW1hcC5wYWRkaW5nID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcGFkZGluZztcbiAgICAgIGZ1bmN0aW9uIHBhZEZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgICAgdmFyIHAgPSB4LmNhbGwodHJlZW1hcCwgbm9kZSwgbm9kZS5kZXB0aCk7XG4gICAgICAgIHJldHVybiBwID09IG51bGwgPyBkM19sYXlvdXRfdHJlZW1hcFBhZE51bGwobm9kZSkgOiBkM19sYXlvdXRfdHJlZW1hcFBhZChub2RlLCB0eXBlb2YgcCA9PT0gXCJudW1iZXJcIiA/IFsgcCwgcCwgcCwgcCBdIDogcCk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBwYWRDb25zdGFudChub2RlKSB7XG4gICAgICAgIHJldHVybiBkM19sYXlvdXRfdHJlZW1hcFBhZChub2RlLCB4KTtcbiAgICAgIH1cbiAgICAgIHZhciB0eXBlO1xuICAgICAgcGFkID0gKHBhZGRpbmcgPSB4KSA9PSBudWxsID8gZDNfbGF5b3V0X3RyZWVtYXBQYWROdWxsIDogKHR5cGUgPSB0eXBlb2YgeCkgPT09IFwiZnVuY3Rpb25cIiA/IHBhZEZ1bmN0aW9uIDogdHlwZSA9PT0gXCJudW1iZXJcIiA/ICh4ID0gWyB4LCB4LCB4LCB4IF0sIFxuICAgICAgcGFkQ29uc3RhbnQpIDogcGFkQ29uc3RhbnQ7XG4gICAgICByZXR1cm4gdHJlZW1hcDtcbiAgICB9O1xuICAgIHRyZWVtYXAucm91bmQgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiByb3VuZCAhPSBOdW1iZXI7XG4gICAgICByb3VuZCA9IHggPyBNYXRoLnJvdW5kIDogTnVtYmVyO1xuICAgICAgcmV0dXJuIHRyZWVtYXA7XG4gICAgfTtcbiAgICB0cmVlbWFwLnN0aWNreSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHN0aWNreTtcbiAgICAgIHN0aWNreSA9IHg7XG4gICAgICBzdGlja2llcyA9IG51bGw7XG4gICAgICByZXR1cm4gdHJlZW1hcDtcbiAgICB9O1xuICAgIHRyZWVtYXAucmF0aW8gPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiByYXRpbztcbiAgICAgIHJhdGlvID0geDtcbiAgICAgIHJldHVybiB0cmVlbWFwO1xuICAgIH07XG4gICAgdHJlZW1hcC5tb2RlID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbW9kZTtcbiAgICAgIG1vZGUgPSB4ICsgXCJcIjtcbiAgICAgIHJldHVybiB0cmVlbWFwO1xuICAgIH07XG4gICAgcmV0dXJuIGQzX2xheW91dF9oaWVyYXJjaHlSZWJpbmQodHJlZW1hcCwgaGllcmFyY2h5KTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3RyZWVtYXBQYWROdWxsKG5vZGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgeDogbm9kZS54LFxuICAgICAgeTogbm9kZS55LFxuICAgICAgZHg6IG5vZGUuZHgsXG4gICAgICBkeTogbm9kZS5keVxuICAgIH07XG4gIH1cbiAgZnVuY3Rpb24gZDNfbGF5b3V0X3RyZWVtYXBQYWQobm9kZSwgcGFkZGluZykge1xuICAgIHZhciB4ID0gbm9kZS54ICsgcGFkZGluZ1szXSwgeSA9IG5vZGUueSArIHBhZGRpbmdbMF0sIGR4ID0gbm9kZS5keCAtIHBhZGRpbmdbMV0gLSBwYWRkaW5nWzNdLCBkeSA9IG5vZGUuZHkgLSBwYWRkaW5nWzBdIC0gcGFkZGluZ1syXTtcbiAgICBpZiAoZHggPCAwKSB7XG4gICAgICB4ICs9IGR4IC8gMjtcbiAgICAgIGR4ID0gMDtcbiAgICB9XG4gICAgaWYgKGR5IDwgMCkge1xuICAgICAgeSArPSBkeSAvIDI7XG4gICAgICBkeSA9IDA7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICB4OiB4LFxuICAgICAgeTogeSxcbiAgICAgIGR4OiBkeCxcbiAgICAgIGR5OiBkeVxuICAgIH07XG4gIH1cbiAgZDMucmFuZG9tID0ge1xuICAgIG5vcm1hbDogZnVuY3Rpb24owrUsIM+DKSB7XG4gICAgICB2YXIgbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICBpZiAobiA8IDIpIM+DID0gMTtcbiAgICAgIGlmIChuIDwgMSkgwrUgPSAwO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgeCwgeSwgcjtcbiAgICAgICAgZG8ge1xuICAgICAgICAgIHggPSBNYXRoLnJhbmRvbSgpICogMiAtIDE7XG4gICAgICAgICAgeSA9IE1hdGgucmFuZG9tKCkgKiAyIC0gMTtcbiAgICAgICAgICByID0geCAqIHggKyB5ICogeTtcbiAgICAgICAgfSB3aGlsZSAoIXIgfHwgciA+IDEpO1xuICAgICAgICByZXR1cm4gwrUgKyDPgyAqIHggKiBNYXRoLnNxcnQoLTIgKiBNYXRoLmxvZyhyKSAvIHIpO1xuICAgICAgfTtcbiAgICB9LFxuICAgIGxvZ05vcm1hbDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcmFuZG9tID0gZDMucmFuZG9tLm5vcm1hbC5hcHBseShkMywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZXhwKHJhbmRvbSgpKTtcbiAgICAgIH07XG4gICAgfSxcbiAgICBiYXRlczogZnVuY3Rpb24obSkge1xuICAgICAgdmFyIHJhbmRvbSA9IGQzLnJhbmRvbS5pcndpbkhhbGwobSk7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiByYW5kb20oKSAvIG07XG4gICAgICB9O1xuICAgIH0sXG4gICAgaXJ3aW5IYWxsOiBmdW5jdGlvbihtKSB7XG4gICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIGZvciAodmFyIHMgPSAwLCBqID0gMDsgaiA8IG07IGorKykgcyArPSBNYXRoLnJhbmRvbSgpO1xuICAgICAgICByZXR1cm4gcztcbiAgICAgIH07XG4gICAgfVxuICB9O1xuICBkMy5zY2FsZSA9IHt9O1xuICBmdW5jdGlvbiBkM19zY2FsZUV4dGVudChkb21haW4pIHtcbiAgICB2YXIgc3RhcnQgPSBkb21haW5bMF0sIHN0b3AgPSBkb21haW5bZG9tYWluLmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiBzdGFydCA8IHN0b3AgPyBbIHN0YXJ0LCBzdG9wIF0gOiBbIHN0b3AsIHN0YXJ0IF07XG4gIH1cbiAgZnVuY3Rpb24gZDNfc2NhbGVSYW5nZShzY2FsZSkge1xuICAgIHJldHVybiBzY2FsZS5yYW5nZUV4dGVudCA/IHNjYWxlLnJhbmdlRXh0ZW50KCkgOiBkM19zY2FsZUV4dGVudChzY2FsZS5yYW5nZSgpKTtcbiAgfVxuICBmdW5jdGlvbiBkM19zY2FsZV9iaWxpbmVhcihkb21haW4sIHJhbmdlLCB1bmludGVycG9sYXRlLCBpbnRlcnBvbGF0ZSkge1xuICAgIHZhciB1ID0gdW5pbnRlcnBvbGF0ZShkb21haW5bMF0sIGRvbWFpblsxXSksIGkgPSBpbnRlcnBvbGF0ZShyYW5nZVswXSwgcmFuZ2VbMV0pO1xuICAgIHJldHVybiBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gaSh1KHgpKTtcbiAgICB9O1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NjYWxlX25pY2UoZG9tYWluLCBuaWNlKSB7XG4gICAgdmFyIGkwID0gMCwgaTEgPSBkb21haW4ubGVuZ3RoIC0gMSwgeDAgPSBkb21haW5baTBdLCB4MSA9IGRvbWFpbltpMV0sIGR4O1xuICAgIGlmICh4MSA8IHgwKSB7XG4gICAgICBkeCA9IGkwLCBpMCA9IGkxLCBpMSA9IGR4O1xuICAgICAgZHggPSB4MCwgeDAgPSB4MSwgeDEgPSBkeDtcbiAgICB9XG4gICAgZG9tYWluW2kwXSA9IG5pY2UuZmxvb3IoeDApO1xuICAgIGRvbWFpbltpMV0gPSBuaWNlLmNlaWwoeDEpO1xuICAgIHJldHVybiBkb21haW47XG4gIH1cbiAgZnVuY3Rpb24gZDNfc2NhbGVfbmljZVN0ZXAoc3RlcCkge1xuICAgIHJldHVybiBzdGVwID8ge1xuICAgICAgZmxvb3I6IGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgcmV0dXJuIE1hdGguZmxvb3IoeCAvIHN0ZXApICogc3RlcDtcbiAgICAgIH0sXG4gICAgICBjZWlsOiBmdW5jdGlvbih4KSB7XG4gICAgICAgIHJldHVybiBNYXRoLmNlaWwoeCAvIHN0ZXApICogc3RlcDtcbiAgICAgIH1cbiAgICB9IDogZDNfc2NhbGVfbmljZUlkZW50aXR5O1xuICB9XG4gIHZhciBkM19zY2FsZV9uaWNlSWRlbnRpdHkgPSB7XG4gICAgZmxvb3I6IGQzX2lkZW50aXR5LFxuICAgIGNlaWw6IGQzX2lkZW50aXR5XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NjYWxlX3BvbHlsaW5lYXIoZG9tYWluLCByYW5nZSwgdW5pbnRlcnBvbGF0ZSwgaW50ZXJwb2xhdGUpIHtcbiAgICB2YXIgdSA9IFtdLCBpID0gW10sIGogPSAwLCBrID0gTWF0aC5taW4oZG9tYWluLmxlbmd0aCwgcmFuZ2UubGVuZ3RoKSAtIDE7XG4gICAgaWYgKGRvbWFpbltrXSA8IGRvbWFpblswXSkge1xuICAgICAgZG9tYWluID0gZG9tYWluLnNsaWNlKCkucmV2ZXJzZSgpO1xuICAgICAgcmFuZ2UgPSByYW5nZS5zbGljZSgpLnJldmVyc2UoKTtcbiAgICB9XG4gICAgd2hpbGUgKCsraiA8PSBrKSB7XG4gICAgICB1LnB1c2godW5pbnRlcnBvbGF0ZShkb21haW5baiAtIDFdLCBkb21haW5bal0pKTtcbiAgICAgIGkucHVzaChpbnRlcnBvbGF0ZShyYW5nZVtqIC0gMV0sIHJhbmdlW2pdKSk7XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbih4KSB7XG4gICAgICB2YXIgaiA9IGQzLmJpc2VjdChkb21haW4sIHgsIDEsIGspIC0gMTtcbiAgICAgIHJldHVybiBpW2pdKHVbal0oeCkpO1xuICAgIH07XG4gIH1cbiAgZDMuc2NhbGUubGluZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX3NjYWxlX2xpbmVhcihbIDAsIDEgXSwgWyAwLCAxIF0sIGQzX2ludGVycG9sYXRlLCBmYWxzZSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3NjYWxlX2xpbmVhcihkb21haW4sIHJhbmdlLCBpbnRlcnBvbGF0ZSwgY2xhbXApIHtcbiAgICB2YXIgb3V0cHV0LCBpbnB1dDtcbiAgICBmdW5jdGlvbiByZXNjYWxlKCkge1xuICAgICAgdmFyIGxpbmVhciA9IE1hdGgubWluKGRvbWFpbi5sZW5ndGgsIHJhbmdlLmxlbmd0aCkgPiAyID8gZDNfc2NhbGVfcG9seWxpbmVhciA6IGQzX3NjYWxlX2JpbGluZWFyLCB1bmludGVycG9sYXRlID0gY2xhbXAgPyBkM191bmludGVycG9sYXRlQ2xhbXAgOiBkM191bmludGVycG9sYXRlTnVtYmVyO1xuICAgICAgb3V0cHV0ID0gbGluZWFyKGRvbWFpbiwgcmFuZ2UsIHVuaW50ZXJwb2xhdGUsIGludGVycG9sYXRlKTtcbiAgICAgIGlucHV0ID0gbGluZWFyKHJhbmdlLCBkb21haW4sIHVuaW50ZXJwb2xhdGUsIGQzX2ludGVycG9sYXRlKTtcbiAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2NhbGUoeCkge1xuICAgICAgcmV0dXJuIG91dHB1dCh4KTtcbiAgICB9XG4gICAgc2NhbGUuaW52ZXJ0ID0gZnVuY3Rpb24oeSkge1xuICAgICAgcmV0dXJuIGlucHV0KHkpO1xuICAgIH07XG4gICAgc2NhbGUuZG9tYWluID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZG9tYWluO1xuICAgICAgZG9tYWluID0geC5tYXAoTnVtYmVyKTtcbiAgICAgIHJldHVybiByZXNjYWxlKCk7XG4gICAgfTtcbiAgICBzY2FsZS5yYW5nZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHJhbmdlO1xuICAgICAgcmFuZ2UgPSB4O1xuICAgICAgcmV0dXJuIHJlc2NhbGUoKTtcbiAgICB9O1xuICAgIHNjYWxlLnJhbmdlUm91bmQgPSBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gc2NhbGUucmFuZ2UoeCkuaW50ZXJwb2xhdGUoZDNfaW50ZXJwb2xhdGVSb3VuZCk7XG4gICAgfTtcbiAgICBzY2FsZS5jbGFtcCA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGNsYW1wO1xuICAgICAgY2xhbXAgPSB4O1xuICAgICAgcmV0dXJuIHJlc2NhbGUoKTtcbiAgICB9O1xuICAgIHNjYWxlLmludGVycG9sYXRlID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gaW50ZXJwb2xhdGU7XG4gICAgICBpbnRlcnBvbGF0ZSA9IHg7XG4gICAgICByZXR1cm4gcmVzY2FsZSgpO1xuICAgIH07XG4gICAgc2NhbGUudGlja3MgPSBmdW5jdGlvbihtKSB7XG4gICAgICByZXR1cm4gZDNfc2NhbGVfbGluZWFyVGlja3MoZG9tYWluLCBtKTtcbiAgICB9O1xuICAgIHNjYWxlLnRpY2tGb3JtYXQgPSBmdW5jdGlvbihtLCBmb3JtYXQpIHtcbiAgICAgIHJldHVybiBkM19zY2FsZV9saW5lYXJUaWNrRm9ybWF0KGRvbWFpbiwgbSwgZm9ybWF0KTtcbiAgICB9O1xuICAgIHNjYWxlLm5pY2UgPSBmdW5jdGlvbihtKSB7XG4gICAgICBkM19zY2FsZV9saW5lYXJOaWNlKGRvbWFpbiwgbSk7XG4gICAgICByZXR1cm4gcmVzY2FsZSgpO1xuICAgIH07XG4gICAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGQzX3NjYWxlX2xpbmVhcihkb21haW4sIHJhbmdlLCBpbnRlcnBvbGF0ZSwgY2xhbXApO1xuICAgIH07XG4gICAgcmV0dXJuIHJlc2NhbGUoKTtcbiAgfVxuICBmdW5jdGlvbiBkM19zY2FsZV9saW5lYXJSZWJpbmQoc2NhbGUsIGxpbmVhcikge1xuICAgIHJldHVybiBkMy5yZWJpbmQoc2NhbGUsIGxpbmVhciwgXCJyYW5nZVwiLCBcInJhbmdlUm91bmRcIiwgXCJpbnRlcnBvbGF0ZVwiLCBcImNsYW1wXCIpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NjYWxlX2xpbmVhck5pY2UoZG9tYWluLCBtKSB7XG4gICAgcmV0dXJuIGQzX3NjYWxlX25pY2UoZG9tYWluLCBkM19zY2FsZV9uaWNlU3RlcChkM19zY2FsZV9saW5lYXJUaWNrUmFuZ2UoZG9tYWluLCBtKVsyXSkpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NjYWxlX2xpbmVhclRpY2tSYW5nZShkb21haW4sIG0pIHtcbiAgICBpZiAobSA9PSBudWxsKSBtID0gMTA7XG4gICAgdmFyIGV4dGVudCA9IGQzX3NjYWxlRXh0ZW50KGRvbWFpbiksIHNwYW4gPSBleHRlbnRbMV0gLSBleHRlbnRbMF0sIHN0ZXAgPSBNYXRoLnBvdygxMCwgTWF0aC5mbG9vcihNYXRoLmxvZyhzcGFuIC8gbSkgLyBNYXRoLkxOMTApKSwgZXJyID0gbSAvIHNwYW4gKiBzdGVwO1xuICAgIGlmIChlcnIgPD0gLjE1KSBzdGVwICo9IDEwOyBlbHNlIGlmIChlcnIgPD0gLjM1KSBzdGVwICo9IDU7IGVsc2UgaWYgKGVyciA8PSAuNzUpIHN0ZXAgKj0gMjtcbiAgICBleHRlbnRbMF0gPSBNYXRoLmNlaWwoZXh0ZW50WzBdIC8gc3RlcCkgKiBzdGVwO1xuICAgIGV4dGVudFsxXSA9IE1hdGguZmxvb3IoZXh0ZW50WzFdIC8gc3RlcCkgKiBzdGVwICsgc3RlcCAqIC41O1xuICAgIGV4dGVudFsyXSA9IHN0ZXA7XG4gICAgcmV0dXJuIGV4dGVudDtcbiAgfVxuICBmdW5jdGlvbiBkM19zY2FsZV9saW5lYXJUaWNrcyhkb21haW4sIG0pIHtcbiAgICByZXR1cm4gZDMucmFuZ2UuYXBwbHkoZDMsIGQzX3NjYWxlX2xpbmVhclRpY2tSYW5nZShkb21haW4sIG0pKTtcbiAgfVxuICBmdW5jdGlvbiBkM19zY2FsZV9saW5lYXJUaWNrRm9ybWF0KGRvbWFpbiwgbSwgZm9ybWF0KSB7XG4gICAgdmFyIHJhbmdlID0gZDNfc2NhbGVfbGluZWFyVGlja1JhbmdlKGRvbWFpbiwgbSk7XG4gICAgaWYgKGZvcm1hdCkge1xuICAgICAgdmFyIG1hdGNoID0gZDNfZm9ybWF0X3JlLmV4ZWMoZm9ybWF0KTtcbiAgICAgIG1hdGNoLnNoaWZ0KCk7XG4gICAgICBpZiAobWF0Y2hbOF0gPT09IFwic1wiKSB7XG4gICAgICAgIHZhciBwcmVmaXggPSBkMy5mb3JtYXRQcmVmaXgoTWF0aC5tYXgoYWJzKHJhbmdlWzBdKSwgYWJzKHJhbmdlWzFdKSkpO1xuICAgICAgICBpZiAoIW1hdGNoWzddKSBtYXRjaFs3XSA9IFwiLlwiICsgZDNfc2NhbGVfbGluZWFyUHJlY2lzaW9uKHByZWZpeC5zY2FsZShyYW5nZVsyXSkpO1xuICAgICAgICBtYXRjaFs4XSA9IFwiZlwiO1xuICAgICAgICBmb3JtYXQgPSBkMy5mb3JtYXQobWF0Y2guam9pbihcIlwiKSk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgcmV0dXJuIGZvcm1hdChwcmVmaXguc2NhbGUoZCkpICsgcHJlZml4LnN5bWJvbDtcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICAgIGlmICghbWF0Y2hbN10pIG1hdGNoWzddID0gXCIuXCIgKyBkM19zY2FsZV9saW5lYXJGb3JtYXRQcmVjaXNpb24obWF0Y2hbOF0sIHJhbmdlKTtcbiAgICAgIGZvcm1hdCA9IG1hdGNoLmpvaW4oXCJcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGZvcm1hdCA9IFwiLC5cIiArIGQzX3NjYWxlX2xpbmVhclByZWNpc2lvbihyYW5nZVsyXSkgKyBcImZcIjtcbiAgICB9XG4gICAgcmV0dXJuIGQzLmZvcm1hdChmb3JtYXQpO1xuICB9XG4gIHZhciBkM19zY2FsZV9saW5lYXJGb3JtYXRTaWduaWZpY2FudCA9IHtcbiAgICBzOiAxLFxuICAgIGc6IDEsXG4gICAgcDogMSxcbiAgICByOiAxLFxuICAgIGU6IDFcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc2NhbGVfbGluZWFyUHJlY2lzaW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIC1NYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4xMCArIC4wMSk7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc2NhbGVfbGluZWFyRm9ybWF0UHJlY2lzaW9uKHR5cGUsIHJhbmdlKSB7XG4gICAgdmFyIHAgPSBkM19zY2FsZV9saW5lYXJQcmVjaXNpb24ocmFuZ2VbMl0pO1xuICAgIHJldHVybiB0eXBlIGluIGQzX3NjYWxlX2xpbmVhckZvcm1hdFNpZ25pZmljYW50ID8gTWF0aC5hYnMocCAtIGQzX3NjYWxlX2xpbmVhclByZWNpc2lvbihNYXRoLm1heChhYnMocmFuZ2VbMF0pLCBhYnMocmFuZ2VbMV0pKSkpICsgKyh0eXBlICE9PSBcImVcIikgOiBwIC0gKHR5cGUgPT09IFwiJVwiKSAqIDI7XG4gIH1cbiAgZDMuc2NhbGUubG9nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX3NjYWxlX2xvZyhkMy5zY2FsZS5saW5lYXIoKS5kb21haW4oWyAwLCAxIF0pLCAxMCwgdHJ1ZSwgWyAxLCAxMCBdKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc2NhbGVfbG9nKGxpbmVhciwgYmFzZSwgcG9zaXRpdmUsIGRvbWFpbikge1xuICAgIGZ1bmN0aW9uIGxvZyh4KSB7XG4gICAgICByZXR1cm4gKHBvc2l0aXZlID8gTWF0aC5sb2coeCA8IDAgPyAwIDogeCkgOiAtTWF0aC5sb2coeCA+IDAgPyAwIDogLXgpKSAvIE1hdGgubG9nKGJhc2UpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBwb3coeCkge1xuICAgICAgcmV0dXJuIHBvc2l0aXZlID8gTWF0aC5wb3coYmFzZSwgeCkgOiAtTWF0aC5wb3coYmFzZSwgLXgpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBzY2FsZSh4KSB7XG4gICAgICByZXR1cm4gbGluZWFyKGxvZyh4KSk7XG4gICAgfVxuICAgIHNjYWxlLmludmVydCA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiBwb3cobGluZWFyLmludmVydCh4KSk7XG4gICAgfTtcbiAgICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBkb21haW47XG4gICAgICBwb3NpdGl2ZSA9IHhbMF0gPj0gMDtcbiAgICAgIGxpbmVhci5kb21haW4oKGRvbWFpbiA9IHgubWFwKE51bWJlcikpLm1hcChsb2cpKTtcbiAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9O1xuICAgIHNjYWxlLmJhc2UgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBiYXNlO1xuICAgICAgYmFzZSA9ICtfO1xuICAgICAgbGluZWFyLmRvbWFpbihkb21haW4ubWFwKGxvZykpO1xuICAgICAgcmV0dXJuIHNjYWxlO1xuICAgIH07XG4gICAgc2NhbGUubmljZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5pY2VkID0gZDNfc2NhbGVfbmljZShkb21haW4ubWFwKGxvZyksIHBvc2l0aXZlID8gTWF0aCA6IGQzX3NjYWxlX2xvZ05pY2VOZWdhdGl2ZSk7XG4gICAgICBsaW5lYXIuZG9tYWluKG5pY2VkKTtcbiAgICAgIGRvbWFpbiA9IG5pY2VkLm1hcChwb3cpO1xuICAgICAgcmV0dXJuIHNjYWxlO1xuICAgIH07XG4gICAgc2NhbGUudGlja3MgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBleHRlbnQgPSBkM19zY2FsZUV4dGVudChkb21haW4pLCB0aWNrcyA9IFtdLCB1ID0gZXh0ZW50WzBdLCB2ID0gZXh0ZW50WzFdLCBpID0gTWF0aC5mbG9vcihsb2codSkpLCBqID0gTWF0aC5jZWlsKGxvZyh2KSksIG4gPSBiYXNlICUgMSA/IDIgOiBiYXNlO1xuICAgICAgaWYgKGlzRmluaXRlKGogLSBpKSkge1xuICAgICAgICBpZiAocG9zaXRpdmUpIHtcbiAgICAgICAgICBmb3IgKDtpIDwgajsgaSsrKSBmb3IgKHZhciBrID0gMTsgayA8IG47IGsrKykgdGlja3MucHVzaChwb3coaSkgKiBrKTtcbiAgICAgICAgICB0aWNrcy5wdXNoKHBvdyhpKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGlja3MucHVzaChwb3coaSkpO1xuICAgICAgICAgIGZvciAoO2krKyA8IGo7ICkgZm9yICh2YXIgayA9IG4gLSAxOyBrID4gMDsgay0tKSB0aWNrcy5wdXNoKHBvdyhpKSAqIGspO1xuICAgICAgICB9XG4gICAgICAgIGZvciAoaSA9IDA7IHRpY2tzW2ldIDwgdTsgaSsrKSB7fVxuICAgICAgICBmb3IgKGogPSB0aWNrcy5sZW5ndGg7IHRpY2tzW2ogLSAxXSA+IHY7IGotLSkge31cbiAgICAgICAgdGlja3MgPSB0aWNrcy5zbGljZShpLCBqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0aWNrcztcbiAgICB9O1xuICAgIHNjYWxlLnRpY2tGb3JtYXQgPSBmdW5jdGlvbihuLCBmb3JtYXQpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGQzX3NjYWxlX2xvZ0Zvcm1hdDtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgZm9ybWF0ID0gZDNfc2NhbGVfbG9nRm9ybWF0OyBlbHNlIGlmICh0eXBlb2YgZm9ybWF0ICE9PSBcImZ1bmN0aW9uXCIpIGZvcm1hdCA9IGQzLmZvcm1hdChmb3JtYXQpO1xuICAgICAgdmFyIGsgPSBNYXRoLm1heCguMSwgbiAvIHNjYWxlLnRpY2tzKCkubGVuZ3RoKSwgZiA9IHBvc2l0aXZlID8gKGUgPSAxZS0xMiwgTWF0aC5jZWlsKSA6IChlID0gLTFlLTEyLCBcbiAgICAgIE1hdGguZmxvb3IpLCBlO1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQgLyBwb3coZihsb2coZCkgKyBlKSkgPD0gayA/IGZvcm1hdChkKSA6IFwiXCI7XG4gICAgICB9O1xuICAgIH07XG4gICAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGQzX3NjYWxlX2xvZyhsaW5lYXIuY29weSgpLCBiYXNlLCBwb3NpdGl2ZSwgZG9tYWluKTtcbiAgICB9O1xuICAgIHJldHVybiBkM19zY2FsZV9saW5lYXJSZWJpbmQoc2NhbGUsIGxpbmVhcik7XG4gIH1cbiAgdmFyIGQzX3NjYWxlX2xvZ0Zvcm1hdCA9IGQzLmZvcm1hdChcIi4wZVwiKSwgZDNfc2NhbGVfbG9nTmljZU5lZ2F0aXZlID0ge1xuICAgIGZsb29yOiBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gLU1hdGguY2VpbCgteCk7XG4gICAgfSxcbiAgICBjZWlsOiBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gLU1hdGguZmxvb3IoLXgpO1xuICAgIH1cbiAgfTtcbiAgZDMuc2NhbGUucG93ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX3NjYWxlX3BvdyhkMy5zY2FsZS5saW5lYXIoKSwgMSwgWyAwLCAxIF0pO1xuICB9O1xuICBmdW5jdGlvbiBkM19zY2FsZV9wb3cobGluZWFyLCBleHBvbmVudCwgZG9tYWluKSB7XG4gICAgdmFyIHBvd3AgPSBkM19zY2FsZV9wb3dQb3coZXhwb25lbnQpLCBwb3diID0gZDNfc2NhbGVfcG93UG93KDEgLyBleHBvbmVudCk7XG4gICAgZnVuY3Rpb24gc2NhbGUoeCkge1xuICAgICAgcmV0dXJuIGxpbmVhcihwb3dwKHgpKTtcbiAgICB9XG4gICAgc2NhbGUuaW52ZXJ0ID0gZnVuY3Rpb24oeCkge1xuICAgICAgcmV0dXJuIHBvd2IobGluZWFyLmludmVydCh4KSk7XG4gICAgfTtcbiAgICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBkb21haW47XG4gICAgICBsaW5lYXIuZG9tYWluKChkb21haW4gPSB4Lm1hcChOdW1iZXIpKS5tYXAocG93cCkpO1xuICAgICAgcmV0dXJuIHNjYWxlO1xuICAgIH07XG4gICAgc2NhbGUudGlja3MgPSBmdW5jdGlvbihtKSB7XG4gICAgICByZXR1cm4gZDNfc2NhbGVfbGluZWFyVGlja3MoZG9tYWluLCBtKTtcbiAgICB9O1xuICAgIHNjYWxlLnRpY2tGb3JtYXQgPSBmdW5jdGlvbihtLCBmb3JtYXQpIHtcbiAgICAgIHJldHVybiBkM19zY2FsZV9saW5lYXJUaWNrRm9ybWF0KGRvbWFpbiwgbSwgZm9ybWF0KTtcbiAgICB9O1xuICAgIHNjYWxlLm5pY2UgPSBmdW5jdGlvbihtKSB7XG4gICAgICByZXR1cm4gc2NhbGUuZG9tYWluKGQzX3NjYWxlX2xpbmVhck5pY2UoZG9tYWluLCBtKSk7XG4gICAgfTtcbiAgICBzY2FsZS5leHBvbmVudCA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGV4cG9uZW50O1xuICAgICAgcG93cCA9IGQzX3NjYWxlX3Bvd1BvdyhleHBvbmVudCA9IHgpO1xuICAgICAgcG93YiA9IGQzX3NjYWxlX3Bvd1BvdygxIC8gZXhwb25lbnQpO1xuICAgICAgbGluZWFyLmRvbWFpbihkb21haW4ubWFwKHBvd3ApKTtcbiAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9O1xuICAgIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkM19zY2FsZV9wb3cobGluZWFyLmNvcHkoKSwgZXhwb25lbnQsIGRvbWFpbik7XG4gICAgfTtcbiAgICByZXR1cm4gZDNfc2NhbGVfbGluZWFyUmViaW5kKHNjYWxlLCBsaW5lYXIpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3NjYWxlX3Bvd1BvdyhlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiB4IDwgMCA/IC1NYXRoLnBvdygteCwgZSkgOiBNYXRoLnBvdyh4LCBlKTtcbiAgICB9O1xuICB9XG4gIGQzLnNjYWxlLnNxcnQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMuc2NhbGUucG93KCkuZXhwb25lbnQoLjUpO1xuICB9O1xuICBkMy5zY2FsZS5vcmRpbmFsID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX3NjYWxlX29yZGluYWwoW10sIHtcbiAgICAgIHQ6IFwicmFuZ2VcIixcbiAgICAgIGE6IFsgW10gXVxuICAgIH0pO1xuICB9O1xuICBmdW5jdGlvbiBkM19zY2FsZV9vcmRpbmFsKGRvbWFpbiwgcmFuZ2VyKSB7XG4gICAgdmFyIGluZGV4LCByYW5nZSwgcmFuZ2VCYW5kO1xuICAgIGZ1bmN0aW9uIHNjYWxlKHgpIHtcbiAgICAgIHJldHVybiByYW5nZVsoKGluZGV4LmdldCh4KSB8fCAocmFuZ2VyLnQgPT09IFwicmFuZ2VcIiA/IGluZGV4LnNldCh4LCBkb21haW4ucHVzaCh4KSkgOiBOYU4pKSAtIDEpICUgcmFuZ2UubGVuZ3RoXTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc3RlcHMoc3RhcnQsIHN0ZXApIHtcbiAgICAgIHJldHVybiBkMy5yYW5nZShkb21haW4ubGVuZ3RoKS5tYXAoZnVuY3Rpb24oaSkge1xuICAgICAgICByZXR1cm4gc3RhcnQgKyBzdGVwICogaTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBkb21haW47XG4gICAgICBkb21haW4gPSBbXTtcbiAgICAgIGluZGV4ID0gbmV3IGQzX01hcCgpO1xuICAgICAgdmFyIGkgPSAtMSwgbiA9IHgubGVuZ3RoLCB4aTtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoIWluZGV4Lmhhcyh4aSA9IHhbaV0pKSBpbmRleC5zZXQoeGksIGRvbWFpbi5wdXNoKHhpKSk7XG4gICAgICByZXR1cm4gc2NhbGVbcmFuZ2VyLnRdLmFwcGx5KHNjYWxlLCByYW5nZXIuYSk7XG4gICAgfTtcbiAgICBzY2FsZS5yYW5nZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHJhbmdlO1xuICAgICAgcmFuZ2UgPSB4O1xuICAgICAgcmFuZ2VCYW5kID0gMDtcbiAgICAgIHJhbmdlciA9IHtcbiAgICAgICAgdDogXCJyYW5nZVwiLFxuICAgICAgICBhOiBhcmd1bWVudHNcbiAgICAgIH07XG4gICAgICByZXR1cm4gc2NhbGU7XG4gICAgfTtcbiAgICBzY2FsZS5yYW5nZVBvaW50cyA9IGZ1bmN0aW9uKHgsIHBhZGRpbmcpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcGFkZGluZyA9IDA7XG4gICAgICB2YXIgc3RhcnQgPSB4WzBdLCBzdG9wID0geFsxXSwgc3RlcCA9IChzdG9wIC0gc3RhcnQpIC8gKE1hdGgubWF4KDEsIGRvbWFpbi5sZW5ndGggLSAxKSArIHBhZGRpbmcpO1xuICAgICAgcmFuZ2UgPSBzdGVwcyhkb21haW4ubGVuZ3RoIDwgMiA/IChzdGFydCArIHN0b3ApIC8gMiA6IHN0YXJ0ICsgc3RlcCAqIHBhZGRpbmcgLyAyLCBzdGVwKTtcbiAgICAgIHJhbmdlQmFuZCA9IDA7XG4gICAgICByYW5nZXIgPSB7XG4gICAgICAgIHQ6IFwicmFuZ2VQb2ludHNcIixcbiAgICAgICAgYTogYXJndW1lbnRzXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHNjYWxlO1xuICAgIH07XG4gICAgc2NhbGUucmFuZ2VCYW5kcyA9IGZ1bmN0aW9uKHgsIHBhZGRpbmcsIG91dGVyUGFkZGluZykge1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSBwYWRkaW5nID0gMDtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykgb3V0ZXJQYWRkaW5nID0gcGFkZGluZztcbiAgICAgIHZhciByZXZlcnNlID0geFsxXSA8IHhbMF0sIHN0YXJ0ID0geFtyZXZlcnNlIC0gMF0sIHN0b3AgPSB4WzEgLSByZXZlcnNlXSwgc3RlcCA9IChzdG9wIC0gc3RhcnQpIC8gKGRvbWFpbi5sZW5ndGggLSBwYWRkaW5nICsgMiAqIG91dGVyUGFkZGluZyk7XG4gICAgICByYW5nZSA9IHN0ZXBzKHN0YXJ0ICsgc3RlcCAqIG91dGVyUGFkZGluZywgc3RlcCk7XG4gICAgICBpZiAocmV2ZXJzZSkgcmFuZ2UucmV2ZXJzZSgpO1xuICAgICAgcmFuZ2VCYW5kID0gc3RlcCAqICgxIC0gcGFkZGluZyk7XG4gICAgICByYW5nZXIgPSB7XG4gICAgICAgIHQ6IFwicmFuZ2VCYW5kc1wiLFxuICAgICAgICBhOiBhcmd1bWVudHNcbiAgICAgIH07XG4gICAgICByZXR1cm4gc2NhbGU7XG4gICAgfTtcbiAgICBzY2FsZS5yYW5nZVJvdW5kQmFuZHMgPSBmdW5jdGlvbih4LCBwYWRkaW5nLCBvdXRlclBhZGRpbmcpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcGFkZGluZyA9IDA7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIG91dGVyUGFkZGluZyA9IHBhZGRpbmc7XG4gICAgICB2YXIgcmV2ZXJzZSA9IHhbMV0gPCB4WzBdLCBzdGFydCA9IHhbcmV2ZXJzZSAtIDBdLCBzdG9wID0geFsxIC0gcmV2ZXJzZV0sIHN0ZXAgPSBNYXRoLmZsb29yKChzdG9wIC0gc3RhcnQpIC8gKGRvbWFpbi5sZW5ndGggLSBwYWRkaW5nICsgMiAqIG91dGVyUGFkZGluZykpLCBlcnJvciA9IHN0b3AgLSBzdGFydCAtIChkb21haW4ubGVuZ3RoIC0gcGFkZGluZykgKiBzdGVwO1xuICAgICAgcmFuZ2UgPSBzdGVwcyhzdGFydCArIE1hdGgucm91bmQoZXJyb3IgLyAyKSwgc3RlcCk7XG4gICAgICBpZiAocmV2ZXJzZSkgcmFuZ2UucmV2ZXJzZSgpO1xuICAgICAgcmFuZ2VCYW5kID0gTWF0aC5yb3VuZChzdGVwICogKDEgLSBwYWRkaW5nKSk7XG4gICAgICByYW5nZXIgPSB7XG4gICAgICAgIHQ6IFwicmFuZ2VSb3VuZEJhbmRzXCIsXG4gICAgICAgIGE6IGFyZ3VtZW50c1xuICAgICAgfTtcbiAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9O1xuICAgIHNjYWxlLnJhbmdlQmFuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJhbmdlQmFuZDtcbiAgICB9O1xuICAgIHNjYWxlLnJhbmdlRXh0ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZDNfc2NhbGVFeHRlbnQocmFuZ2VyLmFbMF0pO1xuICAgIH07XG4gICAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGQzX3NjYWxlX29yZGluYWwoZG9tYWluLCByYW5nZXIpO1xuICAgIH07XG4gICAgcmV0dXJuIHNjYWxlLmRvbWFpbihkb21haW4pO1xuICB9XG4gIGQzLnNjYWxlLmNhdGVnb3J5MTAgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMuc2NhbGUub3JkaW5hbCgpLnJhbmdlKGQzX2NhdGVnb3J5MTApO1xuICB9O1xuICBkMy5zY2FsZS5jYXRlZ29yeTIwID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzLnNjYWxlLm9yZGluYWwoKS5yYW5nZShkM19jYXRlZ29yeTIwKTtcbiAgfTtcbiAgZDMuc2NhbGUuY2F0ZWdvcnkyMGIgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMuc2NhbGUub3JkaW5hbCgpLnJhbmdlKGQzX2NhdGVnb3J5MjBiKTtcbiAgfTtcbiAgZDMuc2NhbGUuY2F0ZWdvcnkyMGMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDMuc2NhbGUub3JkaW5hbCgpLnJhbmdlKGQzX2NhdGVnb3J5MjBjKTtcbiAgfTtcbiAgdmFyIGQzX2NhdGVnb3J5MTAgPSBbIDIwNjIyNjAsIDE2NzQ0MjA2LCAyOTI0NTg4LCAxNDAzNDcyOCwgOTcyNTg4NSwgOTE5NzEzMSwgMTQ5MDczMzAsIDgzNTU3MTEsIDEyMzY5MTg2LCAxNTU2MTc1IF0ubWFwKGQzX3JnYlN0cmluZyk7XG4gIHZhciBkM19jYXRlZ29yeTIwID0gWyAyMDYyMjYwLCAxMTQ1NDQ0MCwgMTY3NDQyMDYsIDE2NzU5NjcyLCAyOTI0NTg4LCAxMDAxODY5OCwgMTQwMzQ3MjgsIDE2NzUwNzQyLCA5NzI1ODg1LCAxMjk1NTg2MSwgOTE5NzEzMSwgMTI4ODUxNDAsIDE0OTA3MzMwLCAxNjIzNDE5NCwgODM1NTcxMSwgMTMwOTI4MDcsIDEyMzY5MTg2LCAxNDQwODU4OSwgMTU1NjE3NSwgMTA0MTA3MjUgXS5tYXAoZDNfcmdiU3RyaW5nKTtcbiAgdmFyIGQzX2NhdGVnb3J5MjBiID0gWyAzNzUwNzc3LCA1Mzk1NjE5LCA3MDQwNzE5LCAxMDI2NDI4NiwgNjUxOTA5NywgOTIxNjU5NCwgMTE5MTUxMTUsIDEzNTU2NjM2LCA5MjAyOTkzLCAxMjQyNjgwOSwgMTUxODY1MTQsIDE1MTkwOTMyLCA4NjY2MTY5LCAxMTM1NjQ5MCwgMTQwNDk2NDMsIDE1MTc3MzcyLCA4MDc3NjgzLCAxMDgzNDMyNCwgMTM1Mjg1MDksIDE0NTg5NjU0IF0ubWFwKGQzX3JnYlN0cmluZyk7XG4gIHZhciBkM19jYXRlZ29yeTIwYyA9IFsgMzI0NDczMywgNzA1NzExMCwgMTA0MDY2MjUsIDEzMDMyNDMxLCAxNTA5NTA1MywgMTY2MTY3NjQsIDE2NjI1MjU5LCAxNjYzNDAxOCwgMzI1MzA3NiwgNzY1MjQ3MCwgMTA2MDcwMDMsIDEzMTAxNTA0LCA3Njk1MjgxLCAxMDM5NDMxMiwgMTIzNjkzNzIsIDE0MzQyODkxLCA2NTEzNTA3LCA5ODY4OTUwLCAxMjQzNDg3NywgMTQyNzcwODEgXS5tYXAoZDNfcmdiU3RyaW5nKTtcbiAgZDMuc2NhbGUucXVhbnRpbGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfc2NhbGVfcXVhbnRpbGUoW10sIFtdKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc2NhbGVfcXVhbnRpbGUoZG9tYWluLCByYW5nZSkge1xuICAgIHZhciB0aHJlc2hvbGRzO1xuICAgIGZ1bmN0aW9uIHJlc2NhbGUoKSB7XG4gICAgICB2YXIgayA9IDAsIHEgPSByYW5nZS5sZW5ndGg7XG4gICAgICB0aHJlc2hvbGRzID0gW107XG4gICAgICB3aGlsZSAoKytrIDwgcSkgdGhyZXNob2xkc1trIC0gMV0gPSBkMy5xdWFudGlsZShkb21haW4sIGsgLyBxKTtcbiAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc2NhbGUoeCkge1xuICAgICAgaWYgKCFpc05hTih4ID0gK3gpKSByZXR1cm4gcmFuZ2VbZDMuYmlzZWN0KHRocmVzaG9sZHMsIHgpXTtcbiAgICB9XG4gICAgc2NhbGUuZG9tYWluID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZG9tYWluO1xuICAgICAgZG9tYWluID0geC5maWx0ZXIoZDNfbnVtYmVyKS5zb3J0KGQzX2FzY2VuZGluZyk7XG4gICAgICByZXR1cm4gcmVzY2FsZSgpO1xuICAgIH07XG4gICAgc2NhbGUucmFuZ2UgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiByYW5nZTtcbiAgICAgIHJhbmdlID0geDtcbiAgICAgIHJldHVybiByZXNjYWxlKCk7XG4gICAgfTtcbiAgICBzY2FsZS5xdWFudGlsZXMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB0aHJlc2hvbGRzO1xuICAgIH07XG4gICAgc2NhbGUuaW52ZXJ0RXh0ZW50ID0gZnVuY3Rpb24oeSkge1xuICAgICAgeSA9IHJhbmdlLmluZGV4T2YoeSk7XG4gICAgICByZXR1cm4geSA8IDAgPyBbIE5hTiwgTmFOIF0gOiBbIHkgPiAwID8gdGhyZXNob2xkc1t5IC0gMV0gOiBkb21haW5bMF0sIHkgPCB0aHJlc2hvbGRzLmxlbmd0aCA/IHRocmVzaG9sZHNbeV0gOiBkb21haW5bZG9tYWluLmxlbmd0aCAtIDFdIF07XG4gICAgfTtcbiAgICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZDNfc2NhbGVfcXVhbnRpbGUoZG9tYWluLCByYW5nZSk7XG4gICAgfTtcbiAgICByZXR1cm4gcmVzY2FsZSgpO1xuICB9XG4gIGQzLnNjYWxlLnF1YW50aXplID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX3NjYWxlX3F1YW50aXplKDAsIDEsIFsgMCwgMSBdKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc2NhbGVfcXVhbnRpemUoeDAsIHgxLCByYW5nZSkge1xuICAgIHZhciBreCwgaTtcbiAgICBmdW5jdGlvbiBzY2FsZSh4KSB7XG4gICAgICByZXR1cm4gcmFuZ2VbTWF0aC5tYXgoMCwgTWF0aC5taW4oaSwgTWF0aC5mbG9vcihreCAqICh4IC0geDApKSkpXTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVzY2FsZSgpIHtcbiAgICAgIGt4ID0gcmFuZ2UubGVuZ3RoIC8gKHgxIC0geDApO1xuICAgICAgaSA9IHJhbmdlLmxlbmd0aCAtIDE7XG4gICAgICByZXR1cm4gc2NhbGU7XG4gICAgfVxuICAgIHNjYWxlLmRvbWFpbiA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIFsgeDAsIHgxIF07XG4gICAgICB4MCA9ICt4WzBdO1xuICAgICAgeDEgPSAreFt4Lmxlbmd0aCAtIDFdO1xuICAgICAgcmV0dXJuIHJlc2NhbGUoKTtcbiAgICB9O1xuICAgIHNjYWxlLnJhbmdlID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcmFuZ2U7XG4gICAgICByYW5nZSA9IHg7XG4gICAgICByZXR1cm4gcmVzY2FsZSgpO1xuICAgIH07XG4gICAgc2NhbGUuaW52ZXJ0RXh0ZW50ID0gZnVuY3Rpb24oeSkge1xuICAgICAgeSA9IHJhbmdlLmluZGV4T2YoeSk7XG4gICAgICB5ID0geSA8IDAgPyBOYU4gOiB5IC8ga3ggKyB4MDtcbiAgICAgIHJldHVybiBbIHksIHkgKyAxIC8ga3ggXTtcbiAgICB9O1xuICAgIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkM19zY2FsZV9xdWFudGl6ZSh4MCwgeDEsIHJhbmdlKTtcbiAgICB9O1xuICAgIHJldHVybiByZXNjYWxlKCk7XG4gIH1cbiAgZDMuc2NhbGUudGhyZXNob2xkID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX3NjYWxlX3RocmVzaG9sZChbIC41IF0sIFsgMCwgMSBdKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc2NhbGVfdGhyZXNob2xkKGRvbWFpbiwgcmFuZ2UpIHtcbiAgICBmdW5jdGlvbiBzY2FsZSh4KSB7XG4gICAgICBpZiAoeCA8PSB4KSByZXR1cm4gcmFuZ2VbZDMuYmlzZWN0KGRvbWFpbiwgeCldO1xuICAgIH1cbiAgICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBkb21haW47XG4gICAgICBkb21haW4gPSBfO1xuICAgICAgcmV0dXJuIHNjYWxlO1xuICAgIH07XG4gICAgc2NhbGUucmFuZ2UgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiByYW5nZTtcbiAgICAgIHJhbmdlID0gXztcbiAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9O1xuICAgIHNjYWxlLmludmVydEV4dGVudCA9IGZ1bmN0aW9uKHkpIHtcbiAgICAgIHkgPSByYW5nZS5pbmRleE9mKHkpO1xuICAgICAgcmV0dXJuIFsgZG9tYWluW3kgLSAxXSwgZG9tYWluW3ldIF07XG4gICAgfTtcbiAgICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZDNfc2NhbGVfdGhyZXNob2xkKGRvbWFpbiwgcmFuZ2UpO1xuICAgIH07XG4gICAgcmV0dXJuIHNjYWxlO1xuICB9XG4gIGQzLnNjYWxlLmlkZW50aXR5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX3NjYWxlX2lkZW50aXR5KFsgMCwgMSBdKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc2NhbGVfaWRlbnRpdHkoZG9tYWluKSB7XG4gICAgZnVuY3Rpb24gaWRlbnRpdHkoeCkge1xuICAgICAgcmV0dXJuICt4O1xuICAgIH1cbiAgICBpZGVudGl0eS5pbnZlcnQgPSBpZGVudGl0eTtcbiAgICBpZGVudGl0eS5kb21haW4gPSBpZGVudGl0eS5yYW5nZSA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGRvbWFpbjtcbiAgICAgIGRvbWFpbiA9IHgubWFwKGlkZW50aXR5KTtcbiAgICAgIHJldHVybiBpZGVudGl0eTtcbiAgICB9O1xuICAgIGlkZW50aXR5LnRpY2tzID0gZnVuY3Rpb24obSkge1xuICAgICAgcmV0dXJuIGQzX3NjYWxlX2xpbmVhclRpY2tzKGRvbWFpbiwgbSk7XG4gICAgfTtcbiAgICBpZGVudGl0eS50aWNrRm9ybWF0ID0gZnVuY3Rpb24obSwgZm9ybWF0KSB7XG4gICAgICByZXR1cm4gZDNfc2NhbGVfbGluZWFyVGlja0Zvcm1hdChkb21haW4sIG0sIGZvcm1hdCk7XG4gICAgfTtcbiAgICBpZGVudGl0eS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZDNfc2NhbGVfaWRlbnRpdHkoZG9tYWluKTtcbiAgICB9O1xuICAgIHJldHVybiBpZGVudGl0eTtcbiAgfVxuICBkMy5zdmcgPSB7fTtcbiAgZDMuc3ZnLmFyYyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpbm5lclJhZGl1cyA9IGQzX3N2Z19hcmNJbm5lclJhZGl1cywgb3V0ZXJSYWRpdXMgPSBkM19zdmdfYXJjT3V0ZXJSYWRpdXMsIHN0YXJ0QW5nbGUgPSBkM19zdmdfYXJjU3RhcnRBbmdsZSwgZW5kQW5nbGUgPSBkM19zdmdfYXJjRW5kQW5nbGU7XG4gICAgZnVuY3Rpb24gYXJjKCkge1xuICAgICAgdmFyIHIwID0gaW5uZXJSYWRpdXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSwgcjEgPSBvdXRlclJhZGl1cy5hcHBseSh0aGlzLCBhcmd1bWVudHMpLCBhMCA9IHN0YXJ0QW5nbGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSArIGQzX3N2Z19hcmNPZmZzZXQsIGExID0gZW5kQW5nbGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSArIGQzX3N2Z19hcmNPZmZzZXQsIGRhID0gKGExIDwgYTAgJiYgKGRhID0gYTAsIFxuICAgICAgYTAgPSBhMSwgYTEgPSBkYSksIGExIC0gYTApLCBkZiA9IGRhIDwgz4AgPyBcIjBcIiA6IFwiMVwiLCBjMCA9IE1hdGguY29zKGEwKSwgczAgPSBNYXRoLnNpbihhMCksIGMxID0gTWF0aC5jb3MoYTEpLCBzMSA9IE1hdGguc2luKGExKTtcbiAgICAgIHJldHVybiBkYSA+PSBkM19zdmdfYXJjTWF4ID8gcjAgPyBcIk0wLFwiICsgcjEgKyBcIkFcIiArIHIxICsgXCIsXCIgKyByMSArIFwiIDAgMSwxIDAsXCIgKyAtcjEgKyBcIkFcIiArIHIxICsgXCIsXCIgKyByMSArIFwiIDAgMSwxIDAsXCIgKyByMSArIFwiTTAsXCIgKyByMCArIFwiQVwiICsgcjAgKyBcIixcIiArIHIwICsgXCIgMCAxLDAgMCxcIiArIC1yMCArIFwiQVwiICsgcjAgKyBcIixcIiArIHIwICsgXCIgMCAxLDAgMCxcIiArIHIwICsgXCJaXCIgOiBcIk0wLFwiICsgcjEgKyBcIkFcIiArIHIxICsgXCIsXCIgKyByMSArIFwiIDAgMSwxIDAsXCIgKyAtcjEgKyBcIkFcIiArIHIxICsgXCIsXCIgKyByMSArIFwiIDAgMSwxIDAsXCIgKyByMSArIFwiWlwiIDogcjAgPyBcIk1cIiArIHIxICogYzAgKyBcIixcIiArIHIxICogczAgKyBcIkFcIiArIHIxICsgXCIsXCIgKyByMSArIFwiIDAgXCIgKyBkZiArIFwiLDEgXCIgKyByMSAqIGMxICsgXCIsXCIgKyByMSAqIHMxICsgXCJMXCIgKyByMCAqIGMxICsgXCIsXCIgKyByMCAqIHMxICsgXCJBXCIgKyByMCArIFwiLFwiICsgcjAgKyBcIiAwIFwiICsgZGYgKyBcIiwwIFwiICsgcjAgKiBjMCArIFwiLFwiICsgcjAgKiBzMCArIFwiWlwiIDogXCJNXCIgKyByMSAqIGMwICsgXCIsXCIgKyByMSAqIHMwICsgXCJBXCIgKyByMSArIFwiLFwiICsgcjEgKyBcIiAwIFwiICsgZGYgKyBcIiwxIFwiICsgcjEgKiBjMSArIFwiLFwiICsgcjEgKiBzMSArIFwiTDAsMFwiICsgXCJaXCI7XG4gICAgfVxuICAgIGFyYy5pbm5lclJhZGl1cyA9IGZ1bmN0aW9uKHYpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGlubmVyUmFkaXVzO1xuICAgICAgaW5uZXJSYWRpdXMgPSBkM19mdW5jdG9yKHYpO1xuICAgICAgcmV0dXJuIGFyYztcbiAgICB9O1xuICAgIGFyYy5vdXRlclJhZGl1cyA9IGZ1bmN0aW9uKHYpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG91dGVyUmFkaXVzO1xuICAgICAgb3V0ZXJSYWRpdXMgPSBkM19mdW5jdG9yKHYpO1xuICAgICAgcmV0dXJuIGFyYztcbiAgICB9O1xuICAgIGFyYy5zdGFydEFuZ2xlID0gZnVuY3Rpb24odikge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc3RhcnRBbmdsZTtcbiAgICAgIHN0YXJ0QW5nbGUgPSBkM19mdW5jdG9yKHYpO1xuICAgICAgcmV0dXJuIGFyYztcbiAgICB9O1xuICAgIGFyYy5lbmRBbmdsZSA9IGZ1bmN0aW9uKHYpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGVuZEFuZ2xlO1xuICAgICAgZW5kQW5nbGUgPSBkM19mdW5jdG9yKHYpO1xuICAgICAgcmV0dXJuIGFyYztcbiAgICB9O1xuICAgIGFyYy5jZW50cm9pZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHIgPSAoaW5uZXJSYWRpdXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSArIG91dGVyUmFkaXVzLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpIC8gMiwgYSA9IChzdGFydEFuZ2xlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgKyBlbmRBbmdsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKSAvIDIgKyBkM19zdmdfYXJjT2Zmc2V0O1xuICAgICAgcmV0dXJuIFsgTWF0aC5jb3MoYSkgKiByLCBNYXRoLnNpbihhKSAqIHIgXTtcbiAgICB9O1xuICAgIHJldHVybiBhcmM7XG4gIH07XG4gIHZhciBkM19zdmdfYXJjT2Zmc2V0ID0gLWhhbGbPgCwgZDNfc3ZnX2FyY01heCA9IM+EIC0gzrU7XG4gIGZ1bmN0aW9uIGQzX3N2Z19hcmNJbm5lclJhZGl1cyhkKSB7XG4gICAgcmV0dXJuIGQuaW5uZXJSYWRpdXM7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc3ZnX2FyY091dGVyUmFkaXVzKGQpIHtcbiAgICByZXR1cm4gZC5vdXRlclJhZGl1cztcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfYXJjU3RhcnRBbmdsZShkKSB7XG4gICAgcmV0dXJuIGQuc3RhcnRBbmdsZTtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfYXJjRW5kQW5nbGUoZCkge1xuICAgIHJldHVybiBkLmVuZEFuZ2xlO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3N2Z19saW5lKHByb2plY3Rpb24pIHtcbiAgICB2YXIgeCA9IGQzX2dlb21fcG9pbnRYLCB5ID0gZDNfZ2VvbV9wb2ludFksIGRlZmluZWQgPSBkM190cnVlLCBpbnRlcnBvbGF0ZSA9IGQzX3N2Z19saW5lTGluZWFyLCBpbnRlcnBvbGF0ZUtleSA9IGludGVycG9sYXRlLmtleSwgdGVuc2lvbiA9IC43O1xuICAgIGZ1bmN0aW9uIGxpbmUoZGF0YSkge1xuICAgICAgdmFyIHNlZ21lbnRzID0gW10sIHBvaW50cyA9IFtdLCBpID0gLTEsIG4gPSBkYXRhLmxlbmd0aCwgZCwgZnggPSBkM19mdW5jdG9yKHgpLCBmeSA9IGQzX2Z1bmN0b3IoeSk7XG4gICAgICBmdW5jdGlvbiBzZWdtZW50KCkge1xuICAgICAgICBzZWdtZW50cy5wdXNoKFwiTVwiLCBpbnRlcnBvbGF0ZShwcm9qZWN0aW9uKHBvaW50cyksIHRlbnNpb24pKTtcbiAgICAgIH1cbiAgICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICAgIGlmIChkZWZpbmVkLmNhbGwodGhpcywgZCA9IGRhdGFbaV0sIGkpKSB7XG4gICAgICAgICAgcG9pbnRzLnB1c2goWyArZnguY2FsbCh0aGlzLCBkLCBpKSwgK2Z5LmNhbGwodGhpcywgZCwgaSkgXSk7XG4gICAgICAgIH0gZWxzZSBpZiAocG9pbnRzLmxlbmd0aCkge1xuICAgICAgICAgIHNlZ21lbnQoKTtcbiAgICAgICAgICBwb2ludHMgPSBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHBvaW50cy5sZW5ndGgpIHNlZ21lbnQoKTtcbiAgICAgIHJldHVybiBzZWdtZW50cy5sZW5ndGggPyBzZWdtZW50cy5qb2luKFwiXCIpIDogbnVsbDtcbiAgICB9XG4gICAgbGluZS54ID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geDtcbiAgICAgIHggPSBfO1xuICAgICAgcmV0dXJuIGxpbmU7XG4gICAgfTtcbiAgICBsaW5lLnkgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB5O1xuICAgICAgeSA9IF87XG4gICAgICByZXR1cm4gbGluZTtcbiAgICB9O1xuICAgIGxpbmUuZGVmaW5lZCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGRlZmluZWQ7XG4gICAgICBkZWZpbmVkID0gXztcbiAgICAgIHJldHVybiBsaW5lO1xuICAgIH07XG4gICAgbGluZS5pbnRlcnBvbGF0ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGludGVycG9sYXRlS2V5O1xuICAgICAgaWYgKHR5cGVvZiBfID09PSBcImZ1bmN0aW9uXCIpIGludGVycG9sYXRlS2V5ID0gaW50ZXJwb2xhdGUgPSBfOyBlbHNlIGludGVycG9sYXRlS2V5ID0gKGludGVycG9sYXRlID0gZDNfc3ZnX2xpbmVJbnRlcnBvbGF0b3JzLmdldChfKSB8fCBkM19zdmdfbGluZUxpbmVhcikua2V5O1xuICAgICAgcmV0dXJuIGxpbmU7XG4gICAgfTtcbiAgICBsaW5lLnRlbnNpb24gPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0ZW5zaW9uO1xuICAgICAgdGVuc2lvbiA9IF87XG4gICAgICByZXR1cm4gbGluZTtcbiAgICB9O1xuICAgIHJldHVybiBsaW5lO1xuICB9XG4gIGQzLnN2Zy5saW5lID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGQzX3N2Z19saW5lKGQzX2lkZW50aXR5KTtcbiAgfTtcbiAgdmFyIGQzX3N2Z19saW5lSW50ZXJwb2xhdG9ycyA9IGQzLm1hcCh7XG4gICAgbGluZWFyOiBkM19zdmdfbGluZUxpbmVhcixcbiAgICBcImxpbmVhci1jbG9zZWRcIjogZDNfc3ZnX2xpbmVMaW5lYXJDbG9zZWQsXG4gICAgc3RlcDogZDNfc3ZnX2xpbmVTdGVwLFxuICAgIFwic3RlcC1iZWZvcmVcIjogZDNfc3ZnX2xpbmVTdGVwQmVmb3JlLFxuICAgIFwic3RlcC1hZnRlclwiOiBkM19zdmdfbGluZVN0ZXBBZnRlcixcbiAgICBiYXNpczogZDNfc3ZnX2xpbmVCYXNpcyxcbiAgICBcImJhc2lzLW9wZW5cIjogZDNfc3ZnX2xpbmVCYXNpc09wZW4sXG4gICAgXCJiYXNpcy1jbG9zZWRcIjogZDNfc3ZnX2xpbmVCYXNpc0Nsb3NlZCxcbiAgICBidW5kbGU6IGQzX3N2Z19saW5lQnVuZGxlLFxuICAgIGNhcmRpbmFsOiBkM19zdmdfbGluZUNhcmRpbmFsLFxuICAgIFwiY2FyZGluYWwtb3BlblwiOiBkM19zdmdfbGluZUNhcmRpbmFsT3BlbixcbiAgICBcImNhcmRpbmFsLWNsb3NlZFwiOiBkM19zdmdfbGluZUNhcmRpbmFsQ2xvc2VkLFxuICAgIG1vbm90b25lOiBkM19zdmdfbGluZU1vbm90b25lXG4gIH0pO1xuICBkM19zdmdfbGluZUludGVycG9sYXRvcnMuZm9yRWFjaChmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgdmFsdWUua2V5ID0ga2V5O1xuICAgIHZhbHVlLmNsb3NlZCA9IC8tY2xvc2VkJC8udGVzdChrZXkpO1xuICB9KTtcbiAgZnVuY3Rpb24gZDNfc3ZnX2xpbmVMaW5lYXIocG9pbnRzKSB7XG4gICAgcmV0dXJuIHBvaW50cy5qb2luKFwiTFwiKTtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZUxpbmVhckNsb3NlZChwb2ludHMpIHtcbiAgICByZXR1cm4gZDNfc3ZnX2xpbmVMaW5lYXIocG9pbnRzKSArIFwiWlwiO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3N2Z19saW5lU3RlcChwb2ludHMpIHtcbiAgICB2YXIgaSA9IDAsIG4gPSBwb2ludHMubGVuZ3RoLCBwID0gcG9pbnRzWzBdLCBwYXRoID0gWyBwWzBdLCBcIixcIiwgcFsxXSBdO1xuICAgIHdoaWxlICgrK2kgPCBuKSBwYXRoLnB1c2goXCJIXCIsIChwWzBdICsgKHAgPSBwb2ludHNbaV0pWzBdKSAvIDIsIFwiVlwiLCBwWzFdKTtcbiAgICBpZiAobiA+IDEpIHBhdGgucHVzaChcIkhcIiwgcFswXSk7XG4gICAgcmV0dXJuIHBhdGguam9pbihcIlwiKTtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZVN0ZXBCZWZvcmUocG9pbnRzKSB7XG4gICAgdmFyIGkgPSAwLCBuID0gcG9pbnRzLmxlbmd0aCwgcCA9IHBvaW50c1swXSwgcGF0aCA9IFsgcFswXSwgXCIsXCIsIHBbMV0gXTtcbiAgICB3aGlsZSAoKytpIDwgbikgcGF0aC5wdXNoKFwiVlwiLCAocCA9IHBvaW50c1tpXSlbMV0sIFwiSFwiLCBwWzBdKTtcbiAgICByZXR1cm4gcGF0aC5qb2luKFwiXCIpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3N2Z19saW5lU3RlcEFmdGVyKHBvaW50cykge1xuICAgIHZhciBpID0gMCwgbiA9IHBvaW50cy5sZW5ndGgsIHAgPSBwb2ludHNbMF0sIHBhdGggPSBbIHBbMF0sIFwiLFwiLCBwWzFdIF07XG4gICAgd2hpbGUgKCsraSA8IG4pIHBhdGgucHVzaChcIkhcIiwgKHAgPSBwb2ludHNbaV0pWzBdLCBcIlZcIiwgcFsxXSk7XG4gICAgcmV0dXJuIHBhdGguam9pbihcIlwiKTtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZUNhcmRpbmFsT3Blbihwb2ludHMsIHRlbnNpb24pIHtcbiAgICByZXR1cm4gcG9pbnRzLmxlbmd0aCA8IDQgPyBkM19zdmdfbGluZUxpbmVhcihwb2ludHMpIDogcG9pbnRzWzFdICsgZDNfc3ZnX2xpbmVIZXJtaXRlKHBvaW50cy5zbGljZSgxLCBwb2ludHMubGVuZ3RoIC0gMSksIGQzX3N2Z19saW5lQ2FyZGluYWxUYW5nZW50cyhwb2ludHMsIHRlbnNpb24pKTtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZUNhcmRpbmFsQ2xvc2VkKHBvaW50cywgdGVuc2lvbikge1xuICAgIHJldHVybiBwb2ludHMubGVuZ3RoIDwgMyA/IGQzX3N2Z19saW5lTGluZWFyKHBvaW50cykgOiBwb2ludHNbMF0gKyBkM19zdmdfbGluZUhlcm1pdGUoKHBvaW50cy5wdXNoKHBvaW50c1swXSksIFxuICAgIHBvaW50cyksIGQzX3N2Z19saW5lQ2FyZGluYWxUYW5nZW50cyhbIHBvaW50c1twb2ludHMubGVuZ3RoIC0gMl0gXS5jb25jYXQocG9pbnRzLCBbIHBvaW50c1sxXSBdKSwgdGVuc2lvbikpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3N2Z19saW5lQ2FyZGluYWwocG9pbnRzLCB0ZW5zaW9uKSB7XG4gICAgcmV0dXJuIHBvaW50cy5sZW5ndGggPCAzID8gZDNfc3ZnX2xpbmVMaW5lYXIocG9pbnRzKSA6IHBvaW50c1swXSArIGQzX3N2Z19saW5lSGVybWl0ZShwb2ludHMsIGQzX3N2Z19saW5lQ2FyZGluYWxUYW5nZW50cyhwb2ludHMsIHRlbnNpb24pKTtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZUhlcm1pdGUocG9pbnRzLCB0YW5nZW50cykge1xuICAgIGlmICh0YW5nZW50cy5sZW5ndGggPCAxIHx8IHBvaW50cy5sZW5ndGggIT0gdGFuZ2VudHMubGVuZ3RoICYmIHBvaW50cy5sZW5ndGggIT0gdGFuZ2VudHMubGVuZ3RoICsgMikge1xuICAgICAgcmV0dXJuIGQzX3N2Z19saW5lTGluZWFyKHBvaW50cyk7XG4gICAgfVxuICAgIHZhciBxdWFkID0gcG9pbnRzLmxlbmd0aCAhPSB0YW5nZW50cy5sZW5ndGgsIHBhdGggPSBcIlwiLCBwMCA9IHBvaW50c1swXSwgcCA9IHBvaW50c1sxXSwgdDAgPSB0YW5nZW50c1swXSwgdCA9IHQwLCBwaSA9IDE7XG4gICAgaWYgKHF1YWQpIHtcbiAgICAgIHBhdGggKz0gXCJRXCIgKyAocFswXSAtIHQwWzBdICogMiAvIDMpICsgXCIsXCIgKyAocFsxXSAtIHQwWzFdICogMiAvIDMpICsgXCIsXCIgKyBwWzBdICsgXCIsXCIgKyBwWzFdO1xuICAgICAgcDAgPSBwb2ludHNbMV07XG4gICAgICBwaSA9IDI7XG4gICAgfVxuICAgIGlmICh0YW5nZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICB0ID0gdGFuZ2VudHNbMV07XG4gICAgICBwID0gcG9pbnRzW3BpXTtcbiAgICAgIHBpKys7XG4gICAgICBwYXRoICs9IFwiQ1wiICsgKHAwWzBdICsgdDBbMF0pICsgXCIsXCIgKyAocDBbMV0gKyB0MFsxXSkgKyBcIixcIiArIChwWzBdIC0gdFswXSkgKyBcIixcIiArIChwWzFdIC0gdFsxXSkgKyBcIixcIiArIHBbMF0gKyBcIixcIiArIHBbMV07XG4gICAgICBmb3IgKHZhciBpID0gMjsgaSA8IHRhbmdlbnRzLmxlbmd0aDsgaSsrLCBwaSsrKSB7XG4gICAgICAgIHAgPSBwb2ludHNbcGldO1xuICAgICAgICB0ID0gdGFuZ2VudHNbaV07XG4gICAgICAgIHBhdGggKz0gXCJTXCIgKyAocFswXSAtIHRbMF0pICsgXCIsXCIgKyAocFsxXSAtIHRbMV0pICsgXCIsXCIgKyBwWzBdICsgXCIsXCIgKyBwWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAocXVhZCkge1xuICAgICAgdmFyIGxwID0gcG9pbnRzW3BpXTtcbiAgICAgIHBhdGggKz0gXCJRXCIgKyAocFswXSArIHRbMF0gKiAyIC8gMykgKyBcIixcIiArIChwWzFdICsgdFsxXSAqIDIgLyAzKSArIFwiLFwiICsgbHBbMF0gKyBcIixcIiArIGxwWzFdO1xuICAgIH1cbiAgICByZXR1cm4gcGF0aDtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZUNhcmRpbmFsVGFuZ2VudHMocG9pbnRzLCB0ZW5zaW9uKSB7XG4gICAgdmFyIHRhbmdlbnRzID0gW10sIGEgPSAoMSAtIHRlbnNpb24pIC8gMiwgcDAsIHAxID0gcG9pbnRzWzBdLCBwMiA9IHBvaW50c1sxXSwgaSA9IDEsIG4gPSBwb2ludHMubGVuZ3RoO1xuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICBwMCA9IHAxO1xuICAgICAgcDEgPSBwMjtcbiAgICAgIHAyID0gcG9pbnRzW2ldO1xuICAgICAgdGFuZ2VudHMucHVzaChbIGEgKiAocDJbMF0gLSBwMFswXSksIGEgKiAocDJbMV0gLSBwMFsxXSkgXSk7XG4gICAgfVxuICAgIHJldHVybiB0YW5nZW50cztcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZUJhc2lzKHBvaW50cykge1xuICAgIGlmIChwb2ludHMubGVuZ3RoIDwgMykgcmV0dXJuIGQzX3N2Z19saW5lTGluZWFyKHBvaW50cyk7XG4gICAgdmFyIGkgPSAxLCBuID0gcG9pbnRzLmxlbmd0aCwgcGkgPSBwb2ludHNbMF0sIHgwID0gcGlbMF0sIHkwID0gcGlbMV0sIHB4ID0gWyB4MCwgeDAsIHgwLCAocGkgPSBwb2ludHNbMV0pWzBdIF0sIHB5ID0gWyB5MCwgeTAsIHkwLCBwaVsxXSBdLCBwYXRoID0gWyB4MCwgXCIsXCIsIHkwLCBcIkxcIiwgZDNfc3ZnX2xpbmVEb3Q0KGQzX3N2Z19saW5lQmFzaXNCZXppZXIzLCBweCksIFwiLFwiLCBkM19zdmdfbGluZURvdDQoZDNfc3ZnX2xpbmVCYXNpc0JlemllcjMsIHB5KSBdO1xuICAgIHBvaW50cy5wdXNoKHBvaW50c1tuIC0gMV0pO1xuICAgIHdoaWxlICgrK2kgPD0gbikge1xuICAgICAgcGkgPSBwb2ludHNbaV07XG4gICAgICBweC5zaGlmdCgpO1xuICAgICAgcHgucHVzaChwaVswXSk7XG4gICAgICBweS5zaGlmdCgpO1xuICAgICAgcHkucHVzaChwaVsxXSk7XG4gICAgICBkM19zdmdfbGluZUJhc2lzQmV6aWVyKHBhdGgsIHB4LCBweSk7XG4gICAgfVxuICAgIHBvaW50cy5wb3AoKTtcbiAgICBwYXRoLnB1c2goXCJMXCIsIHBpKTtcbiAgICByZXR1cm4gcGF0aC5qb2luKFwiXCIpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3N2Z19saW5lQmFzaXNPcGVuKHBvaW50cykge1xuICAgIGlmIChwb2ludHMubGVuZ3RoIDwgNCkgcmV0dXJuIGQzX3N2Z19saW5lTGluZWFyKHBvaW50cyk7XG4gICAgdmFyIHBhdGggPSBbXSwgaSA9IC0xLCBuID0gcG9pbnRzLmxlbmd0aCwgcGksIHB4ID0gWyAwIF0sIHB5ID0gWyAwIF07XG4gICAgd2hpbGUgKCsraSA8IDMpIHtcbiAgICAgIHBpID0gcG9pbnRzW2ldO1xuICAgICAgcHgucHVzaChwaVswXSk7XG4gICAgICBweS5wdXNoKHBpWzFdKTtcbiAgICB9XG4gICAgcGF0aC5wdXNoKGQzX3N2Z19saW5lRG90NChkM19zdmdfbGluZUJhc2lzQmV6aWVyMywgcHgpICsgXCIsXCIgKyBkM19zdmdfbGluZURvdDQoZDNfc3ZnX2xpbmVCYXNpc0JlemllcjMsIHB5KSk7XG4gICAgLS1pO1xuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICBwaSA9IHBvaW50c1tpXTtcbiAgICAgIHB4LnNoaWZ0KCk7XG4gICAgICBweC5wdXNoKHBpWzBdKTtcbiAgICAgIHB5LnNoaWZ0KCk7XG4gICAgICBweS5wdXNoKHBpWzFdKTtcbiAgICAgIGQzX3N2Z19saW5lQmFzaXNCZXppZXIocGF0aCwgcHgsIHB5KTtcbiAgICB9XG4gICAgcmV0dXJuIHBhdGguam9pbihcIlwiKTtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZUJhc2lzQ2xvc2VkKHBvaW50cykge1xuICAgIHZhciBwYXRoLCBpID0gLTEsIG4gPSBwb2ludHMubGVuZ3RoLCBtID0gbiArIDQsIHBpLCBweCA9IFtdLCBweSA9IFtdO1xuICAgIHdoaWxlICgrK2kgPCA0KSB7XG4gICAgICBwaSA9IHBvaW50c1tpICUgbl07XG4gICAgICBweC5wdXNoKHBpWzBdKTtcbiAgICAgIHB5LnB1c2gocGlbMV0pO1xuICAgIH1cbiAgICBwYXRoID0gWyBkM19zdmdfbGluZURvdDQoZDNfc3ZnX2xpbmVCYXNpc0JlemllcjMsIHB4KSwgXCIsXCIsIGQzX3N2Z19saW5lRG90NChkM19zdmdfbGluZUJhc2lzQmV6aWVyMywgcHkpIF07XG4gICAgLS1pO1xuICAgIHdoaWxlICgrK2kgPCBtKSB7XG4gICAgICBwaSA9IHBvaW50c1tpICUgbl07XG4gICAgICBweC5zaGlmdCgpO1xuICAgICAgcHgucHVzaChwaVswXSk7XG4gICAgICBweS5zaGlmdCgpO1xuICAgICAgcHkucHVzaChwaVsxXSk7XG4gICAgICBkM19zdmdfbGluZUJhc2lzQmV6aWVyKHBhdGgsIHB4LCBweSk7XG4gICAgfVxuICAgIHJldHVybiBwYXRoLmpvaW4oXCJcIik7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc3ZnX2xpbmVCdW5kbGUocG9pbnRzLCB0ZW5zaW9uKSB7XG4gICAgdmFyIG4gPSBwb2ludHMubGVuZ3RoIC0gMTtcbiAgICBpZiAobikge1xuICAgICAgdmFyIHgwID0gcG9pbnRzWzBdWzBdLCB5MCA9IHBvaW50c1swXVsxXSwgZHggPSBwb2ludHNbbl1bMF0gLSB4MCwgZHkgPSBwb2ludHNbbl1bMV0gLSB5MCwgaSA9IC0xLCBwLCB0O1xuICAgICAgd2hpbGUgKCsraSA8PSBuKSB7XG4gICAgICAgIHAgPSBwb2ludHNbaV07XG4gICAgICAgIHQgPSBpIC8gbjtcbiAgICAgICAgcFswXSA9IHRlbnNpb24gKiBwWzBdICsgKDEgLSB0ZW5zaW9uKSAqICh4MCArIHQgKiBkeCk7XG4gICAgICAgIHBbMV0gPSB0ZW5zaW9uICogcFsxXSArICgxIC0gdGVuc2lvbikgKiAoeTAgKyB0ICogZHkpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZDNfc3ZnX2xpbmVCYXNpcyhwb2ludHMpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3N2Z19saW5lRG90NChhLCBiKSB7XG4gICAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV0gKyBhWzJdICogYlsyXSArIGFbM10gKiBiWzNdO1xuICB9XG4gIHZhciBkM19zdmdfbGluZUJhc2lzQmV6aWVyMSA9IFsgMCwgMiAvIDMsIDEgLyAzLCAwIF0sIGQzX3N2Z19saW5lQmFzaXNCZXppZXIyID0gWyAwLCAxIC8gMywgMiAvIDMsIDAgXSwgZDNfc3ZnX2xpbmVCYXNpc0JlemllcjMgPSBbIDAsIDEgLyA2LCAyIC8gMywgMSAvIDYgXTtcbiAgZnVuY3Rpb24gZDNfc3ZnX2xpbmVCYXNpc0JlemllcihwYXRoLCB4LCB5KSB7XG4gICAgcGF0aC5wdXNoKFwiQ1wiLCBkM19zdmdfbGluZURvdDQoZDNfc3ZnX2xpbmVCYXNpc0JlemllcjEsIHgpLCBcIixcIiwgZDNfc3ZnX2xpbmVEb3Q0KGQzX3N2Z19saW5lQmFzaXNCZXppZXIxLCB5KSwgXCIsXCIsIGQzX3N2Z19saW5lRG90NChkM19zdmdfbGluZUJhc2lzQmV6aWVyMiwgeCksIFwiLFwiLCBkM19zdmdfbGluZURvdDQoZDNfc3ZnX2xpbmVCYXNpc0JlemllcjIsIHkpLCBcIixcIiwgZDNfc3ZnX2xpbmVEb3Q0KGQzX3N2Z19saW5lQmFzaXNCZXppZXIzLCB4KSwgXCIsXCIsIGQzX3N2Z19saW5lRG90NChkM19zdmdfbGluZUJhc2lzQmV6aWVyMywgeSkpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3N2Z19saW5lU2xvcGUocDAsIHAxKSB7XG4gICAgcmV0dXJuIChwMVsxXSAtIHAwWzFdKSAvIChwMVswXSAtIHAwWzBdKTtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZUZpbml0ZURpZmZlcmVuY2VzKHBvaW50cykge1xuICAgIHZhciBpID0gMCwgaiA9IHBvaW50cy5sZW5ndGggLSAxLCBtID0gW10sIHAwID0gcG9pbnRzWzBdLCBwMSA9IHBvaW50c1sxXSwgZCA9IG1bMF0gPSBkM19zdmdfbGluZVNsb3BlKHAwLCBwMSk7XG4gICAgd2hpbGUgKCsraSA8IGopIHtcbiAgICAgIG1baV0gPSAoZCArIChkID0gZDNfc3ZnX2xpbmVTbG9wZShwMCA9IHAxLCBwMSA9IHBvaW50c1tpICsgMV0pKSkgLyAyO1xuICAgIH1cbiAgICBtW2ldID0gZDtcbiAgICByZXR1cm4gbTtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfbGluZU1vbm90b25lVGFuZ2VudHMocG9pbnRzKSB7XG4gICAgdmFyIHRhbmdlbnRzID0gW10sIGQsIGEsIGIsIHMsIG0gPSBkM19zdmdfbGluZUZpbml0ZURpZmZlcmVuY2VzKHBvaW50cyksIGkgPSAtMSwgaiA9IHBvaW50cy5sZW5ndGggLSAxO1xuICAgIHdoaWxlICgrK2kgPCBqKSB7XG4gICAgICBkID0gZDNfc3ZnX2xpbmVTbG9wZShwb2ludHNbaV0sIHBvaW50c1tpICsgMV0pO1xuICAgICAgaWYgKGFicyhkKSA8IM61KSB7XG4gICAgICAgIG1baV0gPSBtW2kgKyAxXSA9IDA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhID0gbVtpXSAvIGQ7XG4gICAgICAgIGIgPSBtW2kgKyAxXSAvIGQ7XG4gICAgICAgIHMgPSBhICogYSArIGIgKiBiO1xuICAgICAgICBpZiAocyA+IDkpIHtcbiAgICAgICAgICBzID0gZCAqIDMgLyBNYXRoLnNxcnQocyk7XG4gICAgICAgICAgbVtpXSA9IHMgKiBhO1xuICAgICAgICAgIG1baSArIDFdID0gcyAqIGI7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaSA9IC0xO1xuICAgIHdoaWxlICgrK2kgPD0gaikge1xuICAgICAgcyA9IChwb2ludHNbTWF0aC5taW4oaiwgaSArIDEpXVswXSAtIHBvaW50c1tNYXRoLm1heCgwLCBpIC0gMSldWzBdKSAvICg2ICogKDEgKyBtW2ldICogbVtpXSkpO1xuICAgICAgdGFuZ2VudHMucHVzaChbIHMgfHwgMCwgbVtpXSAqIHMgfHwgMCBdKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhbmdlbnRzO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3N2Z19saW5lTW9ub3RvbmUocG9pbnRzKSB7XG4gICAgcmV0dXJuIHBvaW50cy5sZW5ndGggPCAzID8gZDNfc3ZnX2xpbmVMaW5lYXIocG9pbnRzKSA6IHBvaW50c1swXSArIGQzX3N2Z19saW5lSGVybWl0ZShwb2ludHMsIGQzX3N2Z19saW5lTW9ub3RvbmVUYW5nZW50cyhwb2ludHMpKTtcbiAgfVxuICBkMy5zdmcubGluZS5yYWRpYWwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbGluZSA9IGQzX3N2Z19saW5lKGQzX3N2Z19saW5lUmFkaWFsKTtcbiAgICBsaW5lLnJhZGl1cyA9IGxpbmUueCwgZGVsZXRlIGxpbmUueDtcbiAgICBsaW5lLmFuZ2xlID0gbGluZS55LCBkZWxldGUgbGluZS55O1xuICAgIHJldHVybiBsaW5lO1xuICB9O1xuICBmdW5jdGlvbiBkM19zdmdfbGluZVJhZGlhbChwb2ludHMpIHtcbiAgICB2YXIgcG9pbnQsIGkgPSAtMSwgbiA9IHBvaW50cy5sZW5ndGgsIHIsIGE7XG4gICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgIHBvaW50ID0gcG9pbnRzW2ldO1xuICAgICAgciA9IHBvaW50WzBdO1xuICAgICAgYSA9IHBvaW50WzFdICsgZDNfc3ZnX2FyY09mZnNldDtcbiAgICAgIHBvaW50WzBdID0gciAqIE1hdGguY29zKGEpO1xuICAgICAgcG9pbnRbMV0gPSByICogTWF0aC5zaW4oYSk7XG4gICAgfVxuICAgIHJldHVybiBwb2ludHM7XG4gIH1cbiAgZnVuY3Rpb24gZDNfc3ZnX2FyZWEocHJvamVjdGlvbikge1xuICAgIHZhciB4MCA9IGQzX2dlb21fcG9pbnRYLCB4MSA9IGQzX2dlb21fcG9pbnRYLCB5MCA9IDAsIHkxID0gZDNfZ2VvbV9wb2ludFksIGRlZmluZWQgPSBkM190cnVlLCBpbnRlcnBvbGF0ZSA9IGQzX3N2Z19saW5lTGluZWFyLCBpbnRlcnBvbGF0ZUtleSA9IGludGVycG9sYXRlLmtleSwgaW50ZXJwb2xhdGVSZXZlcnNlID0gaW50ZXJwb2xhdGUsIEwgPSBcIkxcIiwgdGVuc2lvbiA9IC43O1xuICAgIGZ1bmN0aW9uIGFyZWEoZGF0YSkge1xuICAgICAgdmFyIHNlZ21lbnRzID0gW10sIHBvaW50czAgPSBbXSwgcG9pbnRzMSA9IFtdLCBpID0gLTEsIG4gPSBkYXRhLmxlbmd0aCwgZCwgZngwID0gZDNfZnVuY3Rvcih4MCksIGZ5MCA9IGQzX2Z1bmN0b3IoeTApLCBmeDEgPSB4MCA9PT0geDEgPyBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgICB9IDogZDNfZnVuY3Rvcih4MSksIGZ5MSA9IHkwID09PSB5MSA/IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4geTtcbiAgICAgIH0gOiBkM19mdW5jdG9yKHkxKSwgeCwgeTtcbiAgICAgIGZ1bmN0aW9uIHNlZ21lbnQoKSB7XG4gICAgICAgIHNlZ21lbnRzLnB1c2goXCJNXCIsIGludGVycG9sYXRlKHByb2plY3Rpb24ocG9pbnRzMSksIHRlbnNpb24pLCBMLCBpbnRlcnBvbGF0ZVJldmVyc2UocHJvamVjdGlvbihwb2ludHMwLnJldmVyc2UoKSksIHRlbnNpb24pLCBcIlpcIik7XG4gICAgICB9XG4gICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICBpZiAoZGVmaW5lZC5jYWxsKHRoaXMsIGQgPSBkYXRhW2ldLCBpKSkge1xuICAgICAgICAgIHBvaW50czAucHVzaChbIHggPSArZngwLmNhbGwodGhpcywgZCwgaSksIHkgPSArZnkwLmNhbGwodGhpcywgZCwgaSkgXSk7XG4gICAgICAgICAgcG9pbnRzMS5wdXNoKFsgK2Z4MS5jYWxsKHRoaXMsIGQsIGkpLCArZnkxLmNhbGwodGhpcywgZCwgaSkgXSk7XG4gICAgICAgIH0gZWxzZSBpZiAocG9pbnRzMC5sZW5ndGgpIHtcbiAgICAgICAgICBzZWdtZW50KCk7XG4gICAgICAgICAgcG9pbnRzMCA9IFtdO1xuICAgICAgICAgIHBvaW50czEgPSBbXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHBvaW50czAubGVuZ3RoKSBzZWdtZW50KCk7XG4gICAgICByZXR1cm4gc2VnbWVudHMubGVuZ3RoID8gc2VnbWVudHMuam9pbihcIlwiKSA6IG51bGw7XG4gICAgfVxuICAgIGFyZWEueCA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHgxO1xuICAgICAgeDAgPSB4MSA9IF87XG4gICAgICByZXR1cm4gYXJlYTtcbiAgICB9O1xuICAgIGFyZWEueDAgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB4MDtcbiAgICAgIHgwID0gXztcbiAgICAgIHJldHVybiBhcmVhO1xuICAgIH07XG4gICAgYXJlYS54MSA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHgxO1xuICAgICAgeDEgPSBfO1xuICAgICAgcmV0dXJuIGFyZWE7XG4gICAgfTtcbiAgICBhcmVhLnkgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB5MTtcbiAgICAgIHkwID0geTEgPSBfO1xuICAgICAgcmV0dXJuIGFyZWE7XG4gICAgfTtcbiAgICBhcmVhLnkwID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geTA7XG4gICAgICB5MCA9IF87XG4gICAgICByZXR1cm4gYXJlYTtcbiAgICB9O1xuICAgIGFyZWEueTEgPSBmdW5jdGlvbihfKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB5MTtcbiAgICAgIHkxID0gXztcbiAgICAgIHJldHVybiBhcmVhO1xuICAgIH07XG4gICAgYXJlYS5kZWZpbmVkID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZGVmaW5lZDtcbiAgICAgIGRlZmluZWQgPSBfO1xuICAgICAgcmV0dXJuIGFyZWE7XG4gICAgfTtcbiAgICBhcmVhLmludGVycG9sYXRlID0gZnVuY3Rpb24oXykge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gaW50ZXJwb2xhdGVLZXk7XG4gICAgICBpZiAodHlwZW9mIF8gPT09IFwiZnVuY3Rpb25cIikgaW50ZXJwb2xhdGVLZXkgPSBpbnRlcnBvbGF0ZSA9IF87IGVsc2UgaW50ZXJwb2xhdGVLZXkgPSAoaW50ZXJwb2xhdGUgPSBkM19zdmdfbGluZUludGVycG9sYXRvcnMuZ2V0KF8pIHx8IGQzX3N2Z19saW5lTGluZWFyKS5rZXk7XG4gICAgICBpbnRlcnBvbGF0ZVJldmVyc2UgPSBpbnRlcnBvbGF0ZS5yZXZlcnNlIHx8IGludGVycG9sYXRlO1xuICAgICAgTCA9IGludGVycG9sYXRlLmNsb3NlZCA/IFwiTVwiIDogXCJMXCI7XG4gICAgICByZXR1cm4gYXJlYTtcbiAgICB9O1xuICAgIGFyZWEudGVuc2lvbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRlbnNpb247XG4gICAgICB0ZW5zaW9uID0gXztcbiAgICAgIHJldHVybiBhcmVhO1xuICAgIH07XG4gICAgcmV0dXJuIGFyZWE7XG4gIH1cbiAgZDNfc3ZnX2xpbmVTdGVwQmVmb3JlLnJldmVyc2UgPSBkM19zdmdfbGluZVN0ZXBBZnRlcjtcbiAgZDNfc3ZnX2xpbmVTdGVwQWZ0ZXIucmV2ZXJzZSA9IGQzX3N2Z19saW5lU3RlcEJlZm9yZTtcbiAgZDMuc3ZnLmFyZWEgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfc3ZnX2FyZWEoZDNfaWRlbnRpdHkpO1xuICB9O1xuICBkMy5zdmcuYXJlYS5yYWRpYWwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJlYSA9IGQzX3N2Z19hcmVhKGQzX3N2Z19saW5lUmFkaWFsKTtcbiAgICBhcmVhLnJhZGl1cyA9IGFyZWEueCwgZGVsZXRlIGFyZWEueDtcbiAgICBhcmVhLmlubmVyUmFkaXVzID0gYXJlYS54MCwgZGVsZXRlIGFyZWEueDA7XG4gICAgYXJlYS5vdXRlclJhZGl1cyA9IGFyZWEueDEsIGRlbGV0ZSBhcmVhLngxO1xuICAgIGFyZWEuYW5nbGUgPSBhcmVhLnksIGRlbGV0ZSBhcmVhLnk7XG4gICAgYXJlYS5zdGFydEFuZ2xlID0gYXJlYS55MCwgZGVsZXRlIGFyZWEueTA7XG4gICAgYXJlYS5lbmRBbmdsZSA9IGFyZWEueTEsIGRlbGV0ZSBhcmVhLnkxO1xuICAgIHJldHVybiBhcmVhO1xuICB9O1xuICBkMy5zdmcuY2hvcmQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc291cmNlID0gZDNfc291cmNlLCB0YXJnZXQgPSBkM190YXJnZXQsIHJhZGl1cyA9IGQzX3N2Z19jaG9yZFJhZGl1cywgc3RhcnRBbmdsZSA9IGQzX3N2Z19hcmNTdGFydEFuZ2xlLCBlbmRBbmdsZSA9IGQzX3N2Z19hcmNFbmRBbmdsZTtcbiAgICBmdW5jdGlvbiBjaG9yZChkLCBpKSB7XG4gICAgICB2YXIgcyA9IHN1Ymdyb3VwKHRoaXMsIHNvdXJjZSwgZCwgaSksIHQgPSBzdWJncm91cCh0aGlzLCB0YXJnZXQsIGQsIGkpO1xuICAgICAgcmV0dXJuIFwiTVwiICsgcy5wMCArIGFyYyhzLnIsIHMucDEsIHMuYTEgLSBzLmEwKSArIChlcXVhbHMocywgdCkgPyBjdXJ2ZShzLnIsIHMucDEsIHMuciwgcy5wMCkgOiBjdXJ2ZShzLnIsIHMucDEsIHQuciwgdC5wMCkgKyBhcmModC5yLCB0LnAxLCB0LmExIC0gdC5hMCkgKyBjdXJ2ZSh0LnIsIHQucDEsIHMuciwgcy5wMCkpICsgXCJaXCI7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHN1Ymdyb3VwKHNlbGYsIGYsIGQsIGkpIHtcbiAgICAgIHZhciBzdWJncm91cCA9IGYuY2FsbChzZWxmLCBkLCBpKSwgciA9IHJhZGl1cy5jYWxsKHNlbGYsIHN1Ymdyb3VwLCBpKSwgYTAgPSBzdGFydEFuZ2xlLmNhbGwoc2VsZiwgc3ViZ3JvdXAsIGkpICsgZDNfc3ZnX2FyY09mZnNldCwgYTEgPSBlbmRBbmdsZS5jYWxsKHNlbGYsIHN1Ymdyb3VwLCBpKSArIGQzX3N2Z19hcmNPZmZzZXQ7XG4gICAgICByZXR1cm4ge1xuICAgICAgICByOiByLFxuICAgICAgICBhMDogYTAsXG4gICAgICAgIGExOiBhMSxcbiAgICAgICAgcDA6IFsgciAqIE1hdGguY29zKGEwKSwgciAqIE1hdGguc2luKGEwKSBdLFxuICAgICAgICBwMTogWyByICogTWF0aC5jb3MoYTEpLCByICogTWF0aC5zaW4oYTEpIF1cbiAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XG4gICAgICByZXR1cm4gYS5hMCA9PSBiLmEwICYmIGEuYTEgPT0gYi5hMTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYXJjKHIsIHAsIGEpIHtcbiAgICAgIHJldHVybiBcIkFcIiArIHIgKyBcIixcIiArIHIgKyBcIiAwIFwiICsgKyhhID4gz4ApICsgXCIsMSBcIiArIHA7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGN1cnZlKHIwLCBwMCwgcjEsIHAxKSB7XG4gICAgICByZXR1cm4gXCJRIDAsMCBcIiArIHAxO1xuICAgIH1cbiAgICBjaG9yZC5yYWRpdXMgPSBmdW5jdGlvbih2KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiByYWRpdXM7XG4gICAgICByYWRpdXMgPSBkM19mdW5jdG9yKHYpO1xuICAgICAgcmV0dXJuIGNob3JkO1xuICAgIH07XG4gICAgY2hvcmQuc291cmNlID0gZnVuY3Rpb24odikge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc291cmNlO1xuICAgICAgc291cmNlID0gZDNfZnVuY3Rvcih2KTtcbiAgICAgIHJldHVybiBjaG9yZDtcbiAgICB9O1xuICAgIGNob3JkLnRhcmdldCA9IGZ1bmN0aW9uKHYpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRhcmdldDtcbiAgICAgIHRhcmdldCA9IGQzX2Z1bmN0b3Iodik7XG4gICAgICByZXR1cm4gY2hvcmQ7XG4gICAgfTtcbiAgICBjaG9yZC5zdGFydEFuZ2xlID0gZnVuY3Rpb24odikge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gc3RhcnRBbmdsZTtcbiAgICAgIHN0YXJ0QW5nbGUgPSBkM19mdW5jdG9yKHYpO1xuICAgICAgcmV0dXJuIGNob3JkO1xuICAgIH07XG4gICAgY2hvcmQuZW5kQW5nbGUgPSBmdW5jdGlvbih2KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBlbmRBbmdsZTtcbiAgICAgIGVuZEFuZ2xlID0gZDNfZnVuY3Rvcih2KTtcbiAgICAgIHJldHVybiBjaG9yZDtcbiAgICB9O1xuICAgIHJldHVybiBjaG9yZDtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc3ZnX2Nob3JkUmFkaXVzKGQpIHtcbiAgICByZXR1cm4gZC5yYWRpdXM7XG4gIH1cbiAgZDMuc3ZnLmRpYWdvbmFsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNvdXJjZSA9IGQzX3NvdXJjZSwgdGFyZ2V0ID0gZDNfdGFyZ2V0LCBwcm9qZWN0aW9uID0gZDNfc3ZnX2RpYWdvbmFsUHJvamVjdGlvbjtcbiAgICBmdW5jdGlvbiBkaWFnb25hbChkLCBpKSB7XG4gICAgICB2YXIgcDAgPSBzb3VyY2UuY2FsbCh0aGlzLCBkLCBpKSwgcDMgPSB0YXJnZXQuY2FsbCh0aGlzLCBkLCBpKSwgbSA9IChwMC55ICsgcDMueSkgLyAyLCBwID0gWyBwMCwge1xuICAgICAgICB4OiBwMC54LFxuICAgICAgICB5OiBtXG4gICAgICB9LCB7XG4gICAgICAgIHg6IHAzLngsXG4gICAgICAgIHk6IG1cbiAgICAgIH0sIHAzIF07XG4gICAgICBwID0gcC5tYXAocHJvamVjdGlvbik7XG4gICAgICByZXR1cm4gXCJNXCIgKyBwWzBdICsgXCJDXCIgKyBwWzFdICsgXCIgXCIgKyBwWzJdICsgXCIgXCIgKyBwWzNdO1xuICAgIH1cbiAgICBkaWFnb25hbC5zb3VyY2UgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBzb3VyY2U7XG4gICAgICBzb3VyY2UgPSBkM19mdW5jdG9yKHgpO1xuICAgICAgcmV0dXJuIGRpYWdvbmFsO1xuICAgIH07XG4gICAgZGlhZ29uYWwudGFyZ2V0ID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGFyZ2V0O1xuICAgICAgdGFyZ2V0ID0gZDNfZnVuY3Rvcih4KTtcbiAgICAgIHJldHVybiBkaWFnb25hbDtcbiAgICB9O1xuICAgIGRpYWdvbmFsLnByb2plY3Rpb24gPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBwcm9qZWN0aW9uO1xuICAgICAgcHJvamVjdGlvbiA9IHg7XG4gICAgICByZXR1cm4gZGlhZ29uYWw7XG4gICAgfTtcbiAgICByZXR1cm4gZGlhZ29uYWw7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3N2Z19kaWFnb25hbFByb2plY3Rpb24oZCkge1xuICAgIHJldHVybiBbIGQueCwgZC55IF07XG4gIH1cbiAgZDMuc3ZnLmRpYWdvbmFsLnJhZGlhbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkaWFnb25hbCA9IGQzLnN2Zy5kaWFnb25hbCgpLCBwcm9qZWN0aW9uID0gZDNfc3ZnX2RpYWdvbmFsUHJvamVjdGlvbiwgcHJvamVjdGlvbl8gPSBkaWFnb25hbC5wcm9qZWN0aW9uO1xuICAgIGRpYWdvbmFsLnByb2plY3Rpb24gPSBmdW5jdGlvbih4KSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IHByb2plY3Rpb25fKGQzX3N2Z19kaWFnb25hbFJhZGlhbFByb2plY3Rpb24ocHJvamVjdGlvbiA9IHgpKSA6IHByb2plY3Rpb247XG4gICAgfTtcbiAgICByZXR1cm4gZGlhZ29uYWw7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3N2Z19kaWFnb25hbFJhZGlhbFByb2plY3Rpb24ocHJvamVjdGlvbikge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBkID0gcHJvamVjdGlvbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpLCByID0gZFswXSwgYSA9IGRbMV0gKyBkM19zdmdfYXJjT2Zmc2V0O1xuICAgICAgcmV0dXJuIFsgciAqIE1hdGguY29zKGEpLCByICogTWF0aC5zaW4oYSkgXTtcbiAgICB9O1xuICB9XG4gIGQzLnN2Zy5zeW1ib2wgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdHlwZSA9IGQzX3N2Z19zeW1ib2xUeXBlLCBzaXplID0gZDNfc3ZnX3N5bWJvbFNpemU7XG4gICAgZnVuY3Rpb24gc3ltYm9sKGQsIGkpIHtcbiAgICAgIHJldHVybiAoZDNfc3ZnX3N5bWJvbHMuZ2V0KHR5cGUuY2FsbCh0aGlzLCBkLCBpKSkgfHwgZDNfc3ZnX3N5bWJvbENpcmNsZSkoc2l6ZS5jYWxsKHRoaXMsIGQsIGkpKTtcbiAgICB9XG4gICAgc3ltYm9sLnR5cGUgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0eXBlO1xuICAgICAgdHlwZSA9IGQzX2Z1bmN0b3IoeCk7XG4gICAgICByZXR1cm4gc3ltYm9sO1xuICAgIH07XG4gICAgc3ltYm9sLnNpemUgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBzaXplO1xuICAgICAgc2l6ZSA9IGQzX2Z1bmN0b3IoeCk7XG4gICAgICByZXR1cm4gc3ltYm9sO1xuICAgIH07XG4gICAgcmV0dXJuIHN5bWJvbDtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfc3ZnX3N5bWJvbFNpemUoKSB7XG4gICAgcmV0dXJuIDY0O1xuICB9XG4gIGZ1bmN0aW9uIGQzX3N2Z19zeW1ib2xUeXBlKCkge1xuICAgIHJldHVybiBcImNpcmNsZVwiO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3N2Z19zeW1ib2xDaXJjbGUoc2l6ZSkge1xuICAgIHZhciByID0gTWF0aC5zcXJ0KHNpemUgLyDPgCk7XG4gICAgcmV0dXJuIFwiTTAsXCIgKyByICsgXCJBXCIgKyByICsgXCIsXCIgKyByICsgXCIgMCAxLDEgMCxcIiArIC1yICsgXCJBXCIgKyByICsgXCIsXCIgKyByICsgXCIgMCAxLDEgMCxcIiArIHIgKyBcIlpcIjtcbiAgfVxuICB2YXIgZDNfc3ZnX3N5bWJvbHMgPSBkMy5tYXAoe1xuICAgIGNpcmNsZTogZDNfc3ZnX3N5bWJvbENpcmNsZSxcbiAgICBjcm9zczogZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgdmFyIHIgPSBNYXRoLnNxcnQoc2l6ZSAvIDUpIC8gMjtcbiAgICAgIHJldHVybiBcIk1cIiArIC0zICogciArIFwiLFwiICsgLXIgKyBcIkhcIiArIC1yICsgXCJWXCIgKyAtMyAqIHIgKyBcIkhcIiArIHIgKyBcIlZcIiArIC1yICsgXCJIXCIgKyAzICogciArIFwiVlwiICsgciArIFwiSFwiICsgciArIFwiVlwiICsgMyAqIHIgKyBcIkhcIiArIC1yICsgXCJWXCIgKyByICsgXCJIXCIgKyAtMyAqIHIgKyBcIlpcIjtcbiAgICB9LFxuICAgIGRpYW1vbmQ6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICAgIHZhciByeSA9IE1hdGguc3FydChzaXplIC8gKDIgKiBkM19zdmdfc3ltYm9sVGFuMzApKSwgcnggPSByeSAqIGQzX3N2Z19zeW1ib2xUYW4zMDtcbiAgICAgIHJldHVybiBcIk0wLFwiICsgLXJ5ICsgXCJMXCIgKyByeCArIFwiLDBcIiArIFwiIDAsXCIgKyByeSArIFwiIFwiICsgLXJ4ICsgXCIsMFwiICsgXCJaXCI7XG4gICAgfSxcbiAgICBzcXVhcmU6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICAgIHZhciByID0gTWF0aC5zcXJ0KHNpemUpIC8gMjtcbiAgICAgIHJldHVybiBcIk1cIiArIC1yICsgXCIsXCIgKyAtciArIFwiTFwiICsgciArIFwiLFwiICsgLXIgKyBcIiBcIiArIHIgKyBcIixcIiArIHIgKyBcIiBcIiArIC1yICsgXCIsXCIgKyByICsgXCJaXCI7XG4gICAgfSxcbiAgICBcInRyaWFuZ2xlLWRvd25cIjogZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgdmFyIHJ4ID0gTWF0aC5zcXJ0KHNpemUgLyBkM19zdmdfc3ltYm9sU3FydDMpLCByeSA9IHJ4ICogZDNfc3ZnX3N5bWJvbFNxcnQzIC8gMjtcbiAgICAgIHJldHVybiBcIk0wLFwiICsgcnkgKyBcIkxcIiArIHJ4ICsgXCIsXCIgKyAtcnkgKyBcIiBcIiArIC1yeCArIFwiLFwiICsgLXJ5ICsgXCJaXCI7XG4gICAgfSxcbiAgICBcInRyaWFuZ2xlLXVwXCI6IGZ1bmN0aW9uKHNpemUpIHtcbiAgICAgIHZhciByeCA9IE1hdGguc3FydChzaXplIC8gZDNfc3ZnX3N5bWJvbFNxcnQzKSwgcnkgPSByeCAqIGQzX3N2Z19zeW1ib2xTcXJ0MyAvIDI7XG4gICAgICByZXR1cm4gXCJNMCxcIiArIC1yeSArIFwiTFwiICsgcnggKyBcIixcIiArIHJ5ICsgXCIgXCIgKyAtcnggKyBcIixcIiArIHJ5ICsgXCJaXCI7XG4gICAgfVxuICB9KTtcbiAgZDMuc3ZnLnN5bWJvbFR5cGVzID0gZDNfc3ZnX3N5bWJvbHMua2V5cygpO1xuICB2YXIgZDNfc3ZnX3N5bWJvbFNxcnQzID0gTWF0aC5zcXJ0KDMpLCBkM19zdmdfc3ltYm9sVGFuMzAgPSBNYXRoLnRhbigzMCAqIGQzX3JhZGlhbnMpO1xuICBmdW5jdGlvbiBkM190cmFuc2l0aW9uKGdyb3VwcywgaWQpIHtcbiAgICBkM19zdWJjbGFzcyhncm91cHMsIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUpO1xuICAgIGdyb3Vwcy5pZCA9IGlkO1xuICAgIHJldHVybiBncm91cHM7XG4gIH1cbiAgdmFyIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUgPSBbXSwgZDNfdHJhbnNpdGlvbklkID0gMCwgZDNfdHJhbnNpdGlvbkluaGVyaXRJZCwgZDNfdHJhbnNpdGlvbkluaGVyaXQ7XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUuY2FsbCA9IGQzX3NlbGVjdGlvblByb3RvdHlwZS5jYWxsO1xuICBkM190cmFuc2l0aW9uUHJvdG90eXBlLmVtcHR5ID0gZDNfc2VsZWN0aW9uUHJvdG90eXBlLmVtcHR5O1xuICBkM190cmFuc2l0aW9uUHJvdG90eXBlLm5vZGUgPSBkM19zZWxlY3Rpb25Qcm90b3R5cGUubm9kZTtcbiAgZDNfdHJhbnNpdGlvblByb3RvdHlwZS5zaXplID0gZDNfc2VsZWN0aW9uUHJvdG90eXBlLnNpemU7XG4gIGQzLnRyYW5zaXRpb24gPSBmdW5jdGlvbihzZWxlY3Rpb24pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IGQzX3RyYW5zaXRpb25Jbmhlcml0SWQgPyBzZWxlY3Rpb24udHJhbnNpdGlvbigpIDogc2VsZWN0aW9uIDogZDNfc2VsZWN0aW9uUm9vdC50cmFuc2l0aW9uKCk7XG4gIH07XG4gIGQzLnRyYW5zaXRpb24ucHJvdG90eXBlID0gZDNfdHJhbnNpdGlvblByb3RvdHlwZTtcbiAgZDNfdHJhbnNpdGlvblByb3RvdHlwZS5zZWxlY3QgPSBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgIHZhciBpZCA9IHRoaXMuaWQsIHN1Ymdyb3VwcyA9IFtdLCBzdWJncm91cCwgc3Vibm9kZSwgbm9kZTtcbiAgICBzZWxlY3RvciA9IGQzX3NlbGVjdGlvbl9zZWxlY3RvcihzZWxlY3Rvcik7XG4gICAgZm9yICh2YXIgaiA9IC0xLCBtID0gdGhpcy5sZW5ndGg7ICsraiA8IG07ICkge1xuICAgICAgc3ViZ3JvdXBzLnB1c2goc3ViZ3JvdXAgPSBbXSk7XG4gICAgICBmb3IgKHZhciBncm91cCA9IHRoaXNbal0sIGkgPSAtMSwgbiA9IGdyb3VwLmxlbmd0aDsgKytpIDwgbjsgKSB7XG4gICAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiAoc3Vibm9kZSA9IHNlbGVjdG9yLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgaikpKSB7XG4gICAgICAgICAgaWYgKFwiX19kYXRhX19cIiBpbiBub2RlKSBzdWJub2RlLl9fZGF0YV9fID0gbm9kZS5fX2RhdGFfXztcbiAgICAgICAgICBkM190cmFuc2l0aW9uTm9kZShzdWJub2RlLCBpLCBpZCwgbm9kZS5fX3RyYW5zaXRpb25fX1tpZF0pO1xuICAgICAgICAgIHN1Ymdyb3VwLnB1c2goc3Vibm9kZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3ViZ3JvdXAucHVzaChudWxsKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZDNfdHJhbnNpdGlvbihzdWJncm91cHMsIGlkKTtcbiAgfTtcbiAgZDNfdHJhbnNpdGlvblByb3RvdHlwZS5zZWxlY3RBbGwgPSBmdW5jdGlvbihzZWxlY3Rvcikge1xuICAgIHZhciBpZCA9IHRoaXMuaWQsIHN1Ymdyb3VwcyA9IFtdLCBzdWJncm91cCwgc3Vibm9kZXMsIG5vZGUsIHN1Ym5vZGUsIHRyYW5zaXRpb247XG4gICAgc2VsZWN0b3IgPSBkM19zZWxlY3Rpb25fc2VsZWN0b3JBbGwoc2VsZWN0b3IpO1xuICAgIGZvciAodmFyIGogPSAtMSwgbSA9IHRoaXMubGVuZ3RoOyArK2ogPCBtOyApIHtcbiAgICAgIGZvciAodmFyIGdyb3VwID0gdGhpc1tqXSwgaSA9IC0xLCBuID0gZ3JvdXAubGVuZ3RoOyArK2kgPCBuOyApIHtcbiAgICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICAgIHRyYW5zaXRpb24gPSBub2RlLl9fdHJhbnNpdGlvbl9fW2lkXTtcbiAgICAgICAgICBzdWJub2RlcyA9IHNlbGVjdG9yLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgaik7XG4gICAgICAgICAgc3ViZ3JvdXBzLnB1c2goc3ViZ3JvdXAgPSBbXSk7XG4gICAgICAgICAgZm9yICh2YXIgayA9IC0xLCBvID0gc3Vibm9kZXMubGVuZ3RoOyArK2sgPCBvOyApIHtcbiAgICAgICAgICAgIGlmIChzdWJub2RlID0gc3Vibm9kZXNba10pIGQzX3RyYW5zaXRpb25Ob2RlKHN1Ym5vZGUsIGssIGlkLCB0cmFuc2l0aW9uKTtcbiAgICAgICAgICAgIHN1Ymdyb3VwLnB1c2goc3Vibm9kZSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkM190cmFuc2l0aW9uKHN1Ymdyb3VwcywgaWQpO1xuICB9O1xuICBkM190cmFuc2l0aW9uUHJvdG90eXBlLmZpbHRlciA9IGZ1bmN0aW9uKGZpbHRlcikge1xuICAgIHZhciBzdWJncm91cHMgPSBbXSwgc3ViZ3JvdXAsIGdyb3VwLCBub2RlO1xuICAgIGlmICh0eXBlb2YgZmlsdGVyICE9PSBcImZ1bmN0aW9uXCIpIGZpbHRlciA9IGQzX3NlbGVjdGlvbl9maWx0ZXIoZmlsdGVyKTtcbiAgICBmb3IgKHZhciBqID0gMCwgbSA9IHRoaXMubGVuZ3RoOyBqIDwgbTsgaisrKSB7XG4gICAgICBzdWJncm91cHMucHVzaChzdWJncm91cCA9IFtdKTtcbiAgICAgIGZvciAodmFyIGdyb3VwID0gdGhpc1tqXSwgaSA9IDAsIG4gPSBncm91cC5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIGZpbHRlci5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGopKSB7XG4gICAgICAgICAgc3ViZ3JvdXAucHVzaChub2RlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZDNfdHJhbnNpdGlvbihzdWJncm91cHMsIHRoaXMuaWQpO1xuICB9O1xuICBkM190cmFuc2l0aW9uUHJvdG90eXBlLnR3ZWVuID0gZnVuY3Rpb24obmFtZSwgdHdlZW4pIHtcbiAgICB2YXIgaWQgPSB0aGlzLmlkO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcmV0dXJuIHRoaXMubm9kZSgpLl9fdHJhbnNpdGlvbl9fW2lkXS50d2Vlbi5nZXQobmFtZSk7XG4gICAgcmV0dXJuIGQzX3NlbGVjdGlvbl9lYWNoKHRoaXMsIHR3ZWVuID09IG51bGwgPyBmdW5jdGlvbihub2RlKSB7XG4gICAgICBub2RlLl9fdHJhbnNpdGlvbl9fW2lkXS50d2Vlbi5yZW1vdmUobmFtZSk7XG4gICAgfSA6IGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIG5vZGUuX190cmFuc2l0aW9uX19baWRdLnR3ZWVuLnNldChuYW1lLCB0d2Vlbik7XG4gICAgfSk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3RyYW5zaXRpb25fdHdlZW4oZ3JvdXBzLCBuYW1lLCB2YWx1ZSwgdHdlZW4pIHtcbiAgICB2YXIgaWQgPSBncm91cHMuaWQ7XG4gICAgcmV0dXJuIGQzX3NlbGVjdGlvbl9lYWNoKGdyb3VwcywgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyBmdW5jdGlvbihub2RlLCBpLCBqKSB7XG4gICAgICBub2RlLl9fdHJhbnNpdGlvbl9fW2lkXS50d2Vlbi5zZXQobmFtZSwgdHdlZW4odmFsdWUuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBqKSkpO1xuICAgIH0gOiAodmFsdWUgPSB0d2Vlbih2YWx1ZSksIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICAgIG5vZGUuX190cmFuc2l0aW9uX19baWRdLnR3ZWVuLnNldChuYW1lLCB2YWx1ZSk7XG4gICAgfSkpO1xuICB9XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUuYXR0ciA9IGZ1bmN0aW9uKG5hbWVOUywgdmFsdWUpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIGZvciAodmFsdWUgaW4gbmFtZU5TKSB0aGlzLmF0dHIodmFsdWUsIG5hbWVOU1t2YWx1ZV0pO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIHZhciBpbnRlcnBvbGF0ZSA9IG5hbWVOUyA9PSBcInRyYW5zZm9ybVwiID8gZDNfaW50ZXJwb2xhdGVUcmFuc2Zvcm0gOiBkM19pbnRlcnBvbGF0ZSwgbmFtZSA9IGQzLm5zLnF1YWxpZnkobmFtZU5TKTtcbiAgICBmdW5jdGlvbiBhdHRyTnVsbCgpIHtcbiAgICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBhdHRyTnVsbE5TKCkge1xuICAgICAgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhuYW1lLnNwYWNlLCBuYW1lLmxvY2FsKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYXR0clR3ZWVuKGIpIHtcbiAgICAgIHJldHVybiBiID09IG51bGwgPyBhdHRyTnVsbCA6IChiICs9IFwiXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYSA9IHRoaXMuZ2V0QXR0cmlidXRlKG5hbWUpLCBpO1xuICAgICAgICByZXR1cm4gYSAhPT0gYiAmJiAoaSA9IGludGVycG9sYXRlKGEsIGIpLCBmdW5jdGlvbih0KSB7XG4gICAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgaSh0KSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGF0dHJUd2Vlbk5TKGIpIHtcbiAgICAgIHJldHVybiBiID09IG51bGwgPyBhdHRyTnVsbE5TIDogKGIgKz0gXCJcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhID0gdGhpcy5nZXRBdHRyaWJ1dGVOUyhuYW1lLnNwYWNlLCBuYW1lLmxvY2FsKSwgaTtcbiAgICAgICAgcmV0dXJuIGEgIT09IGIgJiYgKGkgPSBpbnRlcnBvbGF0ZShhLCBiKSwgZnVuY3Rpb24odCkge1xuICAgICAgICAgIHRoaXMuc2V0QXR0cmlidXRlTlMobmFtZS5zcGFjZSwgbmFtZS5sb2NhbCwgaSh0KSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBkM190cmFuc2l0aW9uX3R3ZWVuKHRoaXMsIFwiYXR0ci5cIiArIG5hbWVOUywgdmFsdWUsIG5hbWUubG9jYWwgPyBhdHRyVHdlZW5OUyA6IGF0dHJUd2Vlbik7XG4gIH07XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUuYXR0clR3ZWVuID0gZnVuY3Rpb24obmFtZU5TLCB0d2Vlbikge1xuICAgIHZhciBuYW1lID0gZDMubnMucXVhbGlmeShuYW1lTlMpO1xuICAgIGZ1bmN0aW9uIGF0dHJUd2VlbihkLCBpKSB7XG4gICAgICB2YXIgZiA9IHR3ZWVuLmNhbGwodGhpcywgZCwgaSwgdGhpcy5nZXRBdHRyaWJ1dGUobmFtZSkpO1xuICAgICAgcmV0dXJuIGYgJiYgZnVuY3Rpb24odCkge1xuICAgICAgICB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCBmKHQpKTtcbiAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGF0dHJUd2Vlbk5TKGQsIGkpIHtcbiAgICAgIHZhciBmID0gdHdlZW4uY2FsbCh0aGlzLCBkLCBpLCB0aGlzLmdldEF0dHJpYnV0ZU5TKG5hbWUuc3BhY2UsIG5hbWUubG9jYWwpKTtcbiAgICAgIHJldHVybiBmICYmIGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgdGhpcy5zZXRBdHRyaWJ1dGVOUyhuYW1lLnNwYWNlLCBuYW1lLmxvY2FsLCBmKHQpKTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnR3ZWVuKFwiYXR0ci5cIiArIG5hbWVOUywgbmFtZS5sb2NhbCA/IGF0dHJUd2Vlbk5TIDogYXR0clR3ZWVuKTtcbiAgfTtcbiAgZDNfdHJhbnNpdGlvblByb3RvdHlwZS5zdHlsZSA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICAgIHZhciBuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBpZiAobiA8IDMpIHtcbiAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gXCJzdHJpbmdcIikge1xuICAgICAgICBpZiAobiA8IDIpIHZhbHVlID0gXCJcIjtcbiAgICAgICAgZm9yIChwcmlvcml0eSBpbiBuYW1lKSB0aGlzLnN0eWxlKHByaW9yaXR5LCBuYW1lW3ByaW9yaXR5XSwgdmFsdWUpO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cbiAgICAgIHByaW9yaXR5ID0gXCJcIjtcbiAgICB9XG4gICAgZnVuY3Rpb24gc3R5bGVOdWxsKCkge1xuICAgICAgdGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gc3R5bGVTdHJpbmcoYikge1xuICAgICAgcmV0dXJuIGIgPT0gbnVsbCA/IHN0eWxlTnVsbCA6IChiICs9IFwiXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYSA9IGQzX3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMsIG51bGwpLmdldFByb3BlcnR5VmFsdWUobmFtZSksIGk7XG4gICAgICAgIHJldHVybiBhICE9PSBiICYmIChpID0gZDNfaW50ZXJwb2xhdGUoYSwgYiksIGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIGkodCksIHByaW9yaXR5KTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGQzX3RyYW5zaXRpb25fdHdlZW4odGhpcywgXCJzdHlsZS5cIiArIG5hbWUsIHZhbHVlLCBzdHlsZVN0cmluZyk7XG4gIH07XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUuc3R5bGVUd2VlbiA9IGZ1bmN0aW9uKG5hbWUsIHR3ZWVuLCBwcmlvcml0eSkge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykgcHJpb3JpdHkgPSBcIlwiO1xuICAgIGZ1bmN0aW9uIHN0eWxlVHdlZW4oZCwgaSkge1xuICAgICAgdmFyIGYgPSB0d2Vlbi5jYWxsKHRoaXMsIGQsIGksIGQzX3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHRoaXMsIG51bGwpLmdldFByb3BlcnR5VmFsdWUobmFtZSkpO1xuICAgICAgcmV0dXJuIGYgJiYgZnVuY3Rpb24odCkge1xuICAgICAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIGYodCksIHByaW9yaXR5KTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnR3ZWVuKFwic3R5bGUuXCIgKyBuYW1lLCBzdHlsZVR3ZWVuKTtcbiAgfTtcbiAgZDNfdHJhbnNpdGlvblByb3RvdHlwZS50ZXh0ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZDNfdHJhbnNpdGlvbl90d2Vlbih0aGlzLCBcInRleHRcIiwgdmFsdWUsIGQzX3RyYW5zaXRpb25fdGV4dCk7XG4gIH07XG4gIGZ1bmN0aW9uIGQzX3RyYW5zaXRpb25fdGV4dChiKSB7XG4gICAgaWYgKGIgPT0gbnVsbCkgYiA9IFwiXCI7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy50ZXh0Q29udGVudCA9IGI7XG4gICAgfTtcbiAgfVxuICBkM190cmFuc2l0aW9uUHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmVhY2goXCJlbmQudHJhbnNpdGlvblwiLCBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwO1xuICAgICAgaWYgKHRoaXMuX190cmFuc2l0aW9uX18uY291bnQgPCAyICYmIChwID0gdGhpcy5wYXJlbnROb2RlKSkgcC5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgICB9KTtcbiAgfTtcbiAgZDNfdHJhbnNpdGlvblByb3RvdHlwZS5lYXNlID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YXIgaWQgPSB0aGlzLmlkO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMSkgcmV0dXJuIHRoaXMubm9kZSgpLl9fdHJhbnNpdGlvbl9fW2lkXS5lYXNlO1xuICAgIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdmFsdWUgPSBkMy5lYXNlLmFwcGx5KGQzLCBhcmd1bWVudHMpO1xuICAgIHJldHVybiBkM19zZWxlY3Rpb25fZWFjaCh0aGlzLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICBub2RlLl9fdHJhbnNpdGlvbl9fW2lkXS5lYXNlID0gdmFsdWU7XG4gICAgfSk7XG4gIH07XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUuZGVsYXkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciBpZCA9IHRoaXMuaWQ7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxKSByZXR1cm4gdGhpcy5ub2RlKCkuX190cmFuc2l0aW9uX19baWRdLmRlbGF5O1xuICAgIHJldHVybiBkM19zZWxlY3Rpb25fZWFjaCh0aGlzLCB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IGZ1bmN0aW9uKG5vZGUsIGksIGopIHtcbiAgICAgIG5vZGUuX190cmFuc2l0aW9uX19baWRdLmRlbGF5ID0gK3ZhbHVlLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgaik7XG4gICAgfSA6ICh2YWx1ZSA9ICt2YWx1ZSwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgbm9kZS5fX3RyYW5zaXRpb25fX1tpZF0uZGVsYXkgPSB2YWx1ZTtcbiAgICB9KSk7XG4gIH07XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUuZHVyYXRpb24gPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciBpZCA9IHRoaXMuaWQ7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxKSByZXR1cm4gdGhpcy5ub2RlKCkuX190cmFuc2l0aW9uX19baWRdLmR1cmF0aW9uO1xuICAgIHJldHVybiBkM19zZWxlY3Rpb25fZWFjaCh0aGlzLCB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIiA/IGZ1bmN0aW9uKG5vZGUsIGksIGopIHtcbiAgICAgIG5vZGUuX190cmFuc2l0aW9uX19baWRdLmR1cmF0aW9uID0gTWF0aC5tYXgoMSwgdmFsdWUuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBqKSk7XG4gICAgfSA6ICh2YWx1ZSA9IE1hdGgubWF4KDEsIHZhbHVlKSwgZnVuY3Rpb24obm9kZSkge1xuICAgICAgbm9kZS5fX3RyYW5zaXRpb25fX1tpZF0uZHVyYXRpb24gPSB2YWx1ZTtcbiAgICB9KSk7XG4gIH07XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUuZWFjaCA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgdmFyIGlkID0gdGhpcy5pZDtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHZhciBpbmhlcml0ID0gZDNfdHJhbnNpdGlvbkluaGVyaXQsIGluaGVyaXRJZCA9IGQzX3RyYW5zaXRpb25Jbmhlcml0SWQ7XG4gICAgICBkM190cmFuc2l0aW9uSW5oZXJpdElkID0gaWQ7XG4gICAgICBkM19zZWxlY3Rpb25fZWFjaCh0aGlzLCBmdW5jdGlvbihub2RlLCBpLCBqKSB7XG4gICAgICAgIGQzX3RyYW5zaXRpb25Jbmhlcml0ID0gbm9kZS5fX3RyYW5zaXRpb25fX1tpZF07XG4gICAgICAgIHR5cGUuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBqKTtcbiAgICAgIH0pO1xuICAgICAgZDNfdHJhbnNpdGlvbkluaGVyaXQgPSBpbmhlcml0O1xuICAgICAgZDNfdHJhbnNpdGlvbkluaGVyaXRJZCA9IGluaGVyaXRJZDtcbiAgICB9IGVsc2Uge1xuICAgICAgZDNfc2VsZWN0aW9uX2VhY2godGhpcywgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICB2YXIgdHJhbnNpdGlvbiA9IG5vZGUuX190cmFuc2l0aW9uX19baWRdO1xuICAgICAgICAodHJhbnNpdGlvbi5ldmVudCB8fCAodHJhbnNpdGlvbi5ldmVudCA9IGQzLmRpc3BhdGNoKFwic3RhcnRcIiwgXCJlbmRcIikpKS5vbih0eXBlLCBsaXN0ZW5lcik7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG4gIGQzX3RyYW5zaXRpb25Qcm90b3R5cGUudHJhbnNpdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBpZDAgPSB0aGlzLmlkLCBpZDEgPSArK2QzX3RyYW5zaXRpb25JZCwgc3ViZ3JvdXBzID0gW10sIHN1Ymdyb3VwLCBncm91cCwgbm9kZSwgdHJhbnNpdGlvbjtcbiAgICBmb3IgKHZhciBqID0gMCwgbSA9IHRoaXMubGVuZ3RoOyBqIDwgbTsgaisrKSB7XG4gICAgICBzdWJncm91cHMucHVzaChzdWJncm91cCA9IFtdKTtcbiAgICAgIGZvciAodmFyIGdyb3VwID0gdGhpc1tqXSwgaSA9IDAsIG4gPSBncm91cC5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICAgIHRyYW5zaXRpb24gPSBPYmplY3QuY3JlYXRlKG5vZGUuX190cmFuc2l0aW9uX19baWQwXSk7XG4gICAgICAgICAgdHJhbnNpdGlvbi5kZWxheSArPSB0cmFuc2l0aW9uLmR1cmF0aW9uO1xuICAgICAgICAgIGQzX3RyYW5zaXRpb25Ob2RlKG5vZGUsIGksIGlkMSwgdHJhbnNpdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgc3ViZ3JvdXAucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGQzX3RyYW5zaXRpb24oc3ViZ3JvdXBzLCBpZDEpO1xuICB9O1xuICBmdW5jdGlvbiBkM190cmFuc2l0aW9uTm9kZShub2RlLCBpLCBpZCwgaW5oZXJpdCkge1xuICAgIHZhciBsb2NrID0gbm9kZS5fX3RyYW5zaXRpb25fXyB8fCAobm9kZS5fX3RyYW5zaXRpb25fXyA9IHtcbiAgICAgIGFjdGl2ZTogMCxcbiAgICAgIGNvdW50OiAwXG4gICAgfSksIHRyYW5zaXRpb24gPSBsb2NrW2lkXTtcbiAgICBpZiAoIXRyYW5zaXRpb24pIHtcbiAgICAgIHZhciB0aW1lID0gaW5oZXJpdC50aW1lO1xuICAgICAgdHJhbnNpdGlvbiA9IGxvY2tbaWRdID0ge1xuICAgICAgICB0d2VlbjogbmV3IGQzX01hcCgpLFxuICAgICAgICB0aW1lOiB0aW1lLFxuICAgICAgICBlYXNlOiBpbmhlcml0LmVhc2UsXG4gICAgICAgIGRlbGF5OiBpbmhlcml0LmRlbGF5LFxuICAgICAgICBkdXJhdGlvbjogaW5oZXJpdC5kdXJhdGlvblxuICAgICAgfTtcbiAgICAgICsrbG9jay5jb3VudDtcbiAgICAgIGQzLnRpbWVyKGZ1bmN0aW9uKGVsYXBzZWQpIHtcbiAgICAgICAgdmFyIGQgPSBub2RlLl9fZGF0YV9fLCBlYXNlID0gdHJhbnNpdGlvbi5lYXNlLCBkZWxheSA9IHRyYW5zaXRpb24uZGVsYXksIGR1cmF0aW9uID0gdHJhbnNpdGlvbi5kdXJhdGlvbiwgdGltZXIgPSBkM190aW1lcl9hY3RpdmUsIHR3ZWVuZWQgPSBbXTtcbiAgICAgICAgdGltZXIudCA9IGRlbGF5ICsgdGltZTtcbiAgICAgICAgaWYgKGRlbGF5IDw9IGVsYXBzZWQpIHJldHVybiBzdGFydChlbGFwc2VkIC0gZGVsYXkpO1xuICAgICAgICB0aW1lci5jID0gc3RhcnQ7XG4gICAgICAgIGZ1bmN0aW9uIHN0YXJ0KGVsYXBzZWQpIHtcbiAgICAgICAgICBpZiAobG9jay5hY3RpdmUgPiBpZCkgcmV0dXJuIHN0b3AoKTtcbiAgICAgICAgICBsb2NrLmFjdGl2ZSA9IGlkO1xuICAgICAgICAgIHRyYW5zaXRpb24uZXZlbnQgJiYgdHJhbnNpdGlvbi5ldmVudC5zdGFydC5jYWxsKG5vZGUsIGQsIGkpO1xuICAgICAgICAgIHRyYW5zaXRpb24udHdlZW4uZm9yRWFjaChmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodmFsdWUgPSB2YWx1ZS5jYWxsKG5vZGUsIGQsIGkpKSB7XG4gICAgICAgICAgICAgIHR3ZWVuZWQucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgZDMudGltZXIoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aW1lci5jID0gdGljayhlbGFwc2VkIHx8IDEpID8gZDNfdHJ1ZSA6IHRpY2s7XG4gICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICB9LCAwLCB0aW1lKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiB0aWNrKGVsYXBzZWQpIHtcbiAgICAgICAgICBpZiAobG9jay5hY3RpdmUgIT09IGlkKSByZXR1cm4gc3RvcCgpO1xuICAgICAgICAgIHZhciB0ID0gZWxhcHNlZCAvIGR1cmF0aW9uLCBlID0gZWFzZSh0KSwgbiA9IHR3ZWVuZWQubGVuZ3RoO1xuICAgICAgICAgIHdoaWxlIChuID4gMCkge1xuICAgICAgICAgICAgdHdlZW5lZFstLW5dLmNhbGwobm9kZSwgZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0ID49IDEpIHtcbiAgICAgICAgICAgIHRyYW5zaXRpb24uZXZlbnQgJiYgdHJhbnNpdGlvbi5ldmVudC5lbmQuY2FsbChub2RlLCBkLCBpKTtcbiAgICAgICAgICAgIHJldHVybiBzdG9wKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgICAgICAgaWYgKC0tbG9jay5jb3VudCkgZGVsZXRlIGxvY2tbaWRdOyBlbHNlIGRlbGV0ZSBub2RlLl9fdHJhbnNpdGlvbl9fO1xuICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgICB9LCAwLCB0aW1lKTtcbiAgICB9XG4gIH1cbiAgZDMuc3ZnLmF4aXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NhbGUgPSBkMy5zY2FsZS5saW5lYXIoKSwgb3JpZW50ID0gZDNfc3ZnX2F4aXNEZWZhdWx0T3JpZW50LCBpbm5lclRpY2tTaXplID0gNiwgb3V0ZXJUaWNrU2l6ZSA9IDYsIHRpY2tQYWRkaW5nID0gMywgdGlja0FyZ3VtZW50c18gPSBbIDEwIF0sIHRpY2tWYWx1ZXMgPSBudWxsLCB0aWNrRm9ybWF0XztcbiAgICBmdW5jdGlvbiBheGlzKGcpIHtcbiAgICAgIGcuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGcgPSBkMy5zZWxlY3QodGhpcyk7XG4gICAgICAgIHZhciBzY2FsZTAgPSB0aGlzLl9fY2hhcnRfXyB8fCBzY2FsZSwgc2NhbGUxID0gdGhpcy5fX2NoYXJ0X18gPSBzY2FsZS5jb3B5KCk7XG4gICAgICAgIHZhciB0aWNrcyA9IHRpY2tWYWx1ZXMgPT0gbnVsbCA/IHNjYWxlMS50aWNrcyA/IHNjYWxlMS50aWNrcy5hcHBseShzY2FsZTEsIHRpY2tBcmd1bWVudHNfKSA6IHNjYWxlMS5kb21haW4oKSA6IHRpY2tWYWx1ZXMsIHRpY2tGb3JtYXQgPSB0aWNrRm9ybWF0XyA9PSBudWxsID8gc2NhbGUxLnRpY2tGb3JtYXQgPyBzY2FsZTEudGlja0Zvcm1hdC5hcHBseShzY2FsZTEsIHRpY2tBcmd1bWVudHNfKSA6IGQzX2lkZW50aXR5IDogdGlja0Zvcm1hdF8sIHRpY2sgPSBnLnNlbGVjdEFsbChcIi50aWNrXCIpLmRhdGEodGlja3MsIHNjYWxlMSksIHRpY2tFbnRlciA9IHRpY2suZW50ZXIoKS5pbnNlcnQoXCJnXCIsIFwiLmRvbWFpblwiKS5hdHRyKFwiY2xhc3NcIiwgXCJ0aWNrXCIpLnN0eWxlKFwib3BhY2l0eVwiLCDOtSksIHRpY2tFeGl0ID0gZDMudHJhbnNpdGlvbih0aWNrLmV4aXQoKSkuc3R5bGUoXCJvcGFjaXR5XCIsIM61KS5yZW1vdmUoKSwgdGlja1VwZGF0ZSA9IGQzLnRyYW5zaXRpb24odGljay5vcmRlcigpKS5zdHlsZShcIm9wYWNpdHlcIiwgMSksIHRpY2tUcmFuc2Zvcm07XG4gICAgICAgIHZhciByYW5nZSA9IGQzX3NjYWxlUmFuZ2Uoc2NhbGUxKSwgcGF0aCA9IGcuc2VsZWN0QWxsKFwiLmRvbWFpblwiKS5kYXRhKFsgMCBdKSwgcGF0aFVwZGF0ZSA9IChwYXRoLmVudGVyKCkuYXBwZW5kKFwicGF0aFwiKS5hdHRyKFwiY2xhc3NcIiwgXCJkb21haW5cIiksIFxuICAgICAgICBkMy50cmFuc2l0aW9uKHBhdGgpKTtcbiAgICAgICAgdGlja0VudGVyLmFwcGVuZChcImxpbmVcIik7XG4gICAgICAgIHRpY2tFbnRlci5hcHBlbmQoXCJ0ZXh0XCIpO1xuICAgICAgICB2YXIgbGluZUVudGVyID0gdGlja0VudGVyLnNlbGVjdChcImxpbmVcIiksIGxpbmVVcGRhdGUgPSB0aWNrVXBkYXRlLnNlbGVjdChcImxpbmVcIiksIHRleHQgPSB0aWNrLnNlbGVjdChcInRleHRcIikudGV4dCh0aWNrRm9ybWF0KSwgdGV4dEVudGVyID0gdGlja0VudGVyLnNlbGVjdChcInRleHRcIiksIHRleHRVcGRhdGUgPSB0aWNrVXBkYXRlLnNlbGVjdChcInRleHRcIik7XG4gICAgICAgIHN3aXRjaCAob3JpZW50KSB7XG4gICAgICAgICBjYXNlIFwiYm90dG9tXCI6XG4gICAgICAgICAge1xuICAgICAgICAgICAgdGlja1RyYW5zZm9ybSA9IGQzX3N2Z19heGlzWDtcbiAgICAgICAgICAgIGxpbmVFbnRlci5hdHRyKFwieTJcIiwgaW5uZXJUaWNrU2l6ZSk7XG4gICAgICAgICAgICB0ZXh0RW50ZXIuYXR0cihcInlcIiwgTWF0aC5tYXgoaW5uZXJUaWNrU2l6ZSwgMCkgKyB0aWNrUGFkZGluZyk7XG4gICAgICAgICAgICBsaW5lVXBkYXRlLmF0dHIoXCJ4MlwiLCAwKS5hdHRyKFwieTJcIiwgaW5uZXJUaWNrU2l6ZSk7XG4gICAgICAgICAgICB0ZXh0VXBkYXRlLmF0dHIoXCJ4XCIsIDApLmF0dHIoXCJ5XCIsIE1hdGgubWF4KGlubmVyVGlja1NpemUsIDApICsgdGlja1BhZGRpbmcpO1xuICAgICAgICAgICAgdGV4dC5hdHRyKFwiZHlcIiwgXCIuNzFlbVwiKS5zdHlsZShcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpO1xuICAgICAgICAgICAgcGF0aFVwZGF0ZS5hdHRyKFwiZFwiLCBcIk1cIiArIHJhbmdlWzBdICsgXCIsXCIgKyBvdXRlclRpY2tTaXplICsgXCJWMEhcIiArIHJhbmdlWzFdICsgXCJWXCIgKyBvdXRlclRpY2tTaXplKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgY2FzZSBcInRvcFwiOlxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRpY2tUcmFuc2Zvcm0gPSBkM19zdmdfYXhpc1g7XG4gICAgICAgICAgICBsaW5lRW50ZXIuYXR0cihcInkyXCIsIC1pbm5lclRpY2tTaXplKTtcbiAgICAgICAgICAgIHRleHRFbnRlci5hdHRyKFwieVwiLCAtKE1hdGgubWF4KGlubmVyVGlja1NpemUsIDApICsgdGlja1BhZGRpbmcpKTtcbiAgICAgICAgICAgIGxpbmVVcGRhdGUuYXR0cihcIngyXCIsIDApLmF0dHIoXCJ5MlwiLCAtaW5uZXJUaWNrU2l6ZSk7XG4gICAgICAgICAgICB0ZXh0VXBkYXRlLmF0dHIoXCJ4XCIsIDApLmF0dHIoXCJ5XCIsIC0oTWF0aC5tYXgoaW5uZXJUaWNrU2l6ZSwgMCkgKyB0aWNrUGFkZGluZykpO1xuICAgICAgICAgICAgdGV4dC5hdHRyKFwiZHlcIiwgXCIwZW1cIikuc3R5bGUoXCJ0ZXh0LWFuY2hvclwiLCBcIm1pZGRsZVwiKTtcbiAgICAgICAgICAgIHBhdGhVcGRhdGUuYXR0cihcImRcIiwgXCJNXCIgKyByYW5nZVswXSArIFwiLFwiICsgLW91dGVyVGlja1NpemUgKyBcIlYwSFwiICsgcmFuZ2VbMV0gKyBcIlZcIiArIC1vdXRlclRpY2tTaXplKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgY2FzZSBcImxlZnRcIjpcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0aWNrVHJhbnNmb3JtID0gZDNfc3ZnX2F4aXNZO1xuICAgICAgICAgICAgbGluZUVudGVyLmF0dHIoXCJ4MlwiLCAtaW5uZXJUaWNrU2l6ZSk7XG4gICAgICAgICAgICB0ZXh0RW50ZXIuYXR0cihcInhcIiwgLShNYXRoLm1heChpbm5lclRpY2tTaXplLCAwKSArIHRpY2tQYWRkaW5nKSk7XG4gICAgICAgICAgICBsaW5lVXBkYXRlLmF0dHIoXCJ4MlwiLCAtaW5uZXJUaWNrU2l6ZSkuYXR0cihcInkyXCIsIDApO1xuICAgICAgICAgICAgdGV4dFVwZGF0ZS5hdHRyKFwieFwiLCAtKE1hdGgubWF4KGlubmVyVGlja1NpemUsIDApICsgdGlja1BhZGRpbmcpKS5hdHRyKFwieVwiLCAwKTtcbiAgICAgICAgICAgIHRleHQuYXR0cihcImR5XCIsIFwiLjMyZW1cIikuc3R5bGUoXCJ0ZXh0LWFuY2hvclwiLCBcImVuZFwiKTtcbiAgICAgICAgICAgIHBhdGhVcGRhdGUuYXR0cihcImRcIiwgXCJNXCIgKyAtb3V0ZXJUaWNrU2l6ZSArIFwiLFwiICsgcmFuZ2VbMF0gKyBcIkgwVlwiICsgcmFuZ2VbMV0gKyBcIkhcIiArIC1vdXRlclRpY2tTaXplKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgY2FzZSBcInJpZ2h0XCI6XG4gICAgICAgICAge1xuICAgICAgICAgICAgdGlja1RyYW5zZm9ybSA9IGQzX3N2Z19heGlzWTtcbiAgICAgICAgICAgIGxpbmVFbnRlci5hdHRyKFwieDJcIiwgaW5uZXJUaWNrU2l6ZSk7XG4gICAgICAgICAgICB0ZXh0RW50ZXIuYXR0cihcInhcIiwgTWF0aC5tYXgoaW5uZXJUaWNrU2l6ZSwgMCkgKyB0aWNrUGFkZGluZyk7XG4gICAgICAgICAgICBsaW5lVXBkYXRlLmF0dHIoXCJ4MlwiLCBpbm5lclRpY2tTaXplKS5hdHRyKFwieTJcIiwgMCk7XG4gICAgICAgICAgICB0ZXh0VXBkYXRlLmF0dHIoXCJ4XCIsIE1hdGgubWF4KGlubmVyVGlja1NpemUsIDApICsgdGlja1BhZGRpbmcpLmF0dHIoXCJ5XCIsIDApO1xuICAgICAgICAgICAgdGV4dC5hdHRyKFwiZHlcIiwgXCIuMzJlbVwiKS5zdHlsZShcInRleHQtYW5jaG9yXCIsIFwic3RhcnRcIik7XG4gICAgICAgICAgICBwYXRoVXBkYXRlLmF0dHIoXCJkXCIsIFwiTVwiICsgb3V0ZXJUaWNrU2l6ZSArIFwiLFwiICsgcmFuZ2VbMF0gKyBcIkgwVlwiICsgcmFuZ2VbMV0gKyBcIkhcIiArIG91dGVyVGlja1NpemUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChzY2FsZTEucmFuZ2VCYW5kKSB7XG4gICAgICAgICAgdmFyIHggPSBzY2FsZTEsIGR4ID0geC5yYW5nZUJhbmQoKSAvIDI7XG4gICAgICAgICAgc2NhbGUwID0gc2NhbGUxID0gZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgcmV0dXJuIHgoZCkgKyBkeDtcbiAgICAgICAgICB9O1xuICAgICAgICB9IGVsc2UgaWYgKHNjYWxlMC5yYW5nZUJhbmQpIHtcbiAgICAgICAgICBzY2FsZTAgPSBzY2FsZTE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGlja0V4aXQuY2FsbCh0aWNrVHJhbnNmb3JtLCBzY2FsZTEpO1xuICAgICAgICB9XG4gICAgICAgIHRpY2tFbnRlci5jYWxsKHRpY2tUcmFuc2Zvcm0sIHNjYWxlMCk7XG4gICAgICAgIHRpY2tVcGRhdGUuY2FsbCh0aWNrVHJhbnNmb3JtLCBzY2FsZTEpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGF4aXMuc2NhbGUgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBzY2FsZTtcbiAgICAgIHNjYWxlID0geDtcbiAgICAgIHJldHVybiBheGlzO1xuICAgIH07XG4gICAgYXhpcy5vcmllbnQgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBvcmllbnQ7XG4gICAgICBvcmllbnQgPSB4IGluIGQzX3N2Z19heGlzT3JpZW50cyA/IHggKyBcIlwiIDogZDNfc3ZnX2F4aXNEZWZhdWx0T3JpZW50O1xuICAgICAgcmV0dXJuIGF4aXM7XG4gICAgfTtcbiAgICBheGlzLnRpY2tzID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aWNrQXJndW1lbnRzXztcbiAgICAgIHRpY2tBcmd1bWVudHNfID0gYXJndW1lbnRzO1xuICAgICAgcmV0dXJuIGF4aXM7XG4gICAgfTtcbiAgICBheGlzLnRpY2tWYWx1ZXMgPSBmdW5jdGlvbih4KSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aWNrVmFsdWVzO1xuICAgICAgdGlja1ZhbHVlcyA9IHg7XG4gICAgICByZXR1cm4gYXhpcztcbiAgICB9O1xuICAgIGF4aXMudGlja0Zvcm1hdCA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRpY2tGb3JtYXRfO1xuICAgICAgdGlja0Zvcm1hdF8gPSB4O1xuICAgICAgcmV0dXJuIGF4aXM7XG4gICAgfTtcbiAgICBheGlzLnRpY2tTaXplID0gZnVuY3Rpb24oeCkge1xuICAgICAgdmFyIG4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgaWYgKCFuKSByZXR1cm4gaW5uZXJUaWNrU2l6ZTtcbiAgICAgIGlubmVyVGlja1NpemUgPSAreDtcbiAgICAgIG91dGVyVGlja1NpemUgPSArYXJndW1lbnRzW24gLSAxXTtcbiAgICAgIHJldHVybiBheGlzO1xuICAgIH07XG4gICAgYXhpcy5pbm5lclRpY2tTaXplID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gaW5uZXJUaWNrU2l6ZTtcbiAgICAgIGlubmVyVGlja1NpemUgPSAreDtcbiAgICAgIHJldHVybiBheGlzO1xuICAgIH07XG4gICAgYXhpcy5vdXRlclRpY2tTaXplID0gZnVuY3Rpb24oeCkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gb3V0ZXJUaWNrU2l6ZTtcbiAgICAgIG91dGVyVGlja1NpemUgPSAreDtcbiAgICAgIHJldHVybiBheGlzO1xuICAgIH07XG4gICAgYXhpcy50aWNrUGFkZGluZyA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRpY2tQYWRkaW5nO1xuICAgICAgdGlja1BhZGRpbmcgPSAreDtcbiAgICAgIHJldHVybiBheGlzO1xuICAgIH07XG4gICAgYXhpcy50aWNrU3ViZGl2aWRlID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCAmJiBheGlzO1xuICAgIH07XG4gICAgcmV0dXJuIGF4aXM7XG4gIH07XG4gIHZhciBkM19zdmdfYXhpc0RlZmF1bHRPcmllbnQgPSBcImJvdHRvbVwiLCBkM19zdmdfYXhpc09yaWVudHMgPSB7XG4gICAgdG9wOiAxLFxuICAgIHJpZ2h0OiAxLFxuICAgIGJvdHRvbTogMSxcbiAgICBsZWZ0OiAxXG4gIH07XG4gIGZ1bmN0aW9uIGQzX3N2Z19heGlzWChzZWxlY3Rpb24sIHgpIHtcbiAgICBzZWxlY3Rpb24uYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkKSB7XG4gICAgICByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyB4KGQpICsgXCIsMClcIjtcbiAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiBkM19zdmdfYXhpc1koc2VsZWN0aW9uLCB5KSB7XG4gICAgc2VsZWN0aW9uLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkge1xuICAgICAgcmV0dXJuIFwidHJhbnNsYXRlKDAsXCIgKyB5KGQpICsgXCIpXCI7XG4gICAgfSk7XG4gIH1cbiAgZDMuc3ZnLmJydXNoID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGV2ZW50ID0gZDNfZXZlbnREaXNwYXRjaChicnVzaCwgXCJicnVzaHN0YXJ0XCIsIFwiYnJ1c2hcIiwgXCJicnVzaGVuZFwiKSwgeCA9IG51bGwsIHkgPSBudWxsLCB4RXh0ZW50ID0gWyAwLCAwIF0sIHlFeHRlbnQgPSBbIDAsIDAgXSwgeEV4dGVudERvbWFpbiwgeUV4dGVudERvbWFpbiwgeENsYW1wID0gdHJ1ZSwgeUNsYW1wID0gdHJ1ZSwgcmVzaXplcyA9IGQzX3N2Z19icnVzaFJlc2l6ZXNbMF07XG4gICAgZnVuY3Rpb24gYnJ1c2goZykge1xuICAgICAgZy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZyA9IGQzLnNlbGVjdCh0aGlzKS5zdHlsZShcInBvaW50ZXItZXZlbnRzXCIsIFwiYWxsXCIpLnN0eWxlKFwiLXdlYmtpdC10YXAtaGlnaGxpZ2h0LWNvbG9yXCIsIFwicmdiYSgwLDAsMCwwKVwiKS5vbihcIm1vdXNlZG93bi5icnVzaFwiLCBicnVzaHN0YXJ0KS5vbihcInRvdWNoc3RhcnQuYnJ1c2hcIiwgYnJ1c2hzdGFydCk7XG4gICAgICAgIHZhciBiYWNrZ3JvdW5kID0gZy5zZWxlY3RBbGwoXCIuYmFja2dyb3VuZFwiKS5kYXRhKFsgMCBdKTtcbiAgICAgICAgYmFja2dyb3VuZC5lbnRlcigpLmFwcGVuZChcInJlY3RcIikuYXR0cihcImNsYXNzXCIsIFwiYmFja2dyb3VuZFwiKS5zdHlsZShcInZpc2liaWxpdHlcIiwgXCJoaWRkZW5cIikuc3R5bGUoXCJjdXJzb3JcIiwgXCJjcm9zc2hhaXJcIik7XG4gICAgICAgIGcuc2VsZWN0QWxsKFwiLmV4dGVudFwiKS5kYXRhKFsgMCBdKS5lbnRlcigpLmFwcGVuZChcInJlY3RcIikuYXR0cihcImNsYXNzXCIsIFwiZXh0ZW50XCIpLnN0eWxlKFwiY3Vyc29yXCIsIFwibW92ZVwiKTtcbiAgICAgICAgdmFyIHJlc2l6ZSA9IGcuc2VsZWN0QWxsKFwiLnJlc2l6ZVwiKS5kYXRhKHJlc2l6ZXMsIGQzX2lkZW50aXR5KTtcbiAgICAgICAgcmVzaXplLmV4aXQoKS5yZW1vdmUoKTtcbiAgICAgICAgcmVzaXplLmVudGVyKCkuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgIHJldHVybiBcInJlc2l6ZSBcIiArIGQ7XG4gICAgICAgIH0pLnN0eWxlKFwiY3Vyc29yXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gZDNfc3ZnX2JydXNoQ3Vyc29yW2RdO1xuICAgICAgICB9KS5hcHBlbmQoXCJyZWN0XCIpLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgICByZXR1cm4gL1tld10kLy50ZXN0KGQpID8gLTMgOiBudWxsO1xuICAgICAgICB9KS5hdHRyKFwieVwiLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgcmV0dXJuIC9eW25zXS8udGVzdChkKSA/IC0zIDogbnVsbDtcbiAgICAgICAgfSkuYXR0cihcIndpZHRoXCIsIDYpLmF0dHIoXCJoZWlnaHRcIiwgNikuc3R5bGUoXCJ2aXNpYmlsaXR5XCIsIFwiaGlkZGVuXCIpO1xuICAgICAgICByZXNpemUuc3R5bGUoXCJkaXNwbGF5XCIsIGJydXNoLmVtcHR5KCkgPyBcIm5vbmVcIiA6IG51bGwpO1xuICAgICAgICB2YXIgZ1VwZGF0ZSA9IGQzLnRyYW5zaXRpb24oZyksIGJhY2tncm91bmRVcGRhdGUgPSBkMy50cmFuc2l0aW9uKGJhY2tncm91bmQpLCByYW5nZTtcbiAgICAgICAgaWYgKHgpIHtcbiAgICAgICAgICByYW5nZSA9IGQzX3NjYWxlUmFuZ2UoeCk7XG4gICAgICAgICAgYmFja2dyb3VuZFVwZGF0ZS5hdHRyKFwieFwiLCByYW5nZVswXSkuYXR0cihcIndpZHRoXCIsIHJhbmdlWzFdIC0gcmFuZ2VbMF0pO1xuICAgICAgICAgIHJlZHJhd1goZ1VwZGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHkpIHtcbiAgICAgICAgICByYW5nZSA9IGQzX3NjYWxlUmFuZ2UoeSk7XG4gICAgICAgICAgYmFja2dyb3VuZFVwZGF0ZS5hdHRyKFwieVwiLCByYW5nZVswXSkuYXR0cihcImhlaWdodFwiLCByYW5nZVsxXSAtIHJhbmdlWzBdKTtcbiAgICAgICAgICByZWRyYXdZKGdVcGRhdGUpO1xuICAgICAgICB9XG4gICAgICAgIHJlZHJhdyhnVXBkYXRlKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBicnVzaC5ldmVudCA9IGZ1bmN0aW9uKGcpIHtcbiAgICAgIGcuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGV2ZW50XyA9IGV2ZW50Lm9mKHRoaXMsIGFyZ3VtZW50cyksIGV4dGVudDEgPSB7XG4gICAgICAgICAgeDogeEV4dGVudCxcbiAgICAgICAgICB5OiB5RXh0ZW50LFxuICAgICAgICAgIGk6IHhFeHRlbnREb21haW4sXG4gICAgICAgICAgajogeUV4dGVudERvbWFpblxuICAgICAgICB9LCBleHRlbnQwID0gdGhpcy5fX2NoYXJ0X18gfHwgZXh0ZW50MTtcbiAgICAgICAgdGhpcy5fX2NoYXJ0X18gPSBleHRlbnQxO1xuICAgICAgICBpZiAoZDNfdHJhbnNpdGlvbkluaGVyaXRJZCkge1xuICAgICAgICAgIGQzLnNlbGVjdCh0aGlzKS50cmFuc2l0aW9uKCkuZWFjaChcInN0YXJ0LmJydXNoXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgeEV4dGVudERvbWFpbiA9IGV4dGVudDAuaTtcbiAgICAgICAgICAgIHlFeHRlbnREb21haW4gPSBleHRlbnQwLmo7XG4gICAgICAgICAgICB4RXh0ZW50ID0gZXh0ZW50MC54O1xuICAgICAgICAgICAgeUV4dGVudCA9IGV4dGVudDAueTtcbiAgICAgICAgICAgIGV2ZW50Xyh7XG4gICAgICAgICAgICAgIHR5cGU6IFwiYnJ1c2hzdGFydFwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KS50d2VlbihcImJydXNoOmJydXNoXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHhpID0gZDNfaW50ZXJwb2xhdGVBcnJheSh4RXh0ZW50LCBleHRlbnQxLngpLCB5aSA9IGQzX2ludGVycG9sYXRlQXJyYXkoeUV4dGVudCwgZXh0ZW50MS55KTtcbiAgICAgICAgICAgIHhFeHRlbnREb21haW4gPSB5RXh0ZW50RG9tYWluID0gbnVsbDtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICAgICAgICAgIHhFeHRlbnQgPSBleHRlbnQxLnggPSB4aSh0KTtcbiAgICAgICAgICAgICAgeUV4dGVudCA9IGV4dGVudDEueSA9IHlpKHQpO1xuICAgICAgICAgICAgICBldmVudF8oe1xuICAgICAgICAgICAgICAgIHR5cGU6IFwiYnJ1c2hcIixcbiAgICAgICAgICAgICAgICBtb2RlOiBcInJlc2l6ZVwiXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9KS5lYWNoKFwiZW5kLmJydXNoXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgeEV4dGVudERvbWFpbiA9IGV4dGVudDEuaTtcbiAgICAgICAgICAgIHlFeHRlbnREb21haW4gPSBleHRlbnQxLmo7XG4gICAgICAgICAgICBldmVudF8oe1xuICAgICAgICAgICAgICB0eXBlOiBcImJydXNoXCIsXG4gICAgICAgICAgICAgIG1vZGU6IFwicmVzaXplXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZXZlbnRfKHtcbiAgICAgICAgICAgICAgdHlwZTogXCJicnVzaGVuZFwiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBldmVudF8oe1xuICAgICAgICAgICAgdHlwZTogXCJicnVzaHN0YXJ0XCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBldmVudF8oe1xuICAgICAgICAgICAgdHlwZTogXCJicnVzaFwiLFxuICAgICAgICAgICAgbW9kZTogXCJyZXNpemVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGV2ZW50Xyh7XG4gICAgICAgICAgICB0eXBlOiBcImJydXNoZW5kXCJcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcbiAgICBmdW5jdGlvbiByZWRyYXcoZykge1xuICAgICAgZy5zZWxlY3RBbGwoXCIucmVzaXplXCIpLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgZnVuY3Rpb24oZCkge1xuICAgICAgICByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyB4RXh0ZW50WysvZSQvLnRlc3QoZCldICsgXCIsXCIgKyB5RXh0ZW50WysvXnMvLnRlc3QoZCldICsgXCIpXCI7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZnVuY3Rpb24gcmVkcmF3WChnKSB7XG4gICAgICBnLnNlbGVjdChcIi5leHRlbnRcIikuYXR0cihcInhcIiwgeEV4dGVudFswXSk7XG4gICAgICBnLnNlbGVjdEFsbChcIi5leHRlbnQsLm4+cmVjdCwucz5yZWN0XCIpLmF0dHIoXCJ3aWR0aFwiLCB4RXh0ZW50WzFdIC0geEV4dGVudFswXSk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHJlZHJhd1koZykge1xuICAgICAgZy5zZWxlY3QoXCIuZXh0ZW50XCIpLmF0dHIoXCJ5XCIsIHlFeHRlbnRbMF0pO1xuICAgICAgZy5zZWxlY3RBbGwoXCIuZXh0ZW50LC5lPnJlY3QsLnc+cmVjdFwiKS5hdHRyKFwiaGVpZ2h0XCIsIHlFeHRlbnRbMV0gLSB5RXh0ZW50WzBdKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gYnJ1c2hzdGFydCgpIHtcbiAgICAgIHZhciB0YXJnZXQgPSB0aGlzLCBldmVudFRhcmdldCA9IGQzLnNlbGVjdChkMy5ldmVudC50YXJnZXQpLCBldmVudF8gPSBldmVudC5vZih0YXJnZXQsIGFyZ3VtZW50cyksIGcgPSBkMy5zZWxlY3QodGFyZ2V0KSwgcmVzaXppbmcgPSBldmVudFRhcmdldC5kYXR1bSgpLCByZXNpemluZ1ggPSAhL14obnxzKSQvLnRlc3QocmVzaXppbmcpICYmIHgsIHJlc2l6aW5nWSA9ICEvXihlfHcpJC8udGVzdChyZXNpemluZykgJiYgeSwgZHJhZ2dpbmcgPSBldmVudFRhcmdldC5jbGFzc2VkKFwiZXh0ZW50XCIpLCBkcmFnUmVzdG9yZSA9IGQzX2V2ZW50X2RyYWdTdXBwcmVzcygpLCBjZW50ZXIsIG9yaWdpbiA9IGQzLm1vdXNlKHRhcmdldCksIG9mZnNldDtcbiAgICAgIHZhciB3ID0gZDMuc2VsZWN0KGQzX3dpbmRvdykub24oXCJrZXlkb3duLmJydXNoXCIsIGtleWRvd24pLm9uKFwia2V5dXAuYnJ1c2hcIiwga2V5dXApO1xuICAgICAgaWYgKGQzLmV2ZW50LmNoYW5nZWRUb3VjaGVzKSB7XG4gICAgICAgIHcub24oXCJ0b3VjaG1vdmUuYnJ1c2hcIiwgYnJ1c2htb3ZlKS5vbihcInRvdWNoZW5kLmJydXNoXCIsIGJydXNoZW5kKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHcub24oXCJtb3VzZW1vdmUuYnJ1c2hcIiwgYnJ1c2htb3ZlKS5vbihcIm1vdXNldXAuYnJ1c2hcIiwgYnJ1c2hlbmQpO1xuICAgICAgfVxuICAgICAgZy5pbnRlcnJ1cHQoKS5zZWxlY3RBbGwoXCIqXCIpLmludGVycnVwdCgpO1xuICAgICAgaWYgKGRyYWdnaW5nKSB7XG4gICAgICAgIG9yaWdpblswXSA9IHhFeHRlbnRbMF0gLSBvcmlnaW5bMF07XG4gICAgICAgIG9yaWdpblsxXSA9IHlFeHRlbnRbMF0gLSBvcmlnaW5bMV07XG4gICAgICB9IGVsc2UgaWYgKHJlc2l6aW5nKSB7XG4gICAgICAgIHZhciBleCA9ICsvdyQvLnRlc3QocmVzaXppbmcpLCBleSA9ICsvXm4vLnRlc3QocmVzaXppbmcpO1xuICAgICAgICBvZmZzZXQgPSBbIHhFeHRlbnRbMSAtIGV4XSAtIG9yaWdpblswXSwgeUV4dGVudFsxIC0gZXldIC0gb3JpZ2luWzFdIF07XG4gICAgICAgIG9yaWdpblswXSA9IHhFeHRlbnRbZXhdO1xuICAgICAgICBvcmlnaW5bMV0gPSB5RXh0ZW50W2V5XTtcbiAgICAgIH0gZWxzZSBpZiAoZDMuZXZlbnQuYWx0S2V5KSBjZW50ZXIgPSBvcmlnaW4uc2xpY2UoKTtcbiAgICAgIGcuc3R5bGUoXCJwb2ludGVyLWV2ZW50c1wiLCBcIm5vbmVcIikuc2VsZWN0QWxsKFwiLnJlc2l6ZVwiKS5zdHlsZShcImRpc3BsYXlcIiwgbnVsbCk7XG4gICAgICBkMy5zZWxlY3QoXCJib2R5XCIpLnN0eWxlKFwiY3Vyc29yXCIsIGV2ZW50VGFyZ2V0LnN0eWxlKFwiY3Vyc29yXCIpKTtcbiAgICAgIGV2ZW50Xyh7XG4gICAgICAgIHR5cGU6IFwiYnJ1c2hzdGFydFwiXG4gICAgICB9KTtcbiAgICAgIGJydXNobW92ZSgpO1xuICAgICAgZnVuY3Rpb24ga2V5ZG93bigpIHtcbiAgICAgICAgaWYgKGQzLmV2ZW50LmtleUNvZGUgPT0gMzIpIHtcbiAgICAgICAgICBpZiAoIWRyYWdnaW5nKSB7XG4gICAgICAgICAgICBjZW50ZXIgPSBudWxsO1xuICAgICAgICAgICAgb3JpZ2luWzBdIC09IHhFeHRlbnRbMV07XG4gICAgICAgICAgICBvcmlnaW5bMV0gLT0geUV4dGVudFsxXTtcbiAgICAgICAgICAgIGRyYWdnaW5nID0gMjtcbiAgICAgICAgICB9XG4gICAgICAgICAgZDNfZXZlbnRQcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBrZXl1cCgpIHtcbiAgICAgICAgaWYgKGQzLmV2ZW50LmtleUNvZGUgPT0gMzIgJiYgZHJhZ2dpbmcgPT0gMikge1xuICAgICAgICAgIG9yaWdpblswXSArPSB4RXh0ZW50WzFdO1xuICAgICAgICAgIG9yaWdpblsxXSArPSB5RXh0ZW50WzFdO1xuICAgICAgICAgIGRyYWdnaW5nID0gMDtcbiAgICAgICAgICBkM19ldmVudFByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGJydXNobW92ZSgpIHtcbiAgICAgICAgdmFyIHBvaW50ID0gZDMubW91c2UodGFyZ2V0KSwgbW92ZWQgPSBmYWxzZTtcbiAgICAgICAgaWYgKG9mZnNldCkge1xuICAgICAgICAgIHBvaW50WzBdICs9IG9mZnNldFswXTtcbiAgICAgICAgICBwb2ludFsxXSArPSBvZmZzZXRbMV07XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFkcmFnZ2luZykge1xuICAgICAgICAgIGlmIChkMy5ldmVudC5hbHRLZXkpIHtcbiAgICAgICAgICAgIGlmICghY2VudGVyKSBjZW50ZXIgPSBbICh4RXh0ZW50WzBdICsgeEV4dGVudFsxXSkgLyAyLCAoeUV4dGVudFswXSArIHlFeHRlbnRbMV0pIC8gMiBdO1xuICAgICAgICAgICAgb3JpZ2luWzBdID0geEV4dGVudFsrKHBvaW50WzBdIDwgY2VudGVyWzBdKV07XG4gICAgICAgICAgICBvcmlnaW5bMV0gPSB5RXh0ZW50WysocG9pbnRbMV0gPCBjZW50ZXJbMV0pXTtcbiAgICAgICAgICB9IGVsc2UgY2VudGVyID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzaXppbmdYICYmIG1vdmUxKHBvaW50LCB4LCAwKSkge1xuICAgICAgICAgIHJlZHJhd1goZyk7XG4gICAgICAgICAgbW92ZWQgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXNpemluZ1kgJiYgbW92ZTEocG9pbnQsIHksIDEpKSB7XG4gICAgICAgICAgcmVkcmF3WShnKTtcbiAgICAgICAgICBtb3ZlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1vdmVkKSB7XG4gICAgICAgICAgcmVkcmF3KGcpO1xuICAgICAgICAgIGV2ZW50Xyh7XG4gICAgICAgICAgICB0eXBlOiBcImJydXNoXCIsXG4gICAgICAgICAgICBtb2RlOiBkcmFnZ2luZyA/IFwibW92ZVwiIDogXCJyZXNpemVcIlxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBtb3ZlMShwb2ludCwgc2NhbGUsIGkpIHtcbiAgICAgICAgdmFyIHJhbmdlID0gZDNfc2NhbGVSYW5nZShzY2FsZSksIHIwID0gcmFuZ2VbMF0sIHIxID0gcmFuZ2VbMV0sIHBvc2l0aW9uID0gb3JpZ2luW2ldLCBleHRlbnQgPSBpID8geUV4dGVudCA6IHhFeHRlbnQsIHNpemUgPSBleHRlbnRbMV0gLSBleHRlbnRbMF0sIG1pbiwgbWF4O1xuICAgICAgICBpZiAoZHJhZ2dpbmcpIHtcbiAgICAgICAgICByMCAtPSBwb3NpdGlvbjtcbiAgICAgICAgICByMSAtPSBzaXplICsgcG9zaXRpb247XG4gICAgICAgIH1cbiAgICAgICAgbWluID0gKGkgPyB5Q2xhbXAgOiB4Q2xhbXApID8gTWF0aC5tYXgocjAsIE1hdGgubWluKHIxLCBwb2ludFtpXSkpIDogcG9pbnRbaV07XG4gICAgICAgIGlmIChkcmFnZ2luZykge1xuICAgICAgICAgIG1heCA9IChtaW4gKz0gcG9zaXRpb24pICsgc2l6ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoY2VudGVyKSBwb3NpdGlvbiA9IE1hdGgubWF4KHIwLCBNYXRoLm1pbihyMSwgMiAqIGNlbnRlcltpXSAtIG1pbikpO1xuICAgICAgICAgIGlmIChwb3NpdGlvbiA8IG1pbikge1xuICAgICAgICAgICAgbWF4ID0gbWluO1xuICAgICAgICAgICAgbWluID0gcG9zaXRpb247XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1heCA9IHBvc2l0aW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoZXh0ZW50WzBdICE9IG1pbiB8fCBleHRlbnRbMV0gIT0gbWF4KSB7XG4gICAgICAgICAgaWYgKGkpIHlFeHRlbnREb21haW4gPSBudWxsOyBlbHNlIHhFeHRlbnREb21haW4gPSBudWxsO1xuICAgICAgICAgIGV4dGVudFswXSA9IG1pbjtcbiAgICAgICAgICBleHRlbnRbMV0gPSBtYXg7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGJydXNoZW5kKCkge1xuICAgICAgICBicnVzaG1vdmUoKTtcbiAgICAgICAgZy5zdHlsZShcInBvaW50ZXItZXZlbnRzXCIsIFwiYWxsXCIpLnNlbGVjdEFsbChcIi5yZXNpemVcIikuc3R5bGUoXCJkaXNwbGF5XCIsIGJydXNoLmVtcHR5KCkgPyBcIm5vbmVcIiA6IG51bGwpO1xuICAgICAgICBkMy5zZWxlY3QoXCJib2R5XCIpLnN0eWxlKFwiY3Vyc29yXCIsIG51bGwpO1xuICAgICAgICB3Lm9uKFwibW91c2Vtb3ZlLmJydXNoXCIsIG51bGwpLm9uKFwibW91c2V1cC5icnVzaFwiLCBudWxsKS5vbihcInRvdWNobW92ZS5icnVzaFwiLCBudWxsKS5vbihcInRvdWNoZW5kLmJydXNoXCIsIG51bGwpLm9uKFwia2V5ZG93bi5icnVzaFwiLCBudWxsKS5vbihcImtleXVwLmJydXNoXCIsIG51bGwpO1xuICAgICAgICBkcmFnUmVzdG9yZSgpO1xuICAgICAgICBldmVudF8oe1xuICAgICAgICAgIHR5cGU6IFwiYnJ1c2hlbmRcIlxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgYnJ1c2gueCA9IGZ1bmN0aW9uKHopIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHg7XG4gICAgICB4ID0gejtcbiAgICAgIHJlc2l6ZXMgPSBkM19zdmdfYnJ1c2hSZXNpemVzWyF4IDw8IDEgfCAheV07XG4gICAgICByZXR1cm4gYnJ1c2g7XG4gICAgfTtcbiAgICBicnVzaC55ID0gZnVuY3Rpb24oeikge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geTtcbiAgICAgIHkgPSB6O1xuICAgICAgcmVzaXplcyA9IGQzX3N2Z19icnVzaFJlc2l6ZXNbIXggPDwgMSB8ICF5XTtcbiAgICAgIHJldHVybiBicnVzaDtcbiAgICB9O1xuICAgIGJydXNoLmNsYW1wID0gZnVuY3Rpb24oeikge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4geCAmJiB5ID8gWyB4Q2xhbXAsIHlDbGFtcCBdIDogeCA/IHhDbGFtcCA6IHkgPyB5Q2xhbXAgOiBudWxsO1xuICAgICAgaWYgKHggJiYgeSkgeENsYW1wID0gISF6WzBdLCB5Q2xhbXAgPSAhIXpbMV07IGVsc2UgaWYgKHgpIHhDbGFtcCA9ICEhejsgZWxzZSBpZiAoeSkgeUNsYW1wID0gISF6O1xuICAgICAgcmV0dXJuIGJydXNoO1xuICAgIH07XG4gICAgYnJ1c2guZXh0ZW50ID0gZnVuY3Rpb24oeikge1xuICAgICAgdmFyIHgwLCB4MSwgeTAsIHkxLCB0O1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIGlmICh4KSB7XG4gICAgICAgICAgaWYgKHhFeHRlbnREb21haW4pIHtcbiAgICAgICAgICAgIHgwID0geEV4dGVudERvbWFpblswXSwgeDEgPSB4RXh0ZW50RG9tYWluWzFdO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB4MCA9IHhFeHRlbnRbMF0sIHgxID0geEV4dGVudFsxXTtcbiAgICAgICAgICAgIGlmICh4LmludmVydCkgeDAgPSB4LmludmVydCh4MCksIHgxID0geC5pbnZlcnQoeDEpO1xuICAgICAgICAgICAgaWYgKHgxIDwgeDApIHQgPSB4MCwgeDAgPSB4MSwgeDEgPSB0O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoeSkge1xuICAgICAgICAgIGlmICh5RXh0ZW50RG9tYWluKSB7XG4gICAgICAgICAgICB5MCA9IHlFeHRlbnREb21haW5bMF0sIHkxID0geUV4dGVudERvbWFpblsxXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeTAgPSB5RXh0ZW50WzBdLCB5MSA9IHlFeHRlbnRbMV07XG4gICAgICAgICAgICBpZiAoeS5pbnZlcnQpIHkwID0geS5pbnZlcnQoeTApLCB5MSA9IHkuaW52ZXJ0KHkxKTtcbiAgICAgICAgICAgIGlmICh5MSA8IHkwKSB0ID0geTAsIHkwID0geTEsIHkxID0gdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHggJiYgeSA/IFsgWyB4MCwgeTAgXSwgWyB4MSwgeTEgXSBdIDogeCA/IFsgeDAsIHgxIF0gOiB5ICYmIFsgeTAsIHkxIF07XG4gICAgICB9XG4gICAgICBpZiAoeCkge1xuICAgICAgICB4MCA9IHpbMF0sIHgxID0gelsxXTtcbiAgICAgICAgaWYgKHkpIHgwID0geDBbMF0sIHgxID0geDFbMF07XG4gICAgICAgIHhFeHRlbnREb21haW4gPSBbIHgwLCB4MSBdO1xuICAgICAgICBpZiAoeC5pbnZlcnQpIHgwID0geCh4MCksIHgxID0geCh4MSk7XG4gICAgICAgIGlmICh4MSA8IHgwKSB0ID0geDAsIHgwID0geDEsIHgxID0gdDtcbiAgICAgICAgaWYgKHgwICE9IHhFeHRlbnRbMF0gfHwgeDEgIT0geEV4dGVudFsxXSkgeEV4dGVudCA9IFsgeDAsIHgxIF07XG4gICAgICB9XG4gICAgICBpZiAoeSkge1xuICAgICAgICB5MCA9IHpbMF0sIHkxID0gelsxXTtcbiAgICAgICAgaWYgKHgpIHkwID0geTBbMV0sIHkxID0geTFbMV07XG4gICAgICAgIHlFeHRlbnREb21haW4gPSBbIHkwLCB5MSBdO1xuICAgICAgICBpZiAoeS5pbnZlcnQpIHkwID0geSh5MCksIHkxID0geSh5MSk7XG4gICAgICAgIGlmICh5MSA8IHkwKSB0ID0geTAsIHkwID0geTEsIHkxID0gdDtcbiAgICAgICAgaWYgKHkwICE9IHlFeHRlbnRbMF0gfHwgeTEgIT0geUV4dGVudFsxXSkgeUV4dGVudCA9IFsgeTAsIHkxIF07XG4gICAgICB9XG4gICAgICByZXR1cm4gYnJ1c2g7XG4gICAgfTtcbiAgICBicnVzaC5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCFicnVzaC5lbXB0eSgpKSB7XG4gICAgICAgIHhFeHRlbnQgPSBbIDAsIDAgXSwgeUV4dGVudCA9IFsgMCwgMCBdO1xuICAgICAgICB4RXh0ZW50RG9tYWluID0geUV4dGVudERvbWFpbiA9IG51bGw7XG4gICAgICB9XG4gICAgICByZXR1cm4gYnJ1c2g7XG4gICAgfTtcbiAgICBicnVzaC5lbXB0eSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICEheCAmJiB4RXh0ZW50WzBdID09IHhFeHRlbnRbMV0gfHwgISF5ICYmIHlFeHRlbnRbMF0gPT0geUV4dGVudFsxXTtcbiAgICB9O1xuICAgIHJldHVybiBkMy5yZWJpbmQoYnJ1c2gsIGV2ZW50LCBcIm9uXCIpO1xuICB9O1xuICB2YXIgZDNfc3ZnX2JydXNoQ3Vyc29yID0ge1xuICAgIG46IFwibnMtcmVzaXplXCIsXG4gICAgZTogXCJldy1yZXNpemVcIixcbiAgICBzOiBcIm5zLXJlc2l6ZVwiLFxuICAgIHc6IFwiZXctcmVzaXplXCIsXG4gICAgbnc6IFwibndzZS1yZXNpemVcIixcbiAgICBuZTogXCJuZXN3LXJlc2l6ZVwiLFxuICAgIHNlOiBcIm53c2UtcmVzaXplXCIsXG4gICAgc3c6IFwibmVzdy1yZXNpemVcIlxuICB9O1xuICB2YXIgZDNfc3ZnX2JydXNoUmVzaXplcyA9IFsgWyBcIm5cIiwgXCJlXCIsIFwic1wiLCBcIndcIiwgXCJud1wiLCBcIm5lXCIsIFwic2VcIiwgXCJzd1wiIF0sIFsgXCJlXCIsIFwid1wiIF0sIFsgXCJuXCIsIFwic1wiIF0sIFtdIF07XG4gIHZhciBkM190aW1lX2Zvcm1hdCA9IGQzX3RpbWUuZm9ybWF0ID0gZDNfbG9jYWxlX2VuVVMudGltZUZvcm1hdDtcbiAgdmFyIGQzX3RpbWVfZm9ybWF0VXRjID0gZDNfdGltZV9mb3JtYXQudXRjO1xuICB2YXIgZDNfdGltZV9mb3JtYXRJc28gPSBkM190aW1lX2Zvcm1hdFV0YyhcIiVZLSVtLSVkVCVIOiVNOiVTLiVMWlwiKTtcbiAgZDNfdGltZV9mb3JtYXQuaXNvID0gRGF0ZS5wcm90b3R5cGUudG9JU09TdHJpbmcgJiYgK25ldyBEYXRlKFwiMjAwMC0wMS0wMVQwMDowMDowMC4wMDBaXCIpID8gZDNfdGltZV9mb3JtYXRJc29OYXRpdmUgOiBkM190aW1lX2Zvcm1hdElzbztcbiAgZnVuY3Rpb24gZDNfdGltZV9mb3JtYXRJc29OYXRpdmUoZGF0ZSkge1xuICAgIHJldHVybiBkYXRlLnRvSVNPU3RyaW5nKCk7XG4gIH1cbiAgZDNfdGltZV9mb3JtYXRJc29OYXRpdmUucGFyc2UgPSBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKHN0cmluZyk7XG4gICAgcmV0dXJuIGlzTmFOKGRhdGUpID8gbnVsbCA6IGRhdGU7XG4gIH07XG4gIGQzX3RpbWVfZm9ybWF0SXNvTmF0aXZlLnRvU3RyaW5nID0gZDNfdGltZV9mb3JtYXRJc28udG9TdHJpbmc7XG4gIGQzX3RpbWUuc2Vjb25kID0gZDNfdGltZV9pbnRlcnZhbChmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIG5ldyBkM19kYXRlKE1hdGguZmxvb3IoZGF0ZSAvIDFlMykgKiAxZTMpO1xuICB9LCBmdW5jdGlvbihkYXRlLCBvZmZzZXQpIHtcbiAgICBkYXRlLnNldFRpbWUoZGF0ZS5nZXRUaW1lKCkgKyBNYXRoLmZsb29yKG9mZnNldCkgKiAxZTMpO1xuICB9LCBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGUuZ2V0U2Vjb25kcygpO1xuICB9KTtcbiAgZDNfdGltZS5zZWNvbmRzID0gZDNfdGltZS5zZWNvbmQucmFuZ2U7XG4gIGQzX3RpbWUuc2Vjb25kcy51dGMgPSBkM190aW1lLnNlY29uZC51dGMucmFuZ2U7XG4gIGQzX3RpbWUubWludXRlID0gZDNfdGltZV9pbnRlcnZhbChmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIG5ldyBkM19kYXRlKE1hdGguZmxvb3IoZGF0ZSAvIDZlNCkgKiA2ZTQpO1xuICB9LCBmdW5jdGlvbihkYXRlLCBvZmZzZXQpIHtcbiAgICBkYXRlLnNldFRpbWUoZGF0ZS5nZXRUaW1lKCkgKyBNYXRoLmZsb29yKG9mZnNldCkgKiA2ZTQpO1xuICB9LCBmdW5jdGlvbihkYXRlKSB7XG4gICAgcmV0dXJuIGRhdGUuZ2V0TWludXRlcygpO1xuICB9KTtcbiAgZDNfdGltZS5taW51dGVzID0gZDNfdGltZS5taW51dGUucmFuZ2U7XG4gIGQzX3RpbWUubWludXRlcy51dGMgPSBkM190aW1lLm1pbnV0ZS51dGMucmFuZ2U7XG4gIGQzX3RpbWUuaG91ciA9IGQzX3RpbWVfaW50ZXJ2YWwoZnVuY3Rpb24oZGF0ZSkge1xuICAgIHZhciB0aW1lem9uZSA9IGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKSAvIDYwO1xuICAgIHJldHVybiBuZXcgZDNfZGF0ZSgoTWF0aC5mbG9vcihkYXRlIC8gMzZlNSAtIHRpbWV6b25lKSArIHRpbWV6b25lKSAqIDM2ZTUpO1xuICB9LCBmdW5jdGlvbihkYXRlLCBvZmZzZXQpIHtcbiAgICBkYXRlLnNldFRpbWUoZGF0ZS5nZXRUaW1lKCkgKyBNYXRoLmZsb29yKG9mZnNldCkgKiAzNmU1KTtcbiAgfSwgZnVuY3Rpb24oZGF0ZSkge1xuICAgIHJldHVybiBkYXRlLmdldEhvdXJzKCk7XG4gIH0pO1xuICBkM190aW1lLmhvdXJzID0gZDNfdGltZS5ob3VyLnJhbmdlO1xuICBkM190aW1lLmhvdXJzLnV0YyA9IGQzX3RpbWUuaG91ci51dGMucmFuZ2U7XG4gIGQzX3RpbWUubW9udGggPSBkM190aW1lX2ludGVydmFsKGZ1bmN0aW9uKGRhdGUpIHtcbiAgICBkYXRlID0gZDNfdGltZS5kYXkoZGF0ZSk7XG4gICAgZGF0ZS5zZXREYXRlKDEpO1xuICAgIHJldHVybiBkYXRlO1xuICB9LCBmdW5jdGlvbihkYXRlLCBvZmZzZXQpIHtcbiAgICBkYXRlLnNldE1vbnRoKGRhdGUuZ2V0TW9udGgoKSArIG9mZnNldCk7XG4gIH0sIGZ1bmN0aW9uKGRhdGUpIHtcbiAgICByZXR1cm4gZGF0ZS5nZXRNb250aCgpO1xuICB9KTtcbiAgZDNfdGltZS5tb250aHMgPSBkM190aW1lLm1vbnRoLnJhbmdlO1xuICBkM190aW1lLm1vbnRocy51dGMgPSBkM190aW1lLm1vbnRoLnV0Yy5yYW5nZTtcbiAgZnVuY3Rpb24gZDNfdGltZV9zY2FsZShsaW5lYXIsIG1ldGhvZHMsIGZvcm1hdCkge1xuICAgIGZ1bmN0aW9uIHNjYWxlKHgpIHtcbiAgICAgIHJldHVybiBsaW5lYXIoeCk7XG4gICAgfVxuICAgIHNjYWxlLmludmVydCA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIHJldHVybiBkM190aW1lX3NjYWxlRGF0ZShsaW5lYXIuaW52ZXJ0KHgpKTtcbiAgICB9O1xuICAgIHNjYWxlLmRvbWFpbiA9IGZ1bmN0aW9uKHgpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGxpbmVhci5kb21haW4oKS5tYXAoZDNfdGltZV9zY2FsZURhdGUpO1xuICAgICAgbGluZWFyLmRvbWFpbih4KTtcbiAgICAgIHJldHVybiBzY2FsZTtcbiAgICB9O1xuICAgIGZ1bmN0aW9uIHRpY2tNZXRob2QoZXh0ZW50LCBjb3VudCkge1xuICAgICAgdmFyIHNwYW4gPSBleHRlbnRbMV0gLSBleHRlbnRbMF0sIHRhcmdldCA9IHNwYW4gLyBjb3VudCwgaSA9IGQzLmJpc2VjdChkM190aW1lX3NjYWxlU3RlcHMsIHRhcmdldCk7XG4gICAgICByZXR1cm4gaSA9PSBkM190aW1lX3NjYWxlU3RlcHMubGVuZ3RoID8gWyBtZXRob2RzLnllYXIsIGQzX3NjYWxlX2xpbmVhclRpY2tSYW5nZShleHRlbnQubWFwKGZ1bmN0aW9uKGQpIHtcbiAgICAgICAgcmV0dXJuIGQgLyAzMTUzNmU2O1xuICAgICAgfSksIGNvdW50KVsyXSBdIDogIWkgPyBbIGQzX3RpbWVfc2NhbGVNaWxsaXNlY29uZHMsIGQzX3NjYWxlX2xpbmVhclRpY2tSYW5nZShleHRlbnQsIGNvdW50KVsyXSBdIDogbWV0aG9kc1t0YXJnZXQgLyBkM190aW1lX3NjYWxlU3RlcHNbaSAtIDFdIDwgZDNfdGltZV9zY2FsZVN0ZXBzW2ldIC8gdGFyZ2V0ID8gaSAtIDEgOiBpXTtcbiAgICB9XG4gICAgc2NhbGUubmljZSA9IGZ1bmN0aW9uKGludGVydmFsLCBza2lwKSB7XG4gICAgICB2YXIgZG9tYWluID0gc2NhbGUuZG9tYWluKCksIGV4dGVudCA9IGQzX3NjYWxlRXh0ZW50KGRvbWFpbiksIG1ldGhvZCA9IGludGVydmFsID09IG51bGwgPyB0aWNrTWV0aG9kKGV4dGVudCwgMTApIDogdHlwZW9mIGludGVydmFsID09PSBcIm51bWJlclwiICYmIHRpY2tNZXRob2QoZXh0ZW50LCBpbnRlcnZhbCk7XG4gICAgICBpZiAobWV0aG9kKSBpbnRlcnZhbCA9IG1ldGhvZFswXSwgc2tpcCA9IG1ldGhvZFsxXTtcbiAgICAgIGZ1bmN0aW9uIHNraXBwZWQoZGF0ZSkge1xuICAgICAgICByZXR1cm4gIWlzTmFOKGRhdGUpICYmICFpbnRlcnZhbC5yYW5nZShkYXRlLCBkM190aW1lX3NjYWxlRGF0ZSgrZGF0ZSArIDEpLCBza2lwKS5sZW5ndGg7XG4gICAgICB9XG4gICAgICByZXR1cm4gc2NhbGUuZG9tYWluKGQzX3NjYWxlX25pY2UoZG9tYWluLCBza2lwID4gMSA/IHtcbiAgICAgICAgZmxvb3I6IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICAgICAgICB3aGlsZSAoc2tpcHBlZChkYXRlID0gaW50ZXJ2YWwuZmxvb3IoZGF0ZSkpKSBkYXRlID0gZDNfdGltZV9zY2FsZURhdGUoZGF0ZSAtIDEpO1xuICAgICAgICAgIHJldHVybiBkYXRlO1xuICAgICAgICB9LFxuICAgICAgICBjZWlsOiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgICAgd2hpbGUgKHNraXBwZWQoZGF0ZSA9IGludGVydmFsLmNlaWwoZGF0ZSkpKSBkYXRlID0gZDNfdGltZV9zY2FsZURhdGUoK2RhdGUgKyAxKTtcbiAgICAgICAgICByZXR1cm4gZGF0ZTtcbiAgICAgICAgfVxuICAgICAgfSA6IGludGVydmFsKSk7XG4gICAgfTtcbiAgICBzY2FsZS50aWNrcyA9IGZ1bmN0aW9uKGludGVydmFsLCBza2lwKSB7XG4gICAgICB2YXIgZXh0ZW50ID0gZDNfc2NhbGVFeHRlbnQoc2NhbGUuZG9tYWluKCkpLCBtZXRob2QgPSBpbnRlcnZhbCA9PSBudWxsID8gdGlja01ldGhvZChleHRlbnQsIDEwKSA6IHR5cGVvZiBpbnRlcnZhbCA9PT0gXCJudW1iZXJcIiA/IHRpY2tNZXRob2QoZXh0ZW50LCBpbnRlcnZhbCkgOiAhaW50ZXJ2YWwucmFuZ2UgJiYgWyB7XG4gICAgICAgIHJhbmdlOiBpbnRlcnZhbFxuICAgICAgfSwgc2tpcCBdO1xuICAgICAgaWYgKG1ldGhvZCkgaW50ZXJ2YWwgPSBtZXRob2RbMF0sIHNraXAgPSBtZXRob2RbMV07XG4gICAgICByZXR1cm4gaW50ZXJ2YWwucmFuZ2UoZXh0ZW50WzBdLCBkM190aW1lX3NjYWxlRGF0ZSgrZXh0ZW50WzFdICsgMSksIHNraXAgPCAxID8gMSA6IHNraXApO1xuICAgIH07XG4gICAgc2NhbGUudGlja0Zvcm1hdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZvcm1hdDtcbiAgICB9O1xuICAgIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBkM190aW1lX3NjYWxlKGxpbmVhci5jb3B5KCksIG1ldGhvZHMsIGZvcm1hdCk7XG4gICAgfTtcbiAgICByZXR1cm4gZDNfc2NhbGVfbGluZWFyUmViaW5kKHNjYWxlLCBsaW5lYXIpO1xuICB9XG4gIGZ1bmN0aW9uIGQzX3RpbWVfc2NhbGVEYXRlKHQpIHtcbiAgICByZXR1cm4gbmV3IERhdGUodCk7XG4gIH1cbiAgdmFyIGQzX3RpbWVfc2NhbGVTdGVwcyA9IFsgMWUzLCA1ZTMsIDE1ZTMsIDNlNCwgNmU0LCAzZTUsIDllNSwgMThlNSwgMzZlNSwgMTA4ZTUsIDIxNmU1LCA0MzJlNSwgODY0ZTUsIDE3MjhlNSwgNjA0OGU1LCAyNTkyZTYsIDc3NzZlNiwgMzE1MzZlNiBdO1xuICB2YXIgZDNfdGltZV9zY2FsZUxvY2FsTWV0aG9kcyA9IFsgWyBkM190aW1lLnNlY29uZCwgMSBdLCBbIGQzX3RpbWUuc2Vjb25kLCA1IF0sIFsgZDNfdGltZS5zZWNvbmQsIDE1IF0sIFsgZDNfdGltZS5zZWNvbmQsIDMwIF0sIFsgZDNfdGltZS5taW51dGUsIDEgXSwgWyBkM190aW1lLm1pbnV0ZSwgNSBdLCBbIGQzX3RpbWUubWludXRlLCAxNSBdLCBbIGQzX3RpbWUubWludXRlLCAzMCBdLCBbIGQzX3RpbWUuaG91ciwgMSBdLCBbIGQzX3RpbWUuaG91ciwgMyBdLCBbIGQzX3RpbWUuaG91ciwgNiBdLCBbIGQzX3RpbWUuaG91ciwgMTIgXSwgWyBkM190aW1lLmRheSwgMSBdLCBbIGQzX3RpbWUuZGF5LCAyIF0sIFsgZDNfdGltZS53ZWVrLCAxIF0sIFsgZDNfdGltZS5tb250aCwgMSBdLCBbIGQzX3RpbWUubW9udGgsIDMgXSwgWyBkM190aW1lLnllYXIsIDEgXSBdO1xuICB2YXIgZDNfdGltZV9zY2FsZUxvY2FsRm9ybWF0ID0gZDNfdGltZV9mb3JtYXQubXVsdGkoWyBbIFwiLiVMXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5nZXRNaWxsaXNlY29uZHMoKTtcbiAgfSBdLCBbIFwiOiVTXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5nZXRTZWNvbmRzKCk7XG4gIH0gXSwgWyBcIiVJOiVNXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5nZXRNaW51dGVzKCk7XG4gIH0gXSwgWyBcIiVJICVwXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5nZXRIb3VycygpO1xuICB9IF0sIFsgXCIlYSAlZFwiLCBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQuZ2V0RGF5KCkgJiYgZC5nZXREYXRlKCkgIT0gMTtcbiAgfSBdLCBbIFwiJWIgJWRcIiwgZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLmdldERhdGUoKSAhPSAxO1xuICB9IF0sIFsgXCIlQlwiLCBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQuZ2V0TW9udGgoKTtcbiAgfSBdLCBbIFwiJVlcIiwgZDNfdHJ1ZSBdIF0pO1xuICB2YXIgZDNfdGltZV9zY2FsZU1pbGxpc2Vjb25kcyA9IHtcbiAgICByYW5nZTogZnVuY3Rpb24oc3RhcnQsIHN0b3AsIHN0ZXApIHtcbiAgICAgIHJldHVybiBkMy5yYW5nZShNYXRoLmNlaWwoc3RhcnQgLyBzdGVwKSAqIHN0ZXAsICtzdG9wLCBzdGVwKS5tYXAoZDNfdGltZV9zY2FsZURhdGUpO1xuICAgIH0sXG4gICAgZmxvb3I6IGQzX2lkZW50aXR5LFxuICAgIGNlaWw6IGQzX2lkZW50aXR5XG4gIH07XG4gIGQzX3RpbWVfc2NhbGVMb2NhbE1ldGhvZHMueWVhciA9IGQzX3RpbWUueWVhcjtcbiAgZDNfdGltZS5zY2FsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkM190aW1lX3NjYWxlKGQzLnNjYWxlLmxpbmVhcigpLCBkM190aW1lX3NjYWxlTG9jYWxNZXRob2RzLCBkM190aW1lX3NjYWxlTG9jYWxGb3JtYXQpO1xuICB9O1xuICB2YXIgZDNfdGltZV9zY2FsZVV0Y01ldGhvZHMgPSBkM190aW1lX3NjYWxlTG9jYWxNZXRob2RzLm1hcChmdW5jdGlvbihtKSB7XG4gICAgcmV0dXJuIFsgbVswXS51dGMsIG1bMV0gXTtcbiAgfSk7XG4gIHZhciBkM190aW1lX3NjYWxlVXRjRm9ybWF0ID0gZDNfdGltZV9mb3JtYXRVdGMubXVsdGkoWyBbIFwiLiVMXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5nZXRVVENNaWxsaXNlY29uZHMoKTtcbiAgfSBdLCBbIFwiOiVTXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5nZXRVVENTZWNvbmRzKCk7XG4gIH0gXSwgWyBcIiVJOiVNXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5nZXRVVENNaW51dGVzKCk7XG4gIH0gXSwgWyBcIiVJICVwXCIsIGZ1bmN0aW9uKGQpIHtcbiAgICByZXR1cm4gZC5nZXRVVENIb3VycygpO1xuICB9IF0sIFsgXCIlYSAlZFwiLCBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQuZ2V0VVRDRGF5KCkgJiYgZC5nZXRVVENEYXRlKCkgIT0gMTtcbiAgfSBdLCBbIFwiJWIgJWRcIiwgZnVuY3Rpb24oZCkge1xuICAgIHJldHVybiBkLmdldFVUQ0RhdGUoKSAhPSAxO1xuICB9IF0sIFsgXCIlQlwiLCBmdW5jdGlvbihkKSB7XG4gICAgcmV0dXJuIGQuZ2V0VVRDTW9udGgoKTtcbiAgfSBdLCBbIFwiJVlcIiwgZDNfdHJ1ZSBdIF0pO1xuICBkM190aW1lX3NjYWxlVXRjTWV0aG9kcy55ZWFyID0gZDNfdGltZS55ZWFyLnV0YztcbiAgZDNfdGltZS5zY2FsZS51dGMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZDNfdGltZV9zY2FsZShkMy5zY2FsZS5saW5lYXIoKSwgZDNfdGltZV9zY2FsZVV0Y01ldGhvZHMsIGQzX3RpbWVfc2NhbGVVdGNGb3JtYXQpO1xuICB9O1xuICBkMy50ZXh0ID0gZDNfeGhyVHlwZShmdW5jdGlvbihyZXF1ZXN0KSB7XG4gICAgcmV0dXJuIHJlcXVlc3QucmVzcG9uc2VUZXh0O1xuICB9KTtcbiAgZDMuanNvbiA9IGZ1bmN0aW9uKHVybCwgY2FsbGJhY2spIHtcbiAgICByZXR1cm4gZDNfeGhyKHVybCwgXCJhcHBsaWNhdGlvbi9qc29uXCIsIGQzX2pzb24sIGNhbGxiYWNrKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfanNvbihyZXF1ZXN0KSB7XG4gICAgcmV0dXJuIEpTT04ucGFyc2UocmVxdWVzdC5yZXNwb25zZVRleHQpO1xuICB9XG4gIGQzLmh0bWwgPSBmdW5jdGlvbih1cmwsIGNhbGxiYWNrKSB7XG4gICAgcmV0dXJuIGQzX3hocih1cmwsIFwidGV4dC9odG1sXCIsIGQzX2h0bWwsIGNhbGxiYWNrKTtcbiAgfTtcbiAgZnVuY3Rpb24gZDNfaHRtbChyZXF1ZXN0KSB7XG4gICAgdmFyIHJhbmdlID0gZDNfZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKTtcbiAgICByYW5nZS5zZWxlY3ROb2RlKGQzX2RvY3VtZW50LmJvZHkpO1xuICAgIHJldHVybiByYW5nZS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQocmVxdWVzdC5yZXNwb25zZVRleHQpO1xuICB9XG4gIGQzLnhtbCA9IGQzX3hoclR5cGUoZnVuY3Rpb24ocmVxdWVzdCkge1xuICAgIHJldHVybiByZXF1ZXN0LnJlc3BvbnNlWE1MO1xuICB9KTtcbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSBkZWZpbmUoZDMpOyBlbHNlIGlmICh0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiICYmIG1vZHVsZS5leHBvcnRzKSBtb2R1bGUuZXhwb3J0cyA9IGQzO1xuICB0aGlzLmQzID0gZDM7XG59KCk7Il19
