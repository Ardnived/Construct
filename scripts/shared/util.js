
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
	// Returns an array.
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

	// Merges two or more objects into one.
	merge: function() {
		var obj = {};

		for (var n = arguments.length - 1; n >= 0; n--) {
			var object = arguments[n];

			if (object != null) {
				for (var k in object) {
					obj[k] = object[k];
				}
			}
		}

		return obj;
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

	// From: http://blog.sarathonline.com/2009/02/javascript-convert-strings-to-binary.html
	/*string_to_binary: function(str) {
		var st,i,j,d;
		var arr = [];
		var len = str.length;

		for (i = 1; i<=len; i++) {
			//reverse so its like a stack
			d = str.charCodeAt(len-i);
			for (j = 0; j < 8; j++) {
				arr.push(d%2);
				d = Math.floor(d/2);
			}
		}

		//reverse all bits again.
		return arr.reverse().join("");
	},

	buffer_to_string: function( buffer ) {
		return String.fromCharCode.apply(null, buffer);
	},

	string_to_buffer: function( string ) {
		var buffer = new ArrayBuffer(string.length * 2); // 2 bytes for each char
		var bufferView = new Int8Array(buffer);
		for (var i = 0, strLen = string.length; i < strLen; i++) {
			bufferView[i] = string.charCodeAt(i);
		}

		return buffer;
	},*/
});