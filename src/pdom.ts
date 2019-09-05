// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS203: Remove `|| {}` from converted for-own loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let attr_members_of_pdom, attrKey, clonePdom, constraintAttrs, externalPositioningAttrs, find_pdom_where, flattenedPdom, foreachPdom, htmlAttrsForPdom, mapPdom, media_query_attrs, nonDynamicableAttrs, pdom_tag_is_component, pureMapPdom, serialize_pdom, specialDivAttrs, specialVPdomAttrs, styleForDiv, styleMembersOfPdom, walkPdom;
import _ from 'underscore';
import _l from 'lodash';
import Block from './block';
import Dynamic from './dynamic';
import { Font } from './fonts';
import { isExternalComponent } from './libraries';
const defaultExport = {};

/*
Pdom:
a simplified but almost one-to-one representation of the DOM

Each Pdom object dictionary represents what would be a DOM element, where
 - keys like "fooAttr" correspond to the attribute "foo"
 - .tag is a string specifiying the tag name, or if it's a component instance, .tag is it's source component, like in JSX.
 - .children is a list of the element's children, as Pdoms
 - .innerHTML is a string to be the element's contents.  It overrides .children
 - .link sets the link of the block, corresponding to wrapping the element in an <a>
 - all other keys are assumed to be CSS rules in camel case, like React's styles
 - if a key used for CSS is a number, "px" will be added to it.  If you don't want
   this behavior, like in React, pass the number in a string

Valid Pdoms require: .tag, .children
Code may assume these properties exist; if they do not, expect crashes

TODO function to assert pdom structure is valid
TODO generic PDOM printer for debugging
*/

defaultExport.pdom_tag_is_component = (pdom_tag_is_component = tag => !_l.isString(tag));

defaultExport.attrKey = (attrKey = 'Attr');
defaultExport.constraintAttrs = (constraintAttrs = ['horizontalLayoutType', 'verticalLayoutType', 'flexMarginTop', 'flexMarginLeft', 'flexMarginBottom', 'flexMarginRight']);
defaultExport.specialVPdomAttrs = (specialVPdomAttrs = ['vWidth', 'vHeight', 'direction', 'spacerDiv', 'marginDiv']);
defaultExport.nonDynamicableAttrs = (nonDynamicableAttrs =  ['tag', 'children', 'backingBlock']);
defaultExport.media_query_attrs = (media_query_attrs = ['media_query_min_width', 'media_query_max_width']);
defaultExport.specialDivAttrs = (specialDivAttrs = _l.concat(media_query_attrs, [
    'tag', 'children', 'backingBlock', 'innerHTML', 'textContent',      // core special attrs
    'props',                                                             // component attrs
    'event_handlers',                                                    // [(name :: String, code :: String)].  *Should* only be on native elements
    'link', 'openInNewTab',                                             // click handlers and related
    'repeat_variable', 'instance_variable', 'show_if',                  // control flow parameters
    'classList'                                                         // list of CSS classes that can be added to any pdom
]));

defaultExport.externalPositioningAttrs = (externalPositioningAttrs = [
    'flexGrow', 'flexShrink', 'flexBasis', // Added by the layout system
    'marginBottom', 'marginTop', 'marginLeft', 'marginRight', // Potentially added by optimizations
    'position', 'top', 'left', 'bottom', 'right' // position absolute attributes; maybe should include 'height' and 'width'
]);


defaultExport.walkPdom = (walkPdom = function(pdom, {preorder, postorder, ctx}) {
    const child_ctx = typeof preorder === 'function' ? preorder(pdom, ctx) : undefined;
    const accum = pdom.children.map(child => walkPdom(child, {preorder, postorder, ctx: child_ctx}));
    return (typeof postorder === 'function' ? postorder(pdom, accum, ctx) : undefined);
});

// old implementation of foreachPdom
const slow_foreachPdom = (pdom, fn) => walkPdom(pdom, {
    postorder(pd) {
        return fn(pd);
    }
}
);

defaultExport.foreachPdom = (foreachPdom = function(pdom, fn) {
    for (let child of Array.from(pdom.children)) { foreachPdom(child, fn); }
    return fn(pdom);
});

// NOTE mapPdom is not pure: it does not make copies of nodes before handing them to fn
defaultExport.mapPdom = (mapPdom = (pdom, fn) => walkPdom(pdom, { postorder(pd, children) {
    // pd = _l.clone(pd) if you want mapPdom to be pure
    pd.children = children;
    return fn(pd);
}
}
));

