/// <reference types="node/index" />
/// <reference types="../lib/index" />

import { describe, it } from 'mocha'

// we mostly use the should-style assertion checking of chai
import { should as registerShould, expect } from 'chai'
let should = registerShould();

// we use rewire for private functions testing
import rewire = require('rewire'); // do not use default import syntax, ts didn't liked it

// import the things to be tested
let RewiredRouter = rewire('../lib/router.js');
let RewiredRoute = rewire('../lib/route.js');
let RewiredLink = rewire('../lib/link.js');
import { Router, Route as _Route, Link } from '../src/index'
let Route: typeof RewiredRoute & typeof _Route = RewiredRoute as any; // we can use our typings

describe('Router component', function () {
    it('todo');
});

describe('Route component', function () {
    describe('route location matching', function () {
        it('should match simple string', function () {
            let match = Route.__get__('match');

            match('/hello', '/hello').should.be.equal(true);
            match(/\/hello\d+/, '/hello1').should.be.equal(true);
        });

        it('should match string with params');
    });
});

describe('Link component', function () {
    it('todo');
});