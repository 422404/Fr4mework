import { globalStoreProperlyInitialized, errorNoRouter } from './util'
import { VNode, v } from 'fr4mework'

let Route = ({ attributes, globalStore, children }: any): VNode => {
    if (globalStoreProperlyInitialized(globalStore)) {
        if (attributes.route && match(attributes.route, globalStore.__fr4mework.location)) {
            if (attributes.view && children.length == 0) {
                let View = attributes.view;

                return <View />;
            }

            return children.length > 0
                    ? <div data-route="">{children}</div>
                    : null;
        }
    }

    errorNoRouter();
    return null;
};
export default Route

let match = (route, location) =>
    typeof route == 'string'
        ? new RegExp(regExcape(route), 'g').test(location)
        : route instanceof RegExp
            ? route.test(location)
            : false;

let regExcape = (str) =>
    str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");