
var ui = {
	_selected: null,

	// ==================== PUBLIC ==================== //
	init: function() {
		this.resize_canvas();
		//this.contextmenu.init();
		this.tooltip.init();
		this.hotkeys.init();
		
		/*canvas.bind("mouseup", function(event) {
			if (event.button == 2) {
				UI.contextmenu.hide();
			}
		});
		*/
		
		window.addEventListener('resize', this.resize_canvas, false);
	},
	
	resize_canvas: function() {
	    //canvas.width = window.innerWidth;
	    //canvas.height = window.innerHeight;
	},

	select: function(hex) {
		if (this._selected != null) {
			var old = this._selected.refresh();
			this._selected = null;
			old.refresh();
		}

		this._selected = hex;
	},

	selected: function(hex) {
		if (typeof hex === 'undefined') {
			return this._selected;
		} else {
			return hex === this._selected;
		}
	},

	hotkeys: {
		_keys: {},

		init: function() {
			this._keys[27] = this.escape; // Escape
			document.addEventListener("keydown", this.handler, false);
		},

		handler: function(e) {
			e = e || window.event;
			
			if (typeof ui.hotkeys._keys[e.keyCode] !== 'undefined') {
				ui.hotkeys._keys[e.keyCode]();
			}
		},

		escape: function() {
			ui.select(null);
			ui.tooltip.text("");
		}
	},
	
	tooltip: {
		_element: null,
		
		init: function() {
			this._element = document.getElementById('tooltip');
		},
		
		show: function() {
			this._element.visible = true;
			return this;
		},
		
		hide: function() {
			this._element.visible = false;
			return this;
		},
		
		text: function(text) {
			this._element.innerHTML = text;
		},
		
		set: function(options) {
			this._text.text = options.text;
			this._rect.x = options.x;
			this._rect.y = Math.min(options.y, canvas.height - this.height);
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
	},

	actions: {
		action: function(index, action) {
			if (typeof action === 'undefined') {
				return document.getElementById("action-"+index).dataset.action;
			} else {
				document.getElementById("action-"+index).dataset.action = action.key;
				//document.getElementById("action-"+index+"-icon").src = action.icon;
				document.getElementById("action-"+index+"-title").innerHTML = action.key;
			}
		},

		click: function(element) {
			var key = element.dataset.action;
			/*var action = null;

			if (typeof data.micro[key] !== 'undefined') {
				action = data.micro[key];
			} else if (typeof data.macro[key] !== 'undefined') {
				action = data.macro[key];
			}*/

			var msg = new message.instance();
			msg.type = 'request';
			msg.data = {
				type: 'action',
				action: key,
				q: ui.selected().q,
				r: ui.selected().r
			};
			
			msg.send();
		}
	},

	util: {
		_actionclick: function(event) {
			this.request.send();
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
	}
};
