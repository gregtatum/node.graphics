/**
 *	D3 event handles take over the context of the function. If you .bind(this) to the function
 *	then you lose the ability to access the current container for that event. This little
 *	function will wrap the scope for the object, and pass the native d3 context in as
 *	the first parameter in the function.
 *	
 *	Usage:
 *	
 *		svg.append("rect").on("mousedown", wrapScope(this.mousedown, this) );
 *		
 *		...
 *		
 *		mousedown : function( container ) {
 *			var pt = d3.mouse( container )
 *			this.methodName();
 *		}
 */

var wrapScope = function(callback, scope) {
	
	return function() {
		callback.call(scope, this );
	};
	
};

module.exports = wrapScope;