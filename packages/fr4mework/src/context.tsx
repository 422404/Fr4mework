import { v } from './app'

export type ContextComponent = Function;

// todo : singletonify
export class Context {
    private static instance: object = null;

    static getInstance() {
        if (!Context.instance) {
            Context.instance = new Context();
        }
        
        return Context.instance;
    }

    static createContextProvider(name?: string): ContextComponent {
        return function ({ attributes, children }: any) {
            if (!attributes || Object.keys(attributes).length == 0) {
                throw `[context: ${name ? name : 'anonymous'}] You must provide one or more properties to be passed in the context !`;
            }
    
            let ctx = Context.getInstance();
            for (let propName in attributes) {
                ctx[propName] = attributes[propName];
            }
    
            return <div data-context={name ? name : ''}>{children}</div>;
        };
    }

    static clearContext() {
        let ctx = Context.getInstance();
        for (let propName in ctx) {
            delete ctx[propName];
        }
    }
}