import { globalStoreProperlyInitialized } from './util'
import { scheduleRender, v, VNode } from 'fr4mework'
import { chain } from 'fr4mework-util'

let once = false;

let Router = ({ children, globalStore }: any) => {
    if (!globalStoreProperlyInitialized(globalStore)) {
        initglobalStore(globalStore);
    }

    if (!once) {
        installHandlers(globalStore);
    }

    return <div data-router="">{children}</div>;
};
export default Router

let initglobalStore = (globalStore) => {
    globalStore.__fr4mework = globalStore.__fr4mework || {};
    globalStore.__fr4mework.location = document.location.pathname;
};

let installHandlers = (globalStore) => {
    window.onpopstate = historyStateChangeHandler.bind(null, globalStore);
    history.pushState = chain(
        { fn: history.pushState, scope: history, args: 'arguments' },
        { fn: historyStateChangeHandler, scope: null, args: [globalStore] }
    );
    history.replaceState = chain(
        { fn: history.replaceState, scope: history, args: 'arguments' },
        { fn: historyStateChangeHandler, scope: null, args: [globalStore] }
    );
};

let historyStateChangeHandler = (globalStore) => {
    globalStore.__fr4mework.location = document.location.pathname;
    scheduleRender();
};