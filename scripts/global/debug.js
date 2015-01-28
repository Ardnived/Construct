
debug = {
	error: function() {
		var params = [":error    -"];
		Array.prototype.push.apply(params, arguments);
		console.error.apply(console, params);
		throw new Error();
	},

	game: function() {
		var params = [":game     -"];
		Array.prototype.push.apply(params, arguments);
		console.log.apply(console, params);
	},

	dispatch: function() {
		var params = [":dispatch -"];
		Array.prototype.push.apply(params, arguments);
		console.log.apply(console, params);
	},

	parse: function() {
		return;
		var params = [":parse    -"];
		Array.prototype.push.apply(params, arguments);
		console.log.apply(console, params);
	},

	temp: function() {
		var params = [":temp     -"];
		Array.prototype.push.apply(params, arguments);
		console.log.apply(console, params);
	},

	flow: function() {
		var params = [":flow     -"];
		Array.prototype.push.apply(params, arguments);
		console.log.apply(console, params);
	},

}
