/**
 * rb-tree v0.1.4
 * Fast Splay tree for Node and browser
 *
 * @author Alexander Milevski <info@w8r.name>
 * @license MIT
 * @preserve
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.RBTree = factory());
}(this, (function () { 'use strict';

function DEFAULT_COMPARE (a, b) { return a > b ? 1 : a < b ? -1 : 0; }

var RED   = 0;
var BLACK = 1;

function createNode(key, data, left, right, parent, color) {
  if ( left === void 0 ) left = null;
  if ( right === void 0 ) right = null;
  if ( parent === void 0 ) parent = null;
  if ( color === void 0 ) color = RED;

  return { key: key, data: data, left: left, right: right, parent: parent, color: color };
}

var RBTree = function RBTree(compare, noDuplicates) {
  if ( compare === void 0 ) compare = DEFAULT_COMPARE;
  if ( noDuplicates === void 0 ) noDuplicates = false;

  this._comparator = compare;
  this._root       = null;
  this._size       = 0;
  this._noDuplicates = !!noDuplicates;
};

var prototypeAccessors = { size: {} };


/**
 * @param {Number} key
 * @param {*=} data
 * @return {Node|null}
 */
RBTree.prototype.insert = function insert (key, data) {
  var node;
  var compare = this._comparator;
  if (!this._root) {
    node = createNode(key, data);
    this._root = node;
    node.color = BLACK;
    this._size++;
    return node;
  }
  var p = this._root;
  if (this._noDuplicates) {
    for (var n = this._root; n;) {
      p = n;
      var cmp = compare(key, n.key);
      if (cmp < 0)    { n = n.left; }
      else if (cmp > 0) { n = n.right; }
      else            { return n; }
    }
  } else {
    for (var n$1 = this._root; n$1;) {
      p = n$1;
      if (compare(key, n$1.key) < 0) { n$1 = n$1.left; }
      else                       { n$1 = n$1.right; }
    }
  }
  node = createNode(key, data);
  this._size++;
  node.parent = p;
  if (!p)                         { this._root = node; }
  else if (compare(key, p.key) < 0) { p.left = node; }
  else                            { p.right = node; }

  this.insertFixup(node);
  return node;
};




/**
 * Insert case 2
 * @param {*} key
 * @param {*=} data
 */
RBTree.prototype.insertNode = function insertNode (key, data, parent) {
    var this$1 = this;

  var node;
  while (true) {
    var cmp = this$1._comparator(key, parent.key);
    if (cmp === 0) {
      return null;
    }
    if (cmp > 0) {
      if (parent.right !== null) {
        parent = parent.right;
      } else {
        node = createNode(key, data);
        node.parent = parent;
        parent.right = node;
        this$1._size++;
        break;
      }
    } else if (cmp < 0) {
      if (parent.left !== null) {
        parent = parent.left;
      } else {
        node = createNode(key, data);
        node.parent = parent;
        parent.left = node;
        this$1._size++;
        break;
      }
    }
  }
  if (node) { this.insertFixup(node); }
  return node;
};


RBTree.prototype.insertFixup = function insertFixup (node) {
    var this$1 = this;

  for (var parent = node.parent; parent && parent.color === RED; parent = node.parent) {
    if (parent === parent.parent.left) {
      var uncle$1 = parent.parent.right;
      if (uncle$1 && uncle$1.color === RED) {
        parent.color = BLACK;
        uncle$1.color = BLACK;
        parent.parent.color = RED;
        node = parent.parent;
      } else if (node === parent.right) {
        node = parent;
        this$1.rotateLeft(node);
      } else {
        parent.color = BLACK;
        parent.parent.color = BLACK;
        this$1.rotateRight(parent.parent);
      }
    } else {
      var uncle = parent.parent.left;
      if (uncle && uncle.color === RED) {
        parent.color = BLACK;
        uncle.color = BLACK;
        parent.parent.color = RED;
        node = parent.parent;
      } else if (node === parent.left) {
        node = parent;
        this$1.rotateRight(node);
      } else {
        parent.color = BLACK;
        parent.parent.color = RED;
        this$1.rotateLeft(parent.parent);
      }
    }
  }
  this._root.color = BLACK;
};


/**
 * Rotate the node with its right child.
 * @param node {Node} The node to rotate.
 */
RBTree.prototype.rotateLeft = function rotateLeft (node) {
  var child = node.right;
  node.right = child.left;

  if (child.left) { child.left.parent = node; }
  child.parent = node.parent;

  if (node.parent === null) {
    this._root = child;
  } else if (node === node.parent.left) {
    node.parent.left = child;
  } else {
    node.parent.right = child;
  }

  node.parent = child;
  child.left = node;
};

