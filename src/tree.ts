import { Key, Value, Comparator } from './types';
import { RED, BLACK } from './colors';
import Node from './node';

export type Visitor<Key,Value> = (node:Node<Key,Value>) => void;

const nil:Node<Key,Value> = new Node(BLACK);
const DEFAULT_COMPARE:Comparator<Key> = (a:any, b:any) => a - b;

export default class Tree<Key, Value> {

  private _compare:Comparator<Key> = DEFAULT_COMPARE;
  private _root:Node<Key,Value>;
  private _size:number = 0;

  static nil:Node<any,any> = nil;

  constructor(comparator:Comparator<Key> = DEFAULT_COMPARE) {
    this._compare = comparator;
    this._root = nil;
    this._size = 0;
  }


  get root () {
    return this._root;
  }


  get size () {
    return this._size;
  }


  isEmpty() {
    return this._root === nil;
  }


  find (key:Key) {
    const compare = this._compare;
    let cmp, x = this._root;
    while (x !== nil) {
      cmp = compare(key, x.key);
      if (cmp === 0)    break;
      else if (cmp < 0) x = x.left;
      else              x = x.right;
    }
    return x === nil ? null : x;
  }


  private leftRotate (x:Node<Key, Value>) {
    const y:Node<Key,Value> = x.right;
    x.right = y.left;
    if (y.left !== nil) y.left.parent = x;
    y.parent = x.parent;
    if (x.parent === nil)        this._root = y;
    else if (x === x.parent.left) x.parent.left = y;
    else                          x.parent.right = y;
    y.left = x;
    x.parent = y;
  }


  private rightRotate (x:Node<Key,Value>) {
    const y:Node<Key,Value> = x.left;
    x.left = y.right;
    if (y.right !== nil) y.right.parent = x;
    y.parent = x.parent;
    if (x.parent === nil)         this._root = y;
    else if (x === x.parent.right) x.parent.right = y;
    else                           x.parent.left = y;

    y.right = x;
    x.parent = y;
  }


