import React, {Component} from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";

export default class RegistrationTest extends TrackerReact(Component) {
    constructor(props, context) {
        super(props, context);
        this.state = {validation: "pending"};
        this._renderReaptcha = this._renderReaptcha.bind(this);
    }

    _renderReaptcha() {
        let self = this;
        Session.set("recaptcha-ready", false);
        Meteor.setTimeout(function () {
            grecaptcha.render('recaptcha-container', {
                'sitekey': Meteor.settings.public.recaptcha.key,
                'callback': function (captcha) {
                    Meteor.call("verify-captcha", captcha, self.props.token, function (err, success) {
                        if (err) {
                            self.setState({
                                validation: "failure",
                                message: err.message
                            });
                            grecaptcha.reset();
                        } else {
                            self.setState({
                                validation: "success",
                            });
                        }
                    })
                }
                ,
                'theme': 'light'
            });
        }, 1000);
    }

    render() {
        if (Session.get("recaptcha-ready")) this._renderReaptcha();

        if (this.state.validation === "pending") return null;

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
