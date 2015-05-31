
define(
	['shared/message', 'shared/actions/all', 'client/ui/graphic', 'client/ui/text', 'client/canvas'],
	function(MESSAGE, ACTIONS, GRAPHIC, TEXT, CANVAS) {
		var root = {};

		var self = {
			path: [],
			selected_hex: null,
		};

		HOOKS.on('hex:mouse_over', function(event) {
			var local_unit = this.unit(this.parent_state.meta.local_player);

			// TODO: Refactor this temporary code.
			var units = this.units();
			var unit_list = [];
			for (var p in units) {
				for (var u in units[p]) {
					unit_list.push(units[p].key);
				}
			}

			document.getElementById('tooltip').innerHTML = 
				"<b>position</b>: "+this.q+", "+this.r
				+"<br><b>units</b>: ["+unit_list.join(', ')+"]"
				+"<br><b>type</b>: "+(this.type != null ? this.type.key : "null")
				+"<br><b>lockdown</b>: "+(this.lockdown ? "true" : "false");
			// END temporary code.

			if (self.selected_hex != null) {
				if (self.path.length > 1) {
					for (var i = self.path.length - 2; i >= 0; i--) {
						var hex1 = self.path[i];
						var hex2 = self.path[i+1];
						var edge = this.parent_state.edge(hex1.q, hex1.r, hex2.q, hex2.r);

						edge.graphic.sprite('normal');
					}
				}

				if (!ACTIONS['move'].test_targets(GAME_STATE.meta.local_player, [[this.q, this.r]])) {
					self.path = [];
					this.graphic.hover = {
						sprite: 'negative',
						text: MOVE.targets[0].error,
					};
					return;
				}

				self.path = null;

				var limit = self.selected_hex.unit(this.parent_state.meta.local_player).type.move;

				if (this.parent_state.distance(self.selected_hex.q, self.selected_hex.r, this.q, this.r) <= limit) {
					self.path = this.parent_state.path(self.selected_hex.q, self.selected_hex.r, this.q, this.r, limit);
				}

				DEBUG.temp('path to', this.q, this.r, 'from', self.selected_hex.q, self.selected_hex.r, self.path);

				if (self.path == null) {
					self.path = [];
					this.graphic.hover = {
						sprite: 'negative',
						text: "too far",
					};
				} else if (self.path.length > 1) {
					for (var i = self.path.length - 2; i >= 0; i--) {
						var hex1 = self.path[i];
						var hex2 = self.path[i+1];
						var edge = this.parent_state.edge(hex1.q, hex1.r, hex2.q, hex2.r);

						edge.graphic.sprite('hover');
					}

					this.graphic.hover = {
						sprite: 'positive',
						text: "move",
					};
				} else {
					this.graphic.hover = true;
				}
			} else {
				this.graphic.hover = true;
			}
		});

		HOOKS.on('hex:mouse_out', function() {
			this.graphic.hover = false;
		});

		HOOKS.on('action:queue', function(args) {
			var state = args.state;
			var data = args.data;

			//UTIL.require_properties(['player_id', 'unit_id', 'positions']);

			DEBUG.temp('displaying action', args);

			if ('player_id' in data && 'unit_id' in data) {
				var unit = GAME_STATE.player(data.player_id).unit(data.unit_id);
				if (unit.position != null) {
					data.position = [unit.position.q, unit.position.r];
				}
			}
			
			var tiles = this.affected_hexes(data, true);

			for (var i in tiles) {
				var tile = tiles[i];

				state.hex(tile.q, tile.r).graphic.display = {
					sprite: 'local',
					text: tile.title,
				};
			}
		}, HOOKS.ORDER_LAST);

		HOOKS.on('hex:mouse_down', function(event) {
			var local_player = this.parent_state.meta.local_player;
			var local_unit = this.units(local_player.id);

			if (event.mouseButton === Crafty.mouseButtons.LEFT && local_player.active) {
				// TODO: Allow dragging for other things as well.
				if (local_unit != null) {
					self.selected_hex = this;
				}
			}
		});

		HOOKS.on('hex:mouse_up', function(event) {
			if (event.mouseButton === Crafty.mouseButtons.LEFT && self.selected_hex != null) {
				DEBUG.temp('end drag');
				
				this.graphic.hover = false;

				if (self.path.length > 1) {
					for (var i = self.path.length - 2; i >= 0; i--) {
						var hex1 = self.path[i];
						var hex2 = self.path[i+1];
						var edge = this.parent_state.edge(hex1.q, hex1.r, hex2.q, hex2.r);

						edge.graphic.sprite('normal')
					}

					// TODO: Move this to somewhere more appropriate.
					if (self.selected_hex != null) {
						var unit = self.selected_hex.unit(this.parent_state.meta.local_player);

						if (unit != null) {
							HOOKS.trigger('action:prepare', MOVE, {
								unit_id: unit.id,
								targets: [this],
							});
						}
					}
				}

				self.path = [];
				self.selected_hex = null;
			}
		});

		return root;
	}
);
