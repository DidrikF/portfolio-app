// this file contains page assets

import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import React from 'react'

export class RichText extends React.Component {
    constructor(props) {
        super(props)
        this.handleChange = this.handleChange.bind(this)
    }

    handleChange(newText) {
        let assetState = this.props.assetState
        assetState.text = newText
        this.props.updateAssetState(assetState)
    } 

    render() {
        const text = this.props.assetState.text
        
        return(
            <div>
                <button onClick={this.props.delete}>Delete</button>
                <ReactQuill value={text} onChange={this.handleChange} theme="snow"/>
            </div>
        )
    }
}