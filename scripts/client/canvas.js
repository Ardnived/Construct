
define(
	['external/crafty', 'client/ui/graphic'],
	function(Crafty, graphic) {
		DEBUG.flow('init canvas.js');

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
					relay: {
						neutral: {
							visible: [0,4],
							hidden:  [1,4],
						},
						ally: {
							visible: [0,5],
							hidden:  [1,5],
						},
						enemy: {
							visible: [0,6],
							hidden:  [1,6],
						},
					},
					access: {
						neutral: {
							visible: [0,7],
							hidden:  [1,7],
						},
						ally: {
							visible: [0,8],
							hidden:  [1,8],
						},
						enemy: {
							visible: [0,9],
							hidden:  [1,9],
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
					peeper: {
						local: [0,1],
						ally:  [1,1],
						enemy: [2,1],
					},
					bouncer: {
						local: [0,2],
						ally:  [1,2],
						enemy: [2,2],
					},
					enforcer: {
						local: [0,3],
						ally:  [1,3],
						enemy: [2,3],
					},
					seeker: {
						local: [3,0],
						ally:  [4,0],
						enemy: [5,0],
					},
					cleaner: {
						local: [3,1],
						ally:  [4,1],
						enemy: [5,1],
					},
					carrier: {
						local: [3,2],
						ally:  [4,2],
						enemy: [5,2],
					},
				},
				cursor: {
					selected: [0,0],
					neutral:  [1,0],
					positive: [2,0],
					negative: [3,0],
					local:    [1,1],
					ally:     [2,1],
					enemy:    [3,1],
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

		Crafty.init(CONFIG.canvas.width, CONFIG.canvas.height, document.getElementById('canvas'));
		//Crafty.pixelart(true); // TODO: Determine if this is desired or not.

		load('hex',    'hexsheet.png',    100, 100);
		load('cursor', 'cursorsheet.png', 100, 100);
		load('edge',   'edgesheet.png',    50, 10);
		load('unit',   'unitsheet.png',    24, 24);

		Crafty.sprite(300, 300, "../visual/test.png", { test: [0,0] });

		return root;
	}
);


