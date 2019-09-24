import React from 'react';


class ClassSelector extends React.Component {    
    constructor(props) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
    } 

    handleInputChange(e) {
        const clsName = e.target.name;
        const checked = e.target.checked;
        let updatedClasses = null;

        if (checked === true) {
            updatedClasses = [...this.props.activeClasses.split(/\s+/), clsName];
        } else if (checked === false) {
            updatedClasses = this.props.activeClasses.split(/\s+/)
            updatedClasses = updatedClasses.filter(cls => (cls !== clsName));
        }

        updatedClasses = updatedClasses.filter(cls => cls !== "");

        if (updatedClasses.length > 0) {
            this.props.updateSelectedClasses(updatedClasses.join(" "))
        } else {
            this.props.updateSelectedClasses("");
        }
    }

    render() {
        // console.log("css document: ", this.props.cssDocument)
        let classes = this.props.cssDocument
            .filter(item => {
                return (item.scopes[this.props.scope] || item.scopes["all"]);
            }).reduce((accumulator, item) => {
                const res = /\.([\w-]+)/ig.exec(item.selector)
                // console.log(item.selector, res);
                if(res) {
                    const className = res[1];
                    accumulator.add(className)
                }
                return accumulator
            }, new Set());

        if (classes) {
            classes = Array.from(classes);
        } else {
            classes = [];
        }
        // console.log("classes from css document: ", classes)

        const activeClasses = this.props.activeClasses.split(/\s+/);        
        classes = [...classes, ...activeClasses];

        // console.log("active classes: ", activeClasses)

        classes = classes.filter(cls => cls !== "")

        const clsState = {};

        for(let cls of classes) {
            if (activeClasses.includes(cls)) {
                clsState[cls] = true;
            } else {
                clsState[cls] = false;
            }
        }
        // console.log("clsState: ", clsState)

        return (
            <div className="SN__container">
                <p className="SN__menu-title">{this.props.heading}</p>
                <div className='SN__widget'> {/* Section__toolbarMenu */}
                    { 
                        Object.keys(clsState).map(clsName => {
                            return (
                                <div>                                
                                    <input type="checkbox" onChange={this.handleInputChange} name={clsName} checked={clsState[clsName]} /> 
                                    <span>{clsName}</span>
                                </div>
                            )
                        })
                    }

                </div>
            </div>
        )
    }
}

export default ClassSelector;

