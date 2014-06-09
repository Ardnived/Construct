var HEX_SIZE = 30;
var BOARD_OFFSET_X = (canvas.width - (12/2 * 3 * HEX_SIZE)) / 2;
var BOARD_OFFSET_Y = 60;

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
	this.width = 1.5 * HEX_SIZE;
	this.height = Math.sqrt(3) * HEX_SIZE;
	this.x = BOARD_OFFSET_X + q * this.width;
	this.y = BOARD_OFFSET_Y + (r + q/2) * this.height;
	
	this.hover = false;
	this.selected = false;
	this.highlight = false;
	
	this._hexagon = canvas.display.polygon({
		x: this.x, y: this.y,
		origin: { x: "center", y: "center" },
		sides: 6,
		radius: HEX_SIZE,
		stroke: "1px #AAF"
	});
	
	this._hexagon.owner = this;
	this._hexagon.bind("mouseenter", tile._mouseenter);
	this._hexagon.bind("mouseleave", tile._mouseleave);
	this._hexagon.bind("mousedown", tile._mousedown);
	this._hexagon.bind("click tap", tile._mouseclick);
	
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

tile.instance.prototype.connect = function(direction, bool) {
	if (bool == null) bool = true;
	
	if (bool) {
		var size = 1.7 * HEX_SIZE / 2;
		
		this._connection[direction.id] = canvas.display.line({
			start: { x: 0, y: 0 },
			end: { x: size * Math.cos(direction.angle), y: size * Math.sin(direction.angle) },
			stroke: "1px #0AA"
		});
		console.log("connect", direction);
		
		this._hexagon.addChild(this._connection[direction.id]);
	} else {
		this._hexagon.removeChild(this._connection[direction.id]);
		delete this._connection[direction.id];
	}
};

tile.instance.prototype.set_image = function(path) {
	if (this._image != undefined) {
		this._hexagon.removeChild(this._image);
		delete this._image;
	}
	
	if (path != null) {
		this._image = canvas.display.image({
			x: 0, y: 0,
			width: HEX_SIZE, height: HEX_SIZE,
			origin: { x: "center", y: "center" },
			image: "../img/"+path,
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
