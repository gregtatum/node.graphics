var	EventDispatcher	= require('../../../utils/EventDispatcher'),
	HoverCircle		= require('./HoverCircle'),
	Line			= require('./Line'),
	LassoTip		= require('./LassoTip');

var NodeLasso = function( nodeEditor, nodeType, shortcut ) {
	
	this.nodeEditor = nodeEditor;
	this.$scope = nodeEditor.$scope;
	this.$canvas = nodeEditor.scene.$canvas;
	this.nodeType = nodeType;
	
	this.sourceNode = null;
	this.targetNode = null;
	
	this.line = new Line( nodeEditor, this );
	this.lassoTip = new LassoTip( nodeEditor, this );
	this.hoverCircle = new HoverCircle( nodeEditor, this );
	
	this.handlersMousedown		= this.nodeEditor.mouse.wrapMouse( shortcut, this.start, this );
	this.handlersMouseup		= this.nodeEditor.mouse.wrapMouseUp( shortcut, this.stop, this );
	this.handlersMouseoverNode	= this.mouseoverNode.bind(this);
	this.handlersMouseoutNode	= this.mouseoutNode.bind(this);
	
	this.setHandlers();

};

module.exports = NodeLasso;

NodeLasso.prototype = {
	
	
	start : function( event ) {

		//Start the lasso interaction after a mousedown event

		var position = this.nodeEditor.mouse.position;

		this.sourceNode = event.node;
		this.sourceSprite = event.sprite;

		this.$scope.addClass('active-node-lasso');
		
		this.line.start( this.sourceNode, position );
		
		this.enterStage( position[0], position[1] );
		
		this.$canvas.on('mouseup', this.handlersMouseup);
		this.$canvas.on('mouseleave', this.handlersMouseup);
		
		this.nodeEditor.nodeDispatcher.on('mouseover', this.handlersMouseoverNode);
		this.nodeEditor.nodeDispatcher.on('mouseout', this.handlersMouseoutNode);
	},
	
	stop : function( event ) {
		
		this.$canvas.off('mouseup', this.handlersMouseup);
		this.$canvas.off('mouseleave', this.handlersMouseup);

		this.nodeEditor.nodeDispatcher.off('mouseover', this.handlersMouseoverNode);
		this.nodeEditor.nodeDispatcher.off('mouseout', this.handlersMouseoutNode);
		
		this.$scope.removeClass('active-node-lasso');

		this.dispatch({
			type: "stop",
			source: this.sourceNode,
			x: this.nodeEditor.mouse.position.x,
			y: this.nodeEditor.mouse.position.y
		});
				
		if(this.targetNode) {
			
			this.dispatch({
				type: "lasso",
				source: this.sourceNode,
				target: this.targetNode
			});
			
		} else {
			
			this.dispatch({
				type: "emptyRelease",
				source: this.sourceNode,
				x: this.nodeEditor.mouse.position.x,
				y: this.nodeEditor.mouse.position.y
			});
		}
		
		this.sourceNode = null;
		this.targetNode = null;
		
	},

	mouseoverNode : function( event ) {
		
		var useNode = true,
			prevTarget = this.targetNode;

		if( event.node !== this.sourceNode ) {
					
			if( !prevTarget ) {
				this.exitStage(
					this.nodeEditor.mouse.position.x,
					this.nodeEditor.mouse.position.y
				);
			}
			
			this.dispatch({
				type: "mouseover",
				node: event.node,
				preventDefault: function() {
					useNode = false;
				}
			});
						
			if(useNode === false) {
				return;
			}
			
			this.targetNode = event.node;
			
		}
		
	},
	
	mouseoutNode : function( event ) {

		this.dispatch({
			type: "mouseout",
			node: event.node
		});
		
		this.enterStage(
			this.nodeEditor.mouse.position.x,
			this.nodeEditor.mouse.position.y
		);
		this.targetNode = null;
		
	},
	
	enterStage : function( x, y ) {

		console.log('enterstage');
		
		this.dispatch({
			type: "enterStage",
			x: x,
			y: y
		});
				
	},
	
	exitStage : function( x, y ) {
		
		console.log('exitstage');
		this.dispatch({
			type: "exitStage",
			x: x,
			y: y
		});
		
	},
	
	setHandlers : function() {
		
		this.nodeType.on('mousedown', this.handlersMousedown );
		
	}
};

EventDispatcher.prototype.apply( NodeLasso.prototype );