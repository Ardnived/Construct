
define(
	['external/jquery', 'shared/message', 'shared/actions/all', 'shared/util'],
	function($, MESSAGE, ACTIONS, UTIL) {
		var self = {
			current_action: null,
			acting_unit: null,
			targets: null,
		};

		var root = {
			execute: function(action_name, unit_index) {
				this.cancel();

				self.current_action = ACTIONS[action_name];
				self.targets = [];

				if (typeof unit_index !== 'undefined') {
					self.acting_unit = GAME_STATE.meta.local_player.unit(unit_index);
				}

				if (self.current_action.targets.length === 0) {
					finish_execution();
				}
			},

			cancel: function() {
				self.current_action = null;
				self.acting_unit = null;
			},
		};

		function continue_execution() {
			// TODO: create some display code.

			if (self.targets.length === self.current_action.targets.length) {
				finish_execution();
			}
		}

		function finish_execution() {
			var data = {
				type: 'action',
				action: self.current_action.key,
				player_id: GAME_STATE.meta.local_player.id,
				positions: [],
			};

			if (self.acting_unit != null) {
				data.unit_id = self.acting_unit.id;
			}

			for (var i = self.current_action.targets.length - 1; i >= 0; i--) {
				if (self.targets[i] != null) {
					data.positions[i] = [self.targets[i].q, self.targets[i].r];
				} else {
					DEBUG.fatal("Tried to execute action with insufficient targets.");
					return;
				}
			};

			if (self.targets.length > 0) {
				var last_hex = GAME_STATE.hex(self.targets[self.targets.length-1].q, self.targets[self.targets.length-1].r);
				last_hex.graphic.hover = false;
			}

			MESSAGE.send('update', HOOKS.filter('action:send', self.current_action, data));
		}

		$('button.unit').each(function() {
			this.onclick = function() {
				DEBUG.temp(GAME_STATE.meta.local_player);
				if (GAME_STATE.meta.local_player.unit(this.dataset.unit).position == null) {
					root.execute(this.dataset.action, this.dataset.unit);
				} else {
					// TODO: Disable the button if it shouldn't be used.
					DEBUG.error("That unit has already been placed.");
				}
			};
		});

		$('#skip-button').each(function() {
			this.onclick = function() {
				root.execute('skip');
			};
		});

		HOOKS.on('hex:mouse_click', function() {
			if (self.current_action != null && self.current_action.targets.length > self.targets.length) {
				var i = self.targets.length;
				var target = self.current_action.targets[i];
				
				if (target.test(this, GAME_STATE.meta.local_player)) {
					self.targets[i] = this;
					DEBUG.temp("Setting target to", this.q, ',', this.r);
					continue_execution();
				} else {
					DEBUG.error("Invalid target:", target.error);
				}
			}
		});

		HOOKS.on('hex:mouse_over', function() {
			// Display possible messages.
			if (self.current_action != null && self.current_action.targets.length > self.targets.length) {
				var i = self.targets.length;
				var target = self.current_action.targets[i];

				if (target.test(this, GAME_STATE.meta.local_player)) {
					this.graphic.hover = {
						sprite: 'positive',
						text: self.current_action.text.name,
					};
				} else {
					this.graphic.hover = {
						sprite: 'negative',
						text: target.error,
					};
				}
			}
		});

		HOOKS.on('action:execute', function(data) {
			if ('unit_id' in data && 'player_id' in data) {
				var player = GAME_STATE.player(data.player_id);
				var local_player = GAME_STATE.meta.local_player;
				var unit = player.unit(data.unit_id);
				var hex = unit.hex;

				if (hex != null) {
					if (player === local_player) {
						hex.graphic.display = {
							sprite: 'local',
							text: this.text.past,
						};
					} else if (player.team !== local_player.team) {
						hex.graphic.display = {
							sprite: 'enemy',
							text: this.text.past,
						};
					} else {
						hex.graphic.display = {
							sprite: 'ally',
							text: this.text.past,
						};
					}
				}
			}
		}, HOOKS.ORDER_AFTER);

		HOOKS.on('hex:sync', function() {
			this.graphic.display = false;
		});

		return root;
	}
);
