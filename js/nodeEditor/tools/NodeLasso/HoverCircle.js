var PIXI = require('pixi.js');

var HoverCircle = function( nodeEditor, nodeLasso ) {
	
	this.nodeEditor = nodeEditor;
	this.nodeLasso = nodeLasso;
	
	this.sprite = new PIXI.Graphics();
	this.nodeEditor.scene.stage.addChild( this.sprite );
	this.sprite.visible = false;
	
	this.node = null;
	this.addedSprite = false;
	
	_.bindAll( this, "update", "start", "stop" );
	
	this.nodeLasso.on( 'mouseover', this.start );
	this.nodeLasso.on( 'mouseout', this.stop );
	this.nodeLasso.on( 'stop', this.stop );

	this.once = true;
};

module.exports = HoverCircle;

HoverCircle.prototype = {
	
	start : function( event ) {

		this.node = event.node;
		
		if( this.once ) {
			this.draw();
			this.once = false;
		}
		this.update();
		
		this.sprite.visible = true;
		this.sprite.alpha = 0;
		
		this.nodeEditor.scene.on('update', this.update );
		
		this.addedSprite = true;
		
	},
	
	stop : function() {
		
		if( this.addedSprite ) {

			this.sprite.visible = false;
			
			this.nodeEditor.scene.off('update', this.update );
			
			this.addedSprite = false;
			
		}
	},
	
	draw : function() {
		
		this.sprite.clear();
		
		this.sprite.lineStyle(2 * this.nodeEditor.scene.ratio, 0xFFFFFF, 0.8);
		
		//TODO
		this.sprite.drawCircle( 0, 0, Math.max((6 - this.node.depth) / 6, 0.3) * 15 * this.nodeEditor.scene.ratio );
		
	},
	
	update : function() {
		this.sprite.position.x = this.node.x;
		this.sprite.position.y = this.node.y;
		this.sprite.alpha = 1;
	}
};