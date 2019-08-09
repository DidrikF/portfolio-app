import Quill from 'quill'

import ImageResize from './quill-image-resize-module/src/ImageResize';


let Inline = Quill.import('blots/inline');
let Block = Quill.import('blots/block');
let BlockEmbed = Quill.import('blots/block/embed');
var Image = Quill.import('formats/image');
var Video = Quill.import('formats/video');
let Parchment = Quill.import('parchment');

let config = {
  scope: Parchment.Scope.ATTRIBUTE,
};


let PullRightClass = new Parchment.Attributor.Class('pullrightclass', 'RichText--pull-right', config);
let PullLeftClass = new Parchment.Attributor.Class('pullleftclass', 'RichText--pull-left', config);
let CenterClass = new Parchment.Attributor.Class('centerclass', 'RichText--center', config);

let WidthStyle = new Parchment.Attributor.Style('width', 'width', config);
let BorderStyle = new Parchment.Attributor.Style('border', 'border', config);
let BorderRadiusStyle = new Parchment.Attributor.Style('border-radius', 'border-radius', config);
let BorderColorStyle = new Parchment.Attributor.Style('border-color', 'border-color', config);
let MarginStyle = new Parchment.Attributor.Style('margin', 'margin', config)
let PaddingStyle = new Parchment.Attributor.Style('padding', 'padding', config)

var FontAttributor = Quill.import('attributors/class/font');
FontAttributor.whitelist = [
  'roboto'
];


const IMAGE_ATTRIBUTES = [
  'alt',
  'height',
  'width',
  'style',
  'class',
];

const VIDEO_ATTRIBUTES = [
	'height',
	'width',
	'style',
	'class',
]

const STYLES = [
	'width',
]

class ExtendedImage extends Image {
	static formats(domNode) {
		return IMAGE_ATTRIBUTES.reduce(function (formats, attribute) {
			if (domNode.hasAttribute(attribute)) {
				formats[attribute] = domNode.getAttribute(attribute);
			}
			return formats;
		}, {});
	}
	format(name, value) {
		if (IMAGE_ATTRIBUTES.indexOf(name) > -1) {

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

class ExtendedVideo extends Video {
	static create(value) {
		let node = super.create(value);
		node.setAttribute('frameborder', '0');
		node.setAttribute('allowfullscreen', true);
		node.setAttribute('src', this.sanitize(value));
		return node;
	  }

	static formats(domNode) {
		return VIDEO_ATTRIBUTES.reduce(function (formats, attribute) {
			if (domNode.hasAttribute(attribute)) {

				if (attribute === 'style') {
					let style = domNode.getAttribute(attribute);
					style = style.replace(/ +height: +\d+.\d+px;/gi, "")
					// console.log("video style: ", style)
					formats[attribute] = style
					return formats
				}

				formats[attribute] = domNode.getAttribute(attribute);
			}
			return formats;
		}, {});
	}

	format(name, value) {
		if (VIDEO_ATTRIBUTES.indexOf(name) > -1) {
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

Quill.register('modules/imageResize', ImageResize);

Quill.register(PullRightClass)
Quill.register(PullLeftClass)
Quill.register(CenterClass)

Quill.register(WidthStyle);
Quill.register(BorderStyle);
Quill.register(BorderRadiusStyle);
Quill.register(BorderColorStyle);
Quill.register(MarginStyle)
Quill.register(PaddingStyle)

Quill.register(FontAttributor, true);

Quill.register('formats/image', ExtendedImage)
Quill.register('formats/video', ExtendedVideo)


export {
    PullRightClass,
    PullLeftClass,
    CenterClass,
    WidthStyle,
    BorderStyle,
    BorderRadiusStyle,
	BorderColorStyle,
	MarginStyle,
	PaddingStyle,
    ExtendedImage,
    ExtendedVideo,
}