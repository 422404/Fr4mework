"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fr4mework_1 = require("fr4mework");
var Link = function (_a) {
    var attributes = _a.attributes, children = _a.children;
    return (fr4mework_1.v("a", __assign({}, attributes, { "data-link": "", onclick: function (e) { return handleLinkClick(attributes.href, e); } }), children));
};
exports.default = Link;
var handleLinkClick = function (newLocation, clickEvent) {
    clickEvent.preventDefault();
    changeState(newLocation);
};
var changeState = function (newLocation) {
    history.pushState(null, null, newLocation);
};
