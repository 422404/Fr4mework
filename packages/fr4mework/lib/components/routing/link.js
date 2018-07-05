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
var app_1 = require("../../app");
var Link = function (_a) {
    var attributes = _a.attributes, globalState = _a.globalState, children = _a.children;
    return (app_1.v("a", __assign({}, attributes, { "data-link": "", onclick: function (e) { return handleLinkClick(attributes.href, globalState, e); } }), children));
};
exports.default = Link;
var handleLinkClick = function (newLocation, globalState, clickEvent) {
    clickEvent.preventDefault();
    changeState(newLocation, globalState);
};
var changeState = function (newLocation, globalState) {
    if (util_1.globalStateProperlyInitialized(globalState)) {
        globalState.__fr4mework.location = newLocation;
        history.pushState(null, null, newLocation);
    }
    else {
        util_1.errorNoRouter();
    }
};
