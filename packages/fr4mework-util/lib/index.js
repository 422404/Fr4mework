"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function inBrowser() {
    return typeof window != 'undefined' && typeof window.document != 'undefined';
}
exports.inBrowser = inBrowser;
function chain() {
    var functionsConfigs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        functionsConfigs[_i] = arguments[_i];
    }
    return function () {
        var chainingFnArgs = arguments;
        functionsConfigs.forEach(function (fnCfg) {
            fnCfg.fn.apply(fnCfg.scope, Array.isArray(fnCfg.args)
                ? fnCfg.args
                : fnCfg.args == 'arguments'
                    ? chainingFnArgs
                    : null);
        });
    };
}
exports.chain = chain;
