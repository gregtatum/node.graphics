var	d3				= require('d3'),
	EventDispatcher = require('../utils/EventDispatcher'),
	wrapScope		= require('../utils/wrapScope'),
	nodeTypes		= require('./nodeTypes'),
	keys			= require('../environment/shortcuts/nodeEditor.shortcuts'),
	Keyboard		= require('../utils/HID/Keyboard'),
	Mouse			= require('../utils/HID/Mouse'),
	Cursor			= require('./tools/Cursor'),
	Tree			= require('./Tree'),
	Scene			= require('./Scene'),
	LinksView		= require('./views/LinksView');

function getId( d ) {
	return d.id;
}

var NodeEditor = function( options ) {
	
	this.scene = new Scene();
	this.keyboard = new Keyboard();
	this.mouse = new Mouse();
	
	this.tree = new Tree( this );
	
	this.linksView = new LinksView( this );
	this.force = this.createForce();
	this.cursor = new Cursor( this, this.tree.root );
	
	this.nodeTypes = [];
	this.initiateNodeTypes();
	
	this.setHandlers();
	this.restart();
	
};

module.exports = NodeEditor;

NodeEditor.prototype = {
	
	createForce : function() {
		
		var ratio = this.scene.ratio;
		var screenWidth = Math.sqrt(
			Math.pow(this.scene.width, 2),
			Math.pow(this.scene.height, 2)
		);
		
		return d3.layout.force()
			.size([this.scene.width * 0.6, this.scene.height * 0.6])
			.nodes(this.tree.nodes) // initialize with a single node
			.links(this.tree.links)
			.linkDistance(function(d) {
				
				return Math.max(
					(5 - d.source.depth) * (screenWidth / 80),
					2 * ratio
				);
				
			})
			.charge(function(d) {
				return Math.min(-1000 / (d.depth + 1) , -60) * ratio;
			});
			
	},
	
	setHandlers : function() {
		this.tree.on("changed", this.restart.bind(this) );
		this.scene.on('resize', this.restart.bind(this) );
	},
	
	restart : function() {
		
		this.force
			.size([this.scene.width, this.scene.height])
			.start();
	},
	
	initiateNodeTypes : function() {
		
		_.each( nodeTypes, function( NodeType, type ) {
			this.nodeTypes[type] = new NodeType( this );
			this.nodeTypes[type].handleTreeChange();
		}, this);
		
	}
		
};

EventDispatcher.prototype.apply( NodeEditor.prototype );
