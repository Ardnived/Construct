
var edge = {};

edge.instance = function(q1, r1, q2, r2) {
	this.q1 = q1;
	this.r1 = r1;
	this.q2 = q2;
	this.r2 = r2;
	
	this.width = Math.abs(board.hex.get_x(q1, r1) - board.hex.get_x(q2, r2)) * 1.2;
	this.height = Math.abs(board.hex.get_y(q1, r1) - board.hex.get_y(q2, r2)) * 1.2;
	this.x = board.edge.get_x(q1, r1, q2, r2);
	this.y = board.edge.get_y(q1, r1, q2, r2);
	this.rotation = board.edge.angle(q1, r1, q2, r2);
	this.hover = false;
	
	this._entity = Crafty.e("2D, Canvas, "+canvas.image.edge.empty.normal)
		.attr({x: this.x - board.edge.offset.x, y: this.y - board.edge.offset.y, w: this.width, h: this.height, z:-1})
		.origin("center")
		.attr({rotation: this.rotation});

	this.image(canvas.image.edge.empty);
	
	this.show();
};

edge.instance.prototype.show = function() {
	this._entity.visible = true;
};

edge.instance.prototype.hide = function() {
	this._entity.visible = false;
};

edge.instance.prototype.destroy = function() {
	this.hide();
	
	delete this._entity;
};

edge.instance.prototype.image = function(image) {
	if (typeof image !== 'undefined') {
		if (typeof this._image !== 'undefined') {
			if (his.hover) {
				this._entity.removeComponent(this._image.hover);
			} else {
				this._entity.removeComponent(this._image.normal);
			}
		}

		this._image = image;

		if (this.hover) {
			this._entity.addComponent(this._image.hover);
		} else {
			this._entity.addComponent(this._image.normal);
		}
	} else {
		return this._image;
	}
};

edge.instance.prototype.refresh = function() {
	if (this.hover) {
		this._entity.removeComponent(this._image.normal);
		this._entity.addComponent(this._image.hover);
	} else {
		this._entity.removeComponent(this._image.hover);
		this._entity.addComponent(this._image.normal);
	}

	this._entity.attr({w: this.width, h: this.height});
	
	Crafty.DrawManager.drawAll();
	return this;
};
