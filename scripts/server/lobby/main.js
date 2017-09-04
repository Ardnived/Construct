
requirejs(
	['shared/cypher', 'server/database', 'shared/dispatch', 'external/uuid'],
	function(CYPHER, DATABASE, DISPATCH, UUID) {
		var object = { key: 'lobby' };

		var root = {
			database: {
				users: DATABASE.hash(object, 'users'),
				players: DATABASE.set(object, 'players'),
				//active_games: DATABASE.bitlist(object, 'games'),
			},
			/*_local: {
				game_states: {},
				clients: {},
			},*/

			/*client: function(user_id) {
				return this._local.clients[user_id];
			},*/

			/*game: function(game_index) {
				if (typeof game_state_list[game_index] === 'undefined') {
					game_state_list[game_index] = HOOKS.trigger('state:new', new STATE(game_id));
				}

				var game_state = game_state_list[game_index];

				return game_state;
			},

			game_exists: function(game_index) {
				return this.active_games.get(index);
			},*/
		};

		HOOKS.on('dispatch:connection', function(client) {
			DEBUG.game("Received connection with socket id", client.id);
			
			DATABASE.select(CYPHER.LOBBY_ID);

			// TODO: Use authentication data to get user id from database.

			var user_id = UUID.v4();
			root.database.players.add(user_id);

			client.user_id = user_id;
			//root._local.clients[user_id] = client;

			DISPATCH({
				type: 'lobby',
				json: {
					name: "Anonymous",
					user_id: user_id,
				},
			}).to(CYPHER.LOBBY_ID);

			// TODO: Relay the new player to the other dynos.
			DEBUG.flow("LOBBY.dispatch:connection: finished setting up new client")
		});

		return root;
	}
);