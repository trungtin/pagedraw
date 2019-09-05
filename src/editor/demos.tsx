// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS104: Avoid inline assignments
 * DS201: Simplify complex destructure assignments
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _ from 'underscore';
import _l from 'lodash';
import $ from 'jquery';
import React from 'react';
import createReactClass from 'create-react-class';
import propTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { Doc } from '../doc';
import { BaseInstanceBlock } from '../blocks/instance-block';
import { server } from './server';
import FormControl from '../frontend/form-control';
import jsondiffpatch from 'jsondiffpatch';
import { pdomToReact } from './pdom-to-react';
import '../blocks/index';
import { DraggingCanvas } from '../frontend/DraggingCanvas';

// Demos :: {String, () -> ReactComponent}
const Demos = {};

// demos utility
const LocalStorageValueLink = function(key, dfault, onchange) {
    let left;
    const ls_key = `__pd_demos_${key}`;
    const nonemptyString = function(str) { if (str === "") { return undefined; } else { return str; } };
    return {
        value: (left = nonemptyString(window.localStorage[ls_key])) != null ? left : dfault,
        requestChange: newval => {
            window.localStorage[ls_key] = newval;
            return onchange(newval);
        }
    };
};

const DemoContainer = props => React.createElement("div", {"style": (_l.extend({width: 800, margin: 'auto'}, props.style))},
    (props.children)
);

//#

Demos.Blank = () => createReactClass({
    render() {
        return React.createElement(DemoContainer, null,
            React.createElement("div", null, "Use me for a temporary test")
        );
    }
});


Demos.JSONExplorer = function() {
    const yaml = require('js-yaml');
    _l = require('lodash');

    const isPrimitive = _l.overSome([_l.isString, _l.isNumber, _l.isUndefined, _l.isNull, _l.isBoolean]);
    const isObjectish = value => !_l.isArray(value) && !isPrimitive(value);

    var flatten_hash = function(hash) {
        const flattened = {};
        for (let key in hash) {
            const subhash = hash[key];
            if (isObjectish(subhash)) {
                const object = flatten_hash(subhash);
                for (let subkey in object) {
                    const subvalue = object[subkey];
                    flattened[`${key}.${subkey}`] = subvalue;
                }
            } else {
                flattened[key] = subhash;
            }
        }
        return flattened;
    };

    const JSONTable = createReactClass({
        render() {
            return React.createElement("div", {"className": "JSONTable"},
                React.createElement("style", {"dangerouslySetInnerHTML": ({__html: `\
.JSONTable table {
    border-collapse: collapse;
}

.JSONTable table, .JSONTable th, .JSONTable td {
   border: 1px solid black;
}

.JSONTable thead td {
    background-color: antiquewhite;
    position: sticky;
    top: 0;
}\
`})}),
                ((() => { 
                    try {
                        if (_l.isArray(this.props.json)) {
                            return this.renderList(this.props.json);
                        } else if (isPrimitive(this.props.json)) {
                            return React.createElement("div", null, (JSON.stringify(this.props.json)));
                        } else {
                            return this.renderHash(this.props.json);
                        }
                    } catch (e) {
                        return `JSONExplorer error: ${e.message}`;
                    }
                 })())
            );
        },


        renderHash(hash) {
            let flattened;
            return React.createElement("table", null,
                React.createElement("tbody", null,
                (
                    (flattened = _l.toPairs(flatten_hash(hash))),

                    (flattened = _l.sortBy(flattened, [(function(...args) { const [k,v] = Array.from(args[0]); return _l.isArray(v); }), '0'])),

                    (() => {
                        const result = [];
                        for (let i = 0; i < flattened.length; i++) {
                            var [key, value] = flattened[i];
                            result.push(React.createElement("tr", {"key": (i)},
                                React.createElement("td", null,
                                    React.createElement("div", {"style": ({position: 'sticky', top: 10, bottom: 10})},
                                        (key)
                                    )
                                ),
                                React.createElement("td", null, (
                                    _l.isArray(value) ?
                                        this.renderList(value)
                                    : isPrimitive(value) ?
                                        React.createElement("div", null, (JSON.stringify(value)))
                                    :
                                        (() => { try {
                                            return `Unknown object kind ${JSON.stringify(value)}`;
                                        } catch (e) {
                                            return `Unknown object [un-JSONable] ${e.message}`;
                                        } })()
                                ))
                            ));
                        }
                        return result;
                    })()
                )
                )
            );
        },

        renderList(list) {
            let i, value, hash;
            if (_l.isEmpty(list)) {         //0
                return React.createElement("div", null, "[]");
            }

            const hasSublists = _l.some(list, elem => _l.isArray(elem));
            const hasPrims    = _l.some(list, elem => isPrimitive(elem));
            const hasObjs     = _l.some(list, elem => isObjectish(elem));

            if (hasObjs && !hasSublists && !hasPrims) {     //1
                const keys = _l.union(...Array.from(list.map(hash => _l.keys(flatten_hash(hash))) || []));

                return React.createElement("table", null,
                    React.createElement("thead", null,
                        React.createElement("tr", null, ((() => {
                            const result = [];
                            for (i = 0; i < keys.length; i++) {
                                const key = keys[i];
                                result.push(React.createElement("td", {"key": (i)}, (key)));
                            }
                        
                            return result;
                        })())
                        )
                    ),

                    React.createElement("tbody", null,
                        ((() => {
                        const result1 = [];
                        
                            for (i = 0; i < list.length; i++) {
                            hash = list[i];
                            result1.push(React.createElement("tr", {"key": (i)},
                                ((() => {
                                const result2 = [];
                                const iterable = _l.at(hash, keys);
                                
                                    for (let j = 0; j < iterable.length; j++) {
                                    value = iterable[j];
                                        result2.push(React.createElement("td", {"key": (j)},
                                        (
                                            _l.isArray(value) ?
                                                // sort of the least we can do
                                                // FIXME pull their headers a level up
                                                this.renderList(value)
                                            : isPrimitive(value) ?
                                                React.createElement("div", null, (JSON.stringify(value)))
                                            :
                                                // FIXME for this key, some elements have a non-object type and others have an object type
                                                React.createElement("div", null, ("{Object}"))
                                        )
                                        ));
                                }
                                
                                return result2;
                            })())
                            ));
                        }
                        
                        return result1;
                    })())
                    )
                );

            } else if (!hasObjs && !hasSublists && hasPrims) {    //2
                return React.createElement("table", null,
                    React.createElement("tbody", null,
                        ((() => {
                        const result3 = [];
                         for (i = 0; i < list.length; i++) {
                            value = list[i];
                            result3.push(React.createElement("tr", {"key": (i)},
                                React.createElement("td", null, (JSON.stringify(value)))
                            ));
                        }
                        
                        return result3;
                    })())
                    )
                );

            } else {
                /*
                * TODO

                else if hasObjs and hasSublists and hasPrims
                else if hasObjs and hasSublists and not hasPrims
                else if hasObjs and not hasSublists and hasPrims
                else if hasObjs and not hasSublists and not hasPrims    # done: #1 (!)

                else if not hasObjs and hasSublists and hasPrims
                else if not hasObjs and hasSublists and not hasPrims
                else if not hasObjs and not hasSublists and hasPrims     # done: #2
                else if not hasObjs and not hasSublists and not hasPrims # done: empty case #0

                */
                // UNIMPLEMENTED / DEFAULT
                return React.createElement("table", null,
                    React.createElement("tbody", null,
                        ((() => {
                        const result4 = [];
                         for (i = 0; i < list.length; i++) {
                            value = list[i];
                            result4.push(React.createElement("tr", {"key": (i)},
                                React.createElement("td", null, (JSON.stringify(value)))
                            ));
                        }
                        
                        return result4;
                    })())
                    )
                );
            }
        }
    });



    return createReactClass({
        render() {
            return React.createElement("div", null,
                React.createElement(DemoContainer, null,
                    React.createElement(FormControl, {"tag": "textarea", "valueLink": (this.getJSVL()), "style": ({width: '100%', height: '5em'})}),
                    React.createElement(FormControl, {"tag": "select", "valueLink": (this.getLanguageVL())},
                        React.createElement("option", {"value": "Javascript"}, "Javascript"),
                        React.createElement("option", {"value": "YAML"}, "YAML")
                    )
                ),
                React.createElement(JSONTable, {"json": (this.state.data)})
            );
        },

        getJSVL() { return LocalStorageValueLink('JSONExplorerData', "", (() => this.updateJS())); },
        getLanguageVL() { return LocalStorageValueLink('JSONExplorerLanguage', "Javascript", (() => this.updateJS())); },

        getInitialState() {
            return {data: this.evalJS()};
        },

        updateJS() {
            return this.setState({data: this.evalJS()});
        },

        evalJS() {
            const code = this.getJSVL().value;
            try {
                switch (this.getLanguageVL().value) {
                    case 'Javascript': return eval(code);
                    case 'YAML': return yaml.safeLoad(code);
                }
            } catch (e) {
                return e.message;
            }
        }
    });
};

