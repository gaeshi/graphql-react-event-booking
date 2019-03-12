import React, {Component} from 'react';
import {BrowserRouter, Redirect, Route, Switch} from 'react-router-dom';

import './App.css';
import AuthPage from "./pages/Auth";
import Events from "./pages/Events";
import Bookings from "./pages/Bookings";

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Redirect from="/" to="/auth" exact/>
                    <Route path="/auth" component={AuthPage}/>
                    <Route path="/events" component={Events}/>
                    <Route path="/bookings" component={Bookings}/>
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;
