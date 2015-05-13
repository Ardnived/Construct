
define(
	['shared/util'],
	function(UTIL) {
		var data = {};


		// ==================== DB STRING ==================== //
		function db_string(object, attribute, def) {
			this.key = object.key + ":" + attribute;
			this.def = (typeof def !== 'undefined') ? def : null;
		}

		db_string.prototype.get = function() {
			var value = data[this.key];
			return value != null ? value : this.def;
		}

		db_string.prototype.set = function(value) {
			if (value != this.def) {
				data[this.key] = value;
			} else {
				delete data[this.key];
			}
		}


		// ==================== DB INT ==================== //
		function db_integer(object, attribute, def) {
			db_string.call(this, object, attribute, def);
		}

		db_integer.prototype = Object.create(db_string.prototype);

		db_integer.prototype.modify = function(modification) {
			data[this.key] += modification;
		}


		// ==================== DB BOOL ==================== //
		function db_bool(object, offset, def) {
			this.key = object.key + ":flags";
			this.offset = offset;
			this.def = typeof def !== 'undefined' ? def : false;
		}

		db_bool.prototype.get = function() {
			if (this.key in data) {
				value = data[this.key][this.offset];
				return value != null ? value : this.def;
			} else {
				return this.def;
			}
		}

		db_bool.prototype.set = function(value) {
			if (!(this.key in data)) {
				data[this.key] = [];
			}

			data[this.key][this.offset] = value;
		}


		// ==================== DB HASH ==================== //
		function db_hash(object, attribute) {
			this.key = object.key + ":" + attribute;
		}

		db_hash.prototype.get = function(argument) {
			var result = null;

			if (typeof argument === 'undefined') {
				result = {};

				for (var k in data[this.key]) {
					result[k] = data[this.key][k];
				}
			} else if (!(this.key in data)) {
				result = null
			} else if (Object.prototype.toString.call(argument) === '[object Array]') {
				result = {};

				for (var i in argument) {
					var k = argument[i];
					result[k] = data[this.key][k];
				}
			} else {
				result = data[this.key][argument];
			}

			return result;
		}

		db_hash.prototype.set = function(arg1, arg2) {
			var arguments;

			if (arg1 === null) {
				delete data[this.key];
				return;
			} else if (arg2 === null && typeof arg1 === 'string') {
				delete data[this.key][arg1];
				return;
			}

			if (typeof arg2 === 'undefined') {
				arguments = arg1;
			} else {
				arguments = {};
				arguments[arg1] = arg2;
			}

			if (!(this.key in data)) {
				data[this.key] = {};
			}

			UTIL.overwrite(data[this.key], arguments);
		}

		db_hash.prototype.del = function(argument) {
			if (typeof argument === 'undefined') {
				delete data[this.key];
			} else {
				delete data[this.key][argument];
			}
		}

		db_hash.prototype.get_list = function(entry) {
			var value = this.get(entry);
			return value == null ? [] : value;
		};

		db_hash.prototype.set_list = function(entry, array) {
			this.set(entry, array);
		}

		return {
			string: function(object, attribute, def) {
				return new db_string(object, attribute, def);
			},

			integer: function(object, attribute, def) {
				return new db_integer(object, attribute, def);
			},

			bool: function(object, offset, def) {
				return new db_bool(object, offset, def);
			},

			hash: function(object, attribute) {
				return new db_hash(object, attribute);
			},

			// TODO: Implement lists and sets.

			data: function() {
				return data;
			},

			flush: function() {
				data = {};
			},
		};
	}
);