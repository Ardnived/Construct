
define(
	['shared/message', 'client/ui/graphic', 'client/ui/button', 'client/ui/text', 'client/canvas'],
	function(message, graphic, button, text, canvas) {
		var root = {};

		var self = {
			path: [],
			origin: null,
			graphic: new graphic(canvas.image.cursor, {
				x: 0, y: 0,
				w: config.hex.scale,
				h: config.hex.scale,
				visible: false,
			}),
			tooltip: null,
		};
		
		self.graphic.sprite('neutral');

		self.tooltip = new text("", {
			x: 0,
			y: self.graphic.h,
			w: self.graphic.w,
			visible: false,
		});

		self.tooltip.css({
			'text-align': 'center',
			'text-shadow': '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
		});

		self.graphic.attach(self.tooltip);
		hooks.on('hex:mouse_over', function(event) {
			var local_unit = this.unit(this.parent_state.meta.local_player_id);

			if (self.origin != null) {
				if (self.path.length > 1) {
					for (var i = self.path.length - 2; i >= 0; i--) {
						var hex1 = self.path[i];
						var hex2 = self.path[i+1];
						var edge = this.parent_state.edge(hex1.q, hex1.r, hex2.q, hex2.r);

						edge.graphic.sprite('normal');
					}
				}

				self.path = null;

				debug.temp('unit', self.origin.unit(this.parent_state.meta.local_player_id));
				var limit = self.origin.unit(this.parent_state.meta.local_player_id).type().move;

				if (this.parent_state.distance(self.origin.q, self.origin.r, this.q, this.r) <= limit) {
					self.path = this.parent_state.path(self.origin.q, self.origin.r, this.q, this.r, limit);
				}

				debug.temp('path to', this.q, this.r, 'from', self.origin.q, self.origin.r, self.path);

				if (self.path == null) {
					self.path = [];
					self.graphic.sprite('negative');
					self.tooltip.text = "too far";
				} else if (self.path.length > 1) {
					for (var i = self.path.length - 2; i >= 0; i--) {
						var hex1 = self.path[i];
						var hex2 = self.path[i+1];
						var edge = this.parent_state.edge(hex1.q, hex1.r, hex2.q, hex2.r);

						edge.graphic.sprite('hover');
					}

					self.graphic.sprite('positive');
					self.tooltip.text = "move";
				} else {
					self.graphic.sprite('neutral');
					self.tooltip.text = false;
				}
			} else if (local_unit != null) {
				self.tooltip.text = local_unit.type().key;
			} else {
				self.tooltip.text = false;
			}

			self.graphic.attr({
				x: this.graphic.x,
				y: this.graphic.y,
				visible: true,
			});

			// TODO: Refactor this temporary code.
			document.getElementById('tooltip').innerHTML = "<b>position</b>: "+this.q+", "+this.r+"<br><b>units</b>: "+JSON.stringify(Object.keys(this.units()), null, 2);
		});

		hooks.on('hex:mouse_out', function() {
			self.graphic.visible = false;
			self.tooltip.text = false;
		});

		hooks.on('hex:mouse_down', function(event) {
			var local_player = this.parent_state.player(this.parent_state.meta.local_player_id);
			var local_unit = this.unit(local_player.id);

			if (event.mouseButton === Crafty.mouseButtons.LEFT && local_player.active) {
				// TODO: Allow dragging for other things as well.
				if (local_unit != null) {
					self.origin = this;
				}
			}
		});

		hooks.on('hex:mouse_up', function(event) {
			if (event.mouseButton === Crafty.mouseButtons.LEFT && self.origin != null) {
				debug.temp('end drag');
				
				self.graphic.sprite('neutral');
				self.tooltip.text = false;

				if (self.path.length > 1) {
					for (var i = self.path.length - 2; i >= 0; i--) {
						var hex1 = self.path[i];
						var hex2 = self.path[i+1];
						var edge = this.parent_state.edge(hex1.q, hex1.r, hex2.q, hex2.r);

						edge.graphic.sprite('normal')
					}

					// TODO: Move this to somewhere more appropriate.
					if (self.origin != null) {
						var player_id = this.parent_state.meta.local_player_id;
						var unit = self.origin.unit(player_id);

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

				self.path = [];
				self.origin = null;
			}
		});

		return root;
	}
);
