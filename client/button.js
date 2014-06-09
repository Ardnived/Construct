
function Button(x, y, normalimage, hoverimage, request) {
	this._rect = canvas.display.rectangle({
		x: x, y: y,
		width: 64, height: 64,
		//origin: { x: "center", y: "center" },
		fill: "#000"
	});
	
	this.enabled = true;
	this.request = request;
	
	this.normalimage = normalimage;
	this.hoverimage = hoverimage;
	//this._set_image(normalimage);
	
	this._rect.owner = this;
	this._rect.bind("mouseenter", ButtonUtil._mouseenter);
	this._rect.bind("mouseleave", ButtonUtil._mouseleave);
	this._rect.bind("click tap", ButtonUtil._mouseclick);
}

Button.prototype.show = function() {
	this._rect.add();
};

Button.prototype.hide = function() {
	this._rect.remove();
};

Button.prototype.destroy = function() {
	this.hide();
	delete this._rect;
};

Button.prototype._set_image = function(path) {
	this._rect.fill = "image("+path+")";
	canvas.draw.redraw();
};

Button.prototype._set_enabled = function(bool) {
	this.enabled = bool;
};

ButtonUtil = {
	_mouseenter: function(event) {
		var button = this.owner;
		button._set_image(button.hoverimage);
	},
	
	_mouseleave: function(event) {
		var button = this.owner;
		button._set_image(button.normalimage);
	},
	
	_mouseclick: function(event) {
		var button = this.owner;
		
		if (button.enabled) {
			console.log("send", MessageType.request, button.request);
			server.request(button.request);
		}
	}
};