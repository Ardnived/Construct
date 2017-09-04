

define(
	['shared/cypher', CONFIG.platform+'/router', 'shared/util', 'external/uuid'],
	function(CYPHER, ROUTER, UTIL, UUID) {
		var transaction_list = {};

		var transaction = function(data) {
			this.set(data);
		};

		transaction.prototype.set = function(data) {
			this.type = data.type;
			this.binary = data.binary;
			this.json = data.json;
		};

		transaction.prototype.callback = function(callback) {
			this._callback = callback;
		}

		// target can either be 'lobby' or a game index.
		transaction.prototype.to = function(channel_id, target_clients) {
			var target;

			if (typeof this.type === 'undefined') {
				DEBUG.fatal("Cannot dispatch message with undefined type.");
			}

			if (target_clients != null) {
				target = target_clients;
			} else {
				target = channel_id;
			}

			if (this._callback != null && this.id == null) {
				this.id = UUID.v4();
			}

			if (this.id != null) {
				this.json.transaction_id = this.id;
				transaction_list[this.id] = this;
			}

			if (this.binary == null) {
				this.binary = null;
			}

			DEBUG.dispatch("Sending -", "(type)", this.type, "(binary)", this.binary, "(json)", this.json, "(channel)", channel_id)
			var buffer = CYPHER.encode(this.type, channel_id, this.binary);
			ROUTER.send(target, buffer.binary, buffer.length, this.json);
		};

		transaction.prototype.from = function(channel_id, source_client) {
			DEBUG.flow("DISPATCH.from: start", this.type);

			if (typeof this.type === 'undefined') {
				DEBUG.error("No dispatch type defined");
			}

			var data = UTIL.merge(this.binary, this.json);
			data.channel_id = channel_id;

			if (source_client != null) {
				this.source_client = source_client;
			} else {
				delete this.source_client;
			}
			
			DEBUG.flow("Has callback?", this._callback);
			if (this._callback != null) {
				this._callback.call(this, data);
			} else {
				HOOKS.trigger('dispatch:'+this.type, this, data)
			}
			DEBUG.flow("DISPATCH.from: finished");
		};

		transaction.prototype.respond = function(data) {
			if (this.source_client == null) {
				DEBUG.error("Cannot respond when there is no source client defined.")
			} else {
				data.type = 'response';
				this.set(data);
				this.to(this.channel_id, this.source_client);
			}			
		};

		return function(data) {
			var object;
			var transaction_id = null;

			if (typeof data.json !== 'undefined' && 'transaction_id' in data.json) {
				transaction_id = data.json.transaction_id;
			}

			if (transaction_id in transaction_list) {
				object = transaction_list[transaction_id];
				object.set(data);
			} else {
				object = new transaction(data);

				if (transaction_id != null) {
					object.id = transaction_id;
				}
			}

			return object;
		};
	}
);
