var PIXI = require('pixi.js');

var HoverCircle = function( nodeEditor, nodeLasso ) {
	
	this.nodeEditor = nodeEditor;
	this.nodeLasso = nodeLasso;
	
	this.sprite = new PIXI.Graphics();
	this.node = null;
	this.addedSprite = false;
	
	_.bindAll( this, "update", "start", "stop" );
	
	this.nodeLasso.on( 'mouseover', this.start );
	this.nodeLasso.on( 'mouseout', this.stop );
	this.nodeLasso.on( 'stop', this.stop );

};

module.exports = HoverCircle;

HoverCircle.prototype = {
	
	start : function( event ) {

		this.node = event.node;
		
		this.draw();
		this.update();
		
		this.nodeEditor.scene.stage.addChild( this.sprite );
		this.nodeEditor.scene.on('update', this.update );
		
		this.addedSprite = true;
		
	},
	
	stop : function() {
		
		if( this.addedSprite ) {
			
			this.nodeEditor.scene.stage.removeChild( this.sprite );
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
	}
};