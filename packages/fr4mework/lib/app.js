"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fr4mework_util_1 = require("fr4mework-util");
var context_1 = require("./context");
function flatDeep(array) {
    return array.reduce(function (acc, val) {
        return Array.isArray(val)
            ? acc.concat(flatDeep(val))
            : acc.concat(val);
    }, []);
}
;
function removeNullChildren(children) {
    return children.filter(function (child) { return !!child; });
}
function constructVNode(node) {
    if (!node)
        return null;
    if (node.type == 'text') {
        return node;
    }
    else if (node.type == 'function') {
        throw 'Nodes that are functions are only permitted in components.';
    }
    else if (node.type == 'html') {
        var constructedHtmlVNode = node;
        constructedHtmlVNode.children = removeNullChildren(constructedHtmlVNode.children.map(function (child) { return constructVNode(child); }));
        return constructedHtmlVNode;
    }
    else if (node.type == 'functionnal-component') {
        var functionnalComponentVNode = node;
        var functionnalComponent = functionnalComponentVNode.component;
        var contextBackup = {};
        for (var propName in context) {
            contextBackup[propName] = context[propName];
        }
        var constructedFunctionnalComponentVNode = functionnalComponent({
            attributes: functionnalComponentVNode.attributes,
            children: functionnalComponentVNode.children,
            context: context
        });
        var toReturn = constructVNode(constructedFunctionnalComponentVNode);
        for (var propName in contextBackup) {
            context[propName] = contextBackup[propName];
        }
        return toReturn;
    }
    return null;
}
function transformLiteralNodes(node) {
    if (typeof node == 'string' || typeof node == 'number') {
        return {
            type: 'text',
            value: node.toString()
        };
    }
    else if (typeof node == 'function') {
        return {
            type: 'function',
            fn: node
        };
    }
    return node;
}
function v(type, attributes) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    children = flatDeep(children);
    if (typeof type == 'string') {
        return {
            type: 'html',
            tag: type,
            attributes: attributes,
            children: children.map(function (child) { return transformLiteralNodes(child); })
        };
    }
    else if (typeof type == 'function') {
        return {
            type: 'functionnal-component',
            component: type,
            attributes: attributes,
            children: children.map(function (child) { return transformLiteralNodes(child); })
        };
    }
    return null;
}
exports.v = v;
var voidElements = [
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
];
var appNode;
var oldAppNode;
var rootElement;
var appContainer;
var rendering;
var context;
function app(rootNode, config) {
    if (!fr4mework_util_1.inBrowser())
        throw 'Cannot be used in a non browser-like environment !';
    init(rootNode, config);
}
exports.app = app;
function init(rootNode, config) {
    rendering = false;
    appContainer = (config && config.containerElementId
        && document.getElementById(config.containerElementId))
        || document.getElementById('root');
    if (!appContainer)
        throw 'No valid container element for mount point !';
    rootElement = appContainer.childNodes[0];
    oldAppNode = vdomFromServerSideRenderedElements(rootElement);
    appNode = rootNode;
    context = context_1.Context.getInstance();
    scheduleRender();
}
function scheduleRender() {
    if (!rendering) {
        rendering = true;
        setTimeout(render);
    }
}
exports.scheduleRender = scheduleRender;
function render() {
    context_1.Context.clearContext();
    var node = constructVNode(appNode);
    if (appContainer) {
        rootElement = updateElement(node, oldAppNode, rootElement, appContainer);
        oldAppNode = node;
    }
    rendering = false;
}
function serverSideRender(rootNode) {
    function stringifyElement(node) {
        switch (node.type) {
            case 'text':
                return node.value;
            case 'function':
            case 'functionnal-component':
                throw 'constructVNode() should have been called on the partial vdom tree !';
        }
        var htmlNode = node;
        var isVoidEl = isVoidElement(htmlNode.tag);
        if (isVoidEl && htmlNode.children.length > 0) {
            throw "<" + htmlNode.tag + " /> is a void element and thus cannot have children";
        }
        var element = '<' + htmlNode.tag;
        for (var attributeName in htmlNode.attributes) {
            if (attributeName[0] != 'o' && attributeName[1] != 'n') {
                element += ' ' + attributeName + '="' + htmlNode.attributes[attributeName] + '"';
            }
        }
        if (isVoidEl)
            element += ' /';
        element += '>';
        if (!isVoidEl) {
            for (var _i = 0, _a = htmlNode.children; _i < _a.length; _i++) {
                var child = _a[_i];
                element += stringifyElement(child);
            }
            element += '</' + htmlNode.tag + '>';
        }
        return element;
    }
    return stringifyElement(constructVNode(rootNode));
}
exports.serverSideRender = serverSideRender;
function vdomFromServerSideRenderedElements(rootElement) {
    function vdomifyElement(node) {
        if (!node)
            return null;
        if (node.nodeType == Node.TEXT_NODE) {
            return {
                type: 'text',
                value: node.nodeValue
            };
        }
        var element = node;
        var forEach = Array.prototype.forEach;
        var map = Array.prototype.map;
        function extractAttributes(attributesMap) {
            if (attributesMap.length == 0)
                return null;
            var attributes = {};
            forEach.call(attributesMap, function (attributeNode) {
                return attributes[attributeNode.nodeName] = attributeNode.nodeValue;
            });
            return attributes;
        }
        return {
            type: 'html',
            tag: element.nodeName.toLowerCase(),
            attributes: extractAttributes(element.attributes),
            children: map.call(element.childNodes, function (node) { return vdomifyElement(node); })
        };
    }
    return vdomifyElement(rootElement);
}
function isVoidElement(name) {
    return voidElements.includes(name);
}
function createElement(node) {
    switch (node.type) {
        case 'text':
            return document.createTextNode(node.value);
        case 'function':
        case 'functionnal-component':
            throw 'constructVNode() should have been called on the partial vdom tree !';
    }
    var htmlNode = node;
    var element = document.createElement(htmlNode.tag);
    for (var attributeName in htmlNode.attributes) {
        setAttribute(attributeName, htmlNode.attributes[attributeName], element);
    }
    if (isVoidElement(htmlNode.tag) && htmlNode.children.length > 0) {
        throw "<" + htmlNode.tag + " /> is a void element and thus cannot have children";
    }
    for (var _i = 0, _a = htmlNode.children; _i < _a.length; _i++) {
        var child = _a[_i];
        element.appendChild(createElement(child));
    }
    return element;
}
function updateElement(node, oldNode, element, parentElement) {
    if (!node) {
        if (element && parentElement) {
            parentElement.removeChild(element);
        }
        return null;
    }
    if (!oldNode || !element) {
        element = createElement(node);
        if (parentElement) {
            parentElement.appendChild(element);
        }
        return element;
    }
    function nodesAreDifferent(node, oldNode) {
        return (node.type != oldNode.type
            || (node.type == 'text' && oldNode.type == 'text'
                && node.value != oldNode.value)
            || (node.type == 'html' && oldNode.type == 'html'
                && node.tag != oldNode.tag));
    }
    if (nodesAreDifferent(node, oldNode)) {
        var newElement = createElement(node);
        if (parentElement) {
            parentElement.replaceChild(newElement, element);
        }
        return newElement;
    }
    if (node.type == 'html' && oldNode.type == 'html') {
        var htmlNode = node;
        for (var attributeName in htmlNode.attributes) {
            updateAttribute(attributeName, htmlNode, oldNode, element);
        }
        var nodeChildren = htmlNode.children;
        var oldNodeChildren = oldNode.children;
        var maxLength = Math.max(nodeChildren.length, oldNodeChildren.length);
        for (var i = 0; i < maxLength; i++) {
            updateElement(nodeChildren[i], oldNodeChildren[i], element.childNodes[i], element);
        }
    }
    return element;
}
function updateAttribute(name, node, oldNode, element) {
    if (element) {
        if (node.attributes[name] != oldNode.attributes[name]) {
            setAttribute(name, node.attributes[name], element);
        }
    }
}
function setAttribute(name, value, element) {
    if (element && name[0] == 'o' && name[1] == 'n') {
        element[name] = value;
    }
    else {
        element.setAttribute(name, value);
    }
}
