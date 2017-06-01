import {Meteor} from "meteor/meteor";
import React, {PureComponent} from "react";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import FlatButton from "material-ui/FlatButton";
import TextField from "material-ui/TextField";
import Dialog from "material-ui/Dialog";
import msgs from "../i18n/labels.js";
import CryptoJS from "crypto-js";
import * as LocalStorage from "meteor/simply:reactive-local-storage";
import {createKeystore, getKeystore} from "../../ethereum/ethereum-services";
import {Profiles} from "../../model/profiles";

const styles = {
    title: {
        cursor: "pointer",
    },
};

export default class LoginDialog extends TrackerReact(PureComponent) {
    constructor(props, context) {
        super(props, context);
        Meteor.logout();

        this.mnemonic = LocalStorage.getItem("encrypted-mnemonic");
        this.salt = LocalStorage.getItem("salt");
        this.accountExists = !(!this.mnemonic);

        this.state = {
            loginButton: this.accountExists ? msgs().login.login : msgs().login.register,
            loginTitle: this.accountExists ? msgs().login.loginTitle : msgs().login.registerTitle,
            username: LocalStorage.getItem("username") || Meteor.settings.public.username,
            email: LocalStorage.getItem("email") || Meteor.settings.public.username,
            password: Meteor.settings.public.password,
            password2: Meteor.settings.public.password,
            invalidFields: true
        };

        this._handleChange = this._handleChange.bind(this);
        this._validateFields = this._validateFields.bind(this);
        this._validateEmail = this._validateEmail.bind(this);
        this._validatePIN = this._validatePIN.bind(this);
        this._toggleRegister = this._toggleRegister.bind(this);
        this._handleLoginOrRegister = this._handleLoginOrRegister.bind(this);
        this._passwordChange = this._passwordChange.bind(this);
        this._passwordMessage = this._passwordMessage.bind(this);
        this._reCaptchaVerifyCallback = this._reCaptchaVerifyCallback.bind(this);
    }

    _handleChange(event, value) {
        let change = {};
        change[event.target.id] = value;
        this.setState(change);

        if (!this.state.invalidFields) {
            /**in case the register button is active, the validation has to occur right away to avoid invalid data usage*/
            let self = this;
            Meteor.setTimeout(function () {
                self._validateEmail();
                self._validatePIN();
            })
        }
    };

    _validateFields() {
        let invalidFields = true;
        if (this.accountExists) {
            invalidFields = !this._checkPassword(this.state.password);
        } else {
            invalidFields = !(!!this.state.password && !!this.state.password2 && !!this.state.username &&
            !this.state.userError && !this.state.passwordError);
        }
        this.setState({
                invalidFields: invalidFields
            }
        )
        ;
    }

    _validateEmail() {
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        //TODO: add server verification that email is not yet registered
        if (re.test(this.state.username)) {
            Meteor.callPromise("verify-email", this.state.username)
                .then(res => {
                    if (res) {
                        this.setState({userError: undefined})
                    } else {
                        this.setState({userError: msgs().login.msgs.duplicate})
                    }
                })
        } else {
            this.setState({userError: msgs().login.msgs.incorrect});
        }

        Meteor.setTimeout(this._validateFields)
    }

    _validatePIN() {
        let validPin = this.state.password === this.state.password2 && this.state.password && this.state.password2;
        if (this.state.password && this.state.password2)
            this.setState({passwordError: validPin ? undefined : msgs().login.msgs.noMatch});
        else
            this.setState({passwordError: undefined});

        Meteor.setTimeout(this._validateFields)
    }

    _reCaptchaVerifyCallback(response) {
        console.log("recaptcha response", response);
    }

    _toggleRegister() {
        this.setState({
            isRegister: !this.state.isRegister,
            loginButton: this.state.isRegister ? msgs().login.register : msgs().login.login,
            loginTitle: this.state.isRegister ? msgs().login.registerTitle : msgs().login.loginTitle,
        });
    }

