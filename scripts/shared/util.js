
define({
	require_properties: function(needles, haystack) {
		for (var i = needles.length - 1; i >= 0; i--) {
			if (!(needles[i] in haystack)) {
				DEBUG.fatal("Required needle", "'"+needles[i]+"'", "was not found in", haystack);
				return false;
			}
		};

		return true;
	},

	overwrite: function(haystack, new_values) {
		for (var key in new_values) {
			haystack[key] = new_values[key];
		};

		return haystack;
	},

	random_int: function(min, max) {
		return Math.floor((Math.random() * (max - min)) + min);
	}
});