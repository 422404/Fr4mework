export declare type ContextComponent = Function;
export declare class Context {
    private static instance;
    static getInstance(): object;
    static createContextProvider(name?: string): ContextComponent;
    static clearContext(): void;
}
