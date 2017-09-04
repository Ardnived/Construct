
requirejs(
	['external/jquery', 'shared/cypher', 'shared/dispatch', 'shared/actions/all', 'shared/util', 'external/nprogress'],
	function(JQUERY, CYPHER, DISPATCH, ACTIONS, UTIL, NPROGRESS) {
		var self = {
			waiting: false,
			current_action: null,
			acting_unit: null,
			targets: null,
		};

		/**
		 * When a user clicks to active an action, it then comes here to get it's targets.
		 */
		HOOKS.on('action:prepare', function(args) {
			if (self.waiting) {
				DEBUG.error("Waiting for server to confirm your last action, try again soon.");
				return;
			}

			self.waiting = true;
			self.current_action = this;
			self.targets = [];

			if (typeof args !== 'undefined') {
				if ('targets' in args) {
					self.targets = args.targets;
				}

				if ('unit_id' in args) {
					self.acting_unit = GAME_STATE.meta.local_player.unit(args.unit_id);
				}
			}

			if (self.targets.length >= self.current_action.targets.length) {
				finish_execution();
			}
		});

		function clear_execution() {
			self.waiting = false;
			self.current_action = null;
			self.acting_unit = null;
		}

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

			var outcome = HOOKS.trigger('action:queue', self.current_action, {
				state: GAME_STATE,
				data: data,
			});

			if (outcome == false) {
				clear_execution();
			}
		}

		HOOKS.on('action:queue', function(args) {
			// TODO: Refactor this.
			if ('unit_id' in args.data && self.acting_unit == null) {
				self.acting_unit = GAME_STATE.meta.local_player.unit(args.data.unit_id);
			}

			DISPATCH({
				type: 'action',
				binary: args.data,
			}).callback(function(response) {
				switch (response.message.substring(0, 1)) {
					case "3": // Success
						if ('number' in response) {
							GAME_STATE.meta.local_player.action_points = response.number;
						}

						if (self.acting_unit != null) {
							self.acting_unit.last_action = GAME_STATE.meta.round;
						}

						clear_execution();
						break;
					case "4": // Failure
						DEBUG.error("Rejected: "+response.message+' - '+CYPHER.text[response.message]);
						clear_execution();
						break;
					default:
						DEBUG.dispatch("Received: "+response.message+' - '+CYPHER.text[response.message]);
				}
				NPROGRESS.done();
			}).to(GAME_STATE.id);
			NPROGRESS.start();

			// TODO: Wait for confirmation from the server.
			if ('player_id' in args.data) {
				GAME_STATE.player(args.data.player_id).action_points -= this.cost;
			}
		}, HOOKS.ORDER_EXECUTE);

		JQUERY('button.unit').each(function() {
			this.onclick = function() {
				if (GAME_STATE.meta.local_player.unit(this.dataset.unit).position == null) {
					HOOKS.trigger('action:prepare', ACTIONS[this.dataset.action], {
						unit_id: this.dataset.unit,
					});
				} else {
					// TODO: Disable the button if it shouldn't be used.
					DEBUG.error("That unit has already been placed.");
				}
			};
		});

		JQUERY('#skip-button').each(function() {
			this.onclick = function() {
				HOOKS.trigger('action:prepare', ACTIONS['skip']);
			};
		});

		HOOKS.on('hex:mouse_click', function() {
			if (self.current_action != null && self.current_action.targets.length > self.targets.length) {
				var index = self.targets.length;

				if (self.current_action.test_targets(GAME_STATE.meta.local_player, [[this.q, this.r]], index)) {
					self.targets[index] = this;
					continue_execution();
				} else {
					DEBUG.error("Invalid target:", self.current_action.targets[index].error);
				}
			}
		});

		HOOKS.on('hex:mouse_over', function() {
			// Display possible messages.
			if (self.current_action != null && self.current_action.targets.length > self.targets.length) {
				var i = self.targets.length;

				if (self.acting_unit != null && self.acting_unit.position != null) {
					var distance = this.parent_state.distance(this.q, this.r, self.acting_unit.position.q, self.acting_unit.position.r);

					if ('max_range' in self.current_action && distance > self.current_action.max_range) {
						this.graphic.hover = {
							sprite: 'negative',
							text: "too far",
						};
						return;
					}
					
					if ('min_range' in self.current_action && distance < self.current_action.min_range) {
						this.graphic.hover = {
							sprite: 'negative',
							text: "too close",
						};
						return;
					}
				}

				if (!self.current_action.test_targets(GAME_STATE.meta.local_player, [[this.q, this.r]], i)) {
					this.graphic.hover = {
						sprite: 'negative',
						text: self.current_action.targets[i].error,
					};
				} else {
					this.graphic.hover = {
						sprite: 'positive',
						text: self.current_action.key,
					};
				}
			}
		});

		// TODO: Find another opportunity to clear the board.
		HOOKS.on('hex:sync', function() {
			this.graphic.display = false;
		});

		HOOKS.on('action:execute', function(args) {
			var state = args.state;
			var tiles = this.affected_hexes(args.data, false);
			var player = state.player(args.data.player_id);
			var local_player = state.meta.local_player;

			var sprite = null;
			if (player === local_player) {
				sprite = 'local';
			} else if (player.team !== local_player.team) {
				sprite = 'enemy';
			} else {
				sprite = 'ally';
			}

			for (var i in tiles) {
				var tile = tiles[i];
				
				state.hex(tile.q, tile.r).graphic.display = {
					sprite: sprite,
					text: tile.title,
				};
			}
		}, HOOKS.ORDER_AFTER);

		/*
		HOOKS.on('dispatch:confirm', function(args) {
			GAME_STATE.player(args.data.player_id).action_points = args.data.number;

			if (args.data.player_id === GAME_STATE.meta.local_player.id) {
				DEBUG.temp("Acting unit is", self.acting_unit);
				if (self.acting_unit != null) {
					self.acting_unit.last_action = GAME_STATE.meta.round;
				}

				clear_execution();
			}
		}, HOOKS.ORDER_EXECUTE);

		HOOKS.on('dispatch:rejected', function(args) {
			// TODO: Replace this with the transaction response method
			DEBUG.error("Rejected: "+args.data.message+' - '+CYPHER.text[args.data.message]);
			clear_execution();
		}, HOOKS.ORDER_EXECUTE);
		*/
	}
);
