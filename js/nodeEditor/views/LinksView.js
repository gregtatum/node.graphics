var PIXI = require('pixi.js');

var LinksView = function( nodeEditor ) {
	
	this.nodeEditor = nodeEditor;
	this.graphics = new PIXI.Graphics();
	
	
	nodeEditor.scene.stage.addChildAt( this.graphics, 0 );
	nodeEditor.scene.on( 'update', this.update.bind(this) );
	
};

module.exports = LinksView;

LinksView.prototype = {

	update : function( e ) {
		
		var graphics = this.graphics;
		
		graphics.clear();
		
		var ratio = this.nodeEditor.scene.ratio;
		var lineWidth = 0;
		
		_.each( this.nodeEditor.tree.links, function( link ) {
			
			var alpha = this.fadeOutWhenReParenting( e, link, graphics );
			
			lineWidth = Math.max((5 - link.source.depth) * 0.8 * ratio, 1);
			
			this.graphics.lineStyle( lineWidth, 0x999999, alpha );
			
			graphics.moveTo( link.source.x, link.source.y );
			graphics.lineTo( link.target.x, link.target.y );
			
		}, this);
		
	},
	
	fadeOutWhenReParenting : function( e, link, graphics ) {
		
		var defaultAlpha, alpha, state,
		
		alpha = defaultAlpha = 0.6;
		
		if( link.target ) {
			
			nodeState = link.target.state;
			
			if( nodeState.reParenting ) {
			
				if( nodeState.reParentingPrevious !== nodeState.reParenting ) {
					nodeState.reParentingAlpha = defaultAlpha;
					nodeState.reParentingAnimationComplete = false;
				}
				
				if(!nodeState.reParentingAnimationComplete ) {
					
					nodeState.reParentingAlpha = Math.max( (nodeState.reParentingAlpha - e.dt * 0.0004), 0 );
					
					if( nodeState.reParentingAlpha === 0 ) {
						nodeState.reParentingAnimationComplete = true;
					}
					
					alpha = nodeState.reParentingAlpha;
					
				} else {
					alpha = 0;
				}
								
			} else {
				alpha = defaultAlpha;
			}
		
			nodeState.reParentingPrevious = nodeState.reParenting;
		}
		
		return alpha;
		

	}
	
};