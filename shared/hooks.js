
var hooks = {
	_hooks: {},

	on: function(slug, callback) {
		if (!(slug in this._hooks)) {
			this._hooks[slug] = [];
		}

		this._hooks[slug].push(callback);
	},

	trigger: function(slug, args) {
		if (typeof this._hooks[slug] !== 'undefined') {
			for (var i = this._hooks[slug].length - 1; i >= 0; i--) {
				this._hooks[slug][i](args);
			}
		}
	}
}

// Export data for a nodejs module.
if (typeof exports !== 'undefined') {
	exports._hooks = hooks._hooks;
	exports.on = hooks.on;
	exports.trigger = hooks.trigger;
}