import React from 'react';
import axios from 'axios'

import { getId } from './helpers';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { thisExpression } from '@babel/types';


const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);



    return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: "none",
    padding: grid * 1,
    margin: `0 0 ${grid}px 0`,

    // change background colour if dragging
    background: isDragging ? "lightgreen" : "grey",

    // styles we need to apply on draggables
    ...draggableStyle
});

const getListStyle = isDraggingOver => ({
    background: isDraggingOver ? "lightblue" : "lightgrey",
    padding: grid,
    width: 250
});

class CSSManager extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            mediaQueris: [
                {
                    name: "mobile",
                    query: "",
                },
                {
                    name: "Tablet", // Mobile first, I guess that makes sence
                    query: "@media only screen and (min-width: 600px) ",
                },
                {
                    name: "Desktop",
                    query: "@media only screen and (min-width: 1000px) "
                }
            ],
            scopes: [
                "all",
                "page",
                "section",
                "girdSection",
                "component",
                "rich text",
            ],
            editing: null,
            cssDocument: [ // these are what I want to edit
                {
                    id: getId(), // GIV IT AN ID ON CREATION?
                    mediaQuery: "", // name
                    selector: "",
                    scopes: [], // use only by the react app to help the user see only the relevent classes.
                    attributes: [],
                },
                {
                    id: getId(),
                    mediaQuery: "",
                    selector: "",
                    scopes: [],
                    attributes: [],
                }
            ],
        }


        this.createItem = this.createItem.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.editItem = this.editItem.bind(this);
        this.addAttribute = this.addAttribute.bind(this)
        this.deleteAttribute = this.deleteAttribute.bind(this)
        this.handleScopeChange = this.handleScopeChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.saveItem = this.saveItem.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        
    }

    // All of this needs to be synced with the rest of the application
    createMediaQuery() {

    }

    createItem() {
        this.setState((state, props) => {
            state.cssDocument.push({
                id: getId(),
                mediaQuery: "",
                selector: "",
                scopes: [],
                attributes: [],
            })
            return {
                cssDocument: state.cssDocument
            }
        })
    }

    deleteItem(index) {
        this.setState((state) => {
            state.cssDocument.splice(index, 1);
            return {
                cssDocument: state.cssDocument,
            }
        })
    }

    editItem(index) {
        this.setState((state) => {
            return {
                editing: state.cssDocument[index], // edit by reference, the index in the array does not matter here...
            }
        })
    }

    handleScopeChange(e) {
        console.log("Scope Chage, select event: ", e)
        this.setState(state => {
            //state.editing["scopes"] 
        })
    }

    handleInputChange(e) {
        const name = e.tartget.name;
        const value = e.target.value;
        // may be an attribute or the selecor for the item


    }

    addAttribute(index) {
        if (!index) {
            this.setState(state => {
                state.editing["attributes"].push({
                    key: "",
                    value: "",
                })
                return {
                    editing: state.editing,
                }
            })
        } else {
            this.setState(state => {
                state.editing["attributes"].splice(index, 0, {
                    key: "",
                    value: "",
                })
                return {
                    editing: state.editing,
                }
            })
        }
    }

    deleteAttribute(index) {
        this.setState(state => {
            state.editing["attributes"].splice(index, 1)
            return {
                editing: state.editing,
            }
        })
    }

    saveItem() {
        // find the matching item by id in the cssDocument

        // The item has been updated by reference as of now, maybe just force an update?
        /*
        this.setState(state => {
            const indexToReplace; 
        })
        */
        this.forceUpdate();

        // replace that item


        this.writeClassesToStyleElement();
    }   


    writeClassesToStyleElement() {
        // I can ensure that the styles are available to the browser here locally.

        // Translate the cssDocument array to a string...

    }


    onDragEnd(result) {
        // dropped outside the list
        if (!result.destination) {
            return;
        }

        const cssDocument = reorder(
            this.state.cssDocument,
            result.source.index,
            result.destination.index
        );

        this.setState({
            cssDocument
        }, () => { // call funciton after setState completes
            this.writeClassesToStyleElement();
        });
    }

    render() {
        return (
            <div className="CSSM__container">
                {/* Show/hide buttons */}
                
                { this.state.editing &&
                    <React.Fragment>
                        <h4>Selector Editor</h4>
                        <form className="CSSM__form">
                            <input 
                                className="CSSM__selector-input" 
                                placeholder="Selector" 
                                value={this.state.editing.selector} 
                                onChange={this.handleInputChange}
                                name="selector"
                            />
                            
                            <select multiple className="CSSM__scope-select">
                                {this.state.scopes.map(scope => {
                                    return (
                                        <option value={scope} className="CSSM__scope-option" onSelect={this.handleScopeChange}>
                                            {scope.charAt(0).toUpperCase()}
                                        </option>
                                    )
                                })}
                            </select>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Attribute</th>
                                        <th>Value</th>
                                        <th></th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.editing.attributes.map((att, index) => {
                                        return (
                                            <tr key={index}>
                                                <td><input value={att.key} key={// What here, make 2 handlers?} onChange={this.handleInputChange} /></td>
                                                <td><input value={att.value} key={// WHAT HERE, make 2 handlers} onChange={this.handleInputChange} /></td>
                                                <td><button onClick={() => this.deleteAttribute(index)}>Delete</button></td>
                                                <td><button onClick={(e) => this.addAttribute(index)}>New</button></td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                            <button onClick={(e) => {e.preventDefault(); this.addAttribute()}}>New Attribute</button>
                            <button onClick={(e) => {e.preventDefault(); this.saveItem()}}>Save</button>
                        </form>
                    </React.Fragment>
                }

                <div>
                    <h3>CSS Doc</h3>
                    <DragDropContext onDragEnd={this.onDragEnd}>
                        <Droppable droppableId="droppable">
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    style={getListStyle(snapshot.isDraggingOver)}
                                >
                                    {this.state.cssDocument.map((item, index) => (
                                        <Draggable key={item.id} draggableId={item.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={getItemStyle(
                                                        snapshot.isDragging,
                                                        provided.draggableProps.style
                                                    )}
                                                >
                                                    <div className="CSSM__item-container-left">
                                                        <p className="CSSM__item-info">Selector: {item.selector}</p> 
                                                        <p className="CSSM__item-info">Scopes: {item.scopes.join(", ")}</p>
                                                    </div>
                                                    <div className="CSSM__item-container-right">
                                                        <button className="CSSM__button-edit" onClick={this.editItem}>Edit</button>
                                                        <button className="CSSM__button-delete" onClick={this.deleteItem}>Delete</button>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    <button onClick={this.createItem}>Create Item</button>
                </div>
            </div>
        )
    }

}



export default CSSManager