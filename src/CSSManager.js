import React from 'react';
import axios from 'axios'

import { getId } from './helpers';
import CSSDocument from './CSSDocument'
import { GlobalContext } from './contexts';



const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

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
      cssDocumentName: "",
      mediaQueris: {
        mobile: "",
        tablet: "@media only screen and (min-width: 600px) ",
        desktop: "@media only screen and (min-width: 1000px) "
      },
      scopes: scopes,
      editing: null, // The id of the item being edited!
      
      activeDoc: null,

      cssDocuments: [],
    }
    this.handleInputChange = this.handleInputChange.bind(this);
    this.createCssDocument = this.createCssDocument.bind(this);
    this.deleteCssDocument = this.deleteCssDocument.bind(this);
    this.createItem = this.createItem.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.addAttribute = this.addAttribute.bind(this);
    this.deleteAttribute = this.deleteAttribute.bind(this);
    this.handleScopeChange = this.handleScopeChange.bind(this);
    this.handleQueryChange = this.handleQueryChange.bind(this)
    this.handleSelectorChange = this.handleSelectorChange.bind(this);
    this.handleAttributeInputChange = this.handleAttributeInputChange.bind(this);
    this.updateApplicationStateAndSave = this.updateApplicationStateAndSave.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.saveCssDocuments = this.saveCssDocuments.bind(this);

  }

  handleInputChange(e) {
    const name = e.target.name;
    const value = e.target.value
    this.setState({
      [name]: value,
    })
  }

  createCssDocument(e) {
    const cssDocument = {
      name: this.state.cssDocumentName,
      id: getId(),
      items: [],
    };

    axios.post("/cssdocuments", cssDocument).then(response => {
      this.setState(state => {
        state.cssDocuments.push(response.data);
        return {
          cssDocumentName: "",
          cssDocuments: state.cssDocuments,
        }
      })
    }).catch(error => {
      this.context.flashMessage({text: "Failed to create new css document", type: "error"}, 3);
    })
  }

  deleteCssDocument(docToDelete) {
    if (!window.confirm(`Are you sure you want to delete css document: ${docToDelete.name}`)) return

    axios.delete("/cssDocuments/" + docToDelete._id).then(response => {
      this.setState(state => {
        const indexToDelete = state.cssDocuments.findIndex(doc => doc.id === docToDelete.id);
        state.cssDocuments.splice(indexToDelete, 1);
        return {
          cssDocuments: state.cssDocuments,
        };
      })
    }).catch(error => {
      this.context.flashMessage({text: "Failed to delete css document", type: "error"}, 3);
    })
  }

  openDocument(docId) {
    this.setState({
      activeDoc: docId,
    });
  }


  // All of this needs to be synced with the rest of the application
  createMediaQuery() {
  }

  createItem() {
    this.setState((state, props) => {
      const cssDocumentIndex = state.cssDocuments.findIndex(doc => doc.id === state.activeDoc);
      if (cssDocumentIndex <= -1) return

      state.cssDocuments[cssDocumentIndex].items.push({
        id: getId(),
        mediaQuery: "mobile",
        selector: "",
        scopes: initiateScopes(scopes),
        attributes: [],
      })
      return {
        cssDocuments: state.cssDocuments
      }
    });
  }

  deleteItem(id) { // maybe not rely on the index at all, and do all manipulation based on the ID
    this.setState((state) => {
      const cssDocumentIndex = state.cssDocuments.findIndex(doc => doc.id === state.activeDoc);
      if (cssDocumentIndex <= -1) return

      const indexToDelete = state.cssDocument.findIndex(item => item.id === id);
      state.cssDocuments[cssDocumentIndex].items.splice(indexToDelete, 1);
      return {
        cssDocuments: state.cssDocuments,
      }
    });
  }

  handleScopeChange(e, editingId) {
    e.persist();
    this.setState(state => {
      const cssDocumentIndex = state.cssDocuments.findIndex(doc => doc.id === state.activeDoc);
      if (cssDocumentIndex <= -1) return

      const itemIndex = state.cssDocuments[cssDocumentIndex].items.findIndex(item => item.id === editingId);
      const scopeName = e.target.value;
      const checked = e.target.checked;
      state.cssDocuments[cssDocumentIndex].items[itemIndex]["scopes"][scopeName] = checked;
      return {
        cssDocuments: state.cssDocuments,
      }
    })
  }

  handleQueryChange(e, editingId) {
    e.persist();
    // console.log("Query event: ", e)
    const name = e.target.value
    this.setState(state => {
      const cssDocumentIndex = state.cssDocuments.findIndex(doc => doc.id === state.activeDoc);
      if (cssDocumentIndex <= -1) return
      
      const itemIndex = state.cssDocuments[cssDocumentIndex].items.findIndex(item => item.id === editingId);
      state.cssDocuments[cssDocumentIndex].items[itemIndex]["mediaQuery"] = name;
      // console.log("new state: ", state.cssDocument[itemIndex])
      return {
        cssDocuments: state.cssDocuments,
      }
    })
  }

  handleSelectorChange(e, editingId) {
    e.persist();
    const name = e.target.name;
    const value = e.target.value;
    this.setState(state => {
      const cssDocumentIndex = state.cssDocuments.findIndex(doc => doc.id === state.activeDoc);
      if (cssDocumentIndex <= -1) return

      const itemIndex = state.cssDocuments[cssDocumentIndex].items.findIndex(item => item.id === editingId);
      state.cssDocuments[cssDocumentIndex].items[itemIndex][name] = value;
      return {
        cssDocuments: state.cssDocuments,
      };
    });
  }

  handleAttributeInputChange(e, index, editingId) {
    const name = e.target.name;
    const value = e.target.value;
    this.setState(state => {
      const cssDocumentIndex = state.cssDocuments.findIndex(doc => doc.id === state.activeDoc);
      if (cssDocumentIndex <= -1) return

      const itemIndex = state.cssDocuments[cssDocumentIndex].items.findIndex(item => item.id === editingId);
      state.cssDocuments[cssDocumentIndex].items[itemIndex]["attributes"][index][name] = value
      return {
        cssDocuments: state.cssDocuments,
      }
    });
  }

  addAttribute(attributeIndex, editingId) {
    this.setState(state => {
      const cssDocumentIndex = state.cssDocuments.findIndex(doc => doc.id === state.activeDoc);
      if (cssDocumentIndex <= -1) return
      
      const itemIndex = state.cssDocuments[cssDocumentIndex].items.findIndex(item => item.id === editingId);
      if (typeof attributeIndex !== "undefined") {
        state.cssDocuments[cssDocumentIndex].items[itemIndex]["attributes"].splice(attributeIndex + 1, 0, {
          key: "",
          value: "",
        });
      } else {
        state.cssDocuments[cssDocumentIndex].items[itemIndex]["attributes"].push({
          key: "",
          value: "",
        });
      }
      return {
        cssDocuments: state.cssDocuments,
      };
    });
  }


  deleteAttribute(attributeIndex, editingId) {
    this.setState(state => {
      const cssDocumentIndex = state.cssDocuments.findIndex(doc => doc.id === state.activeDoc);
      if (cssDocumentIndex <= -1) return

      const itemIndex = state.cssDocuments[cssDocumentIndex].items.findIndex(item => item.id === editingId);
      state.cssDocuments[cssDocumentIndex].items[itemIndex]["attributes"].splice(attributeIndex, 1)
      return {
        cssDocuments: state.cssDocuments,
      }
    })
  }


  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    this.setState(state => {
      const cssDocumentIndex = state.cssDocuments.findIndex(doc => doc.id === state.activeDoc);
      if (cssDocumentIndex <= -1) return

      state.cssDocuments[cssDocumentIndex].items = reorder(
        state.cssDocuments[cssDocumentIndex].items,
        result.source.index,
        result.destination.index
      );
      
      return {
        cssDocuments: state.cssDocuments,
      }
    });
    /*
    () => { // call funciton after setState completes
      this.writeClassesToStyleElement();
    }
    */
  }

  combineCssDocuments(cssDocuments) {
    if (!cssDocuments) {
      cssDocuments = this.state.cssDocuments;
    }
    return cssDocuments.reduce((combined, doc) => {
      return [...combined, ...doc.items]
    }, [])
  }

  applyStylesToStyleSheet(combinedCssDocument) {
    const css = this.cssDocumentToString(combinedCssDocument);
    this.props.styleSheetRef.current.innerHTML = css;
  }

  saveCssDocuments() {
    this.state.cssDocuments.forEach(doc => {
      axios.put("/cssdocuments/" + doc._id, doc).then(response => {
        this.context.flashMessage({text: `Successfully saved css document: ${doc.name}`, type: "success"}, 3);
      }).catch(error => {
        this.context.flashMessage({text: `Failed to save css document: ${doc.name}`, type: "error"}, 3);
      })      
    })
  }

  updateApplicationStateAndSave() { // why is this even necessary?
    const combinedCssDocument = this.combineCssDocuments();
    this.props.updateApplicationStyles(combinedCssDocument);
    this.applyStylesToStyleSheet(combinedCssDocument);
    this.saveCssDocuments();
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

  cssDocumentToString(combinedCssDocument) {
    let css = ""; 
  
    // sort based on media query
    let desktopItems = combinedCssDocument.filter(item => item.mediaQuery === "desktop");
    let tabletItems = combinedCssDocument.filter(item => item.mediaQuery === "tablet");
    let mobileItems = combinedCssDocument.filter(item => item.mediaQuery === "mobile");

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

  getCssDocuments() {
    axios.get("/cssdocuments").then(response => {
      this.setState({
        cssDocuments: response.data,
      })
      const combinedCssDocument = this.combineCssDocuments(response.data);
      this.props.updateApplicationStyles(combinedCssDocument);
      this.applyStylesToStyleSheet(combinedCssDocument);
    }).catch(e => {
      this.context.flashMessage({text: "Failed to get css documents, please try to reload the page.", type: "error"}, 3);
    })
  }

  componentDidMount() {
    this.getCssDocuments();
  }


  render() {

    let activeCssDocument = this.state.cssDocuments.find(doc => doc.id === this.state.activeDoc);

    return (
      <div className="CSSM__container" style={this.props.style}>
        <div style={{width: "300px"}}>
          <button className="CSSM__close-button" onClick={this.props.closeCSSM}><i className="material-icons">close</i></button>

          {/* UI to create, delete and switch between pages */}
          <div className="CSSM__tabs">
            <input name="cssDocumentName" placeholder="Document name" value={this.state.cssDocumentName} onChange={this.handleInputChange} />
            <button onClick={this.createCssDocument}>Add Doc</button>

            <div>
              { this.state.cssDocuments.map(doc => {
                const activeClass = (this.state.activeDoc === doc.id) ? "CSSM__tab--active" : "";
                return (
                  <button 
                    className={"CSSM__tab " + activeClass} 
                    onClick={() => this.openDocument(doc.id)}
                  >
                    {doc.name}
                    <button onClick={(e) => { e.stopPropagation(); this.deleteCssDocument(doc); }}><i className="material-icons">close</i></button>
                  </button>
                )
              })
              }
            </div>
          </div>
          { !!activeCssDocument &&
            <CSSDocument
              cssDocument={activeCssDocument}
              mediaQueris={this.state.mediaQueris}
              createItem={this.createItem}
              deleteItem={this.deleteItem}
              handleScopeChange={this.handleScopeChange}
              handleQueryChange={this.handleQueryChange}
              handleSelectorChange={this.handleSelectorChange}
              handleAttributeInputChange={this.handleAttributeInputChange}
              addAttribute={this.addAttribute}
              deleteAttribute={this.deleteAttribute}
              onDragEnd={this.onDragEnd}
            />
          }
          <button onClick={(e) => { e.preventDefault(); this.updateApplicationStateAndSave() }}>Apply and Save</button>
        </div>        
      </div>
    )
  }

}

CSSManager.contextType = GlobalContext;


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


[
  { // css document
    name: "Doc Name 1",
    id: getId(), // get from the server
    items: [ // these are what I want to edit
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
    ]
  },
  { // css document
    name: "Doc Name 2",
    id: getId(),
    items: [], 
  }
]

*/