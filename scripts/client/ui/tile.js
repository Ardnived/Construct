// A wrapper for our graphics library.

define(
	['external/crafty', './button', 'client/canvas', './graphic', './text'],
	function(CRAFTY, PARENT, CANVAS, GRAPHIC, TEXT) {
		function tile(hex, x, y) {
			this._hex = hex;
			this._display = false;
			this._hover = false;

			var width = CONFIG.hex.width;
			var height = CONFIG.hex.height;

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

			PARENT.call(this, CANVAS.image.hex.empty, {
				x: x - width,
				y: y - height,
				w: CONFIG.hex.scale,
				h: CONFIG.hex.scale,
				visible: true,
			}, 'hex', hex, hitbox);

			this.sprite('hidden');

			this._cursor = new GRAPHIC(CANVAS.image.cursor, {
				x: this.x,
				y: this.y,
				w: CONFIG.hex.scale,
				h: CONFIG.hex.scale,
				visible: false,
			});

			this._cursor.sprite('neutral');

			this._tooltip = new TEXT("", {
				x: this._cursor.x,
				y: this._cursor.y + this._cursor.h,
				w: this._cursor.w,
				visible: false,
			});

			this._tooltip.css({
				'text-align': 'center',
				'text-shadow': '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
			});

			this._cursor.attach(this._tooltip);
			this.attach(this._cursor);
		};

		tile.prototype = PARENT.prototype;

		tile.prototype._update = function() {
			if (this._hover || this._display) {
				this._cursor.visible = true;

				if (this._hover !== false) {
					if (typeof this._hover === 'object' && 'sprite' in this._hover) {
						this._cursor.sprite(this._hover.sprite);
					} else {
						this._cursor.sprite("neutral");
					}
					
					if (typeof this._hover === 'object' && 'text' in this._hover) {
						this._tooltip.text = this._hover.text;
					} else {
						var unit = this._hex.unit(GAME_STATE.meta.local_player.id);

						if (unit != null) {
							this._tooltip.text = unit.type.key;
						} else {
							this._tooltip.text = false;
						}
					}
				} else if (this._display !== false) {
					this._cursor.sprite(this._display.sprite);
					this._tooltip.text = this._display.text;
				}
			} else {
				this._cursor.visible = false;
				this._tooltip.text = false;
			}
		}

		Object.defineProperty(tile.prototype, 'hover', {
			get: function() {
				return this._hover;
			},
			set: function(new_value) {
				if (new_value !== this._hover) {
					this._hover = new_value;
					this._update();
				}
			},
		});

		Object.defineProperty(tile.prototype, 'display', {
			get: function() {
				return this._display;
			},
			set: function(new_value) {
				if (new_value !== this._display) {
					this._display = new_value;

					if (this._hover === false) {
						this._update();
					}
				}
			},
		});

		return tile;
	}
);