var PIXI			= require('pixi.js'),
	EventDispatcher	= require('../utils/EventDispatcher');

var Scene = function( options ) {
	
	this.options = _.extend({
		
		sizingElementSelector : window
		
	}, options);
	
	this.stage = new PIXI.Stage(0x000000, true);
	this.stage.setInteractive(true);
	this.ratio = window.devicePixelRatio >= 1 ? window.devicePixelRatio : 1;
	
	this.renderer = new PIXI.WebGLRenderer(0, 0, null, true, true);

	this.graphics = new PIXI.Graphics();

	document.body.appendChild( this.renderer.view );
	
	$(window).on('resize', this.handleResize.bind(this) );
	this.handleResize();
	
	this.time = Date.now();
	this.loop();
};

module.exports = Scene;

Scene.prototype = {
	
	stopLoop : function() {
		window.cancelAnimationFrame( this.animFrame );
	},
	
	loop : function() {
		var now = Date.now();
		var dt = Math.max(now - this.time, 100);
		this.time = now;
		
		this.dispatch({
			type	: "update",
			dt		: dt,
			scene	: this
		});
		
		this.renderer.render(this.stage);
		
		this.animFrame = window.requestAnimationFrame( this.loop.bind(this) );
	},

	handleResize : function() {
		
		var $sizingElement = $(this.options.sizingElementSelector);
		
		var offset = $sizingElement.offset();
		
		if( !_.isObject(offset) ) {
			offset = {left:0,top:0};
		}
		
		this.width	= $sizingElement.width() * this.ratio;
		this.height	= $sizingElement.height() * this.ratio;
		this.left	= offset.left;
		this.top	= offset.top;
		
		this.renderer.resize( this.width, this.height );
		
		this.dispatch({
			type: 'resize',
			width: this.width,
			height: this.height,
			ratio: this.ratio
		});
	}
	
};

EventDispatcher.prototype.apply( Scene.prototype );
