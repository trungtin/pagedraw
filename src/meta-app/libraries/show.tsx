// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let LibraryPage;
import React from 'react';
import _l from 'lodash';
import $ from 'jquery';
import ReactMarkdown from 'react-markdown';
import moment from 'moment';
import LibraryTheme from './theme';
import modal from '../../frontend/modal';
import { Modal } from '../../editor/component-lib';
import FormControl from '../../frontend/form-control';
import createReactClass from 'create-react-class';

export default LibraryPage = createReactClass({
    displayName: 'LibraryPage',
    componentDidMount() {
        this.changelogOpen = false;
        return this.readmeState = this.props.readme;
    },

    linkAttr(prop, update) { return {
        value: this[prop],
        requestChange: newVal => {
            this[prop] = newVal;
            this.forceUpdate();
            return update();
        }
        }; },

    render() {
        return (
            <LibraryTheme current_user={this.props.current_user}>
                <div style={{width: '80%', margin: '50px auto'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <div style={{display: 'flex', alignItems: 'baseline'}}>
                            <p style={{fontSize: 43, color:'rgb(4, 4, 4, .88)', margin: 0}}>
                                {this.props.name}
                            </p>
                            <p style={{color: 'rgb(49, 49, 49, .88)'}}>
                                {this.props.version_name}
                            </p>
                        </div>
                        {!this.props.is_public ?
                                <div
                                    style={{width: 140, height: 40, backgroundColor: '#F1F1F1', borderRadius: 3, color: 'rgb(4, 4, 4, .7)', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <span>
                                        Private
                                    </span>
                                </div> : undefined}
                    </div>
                    <p style={{color: 'rgb(49, 49, 49, .6)'}}>
                        {this.props.description}
                    </p>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                        <div>
                            <button className="library-btn" onClick={() => {}}>
                                TRY IT OUT
                            </button>
                            <button
                                className="library-btn"
                                onClick={() => { this.changelogOpen = !this.changelogOpen; return this.forceUpdate(); }}>
                                CHANGELOG
                            </button>
                        </div>
                        <div>
                            <button
                                className="library-btn"
                                onClick={() => {
                                    return modal.show(closeHandler => { return [
                                        <Modal.Header closeButton={true}>
                                            <Modal.Title>
                                                Edit README
                                            </Modal.Title>
                                        </Modal.Header>,
                                        <Modal.Body>
                                            <FormControl
                                                tag="textarea"
                                                style={{height: 400, width: '100%'}}
                                                valueLink={this.linkAttr('readmeState', modal.forceUpdate)} />
                                        </Modal.Body>,
                                        <Modal.Footer>
                                            <button
                                                className="library-btn"
                                                style={{width: 100, margin: 5}}
                                                onClick={closeHandler}>
                                                Close
                                            </button>
                                            <button
                                                className="library-btn-primary"
                                                style={{width: 100, margin: 5}}
                                                onClick={() => {
                                                    return $.ajax({
                                                        url: `/libraries/${this.props.library_id}/versions/${this.props.version_id}`,
                                                        method: 'PUT',
                                                        headers: {'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')},
                                                        data: {readme: this.readmeState}
                                                    }).done(data => {
                                                        this.readmeState = data.readme;
                                                        this.forceUpdate();
                                                        return closeHandler();
                                                });
                                                }}>
                                                {`\
            Publish`}
                                            </button>
                                        </Modal.Footer>
                                    ]; });
                                }}>
                                EDIT README
                            </button>
                            <button
                                className="library-btn-primary"
                                onClick={() => {
                                    return modal.show(closeHandler => [
                                        <Modal.Header closeButton={true}>
                                            <Modal.Title>
                                                Publish New Version
                                            </Modal.Title>
                                        </Modal.Header>,
                                        <Modal.Body>
                                            <div className="bootstrap">
                                                <div className="form-group">
                                                    <label htmlFor="versionName">
                                                        Version Name
                                                    </label>
                                                    <FormControl
                                                        type="text"
                                                        style={{width: '100%'}}
                                                        valueLink={{value: null, requestChange: () => {}}}
                                                        id="versionName" />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="uploadCode">
                                                        Upload Code
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        style={{width: '100%'}}
                                                        id="uploadCode" />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="changelog">
                                                        Changelog
                                                    </label>
                                                    <textarea
                                                        type="text"
                                                        className="form-control"
                                                        style={{width: '100%'}}
                                                        id="changelog"
                                                        placeholder="What's new in this update?" />
                                                </div>
                                                <hr />
                                                <div className="form-group">
                                                    <label htmlFor="description">
                                                        Description
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        style={{width: '100%'}}
                                                        id="description" />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="homepage">
                                                        Homepage
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        style={{width: '100%'}}
                                                        id="homepage" />
                                                </div>
                                                <div className="form-group">
                                                    <label htmlFor="readme">
                                                        README
                                                    </label>
                                                    <textarea type="text" className="form-control" style={{width: '100%'}} id="readme" />
                                                </div>
                                            </div>
                                        </Modal.Body>,
                                        <Modal.Footer>
                                            <button
                                                className="library-btn"
                                                style={{width: 100, margin: 5}}
                                                onClick={closeHandler}>
                                                Close
                                            </button>
                                            <button
                                                className="library-btn-primary"
                                                style={{width: 100, margin: 5}}
                                                onClick={() => {}}>
                                                Publish
                                            </button>
                                        </Modal.Footer>
                                    ]);
                                }}>
                                PUBLISH UPDATE
                            </button>
                        </div>
                    </div>
                    {!this.props.is_public ? <p style={{float: 'right'}}>
                        {"A part of your private project "}
                        <a href={`/apps/${this.props.app_id}`}>
                            {this.props.app_name}
                        </a>
                    </p> : undefined}
                </div>
                {this.changelogOpen ?
                        <div
                            style={{width: '85%', maxHeight: 400, height: '100%', backgroundColor: '#F1F1F1', margin: '20px auto', borderRadius: 3, overflowY: 'scroll'}}>
                            <p style={{fontSize: 27, color: 'rgb(4, 4, 4, .77)', padding: 4}}>
                                Changelog
                            </p>
                            {this.props.changelog.map((item, i) => {
                                    return (
                                        <div style={{width: '90%', display: 'flex', margin: '0 auto'}} key={i}>
                                            <div>
                                                <p style={{fontWeight: 'bold'}}>
                                                    {item.name}
                                                </p>
                                                <p style={{fontSize: 14}}>
                                                    {moment(item.created_at).format('MMM DD YYYY')}
                                                </p>
                                            </div>
                                            <ReactMarkdown source={item.updates} escapeHtml={false} />
                                        </div>
                                    );
                                })}
                        </div> : undefined}
                <div
                    style={{width: '85%', height: '100%', backgroundColor: '#F1F1F1', margin: '0 auto', borderRadius: 3}}>
                    <div style={{padding: 5}}>
                        <p style={{color: 'rgb(49, 49, 49, .88)'}}>
                            How to install
                        </p>
                        <p style={{color: 'rgb(49, 49, 49, .6)'}}>
                            Some installation content here.  Not sure what it is yet.  Probably fairly in-depth.  Lorem, ipsum, dolor et m is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page
                        </p>
                    </div>
                </div>
                <div style={{width: '80%', margin: '0 auto'}}>
                    <ReactMarkdown source={this.props.readme} escapeHtml={false} />
                </div>
            </LibraryTheme>
        );
    }
});
