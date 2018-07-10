"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("./app");
var Context = (function () {
    function Context() {
    }
    Context.getInstance = function () {
        if (!Context.instance) {
            Context.instance = new Context();
        }
        return Context.instance;
    };
    Context.createContextProvider = function (name) {
        return function (_a) {
            var attributes = _a.attributes, children = _a.children;
            if (!attributes || Object.keys(attributes).length == 0) {
                throw "[context: " + (name ? name : 'anonymous') + "] You must provide one or more properties to be passed in the context !";
            }
            var ctx = Context.getInstance();
            for (var propName in attributes) {
                ctx[propName] = attributes[propName];
            }
            return app_1.v("div", { "data-context": name ? name : '' }, children);
        };
    };
    Context.clearContext = function () {
        var ctx = Context.getInstance();
        for (var propName in ctx) {
            delete ctx[propName];
        }
    };
    Context.instance = null;
    return Context;
}());
exports.Context = Context;
