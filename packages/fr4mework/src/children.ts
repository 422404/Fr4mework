import { AbstractBaseVNode } from './app'

export function onlyOneChild(children: AbstractBaseVNode[]): AbstractBaseVNode {
    if (children.length != 1) {
        throw 'This component only accept one child !';
    }

    return children[0];
}