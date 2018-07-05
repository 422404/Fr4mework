import { inBrowser } from 'fr4mework-util'

export interface VNodeDescriptor {
    type: string | Function;
    attributes: object;
    children: VNode[];
} 

export interface AppConfig {
    containerElementId?: string;
    globalStore?: object;
}

export interface ServerSideConfig {
    location?: string;
    globalStore?: object;
}

export type VNode = VNodeDescriptor | string | number;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat
function flatDeep(array: any[]) {
    return array.reduce((acc, val) => 
        Array.isArray(val)
            ? acc.concat(flatDeep(val))
            : acc.concat(val),
    []);
};

/**
 * If the node is a component we construct it by calling his function
 * @param node 
 */
function constructVNode(node: VNode): VNode {
    return typeof node == 'string' || typeof node == 'number'
            ? node
            : typeof node.type == 'function'
                ? constructVNode(node.type({
                      attributes: node.attributes,
                      children: node.children.filter(child => !!child),
                      globalStore: globalStore
                  }))
                : node
}

/**
 * Creates a partial virtual DOM node
 * @param type Type of the node, can be string to describe a valid html element or a function reference to
 *             describe a component
 * @param attributes Attributes of the html element or component
 * @param children Children of the node
 * @returns The constructed partial virtual node
 */
export function v(type: string | Function, attributes: object, ...children: VNode[]): VNodeDescriptor {
    return <VNodeDescriptor>constructVNode({
        type: type,
        attributes: attributes,
        children: flatDeep(children)
    });
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

let appNode: VNode;
let oldAppNode: VNode;
let rootElement: HTMLElement;
let appContainer: HTMLElement;
let rendering: boolean;
let globalStore: object;

/**
 * Creates a new application
 * @param rootNode Root virtual node of the application (i.e: "<App />" or "Fr4mework.v(App, null)")
 * @param cconfig Configuration object of the app
 */
export function app(rootNode: VNode, config?: AppConfig): void {
    if (!inBrowser()) throw 'Cannot be used in a non browser-like environment !';
    init(rootNode, config);
}

/**
 * Inits the client side app
 * Tries to create a virtual DOM from existing html elements if the page was rendered server-side
 * @param rootNode Root virtual node of the app
 * @param config Configuration object of the app
 */
function init(rootNode: VNode, config?: AppConfig): void {
    rendering = false;
    appContainer = (config && config.containerElementId 
            && document.getElementById(config.containerElementId))
            || document.getElementById('root');
    if (!appContainer) throw 'No valid container element for mount point !';
    rootElement = <HTMLElement>appContainer.childNodes[0];
    oldAppNode = vdomFromServerSideRenderedElements(rootElement);
    appNode = rootNode;
    globalStore = (config && config.globalStore) || {};

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
    let node = constructVNode(appNode);
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
export function serverSideRender(rootNode: VNode, config?: ServerSideConfig): string {
    globalStore = (config && config.globalStore) || {};

    // we init the location so routes will work
    (<any>globalStore).__fr4mework = (<any>globalStore).__fr4mework || {};
    (<any>globalStore).__fr4mework.location = (<any>globalStore).__fr4mework.location || '/';

    function stringifyElement(node: VNode): string {
        let fullNode = constructVNode(node);

        if (typeof fullNode == 'string') return fullNode;
        if (typeof fullNode == 'number') return fullNode+'';

        let voidElement = isVoidElement(<string>fullNode.type);
        if (voidElement && fullNode.children.length > 0) {
            throw `<${fullNode.type} /> is a void element and thus cannot have children`;
        }

        let element = '<' + fullNode.type;
        for (let attributeName in fullNode.attributes) {
            if (attributeName[0] != 'o' && attributeName[1] != 'n') {
                element += ' ' + attributeName + '="' + fullNode.attributes[attributeName] + '"';
            }
        }
        if (voidElement) element += ' /';
        element += '>';

        if (!voidElement) {
            for (let child of fullNode.children) {
                element += stringifyElement(child);
            }
            element += '</' + fullNode.type + '>';
        }

        return element;
    }

    return stringifyElement(rootNode);
}

/**
 * Creates a virtual node from an existing element
 * @param rootElement 
 */
function vdomFromServerSideRenderedElements(rootElement: HTMLElement): VNode {
    function vdomifyElement(node: Node): VNode {
        if (!node) return null;
        if (node.nodeType == Node.TEXT_NODE) return node.nodeValue;
        let element: HTMLElement = <HTMLElement>node;
        let forEach = Array.prototype.forEach;
        let map = Array.prototype.map;

        return {
            type: element.nodeName.toLowerCase(),
            attributes: (function (attributesMap) {
                if (attributesMap.length == 0) return null;
                let attributes = {};
                forEach.call(attributesMap,
                    attributeNode => attributes[attributeNode.nodeName] = attributeNode.nodeValue);
                return attributes;
            })(element.attributes),
            children: map.call(element.childNodes,
                node => vdomifyElement(node))
        };
    }

    return vdomifyElement(rootElement);
}

function isVoidElement(name: string): boolean {
    return voidElements.includes(name);
}

function createElement(node: VNode): HTMLElement {
    if (typeof node == 'string') {
        return <any>document.createTextNode(node);
    } else if (typeof node == 'number') {
        return <any>document.createTextNode(node+'');
    } else {
        let element = document.createElement(<string>node.type);
        for (let attributeName in node.attributes) {
            setAttribute(attributeName, node.attributes[attributeName], element);
        }

        if (isVoidElement(<string>node.type) && node.children.length > 0) {
            throw `<${node.type} /> is a void element and thus cannot have children`;
        }

        for (let child of node.children) {
            element.appendChild(createElement(child));
        }

        return element;
    }
}

function updateElement(node: VNode, oldNode: VNode, element: HTMLElement, parentElement: HTMLElement): HTMLElement {
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

    // type mismatch,one is a string, the other is a node
    if (typeof node != typeof oldNode
            // the two are strings or numbers but not with the same value
            || ((typeof node == 'string' || typeof node == 'number')
                    && (typeof oldNode == 'string' ||typeof oldNode == 'number')
                && node != oldNode)
            // node type mismatch
            || (typeof node == 'object' && typeof oldNode == 'object'
                && node.type != oldNode.type)) {
        let newElement = createElement(node);
        if (parentElement) {
            parentElement.replaceChild(newElement, element);
        }
        return newElement;
    }

    if (typeof node == 'object' && typeof oldNode == 'object') {
        // update attributes
        for (let attributeName in node.attributes) {
            updateAttribute(attributeName, node, oldNode, element);
        }

        // update children
        let nodeChildren = (<VNodeDescriptor>node).children;
        let oldNodeChildren = (<VNodeDescriptor>oldNode).children;
        let maxLength = Math.max(nodeChildren.length, oldNodeChildren.length);

        for (let i = 0; i < maxLength; i++) {
            updateElement(nodeChildren[i], oldNodeChildren[i], <HTMLElement>element.childNodes[i], element);
        }
    }

    return element;
}

function updateAttribute(name: string, node: VNode, oldNode: VNode, element: HTMLElement): void {
    if (element && typeof node == 'object' && typeof oldNode == 'object') {
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
        type Element = VNode;
        interface IntrinsicElement {
            [key: string]: any
        }
    }
}