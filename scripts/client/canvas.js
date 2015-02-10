
define(
	['external/crafty', 'client/ui/graphic'],
	function(Crafty, graphic) {
		debug.flow('init canvas.js');

		var root = {
			image: {
				test: {
					normal: 'test',
					hover: 'test',
				},
				hex: {
					empty: {
						visible: [0,0],
						hidden:  [1,0],
					},
					uplink: {
						neutral: {
							visible: [0,1],
							hidden:  [1,1],
						},
						ally: {
							visible: [0,2],
							hidden:  [1,2],
						},
						enemy: {
							visible: [0,3],
							hidden:  [1,3],
						},
					},
				},
				edge: {
					empty: {
						normal: [0,0],
						hover:  [1,0],
					},
					accel: {
						normal: [0,1],
						hover:  [1,1],
					},
				},
				unit: {
					sniffer: {
						local: [0,0],
						ally:  [1,0],
						enemy: [2,0],
					},
				},
				cursor: {
					selected: [0,0],
					neutral:  [1,0],
					positive: [2,0],
					negative: [3,0],
				},
			}
		};

		function parse(key, list, output) {
			for (var slug in list) {
				var image_key = key+"."+slug;

				if (list[slug] instanceof Array) {
					output[image_key] = list[slug];
					list[slug] = image_key;
				} else {
					parse(image_key, list[slug], output);
				}
			}
		}

		function load(key, path, width, height) {
			var list = root.image[key];
			var spritelist = {};

			parse(key, list, spritelist);
			
			Crafty.sprite(width, height, "../visual/"+path, spritelist);
		}

		Crafty.init(config.canvas.width, config.canvas.height, document.getElementById('canvas'));
		Crafty.pixelart(true);

		load('hex',    'hexsheet.png',    100, 100);
		load('cursor', 'cursorsheet.png', 100, 100);
		load('edge',   'edgesheet.png',    50, 10);
		load('unit',   'unitsheet.png',    24, 24);

		Crafty.sprite(300, 300, "../visual/test.png", { test: [0,0] });

		return root;
	}
);


