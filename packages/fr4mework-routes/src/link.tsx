import { AbstractBaseVNode, v } from 'fr4mework'

let Link = ({ attributes, children }: any) => (
    <a {...attributes} onclick={(e) => handleLinkClick(attributes.href, e)}>
        {children}
    </a>
);
export default Link

let handleLinkClick = (newLocation, clickEvent) => {
    clickEvent.preventDefault();
    changeState(newLocation);
};

let changeState = (newLocation) => {
    history.pushState(null, null, newLocation);
};