import {EJSON} from "meteor/ejson";
import React, {PureComponent} from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import {Table, TableBody, TableRow, TableRowColumn} from "material-ui/Table";
import TextField from "material-ui/TextField";
import RaisedButton from "material-ui/RaisedButton";
import QrReader from "./qr-reader/qr-reader";
import msgs from "../i18n/labels.js";
import {isValidAddress, soar} from "../../ethereum/ethereum-services";
import BigNumber from "bignumber.js";
import {currentProfile} from "../../model/profiles";

const styles = {
    title: {
        cursor: 'pointer',
    },
};

export default class SendCoins extends TrackerReact(PureComponent) {
    constructor(props, context) {
        super(props, context);

        this.state = {
            readQr: false,
            recipientAddress: Meteor.settings.public.recipientAddress || "",
            recipientName: "",
            amount: Meteor.settings.public.transferAmount || "0",
            previewStyle: {
                height: 400,
                width: 150,
            }
        };

        this._toggleQRReader = this._toggleQRReader.bind(this);
        this._handleScan = this._handleScan.bind(this);
        this._handleError = this._handleError.bind(this);
        this._handleChange = this._handleChange.bind(this);
        this._getQrValue = this._getQrValue.bind(this);
        this._validateAddress = this._validateAddress.bind(this);
        this._validateAmount = this._validateAmount.bind(this);
        this._transfer = this._transfer.bind(this);
    }

    _toggleQRReader() {
        this.setState({readQr: !this.state.readQr});
    }

    _handleScan(value) {
        let scan = EJSON.parse(value);
        if (typeof scan === "object") {
            this.setState({
                result: value,
            })
        }
    }

    _selectOnFocus(event) {
        event.target.select();
    }

    _handleError(error) {

    }

    _handleChange(event, value) {
        let change = {};
        change[event.target.id] = value;
        this.setState(change);
    }

    _getQrValue(value) {
        logger.push("QR-value", value);
        this._validateAddress(null, value);
        if (value && this._validateAmount(value.amount)) {
            this.setState({amount: parseFloat(value.amount).toString()});
        }
    }

    _validateAddress(event, value) {
        if (!value) value = this.state.recipientAddress;

        let address = null;
        if (value.address) {
            address = value.address;
        } else {
            address = value;
        }

        if (!isValidAddress(address)) {
            this.setState({addressError: msgs().transactions.invalidAddress})
        } else {
            Meteor.callPromise("get-name-for-address", address)
                .then((name) => this.setState({
                    recipientName: name || msgs().transactions.unknownAddress,
                    addressError: null
                }))
        }
        this.setState({recipientAddress: address, readQr: false});
    }

    _validateAmount() {
        var valid = (this.state.amount.toString().match(/^-?\d*(\.\d+)?$/));
        this.setState({amountError: valid ? undefined : msgs().transactions.amountError});
        return valid;
    }

    _transfer() {
        let self = this;
        self.props.wait.show();
        let amount = new BigNumber(this.state.amount).times(soar);
        Meteor.callPromise("transfer-soar", amount.toString(10), this.state.recipientAddress)
            .then(() => self.props.wait.hide())
            .catch(() => self.props.wait.hide())
    }

    componentDidMount() {

    }

    render() {
        let content = null;
        const profile = currentProfile();

        /*only show this if there is a logged in user*/
        if (profile.address === "0x0") return null;

        if (this.state.readQr) {
            content = <div onTouchTap={this._toggleQRReader} style={{marginLeft: -40}}>
                <QrReader onSuccess={this._getQrValue}/>
            </div>
        } else {
            content = <Table selectable={false}>
                <TableBody displayRowCheckbox={false}>
                    <TableRow style={{verticalAlign: "top", borderBottom: "0px"}}>
                        <TableRowColumn style={{textAlign: "left", paddingLeft: 0, paddingRight: 0, width: 128}}>
                            <img onTouchTap={this._toggleQRReader}
                                 src="/img/qr-camera.png"
                                 style={{height: 128, width: 128}}/>
                        </TableRowColumn>
                        <TableRowColumn style={{textAlign: "left", paddingLeft: 16, paddingRight: 0}}>
                            <TextField
                                id="amount"
                                type="number"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                value={this.state.amount}
                                hintText={msgs().appBar.amountOut}
                                errorText={this.state.amountError}
                                floatingLabelText={msgs().appBar.amountOut}
                                onChange={this._handleChange}
                                onFocus={this._selectOnFocus}
                                ref={(input) => this.amountInput = input}
                            />
                            <br/>
                            <br/>
                            <span>{this.state.recipientName}</span>
                        </TableRowColumn>
                    </TableRow>
                    <TableRow style={{borderBottom: "0px"}}>
                        <TableRowColumn colSpan="2"
                                        style={{textAlign: "left", paddingLeft: 0, paddingRight: 0, paddingTop: 12}}>
                            <TextField
                                id="recipientAddress"
                                type="text"
                                value={this.state.recipientAddress}
                                hintText={msgs().transactions.address}
                                floatingLabelText={msgs().transactions.address}
                                errorText={this.state.addressError}
                                onChange={this._handleChange}
                                onBlur={this._validateAddress}
                                onFocus={this._selectOnFocus}
                                ref={(input) => {
                                    this.userInput = input;
                                }}
                                style={{width: "100%"}}
                            />
                        </TableRowColumn>
                    </TableRow>
                    <TableRow style={{borderBottom: "0px"}}>
                        <TableRowColumn colSpan="2" style={{paddingTop: 60}}>
                            <RaisedButton
                                onTouchTap={this._transfer}
                                label={msgs().appBar.send}
                                primary={true}
                                style={{width: "100%"}}
                                disabled={profile.soarBalance.comparedTo(this.state.amount) === -1}
                            />
                        </TableRowColumn>
                    </TableRow>
                </TableBody>
            </Table>;
        }

        return (
            <div>
                {content}
            </div>
        )

    }
}
