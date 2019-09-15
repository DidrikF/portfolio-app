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

let scopes = [
  "all",
  "page",
  "section",
  "girdSection",
  "component",
  "rich text",
];

function initiateScopes(scopes) {
  const scopeObject = {};
  scopes.forEach(scope => scopeObject[scope] = false);
  return scopeObject;
}

class CSSManager extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      mediaQueris: {
        mobile: "",
        tablet: "@media only screen and (min-width: 600px) ",
        desktop: "@media only screen and (min-width: 1000px) "
      },
      scopes: scopes,
      editing: null, // The id of the item being edited!
      cssDocument: [ // these are what I want to edit
        {
          id: getId(), // GIV IT AN ID ON CREATION?
          mediaQuery: "mobile", // name
          selector: ".test-div",
          scopes: initiateScopes(scopes), // use only by the react app to help the user see only the relevant classes.
          attributes: [
            { key: "height", value: "100px"},
            { key: "background", value: "blue"},
          ], // array of {key: "...", val: "..."}
        },
        {
          id: getId(),
          mediaQuery: "tablet",
          selector: ".test-span",
          scopes: initiateScopes(scopes),
          attributes: [
            { key: "height", value: "100px"},
            { key: "width", value: "200px"},
            { key: "background", value: "blue"},
          ],
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
    this.updateApplicationState = this.updateApplicationState.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);

  }

  // All of this needs to be synced with the rest of the application
  createMediaQuery() {

  }

  createItem() {
    this.setState((state, props) => {
      state.cssDocument.push({
        id: getId(),
        mediaQuery: "mobile",
        selector: "",
        scopes: initiateScopes(scopes),
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
    this.setState(state => {
      const itemIndex = state.cssDocument.findIndex(item => item.id === editingId);
      const scopeName = e.target.value;
      const checked = e.target.checked;
      state.cssDocument[itemIndex]["scopes"][scopeName] = checked;
      return {
        cssDocument: state.cssDocument,
      }
    })
  }

  handleQueryChange(e, editingId) {
    e.persist();
    console.log("Query event: ", e)
    const name = e.target.value
    this.setState(state => {
      const itemIndex = this.state.cssDocument.findIndex(item => item.id === editingId);
      state.cssDocument[itemIndex]["mediaQuery"] = name;
      console.log("new state: ", state.cssDocument[itemIndex])
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

  updateApplicationState() { // why is this even necessary?
    this.props.updateApplicationStyles(this.state.cssDocument)
    const css = this.cssDocumentToString();
    this.props.styleSheetRef.current.innerHTML = css;
  }

  itemsToCss(items, baseIndentation) {
    const attributeIndentation = baseIndentation + "\t";
    let css = ""; 
    items.forEach(item => {
      css += baseIndentation + item.selector + "{\n";
      item.attributes.forEach(att => {
        css += attributeIndentation + att.key + ": " + att.value + ";\n";
      })
      css += baseIndentation + "}\n";
    })
    return css;
  }

  cssDocumentToString() {
    let css = ""; 
  
    // sort based on media query

    let desktopItems = this.state.cssDocument.filter(item => item.mediaQuery === "desktop");
    let tabletItems = this.state.cssDocument.filter(item => item.mediaQuery === "tablet");
    let mobileItems = this.state.cssDocument.filter(item => item.mediaQuery === "mobile");

    css += this.state.mediaQueris["mobile"] + "\n";
    css += this.itemsToCss(mobileItems, "");
    css += "}\n";
    css += this.state.mediaQueris["tablet"] + "\n";
    css += this.itemsToCss(tabletItems, "\t");
    css += "}\n";
    css += this.state.mediaQueris["desktop"] + "{\n";
    css += this.itemsToCss(desktopItems, "\t");
    css += "}\n";

    console.log(css);
    return css;
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
    });
    /*
    () => { // call funciton after setState completes
      this.writeClassesToStyleElement();
    }
    */
  }

  render() {
    return (
      <div className="CSSM__container">
        {/* Show/hide buttons */}
        <div>
          <h3 className="CSSM__heading">CSS Document</h3>
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
                          className="CSSM__item"
                        >
                          <button className="CSSM__button-delete CSSM__top-right" onClick={() => this.deleteItem(item.id)}>
                            <i className="material-icons">delete</i>                              
                          </button>
                          <form className="CSSM__form" onSubmit={(e) => e.preventDefault()}>
                            <div className="CSSM__checkbox-container">
                              { Object.keys(item.scopes).map(scope => {
                                return (
                                  <React.Fragment>
                                    <input 
                                      type="checkbox" 
                                      name="scope" 
                                      value={scope}
                                      onChange={(e) => this.handleScopeChange(e, item.id)} 
                                    />
                                    <span>{scope.charAt(0).toUpperCase() + scope.slice(1)}</span>
                                  </React.Fragment>
                                )
                              })
                            }
                            </div>
                            <select onChange={(e) => this.handleQueryChange(e, item.id)}>
                              { Object.keys(this.state.mediaQueris).map(queryName => {
                                  return (
                                    <option value={queryName}>
                                      {queryName.charAt(0).toUpperCase() + queryName.slice(1)}
                                    </option>
                                  )
                                })
                              }
                            </select>

                            <input
                              className="CSSM__selector-input"
                              placeholder="CSS Selector"
                              name="selector"
                              value={item.selector}
                              itemid={item.id}
                              onChange={(e) => this.handleSelectorChange(e, item.id)}
                            />
                            <table className="CSSM__attributes">
                              <thead>
                                <tr>
                                  <th>ATTRIBUTE</th>
                                  <th>VALUE</th>
                                  <th></th>
                                  <th></th>
                                </tr>
                              </thead>
                              <tbody>
                                {item.attributes.map((att, index) => {
                                  return (
                                    <tr key={index}>
                                      <td><input className="CSSM__attribute-input" name="key" value={att.key} onChange={(e) => this.handleAttributeInputChange(e, index, item.id)} /></td>
                                      <td><input className="CSSM__attribute-input" name="value" value={att.value} onChange={(e) => this.handleAttributeInputChange(e, index, item.id)} /></td>
                                      <td>
                                        <button className="CSSM__button-delete" onClick={(e) => { e.preventDefault(); this.deleteAttribute(index, item.id) }}>
                                          <i className="material-icons">delete</i>
                                        </button>
                                      </td>
                                      <td>
                                        <button className="CSSM__button-add" onClick={(e) => { e.preventDefault(); this.addAttribute(index, item.id) }}>
                                          <i className="material-icons">add_box</i>
                                        </button>
                                      </td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                            </table>
                            <button onClick={(e) => { e.preventDefault(); this.addAttribute(undefined, item.id) }}>New Attribute</button>
                          </form>
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
          <button onClick={(e) => { e.preventDefault(); this.updateApplicationState() }}>Apply</button>
        </div>
      </div>
    )
  }

}



export default CSSManager


/*
<select multiple size="3" className="CSSM__scope-select" name="scope" onChange={(e) => this.handleScopeChange(e, item.id)}>
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
*/