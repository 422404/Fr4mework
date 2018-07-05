export declare function inBrowser(): boolean;
export interface ChainedFunctionConfig {
    fn: Function;
    scope: object;
    args: Array<any> | 'arguments';
}
export declare function chain(...functionsConfigs: ChainedFunctionConfig[]): () => void;
