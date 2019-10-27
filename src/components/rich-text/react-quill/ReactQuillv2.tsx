import React from 'react'; 
import ReactDOM from 'react-dom'
import { find, some, isEqual } from 'lodash'
import PropTypes  from 'prop-types'
import DOM from 'react-dom-factories'
import Delta from 'quill-delta';
import axios from "axios"

import Quill, { QuillOptionsStatic, RangeStatic, Sources, SelectionChangeHandler, TextChangeHandler, EditorChangeHandler } from 'quill'; // Is this the import I want, dont I want to use my local copy?
import { Id } from '../../../../types/basic-types';
import { ImageMetadata } from '../../../../types/platform_types';
import { Message } from '../../../App';
import { KeyValue } from '../../../../types/basic-types';

type IQuill = Quill & {
	events: any;
}

/**
 * Modifications made: 
 * 		1. Props have been turned into local variables
 * 		1. component related props are accepted via propTypes and 
 */


/**
 * How it works:
 * 		1. the editor deals with key presses internally and updates the html
 * 		2. an event listener is registered on the quill instance to update the state whenever the editor's content updates
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


// Need to read up on quill to know what the different props do?

export type ReactQuillv2Props = {
	value: string; // PropTypes.shape({ops: PropTypes.array}) // Delta?
	id: Id;
	flashMessage: (message: Message, duration: number) => void;
	defaultValue?: string; // PropTypes.oneOfType([PropTypes.string, PropTypes.shape({ops: PropTypes.array})]),
	enable?: boolean; 
	readOnly?: boolean;
	generation?: number,
	lastRange?: any;
	miniToolbarHandlers?: any; // Need to write type;
	editorHandlers?: any; // need to write type;
	className?: string;
	/*
		
		onChange: PropTypes.func,
		//onChangeSelection: PropTypes.func,
		onFocus: PropTypes.func,
		onBlur: PropTypes.func,
		//onKeyPress: PropTypes.func,
		//onKeyDown: PropTypes.func,
		//onKeyUp: PropTypes.func,
		//preserveWhitespace: PropTypes.bool,
	*/
}

export type ReactQuillv2State = {
	value: string;
	generation: number;
	lastRange: RangeStatic | null;
}


export default class ReactQuillv2 extends React.Component<ReactQuillv2Props, ReactQuillv2State> {
	state: ReactQuillv2State;
	defaultValue: string;
	style: KeyValue<string>;
	className: string;
	onKeyPress: Function | null;
	onKeyDown: Function | null;
	onKeyUp: Function | null;

	formats: any; // whitelist of formats to allow in the editor, default is all
	placeholder: string | null; // 
	
	scrollingContainer: HTMLElement | null; 
	readOnly: boolean;
	theme: string;
	modules: any;
	handleTextChange: TextChangeHandler;
	handleSelectionChange: SelectionChangeHandler;
	handleEditorChange: EditorChangeHandler;
	editor: IQuill | null;
	lastDeltaChangeSet: any;
	editingArea: React.Component | null;

	quillDelta: Delta | null; // Used to save state between full re-render
	quillSelection: RangeStatic | null; // Used to save state between full re-render

	
	/*
	Changing one of these props should cause a regular update.
	*/
	static cleanProps: keyof Partial<ReactQuillv2Props> = [
		'enable',
		'id',
		'className',
		'style',
		'onFocus',
		'onBlur',
		// 'onChange', //'updateComponentState',
		// 'onChangeSelection',
		// 'onKeyPress',
		// 'onKeyDown',
		// 'onKeyUp',

		// 'componentState', // value // by not updating because of a value change, the component avoids updating the dom twice
		// (once by quill and then again by react causing quill to have to re-build and re-render (this logic is probably not even here.)) 
	];
	
	/*
	Changing one of these props should cause a full re-render.
	*/
	static dirtyProps: Partial<ReactQuillv2Props> = [
		'formats',
		'children', // WIll I use this? 
		'editorHandlers',
		'miniToolbarHandlers',
	]
	
