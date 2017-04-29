import {Meteor} from "meteor/meteor";
import {EJSON} from "meteor/ejson";
import React, {PureComponent} from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import TextField from "material-ui/TextField";
import enMsg from "../i18n/en-labels.js";
import {QRCode} from "react-qr-svg";
import {currentProfile} from "../../model/profiles";
import CopyToClipboard from "react-copy-to-clipboard";
import RaisedButton from "material-ui/RaisedButton";
import ContentCopy from "material-ui/svg-icons/content/content-copy";

const style = {
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
};

export default class ReceiveCoins extends TrackerReact(PureComponent) {
    constructor(props, context) {
        super(props, context);

        this.state = {
            bigQr: true,
            amount: 0
        };

        this._toggleBigQr = this._toggleBigQr.bind(this);
        this._handleChange = this._handleChange.bind(this);
    }

    _toggleBigQr() {
        this.setState({bigQr: !this.state.bigQr});
    }

    _handleChange(event, value) {
        let change = {};
        change[event.target.id] = value;
        this.setState(change);
    }

    _selectOnFocus(event) {
        event.target.select();
    }

    componentDidMount() {
        console.log("receive did mount");
        if (this.amountInput) this.amountInput.select();
    }

    render() {
        /*only show this if there is a logged in user*/
        if (!Meteor.userId()) return null;

        let address = currentProfile().address;

        const qrValue = EJSON.stringify({
            address: address,
            amount: this.state.amount
        })
        //TODO: when amount is not 0 listen for transfer event
        return (
            <div style={style}>
                <div>
                    <QRCode
                        value={qrValue}
                        size={256}
                        level="H"
                        bgColor="#FFFFFF"
                        fgColor="#000000"
                        onClick={this._toggleBigQr}
                    />
                </div>
                <form>
                    <TextField
                        id="amount"
                        type="number"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={this.state.amount}
                        hintText={enMsg.appBar.amountIn}
                        errorText={this.state.amountError}
                        floatingLabelText={enMsg.appBar.amountIn}
                        onChange={this._handleChange}
                        onFocus={this._selectOnFocus}
                        ref={(input) => this.amountInput = input}
                    />
                    <CopyToClipboard text={address}
                                     onCopy={this._copyAddress}>
                        <RaisedButton
                            label={enMsg.general.copyAddress}
                            icon={<ContentCopy />}
                            primary={true}
                        />
                    </CopyToClipboard>

                </form>

            </div>
        )

    }
}
