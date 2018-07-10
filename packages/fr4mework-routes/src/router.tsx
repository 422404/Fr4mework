import { scheduleRender, v, AbstractBaseVNode, Context } from 'fr4mework'
import { inBrowser, chain } from 'fr4mework-util'

let once = false;
let LocationContext = Context.createContextProvider('LocationContext') as any;

let Router = ({ children, attributes }: any) => {
    if (!once && inBrowser()) {
        installHandlers();
    }

    return (
        <div data-router="">
            <LocationContext location={attributes.location || location.pathname}>
                {children}
            </LocationContext>
        </div>
    );
};
export default Router

let installHandlers = () => {
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