    _handleLoginOrRegister() {
        let keystorePassword = this.state.password;
        this.props.wait.show();
        let self = this;
        if (this.loggingIn) return;

        this.loggingIn = true;

        Meteor.callPromise("verify-email", this.state.username)
            .then(function (canRegister) {
                if (self.accountExists) {
                    let mnemonic = CryptoJS.AES.decrypt(self.mnemonic, keystorePassword).toString(CryptoJS.enc.Utf8);
                    getKeystore(keystorePassword)
                        .then(() => {
                            Meteor.loginWithPassword(self.state.username, mnemonic, (err) => {
                                if (err)
                                    return Promise.reject(err);
                                else {
                                    Meteor.call("sync-user-details");
                                    return Promise.resolve();
                                }
                            });
                        })
                        .catch(err => {
                            throw err
                        })
                } else if (canRegister) {
                    let email = self.state.username;

                    return createKeystore(email, keystorePassword, null, null)
                        .then((keystore) => {
                            let options = {
                                username: keystore.username,
                                email: email,
                                password: keystore.password,
                            };
                            Accounts.createUser(options, (err) => {
                                if (err) {
                                    logger.push("user creation error " + JSON.stringify(err));
                                    throw err;
                                } else {
                                    Profiles.insert({
                                        owner: Meteor.userId(),
                                        email: email,
                                        address: '0x' + keystore.username,
                                        salt: keystore.salt,
                                        mnemonicHash: keystore.mnemonicHash,
                                        soarBalance: 0,
                                        ethBalance: 0,
                                    }, function (err) {
                                        if (err) {
                                            logger.push(err);
                                            throw err;
                                        } else {
                                            Meteor.callPromise("send-verification-link", email).then(function () {
                                                Promise.resolve();
                                            })
                                        }
                                    });
                                }
                            })
                        })
                        .catch(err => {
                            throw err
                        });
                } else {
                    throw new Meteor.Error("e-mail allready registered");
                }
            })
            .then(() => {
                self.loggingIn = false;
                self.props.setPassword(keystorePassword);
                Promise.all([
                    Meteor.subscribe("current-profile").readyPromise(),
                    Meteor.subscribe("globals").readyPromise(),
                    Meteor.callPromise("sync-user-details"),
                ])
                    .then(function () {
                        self.props.wait.hide();
                        Meteor.subscribe("transactions");
                    })
            })
            .catch((error) => {
                self.loggingIn = false;
                logger.push("keystore creation error ", error);
                self.props.wait.hide()
                self.setState({message: error ? error.message : msgs().general.error})
            })
    }

    _registrationForm() {
        return (
            <div>
                <div>
                    <TextField
                        id="username"
                        type="email"
                        value={this.state.username}
                        hintText={msgs().login.user}
                        errorText={this.state.userError}
                        floatingLabelText={msgs().login.user}
                        onChange={this._handleChange}
                        onBlur={this._validateEmail}
                        ref={(input) => {
                            this.userInput = input;
                        }}
                    />
                </div>
                <div>
                    <TextField
                        id="password"
                        type="password"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={this.state.password}
                        hintText={msgs().login.password}
                        errorText={this.state.passwordError}
                        floatingLabelText={msgs().login.password}
                        onChange={this._handleChange}
                        onBlur={this._validatePIN}
                    />
                </div>
                <div>
                    <TextField
                        id="password2"
                        type="password"
                        pattern="[0-9]*"
                        inputMode="numeric"
                        value={this.state.password2}
                        hintText={msgs().login.password}
                        errorText={this.state.passwordError}
                        floatingLabelText={msgs().login.password}
                        onChange={this._handleChange}
                        onBlur={this._validatePIN}
                    />
                </div>
            </div>
        )
    }

    _checkPassword(password) {
        let correctPassword = false;
        try {
            correctPassword = !!password && CryptoJS.AES.decrypt(this.mnemonic, password).toString(CryptoJS.enc.Utf8).length > 1;
        } catch (err) {
            correctPassword = false;
        }
        if (correctPassword) {
            Meteor.setTimeout(this._handleLoginOrRegister);
        }
        return correctPassword;
    }

    _passwordChange(event, password) {
        this.setState({password: password, passwordError: undefined});
        Meteor.setTimeout(this._validateFields);
    }

    _passwordMessage() {
        this.setState({passwordError: this._checkPassword(this.state.password) ? undefined : msgs().login.msgs.wrong});
        Meteor.setTimeout(this._validateFields)
    }

    _loginForm() {
        return (
            <div>
                <TextField
                    id="password"
                    type="password"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={this.state.password}
                    hintText={msgs().login.password}
                    errorText={this.state.passwordError}
                    floatingLabelText={msgs().login.password}
                    onChange={this._passwordChange}
                    onBlur={this._passwordMessage}
                    ref={(input) => {
                        this.userInput = input;
                    }}
                />
            </div>
        )
    }

    componentDidMount() {
        let self = this;
        /**only select the field if it is displayed*/
        Meteor.setTimeout(function () {
            if (self.userInput) {
                if (self.accountExists) {
                    self._passwordMessage();
                } else {
                    self._validateEmail();
                    self._validatePIN();
                }
                // self.userInput.focus();
                self.userInput.select();
                Meteor.setTimeout(self._validateFields)
            }
        }, 1000)
    }

    render() {
        const showDialog = !Meteor.userId();
        if (!showDialog) return null;

        let form = undefined;
        if (this.accountExists) {
            form = this._loginForm();
        } else {
            form = this._registrationForm();
        }
        const loginButton = <FlatButton
            label={this.state.loginButton}
            primary={true}
            onTouchTap={this._handleLoginOrRegister}
            disabled={this.state.invalidFields}
        />

        let message = null;
        if (this.state.message) {
            message = <h2 style={{color: "red"}}>{this.state.message.replace("[", "").replace("]", "")}</h2>
        }

        return (
            <Dialog
                open={showDialog}
                actions={loginButton}
                onRequestClose={this._handleRequestClose}
                autoScrollBodyContent={true}
            >
                {form}
                {message}
            </Dialog>
        )

    }
}
