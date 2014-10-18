var	d3				= require('d3'),
	wrapScope		= require('../utils/wrapScope'),
	nodeTypeClasses	= require('./nodeTypes'),
	keys			= require('../environment/shortcuts/nodeEditor.shortcuts'),
	Keyboard		= require('../utils/HID/Keyboard'),
	Mouse			= require('../utils/HID/Mouse'),
	Cursor			= require('./tools/Cursor'),
	Tree			= require('./Tree');

function getId( d ) {
	return d.id;
}

var NodeEditor = function() {
	this.width = $(window).width();
	this.height = $(window).height();
	this.radius = 10;
	this.dragging = false;
	
	var root = {
		x: this.width * 0.6,
		y: this.height * 0.6,
		depth: 0,
		type: "root",
		id: 0
	};

	this.keyboard = new Keyboard( d3.select('body') );
	this.mouse = new Mouse();
	this.force = this.createForce( root );
	this.$scope = this.createSvg();
	this.backdrop = this.createBackdrop();
	
	this.tree = new Tree( root, this.force.nodes(), this.force.links() );
	
	this.$nodes = this.$scope.selectAll(".node");
	this.$links = this.$scope.selectAll(".link");
	
	this.nodeTypes = {};
	this.initiatedNodeTypes = [];

	this.setHandlers();
	this.restart();
	
	this.cursor = new Cursor( this, this.get$ElFromNode( root ) );
	
};

module.exports = NodeEditor;

NodeEditor.prototype = {
	
	createForce : function( root ) {
		
		return d3.layout.force()
			.size([this.width, this.height])
			.nodes([ root ]) // initialize with a single node
			.linkDistance(function(d) {
				return Math.max(100 - d.source.depth * 20, 10);
			})
			.charge(function(d) {
				return Math.min(-1000 / (d.depth + 1) , -60);
			})
			.on("tick", this.tick.bind(this) );
			
	},
	
	createSvg : function() {
		
		var svg = d3.select("body").append("svg")
		    .attr("width", this.width)
		    .attr("height", this.height);
//		    .on("mousemove", this.mousemove.bind(this) );
			
		return svg;
	},
	
	createBackdrop : function() {
		
		return this.$scope.append("rect")
		    .attr("width", this.width)
		    .attr("height", this.height)
			.attr("id", "node-editor-backdrop");
			
	},
	
	setHandlers : function() {
		//this.tree.on("changed", _.debounce( this.restart.bind(this), 1 ) );
		this.tree.on("changed", this.restart.bind(this) );
	},
	
	tick : function() {
		
		this.$links.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; });

		this.$nodes.attr("cx", function(d) { return d.x; })
			.attr("cy", function(d) { return d.y; });
	},
	
	restart : function() {
		var types;
	
		this.$links = this.$links.data( this.tree.links );

		this.$links.enter().insert("line", ".node")
			.attr("class", "link");

	
		// var drag = this.force.drag()
		// .on("dragstart", wrapScope(function( event ) {
		//
		// 	d3.event.sourceEvent
		// 	this.dragging = true;
		//
		// 	this.$nodes.classed( "fixed", function(d) {
		// 		return d.fixed = true
		// 	});
		//
		// }, this) )
		// .on("dragend", function( d ) {
		//
		// 	this.dragging = false;
		//
		// 	this.$nodes.classed( "fixed", function(d) {
		// 		return d.fixed = false
		// 	});
		//
		//
		// }.bind(this) )

		this.updateNodes();
			
		this.$nodes = this.$scope.selectAll(".node");
		
		//this.$nodes.call(drag);
		this.force.start();
	},
	
	updateNodes : function() {
		
		//current, new
		var cTypesPresent, nTypesPresent, nodeDataByType;

		nodeDataByType = _.groupBy( this.tree.nodes, function( node ) {
			return node.type;
		});
		cTypesPresent = _.keys( nodeDataByType );
		nTypesPresent = _.difference( cTypesPresent, this.initiatedNodeTypes );
		
		this.initiateNodeTypes( nTypesPresent );
		this.addNewNodes( nodeDataByType );
		
		
	},
	
	initiateNodeTypes : function( newTypes ) {
		
		if(newTypes.length === 0) return;
		
		this.initiatedNodeTypes = _.flatten( [this.initiatedNodeTypes, newTypes] );
		
		_.each( newTypes, function( type ) {
			
			this.nodeTypes[type] = new nodeTypeClasses[type]( this );
			
		}, this);
		
	},
	
	addNewNodes : function( nodeDataByType ){
		
		_.each(nodeDataByType, function( nodeData, type ) {
			
			this.nodeTypes[type].appendNewNodes( nodeData );
			
		}, this);
		
	},
	
	get$ElFromNode : function( node ) {
		return this.$nodes.filter(function(d) {
			return d.id === node.id;
		});
	}
	
};