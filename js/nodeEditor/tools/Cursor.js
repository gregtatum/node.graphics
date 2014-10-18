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
		console.log('create node', shortcuts.createNode);
		this.nodeEditor.keyboard.on( shortcuts.up, this.up, this );
		this.nodeEditor.keyboard.on( shortcuts.down, this.down, this );
		this.nodeEditor.keyboard.on( shortcuts.left, this.left, this );
		this.nodeEditor.keyboard.on( shortcuts.right, this.right, this );
		this.nodeEditor.keyboard.on( shortcuts.siblingUp, this.siblingUp, this );
		this.nodeEditor.keyboard.on( shortcuts.siblingDown, this.siblingDown, this );
		this.nodeEditor.keyboard.on( shortcuts.siblingLeft, this.siblingLeft, this );
		this.nodeEditor.keyboard.on( shortcuts.siblingRight, this.siblingRight, this );
		this.nodeEditor.on('nodesAdded', this.handleNodesAdded.bind(this) );
		this.nodeEditor.keyboard.on( shortcuts.createNode, this.createNode, this );
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
	
	createNode : function() {
		
		console.warn('temporary create node implementation');
		var x = 20 - Math.random() * 40;
		var y = 20 - Math.random() * 40;
		var node = this.nodeEditor.tree.addNodeByType( "group", this.node.x + x, this.node.y + y, this.node );
		
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