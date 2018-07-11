export interface AbstractBaseVNode {
    type: string;
}
export interface AbstractElementVNode extends AbstractBaseVNode {
    attributes: object;
    children: AbstractBaseVNode[];
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
export declare function v(type: string | Function, attributes: object, ...children: any[]): AbstractBaseVNode;
export declare function app(rootNode: AbstractBaseVNode, config?: AppConfig): void;
export declare function scheduleRender(): void;
export declare function serverSideRender(rootNode: AbstractBaseVNode): string;
declare global {
    namespace JSX {
        type Element = AbstractBaseVNode;
        interface IntrinsicElement {
            [key: string]: any;
        }
    }
}
