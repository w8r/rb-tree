function DEFAULT_COMPARE (a, b) { return a > b ? 1 : a < b ? -1 : 0; }

const RED   = 0;
const BLACK = 1;

function createNode(key, data, left = null, right = null, parent = null, color = RED) {
  return { key, data, left, right, parent, color };
}

export default class RBTree {

  constructor(compare = DEFAULT_COMPARE, noDuplicates = false) {
    this._comparator   = compare;
    this._root         = null;
    this._size         = 0;
    this._noDuplicates = !!noDuplicates;
  }


  /**
   * @param {Number} key
   * @param {*=} data
   * @return {Node|null}
   */
  insert (key, data) {
    let node;
    const compare = this._comparator;
    if (!this._root) {
      node = createNode(key, data);
      this._root = node;
      node.color = BLACK;
      this._size++;
      return node;
    }
    let p = this._root;
    if (this._noDuplicates) {
      for (let n = this._root; n;) {
        p = n;
        const cmp = compare(key, n.key);
        if (cmp < 0)      n = n.left;
        else if (cmp > 0) n = n.right;
        else              return n;
      }
    } else {
      for (let n = this._root; n;) {
        p = n;
        if (compare(key, n.key) < 0) n = n.left;
        else                         n = n.right;
      }
    }
    node = createNode(key, data);
    this._size++;
    node.parent = p;
    if (!p)                           this._root = node;
    else if (compare(key, p.key) < 0) p.left = node;
    else                              p.right = node;

    this.insertFixup(node);
    return node;
  }