Demos.InstanceRenderer = function() {
    const {PdDropdownTwo} = require('./component-lib');
    const {compileComponentForInstanceEditor, evalInstanceBlock} = require('../core');

    return createReactClass({
        render() {
            let left;
            return React.createElement("div", {"style": ({margin: 'auto'})},
                React.createElement("p", null, `\
DocID: `, React.createElement(FormControl, {"type": "text", "valueLink": (this.getPageIdValueLink())}),
                    React.createElement(PdDropdownTwo, {"title": (this.selectedInstance != null ? this.selectedInstance.name : undefined),  
                        "onSelect": ((val, evt) => { return this.selectedInstance = _l.find(this.doc.blocks, {uniqueKey: val}); }),  
                        "options": ((left = (this.doc != null ? this.doc.blocks.filter(b => b instanceof BaseInstanceBlock).map(instance => ({
                            label: instance.getLabel(),
                            value: instance.uniqueKey
                        })) : undefined)) != null ? left : [])}),
                    React.createElement("button", {"onClick": (this.mount)}, "Mount")
                ),

                React.createElement("div", {"ref": "mount_point"})
            );
        },

        componentWillMount() {
            this.selectedInstance = null;
            this.unsubscribe = null;
            return this.pageIdUpdated(this.getPageIdValueLink().value);
        },

        getPageIdValueLink() { return LocalStorageValueLink('local_compiler_page_id', '', this.pageIdUpdated); },

        pageIdUpdated(new_val) {
            // the localStorage has already been modified
            this.forceUpdate();

            return server.docRefFromPageId(new_val, docRef => {
                // if the page_id changed since we asked metaserver for new_val
                if (this.getPageIdValueLink().value !== new_val) {
                    // no-op; the later change took care of itself
                    return;
                }

                if (typeof this.unsubscribe === 'function') {
                    this.unsubscribe();
                }

                if ((this.docRef == null)) {
                    this.compiled = "doc not found";
                }

                return this.unsubscribe = server.watchPage(docRef, (...args) => {
                    const [cas_token, new_json] = Array.from(args[0]);
                    return this.updateDoc(new_json);
                });
            });
        },

        updateDoc(json) {
            this.doc = Doc.deserialize(json);
            return this.forceUpdate();
        },

        mount() {
            if (this.selectedInstance == null) { return; }

            var compile_options = {
                for_editor: false,
                for_component_instance_editor: true,
                templateLang: this.doc.export_lang,
                getCompiledComponentByUniqueKey: uniqueKey => {
                    const componentBlockTree = this.doc.getBlockTreeByUniqueKey(uniqueKey);
                    if (componentBlockTree === undefined) { return undefined; }
                    return compileComponentForInstanceEditor(componentBlockTree, compile_options);
                }
            };

            return this.doc.inReadonlyMode(() => {
                const pdom = evalInstanceBlock(this.selectedInstance, compile_options);
                return ReactDOM.render(pdomToReact(pdom), this.refs.mount_point);
            });
        }
    });
};

