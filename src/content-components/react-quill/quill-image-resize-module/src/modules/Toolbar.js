import Quill from 'quill';

import { BaseModule } from './BaseModule';

import { PullRightClass, PullLeftClass, CenterClass, WidthStyle, BorderStyle, BorderRadiusStyle, BorderColorStyle, MarginStyle, PaddingStyle } from '../../../quill-extensions'

const icons = Quill.import('ui/icons');

const IconAlignLeft = icons['align']['']// 'quill/assets/icons/align-left.svg';
const IconAlignCenter = icons['align']['center'] // 'quill/assets/icons/align-center.svg';
const IconAlignRight = icons['align']['right'] // 'quill/assets/icons/align-right.svg';

// console.log("icons: ", icons)


export class Toolbar extends BaseModule {
    onCreate = () => {
		// Setup Toolbar
        this.toolbar = document.createElement('div');
        Object.assign(this.toolbar.style, this.options.toolbarStyles);
        this.overlay.appendChild(this.toolbar);

        // Setup Buttons
        this._defineAlignments();
        this._addToolbarButtons();
    };

	// The toolbar and its children will be destroyed when the overlay is removed
    onDestroy = () => {};

	// Nothing to update on drag because we are are positioned relative to the overlay
    onUpdate = () => {};

    _defineAlignments = () => {
        this.alignments = [
            {
                icon: IconAlignLeft,
                apply: () => {
                    PullLeftClass.add(this.img, true)
                    /*
                    DisplayStyle.add(this.img, 'inline');
                    FloatStyle.add(this.img, 'left');
                    MarginStyle.add(this.img, '0 1em 1em 0');
                    */
                },
                isApplied: () => {
                    console.log(PullLeftClass.value(this.img))  // returns true
                    return PullLeftClass.value(this.img)
                }
            },
            {
                icon: IconAlignCenter,
                apply: () => {
                    CenterClass.add(this.img, true)
                    /*
                    DisplayStyle.add(this.img, 'block');
                    FloatStyle.remove(this.img);
                    MarginStyle.add(this.img, 'auto');
                    */
                },
                isApplied: () => CenterClass.value(this.img),
            },
            {
                icon: IconAlignRight,
                apply: () => {
                    PullRightClass.add(this.img, true)
                    /*
                    DisplayStyle.add(this.img, 'inline');
                    FloatStyle.add(this.img, 'right');
                    MarginStyle.add(this.img, '0 0 1em 1em');
                    */
                },
                isApplied: () => PullRightClass.value(this.img),
            },
            { // Border
                type: "input",
                label: "Border",
                attributes: {
                    placeholder: 'Border Style',
                    class: "RichText__ImageResize__input"
                },
                apply: (value) => {
                    BorderStyle.add(this.img, value)
                },
                remove: () => {
                    BorderStyle.remove(this.img)
                },
                isApplied: () => {
                    console.log("Border style value: ", BorderStyle.value(this.img))
                    return BorderStyle.value(this.img)
                }
            },
            { // Border Radius
                type: "input",
                label: "Border Radius",
                attributes: {
                    placeholder: 'Border Radius Style',
                    class: "RichText__ImageResize__input"
                },
                apply: (value) => {
                    BorderRadiusStyle.add(this.img, value)
                },
                remove: () => {
                    BorderRadiusStyle.remove(this.img)
                },
                isApplied: () => {
                    console.log("Border style value: ", BorderRadiusStyle.value(this.img))
                    return BorderRadiusStyle.value(this.img)
                }
            },
            { // Margin
                type: "input",
                label: "Margin", 
                attributes: {
                    placeholder: 'Margin Style',
                    class: "RichText__ImageResize__input"
                },
                apply: (value) => {
                    MarginStyle.add(this.img, value)
                },
                remove: () => {
                    MarginStyle.remove(this.img)
                },
                isApplied: () => {
                    console.log("Margin style value: ", MarginStyle.value(this.img))
                    return MarginStyle.value(this.img)
                }
            },
            { // Padding
                type: "input",
                label: "Padding",
                attributes: {
                    placeholder: 'padding Style',
                    class: "RichText__ImageResize__input"
                },
                apply: (value) => {
                    PaddingStyle.add(this.img, value)
                },
                remove: () => {
                    PaddingStyle.remove(this.img)
                },
                isApplied: () => {
                    console.log("Padding style value: ", PaddingStyle.value(this.img))
                    return PaddingStyle.value(this.img)
                }
            }
        ];
    };

    _addToolbarButtons = () => {
		const buttons = [];
		this.alignments.forEach((alignment, idx) => {

            if (alignment.type === "input") {
                const input = this._createInput(alignment, idx)
                this.toolbar.appendChild(input);
                return 
            }

			const button = document.createElement('span');
			buttons.push(button);
			button.innerHTML = alignment.icon;
			button.addEventListener('click', () => {
					// deselect all buttons
				buttons.forEach(button => button.style.filter = ''); // reset styles on click
                if (alignment.isApplied()) {
                    PullLeftClass.remove(this.img)
                    CenterClass.remove(this.img)
                    PullRightClass.remove(this.img)
                } else {
                    PullLeftClass.remove(this.img)
                    CenterClass.remove(this.img)
                    PullRightClass.remove(this.img)
                    this._selectButton(button)
                    alignment.apply()
                }

                /*
                if (alignment.isApplied()) {
					// If applied, unapply
					FloatStyle.remove(this.img);
					MarginStyle.remove(this.img);
					DisplayStyle.remove(this.img);
				} else {

					// otherwise, select button and apply
					this._selectButton(button);
					alignment.apply();
				}*/
                
                // image may change position; redraw drag handles
				this.requestUpdate();
            });
            
            
			Object.assign(button.style, this.options.toolbarButtonStyles);
			if (idx > 0) {
				button.style.borderLeftWidth = '0';
            }
            console.log("Button children in Toolbar: ", button.children)
			Object.assign(button.children[0].style, this.options.toolbarButtonSvgStyles);
			if (alignment.isApplied()) {
					// select button if previously applied
				this._selectButton(button);
            }

			this.toolbar.appendChild(button);
		});
    };

    _createInput(alignment, idx) {
        const inputContainer = document.createElement("div")
        const input = document.createElement("input")    
        input.value = alignment.isApplied()
        const label = document.createElement("label")
        label.class = "RichText__ImageResize__label"
        label.innerText = alignment.label

        for(let attribute in alignment.attributes) {
            input[attribute] = alignment.attributes[attribute]
        }
        input.addEventListener("keyup", (e) => {
            if (e.keyCode !== 13) {
                return 
            }
            console.log(alignment.isApplied())

            if (e.target.value === "") {
                alignment.remove()
            } else {
                alignment.apply(e.target.value)
            }
            this.requestUpdate();
        })
        inputContainer.appendChild(label)
        inputContainer.appendChild(input)

        return inputContainer

    }

    _selectButton = (button) => {
		button.style.filter = 'invert(20%)';
    };

}
