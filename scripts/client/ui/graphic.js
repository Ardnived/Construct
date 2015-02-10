// A wrapper for our graphics library.

define(
	['external/crafty', './parent'],
	function(Crafty, parent) {
		function graphic(spriteset, attr) {
			this._sprite = Object.keys(spriteset)[0];
			this._spriteset = spriteset;

			this._entity = Crafty.e("2D, Canvas, "+this._spriteset[this._sprite]);

			parent.call(this, attr);
		};

		graphic.prototype = parent.prototype;

		graphic.prototype.spriteset = function(new_spriteset) {
			if (typeof new_spriteset !== 'undefined') {
				this._entity.removeComponent(this._spriteset[this._sprite]);

				this._spriteset = new_spriteset;

				if (!(this._sprite in new_spriteset)) {
					this._sprite = Object.keys(new_spriteset)[0];
				}

				this.sprite(this._sprite); // Refresh the sprite.
			}

			return this._spriteset;
		}

		graphic.prototype.sprite = function(new_sprite) {
			if (typeof new_sprite !== 'undefined' && new_sprite in this._spriteset) {
				var size = {
					w: this._entity._w,
					h: this._entity._h,
				};

				this._entity.removeComponent(this._spriteset[this._sprite]);
				this._entity.addComponent(this._spriteset[new_sprite]);
				this._entity.attr(size);

				this._sprite = new_sprite;
			}

			return this._sprite;
		}

		return graphic;
	}
);