Demos.LocalCompiler = function() {
    const compile = require('../../compiler-blob-builder/compile');
    ({server} = require('../editor/server'));

    return createReactClass({
        render() {
            return React.createElement("div", {"style": ({margin: 'auto'})},
                React.createElement("p", null, `\
DocID: `, React.createElement(FormControl, {"type": "text", "valueLink": (this.getPageIdValueLink())}), `\
Hide CSS: `, React.createElement(FormControl, {"type": "checkbox", "valueLink": (this.getIgnoreCSSValueLink())})
                ),

                React.createElement("div", {"style": ({display: 'flex'})},
                    (this.getCompiled().map(({filePath, contents}, i) => React.createElement("div", {"key": (i)},
                    React.createElement("span", {"style": ({fontWeight: 'bold'})}, (filePath)),
                    React.createElement("pre", {"style": ({overflow: 'auto', width: 750, border: '1px solid gray'})},
                        (contents)
                    )
                )))
                )
            );
        },

        getCompiled() {
            if (this.getIgnoreCSSValueLink().value === true) {
                return this.compiled.filter(({filePath}) => filePath.endsWith(".css") !== true);
            } else {
                return this.compiled;
            }
        },

        componentWillMount() {
            this.unsubscribe = null;
            this.compiled = [];
            return this.pageIdUpdated(this.getPageIdValueLink().value);
        },

        getPageIdValueLink() { return LocalStorageValueLink('local_compiler_page_id', '', this.pageIdUpdated); },
        getIgnoreCSSValueLink() { return this.StringToBooleanVLT(LocalStorageValueLink('local_compiler_ignore_css', 'false', () => this.forceUpdate())); },

        StringToBooleanVLT(vl) {
            return {
                value: vl.value === "true",
                requestChange(new_val) { return vl.requestChange(String(new_val)); }
            };
        },

        pageIdUpdated(new_val) {
            // the localStorage has already been modified
            this.forceUpdate();

            return server.docRefFromPageId(new_val, docRef => {
                // if the page_id changed since we asked metaserver for new_val
                if (this.getPageIdValueLink().value !== new_val) {
                    // no-op; the later change took care of itself
                    return;
                }

                if (typeof this.unsubscribe === 'function') {
                    this.unsubscribe();
                }

                if ((this.docRef == null)) {
                    this.compiled = "doc not found";
                }

                return this.unsubscribe = server.watchPage(docRef, (...args) => {
                    const [cas_token, new_json] = Array.from(args[0]);
                    return this.updateDoc(new_json);
                });
            });
        },

        updateDoc(json) {
            try {
                this.compiled = compile(json);
            } catch (e) {
                this.compiled = [{filePath: "error", contents: e.toString()}];
            }
            return this.forceUpdate();
        }
    });
};

Demos.RefactorTesting = function() {
    const compile = require('../../compiler-blob-builder/compile');
    ({server} = require('../editor/server'));
    const config = require('../config');

    return createReactClass({
        render() {
            return React.createElement("div", {"style": ({margin: 'auto'})},
                React.createElement("div", null, `\
DocID: `, React.createElement(FormControl, {"type": "text", "valueLink": (this.getPageIdValueLink())}),
                    (this.matches ?
                        React.createElement("span", {"style": ({backgroundColor: 'green', color: 'white'})}, "Matches")
                    :
                        React.createElement("span", {"style": ({backgroundColor: 'red', color: 'white'})}, "Fails")
                    )
                ),

                React.createElement("div", {"style": ({display: 'flex'})},
                    (this.compiled.map(({filePath, contents}, i) => React.createElement("div", {"key": (i)},
                    React.createElement("span", {"style": ({fontWeight: 'bold'})}, (filePath)),
                    React.createElement("pre", {"style": ({overflow: 'auto', width: 750, border: '1px solid gray'})},
                        (contents)
                    )
                )))
                )
            );
        },

        componentWillMount() {
            this.unsubscribe = null;
            this.compiled = [];
            return this.pageIdUpdated(this.getPageIdValueLink().value);
        },

        getPageIdValueLink() { return LocalStorageValueLink('local_compiler_page_id', '', this.pageIdUpdated); },

        pageIdUpdated(new_val) {
            // the localStorage has already been modified
            this.forceUpdate();

            return server.docRefFromPageId(new_val, docRef => {
                // if the page_id changed since we asked metaserver for new_val
                if (this.getPageIdValueLink().value !== new_val) {
                    // no-op; the later change took care of itself
                    return;
                }

                if (typeof this.unsubscribe === 'function') {
                    this.unsubscribe();
                }

                if ((this.docRef == null)) {
                    this.compiled = "doc not found";
                }

                return this.unsubscribe = server.watchPage(docRef, (...args) => {
                    const [cas_token, new_json] = Array.from(args[0]);
                    return this.updateDoc(new_json);
                });
            });
        },

        updateDoc(json) {
            try {
                config.old_version = true;
                const v1 = compile(json);
                config.old_version = false;
                const v2 = compile(json);
                this.compiled = [].concat(v1, v2);
                this.matches = _l.isEqual(v1, v2);
            } catch (e) {
                this.compiled = [{filePath: "error", contents: e.toString()}];
            }
            return this.forceUpdate();
        }
    });
};


Demos.BlockRenderingExperiment = function() {  return createReactClass({
    render() {
        return React.createElement("div", null,
            React.createElement("button", {"onClick": (this.start)}, "start"),
            React.createElement("span", {"ref": "dom"})
        );
    },

    componentWillMount() {
        return this.message = 0;
    },

    start() {
        this.message += 1;
        ReactDOM.findDOMNode(this.refs.dom).textContent = this.message;
        return this.spin(5);
    },

    spin(seconds) {
        const start_t = new Date().getTime();
        return (() => {
            const result = [];
            while ((start_t + (seconds * 1000)) > new Date().getTime()) {
                result.push(false);
            }
            return result;
        })();
    }
}); };