	static cleanContextProperties = [
		'activeRichTextEditor',
		'componentInFocus'
	]

	static defaultProps = {
		// need to fill inn
	}

    constructor(props: ReactQuillv2Props) {
        super(props)
		
		this.defaultValue = "<p>the default value</p>"
		this.style = {}
		this.className = ""
		this.onKeyPress = null
		this.onKeyDown = null
		this.onKeyUp = null
		this.formats = null // is this used for toolbar config? // if so, I need to update it!
		this.placeholder = null
		this.scrollingContainer = null
		this.readOnly = false
		this.theme = "snow"
		this.handleTextChange = () => {};
		this.handleSelectionChange = () => {};
		this.handleEditorChange = () => {};
		this.editor = null;
		this.editingArea = null; // selector for the element?
		this.quillDelta = null;
		this.quillSelection = null;
		
		this.state = {
			generation: 0,
			value: this.isControlled()
				? this.props.value
				: this.defaultValue,
			lastRange: null,
		}

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
	createEditor = (el: HTMLElement, config: QuillOptionsStatic) => {
		var editor = new Quill(el, config) as IQuill;
		const flashMessage = this.props.flashMessage;

		editor.getModule("toolbar").addHandler("image", function () {
			const page = document.querySelector(".Page")
			const imagePreviewContainer = document.createElement("div")
			imagePreviewContainer.id = "image-selector"
			imagePreviewContainer.classList.add("RichText__image-selector-container")

			
			axios.get("/images").then(response => { // its sub optimal that I load the images every time I want to add one.
				const images: ImageMetadata[] = response.data.images

				images.forEach(image => {
					const img = document.createElement("img")
					img.src = image.path
					img.height = 90
					img.width = 90*(image.width/image.height);
					img.classList.add("RichText__image-selector-image")
					
					img.addEventListener("click", () => {
						if (page) page.removeChild(imagePreviewContainer)
						let range = editor.getSelection(true);
						editor.updateContents(new Delta()
							.retain(range.index)
							.delete(range.length)
							.insert({ image: image.path })
							, (Quill as any).sources.USER);
						editor.setSelection(range.index + 1, (Quill as any).sources.SILENT);
					
					})
					imagePreviewContainer.appendChild(img)
				})
				if (page) page.appendChild(imagePreviewContainer);
			}).catch(() => {
				flashMessage({text: "Failed to load images from the server. You will not be able to add images in the rich text component", type: "error"}, 3);
			})
		});

		editor.getModule("toolbar").addHandler("video", function () {
			// Load and show videos from server...
			// I want to be able to add my own custom videos...
		});

		this.hookEditor(editor);
		return editor;
	}

	hookEditor(editor: IQuill) {
		// Expose the editor on change events via a weaker,
		// unprivileged proxy object that does not allow
		// accidentally modifying editor state.
		var unprivilegedEditor = this.makeUnprivilegedEditor(editor);
		
		this.handleSelectionChange = (range: RangeStatic, oldRange: RangeStatic, source: Sources) => {
			if (this.onEditorChangeSelection) {
				this.onEditorChangeSelection(
					range, source,
					unprivilegedEditor
				);
			}
		}
		this.handleTextChange = (delta: Delta, oldDelta: Delta, source: Sources) => {
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

		this.handleEditorChange = (eventType: string, rangeOrDelta: RangeStatic | Delta, oldRangeOrOldDelta: RangeStatic | Delta, source: Sources) => {
			// console.log("Editor changed: ", eventType, rangeOrDelta, oldRangeOrOldDelta, source)
			if (eventType === (Quill as any).events.SELECTION_CHANGE) {
				this.handleSelectionChange(rangeOrDelta, oldRangeOrOldDelta, source);
			}
			
			if (eventType === (Quill as any).events.TEXT_CHANGE) {
				this.handleTextChange(rangeOrDelta, oldRangeOrOldDelta, source);
			}
		}

		editor.on('editor-change', this.handleEditorChange);
    }
    
	unhookEditor(editor: IQuill) { 
		// editor.off('selection-change', this.handleSelectionChange);
		// editor.off('text-change', this.handleTextChange);
		
		// Editor Change was not there before?
		editor.off('editor-change', this.handleEditorChange);
	}

	setEditorReadOnly(editor: IQuill, value: boolean) {
		value? editor.disable()
		     : editor.enable();
	}

	/*
	Replace the contents of the editor, but keep
	the previous selection hanging around so that
	the cursor won't move.
	*/
	setEditorContents(editor: IQuill, value: string) {
		var sel = editor.getSelection();

		if (typeof value === 'string') {
			editor.setContents(editor.clipboard.convert(value));
		} else {
			editor.setContents(value);
		}

		if (sel && editor.hasFocus()) this.setEditorSelection(editor, sel);
	}

	setEditorSelection(editor: IQuill, range: RangeStatic) {
		if (range) {
			// Validate bounds before applying.
			var length = editor.getLength();
			range.index = Math.max(0, Math.min(range.index, length-1));
			range.length = Math.max(0, Math.min(range.length, (length-1) - range.index));
		}
		editor.setSelection(range);
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

	componentWillReceiveProps(nextProps: ReactQuillv2Props, nextState: ReactQuillv2State) {
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

	registerMiniToolbarHandlers(handlers: {[key: string]: {event: string, callback: Function}}) {
		Object.keys(handlers).forEach(key => {
			let input = document.getElementById(key+this.props.id)
			if (input) input.addEventListener(handlers[key].event, handlers[key].callback.bind(this))
		})
	}
	removeMiniToolbarHandlers(handlers: {[key: string]: {event: string, callback: Function}}) {
		// Replace the elements to remove listeners
		Object.keys(handlers).forEach(key => {
			let oldInput = document.getElementById(key+this.props.id);
			if (oldInput) {
				var newInput = oldInput.cloneNode(true);
				if (oldInput.parentNode) oldInput.parentNode.replaceChild(newInput, oldInput);
			}
		})
	}

	// OBS: This is where custom handlers are registered!
	componentDidMount() {
		this.editor = this.createEditor(
			this.getEditingArea(),
			this.getEditorConfig()
		);
			
		if (this.props.enable) {
			this.editor.enable(true)
		} else {
			this.editor.enable(false)
		}

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
			if (this.quillSelection) this.editor.setSelection(this.quillSelection);		
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
		
		const editor = this.getEditor();
		if (editor) {
			this.unhookEditor(editor);
			this.editor = null;
		}
	}

	shouldComponentUpdate(nextProps: ReactQuillv2Props, nextState: ReactQuillv2State) {
		// console.log("shouldComponentUpdate: ", nextProps.enable, this.props.enable )
		if (nextProps.enable !== this.props.enable) {
			if (this.editor) this.editor.enable(nextProps.enable)
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
		// NOTE: here you can detect prop changes and notify the underlying editor and toolbar
	}
	
	getEditorConfig(): any {
		return {
			formats:      this.formats,
			modules:      this.modules,
			placeholder:  this.placeholder,
			readOnly:     this.readOnly,
      		scrollingContainer: this.scrollingContainer,
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
		if (this.editor) {
			this.quillDelta = this.editor.getContents();
			this.quillSelection = this.editor.getSelection();
		}
		this.setState({
			generation: this.state.generation + 1,
		});
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
	toggleBold() { // Is this just an example?
        let quill = this.rqRef.getEditor()
        quill.format('bold', true); // need access to the quill instance...
	}


    render() {

		return ( // THE EDITOR (maybe make more of these props?)
			DOM.div({
				id: this.props.id,
				style: this.style,
				key: this.state.generation,
				className: ['quill'].concat(this.className).join(' '),
				onKeyPress: this.onKeyPress,
				onKeyDown: this.onKeyDown,
				onKeyUp: this.onKeyUp },
				<div key={this.state.generation} ref={(element: HTMLDivElement) => { this.editingArea = element }} />
			)
		)
	}
}  
