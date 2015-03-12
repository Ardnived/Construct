// Minified version of https://github.com/janogonzalez/priorityqueuejs
function PriorityQueue(e){this._comparator=e||PriorityQueue.DEFAULT_COMPARATOR;this._elements=[]}PriorityQueue.DEFAULT_COMPARATOR=function(e,t){if(e instanceof Number&&t instanceof Number){return e-t}else{e=e.toString();t=t.toString();if(e==t)return 0;return e>t?1:-1}};PriorityQueue.prototype.isEmpty=function(){return this.size()===0};PriorityQueue.prototype.peek=function(){if(this.isEmpty())throw new Error("PriorityQueue is empty");return this._elements[0]};PriorityQueue.prototype.deq=function(){var e=this.peek();var t=this._elements.pop();var n=this.size();if(n===0)return e;this._elements[0]=t;var r=0;while(r<n){var i=r;var s=2*r+1;var o=2*r+2;if(s<n&&this._compare(s,i)>0){i=s}if(o<n&&this._compare(o,i)>0){i=o}if(i===r)break;this._swap(i,r);r=i}return e};PriorityQueue.prototype.enq=function(e){var t=this._elements.push(e);var n=t-1;while(n>0){var r=Math.floor((n-1)/2);if(this._compare(n,r)<0)break;this._swap(r,n);n=r}return t};PriorityQueue.prototype.size=function(){return this._elements.length};PriorityQueue.prototype.forEach=function(e){return this._elements.forEach(e)};PriorityQueue.prototype._compare=function(e,t){return this._comparator(this._elements[e],this._elements[t])};PriorityQueue.prototype._swap=function(e,t){var n=this._elements[e];this._elements[e]=this._elements[t];this._elements[t]=n}
var queue = PriorityQueue;

HOOKS = {
	_list: {},

	ORDER_FIRST: -100,
	ORDER_BEFORE: -50,
	ORDER_EXECUTE: 0,
	ORDER_AFTER: 50,
	ORDER_LAST: 100,

	comparator: function(a, b) {
		return b.priority - a.priority;
	},

	on: function(slug, callback, priority, identifier) {
		if (typeof priority === 'undefined') {
			priority = this.ORDER_AFTER;
		}

		if (!(slug in this._list)) {
			this._list[slug] = new queue(this.comparator);
		}

		this._list[slug].enq({
			priority: priority,
			callback: callback,
			key: identifier,
		});
	},

	remove: function(slug, key) {
		if (typeof key === 'undefined') {
			delete this._list[slug];
		} else {
			this._list[slug].forEach(function(element, index, array) {
				if (element.key === key) {
					array.splice(index, 1);
				}
			});
		}
	},

	trigger: function(slug, self, args) {
		if (typeof self === 'undefined') {
			self = null;
		}

		if (typeof this._list[slug] !== 'undefined') {
			this._list[slug].forEach(function(element, index, array) {
				element.callback.call(self, args);
			});
		}

		return self;
	},

	filter: function(slug, self, value, args) {
		if (typeof self === 'undefined') {
			self = null;
		}

		if (typeof this._list[slug] !== 'undefined') {
			this._list[slug].forEach(function(element, index, array) {
				value = element.callback.call(self, value, args);
			});
		}

		return value;
	},
};
