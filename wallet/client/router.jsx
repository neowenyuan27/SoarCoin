import React from "react";
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import createBrowserHistory from 'history/createBrowserHistory';
// route components
import Main from "../imports/ui/Main";
import RegistrationTest from "../imports/ui/components/registration-test";

const history = createBrowserHistory()
const verifyToken = ({match}) => {
    return <RegistrationTest token={match.params.token}/>;
}
export const renderRoutes = () =>{
    return (
        <Router history={history}>
            <Switch>
                <Route path="/verify-email/:token"
                       render={verifyToken}/>
                <Route path="/" component={Main}/>
            </Switch>
        </Router>
    )
};