Demos.IframeExperiment = () => createReactClass({
    render() {
        return React.createElement("iframe", {"ref": "iframe"}, `\
I have content!\
`);
    }
});


Demos.MouseDragExperiment = function() { return createReactClass({
    render() {
        return React.createElement("button", {"onClick": (this.start)}, "start");
    },

    start() {
        return $(window).on('mousemove', e => console.log(e));
    }
}); };


Demos.CopyPasteExperiment = function() { return createReactClass({
    render() {
        return React.createElement("div", {"tabIndex": "100"}, `\
Some content\
`);
    },

    componentDidMount() {
        const elem = $(ReactDOM.findDOMNode(this));
        elem.on('copy', console.log.bind(console));
        elem.on('cut', console.log.bind(console));
        return elem.on('paste', console.log.bind(console));
    }
}); };


Demos.SpinExperiment = function() { return createReactClass({
    render() {
        const boxSize = 100;
        return React.createElement(DraggingCanvas, {"style": ({height: 1000, position: 'relative'}), "onDrag": (this.handleDrag), "onClick"() {}},
            React.createElement("div", {"style": ({
                position: 'absolute', backgroundColor: 'red',
                width: boxSize, height: boxSize,
                top: this.state.top - (boxSize/2), left: this.state.left - (boxSize/2),
                transform: `rotate(${this.state.top+this.state.left}deg)`
            })})
        );
    },

    getInitialState() {
        return {
            top: 500,
            left: 500
        };
    },

    handleDrag(from, onMove, onEnd) {
        return onMove(to => {
            return this.setState({top: to.top, left: to.left});
    });
    }}); };



Demos.DynamicStyleTagExperiment1 = function() { return createReactClass({
    render() {
        return React.createElement("div", null,
            React.createElement("div", null,
                React.createElement("button", {"onClick": (this.start)}, "Start dynamic style tag animation")
            ),
            React.createElement("div", {"style": ({height: 100, position: 'relative'})},
                React.createElement("style", {"dangerouslySetInnerHTML": ({__html: `\
#dste_box {
    left: ${this.offset}px;
}\
`})}),
                React.createElement("div", {"id": "dste_box", "ref": "box",  
                    "style": ({
                        position: 'absolute', backgroundColor: 'red',
                        width: 80, height: 80
                    })})
            )
        );
    },

    start() {
        this.offset = 0;
        const update = () => {
            this.offset = (this.offset + 1) % 1000;
            return this.forceUpdate();
        };

        var repaint = () => {
            update();
            return window.setTimeout(repaint, 0);
        };
        return repaint();
    }
}); };


Demos.DynamicStyleTagExperiment2 = function() { return createReactClass({
    render() {
        return React.createElement("div", null,
            React.createElement("div", null,
                React.createElement("button", {"onClick": (this.start)}, "Start style animation")
            ),
            React.createElement("div", {"style": ({height: 100, position: 'relative'})},
                React.createElement("div", {"ref": "box",  
                    "style": ({
                        position: 'absolute', backgroundColor: 'red',
                        width: 80, height: 80,
                        left: this.offset
                    })})
            )
        );
    },

    start() {
        this.offset = 0;
        const update = () => {
            this.offset = (this.offset + 1) % 1000;
            return this.forceUpdate();
        };

        var repaint = () => {
            update();
            return window.setTimeout(repaint, 0);
        };
        return repaint();
    }
}); };

Demos.SideScrollerExperiment = function() { return createReactClass({
    getInitialState() {
        return {cards: [undefined]};
    },

    render() {
        const [card_width, card_margin] = Array.from([230, 20]);
        const extra_right_space = 2*(card_width + card_margin);
        const {
            cards
        } = this.state;
        const card_count = cards.length;

        return React.createElement("div", {"style": ({overflow: 'auto', height: 500, width: '100%'})},
            React.createElement("div", {"style": ({height: '100%', width: ((card_count*card_width) + ((card_count-1)*card_margin) + extra_right_space)})},
                (cards.map((card, i) => {
                    return React.createElement("div", {"key": (i), "style": ({
                        display: 'inline-block',
                        width: card_width,
                        height: '100%',
                        marginLeft: i !== 0 ? card_margin : 0,
                        backgroundColor: 'red'})},
                        (['foo', 'bar', 'baz', 'qoux', 'lorem', 'ipsum'].map(item => {
                            return React.createElement("div", {"key": (item),  
                                "onClick": ( () => {
                                    return this.setState({cards: cards.slice(0, i).concat([item, undefined])});
                                }
                                ),  
                                "style": ({
                                    margin: 5, padding: 10, borderRadius: 5,
                                    backgroundColor: item !== card ? 'aliceblue' : 'blue'
                                })
                            },
                                (item)
                            );
                        }))
                    );
                }))
            )
        );
    }
}); };



