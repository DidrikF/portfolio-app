
import React from 'react';
import axios from 'axios';


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
        let self = this
        event.preventDefault()
        axios.post('/login', {
            email: this.state.email,
            password: this.state.password,
        }).then(response => {
            console.log(response)
            self.props.closeForm()
            // store user and token in context

        }).catch(error => 
            console.log(error)
        )
    }

    render() {
        return (
            <form onSubmit={this.handle_submit}>
                <h3>Login</h3>
                <div className='Auth-formgroup'>
                    <label className='Auth-label'>
                        Email
                        <input className='Auth-input' type='email' placeholder='example@mail.com' value={this.state.password} onChange={this.handle_input_change} />
                    </label>
                </div>
                <div className='Auth-formgroup'>
                    <label className='Auth-label'>
                        Password
                        <input className='Auth-input' type='password' value={this.state.password} onChange={this.handle_input_change} />
                    </label>
                </div>
            </form>
        )
    }
}

// Login.contextType = GlobalContext

/* Will not be used in the first deployment of the app, users have to be manually added */
export class Register extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            email: '',
            password: '',
            password_verify: '',    
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
        axios.post('/register', {
            email: this.state.email,
            password: this.state.password,
            password_verify: this.state.password_verify,
        }).then(response => 
            console.log(response)
        ).catch(error => 
            console.log(error)
        )
    }

    render() {
        return (
            <form onSubmit={this.handle_submit}>
                <h3>Register</h3>
                <div className='Auth-formgroup'>
                    <label>
                        Email:
                        <input type="text" name="email" value={this.state.email} onChange={this.handle_input_change} />
                    </label>
                </div>
                <div className='Auth-formgroup'>                
                    <label>
                        Password:
                        <input type="password" name="password" value={this.state.password} onChange={this.handle_input_change} />
                    </label>
                </div>
                <div className='Auth-formgroup'>
                    <label>
                        Repeat Password:
                        <input type="password" name="password_verify" value={this.state.password_verify} onChange={this.handle_input_change} />
                    </label>
                </div>

                <input type="submit" value="Submit" />
            </form>
        )
    }
}
