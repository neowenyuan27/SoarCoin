import React, {PureComponent} from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";

export default class PleaseConfirm extends TrackerReact(PureComponent) {
    constructor(props, context) {
        super(props, context);

        this.state = {};

    }

    render() {
        let user = Meteor.user();
        let showDialog = false;
        let email = {};
        if(user) {
            email = user.emails[0];
            showDialog = !email.verified;
            if (email.verified) return null;
        }

        return (
            <Dialog
                open={showDialog}
            >
                <h2 style={{lineHeight: "200%"}}>You have to confirm your email {email.address} before you can use the wallet</h2>
                <FlatButton
                    label="resend confirmation message"
                    primary={true}
                    onTouchTap={() => Meteor.call("send-verification-link", Meteor.user().emails[0].address)}
                />
            </Dialog>
        )

    }
}