Demos.VnetExperiment = function() {
    const [WIDTH, HEIGHT] = Array.from([1500, 1000]);
    const add_vec = (a, b) => [a[0]+b[0], a[1]+b[1]];
    const sub_vec = (a, b) => [a[0]-b[0], a[1]-b[1]];
    const dot_vec = (a, b) => (a[0]*b[0]) + (a[1]*b[1]);
    const scal_vec = function(k, ...rest) { const [vx, vy] = Array.from(rest[0]); return [k*vx, k*vy]; };
    const len_vec_sq = a => dot_vec(a, a);
    const dist_rel = (a, b) => len_vec_sq(sub_vec(a, b));

    const proj_pt_to_line = function(x, ...rest) {
        const [a, b] = Array.from(rest[0]);
        const ab = sub_vec(b, a);
        const ax = sub_vec(x, a);

        return add_vec(a, scal_vec(dot_vec(ab, ax)/dot_vec(ab, ab), ab));
    };

    const proj_pt_in_line = function(x, ...rest) {
        const [a, b] = Array.from(rest[0]);
        const pt = proj_pt_to_line(x, [a, b]);
        const inside = ((a[0] <= pt[0] && pt[0] <= b[0]) || (b[0] <= pt[0] && pt[0] <= a[0])) && ((a[1] <= pt[1] && pt[1] <= b[1]) || (b[1] <= pt[1] && pt[1] <= a[1]));
        if (inside) { return pt; } else { return null; }
    };

    const set_vec = function(dst, src) { let ref;
    return [dst[0], dst[1]] = Array.from(ref = [src[0], src[1]]), ref; };
    const coord_to_vec = where => [where.left, where.top];

    const FocusController = createReactClass({
        render() {
            return this.props.children;
        },

        childContextTypes: {
            focusWithoutScroll: propTypes.func
        },

        getChildContext() {
            return {focusWithoutScroll: this.focusWithoutScroll};
        },

        focusWithoutScroll(elem) {
            return elem.focus();
        }
    });

    return createReactClass({
        render() {
            return React.createElement(DemoContainer, null,
                React.createElement("div", {"style": ({border: '1px solid #888', display: 'inline-block', margin: 10, fontSize: 0}), "onKeyDown": (this.handleKey)},
                    React.createElement(FocusController, null,
                        React.createElement(DraggingCanvas, {"onDrag": (this.handleDrag), "onClick": (this.handleClick)},
                            React.createElement("canvas", {"width": (WIDTH), "height": (HEIGHT), "style": ({
                                width: WIDTH/2, height: HEIGHT/2,
                                display: 'inline-block'
                            }), "ref": "canvas"})
                        )
                    )
                )
            );
        },

        componentDidMount() {
            document.addEventListener('keydown', this.handleKey);

            this.elem = ReactDOM.findDOMNode(this.refs.canvas);
            this.ctx = this.elem.getContext('2d');
            this.ctx.translate(0.5, 0.5);
            this.ctx.scale(2,2);
            this.ctx.lineWidth = 0.5;

            this.nodes = [[500, 500], [250, 400], [400, 52], [100, 100]];
            this.edges = [[1, 2], [0, 2], [0, 1], [1, 3], [2, 3], [0, 3]].map((...args) => { const [l, r] = Array.from(args[0]); return [this.nodes[l], this.nodes[r]]; });

            return this.requestFrame();
        },

        componentWillUnmount() {
            return document.removeEventListener('keydown', this.handleKey);
        },

        requestFrame() {
            this.rerender();
            return window.requestAnimationFrame(this.requestFrame);
        },

        rerender() {
            this.ctx.clearRect(-1, -1, WIDTH+1, HEIGHT+1);

            this.ctx.strokeStyle = 'black';
            this.ctx.lineWidth = 1;
            for (let [p1, p2] of Array.from(this.edges)) {
                this.ctx.beginPath();
                this.ctx.moveTo(p1[0], p1[1]);
                this.ctx.lineTo(p2[0], p2[1]);
                this.ctx.stroke();
            }

            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = 1;
            for (let pt of Array.from(this.nodes)) {
                if (pt !== this.selected) {
                    this.ctx.beginPath();
                    this.ctx.arc(pt[0], pt[1], 10, 2*Math.PI, false);
                    this.ctx.stroke();
                }
            }

            if (this.selected != null) {
                this.ctx.strokeStyle = 'green';
                this.ctx.lineWidth = 8;
                this.ctx.beginPath();
                this.ctx.arc(this.selected[0], this.selected[1], 8, 2*Math.PI, false);
                return this.ctx.stroke();
            }
        },

        grabbedEdge(x) {
            const closest_points = ((() => {
                const result = [];
                for (let e of Array.from(this.edges)) {
                    const pt = proj_pt_in_line(x, e);
                    if (pt === null) { continue; }
                    if (dist_rel(pt, x) > 50) { continue; }
                    result.push([e, pt]);
                }
            
                return result;
            })());

            if (!_l.isEmpty(closest_points)) {
                return _l.minBy(closest_points, function(...args) { const [edge, p] = Array.from(args[0]); return dist_rel(p, x); });

            } else {
                return null;
            }
        },


        handleDrag(from, onMove, onEnd) {
            // find closest point
            let grabbedEdgeMatch;
            const x = coord_to_vec(from);

            let closest_point = _l.minBy(this.nodes, n => dist_rel(n, x));
            if (dist_rel(closest_point, coord_to_vec(from)) < 5000) {
                const orig_loc = _.clone(closest_point);
                this.selected = closest_point;

                onMove(to => {
                    return set_vec(closest_point, add_vec(orig_loc, coord_to_vec(to.delta)));
                });

                return onEnd(() => {});
                    // pass

            } else if (grabbedEdgeMatch = this.grabbedEdge(x)) {
                let edge;
                [edge, closest_point] = Array.from(grabbedEdgeMatch);

                const orig_locs = _l.cloneDeep(edge);
                this.selected = null; // can't select lines yet

                onMove(to => {
                    const d = coord_to_vec(to.delta);
                    set_vec(edge[0], add_vec(orig_locs[0], d));
                    return set_vec(edge[1], add_vec(orig_locs[1], d));
                });

                return onEnd(() => {});
            }
        },
                    // pass

        handleClick(from) {
            const x = coord_to_vec(from);

            let closest_point = _l.minBy(this.nodes, n => dist_rel(n, x));
            if (!(dist_rel(closest_point, x) < 70)) { closest_point = null; }

            if (closest_point === null) {
                const res = this.grabbedEdge(x);
                if (res !== null) {
                    let edge;
                    [edge, closest_point] = Array.from(res);
                    return this.selected = closest_point;
                }
            }
        },

        handleKey(e) {
            // Backspace and Delete key
            if ([8, 46].includes(e.keyCode)) {
                console.log('deleting');
                this.deleteSelected();
                return e.preventDefault();
            }
        },


        deleteSelected() {
            if (this.selected == null) { return; }

            this.edges = this.edges.filter((...args) => { const [a, b] = Array.from(args[0]); return (a !== this.selected) && (b !== this.selected); });
            this.nodes = this.nodes.filter(n => n !== this.selected);

            return this.selected = null;
        }
    });
};

