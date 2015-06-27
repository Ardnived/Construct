
requirejs(
	['shared/message', 'server/database', 'node-uuid'],
	function(MESSAGE, DATABASE, UUID) {
		DATABASE.subscribe(DATABASE.LOBBY_CHANNEL);

		var object = { key: 'lobby' };

		var root = {
			database: {
				users: DATABASE.hash(object, 'users'),
				players: DATABASE.set(object, 'players'),
				active_games: DATABASE.bitlist(object, 'games'),
			},
			_local: {
				game_states: {},
				clients: {},
			},

			client: function(user_id) {
				return this._local.clients[user_id];
			},

			game: function(game_index) {
				if (typeof game_state_list[game_index] === 'undefined') {
					game_state_list[game_index] = HOOKS.trigger('state:new', new STATE(game_id));
				}

				return game_state_list[game_index];
			},

			game_exists: function(game_index) {
				return game_usage.get(index);
			},
		};

		HOOKS.on('dispatch:connection', function(client) {
			DEBUG.game("Received connection with socket id", client.id);
			
			DATABASE.select(DATABASE.LOBBY_CHANNEL);

			// TODO: Use authentication data to get user id from 

			var user_id = UUID.v4();
			root.database.players.add(user_id);

			client.user_id = user_id;
			root._local.clients[user_id] = client;

			MESSAGE.relay(DATABASE.LOBBY_CHANNEL, 'lobby', [], {
				name: "Anonymous",
				user_id: user_id,
			});

			// TODO: Relay the new player to the other dynos.
		});

		HOOKS.on('dispatch:lobby', function( event ) {
			if (event.source === 'client') {
				MESSAGE.relay(args.channel, 'lobby', args.data, args.meta);
			} else {
				MESSAGE.send('lobby', args.data, null, args.meta);
			}
		});

		return root;
	}
);