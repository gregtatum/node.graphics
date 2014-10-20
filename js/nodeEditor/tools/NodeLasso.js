var	EventDispatcher = require('../../utils/EventDispatcher');

var NodeLasso = function( nodeEditor, shortcut ) {
	
	this.nodeEditor = nodeEditor;
	this.$scope = nodeEditor.$scope;
	
	this.$nodes = null;
	this.$sourceNode = null;
	this.$targetNode = null;
	this.sourceNode = null;
	this.targetNode = null;
	
	this.$line = null;
	this.$hoverCircle = null;
	this.$lassoTip = null;
	
	this.handlersMousedown		= this.nodeEditor.mouse.wrapMouse( shortcut, this.start, this );
	this.handlersMouseup		= this.nodeEditor.mouse.wrapMouseUp( shortcut, this.stop, this );
	this.handlersMousemove		= this.nodeEditor.mouse.wrapScope( this.move, this );
	this.handlersMouseoverNode	= this.nodeEditor.mouse.wrapScope( this.mouseoverNode, this );
	this.handlersMouseoutNode	= this.nodeEditor.mouse.wrapScope( this.mouseoutNode, this );

};

module.exports = NodeLasso;

NodeLasso.prototype = {
	
	start : function( node ) {

		d3.event.preventDefault();
		
		this.sourceNode = node;
		this.$sourceNode = d3.select(node)
			.classed("node-lasso-active", true);

		this.$nodes = this.$scope.selectAll('.node');

		this.$scope.classed('active-node-lasso', true);
		
		this.$line = this.$scope.insert('line', ':first-child')
			.classed("node-lasso", true);

		var position = d3.mouse( node );
		
		this.enterStage( position[0], position[1] );
		
		this.$scope.on('mousemove.node-lasso', this.handlersMousemove);
		this.$scope.on('mouseup.node-lasso', this.handlersMouseup);
		this.$scope.on('mouseleave.node-lasso', this.handlersMouseup);
		
		this.$nodes.on('mouseover.node-lasso', this.handlersMouseoverNode);
		this.$nodes.on('mouseout.node-lasso', this.handlersMouseoutNode);
	},
	
	stop : function( container ) {
		
		this.$scope.on('mousemove.node-lasso', null);
		this.$scope.on('mouseup.node-lasso', null);
		this.$scope.on('mouseleave.node-lasso', null);
		
		this.$nodes.on('mouseover.node-lasso', null);
		this.$nodes.on('mouseout.node-lasso', null);
		
		if( this.$hoverCircle ) {
			this.$hoverCircle.remove();
			this.$hoverCircle = null;
		}
		if( this.$lassoTip ) {
			this.$lassoTip.remove();
			this.$lassoTip = null;
		}

		this.$scope.classed('active-node-lasso', false);
		this.$nodes.classed('node-lasso-hover', false);
		this.$sourceNode.classed("node-lasso-active", false);
		
		if(this.targetNode) {
			this.dispatch({
				type: "lasso",
				el: this.targetNode,
				$el: this.$targetNode,
				source: this.$sourceNode.data()[0],
				target: this.$targetNode.data()[0]
			});
		} else {
			var position = d3.mouse( container );
			
			this.dispatch({
				type: "emptyRelease",
				source: this.sourceNode,
				x: position[0],
				y: position[1]
			});
		}
		
		this.$sourceNode = null;
		this.sourceNode = null;
		
		this.$targetNode = null;
		this.targetNode = null;
		
		this.$line.remove();
		
	},

	mouseoverNode : function( el ) {
		
		var node,
			$el,
			useNode = true,
			prevTarget = this.targetNode;

		if( el !== this.sourceNode ) {
					
			if( !prevTarget ) {
				var position = d3.mouse( el );
				this.exitStage( position[0], position[1] );
			}
			
			$el = d3.select(el);
			
			this.dispatch({
				type: "mouseover",
				el: el,
				$el: $el,
				node: $el.data()[0],
				preventDefault: function() {
					useNode = false;
				}
			});
						
			if(useNode === false) {
				return;
			}
			
			this.targetNode = el;
			this.$targetNode = $el;
			
			
			this.$targetNode.classed('node-lasso-hover', true);
			
			if( !prevTarget ) {
									
				this.$hoverCircle = this.$scope.append('circle', ':first-child')
					.classed("node-lasso-hover-circle", true);

			}
			
			node = this.$targetNode.data()[0];
			
			this.$hoverCircle
				.attr("r", parseInt(this.$targetNode.attr("r"), 10) + 3)
				.attr("cx", node.x)
				.attr("cy", node.y)
				.style("transform-origin", node.x + "px " + node.y + "px")
			;
			
		}
		
	},
	
	mouseoutNode : function( el ) {
		
		d3.select(el).classed('node-lasso-hover', false);
		
		if(el === this.targetNode) {
			this.targetNode = null;
			this.$targetNode = null;
			
			this.$hoverCircle.remove();
			this.$hoverCircle = null;
			
			var position = d3.mouse( el );
			
			this.enterStage( position[0], position[1] );
		}
		
	},
	
	enterStage : function( x, y ) {
		
		this.dispatch({
			type: "enterStage",
			x: x,
			y: y
		});
		
		this.$lassoTip = this.$scope.append('circle', ':first-child')
			.classed('node-lasso-tip', true)
			.attr('r', 5)
			.attr('cx', x)
			.attr('cy', y);
		
	},
	
	exitStage : function( x, y ) {
		
		this.$lassoTip.remove();
		this.$lassoTip = null;
		
		this.dispatch({
			type: "exitStage",
			x: x,
			y: y
		});
		
	},
	
	move : function( container ) {

		var mousePoint = d3.mouse( container );
		var nodePoint = this.$sourceNode.data()[0];
		
		this.$line
			.attr("x1", this.$targetNode ? this.$targetNode.attr("cx") : mousePoint[0] )
			.attr("y1", this.$targetNode ? this.$targetNode.attr("cy") : mousePoint[1] )
			.attr("x2", function(d) { return nodePoint.x; })
			.attr("y2", function(d) { return nodePoint.y; });
			
		if( this.$lassoTip ) {
			this.$lassoTip
				.attr('cx', mousePoint[0])
				.attr('cy', mousePoint[1]);
		}
	},
	
	setHandlers : function( nodeType ) {
		
		nodeType.on('mousedown.node-lasso', this.handlersMousedown );
		
	}
};

EventDispatcher.prototype.apply( NodeLasso.prototype );