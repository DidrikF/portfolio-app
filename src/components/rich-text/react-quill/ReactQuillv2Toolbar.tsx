import React from 'react'; 
import ReactDOMServer from 'react-dom/server'
import { find, isEqual } from 'lodash'
import DOM from 'react-dom-factories'
import { Id, KeyValue } from '../../../../types/basic-types';
import { ToolbarItem } from '../quill-toolbar-config';


// var icons = Quill.import('ui/icons');
// icons['bold'] = '<i class="fa fa-bold" aria-hidden="true"></i>';
// icons['sideImage'] = '<i class="fa fa-image" aria-hidden="true"></i>'; // can investigate this solution further, but I have a workaroud in css.

export type ReactQuillv2ToolbarProps = {
	id: Id;
	className?: string;
	style?: KeyValue<string>;
	items: ToolbarItem[];
	theme?: string;
}

export default class ReactQuillv2Toolbar extends React.Component<ReactQuillv2ToolbarProps> {

    constructor(props: ReactQuillv2ToolbarProps) {
        super(props)

        this.renderItem = this.renderItem.bind(this)
        this.getClassName = this.getClassName.bind(this)
    }

	componentDidMount() {
		console.warn(
			'QuillToolbar is deprecated. Consider switching to the official Quill ' +
			'toolbar format, or providing your own toolbar instead. ' +
			'See: https://github.com/zenoamaro/react-quill#upgrading-to-react-quill-v1-0-0'
		);
	}

	shouldComponentUpdate(nextProps: ReactQuillv2ToolbarProps) {
		return !isEqual(nextProps, this.props);
	}

    // looks like I can just repalce all the rendering code with  my own toolbar, and just remember to use
    // the same class names as quill expects. 
	renderGroup(item: ToolbarItem, key: number): JSX.Element {
		return DOM.span({
			key: item.label || key,
			className:'ql-formats' },
			(item.items as ToolbarItem[]).map(this.renderItem)
		);
	}

	renderChoiceItem(item: ToolbarItem, key: number): JSX.Element {
		return DOM.option({
			key: item.label || item.value || key,
			value: item.value },
			item.label
		);
    }
    
	renderChoices(item: ToolbarItem, key: number): JSX.Element {
		var choiceItems = (item.items as ToolbarItem[]).map(this.renderChoiceItem);
		var selectedItem = find(item.items, function(item){ return item.selected });
		var attrs = {
			key: item.label || key,
			title: item.label,
			className: 'ql-'+item.type,
			value: selectedItem.value,
		};
		return DOM.select(attrs, choiceItems);
	}

	renderButton(item: ToolbarItem, key: number): JSX.Element {
		return DOM.button({
			type: 'button',
			key: item.label || item.value || key,
			value: item.value,
			className: 'ql-'+item.type,
			title: item.label },
			item.children
		);
    }
    
	renderAction(item: ToolbarItem, key: number): JSX.Element {
		return DOM.button({
			key: item.label || item.value || key,
			className: 'ql-'+item.type,
			title: item.label },
			item.children
		);
	}

	/* jshint maxcomplexity: false */
	renderItem(item: ToolbarItem, key: number) {
		switch (item.type) {
			case 'group':
				return this.renderGroup(item, key);
			case 'font':
			case 'header':
			case 'align':
			case 'size':
			case 'color':
			case 'background':
				return this.renderChoices(item, key);
			case 'bold':
			case 'italic':
			case 'underline':
			case 'strike':
			case 'link':
			case 'list':
			case 'bullet':
			case 'ordered':
			case 'indent':
			case 'image':
			case 'video':
				return this.renderButton(item, key);
			default:
				return this.renderAction(item, key);
		}
	}

	getClassName() {
		return 'quill-toolbar ' + (this.props.className||'');
	}

	render() {
		var children = this.props.items.map(this.renderItem);
		var html = children.map(ReactDOMServer.renderToStaticMarkup).join('');
		return DOM.div({
			id: this.props.id,
			className: this.getClassName(),
			style: this.props.style,
			dangerouslySetInnerHTML: { __html:html }
		});
	}
}

