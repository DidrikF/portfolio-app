import React from 'react'

export type InputProps = {
    editable: boolean;
    inputName: string;
    state: string;
    handleStateChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
} 

class Input extends React.Component<InputProps> { 
    render () {
        return (
            this.props.editable ? 
                <input className='Edit__input' name={this.props.inputName} value={this.props.state} onChange={this.props.handleStateChange}></input> :
                <span className='Edit__input'>{this.props.state}</span>
        )
    }

}

export default Input