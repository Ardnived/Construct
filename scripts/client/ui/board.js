
define(
	['shared/directions'],
	function(directions) {
		var root = {	
			is_dragging: false,
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
			if (root.is_dragging) {
				var last_hex = root.path[root.path.length - 1];
				var bisection = false;
				debug.temp('drag from', last_hex.q, ',', last_hex.r, 'to', this.q, ',', this.r);

				for (var i = 0; i < root.path.length - 1; i++) {
					if (bisection === false && root.path[i].q == this.q && root.path[i].r == this.r) {
						bisection = i;
						debug.temp('bisect at', bisection);
					}

					if (bisection !== false) {
						var hex1 = root.path[i];
						var hex2 = root.path[i+1];
						var edge = GAME_STATE.edge(hex1.q, hex1.r, hex2.q, hex2.r);

						debug.temp('undrag0', hex1, hex2);
						edge._entity.removeComponent(edge._image.hover);
						edge._entity.addComponent(edge._image.normal);
						edge._entity.attr({w: edge.width, h: edge.height});
						edge._entity.draw();
					}
				};

				if (bisection !== false) {
					root.path = root.path.slice(0, bisection+1);
				} else if (this.parent_state.in_bounds(last_hex.q, last_hex.r, this.q, this.r)) {
					var edge = this.parent_state.edge(this.q, this.r, last_hex.q, last_hex.r);
					debug.temp('valid edge', edge);

					if (edge.active) {
						debug.temp('edge is active');
						edge._entity.removeComponent(edge._image.normal);
						edge._entity.addComponent(edge._image.hover);
						edge._entity.attr({w: edge.width, h: edge.height});
						edge._entity.draw();

						root.path.push({
							q: this.q,
							r: this.r,
						});
					}
				}

				debug.temp('new path', root.path.length, root.path);
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
				root.is_dragging = true;
				root.path = [];

				root.path.push({
					q: this.q,
					r: this.r,
				});
			}
		});

		hooks.on('hex:mouse_up', function(event) {
			debug.temp('mouse up');
			if (event.mouseButton === Crafty.mouseButtons.LEFT) {
				debug.temp('end drag');
				root.is_dragging = false;

				if (root.path.length > 1) {
					for (var i = root.path.length - 2; i >= 0; i--) {
						var hex1 = root.path[i];
						var hex2 = root.path[i+1];
						console.log('undrag', hex1, hex2);
						var edge = GAME_STATE.edge(hex1.q, hex1.r, hex2.q, hex2.r);

						edge._entity.removeComponent(edge._image.hover);
						edge._entity.addComponent(edge._image.normal);
						edge._entity.attr({w: edge.width, h: edge.height});
						edge._entity.draw();
					}
				}

				root.path = [];
			}
		});

		return root;
	}
);
