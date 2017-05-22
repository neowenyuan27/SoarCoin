import React from "react";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import createBrowserHistory from "history/createBrowserHistory";
// route components
import Main from "../imports/ui/Main";
import RegistrationTest from "../imports/ui/components/registration-test";
import {deepOrange500} from "material-ui/styles/colors";
import getMuiTheme from "material-ui/styles/getMuiTheme";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";

const history = createBrowserHistory()

const _muiTheme = function () {
    return getMuiTheme({
        palette: {
            accent1Color: deepOrange500,
        },
        userAgent: navigator.userAgent,
    });
}


const verifyToken = ({match}) => {
    return (
        <MuiThemeProvider muiTheme={_muiTheme()}>
            <RegistrationTest token={match.params.token}/>
        </MuiThemeProvider>
    )
}

const mainPage = ({match}) => {
    return (
        <MuiThemeProvider muiTheme={_muiTheme()}>
            <Main/>
        </MuiThemeProvider>
    )
}


export const renderRoutes = () => {
    return (
        <Router history={history}>
            <Switch>
                <Route path="/verify-email/:token"
                       render={verifyToken}/>
                <Route path="/" component={mainPage}/>
            </Switch>
        </Router>
    )
};