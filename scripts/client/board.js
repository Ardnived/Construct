
define(
	['shared/directions', 'client/ui/graphic', 'client/ui/tile', 'client/canvas', 'shared/state/team'],
	function(DIRECTIONS, GRAPHIC, TILE, CANVAS, TEAM) {
		var root = {
			get_x: function(q1, r1, q2, r2) {
				if (typeof q2 !== 'undefined') {
					return (this.get_x(q1, r1) + this.get_x(q2, r2)) / 2;
				} else {
					return CONFIG.board.offset.x + (q1 * CONFIG.hex.width);
				}
			},
			
			get_y: function(q1, r1, q2, r2) {
				if (typeof q2 !== 'undefined') {
					return (this.get_y(q1, r1) + this.get_y(q2, r2)) / 2;
				} else {
					return CONFIG.board.offset.y + (r1 + q1/2) * CONFIG.hex.height;
				}
			},
			
			angle: function(q1, r1, q2, r2) {
				return DIRECTIONS.find(q2 - q1, r2 - r1).angle;
			},
		};


		/* ======== EDGE ======== */

		HOOKS.on('edge:new', function() {
			var x = root.get_x(this.q1, this.r1, this.q2, this.r2);
			var y = root.get_y(this.q1, this.r1, this.q2, this.r2);
			var angle = root.angle(this.q1, this.r1, this.q2, this.r2);

			this.width = Math.abs(root.get_x(this.q1, this.r1) - root.get_x(this.q2, this.r2)) * 1.2;
			this.height = Math.abs(root.get_y(this.q1, this.r1) - root.get_y(this.q2, this.r2)) * 1.2 / 5;

			this.graphic = new GRAPHIC(CANVAS.image.edge.empty, {
				x: x - CONFIG.edge.offset.x, 
				y: y - CONFIG.edge.offset.y, 
				w: this.width, 
				h: this.height,
				z: -1,
				//visible: false, // TODO: can we set visible here? will it cause problems?
			});

			this.graphic.sprite('normal');
			this.graphic.rotation = angle;
			this.graphic.visible = false;
		});

		HOOKS.on('edge:update', function(data) {
			if ('number' in data) {
				if (data.number < 1) {
					this.graphic.spriteset(CANVAS.image.edge.accel);
				} else {
					this.graphic.spriteset(CANVAS.image.edge.empty);
				}
			}
		});

		HOOKS.on('edge:change_active', function() {
			this.graphic.visible = this.active;
		});
		

		/* ======== UNIT ======== */

		HOOKS.on('unit:new', function() {
			this.graphic = new GRAPHIC(CANVAS.image.unit.carrier, {
				visible: false,
			});

			if (this.owner.id === this.parent_state.meta.local_player_id) {
				this.graphic.sprite('local');
			} else if (this.owner.team === this.parent_state.meta.local_player.team) {
				this.graphic.sprite('ally');
			} else {
				this.graphic.sprite('enemy');
			}
		});
		
		HOOKS.on('unit:change_type', function(old_type) {
			this.graphic.spriteset(CANVAS.image.unit[this.type.key]);
		});


		/* ======== HEX ======== */

		HOOKS.on('hex:new', function() {
			var hex_x = root.get_x(this.q, this.r);
			var hex_y = root.get_y(this.q, this.r);

			this.graphic = new TILE(this, hex_x, hex_y);

			var x = this.graphic.x;
			var y = this.graphic.y;
			var w = this.graphic.w;
			var h = this.graphic.h;

			this.status = {
				lockdown: new GRAPHIC(CANVAS.image.hex.lockdown, {
					x: x, y: y, w: w, h: h, z: -7,
					visible: false,
				}),
				prism: new GRAPHIC(CANVAS.image.hex.prism, {
					x: x, y: y, w: w, h: h, z: -6,
					visible: false,
				}),
				monitor: new GRAPHIC(CANVAS.image.hex.monitor, {
					x: x, y: y, w: w, h: h, z: -5,
					visible: false,
				}),
			};
		});

		HOOKS.on('hex:change_visibility', function(args) {
			if (GAME_STATE.meta.local_player.team === args.team) {
				if (args.new_value > TEAM.VISION_HIDDEN) {
					this.graphic.sprite('visible');
				} else {
					this.graphic.sprite('hidden');
				}
			}
		});

		HOOKS.on('hex:change_type', function() {
			var owner_key = 'neutral';

			if (this.owner != null) {
				if (GAME_STATE.meta.local_player.team === this.owner.team) {
					owner_key = 'ally';
				} else {
					owner_key = 'enemy';
				}
			}

			if (this.type == null) {
				this.graphic.spriteset(CANVAS.image.hex['empty']);
			} else {
				this.graphic.spriteset(CANVAS.image.hex[this.type.key][owner_key]);
			}
		}, HOOKS.ORDER_AFTER);

		HOOKS.on('hex:change_owner', function() {
			if (this.type != null && this.type.ownable) {
				// TODO: Replace this test code.
				if (this.owner === GAME_STATE.meta.local_player) {
					this.graphic.spriteset(CANVAS.image.hex[this.type.key].ally);
				} else if (this.owner != null) {
					this.graphic.spriteset(CANVAS.image.hex[this.type.key].enemy);
				} else {
					this.graphic.spriteset(CANVAS.image.hex[this.type.key].neutral);
				}
			}
		}, HOOKS.ORDER_AFTER);

		HOOKS.on('hex:change_lockdown', function() {
			this.status.lockdown.visible = this.lockdown;
		}, HOOKS.ORDER_AFTER);

		HOOKS.on('hex:unit_gained', function(unit) {
			// TODO: Write code that will make enemies appear big if the hex is otherwise unoccupied.
			if (unit.owner === unit.parent_state.meta.local_player) {
				unit.graphic.attr({
					x: root.get_x(this.q, this.r) - CONFIG.hex.width * 3 / 4,
					y: root.get_y(this.q, this.r) - CONFIG.hex.height * 1 / 2,
					w: 18, h: 18,
				});
				/*
				unit.graphic.attr({
					x: root.get_x(this.q, this.r) - CONFIG.hex.width * 5 / 9 + 1,
					y: root.get_y(this.q, this.r) - CONFIG.hex.height * 6 / 9,
					w: 24, h: 24,
				});
				*/
			} else {
				unit.graphic.attr({
					x: root.get_x(this.q, this.r) - CONFIG.hex.width * 1 / 4,
					y: root.get_y(this.q, this.r) - CONFIG.hex.height * 1 / 2,
					w: 18, h: 18,
				});
			}

			unit.graphic.visible = true;
		});

		HOOKS.on('hex:unit_lost', function(unit) {
			unit.graphic.visible = false;
		});

		HOOKS.on('hex:trap_gained', function(args) {
			var key = args.key;
			var team = args.team;

			if (team === GAME_STATE.meta.local_player.team) {
				this.status[key].sprite('ally');
			} else {
				this.status[key].sprite('enemy');
			}

			this.status[key].visible = true;
		});

		HOOKS.on('hex:trap_lost', function(args) {
			var key = args.key;
			var team = args.team;

			this.status[key].visible = false;
		});

		return root;
	}
);
