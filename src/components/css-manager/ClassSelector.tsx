import React from 'react';
import { CSSItem, ScopeType } from './CSSManager';

export type ClassSelectorProps = {
    cssDocument: CSSItem[];
    scope: ScopeType;
    heading: string;
    activeClasses?: string;
    updateSelectedClasses: (classes: string) => void;
}

class ClassSelector extends React.Component<ClassSelectorProps> {    
    constructor(props: ClassSelectorProps) {
        super(props);
        this.handleInputChange = this.handleInputChange.bind(this);
    } 

    handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
        const clsName = e.target.name;
        const checked = e.target.checked;
        let updatedClasses = null;

        if (checked === true) {
            updatedClasses = [...this.props.activeClasses.split(/\s+/), clsName];
        } else {
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
            }, new Set()) as Set<string>;
        
        let classesArray: string[] = [];

        if (classes) {
            classesArray = Array.from(classes) as string[];
        }

        const activeClasses = this.props.activeClasses.split(/\s+/);        
        classesArray = [...classesArray, ...activeClasses];

        classesArray = classesArray.filter(cls => cls !== "")

        const clsState: {[cls: string]: boolean} = {};

        for(let cls of classesArray) {
            if (activeClasses.includes(cls)) {
                clsState[cls] = true;
            } else {
                clsState[cls] = false;
            }
        }

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

