import React from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ICSSDocument } from './CSSManager';
import { Id, KeyValue } from '../../../types/basic-types';

export interface CSSDocumentProps {
  onDragEnd: (result: any) => void,
  cssDocument: ICSSDocument, 
  mediaQueries: KeyValue<string>,
  createItem: () => void,
  deleteItem: (id: Id) => void, 
  handleScopeChange: (event: React.ChangeEvent<HTMLInputElement>, editingId: Id) => void,
  handleQueryChange: (event: React.ChangeEvent<HTMLSelectElement>, editingId: Id) => void,
  handleSelectorChange: (event: React.ChangeEvent<HTMLInputElement>, editingId: Id) => void,
  handleAttributeInputChange: (event: React.ChangeEvent<HTMLInputElement>, index: number, editingId: Id) => void,
  addAttribute: (attributeIndex: number | undefined, editingId: Id) => void,
  deleteAttribute: (attributeIndex: number, editingId: Id) => void,
}

const grid = 8;

const getItemStyle = (isDragging: boolean, draggableStyle: KeyValue<string>): KeyValue<string> => ({
  // some basic styles to make the items look a bit nicer
  userSelect: "none",
  padding: `${grid}px`,
  margin: `0 0 ${grid}px 0`,
  // change background colour if dragging
  background: isDragging ? "lightgreen" : "grey",
  // styles we need to apply on draggables
  ...draggableStyle
});

const getListStyle = (isDraggingOver: boolean): KeyValue<string> => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: `${grid}px`,
  width: `${280}px`
});


class CSSDocument extends React.Component<CSSDocumentProps, any> {
  render() {
    return (
      <div>
        <DragDropContext onDragEnd={this.props.onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided: any, snapshot: any) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
              >
                {this.props.cssDocument.items.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided: any, snapshot: any) => (
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
                        <button className="CSSM__button-delete CSSM__top-right" onClick={() => this.props.deleteItem(item.id)}>
                          <i className="material-icons">delete</i>
                        </button>
                        <form className="CSSM__form" onSubmit={(e) => e.preventDefault()}>
                          <div className="CSSM__checkbox-container">
                            {Object.keys(item.scopes).map(scope => {
                              return (
                                <React.Fragment>
                                  <input
                                    type="checkbox"
                                    name="scope"
                                    value={scope}
                                    checked={item.scopes[scope]}
                                    onChange={(e) => this.props.handleScopeChange(e, item.id)}
                                  />
                                  <span>{scope.charAt(0).toUpperCase() + scope.slice(1)}</span>
                                </React.Fragment>
                              )
                            })
                            }
                          </div>
                          <select onChange={(event) => this.props.handleQueryChange(event, item.id)}>
                            {Object.keys(this.props.mediaQueries).map(queryName => {
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
                            onChange={(e) => this.props.handleSelectorChange(e, item.id)}
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
                                    <td><input className="CSSM__attribute-input" name="key" value={att.key} onChange={(e) => this.props.handleAttributeInputChange(e, index, item.id)} /></td>
                                    <td><input className="CSSM__attribute-input" name="value" value={att.value} onChange={(e) => this.props.handleAttributeInputChange(e, index, item.id)} /></td>
                                    <td>
                                      <button className="CSSM__button-delete" onClick={(e) => { e.preventDefault(); this.props.deleteAttribute(index, item.id) }}>
                                        <i className="material-icons">delete</i>
                                      </button>
                                    </td>
                                    <td>
                                      <button className="CSSM__button-add" onClick={(e) => { e.preventDefault(); this.props.addAttribute(index, item.id) }}>
                                        <i className="material-icons">add_box</i>
                                      </button>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                          <button onClick={(e) => { e.preventDefault(); this.props.addAttribute(undefined, item.id) }}>New Attribute</button>
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
        <button onClick={this.props.createItem}>Create Item</button>
      </div>
    )
  }
}


export default CSSDocument;