Demos.ShadowDomExperiment = function() {
    return createReactClass({
        render() {
            return React.createElement(DemoContainer, null,
                React.createElement("style", {"dangerouslySetInnerHTML": ({__html: `\
.make-red { color: red }\
`})}),
                React.createElement("div", {"className": "make-red"}, "This should be red"),
                React.createElement("div", {"ref": "shadowHost"})
            );
        },

        componentDidMount() {
            const shadowRoot = this.refs.shadowHost.attachShadow({mode: 'open'});
            const shadowTree = React.createElement("div", {"className": "make-red", "onClick"() { return window.alert('hello'); }}, "This should be black");
            return ReactDOM.render(shadowTree, shadowRoot);
        }
    });
};


Demos.ColorPickerExperiment = function() {
    const ColorPicker = require('../frontend/react-input-color');
    return createReactClass({
        render() {
            return React.createElement("div", {"key": (`key${this.key}`)},
                React.createElement(ColorPicker, {"valueLink": ({
                    value: this.value,
                    requestChange: newval => {
                        console.log(newval);
                        return this.value = newval;
                    }
                })}),
                React.createElement("button", {"onClick": (() => {
                    this.key += 1;
                    return this.forceUpdate();
                }
                )}, "Change key")
            );
        },

        componentWillMount() {
            this.value = '#aa0000';
            return this.key = 4;
        }
    });
};

Demos.ErrorBoundaryExperiment = function() {
    const ErrorSource = createReactClass({
        displayName: 'ErrorSource',
        render() {
            return React.createElement("div", null, "Hello ", (undefined['world']));
        }
    });

    return createReactClass({
        displayName: 'ErrorBoundaryHolder',
        getInitialState() {
            return {errorFound: false};
        },

        componentWillMount() {
            return window.addEventListener('error', event => console.log('Listened to error: ' + event.message));
        },


        render() {
            if (this.state.errorFound) {
                return React.createElement(DemoContainer, null, React.createElement("div", null, "Error found. We shouldn\'t need to crash"));
            }

            return React.createElement(DemoContainer, null,
                React.createElement("div", null, "No error found"),
                React.createElement(ErrorSource, null)
            );
        },

        componentDidCatch() {
            return this.setState({errorFound: true});
        }});
};


Demos.RebaseExperiment = function() {
    const ToggleIcon = require('../frontend/toggle-icon');
    return createReactClass({
        componentWillMount() { return this.handleUpdate(); },
        refreshSubscriptions() {
            if (typeof this.unsubscribe === 'function') {
                this.unsubscribe();
            }

            let canceled = false;
            const docJsons = {};
            const unsubscribes = {};
            let writeTokens = null;

            [
                ['base', LocalStorageValueLink('RebaserBase', "", this.handleUpdate)],
                ['left', LocalStorageValueLink('RebaserLeft', "", this.handleUpdate)],
                ['right', LocalStorageValueLink('RebaserRight', "", this.handleUpdate)],
                ['out', LocalStorageValueLink('RebaserOut', "", this.handleUpdate)]
            ].forEach(function(...args) {
                const [name, pageIdVl] = Array.from(args[0]);
                return server.docRefFromPageId(pageIdVl.value, docRef => {
                    if (canceled) { return; }

                    return unsubscribes[name] = server.watchPage(docRef, (...args1) => {
                        // save the out doc write tokens
                        const [cas_token, new_json] = Array.from(args1[0]);
                        if (name === 'out') { writeTokens = {docRef, cas_token}; }

                        // cache the source doc's json
                        if (name !== 'out') { docJsons[name] = new_json; }

                        // bail if we don't have all the necessary material yet
                        if ((docJsons.base == null) || (docJsons.left == null) || (docJsons.right == null) || (writeTokens == null)) { return; }

                        // construct the rebased doc from the jsons
                        const rebased_doc = Doc.rebase(...Array.from([docJsons.left, docJsons.right, docJsons.base].map(json => Doc.deserialize(json)) || []));

                        // bail if the output doc updated because of us; we don't want to cause an infinite update cycle
                        if ((name === 'out') && !Doc.deserialize(new_json).isEqual(rebased_doc)) { return; }

                        // write the rebased doc to the output doc
                        return server.casPage("x", writeTokens.docRef, writeTokens.cas_token, rebased_doc.serialize(), next_cas_token => {
                            // we have successfully written to the server
                            return writeTokens.cas_token = next_cas_token;
                        });
                    });
                });
            });

                            // FIXME we should actually replay the watchPage callback logic in case there are pending
                            // changes that didn't go through because we had an out of date cas_token.

            return this.unsubscribe = function() {
                for (let name in unsubscribes) { const unsubscribe_fn = unsubscribes[name]; unsubscribe_fn(); }
                return canceled = true;
            };
        },

        handleUpdate() {
            this.refreshSubscriptions();
            return this.forceUpdate();
        },

        render() {
            let hide, ref, show;
            const StringToBooleanVLT = vl => ({
                value: vl.value === "true",
                requestChange(new_val) { return vl.requestChange(String(new_val)); }
            });

            return React.createElement("div", {"style": ({display: 'flex', flexDirection: 'column', flex: 1})},
                React.createElement(DemoContainer, null,
                    React.createElement("div", {"style": ({display: 'flex', justifyContent: 'space-between'})},
                        React.createElement("div", null, `\
base: `, React.createElement(FormControl, {"placeholder": "Enter doc id", "valueLink": (LocalStorageValueLink('RebaserBase', "", this.handleUpdate))})
                        ),
                        React.createElement("div", null, `\
left: `, React.createElement(FormControl, {"placeholder": "Enter doc id", "valueLink": (LocalStorageValueLink('RebaserLeft', "", this.handleUpdate))})
                        ),
                        React.createElement("div", null, `\
right: `, React.createElement(FormControl, {"placeholder": "Enter doc id", "valueLink": (LocalStorageValueLink('RebaserRight', "", this.handleUpdate))})
                        ),
                        React.createElement("div", null, `\
output: `, React.createElement(FormControl, {"placeholder": "Enter doc id", "valueLink": (LocalStorageValueLink('RebaserOut', "", this.handleUpdate))})
                        ),

                        (
                            ([show, hide] = Array.from(ref = [React.createElement("button", null, "Show iFrames"), React.createElement("button", null, "Hide iFrames")]), ref),
                            React.createElement(ToggleIcon, {"valueLink": (StringToBooleanVLT(LocalStorageValueLink('RebaserShowIframes', "", (() => this.forceUpdate())))),  
                                "checkedIcon": (hide), "uncheckedIcon": (show)})
                        )
                    )
                ),
                ((() => {
                 if (StringToBooleanVLT(LocalStorageValueLink('RebaserShowIframes', "", (() => this.forceUpdate()))).value) {
                    const Embed = function({docid, style}) {
                        if (!_l.isEmpty(docid)) {
                            return React.createElement("iframe", {"src": (`http://localhost:4000/pages/${docid}`), "frameBorder": "0", "style": (style)});
                        } else {
                            return React.createElement("div", {"style": (style)});
                        }
                    };

                    return React.createElement("div", {"style": ({flex: 1, display: 'flex', flexDirection: 'column'})},
                            React.createElement("div", {"style": ({display: 'flex', flex: 1})},
                                React.createElement(Embed, {"docid": (LocalStorageValueLink('RebaserBase', "", this.handleUpdate).value), "style": ({flexGrow: '1'})}),
                                React.createElement(Embed, {"docid": (LocalStorageValueLink('RebaserLeft', "", this.handleUpdate).value), "style": ({flexGrow: '1'})})
                            ),
                            React.createElement("div", {"style": ({display: 'flex', flex: 1})},
                                React.createElement(Embed, {"docid": (LocalStorageValueLink('RebaserRight', "", this.handleUpdate).value), "style": ({flexGrow: '1'})}),
                                React.createElement(Embed, {"docid": (LocalStorageValueLink('RebaserOut', "", this.handleUpdate).value), "style": ({flexGrow: '1'})})
                            )
                    );
                }
                
            })())
            );
        }
    });
};

