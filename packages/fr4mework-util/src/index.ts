/**
 * Detect whether the code execute in a browser-like environnement
 */
export function inBrowser(): boolean {
    return typeof window != 'undefined' && typeof window.document != 'undefined';
}

export interface ChainedFunctionConfig {
    fn: Function;
    scope: object;
    args: Array<any> | 'arguments';
}

/**
 * Create a function that chain the invokation of the given functions
 * @param functionsConfigs Array of ChainedFunctionConfig. If a config has
 * args == 'arguments' the args recieved by the chaining function will be passed
 * @returns The chaining function
 */
export function chain(...functionsConfigs: ChainedFunctionConfig[]): () => void {
    return function () {
        let chainingFnArgs = arguments;
        functionsConfigs.forEach(function (fnCfg) {
            fnCfg.fn.apply(fnCfg.scope,
                Array.isArray(fnCfg.args)
                    ? fnCfg.args
                    : fnCfg.args == 'arguments'
                        ? chainingFnArgs
                        : null)
        });
    };
}