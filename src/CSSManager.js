import React from 'react';
import axios from 'axios'

import { getId } from './helpers';

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { thisExpression, optionalCallExpression } from '@babel/types';


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
                    name: "tablet", // Mobile first, I guess that makes sence
                    query: "@media only screen and (min-width: 600px) ",
                },
                {
                    name: "desktop",
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
            editing: null, // The id of the item being edited!
            cssDocument: [ // these are what I want to edit
                {
                    id: getId(), // GIV IT AN ID ON CREATION?
                    mediaQuery: "", // name
                    selector: "",
                    scopes: [], // use only by the react app to help the user see only the relevant classes.
                    attributes: [], // array of {key: "...", val: "..."}
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
        this.addAttribute = this.addAttribute.bind(this)
        this.deleteAttribute = this.deleteAttribute.bind(this)
        this.handleScopeChange = this.handleScopeChange.bind(this);
        this.handleSelectorChange = this.handleSelectorChange.bind(this);
        this.handleAttributeInputChange = this.handleAttributeInputChange.bind(this);
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
        });
    }

    deleteItem(id) { // maybe not rely on the index at all, and do all manipulation based on the ID
        this.setState((state) => {
            const indexToDelete = state.cssDocument.findIndex(item => item.id === id);
            state.cssDocument.splice(indexToDelete, 1);
            return {
                cssDocument: state.cssDocument,
            }
        });
    }

    handleScopeChange(e, editingId) {
        e.persist();
        console.log("Scope change, select event (how to get a hold of all selected scopes): ", e);
        let scopes = [];
        for (let option of e.target.selectedOptions) {
            scopes.push(option.value);
        }
        this.setState(state => {
            const itemIndex = state.cssDocument.findIndex(item => item.id === editingId);
            state.cssDocument[itemIndex]["scopes"] = scopes;
            return {
                cssDocument: state.cssDocument,
            }
        })
    }

    handleSelectorChange(e, editingId) {
        e.persist();
        const name = e.target.name;
        const value = e.target.value;
        this.setState(state => {
            const itemIndex = state.cssDocument.findIndex(item => item.id === editingId);
            state.cssDocument[itemIndex][name] = value;
            return {
                cssDocument: state.cssDocument,
            };
        });
    }

    handleAttributeInputChange(e, index, editingId) {
        const name = e.target.name;
        const value = e.target.value;
        this.setState(state => {
            const itemIndex = state.cssDocument.findIndex(item => item.id === editingId);
            console.log("handleAttributeChange: ", name, value);
            state.cssDocument[itemIndex]["attributes"][index][name] = value
            return {
                cssDocument: state.cssDocument,
            }
        });
    }

    addAttribute(attributeIndex, editingId) {
        this.setState(state => {
            const itemIndex = state.cssDocument.findIndex(item => item.id === editingId);
            if (typeof attributeIndex !== "undefined") {
                state.cssDocument[itemIndex]["attributes"].splice(attributeIndex + 1, 0, {
                    key: "",
                    value: "",
                });
            } else {    
                state.cssDocument[itemIndex]["attributes"].push({
                    key: "",
                    value: "",
                });    
            }
            return {
                cssDocument: state.cssDocument,
            };
        });
    }


    deleteAttribute(attributeIndex, editingId) {
        this.setState(state => {
            const itemIndex = state.cssDocument.findIndex(item => item.id === editingId);
            state.cssDocument[itemIndex]["attributes"].splice(attributeIndex, 1)
            return {
                cssDocument: state.cssDocument,
            }
        })
    }

    saveItem() { // why is this even necessary?
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
                                                        <React.Fragment>
                                                            <h4>Selector Editor</h4>
                                                            <form className="CSSM__form" onSubmit={(e) => e.preventDefault()}>
                                                                <input 
                                                                    className="CSSM__selector-input" 
                                                                    placeholder="Selector" 
                                                                    name="selector"
                                                                    value={item.selector} 
                                                                    itemid={item.id}
                                                                    onChange={(e) => this.handleSelectorChange(e, item.id)}
                                                                />
                                                                
                                                                <select multiple className="CSSM__scope-select" name="scope" onChange={this.handleScopeChange}>
                                                                    {this.state.scopes.map(scope => {
                                                                        return (
                                                                            <option 
                                                                                className="CSSM__scope-option" 
                                                                                itemid={item.id} 
                                                                                value={scope} 
                                                                            >
                                                                                {scope.charAt(0).toUpperCase() + scope.slice(1)}
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
                                                                        {item.attributes.map((att, index) => {
                                                                            return (
                                                                                <tr key={index}>
                                                                                    <td><input name="key" value={att.key} onChange={(e) => this.handleAttributeInputChange(e, index, item.id)}/></td>
                                                                                    <td><input name="value" value={att.value} onChange={(e) => this.handleAttributeInputChange(e, index, item.id)}/></td>
                                                                                    <td><button onClick={(e) => { e.preventDefault(); this.deleteAttribute(index, item.id)}}>Delete</button></td>
                                                                                    <td><button onClick={(e) => { e.preventDefault(); this.addAttribute(index, item.id)}}>New</button></td>
                                                                                </tr>
                                                                            )
                                                                        })}
                                                                    </tbody>
                                                                </table>
                                                                <button onClick={(e) => { e.preventDefault(); this.addAttribute(undefined, item.id)}}>New Attribute</button>
                                                                <button onClick={(e) => { e.preventDefault(); this.saveItem(item.id)}}>Save</button>
                                                            </form>
                                                        </React.Fragment>
                                                    <div className="CSSM__item-container-right">
                                                        <button className="CSSM__button-delete" onClick={() => this.deleteItem(item.id)}>Delete</button>
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