Demos.DatabaseExplorer = function() {
    const Embed = function({docserver_id, style}) {
        if (!_l.isEmpty(docserver_id)) {
            return React.createElement("iframe", {"src": (`http://localhost:4000/dashboard/${docserver_id}`), "frameBorder": "0", "style": (style)});
        } else {
            return React.createElement("div", {"style": (style)});
        }
    };

    return createReactClass({
        getInitialState() { return {rows: [], docserver_id: ''}; },

        executeAcrossDocset(script) {
            return $.post('http://localhost:4444/exec/', {script}, data => {
                return this.setState({rows: data});
            });
        },

        render() {
            return React.createElement("div", {"style": ({display: 'flex', flex: 1})},
                React.createElement("div", {"style": ({display: 'flex', flexDirection: 'column'})},
                    React.createElement("div", null,
                        React.createElement(FormControl, {"valueLink": (LocalStorageValueLink('Script', "", (() => this.forceUpdate()))),  
                            "tag": "textarea",  
                            "placeholder": "Enter JS script",  
                            "style": ({
                                fontFamily: 'Menlo, Monaco, Consolas, "Droid Sans Mono", "Courier New", monospace',
                                fontSize: 13,
                                color: '#441173',

                                width: '100%', height: '5em',
                                WebkitAppearance: 'textfield'
                            })}),
                        React.createElement("button", {"onClick": (() => {
                            return this.executeAcrossDocset(LocalStorageValueLink('Script', "", (() => this.forceUpdate())).value);
                        }
                        )}, "Submit")
                    ),
                    React.createElement("table", {"style": ({overflow: 'auto', flex: 1})},
                        React.createElement("thead", null,
                            React.createElement("tr", null,
                                ([
                                    'doc id', 'docserver id', 'doc name', 'app id', 'app name', 'user id', 'first name', 'last name'
                                ].map(item => React.createElement("th", {"key": (item)}, (item))))
                            )
                        ),
                        React.createElement("tbody", null,
                            (this.state.rows.map((row, i) => {
                                return React.createElement("tr", {"key": (`${row[0]}-${i}`), "onClick": (() => this.setState({docserver_id: `${row[1]}`}))},
                                    (row.map((item, ind) => React.createElement("td", {"key": (`${item}-${i}-${ind}`)}, (item))))
                                );
                            }))
                        )
                    )
                ),
                React.createElement(Embed, {"docserver_id": (this.state.docserver_id), "style": ({width: '50%'})})
            );
        }
    });
};

