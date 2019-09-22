import React from 'react';


class ClassSelector extends React.Component {
    constructor(props) {
        super(props);
        this.filterTest = this.filterTest.bind(this);
    } 

    filterTest() {
        console.log(this.props.cssDocument)
        let classes = this.props.cssDocument
            .filter(item => {
                console.log("Item being filtered: ", item);                
                return item.scopes[this.props.scope];

            })
        console.log("Filtered classes: ", classes)

        classes = classes.reduce((accumulator, item) => {
                const classRegex = /\.(\w+)/ig;
                const res = classRegex.exec(item.selector)
                console.log("Item selector: ", item.selector)
                console.log("Result of regex exec: ", res)
                if(res) {
                    const className = res[1];
                    accumulator.add(className)
                    console.log("accumulator: ", accumulator)
                }
                return accumulator;
            }, new Set());

        console.log("Filtered and reduced classes: ",  classes)
    }

    render() {
        
        let classes = this.props.cssDocument
            .filter(item => {
                console.log("Item being filtered: ", item);                
                return item.scopes[this.props.scope];

            }).reduce((accumulator, item) => {
                const classRegex = /\.(\w+)/ig;
                const res = classRegex.exec(item.selector)
                if(res) {
                    const className = res[1];
                    accumulator.add(className)
                }
                return accumulator
            }, new Set());

        if (classes && classes instanceof Set) {
            classes = Array.from(classes);
        }

        return (
            <div className="CS__container">
               <p className="SN__menu-title">CLASSES</p>
               { Array.isArray(classes) &&
                    classes.map(cls => {
                        return (
                            <React.Fragment>
                                <input type="checkbox" name={cls} value={cls} /> 
                                <span>{cls}</span>
                            </React.Fragment>
                        )
                    })

               }
               <button onClick={this.filterTest}>Filter</button>
            </div>
        )
    }
}

export default ClassSelector;

