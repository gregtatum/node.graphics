var PIXI = require('pixi.js');

var LassoTip = function( nodeEditor, nodeLasso ) {
	
	this.nodeEditor = nodeEditor;
	this.nodeLasso = nodeLasso;
	this.sprite = new PIXI.Graphics();

	_.bindAll( this, "update", "start", "stop" );
	
	this.nodeLasso.on('enterStage', this.start);
	this.nodeLasso.on('exitStage', this.stop);
	this.nodeLasso.on('stop', this.stop);
	
	this.addedSprite = false;
};

module.exports = LassoTip;

LassoTip.prototype = {
	
	start : function( position ) {
		
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
		this.sprite.beginFill( 0xFFFFFF );
		this.sprite.drawCircle( 0, 0, 5 * this.nodeEditor.scene.ratio );
		
	},
	
	update : function() {
		this.sprite.position.x = this.nodeEditor.mouse.position.x;
		this.sprite.position.y = this.nodeEditor.mouse.position.y;
	}
};