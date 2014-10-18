var shortcuts = require('../../environment/shortcuts/nodeEditor.shortcuts').cursor;

var Cursor = function( nodeEditor, $node ) {
	
	this.nodeEditor = nodeEditor;
	this.$node = null;
	
	if( $node ) {
		this.setNode( $node );
	}
	this.addHandlers();
	this.add();
};

module.exports = Cursor;

Cursor.prototype = {
	
	addHandlers : function() {
		this.nodeEditor.keyboard.on( shortcuts.up, this.up, this );
		this.nodeEditor.keyboard.on( shortcuts.down, this.down, this );
		this.nodeEditor.keyboard.on( shortcuts.left, this.left, this );
		this.nodeEditor.keyboard.on( shortcuts.right, this.right, this );
	},
	
	removeHandlers : function() {
		this.nodeEditor.keyboard.off( shortcuts.up, this.up, this );
		this.nodeEditor.keyboard.off( shortcuts.down, this.down, this );
		this.nodeEditor.keyboard.off( shortcuts.left, this.left, this );
		this.nodeEditor.keyboard.off( shortcuts.right, this.right, this );
	},
	
	navigateCheck : function( node ) {
		var $el;
		
		if( node ) {
			
			$el = this.nodeEditor.get$ElFromNode( node );
			
			this.setNode( $el, node );
		}	
	},
	
	up : function() {
		console.log('up');
		this.navigateCheck( this.nodeEditor.tree.navigateUp( this.node ) );
	},
	
	down : function() {
		console.log('down');
		this.navigateCheck( this.nodeEditor.tree.navigateDown( this.node ) );
	},
	
	left : function() {
		console.log('left');
		
		this.navigateCheck( this.nodeEditor.tree.navigateLeft( this.node ) );
	},
	
	right : function() {
		console.log('right');
		
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