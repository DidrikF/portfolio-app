this.editorHandlers = [
    (quill) => {
        // console.log("handler registered on editor")
        quill.on(Quill.events.EDITOR_CHANGE, function (eventType, range) {
            window.Quill = quill

            // console.log("CUSTOM HANDLER CALLED; this is: ", this, " quill is: ", quill)
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
                let controlsElement = document.getElementById('tooltip-controls'+ this.props.id)
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
    }
]
 

this.miniToolbarHandlers = {
    "pullleft-button": {
        event: "click", 
        callback: function(e) {
            this.editor.format('pullleftclass', true, Quill.sources.USER); 
            this.editor.format('centerclass', false, Quill.sources.USER);
            this.editor.format('pullrightclass', false, Quill.sources.USER);
        }
    },
    "center-button": {
        event: "click",
        callback: function(e) {
            this.editor.format('pullleftclass', false, Quill.sources.USER); 
            this.editor.format('centerclass', true, Quill.sources.USER);
            this.editor.format('pullrightclass', false, Quill.sources.USER);

        }
    },
    "pullright-button": {
        event: "click",
        callback: function (e) {
            this.editor.format('pullleftclass', false, Quill.sources.USER); 
            this.editor.format('centerclass', false, Quill.sources.USER);
            this.editor.format('pullrightclass', true, Quill.sources.USER);
        }
    },
    "capture-range-button": {
        event: "click", 
        callback: function(e) {
            this.lastRange = this.editor.selection.getRange();
        }
    },
    "width-input": {
        event: "keyup",
        callback: function(e) {
            if (e.keyCode === 13) {
                let value = (e.target.value !== "") ? e.target.value : false
                this.editor.format("widthstyle", value, Quill.sources.USER)

            }
        }
    },
    "border-input": {
        event: "keyup",
        callback: function(e) {
            if (e.keyCode === 13) {
                let value = (e.target.value !== "") ? e.target.value : false
                this.editor.format("borderstyle", value, Quill.sources.USER)

            }
        }
    },
    "border-radius-input": {
        event: "keyup",
        callback: function(e) {
            if (e.keyCode === 13) {
                let value = (e.target.value !== "") ? e.target.value : false
                this.editor.format("borderradiusstyle", value, Quill.sources.USER)
            }
        }
    }
}

class RichText extends React.component {
    constructor() {
        let clearFormats = {
			'pullrightclass': false, 
			'pullleftclass': false, 
			'centerclass': false, 
			'widthstyle': false, 
			'borderstyle': false, 
			'borderradiusstyle': false, 
			'bordercolorstyle': false, 
		}

		//________________ OWN EXTENSIONS ___________________
		var keyboardBindings = {
			n: {
				key: 'n',
				handler: function(range, context) {
					if (range.length > 0) {
						this.quill.scroll.deleteAt(range.index, range.length); 
					}

					this.quill.insertText(range.index, '\n', {
						"block": true},
					Quill.sources.USER);

					this.quill.formatText(range.index+1, 1, clearFormats, Quill.sources.USER)

					this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
					this.quill.focus();
				}
			},
			c: {
				key: 'c',
				handler: function(range, context) {
					
					this.quill.formatText(range.index, (range.length > 0) ? range.length : 1, clearFormats, Quill.sources.USER)

					this.quill.focus();
				}
			},
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
                    'sideimage': function (value) {
                        let range = this.quill.getSelection(true); // quill is not available here. 
                        this.quill.insertEmbed(range.index, 'sideimage', {
                            alt: window.prompt("Alt: ", ""),
                            src: window.prompt("Src: ", "")
                        }, Quill.sources.USER);
                        this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
    
					},
					'pullright': function(value) { // quill wont add the event listener to the ql-pullright butten when it is outside of the toolbar (may be using the class ++ to find the buttons to add event listeners to)
						let range = this.quill.getSelection(true); // quill is not available here. 
                        this.quill.insertEmbed(range.index, 'pullright', {}, Quill.sources.USER);
                        this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
					},
					/*
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
                                        // console.log(e.target.result) // image data
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
                    },*/
                },
            },
            syntax: true
        }
    }

    hideTooltip() {
        this.setState({
            showTooltip: false
        })
    }
    showTooltip(css) {
		console.log("show tooltip called with css: ", css)
        this.setState({
            showTooltip: true,
            toolTip: {
                left: "40%", // css.left,
                top: "-20px", //css.top
                // textAlign: "center",
            } 
        })
    } 
    
    render() {
        return (
        <div>
            <div id={"tooltip-controls"+this.props.id} className="RichText__minitoolbar" style={{
                left: this.state.toolTip.left,
                top: this.state.toolTip.top, 
                display: this.state.showTooltip ? 'block' : 'none',
            }}>
                <button title="Capture Range" type="button" id={"capture-range-button"+this.props.id}>
                    <i class="material-icons">camera_alt</i>
                </button>

                <button title="Pull Left" type="button" id={"pullleft-button"+this.props.id}>
                    <i class="material-icons">format_align_left</i>
                </button>
                <button title="Center" type="button" id={"center-button"+this.props.id}>
                    <i class="material-icons">format_align_center</i>
                </button>
                <button title="Pull Right" type="button" id={"pullright-button"+this.props.id}>
                    <i class="material-icons">format_align_right</i>
                </button>


                <input placeholder="Width style attribute" id={"width-input"+this.props.id}/>
                <input placeholder="Border style attribute" id={"border-input"+this.props.id}/>
                <input placeholder="Border radius style attribute" id={"border-radius-input"+this.props.id}/>

                <button title="Border Color" type="button" id={"border-color-button"+this.props.id}>
                    <i class="material-icons">format_color_fill</i>
                </button>
            </div>
        </div>)
    }
}



/*
class Image extends Parchment.Embed {
  static create(value) {
    let node = super.create(value);
    if (typeof value === 'string') {
      node.setAttribute('src', this.sanitize(value));
    }
    return node;
  }

  static formats(domNode) {
    return ATTRIBUTES.reduce(function(formats, attribute) {
      if (domNode.hasAttribute(attribute)) {
        formats[attribute] = domNode.getAttribute(attribute);
      }
      return formats;
    }, {});
  }

  static match(url) {
    return /\.(jpe?g|gif|png)$/.test(url) || /^data:image\/.+;base64/.test(url);
  }

  static sanitize(url) {
    return sanitize(url, ['http', 'https', 'data']) ? url : '//:0';
  }

  static value(domNode) {
    return domNode.getAttribute('src');
  }

  format(name, value) {
    if (ATTRIBUTES.indexOf(name) > -1) {
      if (value) {
        this.domNode.setAttribute(name, value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}
Image.blotName = 'image';
Image.tagName = 'IMG';
*/


// maybe this is depreciated, at one point I think you could pass this function to quill 
// and it wold replace how it dealt with adding images to the scroll.
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




/*
this.formats = [ // not used atm, dont know if I will
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image',
]
*/

/* was given to the quill toolbar as an example (was commented out)
formats={[
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],
    
    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'script': 'sub' }, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction
    
    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    
    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],
    
    ['clean'],                                         // remove formatting button
    
    ['link', 'image', 'video']                         // link and image, video
]}
*/


// Toolbar 