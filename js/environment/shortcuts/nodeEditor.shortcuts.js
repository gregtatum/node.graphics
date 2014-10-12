var keys	= require('../../constants/keys'),
	mouse	= require('../../constants/mouse');
	
module.exports = {
	exit				: [keys.escape],
	editMode			: [keys.spacebar],
	nodeLasso		: { modifiers: [mouse.command], click: mouse.left },
	nodeTypes : {
		group : {
			drawLine : { modifiers: [mouse.command], click: mouse.left }
		}
	}
};