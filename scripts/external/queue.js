//(function(){function e(t,n,r){var i=e.resolve(t);if(null==i){r=r||t;n=n||"root";var s=new Error('Failed to require "'+r+'" from "'+n+'"');s.path=r;s.parent=n;s.require=true;throw s}var o=e.modules[i];if(!o._resolving&&!o.exports){var u={};u.exports={};u.client=u.component=true;o._resolving=true;o.call(this,u.exports,e.relative(i),u);delete o._resolving;o.exports=u.exports}return o.exports}e.modules={};e.aliases={};e.resolve=function(t){if(t.charAt(0)==="/")t=t.slice(1);var n=[t,t+".js",t+".json",t+"/index.js",t+"/index.json"];for(var r=0;r<n.length;r++){var t=n[r];if(e.modules.hasOwnProperty(t))return t;if(e.aliases.hasOwnProperty(t))return e.aliases[t]}};e.normalize=function(e,t){var n=[];if("."!=t.charAt(0))return t;e=e.split("/");t=t.split("/");for(var r=0;r<t.length;++r){if(".."==t[r]){e.pop()}else if("."!=t[r]&&""!=t[r]){n.push(t[r])}}return e.concat(n).join("/")};e.register=function(t,n){e.modules[t]=n};e.alias=function(t,n){if(!e.modules.hasOwnProperty(t)){throw new Error('Failed to alias "'+t+'", it does not exist')}e.aliases[n]=t};e.relative=function(t){function r(e,t){var n=e.length;while(n--){if(e[n]===t)return n}return-1}function i(n){var r=i.resolve(n);return e(r,t,n)}var n=e.normalize(t,"..");i.resolve=function(i){var s=i.charAt(0);if("/"==s)return i.slice(1);if("."==s)return e.normalize(n,i);var o=t.split("/");var u=r(o,"deps")+1;if(!u)u=0;i=o.slice(0,u+1).join("/")+"/deps/"+i;return i};i.exists=function(t){return e.modules.hasOwnProperty(i.resolve(t))};return i};e.register("priorityqueuejs/index.js",function(e,t,n){function r(e){this._comparator=e||r.DEFAULT_COMPARATOR;this._elements=[]}n.exports=r;r.DEFAULT_COMPARATOR=function(e,t){if(e instanceof Number&&t instanceof Number){return e-t}else{e=e.toString();t=t.toString();if(e==t)return 0;return e>t?1:-1}};r.prototype.isEmpty=function(){return this.size()===0};r.prototype.peek=function(){if(this.isEmpty())throw new Error("PriorityQueue is empty");return this._elements[0]};r.prototype.deq=function(){var e=this.peek();var t=this._elements.pop();var n=this.size();if(n===0)return e;this._elements[0]=t;var r=0;while(r<n){var i=r;var s=2*r+1;var o=2*r+2;if(s<n&&this._compare(s,i)>0){i=s}if(o<n&&this._compare(o,i)>0){i=o}if(i===r)break;this._swap(i,r);r=i}return e};r.prototype.enq=function(e){var t=this._elements.push(e);var n=t-1;while(n>0){var r=Math.floor((n-1)/2);if(this._compare(n,r)<0)break;this._swap(r,n);n=r}return t};r.prototype.size=function(){return this._elements.length};r.prototype.forEach=function(e){return this._elements.forEach(e)};r.prototype._compare=function(e,t){return this._comparator(this._elements[e],this._elements[t])};r.prototype._swap=function(e,t){var n=this._elements[e];this._elements[e]=this._elements[t];this._elements[t]=n}});if(typeof exports=="object"){module.exports=e("priorityqueuejs")}else if(typeof define=="function"&&define.amd){define([],function(){return e("priorityqueuejs")})}else{this["PriorityQueue"]=e("priorityqueuejs")}})()

/**
 * Initializes a new empty `PriorityQueue` with the given `comparator(a, b)`
 * function, uses `.DEFAULT_COMPARATOR()` when no function is provided.
 *
 * The comparator function must return a positive number when `a > b`, 0 when
 * `a == b` and a negative number when `a < b`.
 *
 * @param {Function}
 * @return {PriorityQueue}
 * @api public
 */
function PriorityQueue(comparator) {
  this._comparator = comparator || PriorityQueue.DEFAULT_COMPARATOR;
  this._elements = [];
}

/**
 * Compares `a` and `b`, when `a > b` it returns a positive number, when
 * it returns 0 and when `a < b` it returns a negative number.
 *
 * @param {String|Number} a
 * @param {String|Number} b
 * @return {Number}
 * @api public
 */
PriorityQueue.DEFAULT_COMPARATOR = function(a, b) {
  if (a instanceof Number && b instanceof Number) {
    return a - b;
  } else {
    a = a.toString();
    b = b.toString();

    if (a == b) return 0;

    return (a > b) ? 1 : -1;
  }
};

/**
 * Returns whether the priority queue is empty or not.
 *
 * @return {Boolean}
 * @api public
 */
PriorityQueue.prototype.isEmpty = function() {
  return this.size() === 0;
};

/**
 * Peeks at the top element of the priority queue.
 *
 * @return {Object}
 * @throws {Error} when the queue is empty.
 * @api public
 */
PriorityQueue.prototype.peek = function() {
  if (this.isEmpty()) throw new Error('PriorityQueue is empty');

  return this._elements[0];
};

/**
 * Dequeues the top element of the priority queue.
 *
 * @return {Object}
 * @throws {Error} when the queue is empty.
 * @api public
 */
PriorityQueue.prototype.deq = function() {
  var first = this.peek();
  var last = this._elements.pop();
  var size = this.size();

  if (size === 0) return first;

  this._elements[0] = last;
  var current = 0;

  while (current < size) {
    var largest = current;
    var left = (2 * current) + 1;
    var right = (2 * current) + 2;

    if (left < size && this._compare(left, largest) > 0) {
      largest = left;
    }

    if (right < size && this._compare(right, largest) > 0) {
      largest = right;
    }

    if (largest === current) break;

    this._swap(largest, current);
    current = largest;
  }

  return first;
};

/**
 * Enqueues the `element` at the priority queue and returns its new size.
 *
 * @param {Object} element
 * @return {Number}
 * @api public
 */
PriorityQueue.prototype.enq = function(element) {
  var size = this._elements.push(element);
  var current = size - 1;

  while (current > 0) {
    var parent = Math.floor((current - 1) / 2);

    if (this._compare(current, parent) < 0) break;

    this._swap(parent, current);
    current = parent;
  }

  return size;
};

/**
 * Returns the size of the priority queue.
 *
 * @return {Number}
 * @api public
 */
PriorityQueue.prototype.size = function() {
  return this._elements.length;
};

/**
 *  Iterates over queue elements
 *
 *  @param {Function} fn
 */
PriorityQueue.prototype.forEach = function(fn) {
  return this._elements.forEach(fn);
};

/**
 * Compares the values at position `a` and `b` in the priority queue using its
 * comparator function.
 *
 * @param {Number} a
 * @param {Number} b
 * @return {Number}
 * @api private
 */
PriorityQueue.prototype._compare = function(a, b) {
  return this._comparator(this._elements[a], this._elements[b]);
};

/**
 * Swaps the values at position `a` and `b` in the priority queue.
 *
 * @param {Number} a
 * @param {Number} b
 * @api private
 */
PriorityQueue.prototype._swap = function(a, b) {
  var aux = this._elements[a];
  this._elements[a] = this._elements[b];
  this._elements[b] = aux;
};