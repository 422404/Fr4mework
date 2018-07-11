/// <reference types="node/index" />
/// <reference types="../lib/index" />

import { describe, it } from 'mocha'

// we mostly use the should-style assertion checking of chai
import { should as registerShould, expect } from 'chai'
let should = registerShould();

// we use rewire for private functions testing
import rewire = require('rewire'); // do not use default import syntax, ts didn't liked it

// DOM to simulate browser env
let globallyfyJsdom = require('jsdom-global');

// import the things to be tested
import { app, serverSideRender, v } from 'fr4mework'
let RewiredRouter = rewire('../lib/router.js');
let RewiredRoute = rewire('../lib/route.js');
let RewiredLink = rewire('../lib/link.js');
import { Router as _Router, Route as _Route, Link as _Link } from '../src/index'
let Router: typeof RewiredRouter & typeof _Router = RewiredRouter.default as any; // we can use our typings
let Route: typeof RewiredRoute & typeof _Route = RewiredRoute.default as any;
let Link: typeof RewiredLink & typeof _Link = RewiredLink.default as any;

describe('<Router> component', function () {
    describe('On server', function () {
        it('should pass the given location in a context', function (done) {
            let ok = false;

            let View = ({ context }: any) => {
                if (context.location == '/hello') {
                    context.clearContext();
                    ok = true;
                }
                return null;
            };

            let App = () => (
                <Router location="/hello">
                    <View />
                </Router>
            );

            let renderedApp = serverSideRender(<App />);
            if (ok) {
                done();
            } else {
                done(new Error('Context was not passed'));
            }
        });
    });

    describe('On browser', function () {
        before(function (done) {
            this.timeout(20000);
            this.cleanup = globallyfyJsdom(undefined, { url: 'http://mock.net/hello' });
            done();
        });

        it('should retrieve the location and pass it in a context', function (done) {
            let ok = false;
            let container = document.createElement('div');
            container.setAttribute('id', 'root');
            document.body.appendChild(container);

            let View = ({ context }: any) => {
                if (context.location == '/hello') {
                    context.clearContext();
                    done();
                    return null;
                }

                done(new Error('Context was not passed'));
                return null;
            };

            let App = () => (
                <Router>
                    <View />
                </Router>
            );

            app(<App />);
        });

        after(function () {
            this.cleanup();
        });
    });
});

describe('<Route> component', function () {
    describe('route location matching', function () {
        it('should match simple string', function () {
            let match = RewiredRoute.__get__('match');

            match('/hello', '/hello').should.be.equal(true);
            match(/\/hello\d+/, '/hello1').should.be.equal(true);
        });

        it('should match string with params');
    });

    describe('route rendering', function () {
        it('should render routes accordingly to the location passed by the <Router> in the context', function () {
            let App = () => (
                <div>
                    <Route route="/world">
                        <p>World !</p>
                    </Route>
                    <Route route="/hello">
                        <p>Hello !</p>
                    </Route>
                </div>
            );

            let renderedApp = serverSideRender(
                <Router location="/hello">
                    <App />
                </Router>
            );
            renderedApp.should.be.equal(
                '<div>' +
                    '<p>Hello !</p>' +
                '</div>'
            );
            renderedApp = serverSideRender(
                <Router location="/world">
                    <App />
                </Router>
            );
            renderedApp.should.be.equal(
                '<div>' +
                    '<p>World !</p>' +
                '</div>'
            );
        });

        it('should render the component passed in the view attribute', function () {
            let Hello = () => <p>Hello !</p>;
            let World = () => <p>World !</p>;

            let App = () => (
                <div>
                    <Route route="/world" view={World} />
                    <Route route="/hello" view={Hello} />
                </div>
            );

            let renderedApp = serverSideRender(
                <Router location="/hello">
                    <App />
                </Router>
            );
            renderedApp.should.be.equal(
                '<div>' +
                    '<p>Hello !</p>' +
                '</div>'
            );
            renderedApp = serverSideRender(
                <Router location="/world">
                    <App />
                </Router>
            );
            renderedApp.should.be.equal(
                '<div>' +
                    '<p>World !</p>' +
                '</div>'
            );
        });
    });
});

describe('<Link /> component', function () {
    it('todo');
});