"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function onlyOneChild(children) {
    if (children.length != 1) {
        throw 'This component only accept one child !';
    }
    return children[0];
}
exports.onlyOneChild = onlyOneChild;
