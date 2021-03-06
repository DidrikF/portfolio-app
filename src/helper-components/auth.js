
import React from 'react';
import axios from 'axios';
import { GlobalContext } from '../contexts'  

import localforage from 'localforage'


export class Login extends React.Component {
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

/* Will not be used in the first deployment of the app, users have to be manually added */
export class Register extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            email: '',
            firstName: "",
            lastName: "",
            description: "",
            image: "", 
            password: '',
            passwordVerify: '',    
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
        if (this.state.password === this.state.passwordVerify) {
            axios.post('/register', {
                email: this.state.email,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                description: this.state.description,
                image: this.state.image,
                password: this.state.password,
            }).then(response => {
                this.context.flashMessage({text: "Successfully registered!", type: "success"}, 3)
                this.props.setShowRegister(false)
            }).catch(error => 
                this.context.flashMessage({text: "Failed to register.", type: "error"}, 3)
            )
        } else {
            this.context.flashMessage({text: "Passwords are not equal!", type: "error"}, 3)
        }
    }

    render() {
        return (


            <form className="Register__container" onSubmit={this.handle_submit}>
                <button className="Auth__close-button" onClick={(e) => { this.props.setShowRegister(false) }}><i className="material-icons">clear</i></button>
                <h3>Registration Form</h3>
                <div className='Auth__formgroup'>
                    <label className='Auth__label'>
                        Email
                        <input className='Auth__input' type='email' placeholder='Your email...' name="email" value={this.state.email} onChange={this.handle_input_change} />
                    </label>
                </div>

                <div className='Auth__formgroup'>
                    <label className='Auth__label'>
                        First Name
                        <input className='Auth__input' type='text' placeholder="John" name="firstName"  value={this.state.firstName} onChange={this.handle_input_change} />
                    </label>
                </div>
                <div className='Auth__formgroup'>
                    <label className='Auth__label'>
                        Last Name
                        <input className='Auth__input' type='text' placeholder="Doe" name="lastName" value={this.state.lastName} onChange={this.handle_input_change} />
                    </label>
                </div>

                <div className='Auth__formgroup'>
                    <label className='Auth__label'>
                        Description
                        <input className='Auth__input' type='text' placeholder="About you..." name="description" value={this.state.description} onChange={this.handle_input_change} />
                    </label>
                </div>

                <div className='Auth__formgroup'>
                    <label className='Auth__label'>
                        Profile Picture
                        <input className='Auth__input' type='text' placeholder="About you..." name="image" value={this.state.image} onChange={this.handle_input_change} />
                    </label>
                </div>


                <div className='Auth__formgroup'>
                    <label className='Auth__label'>
                        Password
                        <input className='Auth__input' type='password' placeholder="Your password..." name="password"  value={this.state.password} onChange={this.handle_input_change} />
                    </label>
                </div>

                <div className='Auth__formgroup'>
                    <label className='Auth__label'>
                        Repeat Password
                        <input className='Auth__input' type='password' placeholder="Your password..." name="passwordVerify"  value={this.state.passwordVerify} onChange={this.handle_input_change} />
                    </label>
                </div>
                
                
                <button className="Auth__button Auth__button--green" type="submit">Register</button>
            </form>
        )
    }
}



Register.contextType = GlobalContext