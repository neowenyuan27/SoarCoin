import React, {Component} from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import Toggle from "material-ui/Toggle";
import msgs from "../i18n/labels.js";

export default class RegistrationTest extends TrackerReact(Component) {
    constructor(props, context) {
        super(props, context);
        this.state = {
            validation: "pending",
            hidden: false
        };
        this._humanCheck = this._humanCheck.bind(this);
    }

    _humanCheck(event, checked) {
        let self = this;
        if (checked) {
            Meteor.callPromise("verify-captcha", this.props.token)
                .then(() => self.setState({validation: "success"}))
                .catch(() => self.setState({validation: "failure"}))
        }
    }

    render() {

        if (this.state.validation === "pending") {
            return (
                <div>
                    <h2>Please proove that you are human</h2>
                    <Toggle
                        label={msgs().login.human}
                        onToggle={this._humanCheck}
                    />
                </div>
            )
        }
        if (this.state.validation === "success") {
            return (
                <div>
                    <h2>Thank you for registering</h2>
                </div>
            )
        } else {
            return (
                <div>
                    <h2>Sorry something went wrong. Please try again</h2>
                    <h3>{this.state.message}</h3>
                </div>
            )
        }

    }
}
