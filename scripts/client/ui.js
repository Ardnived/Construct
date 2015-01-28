
var self = {
	selected: null,
};

define(
	['./ui/board', './ui/hotkeys', './ui/topbar', './ui/actions'], 
	function(board, hotkeys, topbar, actions) {
		var root = {
			// ==================== PUBLIC ==================== //
			init: function() {
				this.hotkeys.init();
				this.actions.init();
			},

			select: function(hex) {
				if (self.selected != null) {
					var old = self.selected.refresh();
					selected = null;
					old.refresh();
				}

				self.selected = hex;
			},

			selected: function(hex) {
				if (typeof hex === 'undefined') {
					return self.selected;
				} else {
					return hex === self.selected;
				}
			},

			// ================ MODULES =================== //
			
			board: board,
			hotkeys: hotkeys,
			topbar: topbar,
			actions: actions,
		};

		return root;
	}
);
