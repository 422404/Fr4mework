"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var children_1 = require("./children");
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
        var contextProviderComponent = function (_a) {
            var attributes = _a.attributes, children = _a.children;
            if (!attributes || Object.keys(attributes).length == 0) {
                throw "[context: " + (name ? name : 'anonymous') + "] You must provide one or more properties to be passed in the context !";
            }
            var ctx = Context.getInstance();
            for (var propName in attributes) {
                ctx.set(propName, attributes[propName]);
            }
            return children_1.onlyOneChild(children);
        };
        contextProviderComponent.$$isContext = true;
        return contextProviderComponent;
    };
    Context.prototype.clearContext = function () {
        for (var propName in this) {
            delete this[propName];
        }
    };
    Context.prototype.get = function (propName) {
        return this[propName];
    };
    Context.prototype.set = function (propName, value) {
        this[propName] = value;
    };
    Context.instance = null;
    return Context;
}());
exports.Context = Context;
