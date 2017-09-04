
DEBUG = {
	error: function() {
		var params = [":error    -"];
		Array.prototype.push.apply(params, arguments);
		console.error.apply(console, params);

		// TODO: Remove this test code.
		if (typeof window !== 'undefined') {
			document.getElementById('error-message').innerHTML = params.join(' ');
		}
	},

	fatal: function() {
		var params = [":fatal    -"];
		Array.prototype.push.apply(params, arguments);
		console.error.apply(console, params);
		throw new Error(); // TODO: Becareful with this because it could allow users to crash the server.
	},

	game: function() {
		var params = [":game     -"];
		Array.prototype.push.apply(params, arguments);
		console.log.apply(console, params);
	},

	lobby: function() {
		var params = [":lobby    -"];
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
		return;
		var params = [":flow     -"];
		Array.prototype.push.apply(params, arguments);
		console.log.apply(console, params);
	},

	database: function() {
		//return;
		var params = [":database -"];
		Array.prototype.push.apply(params, arguments);
		console.log.apply(console, params);
	},

	dispatch: function() {
		var params = [":dispatch -"];
		Array.prototype.push.apply(params, arguments);
		console.log.apply(console, params);
	},


}
