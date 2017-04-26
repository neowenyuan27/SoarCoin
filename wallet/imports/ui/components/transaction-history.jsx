import React, {PureComponent} from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import {Transactions} from "../../model/transactions";
import {currentProfile} from "../../model/profiles";
import {soar} from "../../ethereum/ethereum-services";
import {BigNumber} from "bignumber.js";
import {List, ListItem} from "material-ui/List";
import Avatar from "material-ui/Avatar";
import SendCoinsIcon from "../icons/send-coins";
import ReceiveCoinsIcon from "../icons/receive-coins";
import enMsg from "../i18n/en-labels.js";

const styles = {
    title: {
        cursor: 'pointer',
    },
};

export default class TxHistory extends TrackerReact(PureComponent) {
    constructor(props, context) {
        super(props, context);

        this.state = {
            height: props.contentHeight,
        };

        this.avatarIn = <Avatar icon={<ReceiveCoinsIcon />}/>;
        this.avatarOut = <Avatar icon={<SendCoinsIcon />}/>;

        this._handleChange = this._handleChange.bind(this);
        this._listEntry = this._listEntry.bind(this);
    }

    _handleChange(value) {

    }

    componentDidMount() {

    }

    _listEntry(data, myAddress) {
        const value = new BigNumber(data.value).dividedBy(soar).toFormat(2);
        if (data.from === myAddress)
            return <ListItem
                key={data._id}
                leftAvatar={this.avatarOut}
                rightIcon={null}
                primaryText={enMsg.transactions.to(value, data.toMail || data.to)}
                secondaryText={data.timestamp.toString()}
            />
        else
            return <ListItem
                key={data._id}
                leftAvatar={this.avatarIn}
                rightIcon={null}
                primaryText={enMsg.transactions.from(value, data.fromMail || data.from)}
                secondaryText={data.timestamp.toString()}
            />

    }

    render() {
        const self = this;
        const tableData = Transactions.find({}, {sort: {timestamp: -1}}).fetch();
        const myAddress = currentProfile().address;
        return (
            <div style={{height: this.state.height, overflow: "auto"}}>
                <List>
                    {tableData.map((row) => {
                        return self._listEntry(row, myAddress);
                    })}
                </List>
            </div>
        )

    }
}
