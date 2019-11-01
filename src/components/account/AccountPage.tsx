import React from 'react'
import axios from 'axios'

import { GlobalContext } from '../../contexts/GlobalContext'  
import { IGlobalContext } from '../../App';

export type AccountPageProps = {

}

export type AccountPageState = {

}
  
class AccountPage extends React.Component<AccountPageProps, AccountPageState> {
    static contextType: React.Context<IGlobalContext> = GlobalContext;
    context!: React.ContextType<typeof GlobalContext>

    constructor(props: AccountPageProps) {
        super(props)

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

export default AccountPage