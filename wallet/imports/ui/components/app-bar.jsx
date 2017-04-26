import React, {PureComponent} from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import AppBar from "material-ui/AppBar";
import Snackbar from "material-ui/Snackbar";
import IconButton from "material-ui/IconButton";
import Menu from "material-ui/svg-icons/navigation/menu";
import enMsg from "../i18n/en-labels.js";
import {currentProfile} from "../../model/profiles";
import {Transactions} from "../../model/transactions";
import {soar} from "../../ethereum/ethereum-services";
import {BigNumber} from "bignumber.js";

const styles = {
    title: {
        cursor: 'pointer',
    },
};

export default class WalletAppBar extends TrackerReact(PureComponent) {
    constructor(props, context) {
        super(props, context);

        this.state = {
            open: false,
            toastOpen: true,
            toastMessage: "toast message",
            autoHideDuration: 4000,
        };

        let now = new Date();
        let profile = currentProfile();
        let self = this;
        Transactions.find({timestamp: {$gt: now}}).observe({
            added: function (transfer) {
                if(transfer.to = profile.address){
                    const value = new BigNumber(transfer.value).dividedBy(soar).toFormat(2);
                    self.setState({
                        toastOpen: true,
                        toastMessage: enMsg.transactions.from(value, transfer.fromMail || transfer.from)
                    });
                    Meteor.call("sync-user-details");
                }
            }
        })

        this._handleTouchTap = this._handleTouchTap.bind(this);
        this._handleToastTouchTap = this._handleToastTouchTap.bind(this);
        this._handleRequestClose = this._handleRequestClose.bind(this);
    }

    _handleTouchTap() {
        Meteor.call("sync-user-details");
    }

    _handleToastTouchTap() {
        this.setState({toastOpen: false})
    }

    _handleRequestClose() {
        this.setState({toastOpen: false})
    }

    /**
     * This example uses an [IconButton](/#/components/icon-button) on the left, has a clickable `title`
     * through the `onTouchTap` property, and a [FlatButton](/#/components/flat-button) on the right.
     */
    render() {

        return <AppBar
            title={
                <div>
                    <span style={styles.title}>{currentProfile().formattedSoarBalance + " " + enMsg.appBar.title}</span>
                    <Snackbar
                        open={this.state.toastOpen}
                        message={this.state.toastMessage}
                        action="dismiss"
                        autoHideDuration={this.state.autoHideDuration}
                        onActionTouchTap={this._handleToastTouchTap}
                        onRequestClose={this._handleRequestClose}
                    />
                </div>
            }
            onTitleTouchTap={this._handleTouchTap}
            iconElementLeft={<img height={40} src="/favicon.png"/>}
            iconElementRight={<IconButton><Menu /></IconButton>}
        />
    }
}
