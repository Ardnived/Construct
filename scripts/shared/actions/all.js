
define(
	[
		'./monitor',
		'./destroy',
		'./lockdown',
		'./move',
		'./prism',
		'./push',
		'./reconfigure',
		'./reformat',
		'./skip',
		'./spawn',
		'./spy',
		'./trace',
		'./watch',
	],
	function() {
		var root = {};

		/**
		 * Will test a series of targets, starting at the start index is provided
		 * @positions should be an array of arrays [[0,1],[3,4]] and so on
		 */
		function test_targets(player, positions, start) {
			if (typeof start === 'undefined') start = 0;

			for (var i = positions.length - 1; i >= 0; i--) {
				var hex = player.parent_state.hex(positions[i][0], positions[i][1]);
				if (hex == null) return false;

				var target = this.targets[start + i];
				for (var n = target.conditions.length - 1; n >= 0; n--) {
					if (!target.conditions[n](hex, player)) {
						return false;
					}
				};
			};

			return true;
		}

		for (var i = arguments.length - 1; i >= 0; i--) {
			root[arguments[i].key] = arguments[i];
			root[arguments[i].key].test_targets = test_targets;
		};

		root.execute = function(action_key, state, data) {
			var unit = null;
			if ('player_id' in data && 'unit_id' in data) {
				unit = state.player(data.player_id).unit(data.unit_id);
			}

			HOOKS.trigger('action:execute', root[action_key], {
				state: state,
				data: data,
				unit: unit,
			});
		};

		HOOKS.on('action:queue', function(args) {
			var data = args.data;
			var state = args.state;
			var unit = state.player(data.player_id).unit(data.unit_id);

			// TODO: Allow for non-unit actions.

			// Check if the unit can act.
			if (unit.last_action >= state.meta.round) {
				DEBUG.error("Unit tried to act when it has already acted this turn.", unit.last_action, '>=', state.meta.round);
				return false;
			}

			// Player can't act unless they have action points.
			if (unit.owner.action_points < this.cost) {
				DEBUG.error("Player", unit.owner.id, "tried to act when they didn't have any action points.");
				return false;
			}

			// Check if this unit can perform that action.
			if (this.globally_available != true && !(this.key in unit.type.actions)) {
				DEBUG.fatal("Unit tried to execute", "'"+action.key+"'", "without access.", "Type:", unit.type);
				return false;
			}

			// TODO: Check if targets are valid.
		}, HOOKS.ORDER_VETO);

		HOOKS.on('action:execute', function(args) {
			if (args.unit != null) {
				DEBUG.temp("Unit", args.unit.id, "acted on turn", args.state.meta.round);
				args.unit.last_action = args.state.meta.round;
			}

			// TODO: Confirm that all targets are valid for a second time. If not, provide feedback indicating the failure.

			DEBUG.flow("Executing action", this.key, args.data);
			this.execute(args.state, args.data);
		}, HOOKS.ORDER_EXECUTE);

		return root;
	}
);
