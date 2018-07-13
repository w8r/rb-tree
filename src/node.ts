import { Key, Value, Color } from './types';
import { RED, BLACK } from './colors';

export default class Node<Key, Value> {

  public color:Color = BLACK;
  public key:Key;
  public data:Value;

  public left:Node<Key,Value>;
  public right:Node<Key,Value>;
  public parent:Node<Key,Value>;

  constructor (color:Color, key?:Key, data?:Value,
    parent:Node<Key,Value> = null, left:Node<Key,Value> = null, right:Node<Key,Value> = null) {
    this.color = color;
    this.parent = parent;
    this.left = left;
    this.right = right;
    this.key = key;
    this.data = data;
  }
}
