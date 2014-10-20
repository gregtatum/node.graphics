var shortcuts	= require('../../environment/shortcuts/nodeEditor.shortcuts.js'),
	NodeLasso	= require('../tools/NodeLasso'),
	PIXI		= require('pixi.js');

var GroupNode = function( nodeEditor, settings ) {
	this.shortcuts = shortcuts.nodeTypes.group;
	
	this.nodeEditor = nodeEditor;
	this.$scope = nodeEditor.$scope;
	this.nodeLasso = null;
	this.cssClass = "node-type-group";
	this.type = "group";
	this.sprites = [];
	this.nodes = [];
	
	this.nodeEditor.tree.on( 'changed', this.handleTreeChange.bind(this) );
	
	this.started = false;
	this.total = 0;
	
};

module.exports = GroupNode;

GroupNode.prototype = {
	
	start : function() {
		
		this.started = true;
		
		this.nodeLasso = new NodeLasso( this.nodeEditor, this.shortcuts.drawLine );
		this.nodeLasso.on( 'lasso', this.onLasso.bind(this) );
		this.nodeLasso.on( 'emptyRelease', this.onEmptyRelease.bind(this) );
		
		this.container = new PIXI.DisplayObjectContainer();
		this.nodeEditor.scene.stage.addChild( this.container );
		this.nodeEditor.scene.on('update', this.update.bind(this) );
		
		this.handleTreeChange();
	},
	
	handleTreeChange : function( e ) {
		
		console.log('handleTreeChange', this.type);
		
		if(this.started) {
			
			this.nodes = this.nodeEditor.tree.getNodesByType( this.type );
			var nodesChanged = this.nodes.length - this.total;
			this.total = this.nodes.length;
			
			if( nodesChanged > 0 ) {
				
				this.addNodes( nodesChanged );
				
			} else if( nodesChanged < 0 ) {
				
				this.removeNodes( nodesChanged * -1 );
				
			}
			
		} else {
			
			var nodeExists = _.find( this.nodeEditor.tree.nodes, function( node ) {
				return node.type === this.type;
			}, this);
			
			if( nodeExists ) {
				this.start();
			}
		}
		
	},

	addNodes : function( count ) {
				
		
		var i = 0; while(i++ < count) {
			
			var sprite = new PIXI.Graphics();
			sprite.interactive = true;
			sprite.buttonMode = true;
			
			this.draw( sprite );
			this.setHandlers( sprite );
			
			this.sprites.push( sprite );
			this.container.addChild( sprite );
			
		}
		
		this.update();
	},
	
	draw : function( sprite ) {
		
		var radius = 10 * this.nodeEditor.scene.ratio;
		
				
		sprite.beginFill(0x4a9DE7);
		sprite.drawCircle(0,0,radius);
		sprite.cacheAsBitmap = true;
		sprite.hitArea = new PIXI.Circle(0,0,radius);
		
	},
	
	setHandlers : function( sprite ) {
		
		sprite.mousedown = function() {
			
			this.dispatch({
				type: "click",
				sprite: sprite
			});
			
		}.bind(this);
		
	},
	
	update : function() {
		
		var sprite, node;
		
		for(var i=0,n=this.nodes.length; i < n; i++ ) {
			
			sprite = this.sprites[i];
			node = this.nodes[i];
			
			sprite.position.x = node.x;
			sprite.position.y = node.y;
			
			sprite.scale.x = Math.max((6 - node.depth) / 6, 0.3);
			sprite.scale.y = Math.max((6 - node.depth) / 6, 0.3);
			
			sprite.node = node;
		}
	},
	
	removeNodes : function( count ) {
		
		var i = 0; while(i++ < count) {
			
			var sprite = this.sprites.pop();
			this.container.remove( sprite );
			
		}
		
	},
	
	// setHandlers : function( nodeType ) {
	//
	// 	this.nodeLasso.setHandlers( nodeType );
	//
	// },
	
	onLasso : function( e ) {
		this.nodeEditor.tree.changeLinkSource( e.source, e.target );
	},
	
	onEmptyRelease : function( e ) {
		
		var parent = d3.select(e.source).data()[0];
		var node = this.nodeEditor.tree.addNodeByType( this.type, e.x, e.y, parent );
		
	}
	
};