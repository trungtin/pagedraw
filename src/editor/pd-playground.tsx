/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS205: Consider reworking code to avoid use of IIFEs
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let PdPlayground;
import React from 'react';
import createReactClass from 'create-react-class';
import ReactDOM from 'react-dom';
import _l from 'lodash';
import config from '../config';
import Block from '../block';
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';
import PagedrawnPdPlayground from '../pagedraw/playground';
import analytics from '../frontend/analytics';
import { randomQuoteGenerator } from '../random';
import { InstanceBlock } from '../blocks/instance-block';
import ImageBlock from '../blocks/image-block';
import Zoomable from '../frontend/zoomable';
import { evalPdomForInstance, componentBlockTreesOfDoc } from '../core';
import { pdomToReactWithPropOverrides } from './pdom-to-react';
import { Editor } from '../editor/edit-page';

const defaultPlaygroundCode = `\
// Pagedraw generates JSX and CSS from the design mockup
// on the left. We simply import it here...
import MyPagedrawComponent from './pagedraw/generated';

class MyApp extends React.Component {
  render() {
    // ... so my render function is just one line. Yay!
    return <MyPagedrawComponent foo={this.state.foo}
        handleClick={this.handleClick} />;
  }

  handleClick() {
    this.setState({foo: generateRandomQuote()});
  }

  constructor() {
    super();
    this.state = { foo: 'The runtime data comes from the code' };
    this.handleClick = this.handleClick.bind(this);
  }
}\
`;

// This expects a single prop called "editor" which is edit-page.Editor
// The abstraction is kind of weird and maybe this should just be inside edit-page.Editor
// but I made it its own component to keep state like @playgroundCode disentangled from edit-page stuff
export default PdPlayground = createReactClass({
    componentWillMount() {
        // HACK turn off prototyping for playgrounds
        config.prototyping = false;

        this.playgroundCode = defaultPlaygroundCode;

        // ugh such a gross hack
        return window.didEditorCrashBeforeLoading = didCrash => {
            if (!didCrash) {
                this.refs.editor.selectBlocks([_l.find(this.refs.editor.doc.blocks, b => b instanceof ImageBlock)]);
                return this.dirty();
            }
        };
    },

    dirty() {
        return this.refs.editor.doc.inReadonlyMode(() => {
            return this.forceUpdate();
        });
    },

    render() {
        const scope =
            (() => {
            let componentBlockTrees;
            if (this.refs.editor == null) {
                return {MyPagedrawComponent: props => React.createElement("div", null)}; // loading

            } else if (_l.isEmpty((componentBlockTrees = componentBlockTreesOfDoc(this.refs.editor.doc)))) {
                return {MyPagedrawComponent: props => React.createElement("div", null, "No components found in drawing")};

            } else {
                const component = componentBlockTrees[0].block;
                const instance = new InstanceBlock({sourceRef: component.componentSpec.componentRef});
                instance.doc = this.refs.editor.doc;
                const compilerOpts = this.refs.editor.getInstanceEditorCompileOptions();
                const instancePdom = instance.toPdom(compilerOpts);

                return {
                    generateRandomQuote: randomQuoteGenerator,
                    MyPagedrawComponent: props => {
                        const instancePdomWithProps = _l.extend({}, instancePdom, {children: [_l.extend({}, instancePdom.children[0], {props})]});
                        // Right now the width argument is incorrect. It should be the width of the live preview, but since we don't use media queries in the
                        // playground (and we control the playground) it doesn't matter at all.

                        // Change this if we ever allow users to control the playground or use media queries in it.
                        const evaledPdom = evalPdomForInstance(instancePdomWithProps, compilerOpts.getCompiledComponentByUniqueKey, this.refs.editor.doc.export_lang, 0);

                        return pdomToReactWithPropOverrides(evaledPdom, undefined, (pdom, inner_props) => {
                            if ((_l.find(pdom.backingBlock != null ? pdom.backingBlock.eventHandlers : undefined, {name: 'onClick'}) == null)) { return inner_props; }
                            // HACK: every onClick becomes tied to props.handleClick
                            return _l.extend({}, inner_props, {onClick() {
                                analytics.track('Clicked Playground Preview');
                                return props.handleClick();
                            }
                            });
                    });
                    }
                };
            }
        })();

        const boxShadow = '0 2px 4px 0 rgba(50,50,93,.1)';

        const transformCode = function(code) {
            const valid = line => !line.startsWith('//') && !line.startsWith('import');
            return code.split('\n').filter(valid).join('\n');
        };

        const codeEditorStyle = {
            overflow: 'scroll',
            flex: '1',
            boxShadow,
            fontSize: 13,
            fontFamily: 'Menlo, Monaco, Consolas, "Droid Sans Mono", "Courier New", monospace',
            paddingLeft: 16,
            paddingTop: 12
        };

        const onCodeChange = nv => {
            analytics.track('Edited Playground code', {code: nv});
            return this.playgroundCode = nv;
        };

        const editor = React.createElement(Editor, {"ref": "editor",  
            "playground": (true),  
            "initialDocJson": (require('./default-playground-doc')),  
            "onChange": (() => {
                analytics.track('Interacted with Playground Doc');
                return this.dirty();
            }
            )});

        return React.createElement("div", null,
            React.createElement(LiveProvider, {"scope": (scope), "code": (this.playgroundCode), "transformCode": (transformCode)},
                React.createElement(PagedrawnPdPlayground, { 
                    "codeEditor": (React.createElement(LiveEditor, {"style": (codeEditorStyle), "onChange": (onCodeChange)})),  
                    "pdEditor": (editor),  
                    "preview": (React.createElement("div", null,
                        React.createElement(LiveError, null),
                        React.createElement(LivePreview, {"style": ({height: 300, overflow: 'scroll', display: 'flex', border: '1px solid gray', boxShadow})})
                    ))})
            )
        );
    }
});
