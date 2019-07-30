import React from 'react'; 
import ReactDOM from 'react-dom'
import { find, some, isEqual } from 'lodash'
import PropTypes  from 'prop-types'
import DOM from 'react-dom-factories'

import Quill from 'quill'

/**
 * Modifications made: 
 * 		1. Props have been turned into local variables
 * 		1. component related props are accepted via propTypes and 
 */


/**
 * How it works:
 * 		1. the editor deals with key presses internally and updates the html
 * 		2. an event listener is registered on the quill instance to update the state whenever the editors content updates
 * 		3. once the value props is updated via the onChange method the RichText component checks if the 
 *		   the value prop is different from what quill thinks the content should be. If it is differnet, update the content
		   of the editor. This allow modifying the input outside of quill.
 */

/**
 * WARNING: 
 * 		componentWillReceiveProps is depreciated in version 17! componentWillReceiveProps is currently used to update the
 * 		editor if the prop changes value such that it differs from the state of the RichText component.
 */

//__________________________________________________


export default class ReactQuillv2 extends React.Component {

    constructor(props) {
        super(props)

		this.state = {
			generation: 0,
			value: this.isControlled()
				? this.props.value
				: this.defaultValue,
			lastRange: null,
		}

		// Internalized all the props. These can of course at any time become props again.
		this.defaultValue = "<p>the default value</p>"
		//this.state = {}
		this.style = {}
		this.className = ""
		this.onKeyPress = null
		this.onKeyDown = null
		this.onKeyUp = null
		this.bounds = null
		this.formats = null
		this.placeholder = null
		this.scrollingContainer = null
		this.readOnly = false
		this.tabIndex = null
		this.theme = "snow"


        this.modules = {
			imageResize: {
				// See optional "config" below
			},
			keyboard: {
				bindings: {}
			},
            toolbar: {
				container: '#QuillToolbar__' + props.id,
				/*
				Handler functions will be bound to the toolbar (so using this will refer to the toolbar 
					instance) and passed the value attribute of the input if the corresponding format 
					is inactive, and false otherwise. Adding a custom handler will overwrite the default 
					toolbar and theme behavior. 
				*/
                handlers: {

                },
            },
            syntax: true
        }


		// Method this binding
		this.renderEditingArea = this.renderEditingArea.bind(this)

		// Editing Methods this binding 
		this.toggleBold = this.toggleBold.bind(this)

	}
	
    //_________________ MIXIN ____________________________

	/**
	Creates an editor on the given element. The editor will
	be passed the configuration, have its events bound,
	*/
	createEditor(el, config) {
		var editor = new Quill(el, config);
		if (config.tabIndex !== undefined) {
			this.setEditorTabIndex(editor, config.tabIndex);
		}
		this.hookEditor(editor);
		return editor;
	}

	hookEditor(editor) {
		// Expose the editor on change events via a weaker,
		// unprivileged proxy object that does not allow
		// accidentally modifying editor state.
		var unprivilegedEditor = this.makeUnprivilegedEditor(editor);

		this.handleTextChange = (delta, oldDelta, source) => {
			if (this.onEditorChangeText) {
				this.onEditorChangeText(
					editor.root.innerHTML, delta, source,
					unprivilegedEditor
				);
				this.onEditorChangeSelection(
					editor.getSelection(), source,
					unprivilegedEditor
				);
			}
		}

		this.handleSelectionChange = (range, oldRange, source) => {
			if (this.onEditorChangeSelection) {
				this.onEditorChangeSelection(
					range, source,
					unprivilegedEditor
				);
			}
		}

		editor.on('editor-change', (eventType, rangeOrDelta, oldRangeOrOldDelta, source) => {
			// console.log("Editor changed: ", eventType, rangeOrDelta, oldRangeOrOldDelta, source)
			if (eventType === Quill.events.SELECTION_CHANGE) {
				this.handleSelectionChange(rangeOrDelta, oldRangeOrOldDelta, source);
			}
			
			if (eventType === Quill.events.TEXT_CHANGE) {
				this.handleTextChange(rangeOrDelta, oldRangeOrOldDelta, source);
			}
		});
    }
    
	unhookEditor(editor) {
		editor.off('selection-change');
		editor.off('text-change');
		// Editor Change??
	}

	setEditorReadOnly(editor, value) {
		value? editor.disable()
		     : editor.enable();
	}

	/*
	Replace the contents of the editor, but keep
	the previous selection hanging around so that
	the cursor won't move.
	*/
	setEditorContents(editor, value) {
		var sel = editor.getSelection();

		if (typeof value === 'string') {
			editor.setContents(editor.clipboard.convert(value));
		} else {
			editor.setContents(value);
		}

		if (sel && editor.hasFocus()) this.setEditorSelection(editor, sel);
	}

