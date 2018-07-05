"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var util_1 = require("./util");
var fr4mework_1 = require("fr4mework");
var fr4mework_util_1 = require("fr4mework-util");
var once = false;
var Router = function (_a) {
    var children = _a.children, globalStore = _a.globalStore;
    if (!util_1.globalStoreProperlyInitialized(globalStore)) {
        initglobalStore(globalStore);
    }
    if (!once) {
        installHandlers(globalStore);
    }
    return fr4mework_1.v("div", { "data-router": "" }, children);
};
exports.default = Router;
var initglobalStore = function (globalStore) {
    globalStore.__fr4mework = globalStore.__fr4mework || {};
    globalStore.__fr4mework.location = document.location.pathname;
};
var installHandlers = function (globalStore) {
    window.onpopstate = historyStateChangeHandler.bind(null, globalStore);
    history.pushState = fr4mework_util_1.chain({ fn: history.pushState, scope: history, args: 'arguments' }, { fn: historyStateChangeHandler, scope: null, args: [globalStore] });
    history.replaceState = fr4mework_util_1.chain({ fn: history.replaceState, scope: history, args: 'arguments' }, { fn: historyStateChangeHandler, scope: null, args: [globalStore] });
};
var historyStateChangeHandler = function (globalStore) {
    globalStore.__fr4mework.location = document.location.pathname;
    fr4mework_1.scheduleRender();
};
