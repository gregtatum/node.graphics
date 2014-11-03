var PIXI = require('pixi.js');

var Line = function( nodeEditor, nodeLasso ) {
	
	this.nodeEditor = nodeEditor;
	this.nodeLasso = nodeLasso;
	
	this.sprite = new PIXI.Graphics();

	_.bindAll( this, "draw", "start", "stop", "mouseover", "mouseout" );
	
	this.nodeLasso.on( "start", this.start );
	this.nodeLasso.on( "stop", this.stop );
	this.nodeLasso.on( "mouseover", this.mouseover );
	this.nodeLasso.on( "mouseout", this.mouseout );
	
};

module.exports = Line;

Line.prototype = {
	
	start : function( source, target ) {
		
		this.source = source;
		this.target = target;
		
		this.nodeEditor.scene.stage.addChild( this.sprite );
		this.nodeEditor.scene.on('update', this.draw );
		
	},
	
	stop : function() {
		
		this.nodeEditor.scene.stage.removeChild( this.sprite );
		this.nodeEditor.scene.off('update', this.draw );
		
	},
	
	mouseover : function( event ) {
		this.target = event.node;
	},
	
	mouseout : function( event ) {
		this.target = this.nodeEditor.mouse.position;
		console.log('mouseout');
	},
	
	draw : function() {
		
		this.sprite.clear();
		this.sprite.lineStyle(2, 0xFFFFFF, 0.8);
		
		this.sprite.moveTo(
			this.source.x,
			this.source.y
		);
		
		this.sprite.lineTo(
			this.target.x,
			this.target.y
		);
		
	},
};