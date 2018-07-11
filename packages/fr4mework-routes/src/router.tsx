import { scheduleRender, v, AbstractBaseVNode, Context, onlyOneChild } from 'fr4mework'
import { inBrowser, chain } from 'fr4mework-util'

let once = false;
let LocationContext = Context.createContextProvider('LocationContext') as any;

let Router = ({ children, attributes }: any) => {
    if (!once && inBrowser()) {
        installEventHandlerAndHooks();
    }

    return (
        <LocationContext location={(attributes && attributes.location) || location.pathname}>
            {onlyOneChild(children)}
        </LocationContext>
    );
};
export default Router

let installEventHandlerAndHooks = () => {
    window.onpopstate = scheduleRender;
    history.pushState = chain(
        { fn: history.pushState, scope: history, args: 'arguments' },
        { fn: scheduleRender, scope: null, args: null }
    );
    history.replaceState = chain(
        { fn: history.replaceState, scope: history, args: 'arguments' },
        { fn: scheduleRender, scope: null, args: null }
    );
};