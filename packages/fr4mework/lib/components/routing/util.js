"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalStateProperlyInitialized = function (globalState) {
    return !!globalState.__fr4mework && !!globalState.__fr4mework.location;
};
exports.errorNoRouter = function () {
    return console.error('You must wrap your app in a Router to get Route and Link working properly !');
};
