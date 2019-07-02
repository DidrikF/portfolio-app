// this file contains page assets

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import React from 'react'


export class RichText extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(newState) {
        let componentState = this.props.componentState
        componentState.state = newState
        this.props.updateComponentState(componentState)
    } 

    render() {
        const text = this.props.componentState.state
        
        return(
            <div>
                <button onClick={this.props.delete}>Delete</button>
                <ReactQuill
                    value={text} 
                    onChange={this.handleChange} 
                    theme="snow"
                    modules={RichText.modules}
                />
            </div>
        )
    }
}


RichText.modules = {
    toolbar: {
        container: "#RichText__toolbar",
    }
}