Demos.LayoutPreviewToggle = function() {
    const {previewOfArtboard, layoutEditorOfArtboard} = require('./preview-for-puppeteer');
    const ArtboardBlock = require('../blocks/artboard-block');
    const {PdDropdown} = require('./component-lib');
    ({server} = require('../editor/server'));
    ({Doc} = require('../doc'));

    return createReactClass({
        getInitialState() { return {mode: 'layout', docjson: null}; },

        componentWillMount() {
            document.addEventListener('keydown', e => {
                if (e.shiftKey) { return this.setState({mode: this.state.mode === 'layout' ? 'content' : 'layout'}); }
            });

            this.unsubscribe = null;
            return this.pageIdUpdated(this.getPageIdValueLink().value);
        },

        getPageIdValueLink() { return LocalStorageValueLink('layout_preview_toggle_page_id', '', this.pageIdUpdated); },

        pageIdUpdated(new_val) {
            // the localStorage has already been modified
            this.forceUpdate();

            return server.docRefFromPageId(new_val, docRef => {
                // abort if we're out-of-date, which we can see because new_val isn't still the current value
                if (this.getPageIdValueLink().value !== new_val) { return; }

                // error state if there's no docref
                if (docRef == null) { return this.setState({docjson: null}); }

                // technically should probably unsubscribe earlier but...
                if (typeof this.unsubscribe === 'function') {
                    this.unsubscribe();
                }

                return this.unsubscribe = server.watchPage(docRef, (...args) => {
                    const [cas_token, new_json] = Array.from(args[0]);
                    return this.setState({docjson: new_json});
                });
            });
        },

        render() {
            let artboards, selectedArtboard;
            let e;
            const selectedArtboardVL = LocalStorageValueLink('layout_preview_selected_artboard_uniqueKey', '', (() => this.forceUpdate()));
            const docidValueLink = this.getPageIdValueLink();

            let error = null;
            if (this.state.docjson == null) { error = "no doc"; }

            if ((error == null)) {
                try {
                    let left;
                    const doc = Doc.deserialize(this.state.docjson);
                    doc.enterReadonlyMode();

                    artboards = doc.blocks.filter(block => block instanceof ArtboardBlock);
                    selectedArtboard = (left = _l.find(artboards, {uniqueKey: selectedArtboardVL.value})) != null ? left : _l.first(artboards);
                    if (selectedArtboard == null) { error = "no artboards"; }

                } catch (error1) {
                    e = error1;
                    console.error(e);
                    error = "error logged to console";
                }
            }

            return React.createElement(DemoContainer, {"style": ({flex: 1})},
                React.createElement("div", null,
                    React.createElement("div", {"style": ({margin: '0 auto', width: '400px'})},
                        React.createElement(FormControl, {"placeholder": "Doc id", "valueLink": (docidValueLink)}),
                        React.createElement("button", {"onClick": (() => {
                            return this.setState({mode: this.state.mode === 'layout' ? 'content' : 'layout'});
                        }
                            )}, (`Toggle to ${this.state.mode === 'layout' ? 'content' : 'layout'} mode`))
                    ),

                    React.createElement("div", {"className": "bootstrap", "style": ({marginBottom: '2em'})},
                        ( (error == null) ?
                            React.createElement(PdDropdown, {"title": (selectedArtboard.name),  
                                "onSelect": ((val, evt) => selectedArtboardVL.requestChange(val)),  
                                "options": (artboards.map(artboard => ({
                                    label: artboard.name,
                                    value: artboard.uniqueKey
                                })))}) : undefined
                        )
                    ),
                    ((() => { 
                        try {
                            if (error != null) {
                                return error;

                            } else if (this.state.mode === 'layout') {
                                return layoutEditorOfArtboard(selectedArtboard.uniqueKey, this.state.docjson);

                            } else if (this.state.mode === 'content') {
                                return previewOfArtboard(selectedArtboard.uniqueKey, this.state.docjson);
                            }

                        } catch (error2) {
                            e = error2;
                            console.error(e);
                            return "error logged to console";
                        }
                     })())
                )
            );
        }
    });
};


//#

// LoadedDemos :: {String, () -> ReactComponent}
const LoadedDemos = {};

const DemoPage = createReactClass({
    displayName: 'Demos',
    render() {
        let demoNameValueLink, left;
        const {value: demo_name} = (demoNameValueLink = this.getDemoNameValueLink());
        const CurrentDemo = (LoadedDemos[demo_name] != null ? LoadedDemos[demo_name] : (LoadedDemos[demo_name] = (left = (typeof Demos[demo_name] === 'function' ? Demos[demo_name]() : undefined)) != null ? left : this.DefaultDemo));

        return React.createElement("div", {"style": ({flex: 1, display: 'flex', flexDirection: 'column'})},
            React.createElement("style", {"dangerouslySetInnerHTML": ({__html: `\
@import url('https://fonts.googleapis.com/css?family=Roboto:100,300,400,600,700,900');
#app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}\
`})}),
            (
                demo_name === "RebaseExperiment" ?
                        React.createElement(FormControl, {"tag": "select", "valueLink": (demoNameValueLink)},
                        (
                            _l.keys(Demos).map((demo_name, i) => React.createElement("option", {"key": (i), "value": (demo_name)}, (demo_name)))
                        )
                        )

                :
                    React.createElement(DemoContainer, {"style": ({marginTop: '4em'})},
                        React.createElement("h1", {"style": ({fontFamily: 'Roboto'})},
                            React.createElement("span", {"style": ({letterSpacing: 0.5})}, "PAGE"),
                            React.createElement("span", {"style": ({fontWeight: '100'})}, "DEMOS")
                        ),
                        React.createElement("p", {"style": ({
                            fontFamily: 'Open Sans',
                            marginTop: -19,
                            marginBottom: '2em',
                            fontWeight: '300',
                            fontSize: '0.8em'
                        })},
                            ("If you're not working for Pagedraw, you probbably didn't mean to be here!  Cool find, don't tell anyone about it ;)")
                        ),

                        React.createElement("p", null,
                            React.createElement(FormControl, {"tag": "select", "valueLink": (demoNameValueLink)},
                            (
                                _l.keys(Demos).map((demo_name, i) => React.createElement("option", {"key": (i), "value": (demo_name)}, (demo_name)))
                            )
                            )
                        )
                    )
            ),
            React.createElement(CurrentDemo, null)
        );
    },

    DefaultDemo() {
        return React.createElement("div", null, "Select a demo");
    },

    getDemoNameValueLink() {
        return LocalStorageValueLink('default_demo', 'Blank', () => this.forceUpdate());
    }
});

ReactDOM.render(React.createElement(DemoPage, null), document.getElementById('app'));
