import { describe, it } from 'mocha';
import { assert }       from 'chai';

import Tree from '../index';


describe('remove', () => {

  it('should not change the size of a tree with no root', () => {
    const tree = new Tree();
    tree.remove(1);
    assert.equal(tree.size, 0);
  });

  it('should remove a single key', () => {
    const tree = new Tree();
    tree.insert(1);
    tree.remove(1);
    assert.isTrue(tree.isEmpty());
  });

  it('should take the right child if the left does not exist', () => {
    const tree = new Tree();
    tree.insert(1);
    tree.insert(2);
    tree.remove(1);
    assert.equal(tree.root.key, 2);
  });

  it('should take the left child if the right does not exist', () => {
    const tree = new Tree();
    tree.insert(2);
    tree.insert(1);
    tree.remove(2);
    assert.equal(tree.root.key, 1);
  });


  it.skip('should not break the existing pointers to nodes', () => {
    const tree = new Tree();

    const n1 = tree.insert(1);
    const n2 = tree.insert(2);
    const n3 = tree.insert(3);

    tree.remove(2);

    assert.equal(n2.key, 2);
    assert.equal(n3.key, 3);
  });

});