/**
 * Rotate the node with its left child.
 * @param node {Node} The node to rotate.
 * @return {void}
 */
RBTree.prototype.rotateRight = function rotateRight (node) {
  var child = node.left;
  node.left = child.right;

  if (child.right) { child.right.parent = node; }
  child.parent = node.parent;

  if (node.parent === null) {
    this._root = child;
  } else if (node === node.parent.left) {
    node.parent.left = child;
  } else {
    node.parent.right = child;
  }
  node.parent = child;
  child.right = node;
};


/**
 * @param {Number} key
 * @return {Node|null}
 */
RBTree.prototype.remove = function remove (key) {
  var node = this._root;
  var comp = this._comparator;
  while (node) {
    var cmp = comp(node.key, key);
    if    (cmp < 0) { node = node.right; }
    else if (cmp > 0) { node = node.left; }
    else            { break; }
  }

  if (node === null) { return null; }

  // find node;
  var successor;
  this._size--;
  if (node.left === null || node.right === null) { successor = node; }
  else {
    successor = this.next(node);
    node.key= successor.key;
    node.data = successor.data;
  }
  var child;
  if (successor.left === null) { child = successor.right; }
  else                       { child = successor.left; }
  if (child) { child.parent = successor.parent; }

  if (!successor.parent) { this._root = child; }
  else if (successor === successor.parent.left) { successor.parent.left = child; }
  else                                        { successor.parent.right = child; }

  if (successor.color === BLACK) { this.removeFixup(child, successor.parent); }
  return node;
};


RBTree.prototype.removeFixup = function removeFixup (node, parent) {
    var this$1 = this;

  while (node !== this._root && (node === null || node.color === BLACK)) {
    if (node === parent.left) {
      var brother = parent.right;
      if (brother && brother.color === RED) {
        brother.color = BLACK;
        parent.color = RED;
        this$1.rotateLeft(parent);
        brother = parent.right;
      }
      if (brother &&
        (brother.left=== null || brother.left.color=== BLACK) &&
        (brother.right === null || brother.right.color === BLACK)) {
        brother.color = RED;
        node = parent;
      } else if(brother) {
        if (brother.right === null || brother.right.color === BLACK) {
          brother.left.color = BLACK;
          brother.color = RED;
          this$1.rotateRight(brother);
          brother = parent.right;
        }
        brother.color = parent.color;
        parent.color = BLACK;
        brother.right.color = BLACK;
        this$1.rotateLeft(parent);
        node = this$1._root;
      }
    } else {
      var brother$1 = parent.left;
      if (brother$1 && brother$1.color === RED) {
        brother$1.color = BLACK;
        parent.color = RED;
        this$1.rotateRight(parent);
        brother$1 = parent.left;
      }
      if (brother$1 &&
        (brother$1.left=== null || brother$1.left.color=== BLACK) &&
        (brother$1.right === null || brother$1.right.color === BLACK)) {
        brother$1.color = RED;
        node = parent;
      } else if (brother$1) {
        if (brother$1.left === null || brother$1.left.color === BLACK) {
          brother$1.right.color = BLACK;
          brother$1.color = RED;
          this$1.rotateLeft(brother$1);
          brother$1 = parent.left;
        }
        brother$1.color = parent.color;
        parent.color = BLACK;
        brother$1.left.color = BLACK;
        this$1.rotateRight(parent);
        node = this$1._root;
      }
    }
    parent = node.parent;
  }
  if (node) { node.color = BLACK; }
};


RBTree.prototype.minNode = function minNode (u) {
    if ( u === void 0 ) u = this._root;

  if (u) { while (u.left) { u = u.left; } }
  return u;
};


RBTree.prototype.maxNode = function maxNode (u) {
    if ( u === void 0 ) u = this._root;

  if (u) { while (u.right) { u = u.right; } }
  return u;
};


RBTree.prototype.find = function find (key) {
  var z  = this._root;
  var comp = this._comparator;
  while (z) {
    var cmp = comp(z.key, key);
    if    (cmp < 0) { z = z.right; }
    else if (cmp > 0) { z = z.left; }
    else            { return z; }
  }
  return null;
};

/**
 * Whether the tree contains a node with the given key
 * @param{Key} key
 * @return {boolean} true/false
 */
RBTree.prototype.contains = function contains (key) {
  var node     = this._root;
  var comparator = this._comparator;
  while (node){
    var cmp = comparator(key, node.key);
    if    (cmp === 0) { return true; }
    else if (cmp < 0) { node = node.left; }
    else              { node = node.right; }
  }

  return false;
};


/**
 * Removes and returns the node with smallest key
 * @return {?Node}
 */
