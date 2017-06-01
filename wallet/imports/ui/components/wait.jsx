import React, {PureComponent} from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import Dialog from 'material-ui/Dialog';

const style = {
    cursor: 'wait',
    height: 128,
    width: 128,
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
};

export default class SendCoins extends TrackerReact(PureComponent) {
    constructor(props, context) {
        super(props, context);

        this.state = {};

    }

    render() {
        return (
            <Dialog
                open={this.props.show}
            >
                <img src="/img/gears.svg" style={style}/>
            </Dialog>
        )

    }
}
