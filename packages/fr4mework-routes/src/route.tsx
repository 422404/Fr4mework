import { AbstractBaseVNode, v } from 'fr4mework'

let Route = ({ attributes, context, children }: any): AbstractBaseVNode => {
    if (attributes.route && match(attributes.route, context.location)) {
        if (attributes.view && children.length == 0) {
            let View = attributes.view;

            return <View />;
        }

        return <div data-route="">{children}</div>;
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