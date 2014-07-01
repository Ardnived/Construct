
var edge = {};

edge.instance = function(q1, r1, q2, r2) {
	this.q1 = q1;
	this.r1 = r1;
	this.q2 = q2;
	this.r2 = r2;
	
	this.x1 = board.tile.get_x(q1, r1);
	this.y1 = board.tile.get_y(q1, r1);
	this.x2 = board.tile.get_x(q2, r2);
	this.y2 = board.tile.get_y(q2, r2);
	
	var size = 1.7 * board.tile.size / 2;
	this._line = canvas.display.line({
		start: { x: this.x1, y: this.y1 },
		end: { x: this.x2, y: this.y2 },
		stroke: "1px #AAA"
	});
	
	this.show();
};

edge.instance.prototype.show = function() {
	this._line.add();
};

edge.instance.prototype.hide = function() {
	this._line.remove();
};

edge.instance.prototype.destroy = function() {
	this.hide();
	
	delete this._line;
};

edge.instance.prototype.set_owner = function(player) {
	if (player == players.left) {
		this._line.stroke = "1px #00B9BD";
	} else {
		this._line.stroke = "1px #FB6900";
	}
};
