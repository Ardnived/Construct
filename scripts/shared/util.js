
define({
	require_properties: function(needles, haystack) {
		for (var i = needles.length - 1; i >= 0; i--) {
			if (!(needles[i] in haystack)) {
				debug.fatal("Required needle", needles[i], "was not found in", haystack);
				return false;
			}
		};

		return true;
	},

	fill_properties: function(defaults, haystack) {
		for (var key in defaults) {
			if (!(key in haystack)) {
				haystack[key] = defaults[key];
			}
		};

		return haystack;
	},
});