// TODO: This file was created by bulk-decaffeinate.
// Sanity-check the conversion and remove this comment.
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
// FIXME: This whole file should probably be in frontend/
let Button, ButtonGroup, ButtonToolbar, DropdownButton, Glyphicon, MenuItem, Modal, PdButtonGroup, PdButtonOne, PdDropdown, PdDropdownTwo, PdIndexDropdown, PdPopupMenu, PdSidebarButton, pdSidebarHeaderFont, PdTabBar, PdVlDropdownTwo, SidebarHeaderAddButton, SidebarHeaderRemoveButton, Tab, Tabs;
import React from 'react';
import createReactClass from 'create-react-class';
import _l from 'lodash';
({Glyphicon, Tabs, Tab, Modal, DropdownButton, MenuItem, Glyphicon, ButtonGroup, Button, ButtonToolbar} = require('react-bootstrap'));
import { Dropdown } from 'semantic-ui-react';
import Bp from '@blueprintjs/core';
const defaultExport = {};
_l.extend(defaultExport, {'MenuDivider': Bp.MenuDivider, 'Menu': Bp.Menu, 'MenuItem': Bp.MenuItem});

const FormControl = require('../frontend/form-control');

defaultExport.pdSidebarHeaderFont = (pdSidebarHeaderFont = {fontFamily: 'inherit', fontSize: 14, fontWeight: '500'});

defaultExport.PdButtonOne = (PdButtonOne = ({type, onClick, children, disabled, stretch, submit}) => <Button
    type={submit ? 'submit' : 'button'}
    bsStyle={type}
    active={false}
    onClick={onClick}
    disabled={disabled}
    block={stretch}>
    {children}
</Button>);

defaultExport.PdSidebarButton = (PdSidebarButton = ({onClick, children}) => <button style={{width: '100%'}} onClick={onClick}>
    {children}
</button>);

defaultExport.PdButtonGroup = (PdButtonGroup = ({buttons}) => <ButtonGroup className="sidebar-select-control" bsSize="sm">
    {_l.compact(buttons).map((buttonProps, i) => <PdButtonOne key={i} {..._l.omit(buttonProps, 'label')}>
        {buttonProps.label}
    </PdButtonOne>)}
</ButtonGroup>);

defaultExport.PdButtonBar = ButtonToolbar;

defaultExport.PdIconGroup = PdButtonGroup;

defaultExport.PdSpinner = ({size}) => <svg
    className="spinner"
    width={`${size != null ? size : 40}px`}
    height={`${size != null ? size : 40}px`}
    viewBox="0 0 66 66"
    xmlns="http://www.w3.org/2000/svg">
    <circle
        className="spinner-path"
        fill="none"
        strokeWidth="6"
        strokeLinecap="round"
        cx="33"
        cy="33"
        r="30" />
</svg>;

defaultExport.PdCheckbox = ({label, valueLink, disabled}) => <Bp.Checkbox
    label={label}
    checked={valueLink.value}
    onChange={function(evt) { return valueLink.requestChange(!valueLink.value); }}
    disabled={disabled} />;

//PdDropdown A :: ({
//  value: A,
//  options: [A],
//  label: (A) -> ReactElement,
//  onSelect: (A) -> IO ()
//}) -> ReactElement
defaultExport.PdDropdown = (PdDropdown = ({value, onSelect, options, label, id}) => <DropdownButton title={label(value)} onSelect={onSelect} id={id}>
    {options.map((value, i) => <MenuItem eventKey={value} key={i}>
        {label(value)}
    </MenuItem>)}
</DropdownButton>);

defaultExport.PdDropdownTwo = (PdDropdownTwo = ({value, options, onSelect, stretch, style}) => <select
    className="sidebar-select"
    style={_l.extend({width: stretch ? '100%' : undefined}, style)}
    value={value}
    onChange={function(evt) { return onSelect(evt.target.value, evt); }}>
    {options.map(({value, label}, i) => <option key={i} value={value}>
        {label}
    </option>)}
</select>);

defaultExport.PdVlDropdownTwo = (PdVlDropdownTwo = ({valueLink, options, stretch, style}) => <PdDropdownTwo
    value={valueLink.value}
    onSelect={valueLink.requestChange}
    stretch={stretch}
    style={style}
    options={options} />);

