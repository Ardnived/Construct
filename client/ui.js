
var UI = {
	// ==================== PUBLIC ==================== //
	init: function() {
		this.resize_canvas();
		this.contextmenu.init();
		this.tooltip.init();
		
		canvas.bind("mouseup", function(event) {
			if (event.button == 2) {
				UI.contextmenu.hide();
			}
		});
		
		window.addEventListener('resize', this.resize_canvas, false);
	},
	
	create_button: function(data) {
		return new Button(60, 60, "../img/source.png", "../img/source.png", data);
	},
	
	resize_canvas: function() {
	    canvas.width = window.innerWidth;
	    canvas.height = window.innerHeight;
	},
	
	tooltip: {
		_rect: null,
		_text: null,
		
		init: function() {
			this.width = 150;
			this.height = 100;
			
			this._rect = canvas.display.rectangle({
				x: 100, y: 100,
				width: this.width, height: this.height,
				pointerEvents: false,
				fill: "#079",
				stroke: "1px #AAF",
				shadow: "0 0 15px #000",
				join: "round"
			});
			
			this._text = canvas.display.text({
				x: 5, y: 5,
				width: this.width - 10,
				pointerEvents: false,
				fill: "#FFF",
				size: 12,
				text: ""
			});
			this._rect.addChild(this._text);
		},
		
		show: function() {
			this._rect.add();
			return this;
		},
		
		hide: function() {
			this._rect.remove();
			return this;
		},
		
		set_text: function(text) {
			this._text.text = text;
		},
		
		set: function(options) {
			this._text.text = options.text;
			this._rect.x = options.x;
			this._rect.y = Math.min(options.y, canvas.height - this.height);
			return this;
		}
	},
	
	contextmenu: {
		_background: null,
		
		init: function() {
			this._background = canvas.display.image({
				x: 100, y: 200,
				width: 205, height: 205,
				origin: { x: "center", y: "center" },
				image: "../img/radial.png",
				pointerEvents: false,
			});
			
			this._actions = [];
		},
		
		show: function() {
			this._background.add();
			return this;
		},
		
		hide: function() {
			this._background.remove();
			return this;
		},
		
		reset: function() {
			for (var i in this._actions) {
				this._background.remove(this._actions[i]);
				delete this._actions[i];
			}
		},
		
		set: function(options) {
			this._background.x = options.x;
			this._background.y = options.y;
			
			for (var i in options.actions) {
				var action = canvas.display.image({
					x: -(i * 64), y: -Math.sqrt(5625 - Math.pow(i * 32, 2)) + i*48,
					width: 32, height: 32,
					origin: { x: "center", y: "center" },
					image: "../img/"+options.actions[i].image,
					join: "round"
				});
				
				action.tooltip = options.actions[i].tooltip;
				action.request = options.actions[i].request;
				action.bind('mouseup', UIUtil._actionclick);
				action.bind('mouseenter', UIUtil._actionenter);
				action.bind('mouseleave', UIUtil._actionleave);
				
				this._background.addChild(action);
				this._actions[i] = action;
			}
			
			return this;
		}
	},
	
	topbar: {
		set_round: function(value) {
			document.getElementById("roundcounter").innerText = "Round "+value;
		},
		
		update: function() {
			var element;
			
			for (var i = 1; i < players.left.turn; i++) {
				element = document.getElementById("left-t"+i);
				element.className = "progress-bar progress-bar-info";
				element.parentNode.className = "progress flip";
				element.setAttribute("style", "width: 100%");
			}
			
			if (players.left.inprogress && players.left.turn > 0) {
				element = document.getElementById("left-t"+players.left.turn);
				element.className = "progress-bar progress-bar-success";
				element.parentNode.className = "progress progress-striped active flip";
				element.setAttribute("style", "width: 100%");
			}
			
			for (var i = 1; i < players.right.turn; i++) {
				element = document.getElementById("right-t"+i);
				element.className = "progress-bar progress-bar-info";
				element.parentNode.className = "progress";
				element.setAttribute("style", "width: 100%");
			}
			
			if (players.right.inprogress && players.right.turn > 0) {
				element = document.getElementById("right-t"+players.right.turn);
				element.className = "progress-bar progress-bar-success";
				element.parentNode.className = "progress progress-striped active";
				element.setAttribute("style", "width: 100%");
			}
		}
	}
};

var UIUtil = {
	_actionclick: function(event) {
		server.request(this.request);
	},
	
	_actionenter: function(event) {
		UI.tooltip.set_text(this.tooltip);
		this.stroke = "2px #4D4";
		canvas.draw.redraw();
	},
	
	_actionleave: function(event) {
		UI.tooltip.set_text("Choose an action.");
		this.stroke = "none";
		canvas.draw.redraw();
	}
};