	setEditorSelection(editor, range) {
		if (range) {
			// Validate bounds before applying.
			var length = editor.getLength();
			range.index = Math.max(0, Math.min(range.index, length-1));
			range.length = Math.max(0, Math.min(range.length, (length-1) - range.index));
		}
		editor.setSelection(range);
	}

	setEditorTabIndex(editor, tabIndex) {
		if (editor.editor && editor.editor.scroll && editor.editor.scroll.domNode) {
			editor.editor.scroll.domNode.tabIndex = tabIndex;
		}
	}

	/*
	Returns an weaker, unprivileged proxy object that only
	exposes read-only accessors found on the editor instance,
	without any state-modificating methods.
	*/
	makeUnprivilegedEditor(editor) {
		var e = editor;
		return {
			getLength:    function(){ return e.getLength.apply(e, arguments); },
			getText:      function(){ return e.getText.apply(e, arguments); },
			getHTML:      function(){ return e.root.innerHTML },
			getContents:  function(){ return e.getContents.apply(e, arguments); },
			getSelection: function(){ return e.getSelection.apply(e, arguments); },
			getBounds:    function(){ return e.getBounds.apply(e, arguments); },
		};
	}

    //_________________ COMPONENT_______________________

	/*
	We consider the component to be controlled if `value` is being sent in props.
	*/
	isControlled() {
		return 'value' in this.props;
	}

	componentWillReceiveProps(nextProps, nextState) {
		var editor = this.editor;

		// If the component is unmounted and mounted too quickly
		// an error is thrown in setEditorContents since editor is
		// still undefined. Must check if editor is undefined
		// before performing this call.
		if (!editor) return;
		
		// Update only if we've been passed a new `value`.
		// This leaves components using `defaultValue` alone.
		if ('value' in nextProps) {
			var currentContents = this.getEditorContents();
			var nextContents = nextProps.value;

			if (nextContents === this.lastDeltaChangeSet) throw new Error(
				'You are passing the `delta` object from the `onChange` event back ' +
				'as `value`. You most probably want `editor.getContents()` instead. ' +
				'See: https://github.com/zenoamaro/react-quill#using-deltas'
			);

			// NOTE: Seeing that Quill is missing a way to prevent
			//       edits, we have to settle for a hybrid between
			//       controlled and uncontrolled mode. We can't prevent
			//       the change, but we'll still override content
			//       whenever `value` differs from current state.
			// NOTE: Comparing an HTML string and a Quill Delta will always trigger 
			//       a change, regardless of whether they represent the same document.
			if (!this.isEqualValue(nextContents, currentContents)) {
				this.setEditorContents(editor, nextContents); // when the value prop changed from the current state, update the editor
			}
		}
		
		// We can update readOnly state in-place.
		if ('readOnly' in nextProps) {
			if (nextProps.readOnly !== this.readOnly) {
				this.setEditorReadOnly(editor, nextProps.readOnly);
			}
		}

		// If we need to regenerate the component, we can avoid a detailed
		// in-place update step, and just let everything rerender.
		if (this.shouldComponentRegenerate(nextProps, nextState)) {
			return this.regenerate();
		}
	}

	registerMiniToolbarHandlers(handlers) {
		Object.keys(handlers).forEach(key => {
			let input = document.getElementById(key+this.props.id)
			input.addEventListener(handlers[key].event, handlers[key].callback.bind(this))
		})
	}
	removeMiniToolbarHandlers(handlers) {
		// Replace the elements to remove listeners
		Object.keys(handlers).forEach(key => {
			let oldInput = document.getElementById(key+this.props.id)
			var newInput = oldInput.cloneNode(true);
			oldInput.parentNode.replaceChild(newInput, oldInput);
		})
	}

	// OBS: This is where custom handlers are registered!
	componentDidMount() {

		this.editor = this.createEditor(
			this.getEditingArea(),
			this.getEditorConfig()
		);

		this.editor.enable(false)

		if (this.props.miniToolbarHandlers) {
			this.registerMiniToolbarHandlers(this.props.miniToolbarHandlers)
		}

		// this allows the react component to listen for events in quill
		// but it is still a problem to edit quill based on react events.
		if (this.props.editorHandlers) {
			this.props.editorHandlers.forEach(handler => {
				handler(this.editor)
			})
		}

		// Restore editor from Quill's native formats in regeneration scenario
		if (this.quillDelta) {
			this.editor.setContents(this.quillDelta);
			this.editor.setSelection(this.quillSelection);		
			this.editor.focus();
			this.quillDelta = this.quillSelection = null;
			return;
		}
		if (this.state.value) {
			this.setEditorContents(this.editor, this.state.value);
			return;
		} 
	
	}

