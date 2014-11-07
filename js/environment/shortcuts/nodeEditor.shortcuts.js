var keys	= require('../../constants/keys'),
	mouse	= require('../../constants/mouse');
	
module.exports = {
	exit				: [keys.escape],
	editMode			: [keys.spacebar],
	nodeLasso		: { modifiers: [], click: mouse.left },
	nodeTypes : {
		group : {
			drawLine : { modifiers: [], click: mouse.left }
		}
	},
	cursor : {
		up				: [{ key: keys.up }],
		down			: [{ key: keys.down }],
		left			: [{ key: keys.left }],
		right			: [{ key: keys.right }],
		siblingUp		: [{ modifiers: [mouse.shift], key: keys.up }],
		siblingDown		: [{ modifiers: [mouse.shift], key: keys.down }],
		siblingLeft		: [{ modifiers: [mouse.shift], key: keys.left }],
		siblingRight	: [{ modifiers: [mouse.shift], key: keys.right }],
		createNode		: [{ key: keys.enter }]
	}
};