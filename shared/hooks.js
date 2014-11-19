if (typeof module !== 'undefined') {
	var debug = require("../server/debug");
}

var hooks = {
	_hooks: {},

	on: function(slug, callback) {
		if (!(slug in this._hooks)) {
			this._hooks[slug] = [];
		}

		this._hooks[slug].push(callback);
	},

	trigger: function(slug, args) {
		if (args != null) {
			debug.flow("Triggered hook", slug, args);
		} else {
			debug.flow("Triggered hook", slug);
		}

		if (typeof this._hooks[slug] !== 'undefined') {
			for (var i = this._hooks[slug].length - 1; i >= 0; i--) {
				this._hooks[slug][i](args);
			}
		}
	}
}

// Export data for a nodejs module.
if (typeof module !== 'undefined') {
	exports._hooks = hooks._hooks;
	exports.on = hooks.on;
	exports.trigger = hooks.trigger;
}