import React, {PureComponent} from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import {Tracker} from "meteor/tracker";
import AppBar from "material-ui/AppBar";
import Snackbar from "material-ui/Snackbar";
import IconButton from "material-ui/IconButton";
import Menu from "material-ui/svg-icons/navigation/menu";
import enMsg from "../i18n/en-labels.js";
import {currentProfile, Profiles} from "../../model/profiles";
import {Transactions} from "../../model/transactions";
import {getWeb3, soar} from "../../ethereum/ethereum-services";
import BigNumber from "bignumber.js";

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
            toastOpen: false,
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

        Tracker.autorun(function () {
            if(Meteor.user()){
                const checkEthBalance = function () {
                    let ethBalance = new BigNumber(currentProfile().ethBalance);
                    let gasPrice = new BigNumber(Meteor.settings.public.txGas).times(getWeb3().eth.gasPrice);
                    /**if there is not enough gas to create two transactions*/
                    if (ethBalance.dividedBy(gasPrice).comparedTo(2) === -1) {
                        Meteor.call("refill-ether");
                    }
                };
                /**check the ETH balance when the application first renders and then every time the balance changes*/
                checkEthBalance();

                Profiles.find({owner: Meteor.userId()}).observe({
                    changed: function (id, fields) {
                        if (fields.ethBalance) {
                            checkEthBalance();
                        }
                    }
                })
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
