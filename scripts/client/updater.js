
requirejs(
	['shared/actions/all', 'shared/util', 'shared/directions'],
	function(ACTIONS, UTIL, DIRECTIONS) {
		HOOKS.on('state:update', function(updates) {
			for (var i in updates) {
				var data = updates[i];
				var object = null;
				var hook = data.type+':update';

				switch (data.type) {
					case 'hex':
						UTIL.require_properties(['position'], data);
						object = this.hex(data.position[0], data.position[1]);
						break;
					case 'edge':
						UTIL.require_properties(['positions'], data);
						object = this.edge(data.positions[0][0], data.positions[0][1], data.positions[1][0], data.positions[1][1]);
						break;
					case 'player':
						UTIL.require_properties(['player_id'], data);
						object = this.player(data.player_id);
						DEBUG.flow('execute', hook, data, object);
						break;
					case 'unit':
						UTIL.require_properties(['player_id', 'unit_id'], data);
						object = this.player(data.player_id).unit(data.unit_id);
						DEBUG.flow('execute', hook, data, object);
						break;
					case 'meta':
						object = this.meta;
						DEBUG.flow('execute', hook, data, object);
						break;
					case 'action':
						UTIL.require_properties(['action'], data);
						hook = 'action:execute';
						object = ACTIONS[data.action];
						DEBUG.flow('execute', hook, data, object);
						break;
					default:
						// Do nothing
						break;
				}

				if (object != null) {
					HOOKS.trigger(hook, object, data);
				} else {
					DEBUG.fatal("Attempted to update a null object.", data);
				}
			}
		}, HOOKS.ORDER_EXECUTE);
		
		HOOKS.on('hex:update', function(data) {
			if ('hex_type' in data) {
				this.type = data.hex_type;
			}

			if ('player_id' in data) {
				this.owner = data.player_id;
			}

			if ('units' in data) {
				// When we receive this field, we take that to indicate a complete list of known units at this hex.
				// Therefore remove any previous impressions of what might exist at this hex.
				var existing_units = this.units();
				for (var p in existing_units) {
					if (p != this.parent_state.meta.local_player.id) {
						for (var i in existing_units[p]) {
							var unit = existing_units[p][i];

							if (p in data.units && unit.id in data.units[p]) {
								DEBUG.temp('unit', unit.key, 'is already present');
								var index = data.units[p].indexOf(unit.id);
								delete data.units[p][index];
							} else {
								DEBUG.temp('unit', unit.key, 'is being removed');
								unit.position = null;
							}
						}
					}
				}

				for (var p in data.units) {
					var player = this.parent_state.player(p);

					for (var i in data.units[p]) {
						var unit = player.unit(data.units[p][i]);

						DEBUG.temp('unit', unit.key, 'is being added');
						unit.position = {
							q: this.q, 
							r: this.r,
						};
					}
				}
			}

			if ('edges' in data) {
				for (var i in DIRECTIONS.keys) {
					var key = DIRECTIONS.keys[i];
					this.edge(DIRECTIONS[key]).active = (data.edges.indexOf(key) !== -1);
				}
			}
		}, HOOKS.ORDER_EXECUTE);

		HOOKS.on('edge:update', function(data) {
			if ('active' in data) {
				this.active = data.active;
			}

			if ('number' in data) {
				this.cost = data.number;
			}
		}, HOOKS.ORDER_EXECUTE);

		HOOKS.on('player:update', function(data) {
			if ('active' in data) {
				this.active = data.active;
			}
		}, HOOKS.ORDER_EXECUTE);

		HOOKS.on('unit:update', function(data) {
			if ('position' in data) {
				this.position = {
					q: data.position[0],
					r: data.position[1],
				};
			}
		}, HOOKS.ORDER_EXECUTE);

		HOOKS.on('meta:update', function(data) {
			if ('player_id' in data) {
				this.local_player = data.player_id;

				// TODO: This isn't the right place for this.
				document.getElementById('local_player_title').innerHTML = "Player "+data.player_id;
			}
			
			if ('number' in data) {
				this.player_count = data.number;

				// TODO: This isn't the right place for this.
				document.getElementById('local_player_title').innerHTML = "Player "+data.player_id;
			}
		}, HOOKS.ORDER_EXECUTE);

		HOOKS.on('action:execute', function(data) {
			if ('position' in data) {
				UTIL.require_properties(['player_id', 'unit_id'], data);

				var unit = GAME_STATE.player(data.player_id).unit(data.unit_id);
				if (unit != null && ((unit.position == null && data.position != null) || (unit.position.q != data.position[0] || unit.position.r != data.position[1]))) {
					DEBUG.error("Executing action, but the unit position was corrected.", data);
					unit.position = {
						q: data.position[0],
						r: data.position[1],
					};
				}
			}

			this.execute(GAME_STATE, data);
		}, HOOKS.ORDER_EXECUTE);
	}
);
