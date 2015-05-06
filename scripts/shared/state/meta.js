
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
		};

		if (!CONFIG.is_server) {
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

		HOOKS.on('meta:sync', function() {
			this.ready_players = 0;
			this.round++;
			DEBUG.temp("Increase round counter to", this.round);
		}, HOOKS.ORDER_EXECUTE);

		return root;
	}
);

HOOKS.on('meta:data', function(args) {
	var data = args.data;
	data.type = 'meta';

	if (typeof args.include === 'undefined' || args.include.indexOf('count') != -1) {
		data.number = this.player_count;
	}

	if (typeof args.player !== 'undefined') {
		data.player_id = args.player.id;
	}
}, HOOKS.ORDER_EXECUTE);
