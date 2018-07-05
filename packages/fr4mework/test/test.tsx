/// <reference types="node/index" />
/// <reference types="../lib/app" />

import { describe, it } from 'mocha'

// we mostly use the should-style assertion checking of chai
import { should as registerShould, expect } from 'chai'
let should = registerShould();

// we use rewire for private functions testing
import rewire = require('rewire'); // do not use default import syntax, ts didn't liked it

// DOM to simulate browser env
let globallyfyJsdom = require('jsdom-global');

// import the things to be tested
let Fr4mework = rewire('../lib/app.js');
let constructVNode = Fr4mework.__get__('constructVNode');
let { serverSideRender, v } = Fr4mework;
let createElement = Fr4mework.__get__('createElement');
let updateElement = Fr4mework.__get__('updateElement');
let vdomFromServerSideRenderedElements = Fr4mework.__get__('vdomFromServerSideRenderedElements');

describe('v()', function () {
    let wantedTree = { 
        type: 'a',
        attributes: null,
        children: [
            {
                type: 'div',
                attributes: {
                    class: 'hello',
                    id: 'id'
                },
                children: [
                    'Helloworld !'
                ]
            }
        ]
    };

    let component = (
        <a>
            <div id="id" class={"hello"}>
            Helloworld !
            </div>
        </a>
    );
    
    it('should return correct partial virtual dom node', function () {
        component.should.be.deep.equal(wantedTree);
    });
});

describe('constructVNode()', function () {
    let App = () => <p>Hello</p>;
    let OtherApp = () => <p>Hello</p>;
    let AnotherApp = () => <OtherApp />;

    it('should exec the function that is the type of a node and treat its result as the real node', function () {
        let appTree = constructVNode({ type: App, attributes: null, children: [] });
        let otherAppTree = constructVNode({ type: OtherApp, attributes: null, children: [] });
        let anotherAppTree = constructVNode({ type: AnotherApp, attributes: null, children: [] });

        appTree.should.be.deep.equal(otherAppTree);
        appTree.should.be.deep.equal(anotherAppTree);
    });
});

describe('createElement()', function () {
    before(function (done) { // we create the globals needed as it should execute in browser env
        this.cleanupJsdomGlobals = globallyfyJsdom();
        done();
    });
    
    describe('when a string or number is supplied', function () {
        it('should create text node', function () {
            let textValue = 'helloworld !';
            let textValue2 = 2;
            let textNode: Text = createElement(textValue);
            let textNode2: Text = createElement(textValue2);
    
            textNode.nodeType.should.be.equal(Node.TEXT_NODE);
            textNode.nodeValue.should.be.equal(textValue);
            textNode2.nodeType.should.be.equal(Node.TEXT_NODE);
            textNode2.nodeValue.should.be.equal(textValue2+'');
        });
    });

    describe('when a virtual dom node is supplied', function () {
        it('should create a HTMLElement', function () {
            let element: HTMLElement = createElement(<hr />);

            element.nodeType.should.be.equal(Node.ELEMENT_NODE);
            element.nodeName.toLowerCase().should.be.equal('hr');
        });

        it('should create the children if the vdom node has some', function () {
            let element: HTMLElement = createElement(
                <div>
                    <hr />
                    <br />
                </div>
            );

            element.nodeType.should.be.equal(Node.ELEMENT_NODE);
            element.nodeName.toLowerCase().should.be.equal('div');
            element.childNodes[0].nodeName.toLowerCase().should.be.equal('hr');
            element.childNodes[1].nodeName.toLowerCase().should.be.equal('br');
        });

        it('should add attributes to the HTMLElement', function () {
            let element: HTMLElement = createElement(
                <input type="text" class="hello world" />
            );

            element.getAttribute('type').should.be.equal('text');
            element.classList[0].should.be.equal('hello');
            element.classList[1].should.be.equal('world');
        });

        it('should treat attributes beginning with "on" as event handlers', function (done) {
            let clickHandler = () => done();

            let element: HTMLElement = createElement(
                <div onclick={clickHandler} />
            );

            element.onclick.should.be.equal(clickHandler);
            element.click();
        });

        it('should throw an error if children are added to void elements', function () {
            let thrown = true;
            try {
                let element = createElement(
                    <hr><br /></hr>
                );
                thrown = false;
            } catch (e) {}

            if (!thrown) throw 'should have thrown an error ...';
        });
    });

    after(function (done) { // we clean global scope
        this.cleanupJsdomGlobals();
        done();
    });
});

