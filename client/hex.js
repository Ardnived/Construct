
var hex = {
	_mouseenter: function(event) {
		var hex = this.owner;
		
		if (event.button != 2) {
			hex.hover = true;
			hex.refresh();

			var edges = board.hex.edges(hex.q, hex.r);
			for (var i = edges.length - 1; i >= 0; i--) {
				edges[i].hover = true;
				edges[i].refresh();
			};
		}
	},
	
	_mouseleave: function(event) {
		var hex = this.owner;
		
		if (event.button != 2) {
			hex.hover = false;
			hex.refresh();

			var edges = board.hex.edges(hex.q, hex.r);
			for (var i = edges.length - 1; i >= 0; i--) {
				edges[i].hover = false;
				edges[i].refresh();
			};
		}
	},
	
	_mousedown: function(event) {
		/*var hex = this.owner;
		
		if (event.which == 2) {
			UI.contextmenu.set(hex.get_contextmenu_options()).show();
			
			hex.selected = true;
			hex.refresh();
		}*/
	},
	
	_mouseclick: function(event) {
		var hex = this.owner;

		if (ui.selected(hex)) {
			ui.select(null);
		} else {
			ui.select(hex);
		}
		hex.refresh();
		
		if (event.which == 1) {
			/*var msg = new message.instance();
			msg.type = 'click';
			msg.data = {
				q: hex.q,
				r: hex.r
			};
			
			msg.send();*/
		}
	}
};

hex.instance = function(q, r) {
	this.q = q;
	this.r = r;

	this.width = board.hex.width;
	this.height = board.hex.height;
	this.x = board.hex.get_x(q, r);
	this.y = board.hex.get_y(q, r);
	
	this.hover = false;
	this.selected = false;
	this.highlight = false;

	var hit = {
		x: this.width/2,
		y: this.height/2,
		w: board.hex.width * 1.25,
		h: board.hex.height
	}

	var hitbox = new Crafty.polygon([
		[hit.x - hit.w/4, hit.y + hit.h/2], // Bottom Left
		[hit.x - hit.w/2, hit.y], // Left
		[hit.x - hit.w/4, hit.y - hit.h/2], // Top Left
		[hit.x + hit.w/4, hit.y - hit.h/2], // Top Right
		[hit.x + hit.w/2, hit.y], // Right
		[hit.x + hit.w/4, hit.y + hit.h/2] // Bottom Right
	]);

	this._entity = Crafty.e("2D, Canvas, Mouse")
		.attr({x: this.x - this.width, y: this.y - this.height, w: board.hex.scale, h: board.hex.scale})
		.origin("center")
		.areaMap(hitbox);

	this._entity.bind("MouseOver", hex._mouseenter);
	this._entity.bind("MouseOut", hex._mouseleave);
	this._entity.bind("MouseDown", hex._mousedown);
	this._entity.bind("Click", hex._mouseclick);

	this._entity.owner = this;
	
	this.image(canvas.image.hex.empty);
	this.show();
};

hex.instance.prototype.show = function() {
	this._entity.visible = true;
};

hex.instance.prototype.hide = function() {
	this._entity.visible = false;
};

hex.instance.prototype.destroy = function() {
	this.hide();
	this._hexagon.removeChild(this._image);
	this._hexagon.removeChild(this._tooltip);
	
	delete this._hexagon;
	delete this._image;
};

hex.instance.prototype.image = function(image) {
	if (typeof image !== 'undefined') {
		if (typeof this._image !== 'undefined') {
			if (ui.selected(this) || (this.hover && ui.selected() == null)) {
				this._entity.removeComponent(this._image.hover);
			} else {
				this._entity.removeComponent(this._image.normal);
			}
		}

		this._image = image;

		if (ui.selected(this) || (this.hover && ui.selected() == null)) {
			this._entity.addComponent(this._image.hover);
		} else {
			this._entity.addComponent(this._image.normal);
		}

		this._entity.attr({w: board.hex.scale, h: board.hex.scale});
	} else {
		return this._image;
	}
};

hex.instance.prototype.refresh = function() {
	if (ui.selected(this) || (this.hover && ui.selected() == null)) {
		this._entity.removeComponent(this._image.normal);
		this._entity.addComponent(this._image.hover);

		ui.tooltip.text("This hex is located at "+this.q+", "+this.r);
	} else {
		this._entity.removeComponent(this._image.hover);
		this._entity.addComponent(this._image.normal);
	}

	this._entity.attr({w: board.hex.scale, h: board.hex.scale});
	
	Crafty.DrawManager.drawAll();
	return this;
};

hex.instance.prototype.get_contextmenu_options = function() {
	var options = {
		x: this.x, y: this.y,
		actions: []
	};
	
	var msg = new message.instance();
	msg.type = 'request';
	msg.data = [{
		type: 'action',
		q: this.q,
		r: this.r,
		struct: data.nodes.scramber
	}];
	
	options.actions[0] = { 
		image: "icon_17462.png",
		request: msg,
		tooltip: "Build Scrambler"
	};
	
	var msg = new message.instance();
	msg.type = 'request';
	msg.data = {
		type: 'action',
		q: this.q,
		r: this.r,
		struct: data.nodes.mainframe
	};
	
	options.actions[1] = { 
		image: "icon_21537.png",
		request: msg,
		tooltip: "Build Mainframe"
	};
	
	return options;
};
