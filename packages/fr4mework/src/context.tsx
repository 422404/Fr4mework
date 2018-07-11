import { v, ContextProviderVNode } from './app'
import { onlyOneChild } from './children'

export type ContextProviderComponent = (...args: any[]) => ContextProviderVNode;

// todo : singletonify
export class Context {
    private static instance: Context = null;

    static getInstance() {
        if (!Context.instance) {
            Context.instance = new Context();
        }
        
        return Context.instance;
    }

    static createContextProvider(name?: string): ContextProviderComponent {
        let contextProviderComponent = function ({ attributes, children }: any) {
            if (!attributes || Object.keys(attributes).length == 0) {
                throw `[context: ${name ? name : 'anonymous'}] You must provide one or more properties to be passed in the context !`;
            }
    
            let ctx = Context.getInstance();
            for (let propName in attributes) {
                ctx.set(propName, attributes[propName]);
            }
    
            return onlyOneChild(children);
        } as ContextProviderComponent;

        (contextProviderComponent as any).$$isContext = true;
        return contextProviderComponent;
    }

    clearContext() {
        for (let propName in this) {
            delete this[propName];
        }
    }

    get(propName: string): any {
        return this[propName];
    }

    set(propName: string, value: any): void {
        this[propName] = value;
    }
}