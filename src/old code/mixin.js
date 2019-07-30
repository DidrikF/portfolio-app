'use strict';

var Quill = require('quill');
var Delta = require('quill-delta');

let Inline = Quill.import('blots/inline');
let Block = Quill.import('blots/block');
let BlockEmbed = Quill.import('blots/block/embed');

class SideImage extends BlockEmbed {
    static create(value) {
        let node = super.create();
        node.setAttribute('alt', value.alt);
        node.setAttribute('src', value.src);
        // conditinal logic to set the styling of the image...
        node.setAttribute('style', 'width: 50%; float: right;')
        return node;
    }

    static value(node) {
        return {
            alt: node.getAttribute('alt'),
            url: node.getAttribute('src'),
            style: node.getAttribute('style')
        };
    }
}
SideImage.blotName = 'sideimage';
SideImage.tagName = 'img';

Quill.register(SideImage)


function imageHandler(image, callback) {
    console.log("From the image handler: ", image) // is a File objest, see the File-web-api docs for info
    /*
    var formData = new FormData();
    formData.append('image', image, image.name);
  
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'handler.php', true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        callback(xhr.responseText);
      }
    };
    xhr.send(formData);
    */
    callback("given to callback"); // takes the src attribute value
};



var QuillMixin = {
	modules: {
        toolbar: {
            container: '#QuillToolbar__' + this.props.id,
            handlers: {
                'sideimage': function (value) {
                    let range = this.quill.getSelection(true); // need the editor instance. 
                    this.quill.insertEmbed(range.index, 'sideimage', {
                        alt: window.prompt("Alt: ", ""),
                        src: window.prompt("Src: ", "")
                    }, Quill.sources.USER);
                    this.quill.setSelection(range.index + 1, Quill.sources.SILENT);

                },

                'image': function () { // this is the toolbar instance!
                    let fileInput = this.container.querySelector('input.ql-image[type=file]');
                    if (fileInput == null) {
                        fileInput = document.createElement('input');
                        fileInput.setAttribute('type', 'file');
                        fileInput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
                        fileInput.classList.add('ql-image');
                        fileInput.addEventListener('change', () => {
                            if (fileInput.files != null && fileInput.files[0] != null) {
                                let reader = new FileReader();
                                reader.onload = (e) => {
                                    // upload image to server, to any needed image processing and return a link to the uploaded image
                                    let range = this.quill.getSelection(true);
                                    console.log(e.target.result)
                                    // maybe a need to to this when i want to change the style of an existing element?
                                    this.quill.updateContents(new Delta()
                                        .retain(range.index)
                                        .delete(range.length)
                                        .insert({
                                            sideimage: {
                                                alt: "test image",
                                                src: 'https://cdn.pixabay.com/photo/2013/07/12/17/47/test-pattern-152459_960_720.png'
                                            }
                                        })
                                        //.insert({ image: e.target.result }) // this is where the editor is updated with the image Blot/html-element
                                        , Quill.sources.USER);
                                    this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
                                    fileInput.value = "";
                                }
                                reader.readAsDataURL(fileInput.files[0]);
                            }
                        });
                        this.container.appendChild(fileInput); // adds a hidden image input to the toolbar which gets clicked when
                    }

                    fileInput.click();
                },
            },
        },
        syntax: true
    },

    // need to remove handlers... or is is already implemented?
    customHandlers: [(quill) => {
        quill.on(Quill.events.EDITOR_CHANGE, function (eventType, range) {
            console.log("CUSTOM HANDLER CALLED; this is: ", this, " quill is: ", quill)
            if (eventType !== Quill.events.SELECTION_CHANGE) return;
            if (range == null) return;
            if (range.length === 0) {
                // hide controls
                this.hideTooltip()
            } else {
                let rangeBounds = quill.getBounds(range); /* 
                { // I dont know the reference point...
                bottom: 29.34661865234375
                height: 14.54547119140625
                left: 81.4488525390625
                right: 171.07952880859375
                top: 14.8011474609375
                width: 89.63067626953125
            } */
                let controlsElement = document.getElementById('tooltip-controls'+this.props.id)
                // console.log("props.id in custom handler: ", this.props.id)
                // console.log(controlsElement) // need to have the node rendered, and use display property to toggle
                if (controlsElement) {
                    var elementWidth = controlsElement.offsetWidth
                }
                this.showTooltip({
                    left: rangeBounds.left + rangeBounds.width / 2 - elementWidth / 2 - 60, 
                    top: rangeBounds.bottom + 12
                })
            }
        }.bind(this));
    }],


    toolbarHandlers: [

	],
	

	//___________________________________________________________________________

	/**
	Creates an editor on the given element. The editor will
	be passed the configuration, have its events bound,
	*/
	createEditor: function($el, config) {
		var editor = new Quill($el, config);
		if (config.tabIndex !== undefined) {
			this.setEditorTabIndex(editor, config.tabIndex);
		}
		this.hookEditor(editor);
		return editor;
	},

	hookEditor: function(editor) {
		// Expose the editor on change events via a weaker,
		// unprivileged proxy object that does not allow
		// accidentally modifying editor state.
		var unprivilegedEditor = this.makeUnprivilegedEditor(editor);

		this.handleTextChange = function(delta, oldDelta, source) {
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
		}.bind(this);

		this.handleSelectionChange = function(range, oldRange, source) {
			if (this.onEditorChangeSelection) {
				this.onEditorChangeSelection(
					range, source,
					unprivilegedEditor
				);
			}
		}.bind(this);

		editor.on('editor-change', function(eventType, rangeOrDelta, oldRangeOrOldDelta, source) {
			if (eventType === Quill.events.SELECTION_CHANGE) {
				this.handleSelectionChange(rangeOrDelta, oldRangeOrOldDelta, source);
			}
			
			if (eventType === Quill.events.TEXT_CHANGE) {
				this.handleTextChange(rangeOrDelta, oldRangeOrOldDelta, source);
			}
		}.bind(this));
	},

	unhookEditor: function(editor) {
		editor.off('selection-change');
		editor.off('text-change');
	},

	setEditorReadOnly: function(editor, value) {
		value? editor.disable()
		     : editor.enable();
	},

	/*
	Replace the contents of the editor, but keep
	the previous selection hanging around so that
	the cursor won't move.
	*/
	setEditorContents: function(editor, value) {
		var sel = editor.getSelection();

		if (typeof value === 'string') {
			editor.setContents(editor.clipboard.convert(value));
		} else {
			editor.setContents(value);
		}

		if (sel && editor.hasFocus()) this.setEditorSelection(editor, sel);
	},

	setEditorSelection: function(editor, range) {
		if (range) {
			// Validate bounds before applying.
			var length = editor.getLength();
			range.index = Math.max(0, Math.min(range.index, length-1));
			range.length = Math.max(0, Math.min(range.length, (length-1) - range.index));
		}
		editor.setSelection(range);
	},

	setEditorTabIndex: function(editor, tabIndex) {
		if (editor.editor && editor.editor.scroll && editor.editor.scroll.domNode) {
			editor.editor.scroll.domNode.tabIndex = tabIndex;
		}
	},

	/*
	Returns an weaker, unprivileged proxy object that only
	exposes read-only accessors found on the editor instance,
	without any state-modificating methods.
	*/
	makeUnprivilegedEditor: function(editor) {
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

};

module.exports = QuillMixin;
