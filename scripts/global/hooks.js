
hooks = {
	_hooks: {},

	on: function(slug, callback, removal_key) {
		if (typeof removal_key === 'undefined') {
			removal_key = "never";
		}

		if (!(slug in this._hooks)) {
			this._hooks[slug] = {};
			this._hooks[slug][removal_key] = [];
		} else if (!(removal_key in this._hooks[slug])) {
			this._hooks[slug][removal_key] = [];
		}

		this._hooks[slug][removal_key].push(callback);
	},

	remove: function(slug, removal_key) {
		delete this._hooks[slug][removal_key];
	},

	remove_all: function(removal_key) {
		for (var slug in this._hooks) {
			this.remove(slug, removal_key);
		}
	},

	trigger: function(slug, self, args) {
		if (typeof self === 'undefined') {
			self = null;
		}

		/*
		if (args != null) {
			debug.flow("Triggered hook", slug, "["+self+"]", args);
		} else {
			debug.flow("Triggered hook", slug, "["+self+"]");
		}
		*/

		if (typeof this._hooks[slug] !== 'undefined') {
			for (var key in this._hooks[slug]) {
				for (var n = this._hooks[slug][key].length - 1; n >= 0; n--) {
					this._hooks[slug][key][n].call(self, args);
				}
			}
		}

		return self;
	},

	filter: function(slug, self, value, args) {
		if (args != null) {
			debug.flow("Filtered hook", slug, "["+self+"]", value, args);
		} else {
			debug.flow("Filtered hook", slug, "["+self+"]", value);
		}

		if (typeof this._hooks[slug] !== 'undefined') {


			for (var i = this._hooks[slug].length - 1; i >= 0; i--) {
				value = this._hooks[slug][i].call(self, value, args);
			}
		}

		debug.flow("Result is", value);
		return value;
	},
};
