
var canvas = {
	_hover_key: "Hover",
	
	width: 600,
	height: 600,
	
	image: {
		hex: {},
		edge: {}
	},
	
	init: function() {
		Crafty.init(canvas.width, canvas.height, document.getElementById('canvas'));
		hooks.trigger('init_board');

		this.load("Hex", "../resources/img/hexsheet.png", 100, 100, [
			"Neutral", "Left", "Right"
		], [
			"Empty", "Mainframe"
		]);

		this.load("Edge", "../resources/img/edgesheet.png", 50, 10, [
			"Neutral", "Left", "Right"
		]);

		debug.canvas("ready");
		hooks.trigger('canvas_ready');
	},

	load: function(key, path, width, height, horizontal_list, vertical_list) {
		var slug = key.toLowerCase();
		var spritelist = {};

		for (var i = horizontal_list.length - 1; i >= 0; i--) {
			if (vertical_list != null) {
				for (var n = vertical_list.length - 1; n >= 0; n--) {
					var keys = {
						normal: vertical_list[n]+'_'+horizontal_list[i]+'_'+key,
						hover: vertical_list[n]+'_'+horizontal_list[i]+'_'+key+'_'+this._hover_key
					};

					spritelist[keys.normal] = [i, (n*2)];
					spritelist[keys.hover] = [i, (n*2)+1];

					if (typeof this.image[slug][vertical_list[n].toLowerCase()] === 'undefined') {
						this.image[slug][vertical_list[n].toLowerCase()] = {};
					}

					this.image[slug][vertical_list[n].toLowerCase()][horizontal_list[i].toLowerCase()] = keys;
				}
			} else {
				var keys = {
					normal: horizontal_list[i]+'_'+key,
					hover: horizontal_list[i]+'_'+key+'_'+this._hover_key
				};

				spritelist[keys.normal] = [i, 0];
				spritelist[keys.hover] = [i, 1];
				this.image[slug][horizontal_list[i].toLowerCase()] = keys;
			}
		};

		Crafty.sprite(width, height, path, spritelist);
	}

}

canvas.init();
