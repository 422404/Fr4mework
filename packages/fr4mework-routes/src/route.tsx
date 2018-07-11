import { AbstractBaseVNode, v, onlyOneChild } from 'fr4mework'
import { errorNoRouter } from './util'

// todo: handle params on the route
let Route = ({ attributes, context, children }: any): AbstractBaseVNode => {
    if (!context) errorNoRouter();

    if (attributes.route && match(attributes.route, context.location)) {
        if (attributes.view) {
            let View = attributes.view;

            return <View />;
        }

        return onlyOneChild(children);
    }

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