	componentWillUnmount() {
		// remove custom handlers 
		if (this.props.miniToolbarHandlers) {
			this.removeMiniToolbarHandlers(this.props.miniToolbarHandlers)
		}

		var editor; if ((editor = this.getEditor())) {
			this.unhookEditor(editor);
			this.editor = null;
		}
	}

	shouldComponentUpdate(nextProps, nextState, nextContext) {
		// console.log("shouldComponentUpdate: ", nextProps.enable, this.props.enable )
		if (nextProps.enable !== this.props.enable) {
			this.editor.enable(nextProps.enable)
		}

		// If the component has been regenerated, we already know we should update.
		if (this.state.generation !== nextState.generation) {
			return true;
		}
		
		// Compare props that require React updating the DOM.
		return some(this.cleanProps, (prop) => {
			// Note that `isEqual` compares deeply, making it safe to perform
			// non-immutable updates, at the cost of performance.
			// need to see if the context was updated
			return !isEqual(nextProps[prop], this.props[prop]);
		});
	}

	shouldComponentRegenerate(nextProps, nextState) {
		// Whenever a `dirtyProp` changes, the editor needs reinstantiation.
		return some(this.dirtyProps, (prop) => {
			// Note that `isEqual` compares deeply, making it safe to perform
			// non-immutable updates, at the cost of performance.
			return !isEqual(nextProps[prop], this.props[prop]);
		});
	}

	/*
	If we could not update settings from the new props in-place, we have to tear
	down everything and re-render from scratch.
	*/
	componentWillUpdate(nextProps, nextState) {
		if (this.state.generation !== nextState.generation) {
			this.componentWillUnmount();
		}
	}

	componentDidUpdate(prevProps, prevState) {
		if (this.state.generation !== prevState.generation) {
			this.componentDidMount();
		}
		
		
	}
	
	getEditorConfig() {
		return {
			bounds:       this.bounds,
			formats:      this.formats,
			modules:      this.modules,
			placeholder:  this.placeholder,
			readOnly:     this.readOnly,
      		scrollingContainer: this.scrollingContainer,
			tabIndex:     this.tabIndex,
			theme:        this.theme,
		};
	}

	getEditor() {
		return this.editor;
	}

	getEditingArea() {
		return ReactDOM.findDOMNode(this.editingArea);
	}

	getEditorContents() {
		return this.state.value;
	}

	getEditorSelection() {
		return this.state.selection;
	}

	/*
	True if the value is a Delta instance or a Delta look-alike.
	*/
	isDelta(value) {
		return value && value.ops;
    }
    
	/*
	Special comparison function that knows how to compare Deltas.
	*/
	isEqualValue(value, nextValue) {
		if (this.isDelta(value) && this.isDelta(nextValue)) {
			return isEqual(value.ops, nextValue.ops);
		} else {
			return isEqual(value, nextValue);
		}
	}

	/*
	Regenerating the editor will cause the whole tree, including the container,
	to be cleaned up and re-rendered from scratch.
	*/
	regenerate() {
		// Cache selection and contents in Quill's native format to be restored later
		this.quillDelta = this.editor.getContents();
		this.quillSelection = this.editor.getSelection();
		this.setState({
			generation: this.state.generation + 1,
		});
	}

	/*
	Renders an editor area, unless it has been provided one to clone.
	*/
	renderEditingArea() {
		// var self = this;
		var children = this.children;
		var preserveWhitespace = this.preserveWhitespace;

		var properties = {
			key: this.state.generation,
			tabIndex: this.tabIndex,
			ref: (element) => { this.editingArea = element },
		};

		var customElement = React.Children.count(children)
			? React.Children.only(children)
			: null;
		var defaultElement = preserveWhitespace ? DOM.pre : DOM.div;
		var editingArea = customElement
			? React.cloneElement(customElement, properties)
			: defaultElement(properties);

		return editingArea;
    }

	onEditorChangeText(value, delta, source, editor) {
		var currentContents = this.getEditorContents(); // the component state

		// We keep storing the same type of value as what the user gives us,
		// so that value comparisons will be more stable and predictable.
		var nextContents = this.isDelta(currentContents)
			? editor.getContents()
			: editor.getHTML(); // 
		
		if (!this.isEqualValue(nextContents, currentContents)) {
			// Taint this `delta` object, so we can recognize whether the user
			// is trying to send it back as `value`, preventing a likely loop.
			this.lastDeltaChangeSet = delta;

			this.setState({ value: nextContents }); // the state is set here and updateComponent is called, but the editor is not updated.

			if (this.props.onChange) {
				// this.props.onChange(value, delta, source, editor);
				this.props.onChange(value, delta, source, editor)
			}
		}
	}

