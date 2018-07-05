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
export declare type VNode = VNodeDescriptor | string | number;
export declare function v(type: string | Function, attributes: object, ...children: VNode[]): VNodeDescriptor;
export declare function app(rootNode: VNode, config?: AppConfig): void;
export declare function scheduleRender(): void;
export declare function serverSideRender(rootNode: VNode, config?: ServerSideConfig): string;
declare global {
    namespace JSX {
        type Element = VNode;
        interface IntrinsicElement {
            [key: string]: any;
        }
    }
}
