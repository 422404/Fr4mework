"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fr4mework_1 = require("fr4mework");
var fr4mework_util_1 = require("fr4mework-util");
var once = false;
var LocationContext = fr4mework_1.Context.createContextProvider('LocationContext');
var Router = function (_a) {
    var children = _a.children, attributes = _a.attributes;
    if (!once && fr4mework_util_1.inBrowser()) {
        installEventHandlerAndHooks();
    }
    return (fr4mework_1.v(LocationContext, { location: (attributes && attributes.location) || location.pathname }, fr4mework_1.onlyOneChild(children)));
};
exports.default = Router;
var installEventHandlerAndHooks = function () {
    window.onpopstate = fr4mework_1.scheduleRender;
    history.pushState = fr4mework_util_1.chain({ fn: history.pushState, scope: history, args: 'arguments' }, { fn: fr4mework_1.scheduleRender, scope: null, args: null });
    history.replaceState = fr4mework_util_1.chain({ fn: history.replaceState, scope: history, args: 'arguments' }, { fn: fr4mework_1.scheduleRender, scope: null, args: null });
};
