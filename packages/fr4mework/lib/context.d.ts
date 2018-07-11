import { ContextProviderVNode } from './app';
export declare type ContextProviderComponent = (...args: any[]) => ContextProviderVNode;
export declare class Context {
    private static instance;
    static getInstance(): Context;
    static createContextProvider(name?: string): ContextProviderComponent;
    clearContext(): void;
    get(propName: string): any;
    set(propName: string, value: any): void;
}
