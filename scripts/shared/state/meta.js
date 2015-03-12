
define(
	function() {
		var root = {
			create: function(parent_state) {
				return HOOKS.trigger('meta:new', new meta(parent_state));
			},
		};

		var meta = function(parent_state) {
			this.parent_state = parent_state;
			this.player_count = CONFIG.default_player_count;
			this.round = 0;
			this.ready_players = 0;

			// These are used for responding to action requests on the server.
			this.action_queue = [];
			this.update_queue = {};
		};

		if (CONFIG.is_client) {
			Object.defineProperty(meta.prototype, 'local_player', {
				get: function() {
					return this._local_player;
				},
				set: function(new_value) {
					this.local_player_id = new_value;
					this._local_player = this.parent_state.player(new_value);
				},
			});
		}

		return root;
	}
);
