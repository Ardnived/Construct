
define(
	['binaryjs', 'redis', 'url', 'server/database', 'shared/cypher', 'shared/state'],
	function(BINARYJS, REDIS, URL, DATABASE, CYPHER, STATE) {
		var server;
		var redis_client;
		var redis_url = URL.parse(process.env.REDISCLOUD_URL || 'redis://user:@localhost:6379');

		// TODO: Figure out a better way to implement this.
		var server_relayed_events = ['lobby'];
		var client_relayed_events = ['sync'];

		function on_error(error) {
			DEBUG.error("Dispatch "+error);
		};

		function on_socket_message(stream, json) {
			DEBUG.dispatch("Receiving message.", json);
			
			var client = this;
			var buffer = new Buffer(json.size);
			var pointer = 0;
			
			stream.on('data', function(data) {
				data.copy(buffer, pointer);
				pointer += buffer.length;
			});

			stream.on('end', function() {
				requirejs(
					['shared/dispatch'],
					function(DISPATCH) {
						DEBUG.flow("ROUTER.on_message: finished receiving stream");

						var buffer = CYPHER.decode(buffer);

						if (buffer.target == 'servers') {
							DATABASE.publish(buffer.channel_id, data);
						}

						DISPATCH({
							type: buffer.type,
							json: json,
							binary: buffer.data,
						}).from(buffer.channel_id, client);
					}
				);
			})
		};

		function on_redis_message(channel_id, message) {
			requirejs(
				['shared/dispatch'],
				function(DISPATCH) {
					DEBUG.flow("ROUTER.on_redis_message: receiving", channel_id, message.toString('utf8'));
					//DEBUG.dispatch("Received redis message", JSON.parse(message));
					message = JSON.parse(message);
					DEBUG.dispatch("Received redis message", message);
					message.data = Object.keys(message.data).map(function(k) {
						return message.data[k];
					});
					message.data = new Int8Array(message.data);

					var buffer = CYPHER.decode(message.data);

					if (buffer.channel_id != channel_id) {
						DEBUG.error("Received message with mismatched channel id.", buffer.channel_id, channel_id);
					} else if (buffer.target == 'clients') {
						/*DISPATCH({

						}).to();*/
					} else {
						DISPATCH({
							type: buffer.type,
							json: message.json,
							binary: buffer.data,
						}).from(channel_id);

						DEBUG.flow("ROUTER.on_redis_message: finished");
					}
				}
			);
		}

		var root = {
			start: function(http_server) {
				server = BINARYJS.BinaryServer({ server: http_server });
				server.on("error", on_error);

				server.on("connection", function(connection) {
					DEBUG.dispatch("Incoming connection.");

					//connection.on("open", on_open);
					//connection.on("close", on_close);
					connection.on("error", on_error);
					connection.on("stream", on_redis_message);

					HOOKS.trigger("dispatch:connection", null, connection);
					DEBUG.flow("ROUTER.on_connection: finished")
				});

				redis_client = REDIS.createClient(redis_url.port, redis_url.hostname, {
					no_ready_check: true,
					return_buffers: true,
				});

				redis_client.on('message', on_redis_message);

				redis_client.auth(redis_url.auth.split(":")[1]);

				this.subscribe(CYPHER.LOBBY_ID);
			},

			send: function(targets, binary, length, json) {
				var channel_id;

				if (targets.constructor === BINARYJS.BinaryClient) {
					// Wrap the client into an array.
					targets = [targets];
				} else if (!isNaN(parseInt(targets))) {
					// Therefore it is a channel id, collect all the connected clients who are also listening to this channel.
					channel_id = targets;
					targets = [];

					var state = STATE.get(channel_id);
					var users = state.users.get();

					for (var id in server.clients) {
						var user_id = server.clients[id].user_id;

						if (user_id in users) {
							targets.push(server.clients[id]);
						}
					}
				} else {
					DEBUG.error("Did not receive a valid target", targets);
				}

				var buffer;
				if (length > 0) {
					buffer = new Buffer(length);
					for (var n = 0; n < buffer.length; ++n) {
						buffer[n] = binary[n];
					}
				}

				DEBUG.flow("ROUTER.send: sending data", json, buffer);

				if (channel_id != null) {
					DATABASE.publish(channel_id, {
						json: json,
						data: buffer,
					});
				}

				for (var id in targets) {
					DEBUG.dispatch("Sending to client #"+id);
					targets[id].send(buffer, json);
				}

				DEBUG.flow("ROUTER.send: sent data");
			},

			subscribe: function(channel) {
				redis_client.subscribe(channel);
			},

			unsubscribe: function(channel) {
				redis_client.unsubscribe(channel);
			},
		};

		return root;
	}
);