describe('updateElement()', function () {
    before(function (done) {
        this.cleanupJsdomGlobals = globallyfyJsdom();
        done();
    });

    it('should create a HTMLElement if there was none before', function () {
        let container = document.createElement('div');
        let node = <hr />;
        let oldNode = null;
        let element = null;

        container.hasChildNodes().should.be.false;
        updateElement(node, oldNode, element, container);
        container.hasChildNodes().should.be.true;
        container.childNodes.length.should.be.equal(1);
        container.childNodes[0].nodeName.toLowerCase().should.be.equal('hr');
    });

    it('should remove a HTMLElement if there is no more', function () {
        let container: HTMLElement = createElement(
            <div>
                <hr />
            </div>
        );
        let element = container.childNodes[0];
        let node = null;
        let oldNode = <hr />;

        container.hasChildNodes().should.be.true;
        container.childNodes[0].nodeName.toLowerCase().should.be.equal('hr');
        updateElement(node, oldNode, element, container);
        container.hasChildNodes().should.be.false;
    });

    it('should remove and create a HTMLElement if the old node and the new node are not of the same type', function () {
        let container: HTMLElement = createElement(
            <div>
                <hr />
                hello
            </div>
        );
        let element = container.childNodes[0];
        let element2 = container.childNodes[1];

        let node = <br />;
        let oldNode = <hr />;
        let node2 = <a></a>;
        let oldNode2 = 'hello';

        // ELEMENT_NODE -> ELEMENT_NODE
        container.childNodes[0].nodeName.toLowerCase().should.be.equal('hr');
        updateElement(node, oldNode, element, container);
        container.childNodes[0].nodeName.toLowerCase().should.be.equal('br');

        // TEXT_NODE -> ELEMENT_NODE
        container.childNodes[1].nodeType.should.be.equal(Node.TEXT_NODE);
        updateElement(node2, oldNode2, element2, container);
        container.childNodes[1].nodeType.should.be.equal(Node.ELEMENT_NODE);
        container.childNodes[1].nodeName.toLowerCase().should.be.equal('a');
    });

    it('should update a HTMLElement\'s attributes if some attributes values have changed', function () {
        let container: HTMLElement = createElement(
            <div>
                <a href="www.choualbox.com/"  class="red"  id="link" />
            </div>
        );
        let element = container.childNodes[0];
        let node = <a href="www.gbatemp.net/"  class="blue"  id="link" />;
        let oldNode = <a href="www.choualbox.com/"  class="red"  id="link" />;

        (container.childNodes[0] as HTMLElement).getAttribute('href').should.be.equal('www.choualbox.com/');
        (container.childNodes[0] as HTMLElement).classList[0].should.be.equal('red');
        (container.childNodes[0] as HTMLElement).getAttribute('id').should.be.equal('link');
        updateElement(node, oldNode, element, container);
        (container.childNodes[0] as HTMLElement).getAttribute('href').should.be.equal('www.gbatemp.net/');
        (container.childNodes[0] as HTMLElement).classList[0].should.be.equal('blue');
        (container.childNodes[0] as HTMLElement).getAttribute('id').should.be.equal('link');
    });

    it('should update the HTMLElement\'s children aswell', function () {
        let Hello = ({attributes, children}: any) => <div>{attributes.hello}</div>;
        let Hi = ({attributes, children}: any) => attributes.toggle
                ? <div>
                      <ul>
                          <li>Hi !</li>
                          <li>Wasup ?</li>
                      </ul>
                      <a href="http://www.exemple.com">Super link !</a>
                  </div>
                : <div>
                      <ul>
                          <li>Hi !</li>
                          <li>how are you !</li>
                          <li>one more</li>
                      </ul>
                      <input type="text" value="type something" />
                  </div>;

        let container: HTMLElement = createElement(
            <div>
                <Hello hello="Hello to you !" />
                <Hi toggle={true} />
            </div>
        );

        let element = container.childNodes[0];
        let element2 = container.childNodes[1];

        let node = <Hello hello="Hello to all of you !" />;
        let oldNode = <Hello hello="Hello to you !" />;

        let node2 = <Hi toggle={false} />;
        let oldNode2 = <Hi toggle={true} />;

        (container.childNodes[0] as HTMLElement).innerHTML.should.be.equal('Hello to you !');
        container.childNodes[1].childNodes[0].childNodes.length.should.be.equal(2);
        (container.childNodes[1].childNodes[0].childNodes[0] as HTMLElement).innerHTML.should.be.equal('Hi !');
        (container.childNodes[1].childNodes[0].childNodes[1] as HTMLElement).innerHTML.should.be.equal('Wasup ?');
        container.childNodes[1].childNodes[1].nodeName.toLowerCase().should.be.equal('a');

        updateElement(node, oldNode, element, container);
        updateElement(node2, oldNode2, element2, container);

        (container.childNodes[0] as HTMLElement).innerHTML.should.be.equal('Hello to all of you !');
        container.childNodes[1].childNodes[0].childNodes.length.should.be.equal(3);
        (container.childNodes[1].childNodes[0].childNodes[0] as HTMLElement).innerHTML.should.be.equal('Hi !');
        (container.childNodes[1].childNodes[0].childNodes[1] as HTMLElement).innerHTML.should.be.equal('how are you !');
        (container.childNodes[1].childNodes[0].childNodes[2] as HTMLElement).innerHTML.should.be.equal('one more');
        container.childNodes[1].childNodes[1].nodeName.toLowerCase().should.be.equal('input');
    });

    after(function (done) {
        this.cleanupJsdomGlobals();
        done();
    });
});

