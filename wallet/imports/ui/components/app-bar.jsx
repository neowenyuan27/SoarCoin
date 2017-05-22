import React, {PureComponent} from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import AppBar from "material-ui/AppBar";
import Drawer from "material-ui/Drawer";
import Snackbar from "material-ui/Snackbar";
import IconButton from "material-ui/IconButton";
import FontIcon from "material-ui/FontIcon";
import Menu from "material-ui/svg-icons/navigation/menu";
import msgs from "../i18n/labels.js";
import {currentProfile} from "../../model/profiles";
import {Transactions} from "../../model/transactions";
import {soar} from "../../ethereum/ethereum-services";
import BigNumber from "bignumber.js";
import {white} from "material-ui/styles/colors";
import {List, ListItem} from "material-ui/List";

const styles = {
    title: {
        cursor: 'pointer',
    },
};

export default class WalletAppBar extends TrackerReact(PureComponent) {
    constructor(props, context) {
        super(props, context);

        this.state = {
            toastOpen: false,
            toastMessage: "toast message",
            autoHideDuration: 4000,
            drawerOpen: false,
        };

        let now = new Date();
        let self = this;
        Transactions.find({timestamp: {$gt: now}}).observe({
            added: function (transfer) {
                if (transfer.to === currentProfile().address) {
                    const value = new BigNumber(transfer.value).dividedBy(soar).toFormat(2);
                    self.setState({
                        toastOpen: true,
                        toastMessage: msgs().transactions.from(value, transfer.fromMail || transfer.from)
                    });
                    Meteor.call("sync-user-details");
                }
            }
        })

        this._handleTouchTap = this._handleTouchTap.bind(this);
        this._handleToastTouchTap = this._handleToastTouchTap.bind(this);
        this._handleRequestClose = this._handleRequestClose.bind(this);
        this._openDrawer = this._openDrawer.bind(this);
        this._closeDrawer = this._closeDrawer.bind(this);
        this._setLanguage = this._setLanguage.bind(this);
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

    _openDrawer() {
        this.setState({drawerOpen: true});
    }

    _closeDrawer() {
        this.setState({drawerOpen: false});
    }

    _setLanguage(lang) {
        Session.set("language", lang);
        this._closeDrawer();
    }

    _changePassword() {
        // alert("change password");
    }

    /**
     * This example uses an [IconButton](/#/components/icon-button) on the left, has a clickable `title`
     * through the `onTouchTap` property, and a [FlatButton](/#/components/flat-button) on the right.
     */
    render() {

        return (
            <div>
                <AppBar
                    title={
                        <div>
                        <span
                            style={styles.title}>{currentProfile().formattedSoarBalance + " " + msgs().appBar.title}</span>
                            <Snackbar
                                open={this.state.toastOpen}
                                message={this.state.toastMessage}
                                action={msgs().appBar.dismiss}
                                autoHideDuration={this.state.autoHideDuration}
                                onActionTouchTap={this._handleToastTouchTap}
                                onRequestClose={this._handleRequestClose}
                            />
                        </div>
                    }
                    onTitleTouchTap={this._handleTouchTap}
                    iconElementLeft={<img height={40} src="/favicon.png"/>}
                    iconElementRight={<IconButton onTouchTap={this._openDrawer}><Menu /></IconButton>}
                />
                <Drawer width={200} openSecondary={true} open={this.state.drawerOpen}>
                    <AppBar
                        title="Menu"
                        iconElementLeft={<FontIcon className="material-icons" color={white}>close</FontIcon>}
                        onTitleTouchTap={this._closeDrawer}
                        onLeftIconButtonTouchTap={this._closeDrawer}
                    />
                    <List>
                        <ListItem primaryText={msgs().drawer.english}
                                  onTouchTap={() => this._setLanguage("en")}
                                  leftIcon={<img src="/img/flags/24/us.png"/>}/>
                        <ListItem primaryText={msgs().drawer.chinese}
                                  onTouchTap={() => this._setLanguage("cn")}
                                  leftIcon={<img src="/img/flags/24/cn.png"/>}/>
                        <ListItem primaryText={msgs().drawer.french}
                                  onTouchTap={() => this._setLanguage("fr")}
                                  leftIcon={<img src="/img/flags/24/fr.png"/>}/>
                        <ListItem primaryText={msgs().drawer.german}
                                  onTouchTap={() => this._setLanguage("de")}
                                  leftIcon={<img src="/img/flags/24/de.png"/>}/>
                        {/*
                         <ListItem primaryText={msgs().drawer.password}
                         onTouchTap={this._changePassword}
                         leftIcon={<Lock />}/>
                         */}
                    </List>
                </Drawer>
            </div>
        )
    }
}
