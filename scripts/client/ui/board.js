
define(
	['shared/directions', 'shared/message'],
	function(directions, message) {
		var root = {	
			dragging: false,
			path: [],

			get_x: function(q1, r1, q2, r2) {
				if (typeof q2 !== 'undefined') {
					return (this.get_x(q1, r1) + this.get_x(q2, r2)) / 2;
				} else {
					return config.board.offset.x + (q1 * config.hex.width);
				}
			},
			
			get_y: function(q1, r1, q2, r2) {
				if (typeof q2 !== 'undefined') {
					return (this.get_y(q1, r1) + this.get_y(q2, r2)) / 2;
				} else {
					return config.board.offset.y + (r1 + q1/2) * config.hex.height;
				}
			},
			
			angle: function(q1, r1, q2, r2) {
				return directions.find(q2 - q1, r2 - r1).angle;
			},
		};

		hooks.on('hex:unit_gained', function(unit) {
			if (unit.owner == unit.parent_state.meta.local_player_id) {
				unit._entity.attr({
					x: root.get_x(this.q, this.r) - config.hex.width * 5 / 9,
					y: root.get_y(this.q, this.r) - config.hex.height * 6 / 9,
					w: 24, h: 24,
				});
			} else {
				unit._entity.attr({
					x: root.get_x(this.q, this.r) - config.hex.width * (3 - (unit.owner * 2)) / 5,
					y: root.get_y(this.q, this.r) - config.hex.height / 5,
					w: 12, h: 12,
				});
			}

			unit._entity.visible = true;
		});

		hooks.on('hex:unit_lost', function(unit) {
			unit._entity.visible = false;
		});

		hooks.on('hex:mouse_over', function(event) {
			if (root.dragging !== false) {
				debug.temp(root.path);
				if (root.path.length > 1) {
					for (var i = root.path.length - 2; i >= 0; i--) {
						var hex1 = root.path[i];
						var hex2 = root.path[i+1];
						var edge = this.parent_state.edge(hex1.q, hex1.r, hex2.q, hex2.r);

						edge._entity.removeComponent(edge._image.hover);
						edge._entity.addComponent(edge._image.normal);
						edge._entity.attr({w: edge.width, h: edge.height});
						edge._entity.draw();
					}
				}

				debug.temp('path to', this.q, this.r);
				root.path = this.parent_state.path(root.dragging.q, root.dragging.r, this.q, this.r);

				if (root.path == null) {
					root.path = [];
				}

				if (root.path.length > 1) {
					for (var i = root.path.length - 2; i >= 0; i--) {
						var hex1 = root.path[i];
						var hex2 = root.path[i+1];
						var edge = this.parent_state.edge(hex1.q, hex1.r, hex2.q, hex2.r);

						edge._entity.removeComponent(edge._image.normal);
						edge._entity.addComponent(edge._image.hover);
						edge._entity.attr({w: edge.width, h: edge.height});
						edge._entity.draw();
					}
				}
			}

			this._entity.removeComponent(this._image.normal);
			this._entity.addComponent(this._image.hover);
			this._entity.attr({w: config.hex.scale, h: config.hex.scale});
			this._entity.draw();
		});

		hooks.on('hex:mouse_out', function(event) {
			this._entity.removeComponent(this._image.hover);
			this._entity.addComponent(this._image.normal);
			this._entity.attr({w: config.hex.scale, h: config.hex.scale});
			this._entity.draw();
		});

		hooks.on('hex:mouse_down', function(event) {
			if (event.mouseButton === Crafty.mouseButtons.LEFT) {
				root.dragging = {
					q: this.q,
					r: this.r,
				};

				debug.temp('origin', root.dragging);
			}
		});

		hooks.on('hex:mouse_up', function(event) {
			if (event.mouseButton === Crafty.mouseButtons.LEFT) {
				debug.temp('end drag');

				if (root.path.length > 1) {
					for (var i = root.path.length - 2; i >= 0; i--) {
						var hex1 = root.path[i];
						var hex2 = root.path[i+1];
						var edge = this.parent_state.edge(hex1.q, hex1.r, hex2.q, hex2.r);

						edge._entity.removeComponent(edge._image.hover);
						edge._entity.addComponent(edge._image.normal);
						edge._entity.attr({w: edge.width, h: edge.height});
						edge._entity.draw();
					}
				}

				root.path = [];

				var origin = this.parent_state.hex(root.dragging.q, root.dragging.r);
				root.dragging = false;

				// TODO: Move this to somewhere more appropriate. Don't allow arbitrary length drags.
				debug.temp('origin', origin, root.dragging);
				if (origin != null) {
					// TODO: Make this more efficient.
					var units = origin.units();
					var player_id = this.parent_state.meta.local_player_id;
					var unit = null;
					for (var key in units) {
						if (units[key].owner == player_id) {
							debug.temp('found unit');
							unit = units[key];
							break;
						}
					};

					debug.temp('unit', unit);
					if (unit != null) {
						message.send('update', {
							type: 'action',
							action: 'move',
							player: player_id,
							unit: unit.id,
							q: this.q,
							r: this.r,
						});
					}
				}
			}
		});

		return root;
	}
);
