var colors = require("colors");

exports.game = function() {
	var params = [":game     -".green];
	Array.prototype.push.apply(params, arguments);
	params.push("".white);
	console.log.apply(console, params);
};

exports.dispatch = function() {
	var params = [":dispatch -".yellow];
	Array.prototype.push.apply(params, arguments);
	params.push("".white);
	console.log.apply(console, params);
};

exports.parse = function() {
	return;
	var params = [":parse    -".magenta];
	Array.prototype.push.apply(params, arguments);
	params.push("".white);
	console.log.apply(console, params);
};

exports.error = function() {
	var params = [":error    -".red];
	Array.prototype.push.apply(params, arguments);
	params.push("\n"+new Error().stack);
	params.push("".white);
	console.log.apply(console, params);
};

exports.temp = function() {
	var params = [":temp     -".grey];
	Array.prototype.push.apply(params, arguments);
	params.push("".white);
	console.log.apply(console, params);
};

exports.flow = function() {
	var params = [":flow     -".blue];
	Array.prototype.push.apply(params, arguments);
	params.push("".white);
	console.log.apply(console, params);
};
