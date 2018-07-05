"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fr4mework_util_1 = require("fr4mework-util");
function flatDeep(array) {
    return array.reduce(function (acc, val) {
        return Array.isArray(val)
            ? acc.concat(flatDeep(val))
            : acc.concat(val);
    }, []);
}
;
function constructVNode(node) {
    return typeof node == 'string' || typeof node == 'number'
        ? node
        : typeof node.type == 'function'
            ? constructVNode(node.type({
                attributes: node.attributes,
                children: node.children.filter(function (child) { return !!child; }),
                globalStore: globalStore
            }))
            : node;
}
function v(type, attributes) {
    var children = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        children[_i - 2] = arguments[_i];
    }
    return constructVNode({
        type: type,
        attributes: attributes,
        children: flatDeep(children)
    });
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
var globalStore;
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
    globalStore = (config && config.globalStore) || {};
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
    var node = constructVNode(appNode);
    if (appContainer) {
        rootElement = updateElement(node, oldAppNode, rootElement, appContainer);
        oldAppNode = node;
    }
    rendering = false;
}
function serverSideRender(rootNode, config) {
    globalStore = (config && config.globalStore) || {};
    globalStore.__fr4mework = globalStore.__fr4mework || {};
    globalStore.__fr4mework.location = globalStore.__fr4mework.location || '/';
    function stringifyElement(node) {
        var fullNode = constructVNode(node);
        if (typeof fullNode == 'string')
            return fullNode;
        if (typeof fullNode == 'number')
            return fullNode + '';
        var voidElement = isVoidElement(fullNode.type);
        if (voidElement && fullNode.children.length > 0) {
            throw "<" + fullNode.type + " /> is a void element and thus cannot have children";
        }
        var element = '<' + fullNode.type;
        for (var attributeName in fullNode.attributes) {
            if (attributeName[0] != 'o' && attributeName[1] != 'n') {
                element += ' ' + attributeName + '="' + fullNode.attributes[attributeName] + '"';
            }
        }
        if (voidElement)
            element += ' /';
        element += '>';
        if (!voidElement) {
            for (var _i = 0, _a = fullNode.children; _i < _a.length; _i++) {
                var child = _a[_i];
                element += stringifyElement(child);
            }
            element += '</' + fullNode.type + '>';
        }
        return element;
    }
    return stringifyElement(rootNode);
}
exports.serverSideRender = serverSideRender;
function vdomFromServerSideRenderedElements(rootElement) {
    function vdomifyElement(node) {
        if (!node)
            return null;
        if (node.nodeType == Node.TEXT_NODE)
            return node.nodeValue;
        var element = node;
        var forEach = Array.prototype.forEach;
        var map = Array.prototype.map;
        return {
            type: element.nodeName.toLowerCase(),
            attributes: (function (attributesMap) {
                if (attributesMap.length == 0)
                    return null;
                var attributes = {};
                forEach.call(attributesMap, function (attributeNode) { return attributes[attributeNode.nodeName] = attributeNode.nodeValue; });
                return attributes;
            })(element.attributes),
            children: map.call(element.childNodes, function (node) { return vdomifyElement(node); })
        };
    }
    return vdomifyElement(rootElement);
}
function isVoidElement(name) {
    return voidElements.includes(name);
}
function createElement(node) {
    if (typeof node == 'string') {
        return document.createTextNode(node);
    }
    else if (typeof node == 'number') {
        return document.createTextNode(node + '');
    }
    else {
        var element = document.createElement(node.type);
        for (var attributeName in node.attributes) {
            setAttribute(attributeName, node.attributes[attributeName], element);
        }
        if (isVoidElement(node.type) && node.children.length > 0) {
            throw "<" + node.type + " /> is a void element and thus cannot have children";
        }
        for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
            var child = _a[_i];
            element.appendChild(createElement(child));
        }
        return element;
    }
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
    if (typeof node != typeof oldNode
        || ((typeof node == 'string' || typeof node == 'number')
            && (typeof oldNode == 'string' || typeof oldNode == 'number')
            && node != oldNode)
        || (typeof node == 'object' && typeof oldNode == 'object'
            && node.type != oldNode.type)) {
        var newElement = createElement(node);
        if (parentElement) {
            parentElement.replaceChild(newElement, element);
        }
        return newElement;
    }
    if (typeof node == 'object' && typeof oldNode == 'object') {
        for (var attributeName in node.attributes) {
            updateAttribute(attributeName, node, oldNode, element);
        }
        var nodeChildren = node.children;
        var oldNodeChildren = oldNode.children;
        var maxLength = Math.max(nodeChildren.length, oldNodeChildren.length);
        for (var i = 0; i < maxLength; i++) {
            updateElement(nodeChildren[i], oldNodeChildren[i], element.childNodes[i], element);
        }
    }
    return element;
}
function updateAttribute(name, node, oldNode, element) {
    if (element && typeof node == 'object' && typeof oldNode == 'object') {
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
