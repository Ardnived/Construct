
define(
	['client/ui', 'external/crafty'],
	function(ui, Crafty) {
		debug.flow('init canvas.js');
		var types = ['normal', 'hover'];

		var root = {
			image: {
				
			}
		};

		function load(key, path, width, height, horizontal_list, vertical_list) {
			var slug = key.toLowerCase();
			var spritelist = {};

			for (var i = horizontal_list.length - 1; i >= 0; i--) {
				if (typeof root.image[slug] === 'undefined') {
					root.image[slug] = {};
				}

				if (vertical_list != null) {
					for (var n = vertical_list.length - 1; n >= 0; n--) {
						var keys = {};

						for (var r = types.length - 1; r >= 0; r--) {
							keys[types[r]] = vertical_list[n]+'_'+horizontal_list[i]+'_'+types[r];
							spritelist[keys[types[r]]] = [i, (n*2)+r];
						};

						if (typeof root.image[slug][vertical_list[n].toLowerCase()] === 'undefined') {
							root.image[slug][vertical_list[n].toLowerCase()] = {};
						}

						root.image[slug][vertical_list[n].toLowerCase()][horizontal_list[i].toLowerCase()] = keys;
					}
				} else {
					var keys = {};

					for (var r = types.length - 1; r >= 0; r--) {
						keys[types[r]] = horizontal_list[i]+'_'+types[r];
						spritelist[keys[types[r]]] = [i, r];
					};

					root.image[slug][horizontal_list[i].toLowerCase()] = keys;
				}
			};

			Crafty.sprite(width, height, path, spritelist);
		}

		Crafty.init(config.canvas.width, config.canvas.height, document.getElementById('canvas'));
		Crafty.pixelart(true);

		load.apply(root, ["Hex", "../visual/hexsheet.png", 100, 100, [
			"Neutral", "Left", "Right"
		], [
			"Empty", "Mainframe"
		]]);

		load.apply(root, ["Edge", "../visual/edgesheet.png", 50, 10, [
			"Neutral", "Left", "Right"
		]]);

		load.apply(root, ["Unit", "../visual/unitsheet.png", 24, 24, [
			"Local", "Ally", "Enemy"
		], [
			"Sniffer"
		]]);

		hooks.on('edge:new', function() {
			var x = ui.board.get_x(this.q1, this.r1, this.q2, this.r2);
			var y = ui.board.get_y(this.q1, this.r1, this.q2, this.r2);
			var angle = ui.board.angle(this.q1, this.r1, this.q2, this.r2);

			this.width = Math.abs(ui.board.get_x(this.q1, this.r1) - ui.board.get_x(this.q2, this.r2)) * 1.2;
			this.height = Math.abs(ui.board.get_y(this.q1, this.r1) - ui.board.get_y(this.q2, this.r2)) * 1.2 / 5;

			this._entity = Crafty.e("2D, Canvas, "+root.image.edge.neutral.normal)
				.attr({
					x: x - config.edge.offset.x, 
					y: y - config.edge.offset.y, 
					w: this.width, 
					h: this.height,
					z: -1,
				})
				.origin("center")
				.attr({
					rotation: angle,
				});

			this._image = root.image.edge.neutral;
			this._entity.visible = this.active;
		});

		hooks.on('edge:update', function(data) {
			this.active = data.active;
			this._entity.visible = data.active;
		});

		hooks.on('hex:new', function() {
			debug.flow('got hex:new');
			var width = config.hex.width;
			var height = config.hex.height;
			var x = ui.board.get_x(this.q, this.r);
			var y = ui.board.get_y(this.q, this.r);

			var hit = {
				x: width / 2,
				y: height / 2,
				w: width * 1.25,
				h: height,
			}

			var hitbox = new Crafty.polygon([
				[hit.x - hit.w/4, hit.y + hit.h/2], // Bottom Left
				[hit.x - hit.w/2, hit.y], // Left
				[hit.x - hit.w/4, hit.y - hit.h/2], // Top Left
				[hit.x + hit.w/4, hit.y - hit.h/2], // Top Right
				[hit.x + hit.w/2, hit.y], // Right
				[hit.x + hit.w/4, hit.y + hit.h/2] // Bottom Right
			]);

			this._entity = Crafty.e("2D, Canvas, Mouse, "+root.image.hex.empty.neutral.normal)
				.attr({
					x: x - width,
					y: y - height,
					w: config.hex.scale,
					h: config.hex.scale,
				})
				.origin("center")
				.areaMap(hitbox);
				
			this._entity.bind("MouseOver", function(event) {
				hooks.trigger('hex:mouse_over', this.owner, event);
			});
			
			this._entity.bind("MouseOut", function(event) {
				hooks.trigger('hex:mouse_out', this.owner, event);
			});
			
			this._entity.bind("MouseDown", function(event) {
				hooks.trigger('hex:mouse_down', this.owner, event);
			});
			
			this._entity.bind("MouseUp", function(event) {
				hooks.trigger('hex:mouse_up', this.owner, event);
			});
			
			this._entity.bind("Click", function(event) {
				hooks.trigger('hex:mouse_click', this.owner, event);
			});

			this._entity.owner = this;
			this._entity.visible = true;
			
			this._image = root.image.hex.empty.neutral;
		});
		
		hooks.on('unit:new', function() {
			var image;

			if (this.parent_state.meta.local_player_id == this.owner) {
				image = root.image.unit.sniffer.local.normal;
			} else {
				image = root.image.unit.sniffer.enemy.normal;
			}

			this._entity = Crafty.e("2D, Canvas, "+image)
				.origin("center");
			
			this._entity.owner = this;
			this._entity.visible = false;
		});

		return root;
	}
);


