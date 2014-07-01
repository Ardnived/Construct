var tile = {
	_mouseenter: function(event) {
		var tile = this.owner;
		
		if (event.button != 2) {
			tile.hover = true;
			tile.refresh();
		}
	},
	
	_mouseleave: function(event) {
		var tile = this.owner;
		
		if (event.button != 2) {
			tile.hover = false;
			tile.refresh();
		}
		
		tile.selected = false;
	},
	
	_mousedown: function(event) {
		var tile = this.owner;
		
		if (event.which == 2) {
			UI.contextmenu.set(tile.get_contextmenu_options()).show();
			
			tile.selected = true;
			tile.refresh();
		}
	},
	
	_mouseclick: function(event) {
		var tile = this.owner;
		
		if (event.which == 1) {
			var request = new Request({});
			request.type = RequestType.click;
			request.q = tile.q;
			request.r = tile.r;
			
			server.request(request);
		}
	}
};

tile.instance = function(q, r) {
	this.q = q;
	this.r = r;
	this.width = board.tile.width;
	this.height = board.tile.height;
	this.x = board.tile.get_x(q, r);
	this.y = board.tile.get_y(q, r);
	
	this.hover = false;
	this.selected = false;
	this.highlight = false;
	
	this._hexagon = canvas.display.polygon({
		x: this.x, y: this.y,
		origin: { x: "center", y: "center" },
		sides: 6,
		radius: board.tile.size,
		stroke: "1px #AAF"
	});
	
	this._hexagon.owner = this;
	this._hexagon.bind("mouseenter", tile._mouseenter);
	this._hexagon.bind("mouseleave", tile._mouseleave);
	this._hexagon.bind("mousedown", tile._mousedown);
	this._hexagon.bind("click tap", tile._mouseclick);
	
	this.show();
	
	this._connection = {};
};

tile.instance.prototype.show = function() {
	this._hexagon.add();
};

tile.instance.prototype.hide = function() {
	this._hexagon.remove();
};

tile.instance.prototype.destroy = function() {
	this.hide();
	this._hexagon.removeChild(this._image);
	this._hexagon.removeChild(this._tooltip);
	
	delete this._hexagon;
	delete this._image;
};

tile.instance.prototype.set_image = function(path) {
	if (this._image != undefined) {
		this._hexagon.removeChild(this._image);
		delete this._image;
	}
	
	if (path != null) {
		this._image = canvas.display.image({
			x: 0, y: 0,
			width: board.tile.size, height: board.tile.size,
			origin: { x: "center", y: "center" },
			image: "../resources/img/"+path,
			pointerEvents: false,
		});
		
		this._image.owner = this;
		this._hexagon.addChild(this._image);
	}
	
	return this;
};

tile.instance.prototype.refresh = function() {
	if (this.highlight) {
		this._hexagon.fill = "#595";
	} else {
		this._hexagon.fill = "transparent";
	}
	
	if (this.hover) {
		UI.tooltip.set({
			text: "Located at "+this.q+", "+this.r,
			x: this.x + this.width/2 + 5, 
			y: this.y
		}).show();
	} else {
		UI.tooltip.hide();
	}
	
	if (this.hover && !this.selected) {
		this._hexagon.shadow = "0 0 5px #000";
	} else {
		this._hexagon.shadow = "0 0 0px #000";
	}
	
	canvas.draw.redraw();
	return this;
};

tile.instance.prototype.get_contextmenu_options = function() {
	var options = {
		x: this.x, y: this.y,
		actions: []
	};
	
	var request = new Request({});
	request.type = RequestType.build;
	request.q = this.q;
	request.r = this.r;
	request.struct = Data.nodes.scrambler.id;
	
	options.actions[0] = { 
		image: "icon_17462.png",
		request: request,
		tooltip: "Build Scrambler"
	};
	
	var request = new Request({});
	request.type = RequestType.build;
	request.q = this.q;
	request.r = this.r;
	request.struct = Data.nodes.mainframe.id;
	
	options.actions[1] = { 
		image: "icon_21537.png",
		request: request,
		tooltip: "Build Mainframe"
	};
	
	return options;
};
