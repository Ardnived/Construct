
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

	// Expects an indeterminate number of arguments.
	union: function() {
		var obj = {};

		for (var n = arguments.length - 1; n >= 0; n--) {
			var array = arguments[n];

			if (array != null) {
				for (var i = array.length - 1; i >= 0; i--) {
					obj[array[i]] = array[i];
				}
			}
		}

		var res = []
		for (var k in obj) {
			if (obj.hasOwnProperty(k))  // <-- optional
				res.push(obj[k]);
		}

		return res;
	},

	random_int: function(min, max) {
		return Math.floor((Math.random() * (max - min)) + min);
	},

	shuffle: function(array) {
		var currentIndex = array.length, temporaryValue, randomIndex;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {
			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	},
});