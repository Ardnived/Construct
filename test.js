var message = require("./shared/message");
var debug = require("./server/debug");

var msg = new message.instance();
msg.type = 'chat';

/*
msg.data = [{
	q: [0, 1],
	r: 2,
	type: 'action',
	struct: 5,
	message: '400'
}];
*/

msg.data = [{type: "action", q: 6, r: 1, struct: undefined}];

msg.encode();
debug.dispatch('Raw\n', msg.binary.buffer);

var decoder = new message.instance();
decoder.binary = msg.binary;
decoder.decode();
debug.dispatch('JSON\n', decoder.data);