  /**
   * Insert case 2
   * @param {*} key
   * @param {*=} data
   */
  insertNode (key, data, parent) {
    let node;
    while (true) {
      const cmp = this._comparator(key, parent.key);
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
          this._size++;
          break;
        }
      } else if (cmp < 0) {
        if (parent.left !== null) {
          parent = parent.left;
        } else {
          node = createNode(key, data);
          node.parent = parent;
          parent.left = node;
          this._size++;
          break;
        }
      }
    }
    if (node) this.insertFixup(node);
    return node;
  }


  insertFixup (node) {
    for (let parent = node.parent; parent && parent.color === RED; parent = node.parent) {
      if (parent === parent.parent.left) {
        const uncle = parent.parent.right;
        if (uncle && uncle.color === RED) {
          parent.color = BLACK;
          uncle.color = BLACK;
          parent.parent.color = RED;
          node = parent.parent;
        } else if (node === parent.right) {
          node = parent;
          this.rotateLeft(node);
        } else {
          parent.color = BLACK;
          parent.parent.color = BLACK;
          this.rotateRight(parent.parent);
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
          this.rotateRight(node);
        } else {
          parent.color = BLACK;
          parent.parent.color = RED;
          this.rotateLeft(parent.parent);
        }
      }
    }
    this._root.color = BLACK;
  }


  /**
   * Rotate the node with its right child.
   * @param node {Node} The node to rotate.
   */
  rotateLeft (node) {
    let child = node.right;
    node.right = child.left;

    if (child.left) child.left.parent = node;
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
  }

  /**
   * Rotate the node with its left child.
   * @param node {Node} The node to rotate.
   * @return {void}
   */
  rotateRight (node) {
    let child = node.left;
    node.left = child.right;

    if (child.right) child.right.parent = node;
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
  }


  /**
   * @param {Number} key
   * @return {Node|null}
   */
  remove (key) {
    let node = this._root;
    var comp = this._comparator;
    while (node) {
      const cmp = comp(node.key, key);
      if      (cmp < 0) node = node.right;
      else if (cmp > 0) node = node.left;
      else              break;
    }

    if (node === null) return null;

    // find node;
    let successor;
    this._size--;
    if (node.left === null || node.right === null) successor = node;
    else {
      successor = this.next(node);
      node.key  = successor.key;
      node.data = successor.data;
    }
    let child;
    if (successor.left === null) child = successor.right;
    else                         child = successor.left;
    if (child) child.parent = successor.parent;

    if (!successor.parent) this._root = child;
    else if (successor === successor.parent.left) successor.parent.left = child;
    else                                          successor.parent.right = child;

    if (successor.color === BLACK) this.removeFixup(child, successor.parent);
    return node;
  }


  removeFixup (node, parent) {
    while (node !== this._root && (node === null || node.color === BLACK)) {
      if (node === parent.left) {
        let brother = parent.right;
        if (brother && brother.color === RED) {
          brother.color = BLACK;
          parent.color = RED;
          this.rotateLeft(parent);
          brother = parent.right;
        }
        if (brother &&
          (brother.left  === null || brother.left.color  === BLACK) &&
          (brother.right === null || brother.right.color === BLACK)) {
          brother.color = RED;
          node = parent;
        } else if(brother) {
          if (brother.right === null || brother.right.color === BLACK) {
            brother.left.color = BLACK;
            brother.color = RED;
            this.rotateRight(brother);
            brother = parent.right;
          }
          brother.color = parent.color;
          parent.color = BLACK;
          brother.right.color = BLACK;
          this.rotateLeft(parent);
          node = this._root;
        }
      } else {
        let brother = parent.left;
        if (brother && brother.color === RED) {
          brother.color = BLACK;
          parent.color = RED;
          this.rotateRight(parent);
          brother = parent.left;
        }
        if (brother &&
          (brother.left  === null || brother.left.color  === BLACK) &&
          (brother.right === null || brother.right.color === BLACK)) {
          brother.color = RED;
          node = parent;
        } else if (brother) {
          if (brother.left === null || brother.left.color === BLACK) {
            brother.right.color = BLACK;
            brother.color = RED;
            this.rotateLeft(brother);
            brother = parent.left;
          }
          brother.color = parent.color;
          parent.color = BLACK;
          brother.left.color = BLACK;
          this.rotateRight(parent);
          node = this._root;
        }
      }
      parent = node.parent;
    }
    if (node) node.color = BLACK;
  }


  minNode(u = this._root) {
    if (u) while (u.left) u = u.left;
    return u;
  }


  maxNode(u = this._root) {
    if (u) while (u.right) u = u.right;
    return u;
  }


  find (key) {
    var z    = this._root;
    var comp = this._comparator;
    while (z) {
      var cmp = comp(z.key, key);
      if      (cmp < 0) z = z.right;
      else if (cmp > 0) z = z.left;
      else              return z;
    }
    return null;
  }

  /**
   * Whether the tree contains a node with the given key
   * @param  {Key} key
   * @return {boolean} true/false
   */
  contains (key) {
    var node       = this._root;
    var comparator = this._comparator;
    while (node)  {
      var cmp = comparator(key, node.key);
      if      (cmp === 0) return true;
      else if (cmp < 0)   node = node.left;
      else                node = node.right;
    }

    return false;
  }


  /**
   * Removes and returns the node with smallest key
   * @return {?Node}
   */
  pop () {
    var node = this._root, returnValue = null;
    if (node) {
      while (node.left) node = node.left;
      returnValue = { key: node.key, data: node.data };
      this.remove(node.key);
    }
    return returnValue;
  }


  /* eslint-disable class-methods-use-this */

  /**
   * Successor node
   * @param  {Node} node
   * @return {?Node}
   */
  next (node) {
    var successor = node;
    if (successor) {
      if (successor.right) {
        successor = successor.right;
        while (successor && successor.left) successor = successor.left;
      } else {
        successor = node.parent;
        while (successor && successor.right === node) {
          node = successor; successor = successor.parent;
        }
      }
    }
    return successor;
  }


  /**
   * Predecessor node
   * @param  {Node} node
   * @return {?Node}
   */
  prev (node) {
    var predecessor = node;
    if (predecessor) {
      if (predecessor.left) {
        predecessor = predecessor.left;
        while (predecessor && predecessor.right) predecessor = predecessor.right;
      } else {
        predecessor = node.parent;
        while (predecessor && predecessor.left === node) {
          node = predecessor;
          predecessor = predecessor.parent;
        }
      }
    }
    return predecessor;
  }
  /* eslint-enable class-methods-use-this */


  /**
   * @param  {forEachCallback} callback
   * @return {SplayTree}
   */
  forEach(callback) {
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
        } else done = true;
      }
    }
    return this;
  }


  /**
   * Walk key range from `low` to `high`. Stops if `fn` returns a value.
   * @param  {Key}      low
   * @param  {Key}      high
   * @param  {Function} fn
   * @param  {*?}       ctx
   * @return {SplayTree}
   */
  range(low, high, fn, ctx) {
    const Q = [];
    const compare = this._comparator;
    let node = this._root, cmp;

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
          if (fn.call(ctx, node)) return this; // stop if smth is returned
        }
        node = node.right;
      }
    }
    return this;
  }

  /**
   * Returns all keys in order
   * @return {Array<Key>}
   */
  keys () {
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
        } else done = true;
      }
    }
    return r;
  }


  /**
   * Returns `data` fields of all nodes in order.
   * @return {Array<Value>}
   */
  values () {
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
        } else done = true;
      }
    }
    return r;
  }


  /**
   * Returns node at given index
   * @param  {number} index
   * @return {?Node}
   */
  at (index) {
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
          if (i === index) return current;
          i++;
          current = current.right;
        } else done = true;
      }
    }
    return null;
  }

  /**
   * Bulk-load items. Both array have to be same size
   * @param  {Array<Key>}    keys
   * @param  {Array<Value>}  [values]
   * @param  {Boolean}       [presort=false] Pre-sort keys and values, using
   *                                         tree's comparator. Sorting is done
   *                                         in-place
   * @return {AVLTree}
   */
  load(keys = [], values = [], presort = false) {
    if (this._size !== 0) throw new Error('bulk-load: tree is not empty');
    const size = keys.length;
    if (presort) sort(keys, values, 0, size - 1, this._comparator);
    this._root = loadRecursive(null, keys, values, 0, size);
    this._size = size;
    return this;
  }


  min() {
    var node = this.minNode(this._root);
    if (node) return node.key;
    else      return null;
  }


  max() {
    var node = this.maxNode(this._root);
    if (node) return node.key;
    else      return null;
  }

  isEmpty() { return this._root === null; }
  get size() { return this._size; }

  toString(printNode) {
    return print(this._root, printNode);
  }

  isBalanced() {
    return isBalanced(this._root);
  }


  /**
   * Create a tree and load it with items
   * @param  {Array<Key>}          keys
   * @param  {Array<Value>?}        [values]

   * @param  {Function?}            [comparator]
   * @param  {Boolean?}             [presort=false] Pre-sort keys and values, using
   *                                               tree's comparator. Sorting is done
   *                                               in-place
   * @param  {Boolean?}             [noDuplicates=false]   Allow duplicates
   * @return {SplayTree}
   */
  static createTree(keys, values, comparator, presort, noDuplicates) {
    return new SplayTree(comparator, noDuplicates).load(keys, values, presort);
  }
}


