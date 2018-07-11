"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fr4mework_1 = require("fr4mework");
var util_1 = require("./util");
var Route = function (_a) {
    var attributes = _a.attributes, context = _a.context, children = _a.children;
    if (!context)
        util_1.errorNoRouter();
    if (attributes.route && match(attributes.route, context.location)) {
        if (attributes.view) {
            var View = attributes.view;
            return fr4mework_1.v(View, null);
        }
        return fr4mework_1.onlyOneChild(children);
    }
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
