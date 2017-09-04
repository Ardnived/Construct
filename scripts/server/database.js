
define(
	['redis', 'url', 'deasync', 'shared/cypher', 'shared/util'],
	function(REDIS, URL, DEASYNC, CYPHER, UTIL) {
		var url = URL.parse(process.env.REDISCLOUD_URL || 'redis://user:@localhost:6379');
		var client = REDIS.createClient(url.port, url.hostname, {
			no_ready_check: true,
		});
		//REDIS.debug_mode = true;
		client.auth(url.auth.split(":")[1]);

		// TODO: Remove this testing code.
		client.flushdb();

		// ==================== DB STRING ==================== //
		function db_string(object, attribute, def) {
			this.key = object.key + ":" + attribute;
			this.def = (typeof def !== 'undefined') ? def : null;
		}

		db_string.prototype.get = function() {
			DEBUG.database("Getting", this.key);
			var value = DEASYNC(function(key, callback) {
				client.get(key, callback);
			})(this.key);

			return value != null ? value : this.def;
		}

		db_string.prototype.set = function(value) {
			DEBUG.database("Setting", this.key);
			if (value != this.def && value !== null) {
				client.set(this.key, value);
			} else {
				client.del(this.key);
			}
		}


		// ==================== DB INT ==================== //
		function db_integer(object, attribute, def) {
			db_string.call(this, object, attribute, def);
		}

		db_integer.prototype = Object.create(db_string.prototype);

		db_integer.prototype.get = function() {
			DEBUG.database("get", this.key, arguments);
			return parseInt( db_string.prototype.get.call(this) );
		}

		db_integer.prototype.modify = function(modification) {
			DEBUG.database("modify", this.key, arguments);
			client.incrby(this.key, modification);
		}


		// ==================== DB BOOL ==================== //
		function db_bool(object, offset, def) {
			this.key = object.key + ":flags";
			this.offset = offset;
			this.def = typeof def !== 'undefined' ? def : false;
		}

		// In our storage method for booleans, 0 means default, 1 means not default.

		db_bool.prototype.get = function() {
			DEBUG.database("get", this.key, arguments);
			var value = DEASYNC(function(key, offset, callback) {
				client.getbit(key, offset, callback);
			})(this.key, this.offset);

			return value == 0 ? this.def : !this.def;
		}

		db_bool.prototype.set = function(value) {
			DEBUG.database("set", this.key, arguments);
			client.setbit(this.key, this.offset, value != this.def && value !== null ? 1 : 0);
		}


		// ==================== DB HASH ==================== //
		function db_hash(object, attribute) {
			this.key = object.key + ":" + attribute;
		}

		db_hash.prototype.get = function(argument) {
			DEBUG.database("get", this.key, arguments);
			var result = null;

			if (typeof argument === 'undefined') {
				result = DEASYNC(function(key, callback) {
					client.hgetall(key, callback);
				})(this.key);
			} else if (argument.constructor !== Array) {
				result = DEASYNC(function(key, argument, callback) {
					client.hget(key, argument, callback);
				})(this.key, argument);
			} else {
				result = DEASYNC(function(key, argument, callback) {
					argument.unshift(key); // Add the key to the beginning of our argument list.
					client.hmget(argument, callback);
				})(this.key, argument);
			}

			return result != null ? result : {};
		}

		db_hash.prototype.set = function(arg1, arg2) {
			DEBUG.database("set", this.key, arguments);
			var arguments;

			if (arg1 === null) {
				client.del(this.key);
				return;
			} else if (arg2 === null && typeof arg1 === 'string') {
				client.hdel(this.key, arg1);
				return;
			}

			if (typeof arg2 === 'undefined') {
				arguments = arg1;
			} else {
				arguments = {};
				arguments[arg1] = arg2;
			}

			var command = [ this.key ];

			for (var key in arguments) {
				command.push(key);
				command.push(arguments[key]);
			}

			if (command.length > 3) {
				client.hmset.apply(client, command);
			} else {
				client.hset.apply(client, command);
			}
		}

		db_hash.prototype.clear = function(argument) {
			DEBUG.database("clear", this.key, arguments);
			if (typeof argument === 'undefined') {
				client.del(this.key);
			} else {
				client.hdel(this.key, argument);
			}
		}

		db_hash.prototype.get_list = function(entry) {
			DEBUG.database("get-list", this.key, arguments);
			if (typeof entry !== 'undefined') {
				result = DEASYNC(function(key, entry, callback) {
					client.hget(key, entry, callback);
				})(this.key, entry);

				if (result != null) {
					result = result.split(",");
				} else {
					result = [];
				}
			} else {
				result = this.get();

				for (var k in result) {
					result[k] = result[k].split(",");
				}
			}

			return result;
		};

		db_hash.prototype.set_list = function(entry, array) {
			DEBUG.database("set-list", this.key, arguments);
			if (entry === null) {
				client.del(this.key);
			} else if (array === null) {
				client.hdel(this.key, entry);
			} else {
				client.hset(this.key, entry, array.join(","));
			}
		};


		// ==================== DB SET ==================== //
		function db_set(object, attribute) {
			this.key = object.key + ":" + attribute;
		}

		db_set.prototype.get = function() {
			DEBUG.database("get", this.key, arguments);
			var result = DEASYNC(function(key, callback) {
				client.smembers(key, callback);
			})(this.key);

			return result != null ? result : [];
		}

		db_set.prototype.add = function(value) {
			DEBUG.database("add", this.key, arguments);
			client.sadd(this.key, value);
		}

		db_set.prototype.remove = function(value) {
			DEBUG.database("remove", this.key, arguments);
			client.srem(this.key, value);
		}

		db_set.prototype.clear = function() {
			DEBUG.database("clear", this.key, arguments);
			client.del(this.key);
		}


		// ==================== DB BOOL LIST ==================== //
		function db_bitlist(object, attribute, def) {
			this.key = object.key + ":" + attribute;
			this.def = typeof def !== 'undefined' ? def : false;
		}

		// In our storage method for booleans, 0 means default, 1 means not default.

		db_bitlist.prototype.get = function(offset) {
			DEBUG.database("get", this.key, arguments);
			var value = DEASYNC(function(key, offset, callback) {
				client.getbit(key, offset, callback);
			})(this.key, offset);

			return value == 0 ? this.def : !this.def;
		}

		db_bitlist.prototype.set = function(offset, value) {
			DEBUG.database("set", this.key, arguments);
			client.setbit(this.key, offset, value != this.def && value !== null ? 1 : 0);
		}


		// ==================== DB LIST ==================== //
		function db_list(object, attribute) {
			this.key = object.key + ":" + attribute;
		}

		db_list.prototype.get = function(index) {
			DEBUG.database("get", this.key, arguments);
			var result;

			if (typeof index === 'undefined') {
				result = DEASYNC(function(key, callback) {
					client.lrange(key, 0, -1, callback);
				})(this.key);
			} else {
				result = DEASYNC(function(key, index, callback) {
					client.lindex(key, index, callback);
				})(this.key, index);

				result = result != null ? result : [];
			}
			
			return result;
		}

		db_list.prototype.set = function(index, value) {
			DEBUG.database("set", this.key, arguments);
			client.lset(this.key, index, value);
		}

		db_list.prototype.pop = function() {
			DEBUG.database("pop", this.key, arguments);
			return DEASYNC(function(key, callback) {
				client.lpop(key, callback);
			})(this.key);
		}

		db_list.prototype.push = function(value) {
			DEBUG.database("push", this.key, arguments);
			client.rpush(this.key, value);
		}

		db_list.prototype.length = function() {
			DEBUG.database("length", this.key, arguments);
			return DEASYNC(function(key, callback) {
				client.llen(key, callback);
			})(this.key);
		}

		db_list.prototype.clear = function() {
			DEBUG.database("clear", this.key, arguments);
			client.del(this.key);
		}

		return {
			select: function(database_index) {
				DEBUG.database("Selecting DB", '#'+database_index);
				client.select(database_index);
			},

			flush: function() {
				client.flushdb();
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

			// ============== PUB/SUB ============== //
			publish: function(channel_id, data) {
				client.publish(channel_id, JSON.stringify(data));
			},
		};
	}
);