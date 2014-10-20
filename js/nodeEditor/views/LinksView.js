var PIXI = require('pixi.js');

var LinksView = function( nodeEditor ) {
	
	this.nodeEditor = nodeEditor;
	this.graphics = new PIXI.Graphics();
	
	
	nodeEditor.scene.stage.addChild( this.graphics );
	nodeEditor.scene.on( 'update', this.update.bind(this) );
	
};

module.exports = LinksView;

LinksView.prototype = {

	update : function() {
		
		var graphics = this.graphics;
		
		graphics.clear();
		
		var ratio = this.nodeEditor.scene.ratio;
		var lineWidth = 0;
		
		_.each( this.nodeEditor.tree.links, function( link ) {
			
			lineWidth = Math.max((5 - link.source.depth) * 0.8 * ratio, 1);
			
			this.graphics.lineStyle( lineWidth, 0x999999, 0.6 );
			
			graphics.moveTo( link.source.x, link.source.y );
			graphics.lineTo( link.target.x, link.target.y );
			
		}, this);
		
	}
	
};