defaultExport.pureMapPdom = (pureMapPdom = (pdom, fn) => mapPdom(clonePdom(pdom), fn));

// flattenedPdom :: Pdom -> [Pdom]
defaultExport.flattenedPdom = (flattenedPdom = function(pdom) {
    const nodes = [];
    foreachPdom(pdom, pd => nodes.push(pd));
    return nodes;
});

// find_pdom_where :: Pdom -> (Pdom -> Bool) -> Pdom
// find_pdom_where = (pdom, fn) -> _l.head flattenedPdom(pdom).filter(fn)
defaultExport.find_pdom_where = (find_pdom_where = function(tree, condition) {
    let found = null;
    foreachPdom(tree, function(pd) {
        if (!found && (condition(pd) === true)) {
            return found = pd;
        }
    });
    return found;
});

defaultExport.clonePdom = (clonePdom = pdom => _l.cloneDeepWith(pdom, function(value) {
    // backingBlocks should be cloned by reference, everything else by value
    if (value instanceof Block) {
        return value.getBlock();

    } else if (value instanceof Dynamic) {
        return new Dynamic(value.code, value.dynamicable);

    } else if (value instanceof Font) {
        return value;

    } else {
        // returning undefined tells the cloning function to
        // do it's default thing to clone this value, and recurse
        return undefined;
    }
}));

// assert -> forall pdom, (pdom) -> pdom == _l.fromPairs(
//  styleForDiv(pdom) + htmlAttrsForPdom(pdom).map(([p,v])->["#{p}Attr", v]) + _l.pick(pdom, specialDivAttrs)
// )

// attr_members_of_pdom :: pdom -> [("#{name}Attr", name :: String)]
defaultExport.attr_members_of_pdom = (attr_members_of_pdom = pdom => (() => {
    const result = [];
    
    for (let key of Object.keys(pdom || {})) {
        const value = pdom[key];
        if (key.endsWith(attrKey) && (value != null) && (value !== "")) {
            result.push([key, key.slice(0, key.length - attrKey.length)]);
        }
    }

    return result;
})());

// htmlAttrsForPdom :: pdom -> {string: string|Dynamicable}
// for all non-empty members like {myAttr: "foo"}, will return {my: "foo"}
// coerces all values to strings
// ignores undefined and null values
defaultExport.htmlAttrsForPdom = (htmlAttrsForPdom = pdom => _l.fromPairs(((() => {
    const result = [];
    for (let key of Object.keys(pdom || {})) {
        var value = pdom[key];
        if (!key.endsWith(attrKey)) { continue; }
        if ((value == null)) { continue; }
        if (value === "") { continue; }
        result.push([key.slice(0, key.length - attrKey.length),
            (() => {
            if      (_l.isString(value)) { return value;
            } else if (value instanceof Dynamic) { return value;
            } else if (_l.isNumber(value)) { return String(value);
            } else if (_l.isBoolean(value)) { return String(value);
            } else if (_l.isFunction(value)) { return value;
            } else { throw new Error(`${JSON.stringify(value)} is not a valid pdom html attr`); }
        })()
        ]);
    }

    return result;
})())
));

defaultExport.styleMembersOfPdom = (styleMembersOfPdom = pdom => _.keys(pdom).filter(prop => !(Array.from(specialDivAttrs).includes(prop) || prop.endsWith(attrKey))));

defaultExport.styleForDiv = (styleForDiv = div => _.object((() => {
    const result = [];
    for (let prop of Array.from(styleMembersOfPdom(div))) {
        let val = div[prop];
        if (val instanceof Font) {
            val = val.get_css_string();
        }

        if (((val != null) === false) || (val === "")) {
            continue; // don't clutter the css
        }

        result.push([prop, val]);
    }

    return result;
})()));

defaultExport.serialize_pdom = (serialize_pdom = pdom => _l.extend(_l.omit(pdom, ['children', 'backingBlock', 'tag', 'props']), {
    backingBlock: (pdom.backingBlock != null ? pdom.backingBlock.serialize() : undefined), children: pdom.children.map(serialize_pdom),
    tag: (pdom.tag.serialize != null) ? _l.extend({}, pdom.tag.serialize(), {isComponent: true}) : pdom.tag,
    // Our props might contain a pdom. FIXME: Might not be toplevel
    props: isExternalComponent(pdom.tag) ? _l.mapValues(pdom.props, function(val) { if (val.tag != null) { return serialize_pdom(val); } else { return val; } }) : undefined
}));

export default defaultExport;

