"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var app_1 = require("../../app");
var fr4mework_util_1 = require("fr4mework-util");
var once = false;
var Router = function (_a) {
    var children = _a.children, globalState = _a.globalState;
    if (!util_1.globalStateProperlyInitialized(globalState)) {
        initGlobalState(globalState);
    }
    if (!once) {
        installHandlers(globalState);
    }
    return app_1.v("div", { "data-router": "" }, children);
};
exports.default = Router;
var initGlobalState = function (globalState) {
    globalState.__fr4mework = globalState.__fr4mework || {};
    globalState.__fr4mework.location = document.location.pathname;
};
var installHandlers = function (globalState) {
    window.onpopstate = historyStateChangeHandler.bind(null, globalState);
    history.pushState = fr4mework_util_1.chain({ fn: history.pushState, scope: history, args: 'arguments' }, { fn: historyStateChangeHandler, scope: null, args: [globalState] });
    history.replaceState = fr4mework_util_1.chain({ fn: history.replaceState, scope: history, args: 'arguments' }, { fn: historyStateChangeHandler, scope: null, args: [globalState] });
};
var historyStateChangeHandler = function (globalState) {
    globalState.__fr4mework.location = document.location.pathname;
    app_1.scheduleRender();
};