describe('serverSideRender()', function () {
    it ('should return the right stringified app', function () {
        let Hello = ({ children }: any) => (
            <ul>
                {children.map(child => <li>{child}</li>)}
            </ul>
        );
        let App = () => (
            <div id="app-root">
                Wow much app, so computer, such skills
                <input class="hello" type="button" onclick={() => undefined} />
                <Hello>
                    <h1>Hey !</h1>
                    <h2>Yo !</h2>
                    <h3>Wow !</h3>
                </Hello>
            </div>
        );
        let stringifiedApp = serverSideRender(<App />);

        stringifiedApp.should.be.equal(
            '<div id="app-root">' +
                'Wow much app, so computer, such skills' +
                '<input class="hello" type="button" />' +
                '<ul>' +
                    '<li><h1>Hey !</h1></li>' +
                    '<li><h2>Yo !</h2></li>' +
                    '<li><h3>Wow !</h3></li>' +
                '</ul>' +
            '</div>'
        );
    });

    it('should throw an error if children are added to void elements', function () {
        let thrown = true;
        let App = () => (
            <input>hello</input>
        );

        try {
            serverSideRender(<App />);
            thrown = false;
        } catch (e) {}

        if (!thrown) throw 'should have thrown an error ...';
    });
});

describe('vdomFromServerSideRenderedElements()', function () {
    it('should build vdom from one simple element', function () {
        let vdom = <input />;
        let renderedVdom = serverSideRender(vdom);
        let cleanup = globallyfyJsdom('<div id="root">' + renderedVdom + '</div>');
        let rootElement = document.getElementById('root').childNodes[0] as HTMLElement;
        let rehydratedVdom = vdomFromServerSideRenderedElements(rootElement);

        rehydratedVdom.should.be.deep.equal(vdom);

        cleanup();
    });

    it('dhould build vdom from one element with attributes', function () {
        let vdom = <input type="text" class="hello world" />;
        let renderedVdom = serverSideRender(vdom);
        let cleanup = globallyfyJsdom('<div id="root">' + renderedVdom + '</div>');
        let rootElement = document.getElementById('root').childNodes[0] as HTMLElement;
        let rehydratedVdom = vdomFromServerSideRenderedElements(rootElement);

        rehydratedVdom.should.be.deep.equal(vdom);

        cleanup();
    });

    it('should build vdom from many elements', function () {
        let vdom = (
            <div id="hello">
                <input type="text" class="world" value="w0w.png" />
                <ul>
                    <li>Hello</li>
                    <li>world</li>
                    <li>!</li>
                    <li></li>
                </ul>
                <p style="color: blue; font-size: 20px;">Wow !</p>
                <div id="emptyDiv"></div>
                <hr class="georgous-hr" />
            </div>
        );
        let renderedVdom = serverSideRender(vdom);
        let cleanup = globallyfyJsdom('<div id="root">' + renderedVdom + '</div>');
        let rootElement = document.getElementById('root').childNodes[0] as HTMLElement;
        let rehydratedVdom = vdomFromServerSideRenderedElements(rootElement);

        rehydratedVdom.should.be.deep.equal(vdom);

        cleanup();
    });
});