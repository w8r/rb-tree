"use strict";
exports.__esModule = true;
var _1 = require("../");
function main() {
    var t = new _1["default"]();
    t.insert(5);
    t.insert(-10);
    t.insert(0);
    t.insert(33);
    t.insert(2);
    // Assert Type
    var keys = t.keys(); // [-10, 0, 2, 5, 33]
    var values = t.values();
    var size = t.size; // 5
    var min = t.min(); // -10
    var max = t.max(); // -33
    t.destroy();
    t.remove(0);
    t.size; // 4
    t.forEach(function (node, index) {
        var balanceFactor = node.balanceFactor;
        var data = node.data;
        var key = node.key;
        var left = node.left;
        var parent = node.parent;
        var right = node.right;
    });
}
function customComparator() {
    var noDuplicates = true;
    var t = new _1["default"](function (a, b) { return b - a; }, noDuplicates);
    t.insert(5);
    t.insert(-10);
    t.insert(0);
    t.insert(33);
    t.insert(2);
    // Assert Type
    var keys = t.keys(); // [33, 5, 2, 0, -10]
    var values = t.values(); // [33, 5, 2, 0, -10]
}
function bulkInsert() {
    var t = new _1["default"]();
    t.load([3, 2, -10, 20], ['C', 'B', 'A', 'D'], true);
    // Assert Type
    var keys = t.keys(); // [-10, 2, 3, 20]
    var values = t.values(); // ['A', 'B', 'C', 'D']
}
