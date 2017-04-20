import {EJSON} from "meteor/ejson";
import React, {PureComponent} from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import TextField from "material-ui/TextField";
import RaisedButton from 'material-ui/RaisedButton';
import QrReader from "./qr-reader/qr-reader"
import enMsg from "../i18n/en-labels.json";
import {isValidAddress, signAndSubmit, soar} from "../../ethereum/ethereum-services";
import {eventListener, createRawTx} from "../../ethereum/ethereum-contracts";
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
            recipientAddress: Meteor.settings.public.recipientAddress,
            recipientName: "",
            amount: Meteor.settings.public.transferAmount,
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
        this._transferEvent = this._transferEvent.bind(this);
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

    _handleError(error) {

    }

    _handleChange(event, value) {
        let change = {};
        change[event.target.id] = value;
        this.setState(change);
    }

    _getQrValue(value) {
        this._validateAddress(null, value);
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
            this.setState({addressError: enMsg.transactions.invalidAddress})
        } else {
            Meteor.callPromise("get-name-for-address", address)
                .then((name) => this.setState({recipientName: name || enMsg.transactions.unknownAddress}))
        }
        this.setState({recipientAddress: address, readQr: false});
    }

    _validateAmount() {
        var valid = (this.state.amount.toString().match(/^-?\d*(\.\d+)?$/));
        this.setState({amountError: valid ? undefined : enMsg.transactions.amountError});
        return valid;
    }

    _transferEvent(error, result) {
        console.log(result);
        if(result && result.args &&
            result.args.from === currentProfile().address && result.args.to === this.state.recipientAddress){
            this.listener.stopWatching();
            this.listener = null;
            Meteor.call("update-balances", this.state.recipientAddress);
            this.props.wait.hide();
        }
    }

    _transfer() {
        let self = this;
        this.props.wait.show();

        if (!this._validateAmount()) return;

        let profile = currentProfile();
        if(this.listener) {
            this.listener.stopWatching();
        }
        let soarAmount = new BigNumber(self.state.amount);
        /*TODO: limit the events to those containing the sender's address*/
        eventListener("SoarCoinImplementation", "Transfer", undefined, this._transferEvent)
            .then(function (transferListener) {
                self.listener = transferListener;
                let soarAmount = new BigNumber(self.state.amount);
                return createRawTx("SoarCoin", "transfer", 0,
                    self.state.recipientAddress, soarAmount.times(soar).toString(10))
            })
            .then(function (tx) {
                console.log(tx);
                return signAndSubmit(self.props.password, tx.rawTx);
            })
            .then(function (transaction) {
                console.log("the transaction is", transaction);
            })
    }

    componentDidMount() {

    }

    render() {
        let content = null;
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
                                 src="/icons/png-512/camera.png"
                                 style={{height: 128, width: 128}}/>
                        </TableRowColumn>
                        <TableRowColumn style={{textAlign: "left", paddingLeft: 0, paddingRight: 0}}>
                            <TextField
                                id="amount"
                                type="number"
                                pattern="[0-9]*"
                                inputMode="numeric"
                                value={this.state.amount}
                                hintText={enMsg.appBar.amountOut}
                                errorText={this.state.amountError}
                                floatingLabelText={enMsg.appBar.amountOut}
                                onChange={this._handleChange}
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
                                hintText={enMsg.transactions.address}
                                floatingLabelText={enMsg.transactions.address}
                                errorText={this.state.addressError}
                                onChange={this._handleChange}
                                onBlur={this._validateAddress}
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
                                label={enMsg.appBar.send}
                                primary={true}
                                style={{width: "100%"}}
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