	onEditorChangeSelection(nextSelection, source, editor) {
		var currentSelection = this.getEditorSelection();
		var hasGainedFocus = !currentSelection && nextSelection;
		var hasLostFocus = currentSelection && !nextSelection;

		if (isEqual(nextSelection, currentSelection)) {
			return;
		}
		
		this.setState({ selection: nextSelection });
		
		if (this.onChangeSelection) {
			this.onChangeSelection(nextSelection, source, editor);
		}

		if (hasGainedFocus && this.props.onFocus) {
			this.props.onFocus(nextSelection, source, editor);
		} else if (hasLostFocus && this.props.onBlur) {
			this.props.onBlur(currentSelection, source, editor);
		}
	}

	focus() {
		this.editor.focus();
	}

	blur() {
		this.setEditorSelection(this.editor, null);
	}


	//______________Custom Methods ____________________________

	
	//__________________Custom Editing Methods____________________
	toggleBold() {
        let quill = this.rqRef.getEditor()
        quill.format('bold', true); // need access to the quill instance...
	}


    render() {

		return ( // THE EDITOR 
			DOM.div({
				id: this.props.id,
				style: this.style,
				key: this.state.generation,
				className: ['quill'].concat(this.className).join(' '),
				onKeyPress: this.onKeyPress,
				onKeyDown: this.onKeyDown,
				onKeyUp: this.onKeyUp },
				this.renderEditingArea()
			)
		)
	}
}  

ReactQuillv2.defaultProps = {
	theme: 'snow',
	modules: {},
}

ReactQuillv2.propTypes = {
	key: PropTypes.string,
	sectionId: PropTypes.string, 
	sectionIndex: PropTypes.number,
	gridSectionIndex: PropTypes.number,
	componentStateIndex: PropTypes.number,
	id: PropTypes.string,
	
    //className: PropTypes.string,
    //theme: PropTypes.string,
    //style: PropTypes.object,
    //readOnly: PropTypes.bool,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ops: PropTypes.array})]),
    //defaultValue: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ops: PropTypes.array})]),
    //placeholder: PropTypes.string,
    //tabIndex: PropTypes.number,
    //bounds: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    onChange: PropTypes.func,
    //onChangeSelection: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func,
    //onKeyPress: PropTypes.func,
    //onKeyDown: PropTypes.func,
    //onKeyUp: PropTypes.func,
    //preserveWhitespace: PropTypes.bool,
	editorHandlers: PropTypes.array,
	miniToolbarHandlers: PropTypes.object,


	/*
    modules: function(props) {
        var isNotObject = PropTypes.object.apply(this, arguments);
        if (isNotObject) return isNotObject;

        if (
            props.modules && 
            props.modules.toolbar &&
            props.modules.toolbar[0] &&
            props.modules.toolbar[0].type
        ) return new Error(
            'Since v1.0.0, React Quill will not create a custom toolbar for you ' +
            'anymore. Create a toolbar explictly, or let Quill create one. ' +
            'See: https://github.com/zenoamaro/react-quill#upgrading-to-react-quill-v100'
        );
	},
	*/

	/*
    children: function(props) {
        // Validate that the editor has only one child element and it is not a <textarea>
        var isNotASingleElement = PropTypes.element.apply(this, arguments);
        if (isNotASingleElement) return new Error(
            'The Quill editing area can only be composed of a single React element.'
        );

        if (React.Children.count(props.children)) {
            var child = React.Children.only(props.children);
            if (child.type === 'textarea') return new Error(
                'Quill does not support editing on a <textarea>. Use a <div> instead.'
            );
        }
	}
	*/
}


/*
Changing one of these props should cause a full re-render.
*/
ReactQuillv2.dirtyProps =  [
    'modules',
    'formats',
    'bounds',
    'theme',
    'children',
	'editorHandlers',
	'miniToolbarHandlers',
]

/*
Changing one of these props should cause a regular update.
*/
ReactQuillv2.cleanProps = [
	'enable',
    'id',
    // 'className',
    // 'style',
    'placeholder',
    // 'tabIndex',
    'onChange',
    // 'onChangeSelection',
    'onFocus',
    'onBlur',
    // 'onKeyPress',
    // 'onKeyDown',
	// 'onKeyUp',

	// New props (update one time too many rather than one time too few)
	'key',
	'sectionId',
	'sectionIndex',
	'gridSectionIndex',
	'componentStateIndex',
	// 'componentState', // value // by not updating because of a value change, the component avoids updating the dom twice
	// (once by quill and then again by react causing quill to have to re-build and re-render (this logic is probably not even here.)) 
	//'updateComponentState', // onChange
]

ReactQuillv2.cleanContextProperties = [
	'activeRichTextEditor',
	'componentInFocus'
]