(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.RBTree = {})));
}(this, (function (exports) { 'use strict';

    var BLACK = 1;
    var RED = 0;

    var Node = /** @class */ (function () {
        function Node(color, key, data, parent, left, right) {
            if (parent === void 0) { parent = null; }
            if (left === void 0) { left = null; }
            if (right === void 0) { right = null; }
            this.color = BLACK;
            this.color = color;
            this.parent = parent;
            this.left = left;
            this.right = right;
            this.key = key;
            this.data = data;
        }
        return Node;
    }());

    var nil = new Node(BLACK);
    var DEFAULT_COMPARE = function (a, b) { return a - b; };
    var Tree = /** @class */ (function () {
        function Tree(comparator) {
            if (comparator === void 0) { comparator = DEFAULT_COMPARE; }
            this._compare = DEFAULT_COMPARE;
            this._size = 0;
            this._compare = comparator;
            this._root = nil;
            this._size = 0;
        }
        Object.defineProperty(Tree.prototype, "root", {
            get: function () {
                return this._root;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tree.prototype, "size", {
            get: function () {
                return this._size;
            },
            enumerable: true,
            configurable: true
        });
        Tree.prototype.isEmpty = function () {
            return this._root === nil;
        };
        Tree.prototype.find = function (key) {
            var compare = this._compare;
            var cmp, x = this._root;
            while (x !== nil) {
                cmp = compare(key, x.key);
                if (cmp === 0)
                    break;
                else if (cmp < 0)
                    x = x.left;
                else
                    x = x.right;
            }
            return x === nil ? null : x;
        };
        Tree.prototype.leftRotate = function (x) {
            var y = x.right;
            x.right = y.left;
            if (y.left !== nil)
                y.left.parent = x;
            y.parent = x.parent;
            if (x.parent === nil)
                this._root = y;
            else if (x === x.parent.left)
                x.parent.left = y;
            else
                x.parent.right = y;
            y.left = x;
            x.parent = y;
        };
        Tree.prototype.rightRotate = function (x) {
            var y = x.left;
            x.left = y.right;
            if (y.right !== nil)
                y.right.parent = x;
            y.parent = x.parent;
            if (x.parent === nil)
                this._root = y;
            else if (x === x.parent.right)
                x.parent.right = y;
            else
                x.parent.left = y;
            y.right = x;
            x.parent = y;
        };
        Tree.prototype.insertFixup = function (x) {
            this._size++;
            x.color = RED;
            var root = this._root;
            while (x !== root && x.parent.color == RED) {
                if (x.parent === x.parent.parent.left) {
                    var y = x.parent.parent.right;
                    if (y.color == RED) {
                        x.parent.color = BLACK;
                        y.color = BLACK;
                        x.parent.parent.color = RED;
                        x = x.parent.parent;
                    }
                    else {
                        if (x === x.parent.right) {
                            x = x.parent;
                            this.leftRotate(x);
                        }
                        x.parent.color = BLACK;
                        x.parent.parent.color = RED;
                        this.rightRotate(x.parent.parent);
                    }
                }
                else {
                    var y = x.parent.parent.left;
                    if (y.color === RED) {
                        x.parent.color = BLACK;
                        y.color = BLACK;
                        x.parent.parent.color = RED;
                        x = x.parent.parent;
                    }
                    else {
                        if (x === x.parent.left) {
                            x = x.parent;
                            this.rightRotate(x);
                        }
                        x.parent.color = BLACK;
                        x.parent.parent.color = RED;
                        this.leftRotate(x.parent.parent);
                    }
                }
            }
            root.color = BLACK;
        };
        Tree.prototype.insert = function (key, data) {
            var y = nil;
            var x = this._root;
            var cmp = 0;
            var compare = this._compare;
            while (x !== nil) {
                y = x;
                cmp = compare(key, x.key);
                if (cmp === 0)
                    break;
                else if (cmp < 0)
                    x = x.left;
                else
                    x = x.right;
            }
            var nz = new Node(BLACK, key, data, y, nil, nil);
            if (y === nil)
                this._root = nz;
            else if (cmp < 0)
                y.left = nz;
            else
                y.right = nz;
            this.insertFixup(nz);
            return nz;
        };
        Tree.prototype.remove = function (key) {
            var x = this._root;
            var compare = this._compare;
            while (x !== nil) {
                var cmp = compare(key, x.key);
                if (cmp === 0)
                    break;
                else if (cmp < 0)
                    x = x.left;
                else
                    x = x.right;
            }
            if (x === nil)
                return null;
            this._size--;
            return this.deleteSubtree(x);
        };
        /**
         * Removes and returns the node with smallest key
         * @return {?Node}
         */
        Tree.prototype.pop = function () {
            var min = this.minNode();
            if (min)
                this.deleteSubtree(min);
            return min;
        };
        Tree.prototype.deleteSubtree = function (z) {
            var y;
            if (z.left === nil || z.right === nil)
                y = z; // y has a nil node as a child
            else { // find tree successor with a nil node as a child
                y = z.right;
                while (y.left !== nil)
                    y = y.left;
            }
            // x is y's only child
            var x = y.left !== nil ? y.left : y.right;
            x.parent = y.parent;
            if (y.parent === nil)
                this._root = x;
            else {
                if (y === y.parent.left)
                    y.parent.left = x;
                else
                    y.parent.right = x;
            }
            if (y !== z)
                z.key = y.key;
            if (y.color === BLACK)
                this.deleteFixup(x);
            return z;
        };
        Tree.prototype.deleteFixup = function (x) {
            var root = this._root;
            while (x !== root && x.color === BLACK) {
                if (x === x.parent.left) {
                    var w = x.parent.right;
                    if (w.color === RED) {
                        w.color = BLACK;
                        x.parent.color = RED;
                        this.leftRotate(x.parent);
                        w = x.parent.right;
                    }
                    if (w.left.color === BLACK && w.right.color === BLACK) {
                        w.color = RED;
                        x = x.parent;
                    }
                    else {
                        if (w.right.color === BLACK) {
                            w.left.color = BLACK;
                            w.color = RED;
                            this.rightRotate(w);
                            w = x.parent.right;
                        }
                        w.color = x.parent.color;
                        x.parent.color = BLACK;
                        w.right.color = BLACK;
                        this.leftRotate(x.parent);
                        x = root;
                    }
                }
                else {
                    var w = x.parent.left;
                    if (w.color === RED) {
                        w.color = BLACK;
                        x.parent.color = RED;
                        this.rightRotate(x.parent);
                        w = x.parent.left;
                    }
                    if (w.right.color === BLACK && w.left.color === BLACK) {
                        w.color = RED;
                        x = x.parent;
                    }
                    else {
                        if (w.left.color == BLACK) {
                            w.right.color = BLACK;
                            w.color = RED;
                            this.leftRotate(w);
                            w = x.parent.left;
                        }
                        w.color = x.parent.color;
                        x.parent.color = BLACK;
                        w.left.color = BLACK;
                        this.rightRotate(x.parent);
                        x = root;
                    }
                }
            }
            x.color = BLACK;
        };
        Tree.prototype.max = function () {
            var x = this._root;
            while (x !== nil && x.right !== nil)
                x = x.right;
            return x === nil ? null : x.key;
        };
        Tree.prototype.min = function () {
            var x = this._root;
            while (x !== nil && x.left !== nil)
                x = x.left;
            return x === nil ? null : x.key;
        };
        /**
         * @return {Node|null}
         */
        Tree.prototype.minNode = function (t) {
            if (t === void 0) { t = this._root; }
            if (t !== nil)
                while (t.left !== nil)
                    t = t.left;
            return t === nil ? null : t;
        };
        /**
         * @return {Node|null}
         */
        Tree.prototype.maxNode = function (t) {
            if (t === void 0) { t = this._root; }
            if (t !== nil)
                while (t.right !== nil)
                    t = t.right;
            return t === nil ? null : t;
        };
        /**
         * @param  {Key} key
         * @return {Boolean}
         */
        Tree.prototype.contains = function (key) {
            var current = this._root;
            var compare = this._compare;
            while (current) {
                var cmp = compare(key, current.key);
                if (cmp === 0)
                    return true;
                else if (cmp < 0)
                    current = current.left;
                else
                    current = current.right;
            }
            return false;
        };
        /**
         * @param  {Visitor} visitor
         * @param  {*=}      ctx
         * @return {SplayTree}
         */
        Tree.prototype.forEach = function (visitor, ctx) {
            var current = this._root;
            var Q = []; /* Initialize stack s */
            var done = false;
            while (!done) {
                if (current !== nil) {
                    Q.push(current);
                    current = current.left;
                }
                else {
                    if (Q.length !== 0) {
                        current = Q.pop();
                        visitor.call(ctx, current);
                        current = current.right;
                    }
                    else
                        done = true;
                }
            }
            return this;
        };
        /**
         * Returns node at given index
         * @param  {number} index
         * @return {?Node}
         */
        Tree.prototype.at = function (index) {
            var current = this._root, done = false, i = 0;
            var Q = [];
            while (!done) {
                if (current !== nil) {
                    Q.push(current);
                    current = current.left;
                }
                else {
                    if (Q.length > 0) {
                        current = Q.pop();
                        if (i === index)
                            return current;
                        i++;
                        current = current.right;
                    }
                    else
                        done = true;
                }
            }
            return null;
        };
        /**
         * Walk key range from `low` to `high`. Stops if `fn` returns a value.
         * @param  {Key}      low
         * @param  {Key}      high
         * @param  {Function} fn
         * @param  {*?}       ctx
         * @return {SplayTree}
         */
        Tree.prototype.range = function (low, high, fn, ctx) {
            var Q = [];
            var compare = this._compare;
            var node = this._root, cmp;
            while (Q.length !== 0 || node) {
                if (node) {
                    Q.push(node);
                    node = node.left;
                }
                else {
                    node = Q.pop();
                    cmp = compare(node.key, high);
                    if (cmp > 0) {
                        break;
                    }
                    else if (compare(node.key, low) >= 0) {
                        if (fn.call(ctx, node))
                            return this; // stop if smth is returned
                    }
                    node = node.right;
                }
            }
            return this;
        };
        /**
         * Returns array of keys
         * @return {Array<Key>}
         */
        Tree.prototype.keys = function () {
            var keys = [];
            this.forEach(function (_a) {
                var key = _a.key;
                return keys.push(key);
            });
            return keys;
        };
        /**
         * Returns array of all the data in the nodes
         * @return {Array<Value>}
         */
        Tree.prototype.values = function () {
            var values = [];
            this.forEach(function (_a) {
                var data = _a.data;
                return values.push(data);
            });
            return values;
        };
        /**
         * @param  {Node}   d
         * @return {Node|nil}
         */
        Tree.prototype.next = function (d) {
            var root = this._root;
            var successor = nil;
            if (d.right !== nil) {
                successor = d.right;
                while (successor.left !== nil)
                    successor = successor.left;
                return successor;
            }
            var comparator = this._compare;
            while (root !== nil) {
                var cmp = comparator(d.key, root.key);
                if (cmp === 0)
                    break;
                else if (cmp < 0) {
                    successor = root;
                    root = root.left;
                }
                else
                    root = root.right;
            }
            return successor === nil ? null : successor;
        };
        /**
         * @param  {Node} d
         * @return {Node|nil}
         */
        Tree.prototype.prev = function (d) {
            var root = this._root;
            var predecessor = nil;
            if (d.left !== nil) {
                predecessor = d.left;
                while (predecessor.right !== nil)
                    predecessor = predecessor.right;
                return predecessor;
            }
            var comparator = this._compare;
            while (root !== nil) {
                var cmp = comparator(d.key, root.key);
                if (cmp === 0)
                    break;
                else if (cmp < 0)
                    root = root.left;
                else {
                    predecessor = root;
                    root = root.right;
                }
            }
            return predecessor === nil ? null : predecessor;
        };
        Tree.prototype.clear = function () {
            this._root = nil;
            this._size = 0;
            return this;
        };
        Tree.nil = nil;
        return Tree;
    }());

    exports.default = Tree;
    exports.Node = Node;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=rbtree.js.map
