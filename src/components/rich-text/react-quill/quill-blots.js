/**
 * This file is not used ATM
 */

import Quill from 'quill'

let Inline = Quill.import('blots/inline');
let Block = Quill.import('blots/block');
let BlockEmbed = Quill.import('blots/block/embed');

class LinkBlot extends Inline {
	static create(url) {
		let node = super.create();
		node.setAttribute('href', url);
		node.setAttribute('target', '_blank');
		node.setAttribute('title', node.textContent);
		return node;
	}

	static formats(domNode) {
		return domNode.getAttribute('href') || true;
	}

	format(name, value) {
		if (name === 'link' && value) {
			this.domNode.setAttribute('href', value);
		} else {
			super.format(name, value);
		}
	}

	formats() {
		let formats = super.formats();
		formats['link'] = LinkBlot.formats(this.domNode);
		return formats;
	}
}
LinkBlot.blotName = 'link';
LinkBlot.tagName = 'A';

class BoldBlot extends Inline { }
BoldBlot.blotName = 'bold';
BoldBlot.tagName = 'strong';

class ItalicBlot extends Inline { }
ItalicBlot.blotName = 'italic';
ItalicBlot.tagName = 'em';



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

// Attributes (float right, left and center + resize in percentage + box model changes + display block or inline)
class PullRight extends Block {
	/*
    static create(value) {
		let node = super.create();
        // node.setAttribute('style', 'float: right;')
        return node;
    }

    static formats() {
		return true;
	}
	*/
}

PullRight.blotName = 'pullright';
PullRight.className = 'RichText--pull-right';
// PullRight.tagName = 'div'; 

class PullLeft extends Block {
	/*
    static create(value) {
        let node = super.create();
        node.setAttribute('style', 'float: left;')
        return node;
    }

    static value(node) {
        return {
            style: node.getAttribute('style')['float']
        };
	}
	*/
}
PullLeft.blotName = 'pullleft';
PullLeft.className = 'RichText--pull-left';
// PullLeft.tagName = 'div'; // className in stead? Definetly use class names, because it enables use of media queries.


export class Pull extends Block{    

    static create(value){
        let node = super.create();
        node.setAttribute('class','RichText--pull-'+value);
        return node;    
    } 
}

Pull.blotName = 'pull';
Pull.tagName = 'div';


Quill.register(Pull);
Quill.register(SideImage)
Quill.register(PullRight)
Quill.register(PullLeft)
// Quill.register(BoldBlot);
// Quill.register(ItalicBlot);
// Quill.register(LinkBlot);