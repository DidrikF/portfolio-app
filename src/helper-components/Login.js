
import React from 'react';
import axios from 'axios';
import { GlobalContext } from '../contexts'  

import localforage from 'localforage'


class Login extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            email: '',
            password: '', 
        }
        this.handle_input_change = this.handle_input_change.bind(this)
        this.handle_submit = this.handle_submit.bind(this)

    }


    handle_input_change(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    handle_submit(event) {
        event.preventDefault()
        axios.post('/login', {
            email: this.state.email,
            password: this.state.password,
        }).then(response => {
            this.props.setAuthenticated(true)
            this.props.setShowLogin(false)
            
            localforage.setItem('token', response.data.token).catch((err) => {
                console.log("Failed to set token in localstorage after login. Error: ", err)
            });
            axios.defaults.headers.common['Authorization'] = response.data.token
            this.props.loadProtectedData();
            
            
        }).catch(error => {
            this.context.flashMessage({text: "Failed to login", type: "error"}, 3)

        })
    }

    render() {
        return (
            <form className="Login__container" onSubmit={this.handle_submit}>
                <button className="Auth__close-button" onClick={(e) => { this.props.setShowLogin(false) }}><i className="material-icons">clear</i></button>
                <h3>Login Form</h3>
                <div className='Auth__formgroup'>
                    <label className='Auth__label'>
                        Email
                        <input className='Auth__input' type='email' placeholder='Your email...' name="email" value={this.state.email} onChange={this.handle_input_change} />
                    </label>
                </div>
                <div className='Auth__formgroup'>
                    <label className='Auth__label'>
                        Password
                        <input className='Auth__input' type='password' placeholder="Your password..." name="password"  value={this.state.password} onChange={this.handle_input_change} />
                    </label>
                </div>
                <button className="Auth__button Auth__button--green" type="submit">Sing In</button>
            </form>
        )
    }
}


Login.contextType = GlobalContext

export default Login;