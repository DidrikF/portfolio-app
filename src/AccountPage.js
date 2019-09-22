import React from 'react'
import axios from 'axios'

import { GlobalContext } from './contexts'  

  
class AccountPage extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            height: 0,
        }

        this.handleChange = this.handleChange.bind(this)
    }


    handleChange(e) {
        const name = e.target.name
        this.setState({
            [name]: e.target.value
        })
    }


    componentDidMount() {

        const setPageHeight = () => {
            this.setState({
                pageHeight: document.documentElement.clientHeight
            })
        }

        setPageHeight()
        window.addEventListener("resize", setPageHeight) // may not be sufficent (full screen etc.)

    }
    
    render() {
        return (
            <div 
                className="Page"
            >
        
            </div>
        )
    }
}
AccountPage.contextType = GlobalContext;

export default AccountPage