RBTree.prototype.pop = function pop () {
  var node = this._root, returnValue = null;
  if (node) {
    while (node.left) { node = node.left; }
    returnValue = { key: node.key, data: node.data };
    this.remove(node.key);
  }
  return returnValue;
};


/* eslint-disable class-methods-use-this */

/**
 * Successor node
 * @param{Node} node
 * @return {?Node}
 */
RBTree.prototype.next = function next (node) {
  var successor = node;
  if (successor) {
    if (successor.right) {
      successor = successor.right;
      while (successor && successor.left) { successor = successor.left; }
    } else {
      successor = node.parent;
      while (successor && successor.right === node) {
        node = successor; successor = successor.parent;
      }
    }
  }
  return successor;
};


/**
 * Predecessor node
 * @param{Node} node
 * @return {?Node}
 */
RBTree.prototype.prev = function prev (node) {
  var predecessor = node;
  if (predecessor) {
    if (predecessor.left) {
      predecessor = predecessor.left;
      while (predecessor && predecessor.right) { predecessor = predecessor.right; }
    } else {
      predecessor = node.parent;
      while (predecessor && predecessor.left === node) {
        node = predecessor;
        predecessor = predecessor.parent;
      }
    }
  }
  return predecessor;
};
/* eslint-enable class-methods-use-this */


/**
 * @param{forEachCallback} callback
 * @return {SplayTree}
 */
RBTree.prototype.forEach = function forEach (callback) {
  var current = this._root;
  var s = [], done = false, i = 0;

  while (!done) {
    // Reach the left most Node of the current Node
    if (current) {
      // Place pointer to a tree node on the stack
      // before traversing the node's left subtree
      s.push(current);
      current = current.left;
    } else {
      // BackTrack from the empty subtree and visit the Node
      // at the top of the stack; however, if the stack is
      // empty you are done
      if (s.length > 0) {
        current = s.pop();
        callback(current, i++);

        // We have visited the node and its left
        // subtree. Now, it's right subtree's turn
        current = current.right;
      } else { done = true; }
    }
  }
  return this;
};


/**
 * Walk key range from `low` to `high`. Stops if `fn` returns a value.
 * @param{Key}    low
 * @param{Key}    high
 * @param{Function} fn
 * @param{*?}     ctx
 * @return {SplayTree}
 */
RBTree.prototype.range = function range (low, high, fn, ctx) {
    var this$1 = this;

  var Q = [];
  var compare = this._comparator;
  var node = this._root, cmp;

  while (Q.length !== 0 || node) {
    if (node) {
      Q.push(node);
      node = node.left;
    } else {
      node = Q.pop();
      cmp = compare(node.key, high);
      if (cmp > 0) {
        break;
      } else if (compare(node.key, low) >= 0) {
        if (fn.call(ctx, node)) { return this$1; } // stop if smth is returned
      }
      node = node.right;
    }
  }
  return this;
};

/**
 * Returns all keys in order
 * @return {Array<Key>}
 */
RBTree.prototype.keys = function keys () {
  var current = this._root;
  var s = [], r = [], done = false;

  while (!done) {
    if (current) {
      s.push(current);
      current = current.left;
    } else {
      if (s.length > 0) {
        current = s.pop();
        r.push(current.key);
        current = current.right;
      } else { done = true; }
    }
  }
  return r;
};


/**
 * Returns `data` fields of all nodes in order.
 * @return {Array<Value>}
 */
RBTree.prototype.values = function values () {
  var current = this._root;
  var s = [], r = [], done = false;

  while (!done) {
    if (current) {
      s.push(current);
      current = current.left;
    } else {
      if (s.length > 0) {
        current = s.pop();
        r.push(current.data);
        current = current.right;
      } else { done = true; }
    }
  }
  return r;
};


/**
 * Returns node at given index
 * @param{number} index
 * @return {?Node}
 */
RBTree.prototype.at = function at (index) {
  // removed after a consideration, more misleading than useful
  // index = index % this.size;
  // if (index < 0) index = this.size - index;

  var current = this._root;
  var s = [], done = false, i = 0;

  while (!done) {
    if (current) {
      s.push(current);
      current = current.left;
    } else {
      if (s.length > 0) {
        current = s.pop();
        if (i === index) { return current; }
        i++;
        current = current.right;
      } else { done = true; }
    }
  }
  return null;
};

/**
 * Bulk-load items. Both array have to be same size
 * @param{Array<Key>}  keys
 * @param{Array<Value>}[values]
 * @param{Boolean}     [presort=false] Pre-sort keys and values, using
 *                                       tree's comparator. Sorting is done
 *                                       in-place
 * @return {AVLTree}
 */
