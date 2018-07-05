"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalStoreProperlyInitialized = function (globalStore) {
    return !!globalStore.__fr4mework && !!globalStore.__fr4mework.location;
};
exports.errorNoRouter = function () {
    return console.error('You must wrap your app in a Router to get Route and Link working properly !');
};
