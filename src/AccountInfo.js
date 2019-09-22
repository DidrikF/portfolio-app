import React from "react";
import { BrowserRouter as Router, Route, Link, NavLink, HashRouter, Redirect } from "react-router-dom"; 
import localforage from "localforage";
import axios from "axios";

import { GlobalContext } from './contexts';
import { Login, Register } from './helper-components/auth';


class AccountInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showLogin: false,
            showRegister: false,
        }

        this.setShowLogin = this.setShowLogin.bind(this);
        this.setShowRegister = this.setShowRegister.bind(this);
        this.logout = this.logout.bind(this);
    }

    // # REFACTOR: only one setter method for top level app state manipulation
    setShowLogin(value) {
        this.setState({
            showLogin: value,
        });
    }
    setShowRegister(value) {
        this.setState({
            showRegister: value,
        });
    }

    // _______________ Authentication ______________________
    logout() {
        axios.post("/logout").then(response => {
            this.props.setAuthenticated(false);
            this.setShowLogin(false);
            localforage.removeItem("token").catch(error => {
                console.log("Failed to remove token on logout, with error: ", error);
            })
            delete axios.defaults.headers.common["Authorization"];
        }).catch(error => {
            this.context.flashMessage({text: "Failed to log out, please try again.", type: "error"}, 3);
        });
    }

    render() {
        
        return (
            <React.Fragment>
                <div id="SN__account-info" className="SN__container">
                    <p className="SN__menu-title">ACCOUNT</p>
                    <div className='SN__widget'> {/* Section__toolbarMenu */}
                        <ul>
                            { !this.context.authenticated &&
                                <React.Fragment>
                                    <li><a className="SN__item" onClick={()=>{ this.setShowLogin(true) }}><i className="fas fa-sign-in-alt"></i><span>Log In</span></a></li>
                                    <li><a className="SN__item" onClick={()=>{ this.setShowRegister(true) }}><i className="fas fa-sign-in-alt"></i><span>Register</span></a></li>  
                                </React.Fragment>
                            } 
                            { this.context.authenticated &&
                                <React.Fragment>
                                    <li><a className="SN__item" onClick={ this.logout }><i class="fas fa-sign-out-alt"></i><span>Log out</span></a></li>
                                    <li>          
                                        <Link 
                                            to={{
                                                pathname: '/account',  
                                            }} 
                                            className="SN__item"
                                            activeClassName="SN__item--active" // not working, do not know why
                                        >
                                            <i className="material-icons">person</i><span>Account</span>
                                        </Link>
                                    </li>
                                </React.Fragment>
                            }
                        </ul>

                        { this.state.showLogin &&
                            <div className="SN__login-form">
                                <Login // Need to be able to update the global context, this is why it is "easier" to render it here.
                                    showLogin={this.state.showLogin}
                                    authenticated={this.context.authenticated}
                                    setAuthenticated={this.props.setAuthenticated}
                                    setShowLogin={this.setShowLogin}
                                    loadProtectedData={this.props.loadProtectedData}
                                    // setUser={setUser} // need to implement in the future to support multiple users.
                                />
                            </div>
                        }
                        { this.state.showRegister &&
                            <div className="SN__login-form">
                                <Register // Need to be able to update the global context, this is why it is "easier" to render it here.
                                    showRegister={this.state.showRegister}
                                    setShowRegister={this.setShowRegister}
                                    // setUser={setUser} // need to implement in the future to support multiple users.
                                />
                            </div>
                        }
                    </div>
                </div>
            </React.Fragment>            
        )
    }
}

AccountInfo.contextType = GlobalContext;

export default AccountInfo;