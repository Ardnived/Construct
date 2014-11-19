var message = require("./shared/message");
var debug = require("./server/debug");

var msg = new message.instance();
msg.type = 'chat';


msg.data = [{
	q: 1,
	r: 2,
	type: 'hex',
	player: 0
}, {
	type: 'hex',
	q: 6,
	r: 3,
	player: 0
}];

msg.encode();
debug.dispatch('Raw\n', msg.binary.buffer);

var decoder = new message.instance();
decoder.binary = msg.binary;
decoder.decode();
debug.dispatch("Message Integrity:", (msg.data == decoder.data) ? "Good" : "Bad", "->\n", decoder.data);