RBTree.prototype.load = function load (keys, values, presort) {
    if ( keys === void 0 ) keys = [];
    if ( values === void 0 ) values = [];
    if ( presort === void 0 ) presort = false;

  if (this._size !== 0) { throw new Error('bulk-load: tree is not empty'); }
  var size = keys.length;
  if (presort) { sort(keys, values, 0, size - 1, this._comparator); }
  this._root = loadRecursive(null, keys, values, 0, size);
  this._size = size;
  return this;
};


RBTree.prototype.min = function min () {
  var node = this.minNode(this._root);
  if (node) { return node.key; }
  else    { return null; }
};


RBTree.prototype.max = function max () {
  var node = this.maxNode(this._root);
  if (node) { return node.key; }
  else    { return null; }
};

RBTree.prototype.isEmpty = function isEmpty () { return this._root === null; };
prototypeAccessors.size.get = function () { return this._size; };

RBTree.prototype.toString = function toString (printNode) {
  return print(this._root, printNode);
};

RBTree.prototype.isBalanced = function isBalanced$1 () {
  return isBalanced(this._root);
};


/**
 * Create a tree and load it with items
 * @param{Array<Key>}        keys
 * @param{Array<Value>?}      [values]

 * @param{Function?}          [comparator]
 * @param{Boolean?}           [presort=false] Pre-sort keys and values, using
 *                                             tree's comparator. Sorting is done
 *                                             in-place
 * @param{Boolean?}           [noDuplicates=false] Allow duplicates
 * @return {SplayTree}
 */
RBTree.createTree = function createTree (keys, values, comparator, presort, noDuplicates) {
  return new SplayTree(comparator, noDuplicates).load(keys, values, presort);
};

Object.defineProperties( RBTree.prototype, prototypeAccessors );

function loadRecursive (parent, keys, values, start, end) {
  var size = end - start;
  if (size > 0) {
    var middle = start + Math.floor(size / 2);
    var key    = keys[middle];
    var data   = values[middle];
    var node   = { key: key, data: data, parent: parent };
    node.left    = loadRecursive(node, keys, values, start, middle);
    node.right   = loadRecursive(node, keys, values, middle + 1, end);
    return node;
  }
  return null;
}


function sort(keys, values, left, right, compare) {
  if (left >= right) { return; }

  var pivot = keys[(left + right) >> 1];
  var i = left - 1;
  var j = right + 1;

  while (true) {
    do { i++; } while (compare(keys[i], pivot) < 0);
    do { j--; } while (compare(keys[j], pivot) > 0);
    if (i >= j) { break; }

    var tmp = keys[i];
    keys[i] = keys[j];
    keys[j] = tmp;

    tmp = values[i];
    values[i] = values[j];
    values[j] = tmp;
  }

  sort(keys, values,  left,     j, compare);
  sort(keys, values, j + 1, right, compare);
}


/**
 * Prints tree horizontally
 * @param  {Node}                       root
 * @param  {Function(node:Node):String} [printNode]
 * @return {String}
 */
function print (root, printNode) {
  if ( printNode === void 0 ) printNode = function (n) { return n.key; };

  var out = [];
  row(root, '', true, function (v) { return out.push(v); }, printNode);
  return out.join('');
}

/**
 * Prints level of the tree
 * @param  {Node}                        root
 * @param  {String}                      prefix
 * @param  {Boolean}                     isTail
 * @param  {Function(in:string):void}    out
 * @param  {Function(node:Node):String}  printNode
 */
function row (root, prefix, isTail, out, printNode) {
  if (root) {
    out(("" + prefix + (isTail ? '└── ' : '├── ') + (printNode(root)) + "\n"));
    var indent = prefix + (isTail ? '    ' : '│   ');
    if (root.left)  { row(root.left,  indent, false, out, printNode); }
    if (root.right) { row(root.right, indent, true,  out, printNode); }
  }
}

/**
 * Is the tree balanced (none of the subtrees differ in height by more than 1)
 * @param  {Node}    root
 * @return {Boolean}
 */
function isBalanced(root) {
  if (root === null) { return true; } // If node is empty then return true

  // Get the height of left and right sub trees
  var lh = height(root.left);
  var rh = height(root.right);

  if (Math.abs(lh - rh) <= 1 &&
      isBalanced(root.left)  &&
      isBalanced(root.right)) { return true; }

  // If we reach here then tree is not height-balanced
  return false;
}

/**
 * The function Compute the 'height' of a tree.
 * Height is the number of nodes along the longest path
 * from the root node down to the farthest leaf node.
 *
 * @param  {Node} node
 * @return {Number}
 */
function height(node) {
  return node ? (1 + Math.max(height(node.left), height(node.right))) : 0;
}

return RBTree;

})));
//# sourceMappingURL=rbtree.js.map
