import React from 'react'; 
import ReactDOM from 'react-dom'

export default class PageToolbarPortal extends React.Component {
  portal = document.getElementById('Page__toolbar-portal');
  el = document.createElement('div');
  
  componentDidMount() {
    // The portal element is inserted in the DOM tree after
    // the Modal's children are mounted, meaning that children
    // will be mounted on a detached DOM node. If a child
    // component requires to be attached to the DOM tree
    // immediately when mounted, for example to measure a
    // DOM node, or uses 'autoFocus' in a descendant, add
    // state to Modal and only render the children when Modal
    // is inserted in the DOM tree.
    if (this.portal) {
      this.portal.appendChild(this.el);
    }
  }

  componentWillUnmount() {
    if (this.portal) {
      this.portal.removeChild(this.el);
    }
  }

  render(): React.ReactPortal {
    return ReactDOM.createPortal(
      this.props.children,
      this.el,
    );
  }
}
  