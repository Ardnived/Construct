
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

		this.load("Hex", "../resources/img/hexsheet.png", 100, [
			"Empty", "Mainframe"
		]);

		this.load("Edge", "../resources/img/edgesheet.png", 50, [
			"Empty"
		]);

		debug.canvas("ready");
		hooks.trigger('canvas_ready');
	},

	load: function(key, path, size, list) {
		var slug = key.toLowerCase();
		var spritelist = {};

		for (var i = list.length - 1; i >= 0; i--) {
			var keys = {
				normal: list[i]+'_'+key,
				hover: list[i]+'_'+key+'_'+this._hover_key
			};

			spritelist[keys.normal] = [i, 0];
			spritelist[keys.hover] = [i, 1];
			console.log("set", slug, list[i].toLowerCase(), keys);
			this.image[slug][list[i].toLowerCase()] = keys;
		};

		Crafty.sprite(size, path, spritelist);
	}

}

canvas.init();
