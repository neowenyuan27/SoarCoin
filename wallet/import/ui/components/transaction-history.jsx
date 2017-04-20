import {Meteor} from "meteor/meteor";
import React, {PureComponent} from 'react';
import TrackerReact from "meteor/ultimatejs:tracker-react";
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import enMsg from '../i18n/en-labels.json';
import ActionCameraEnhance from 'material-ui/svg-icons/action/camera-enhance';
import {
    Table,
    TableBody,
    TableFooter,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn
} from 'material-ui/Table';
const styles = {
    title: {
        cursor: 'pointer',
    },
};

export default class TxHistory extends TrackerReact(PureComponent) {
    constructor(props, context) {
        super(props, context);

        this.state = {
            fixedHeader: true,
            fixedFooter: true,
            stripedRows: false,
            showRowHover: false,
            selectable: true,
            multiSelectable: false,
            enableSelectAll: false,
            deselectOnClickaway: true,
            showCheckboxes: true,
            height: props.contentHeight,
        };

        this.tableData = [
            {
                name: 'John Smith',
                status: 'Employed',
                selected: true,
            },
            {
                name: 'Randal White',
                status: 'Unemployed',
            },
            {
                name: 'Stephanie Sanders',
                status: 'Employed',
                selected: true,
            },
            {
                name: 'Steve Brown',
                status: 'Employed',
            },
            {
                name: 'Joyce Whitten',
                status: 'Employed',
            },
            {
                name: 'Samuel Roberts',
                status: 'Employed',
            },
            {
                name: 'Adam Moore',
                status: 'Employed',
            },
            {
                name: 'John Smith',
                status: 'Employed',
                selected: true,
            },
            {
                name: 'Randal White',
                status: 'Unemployed',
            },
            {
                name: 'Stephanie Sanders',
                status: 'Employed',
                selected: true,
            },
            {
                name: 'Steve Brown',
                status: 'Employed',
            },
            {
                name: 'Joyce Whitten',
                status: 'Employed',
            },
            {
                name: 'Samuel Roberts',
                status: 'Employed',
            },
            {
                name: 'Adam Moore',
                status: 'Employed',
            },
            {
                name: 'John Smith',
                status: 'Employed',
                selected: true,
            },
            {
                name: 'Randal White',
                status: 'Unemployed',
            },
            {
                name: 'Stephanie Sanders',
                status: 'Employed',
                selected: true,
            },
            {
                name: 'Steve Brown',
                status: 'Employed',
            },
            {
                name: 'Joyce Whitten',
                status: 'Employed',
            },
            {
                name: 'Samuel Roberts',
                status: 'Employed',
            },
            {
                name: 'Adam Moore',
                status: 'Employed',
            },
        ];

        this._handleChange = this._handleChange.bind(this);
    }

    _handleChange(value) {

    }

    componentDidMount() {

    }

    render() {
        return (
            <div>
                <Table
                    height={this.state.height}
                    fixedHeader={this.state.fixedHeader}
                    fixedFooter={this.state.fixedFooter}
                    selectable={this.state.selectable}
                    multiSelectable={this.state.multiSelectable}
                >
                    <TableHeader
                        displaySelectAll={this.state.showCheckboxes}
                        adjustForCheckbox={this.state.showCheckboxes}
                        enableSelectAll={this.state.enableSelectAll}
                    >
                        <TableRow>
                            <TableHeaderColumn tooltip="The ID">ID</TableHeaderColumn>
                            <TableHeaderColumn tooltip="The Name">Name</TableHeaderColumn>
                            <TableHeaderColumn tooltip="The Status">Status</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody
                        displayRowCheckbox={this.state.showCheckboxes}
                        deselectOnClickaway={this.state.deselectOnClickaway}
                        showRowHover={this.state.showRowHover}
                        stripedRows={this.state.stripedRows}
                    >
                        {this.tableData.map((row, index) => (
                            <TableRow key={index} selected={row.selected}>
                                <TableRowColumn>{index}</TableRowColumn>
                                <TableRowColumn>{row.name}</TableRowColumn>
                                <TableRowColumn>{row.status}</TableRowColumn>
                            </TableRow>
                        ))}
                    </TableBody>
                    <TableFooter
                        adjustForCheckbox={this.state.showCheckboxes}
                    >
                        <TableRow>
                            <TableRowColumn>ID</TableRowColumn>
                            <TableRowColumn>Name</TableRowColumn>
                            <TableRowColumn>Status</TableRowColumn>
                        </TableRow>
                    </TableFooter>
                </Table></div>
        )

    }
}
