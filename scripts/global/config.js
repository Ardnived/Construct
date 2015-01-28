
config = {};

// ===== GENERAL ===== //
config.is_server = (typeof window === 'undefined');

// ===== PORT ===== //
config.port = {
	http: 3000,
	socket: 3001,
};

// ===== CANVAS ===== //
config.canvas = {
	width: 600,
	height: 600,
};

// ===== HEX ===== //
config.hex = {
	size: 30,
};

config.hex.width = 1.5 * config.hex.size;
config.hex.height = Math.sqrt(3) * config.hex.size;
config.hex.scale = 100 * config.hex.height / 80;

// ===== EDGE ===== //
config.edge = {
	offset: {
		x: config.hex.width - 5,
		y: config.hex.height - 30,
	},
};

// ===== BOARD ===== //
config.board = {
	width: 12,
	height: 8,
};

config.board.offset = {
	x: (config.canvas.width - (config.board.width/2 * 3 * config.hex.size)) / 2,
	y: 60
};
