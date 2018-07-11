import { inBrowser } from 'fr4mework-util'
import { Context } from './context'

export interface AbstractBaseVNode {
    type: string;
}

export interface AbstractElementVNode extends AbstractBaseVNode {
    attributes: object;
    children: AbstractBaseVNode[]
}

export interface FunctionnalVNode extends AbstractBaseVNode {
    type: 'function';
    fn: Function;
}

export interface TextVNode extends AbstractBaseVNode {
    type: 'text';
    value: string;
}

export interface HTMLElementVNode extends AbstractElementVNode {
    type: 'html';
    tag: string;
}

export interface FunctionnalComponentVNode extends AbstractElementVNode {
    type: 'functionnal-component';
    component: Function;
}

export interface ContextProviderVNode extends AbstractElementVNode {
    type: 'context-provider';
    providerFn: Function;
}

export interface AppConfig {
    containerElementId?: string;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
function flatDeep(array: any[]) {
    return array.reduce((acc, val) => 
        Array.isArray(val)
            ? acc.concat(flatDeep(val))
            : acc.concat(val),
    []);
};

function removeNullChildren(children: any[]): AbstractBaseVNode[] {
    return children.filter(child => !!child);
}

function constructVDOM(root: AbstractBaseVNode): AbstractBaseVNode {
    return constructVNode(root);
}

/**
 * If the node is a component we construct it by calling his function
 * @param node 
 */
function constructVNode(node: AbstractBaseVNode): AbstractBaseVNode {
    if (!node) return null;

    if (node.type == 'text') {
        return node;
    } else if (node.type == 'function') {
        throw 'Nodes that are functions are only permitted in components.';
    } else if (node.type == 'html') {
        let constructedHtmlVNode = <HTMLElementVNode>node;
        constructedHtmlVNode.children = removeNullChildren(
            constructedHtmlVNode.children.map(child => constructVNode(child))
        );

        return constructedHtmlVNode;
    } else if (node.type == 'functionnal-component') {
        let functionnalComponentVNode = <FunctionnalComponentVNode>node;
        let functionnalComponent = functionnalComponentVNode.component;
        
        let constructedComponentVNode = functionnalComponent({
            attributes: functionnalComponentVNode.attributes,
            children: functionnalComponentVNode.children,
            context: context
        });

        return constructVNode(constructedComponentVNode);
    } else if (node.type == 'context-provider') {
        let contextProviderVNode = <ContextProviderVNode>node;
        let contextBackup = {}; // used to revert context after the component
                                // has potentially modified it
        for (let propName in contextProviderVNode.attributes) {
            contextBackup[propName] = context.get(propName);
        }
        let child = contextProviderVNode.providerFn({
                attributes: contextProviderVNode.attributes,
                children: contextProviderVNode.children
        });
        let constructedChild = constructVNode(child);
        for (let propName in contextBackup) {
            context.set(propName, contextBackup[propName]);
        }

        return constructedChild;
    }

    return null;
}

function transformLiteralNodes(node: string | Function): AbstractBaseVNode {
    if (typeof node == 'string' || typeof node == 'number') {
        return <TextVNode>{
            type: 'text',
            value: node.toString()
        };
    } else if (typeof node == 'function') {
        return <FunctionnalVNode>{
            type: 'function',
            fn: node
        };
    }

    return node;
}

/**
 * Creates a partial virtual DOM node
 * @param type Type of the node, can be string to describe a valid html element or a function reference to
 *             describe a component
 * @param attributes Attributes of the html element or component
 * @param children Children of the node
 * @returns The constructed partial virtual node
 */
export function v(type: string | Function, attributes: object, ...children: any[]): AbstractBaseVNode {
    children = flatDeep(children);

    // todo: refactor ... hell that's ugly as f***
    if (typeof type == 'string') {
        return <HTMLElementVNode>{
            type: 'html',
            tag: type,
            attributes: attributes,
            children: children.map(child => transformLiteralNodes(child))
        };
    } else if (typeof type == 'function' && (<any>type).$$isContext) {
        return <ContextProviderVNode>{
            type: 'context-provider',
            providerFn: type,
            attributes: attributes,
            children: children.map(child => transformLiteralNodes(child))
        };
    } else if (typeof type == 'function') {
        return <FunctionnalComponentVNode>{
            type: 'functionnal-component',
            component: type,
            attributes: attributes,
            children: children.map(child => transformLiteralNodes(child))
        };
    }

    return null;
}

let voidElements: string[] = [
    'area',
    'base',
    'basefont',
    'bgsound',
    'br',
    'col',
    'command',
    'embed',
    'frame',
    'hr',
    'image',
    'img',
    'input',
    'isindex',
    'keygen',
    'link',
    'menuitem',
    'meta',
    'nextid',
    'param',
    'source',
    'track',
    'wbr'
]

let appNode: AbstractBaseVNode;
let oldAppNode: AbstractBaseVNode;
let rootElement: HTMLElement;
let appContainer: HTMLElement;
let rendering: boolean;
let context: Context;

/**
 * Creates a new application
 * @param rootNode Root virtual node of the application (i.e: "<App />" or "v(App, null)")
 * @param cconfig Configuration object of the app
 */
export function app(rootNode: AbstractBaseVNode, config?: AppConfig): void {
    if (!inBrowser()) throw 'Cannot be used in a non browser-like environment !';
    init(rootNode, config);
}

/**
 * Inits the client side app
 * Tries to create a virtual DOM from existing html elements if the page was rendered server-side
 * @param rootNode Root virtual node of the app
 * @param config Configuration object of the app
 */
function init(rootNode: AbstractBaseVNode, config?: AppConfig): void {
    rendering = false;
    appContainer = (config && config.containerElementId 
            && document.getElementById(config.containerElementId))
            || document.getElementById('root');
    if (!appContainer) throw 'No valid container element for mount point !';
    rootElement = <HTMLElement>appContainer.childNodes[0];
    oldAppNode = vdomFromServerSideRenderedElements(rootElement);
    appNode = rootNode;
    context = Context.getInstance();

    scheduleRender();
}

/**
 * Schedule a render
 */
export function scheduleRender(): void {
    if (!rendering) {
        rendering = true;
        setTimeout(render);
    }
}

/**
 * Creates a full virtual DOM and compare it with the old one, then it updates the real DOM
 */
function render(): void {
    context.clearContext();
    let node = constructVDOM(appNode);
    if (appContainer) {
        rootElement = updateElement(node, oldAppNode, rootElement, appContainer);
        oldAppNode = node;
    }
    rendering = false;
}

/**
 * Render the app server-side
 * The app's virtual DOM is outputed as html
 * @param rootNode Root virtual node of the app
 */
export function serverSideRender(rootNode: AbstractBaseVNode): string {
    context = Context.getInstance();
    
    function stringifyElement(node: AbstractBaseVNode): string {
        if (!node) return '';
        
        switch (node.type) {
            case 'text':
                return (<TextVNode>node).value;
            
            case 'function':
            case 'functionnal-component':
                throw 'constructVNode() should have been called on the partial vdom tree !';
        }

        // node.type == 'html
        let htmlNode = <HTMLElementVNode>node;
        let isVoidEl = isVoidElement(htmlNode.tag);
        if (isVoidEl && htmlNode.children.length > 0) {
            throw `<${htmlNode.tag} /> is a void element and thus cannot have children`;
        }

        let element = '<' + htmlNode.tag;
        for (let attributeName in htmlNode.attributes) {
            if (attributeName[0] != 'o' && attributeName[1] != 'n') {
                element += ' ' + attributeName + '="' + htmlNode.attributes[attributeName] + '"';
            }
        }
        if (isVoidEl) element += ' /';
        element += '>';

        if (!isVoidEl) {
            for (let child of htmlNode.children) {
                element += stringifyElement(child);
            }
            element += '</' + htmlNode.tag + '>';
        }

        return element;
    }

    return stringifyElement(constructVDOM(rootNode));
}

/**
 * Creates a virtual node from an existing element
 * @param rootElement 
 */
function vdomFromServerSideRenderedElements(rootElement: HTMLElement): AbstractBaseVNode {
    function vdomifyElement(node: Node): AbstractBaseVNode {
        if (!node) return null;
        if (node.nodeType == Node.TEXT_NODE) {
            return <TextVNode>{
                type: 'text',
                value: node.nodeValue
            };
        }
        let element: HTMLElement = <HTMLElement>node;
        let forEach = Array.prototype.forEach;
        let map = Array.prototype.map;

        function extractAttributes(attributesMap: NamedNodeMap): object {
            if (attributesMap.length == 0) return null;

            let attributes = {};
            forEach.call(attributesMap, attributeNode =>
                attributes[attributeNode.nodeName] = attributeNode.nodeValue);
            
            return attributes;
        }

        return <HTMLElementVNode>{
            type: 'html',
            tag: element.nodeName.toLowerCase(),
            attributes: extractAttributes(element.attributes),
            children: map.call(element.childNodes, node => vdomifyElement(node))
        };
    }

    return vdomifyElement(rootElement);
}

function isVoidElement(name: string): boolean {
    return voidElements.includes(name);
}

function createElement(node: AbstractBaseVNode): HTMLElement {
    switch (node.type) {
        case 'text':
            return <any>document.createTextNode((<TextVNode>node).value);
        
        case 'function':
        case 'functionnal-component':
            throw 'constructVNode() should have been called on the partial vdom tree !';
    }

    // node.type == 'html'
    let htmlNode = <HTMLElementVNode>node;
    let element = document.createElement(htmlNode.tag);
    for (let attributeName in htmlNode.attributes) {
        setAttribute(attributeName, htmlNode.attributes[attributeName], element);
    }

    if (isVoidElement(htmlNode.tag) && htmlNode.children.length > 0) {
        throw `<${htmlNode.tag} /> is a void element and thus cannot have children`;
    }

    for (let child of htmlNode.children) {
        element.appendChild(createElement(child));
    }

    return element;
}

function updateElement(node: AbstractBaseVNode, oldNode: AbstractBaseVNode, element: HTMLElement, parentElement: HTMLElement): HTMLElement {
    // the node is not available in the new virtual dom, it must be removed
    if (!node) {
        if (element && parentElement) {
            parentElement.removeChild(element);
        }
        return null;
    }

    // the node is new, it must be created
    if (!oldNode || !element) {
        element = createElement(node);
        if (parentElement) {
            parentElement.appendChild(element);
        }
        return element;
    }

    function nodesAreDifferent(node: AbstractBaseVNode, oldNode: AbstractBaseVNode): boolean {
        return (
            // node type mismatch (ex: 'html' != 'text')
            node.type != oldNode.type
            // the two nodes are text nodes but their value is different
            || (node.type == 'text' && oldNode.type == 'text'
                && (<TextVNode>node).value != (<TextVNode>oldNode).value)
            // the two nodes are html nodes but different elements
            || (node.type == 'html' && oldNode.type == 'html'
                && (<HTMLElementVNode>node).tag != (<HTMLElementVNode>oldNode).tag)
        );
    }

    // type mismatch,one is a string, the other is a node
    if (nodesAreDifferent(node, oldNode)) {
        let newElement = createElement(node);
        if (parentElement) {
            parentElement.replaceChild(newElement, element);
        }
        return newElement;
    }

    if (node.type == 'html' && oldNode.type == 'html') {
        let htmlNode = <HTMLElementVNode>node;

        // update attributes
        for (let attributeName in htmlNode.attributes) {
            updateAttribute(attributeName, htmlNode, <HTMLElementVNode>oldNode, element);
        }

        // update children
        let nodeChildren = htmlNode.children;
        let oldNodeChildren = (<HTMLElementVNode>oldNode).children;
        let maxLength = Math.max(nodeChildren.length, oldNodeChildren.length);

        for (let i = 0; i < maxLength; i++) {
            updateElement(nodeChildren[i], oldNodeChildren[i], <HTMLElement>element.childNodes[i], element);
        }
    }

    return element;
}

function updateAttribute(name: string, node: HTMLElementVNode, oldNode: HTMLElementVNode, element: HTMLElement): void {
    if (element) {
        if (node.attributes[name] != oldNode.attributes[name]) {
            setAttribute(name, node.attributes[name], element);
        }
    }
}

function setAttribute(name: string, value: any, element: HTMLElement): void {
    if (element && name[0] == 'o' && name[1] == 'n') {
        element[name] = value;
    } else {
        element.setAttribute(name, value);
    }
}

declare global {
    namespace JSX {
        type Element = AbstractBaseVNode;
        interface IntrinsicElement {
            [key: string]: any
        }
    }
}