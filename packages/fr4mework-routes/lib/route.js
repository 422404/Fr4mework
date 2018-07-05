"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var fr4mework_1 = require("fr4mework");
var Route = function (_a) {
    var attributes = _a.attributes, globalStore = _a.globalStore, children = _a.children;
    if (util_1.globalStoreProperlyInitialized(globalStore)) {
        if (attributes.route && match(attributes.route, globalStore.__fr4mework.location)) {
            if (attributes.view && children.length == 0) {
                var View = attributes.view;
                return fr4mework_1.v(View, null);
            }
            return children.length > 0
                ? fr4mework_1.v("div", { "data-route": "" }, children)
                : null;
        }
    }
    util_1.errorNoRouter();
    return null;
};
exports.default = Route;
var match = function (route, location) {
    return typeof route == 'string'
        ? new RegExp(regExcape(route), 'g').test(location)
        : route instanceof RegExp
            ? route.test(location)
            : false;
};
var regExcape = function (str) {
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};
