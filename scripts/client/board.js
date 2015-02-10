
define(
	['shared/directions', 'shared/message', 'client/ui/graphic', 'client/ui/button', 'client/canvas', 'external/crafty'],
	function(directions, message, graphic, button, canvas, Crafty) {
		var root = {
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

		hooks.on('edge:new', function() {
			var x = root.get_x(this.q1, this.r1, this.q2, this.r2);
			var y = root.get_y(this.q1, this.r1, this.q2, this.r2);
			var angle = root.angle(this.q1, this.r1, this.q2, this.r2);

			this.width = Math.abs(root.get_x(this.q1, this.r1) - root.get_x(this.q2, this.r2)) * 1.2;
			this.height = Math.abs(root.get_y(this.q1, this.r1) - root.get_y(this.q2, this.r2)) * 1.2 / 5;

			this.graphic = new graphic(canvas.image.edge.empty, {
				x: x - config.edge.offset.x, 
				y: y - config.edge.offset.y, 
				w: this.width, 
				h: this.height,
				z: -1,
				//visible: false, // TODO: can we set visible here? will it cause problems?
			});
			this.graphic.sprite('normal');
			this.graphic.rotation = angle;
			this.graphic.visible = false;
		});

		hooks.on('hex:new', function() {
			var width = config.hex.width;
			var height = config.hex.height;
			var x = root.get_x(this.q, this.r);
			var y = root.get_y(this.q, this.r);

			var hit = {
				x: width * 0.5,
				y: height * 0.5,
				w: width * 1.25,
				h: height,
			};

			var hitbox = [
				[hit.x - hit.w/4, hit.y + hit.h/2], // Bottom Left
				[hit.x - hit.w/2, hit.y], // Left
				[hit.x - hit.w/4, hit.y - hit.h/2], // Top Left
				[hit.x + hit.w/4, hit.y - hit.h/2], // Top Right
				[hit.x + hit.w/2, hit.y], // Right
				[hit.x + hit.w/4, hit.y + hit.h/2] // Bottom Right
			];

			this.graphic = new button(canvas.image.hex.empty, {
				x: x - width,
				y: y - height,
				w: config.hex.scale,
				h: config.hex.scale,
				visible: true,
			}, 'hex', this, hitbox);
			this.graphic.sprite('hidden');
		});
		
		hooks.on('unit:new', function() {
			this.graphic = new graphic(canvas.image.unit.sniffer, {
				visible: false,
			});

			if (this.parent_state.meta.local_player_id == this.owner) {
				this.graphic.sprite('local');
			} else {
				this.graphic.sprite('enemy');
			}
		});

		hooks.on('edge:update', function(data) {
			if ('active' in data) {
				this.active = data.active;
				this.graphic.visible = this.active;
			}

			if ('number' in data) {
				if (data.number < 1) {
					this.graphic.spriteset(canvas.image.edge.accel);
				} else {
					this.graphic.spriteset(canvas.image.edge.empty);
				}
			}
		});

		hooks.on('hex:unit_gained', function(unit) {
			if (unit.owner == unit.parent_state.meta.local_player_id) {
				unit.graphic.attr({
					x: root.get_x(this.q, this.r) - config.hex.width * 5 / 9,
					y: root.get_y(this.q, this.r) - config.hex.height * 6 / 9,
					w: 24, h: 24,
				});
			} else {
				unit.graphic.attr({
					x: root.get_x(this.q, this.r) - config.hex.width * (3 - (unit.owner * 2)) / 5,
					y: root.get_y(this.q, this.r) - config.hex.height / 5,
					w: 12, h: 12,
				});
			}

			unit.graphic.visible = true;
		});

		hooks.on('hex:unit_lost', function(unit) {
			unit.graphic.visible = false;
		});

		return root;
	}
);
