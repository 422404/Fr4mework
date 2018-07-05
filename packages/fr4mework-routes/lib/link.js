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
var util_1 = require("./util");
var fr4mework_1 = require("fr4mework");
var Link = function (_a) {
    var attributes = _a.attributes, globalStore = _a.globalStore, children = _a.children;
    return (fr4mework_1.v("a", __assign({}, attributes, { "data-link": "", onclick: function (e) { return handleLinkClick(attributes.href, globalStore, e); } }), children));
};
exports.default = Link;
var handleLinkClick = function (newLocation, globalStore, clickEvent) {
    clickEvent.preventDefault();
    changeState(newLocation, globalStore);
};
var changeState = function (newLocation, globalStore) {
    if (util_1.globalStoreProperlyInitialized(globalStore)) {
        globalStore.__fr4mework.location = newLocation;
        history.pushState(null, null, newLocation);
    }
    else {
        util_1.errorNoRouter();
    }
};
