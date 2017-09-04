
define(
	['shared/util'],
	function(UTIL) {
		var databases = {
			0: {},
		};
		var current_database_index = 0;
		var data = databases[0];


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


		// ==================== DB SET ==================== //
		function db_set(object, attribute) {
			this.key = object.key + ":" + attribute;
		}

		db_set.prototype.get = function() {
			if (this.key in data) {
				return Object.keys(data[this.key]);
			} else {
				return [];
			}
		}

		db_set.prototype.add = function(value) {
			if (!(this.key in data)) {
				data[this.key] = {};
			}

			data[this.key][value] = true;
		}

		db_set.prototype.remove = function(value) {
			delete data[this.key][value];
		}

		db_set.prototype.clear = function() {
			delete data[this.key];
		}


		// ==================== DB BOOL LIST ==================== //
		function db_bitlist(object, attribute, def) {
			this.key = object.key + ":" + attribute;
			this.def = typeof def !== 'undefined' ? def : false;
		}

		db_bitlist.prototype.get = function(offset) {
			if (this.key in data) {
				value = data[this.key][offset];
				return value == this.def || value == null ? this.def : !this.def;
			} else {
				return this.def;
			}
		}

		db_bitlist.prototype.set = function(offset, value) {
			if (!(this.key in data)) {
				data[this.key] = [];
			}

			data[this.key][offset] = value;
		}


		// ==================== DB LIST ==================== //
		function db_list(object, attribute) {
			this.key = object.key + ":" + attribute;
		}

		db_list.prototype.get = function(index) {
			var result;

			if (typeof index === 'undefined') {
				result = data[this.key];
			} else {
				result = data[this.key][index];
			}
			
			return result != null ? result : [];
		}

		db_list.prototype.set = function(index, value) {
			if (!(this.key in data)) {
				data[this.key] = [];
			}

			if (value == null) {
				value = 'null'; // To mirror redis behaviour.
			}

			data[this.key][index] = value;
		}

		db_list.prototype.pop = function() {
			if (this.key in data) {
				return data[this.key].shift();
			} else {
				return null
			}
		}

		db_list.prototype.push = function(value) {
			if (!(this.key in data)) {
				data[this.key] = [];
			}

			if (value == null) {
				value = 'null'; // To mirror redis behaviour.
			}

			data[this.key].push(value);
		}

		db_list.prototype.length = function() {
			if (this.key in data) {
				return data[this.key].length;
			} else {
				return 0;
			}
		}

		db_list.prototype.clear = function() {
			delete data[this.key];
		}


		return {
			select: function(database_index) {
				DEBUG.database("Selecting DB", '#'+database_index);
				if (!(database_index in databases)) {
					databases[database_index] = {};
				}

				data = databases[database_index];
				current_database_index = database_index;
			},

			flush: function() {
				databases[current_database_index] = {};
				data = databases[current_database_index];
			},

			// ============== DATA TYPES ============== //
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

			set: function(object, attribute) {
				return new db_set(object, attribute);
			},

			bitlist: function(object, attribute, def) {
				return new db_bitlist(object, attribute, def);
			},

			list: function(object, attribute) {
				return new db_list(object, attribute);
			},

			data: function() {
				return data;
			},
		};
	}
);