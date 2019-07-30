import React from 'react'
import ContentEditable from 'react-contenteditable'

import { GlobalContext } from '../contexts'
import Input from '../helper-components/Input'



class Contact extends React.Component {
    constructor(props, context) {
        super(props, context)

        //this.contentEditable = React.createRef()
        this.state = {
            address: this.props.address, 
            email: this.props.email || '', 
            telephone: this.props.telephone,
        }

        this.handleInputChange = this.handleInputChange.bind(this)
    }

    handleInputChange(event) {
        // check the user is logged in before updating fields 
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });

    }

    render() {
        return (
            <div className="Contact">
                <button onClick={this.context.toggleEdit}>{this.context.editable ? 'Disable Editing' : 'Enable Editing'}</button> 
                <a name="contact"></a>
                <h2 className="Section__title">Contact</h2>
                <p className="Contact__paragraph">
                    <ContentEditable 
                        //innerRef={this.contentEditable}
                        html={this.state.email} 
                        onChange={this.handleInputChange} 
                        disabled={!this.context.editable} 
                        tagName='span'
                    />
                    
                </p>
                
            </div>
        )
    }
}

Contact.contextType = GlobalContext;

export default Contact
/*
<input className="Contact__paragraph" value={this.state.address} onChange={this.handleInputChange}></input>
<p className="Contact__paragraph">Email: didrik.fleischer@gmail.com</p>
<p className="Contact__paragraph">Telephone: +47 981 07 232</p>
<Input inputName="email" editable={this.context.editable} state={this.state.email} handleInputChange={this.handleInputChange}/>
*/
