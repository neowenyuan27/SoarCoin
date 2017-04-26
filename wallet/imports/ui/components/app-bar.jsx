import React, {PureComponent} from 'react';
import TrackerReact from "meteor/ultimatejs:tracker-react";
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import Menu from 'material-ui/svg-icons/navigation/menu';
import enMsg from '../i18n/en-labels.json';
import {currentProfile} from "../../model/profiles"

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
        };
        this._handleTouchTap = this._handleTouchTap.bind(this);
    }

    _handleTouchTap() {
        Meteor.call("sync-user-details");
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

                </div>
            }
            onTitleTouchTap={this._handleTouchTap}
            iconElementLeft={<img height={40} src="/favicon.png"/>}
            iconElementRight={<IconButton><Menu /></IconButton>}
        />
    }
}
