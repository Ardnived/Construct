
CONFIG = {};

// ===== GENERAL ===== //
CONFIG.is_client = (typeof window !== 'undefined');
CONFIG.score_goal = 3;
CONFIG.default_player_count = 2;

// ===== PORT ===== //
CONFIG.port = {
	http: 80,
	socket: 80,
};

if (typeof process !== 'undefined') {
	CONFIG.port.http = process.env.PORT || 3000;
}

// TODO: Refactor this.
CONFIG.port.socket = CONFIG.port.http;

// ===== CANVAS ===== //
CONFIG.canvas = {
	width: 800,
	height: 600,
};

// ===== HEX ===== //
CONFIG.hex = {
	size: 30,
};

CONFIG.hex.width = 1.5 * CONFIG.hex.size;
CONFIG.hex.height = Math.sqrt(3) * CONFIG.hex.size;
CONFIG.hex.scale = 100 * CONFIG.hex.height / 80;

// ===== EDGE ===== //
CONFIG.edge = {
	offset: {
		x: CONFIG.hex.width - 5,
		y: CONFIG.hex.height - 30,
	},
};

// ===== BOARD ===== //
CONFIG.board = {
	width: 12,
	height: 8,
};

CONFIG.board.offset = {
	x: (CONFIG.canvas.width - (CONFIG.board.width/2 * 3 * CONFIG.hex.size)) / 2,
	y: 60
};
