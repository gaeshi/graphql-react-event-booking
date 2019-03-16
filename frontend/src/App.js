import React, {Component} from 'react';
import {BrowserRouter, Redirect, Route, Switch} from 'react-router-dom';

import './App.css';
import AuthPage from "./pages/Auth";
import Events from "./pages/Events";
import Bookings from "./pages/Bookings";
import MainNavigation from "./components/Navigation/MainNavigation";
import AuthContext from './context/auth-context';

class App extends Component {
    state = {
        token: null,
        userId: null
    };

    login = (token, userId, tokenExpiration) => {
        this.setState({token: token, userId: userId});
    };

    logout = () => {
        this.setState({token: null, userId: null});
    };

    render() {
        return (
            <BrowserRouter>
                <>
                    <AuthContext.Provider value={{
                        token: this.state.token,
                        userId: this.state.userId,
                        login: this.login,
                        logout: this.logout
                    }}>
                        <MainNavigation/>
                        <main className="main-content">
                            <Switch>
                                {!this.state.token && <Redirect from="/" to="/auth" exact/>}
                                {this.state.token && <Redirect from="/" to="/events" exact/>}
                                {this.state.token && <Redirect from="/auth" to="/events"/>}
                                {!this.state.token && <Route path="/auth" component={AuthPage}/>}
                                <Route path="/events" component={Events}/>
                                {this.state.token && <Route path="/bookings" component={Bookings}/>}
                            </Switch>
                        </main>
                    </AuthContext.Provider>
                </>
            </BrowserRouter>
        );
    }
}

export default App;
