var debug = {};

debug.game = function() {
	var params = ["game     -"];
	Array.prototype.push.apply(params, arguments);
	console.log.apply(console, params);
};

debug.canvas = function() {
	var params = ["canvas   -"];
	Array.prototype.push.apply(params, arguments);
	console.log.apply(console, params);
};

debug.dispatch = function() {
	var params = ["dispatch -"];
	Array.prototype.push.apply(params, arguments);
	console.log.apply(console, params);
};

debug.parse = function() {
	return;
	var params = ["parse    -"];
	Array.prototype.push.apply(params, arguments);
	console.log.apply(console, params);
};

debug.error = function() {
	var params = ["error    -"];
	Array.prototype.push.apply(params, arguments);
	console.error.apply(console, params);
};

debug.temp = function() {
	var params = ["temp     -"];
	Array.prototype.push.apply(params, arguments);
	console.error.apply(console, params);
};

debug.flow = function() {
	var params = ["flow     -"];
	Array.prototype.push.apply(params, arguments);
	console.log.apply(console, params);
};
