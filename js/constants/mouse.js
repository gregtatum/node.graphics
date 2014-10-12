var isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;

module.exports = {
	"left"		: 1,
	"middle"	: 2,
	"right"		: 3,
	"command"	: isMac ? "metaKey" : "ctrlKey",
	"control"	: isMac ? "ctrlKey" : "metaKey",
	"option"	: isMac ? "altKey" : "altKey",
	"shift"		: "shiftKey"
};