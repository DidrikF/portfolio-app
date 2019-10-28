import React from 'react';
import axios from 'axios';
import { GlobalContext } from '../../contexts/GlobalContext'  
import { IGlobalContext } from '../../App';

export type RegisterProps = {
    setShowRegister: (value: boolean) => void; 
}

export type RegisterState = {
    email: string;
    firstName: string;
    lastName: string;
    description: string;
    image: string;
    password: string;
    passwordVerify: string;
}

class Register extends React.Component<RegisterProps, RegisterState> {
    static contextType = GlobalContext;
    
    constructor(props: RegisterProps) {
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
    
    handle_input_change(event: React.ChangeEvent<HTMLInputElement>) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        
        this.setState({
            [name]: value
        } as any);
    }
    
    handle_submit(event: React.SyntheticEvent) {
        event.preventDefault()
        if (this.state.password === this.state.passwordVerify) {
            axios.post('/register', {
                email: this.state.email,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                description: this.state.description,
                image: this.state.image,
                password: this.state.password,
            }).then(() => {
                this.context.flashMessage({text: "Successfully registered!", type: "success"}, 3)
                this.props.setShowRegister(false)
            }).catch(() => 
                this.context.flashMessage({text: "Failed to register.", type: "error"}, 3)
            )
        } else {
            this.context.flashMessage({text: "Passwords are not equal!", type: "error"}, 3)
        }
    }

    render() {
        return (


            <form className="Register__container" onSubmit={this.handle_submit}>
                <button className="Auth__close-button" onClick={() => { this.props.setShowRegister(false) }}><i className="material-icons">clear</i></button>
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

export default Register;