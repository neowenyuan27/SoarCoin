/**
 * In this file, we create a React component
 * which incorporates components provided by Material-UI.
 */
import React, {PureComponent} from "react";
import {deepOrange500} from "material-ui/styles/colors";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import WalletAppBar from "./components/app-bar";
import WalletBottomNavigation from "./components/bottom-navigation";
import LoginDialog from "./components/login";
import Wait from "./components/wait";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import PleaseConfirm from "./components/please-confirm";

const styles = {
    container: {
        textAlign: "center",
        paddingTop: 200,
    },
};


class Main extends TrackerReact(PureComponent) {
    constructor(props, context) {
        super(props, context);

        this.state = {
            open: false,
            showWait: false,
            password: "",
        };

        this._handleRequestClose = this._handleRequestClose.bind(this);
        this._handleTouchTap = this._handleTouchTap.bind(this);
        this._setPassword = this._setPassword.bind(this);
    }

    _muiTheme() {
        return getMuiTheme({
            palette: {
                accent1Color: deepOrange500,
            },
            userAgent: navigator.userAgent,
        });
    }

    _handleRequestClose() {
        this.setState({
            open: false,
        });
    }

    _handleTouchTap() {
        this.setState({
            open: true,
        });
    }

    _wait() {
        let self = this;
        return {
            show: function(){
                self.setState({showWait: true})
            },
            hide: function(){
                self.setState({showWait: false})
            },
        }
    }

    _setPassword(password) {
        this.setState({password: password});
    }

    render() {

        return (
            <MuiThemeProvider muiTheme={this._muiTheme()}>
                <div>
                    <WalletAppBar/>
                    <LoginDialog wait={this._wait()} setPassword={this._setPassword}/>
                    <WalletBottomNavigation wait={this._wait()} password={this.state.password}/>

                    <Wait show={this.state.showWait}/>
                    <PleaseConfirm/>
                </div>
            </MuiThemeProvider>
        );
    }
}

export default Main;
