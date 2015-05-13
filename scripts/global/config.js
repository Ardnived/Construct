
CONFIG = {};

// ===== GENERAL ===== //
CONFIG.platform = (typeof window === 'undefined') ? 'server' : 'client';
CONFIG.score_goal = 1;
CONFIG.actions_per_turn = 3;
CONFIG.default_player_count = 2;

// ===== PORT ===== //
CONFIG.port = 3000;
if (typeof process !== 'undefined') {
	CONFIG.port = process.env.PORT || 80;
}

// ===== CANVAS ===== //
CONFIG.canvas = {
	width: 800,
	height: 700,
};

// ===== HEX ===== //
CONFIG.hex = {
	size: 36,
};

CONFIG.hex.width = 1.5 * CONFIG.hex.size;
CONFIG.hex.height = Math.sqrt(3) * CONFIG.hex.size;
CONFIG.hex.scale = 100 * CONFIG.hex.height / 80;
CONFIG.canvas.scale = CONFIG.hex.size / 30;

// ===== EDGE ===== //
CONFIG.edge = {
	offset: {
		x: CONFIG.hex.width - (CONFIG.canvas.scale * 5),
		y: CONFIG.hex.height - (CONFIG.canvas.scale * 30),
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