function loadRecursive (parent, keys, values, start, end) {
  const size = end - start;
  if (size > 0) {
    const middle = start + Math.floor(size / 2);
    const key    = keys[middle];
    const data   = values[middle];
    const node   = { key, data, parent };
    node.left    = loadRecursive(node, keys, values, start, middle);
    node.right   = loadRecursive(node, keys, values, middle + 1, end);
    return node;
  }
  return null;
}


function sort(keys, values, left, right, compare) {
  if (left >= right) return;

  const pivot = keys[(left + right) >> 1];
  let i = left - 1;
  let j = right + 1;

  while (true) {
    do i++; while (compare(keys[i], pivot) < 0);
    do j--; while (compare(keys[j], pivot) > 0);
    if (i >= j) break;

    let tmp = keys[i];
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
function print (root, printNode = (n) => n.key) {
  var out = [];
  row(root, '', true, (v) => out.push(v), printNode);
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
    out(`${ prefix }${ isTail ? '└── ' : '├── ' }${ printNode(root) }\n`);
    const indent = prefix + (isTail ? '    ' : '│   ');
    if (root.left)  row(root.left,  indent, false, out, printNode);
    if (root.right) row(root.right, indent, true,  out, printNode);
  }
}

/**
 * Is the tree balanced (none of the subtrees differ in height by more than 1)
 * @param  {Node}    root
 * @return {Boolean}
 */
function isBalanced(root) {
  if (root === null) return true; // If node is empty then return true

  // Get the height of left and right sub trees
  var lh = height(root.left);
  var rh = height(root.right);

  if (Math.abs(lh - rh) <= 1 &&
      isBalanced(root.left)  &&
      isBalanced(root.right)) return true;

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
