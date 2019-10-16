import React from 'react'

class Input extends React.Component { 
    render () {
        return (
            this.props.editable ? 
                <input className='Edit__input' name={this.props.inputName} value={this.props.state} onChange={this.props.handleStateChange}></input> :
                <span className='Edit__input'>{this.props.state}</span>
        )
    }

}

export default Input