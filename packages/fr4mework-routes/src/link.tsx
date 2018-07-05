import { globalStoreProperlyInitialized, errorNoRouter } from './util'
import { VNode, v } from 'fr4mework'

let Link = ({ attributes, globalStore, children }: any) => (
    <a {...attributes} data-link="" onclick={(e) => handleLinkClick(attributes.href, globalStore, e)}>
        {children}
    </a>
);
export default Link

let handleLinkClick = (newLocation, globalStore, clickEvent) => {
    clickEvent.preventDefault();
    changeState(newLocation, globalStore);
};

let changeState = (newLocation, globalStore) => {
    if (globalStoreProperlyInitialized(globalStore)) {
        globalStore.__fr4mework.location = newLocation;
        history.pushState(null, null, newLocation);
    } else {
        errorNoRouter();
    }
};