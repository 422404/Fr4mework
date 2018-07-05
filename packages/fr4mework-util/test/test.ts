/// <reference types="node/index" />
/// <reference types="../lib/index" />

import { describe, it } from 'mocha'
import rewire = require('rewire');
import { should as registerShould } from 'chai'
let should = registerShould();

let Fr4meworkUtil = rewire('../lib/index');
let inBrowser = Fr4meworkUtil.inBrowser;
let chain = Fr4meworkUtil.chain;

describe('inBrowser()', function () {
    it('should return false when no window object in global scope', function () {
        let browser = inBrowser();
        browser.should.be.false;
    });

    it('should return true when window object in global scope', function () {
        (<any>global).window = { document: {} }; // mock

        let browser = inBrowser();
        browser.should.be.true;
    });

    after(function () {
        delete (<any>global).window;
    });
});

describe('chain()', function () {
    it('should print "hello" then "world!" then call the function done()', function (done) {
        let toPrint = '';
        let printHello = () => toPrint += 'hello ';
        let printWorld = () => toPrint += 'world!';
        let _done = () => done(toPrint == 'hello world!' ? undefined : new Error('error!'));

        let chainingFn = chain(
            { fn: printHello, scope: this, args: null },
            { fn: printWorld, scope: this, args: null },
            { fn: _done, scope: this, args: null }
        );

        chainingFn();
    });

    it('should pass the arguments of the chaining function to the second one in the array', function (done) {
        let ok = true;
        let first = (arg0, arg1) => ok = ok && arg0 == arg1 && arg0 == 'wow';
        let second = (arg) => ok = ok && arg[0] == 'amazing';
        let _done = () => done(ok ? undefined : new Error('error!'));

        let chainingFn = chain(
            { fn: first, scope: this, args: ['wow', 'wow'] },
            { fn: second, scope: this, args: 'arguments' },
            { fn: _done, scope: this, args: null }
        );

        chainingFn(['amazing']);
    });
});