  private insertFixup (x:Node<Key,Value>) {
    this._size++;
    x.color = RED;
    const root = this._root;

    while (x !== root && x.parent.color == RED) {
      if (x.parent === x.parent.parent.left) {
        const y:Node<Key,Value> = x.parent.parent.right;
        if (y.color == RED) {
          x.parent.color = BLACK;
          y.color = BLACK;
          x.parent.parent.color = RED;
          x = x.parent.parent;
        } else {
          if (x === x.parent.right) {
            x = x.parent;
            this.leftRotate(x);
          }
          x.parent.color = BLACK;
          x.parent.parent.color = RED;
          this.rightRotate(x.parent.parent);
        }
      } else {
        const y:Node<Key,Value> = x.parent.parent.left;
        if (y.color === RED) {
          x.parent.color = BLACK;
          y.color = BLACK;
          x.parent.parent.color = RED;
          x = x.parent.parent;
        } else {
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
  }


  insert (key:Key, data?:Value) {
    let y = nil;
    let x = this._root;
    let cmp = 0;
    const compare = this._compare;

    while (x !== nil) {
      y = x;
      cmp = compare(key, x.key);
      if (cmp === 0)    break;
      else if (cmp < 0) x = x.left;
      else              x = x.right;
    }

    const nz = new Node(BLACK, key, data, y, nil, nil);
    if (y === nil)   this._root = nz;
    else if (cmp < 0) y.left = nz;
    else              y.right = nz;

    this.insertFixup(nz);
    return nz;
  }


  remove (key:Key) {
    let x = this._root;
    const compare = this._compare;

    while (x !== nil) {
      let cmp = compare(key, x.key);
      if (cmp === 0)    break;
      else if (cmp < 0) x = x.left;
      else              x = x.right;
    }
    if (x === nil) return null;
    this._size--;
    return this.deleteSubtree(x);
  }


  /**
   * Removes and returns the node with smallest key
   * @return {?Node}
   */
  pop () {
    const min = this.minNode();
    if (min) this.deleteSubtree(min);
    return min;
  }


  private deleteSubtree (z:Node<Key,Value>) {
    let y:Node<Key,Value>;
    if (z.left === nil || z.right === nil) y = z; // y has a nil node as a child
    else { // find tree successor with a nil node as a child
      y = z.right;
      while (y.left !== nil) y = y.left;
    }

    // x is y's only child
    const x:Node<Key,Value> = y.left !== nil ? y.left : y.right;
    x.parent = y.parent;
    if (y.parent === nil) this._root = x;
    else {
      if (y === y.parent.left) y.parent.left = x;
      else                     y.parent.right = x;
    }
    if (y !== z) z.key = y.key;
    if (y.color === BLACK) this.deleteFixup(x);
    return z;
  }


  private deleteFixup (x:Node<Key,Value>) {
    const root = this._root;
    while (x !== root && x.color === BLACK) {
      if (x === x.parent.left) {
        let w:Node<Key,Value> = x.parent.right;
        if (w.color === RED) {
          w.color = BLACK;
          x.parent.color = RED;
          this.leftRotate(x.parent);
          w = x.parent.right;
        }
        if (w.left.color === BLACK && w.right.color === BLACK) {
          w.color = RED;
          x = x.parent;
        } else {
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
      } else {
        let w:Node<Key,Value> = x.parent.left;
        if (w.color === RED) {
          w.color = BLACK;
          x.parent.color = RED;
          this.rightRotate(x.parent);
          w = x.parent.left;
        }
        if (w.right.color === BLACK && w.left.color === BLACK) {
          w.color = RED;
          x = x.parent;
        } else {
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
  }


  max () {
    let x = this._root;
    while (x !== nil && x.right !== nil) x = x.right;
    return x === nil ? null : x.key;
  }


  min () {
    let x = this._root;
    while (x !== nil && x.left !== nil) x = x.left;
    return x === nil ? null : x.key;
  }


  /**
   * @return {Node|null}
   */
  minNode(t = this._root) {
    if (t !== nil) while (t.left !== nil) t = t.left;
    return t === nil ? null : t;
  }


  /**
   * @return {Node|null}
   */
  maxNode(t = this._root) {
    if (t !== nil) while (t.right !== nil) t = t.right;
    return t === nil ? null : t;
  }



  /**
   * @param  {Key} key
   * @return {Boolean}
   */
  contains (key:Key) {
    let current   = this._root;
    const compare = this._compare;
    while (current) {
      const cmp = compare(key, current.key);
      if (cmp === 0)    return true;
      else if (cmp < 0) current = current.left;
      else              current = current.right;
    }
    return false;
  }


  /**
   * @param  {Visitor} visitor
   * @param  {*=}      ctx
   * @return {SplayTree}
   */
  forEach (visitor:Visitor<Key,Value>, ctx?:any) {
    let current = this._root;
    const Q = [];  /* Initialize stack s */
    let done = false;

    while (!done) {
      if (current !==  nil) {
        Q.push(current);
        current = current.left;
      } else {
        if (Q.length !== 0) {
          current = Q.pop();
          visitor.call(ctx, current);

          current = current.right;
        } else done = true;
      }
    }
    return this;
  }


  /**
   * Returns node at given index
   * @param  {number} index
   * @return {?Node}
   */
  at (index:number) {
    let current = this._root, done = false, i = 0;
    const Q = [];

    while (!done) {
      if (current !== nil) {
        Q.push(current);
        current = current.left;
      } else {
        if (Q.length > 0) {
          current = Q.pop();
          if (i === index) return current;
          i++;
          current = current.right;
        } else done = true;
      }
    }
    return null;
  }


  /**
   * Walk key range from `low` to `high`. Stops if `fn` returns a value.
   * @param  {Key}      low
   * @param  {Key}      high
   * @param  {Function} fn
   * @param  {*?}       ctx
   * @return {SplayTree}
   */
  range (low:Key, high:Key, fn:Visitor<Key,Value>, ctx?:any) {
    const Q = [];
    const compare = this._compare;
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
   * Returns array of keys
   * @return {Array<Key>}
   */
  keys () {
    const keys:Array<Key> = [];
    this.forEach(({ key }) => keys.push(key));
    return keys;
  }


  /**
   * Returns array of all the data in the nodes
   * @return {Array<Value>}
   */
  values () {
    const values:Array<Value> = [];
    this.forEach(({ data }) => values.push(data));
    return values;
  }



  /**
   * @param  {Node}   d
   * @return {Node|nil}
   */
  next (d:Node<Key,Value>) {
    let root = this._root;
    let successor = nil;

    if (d.right !== nil) {
      successor = d.right;
      while (successor.left !== nil) successor = successor.left;
      return successor;
    }

    const comparator = this._compare;
    while (root !== nil) {
      const cmp = comparator(d.key, root.key);
      if (cmp === 0) break;
      else if (cmp < 0) {
        successor = root;
        root = root.left;
      } else root = root.right;
    }

    return successor === nil ? null : successor;
  }


  /**
   * @param  {Node} d
   * @return {Node|nil}
   */
  prev (d:Node<Key,Value>) {
    let root = this._root;
    let predecessor = nil;

    if (d.left !== nil) {
      predecessor = d.left;
      while (predecessor.right !== nil) predecessor = predecessor.right;
      return predecessor;
    }

    const comparator = this._compare;
    while (root !== nil) {
      const cmp = comparator(d.key, root.key);
      if (cmp === 0) break;
      else if (cmp < 0) root = root.left;
      else {
        predecessor = root;
        root = root.right;
      }
    }
    return predecessor === nil ? null : predecessor;
  }

  clear () {
    this._root = nil;
    this._size = 0;
    return this;
  }
}
