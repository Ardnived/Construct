var colors = require("colors");

exports.game = function() {
	var params = ["   game  -".green];
	Array.prototype.push.apply(params, arguments);
	params.push("".cyan);
	console.log.apply(console, params);
};

exports.server = function() {
	var params = ["   server -".red];
	Array.prototype.push.apply(params, arguments);
	params.push("".cyan);
	console.log.apply(console, params);
};