defaultExport.PdPopupMenu = (PdPopupMenu = ({label, iconName, options, onSelect}) => <select
    onChange={evt => onSelect(evt.target.value)}
    style={{
        width: '14px',
        appearance: 'none',
        WebkitAppearance: 'none',
        fontFamily: 'Material Icons',
        outline: 'none',
        border: 'none',
        background: 'none'
    }}
    value={label}>
    <option disabled={true} hidden={true} value={label}>
        {iconName}
    </option>
    <option disabled={true} value="no-value">
        {label}
    </option>
    {options.map((title, index) => {
            return (
                <option key={title} value={index}>
                    {title}
                </option>
            );
        })}
</select>);
// props:
//   defaultIndex: Number
//   options: [{value: String, handler: (->)}]

// defaultIndex is misnamed; it should just be selectedIndex

defaultExport.PdIndexDropdown = (PdIndexDropdown = createReactClass({
    render() {
        return (
            <PdDropdownTwo
                value={this.props.defaultIndex}
                onSelect={this.handleSelect}
                stretch={this.props.stretch}
                options={this.props.options.map(({value, handler}, i) => ({
                    value: i,
                    label: value
                }))} />
        );
    },

    handleSelect(val) {
        try { return this.props.options[parseInt(val)].handler(); }
        catch (e) { return console.log(e.toString()); }
    }
}));


defaultExport.PdSearchableDropdown = function({search, options, text, onChange}) {
    // Semantic UI does this stupid thing where they make value be a string.  Since that's obviously not something we want,
    // let's give all options index-based values, then look up the original option before telling our caller.
    const s_ui_opts = options.map(function(opt, i) {
        const o = _l.extend({key: i}, opt, {value: i});
        delete o.matches;
        delete o.onSelect;
        return o;
    });

    return (
        <div className="semantic">
            <Dropdown
                style={{'margin': '0 -1px 0 -1.5px'}}
                className="pd-searchable-dropdown"
                fluid={true}
                selection={true}
                searchInput={{type: 'string'}}
                id=// Dropdown button's 'id' prop is required for accessibility or will warn
                "pd-searchable-dropdown"
                text={text}
                options={s_ui_opts}
                search={(menuItems, query) => menuItems.filter(item => options[item.value].matches(query))}
                onChange={(evt, {value}) => {
                    // I genuinely have no idea what these types are, and can't find docs anywhere.
                    // I *think* the second parameter is the selected value
                    return options[value].onSelect();
                }} />
        </div>
    );
};

defaultExport.PdTabBar = (PdTabBar = ({tabs}) => <div style={_l.extend({}, pdSidebarHeaderFont, {display: 'flex', height: 30})}>
    {tabs.map(function({open, label, onClick, key}, i) {
            const common = {flexGrow: '1', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center'};
            if (open) {
                return (
                    <div key={key} style={_l.extend({}, common, {color: '#444'})}>
                        {label}
                    </div>
                );
            } else {
                const style = _l.extend({}, common, {borderBottom: '1px solid #c4c4c4', color: '#aaa'});
                if ((i < (tabs.length - 1)) && tabs[i + 1].open) { _l.extend(style, {borderRight: '1px solid #c4c4c4', borderBottomRightRadius: 3}); }
                if ((i > 0) && tabs[i-1].open) { _l.extend(style, {borderLeft: '1px solid #c4c4c4', borderBottomLeftRadius: 3}); }
                return (
                    <div key={key} onClick={onClick} style={style}>
                        {label}
                    </div>
                );
            }
        })}
</div>);

// FIXME: Rename these to PdModal, PdTab, etc to be consistent
defaultExport.Modal = Modal;
defaultExport.Tabs = Tabs;
defaultExport.Tab = Tab;
defaultExport.Glyphicon = Glyphicon;


//# Sidebar

defaultExport.SidebarHeaderAddButton = (SidebarHeaderAddButton = ({style, onClick}) => <i className="material-icons md-14" style={style} onClick={onClick}>
    add
</i>);

defaultExport.SidebarHeaderRemoveButton = (SidebarHeaderRemoveButton = ({style, onClick}) => <i className="material-icons md-14" style={style} onClick={onClick}>
    remove
</i>);
export default defaultExport;
