/**
 * Here goes platform wide types that is share between both the client and server side.
 * These are base types which both the client and server is free to use directly or extend to
 * meet local requirements. The idea is; that which is common between the client and server code
 * should only live one place.
 * 
 * How does this fit in with REST?
 * Am I loosing some flexibility by coupling the client and server in this way?
 */

export type PageType = "project" | "page";

export type Page = {
    id: string;
    type: PageType;
    path: string;
    pathTitle: string;
    title: string;
    style?: {[key: string]: string};
    className?: string;
    styleInput?: string;
    sections: Section[]
    show: boolean;

}

export type Section = {
    id: string;
    style?: {[key: string]: string};
    className?: string;
    styleInput?: string;
    layoutName: "One column" | "Two columns" | "Three columns"; 
    gridSections: GridSection[];
}

export type GridSection = {
    id: string;
    style?: {[key: string]: string};
    className?: string;
    styleInput?: string;
    coordinates: [number; number];
    componentStates: ComponentState[];
} 

export type ComponentState = {
    id: string;
    style?: {[key: string]: string};
    styleInput?: string;
    className?: string;
    type: "rich text" | "project card" | "image"; // options of strings
    state: any;
}

export type User = {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	description?: string;
	image?: string
}

export type Template<T extends (Page | Section | GridSection | ComponentState)>  = {
  owner: import('./basic-types').Email;
  title: string;
  type: string;
  template: T;
}

export type PageTemplate = Template<Page>
export type SectionTemplate = Template<Section>;
export type GridSectionTemplate = Template<GridSection>
export type ComponentTemplate = Template<ComponentState>;

export type FileMetadata = {
    type: string;
    name: string;
    path: string;
}

export type ImageMetadata {
    type: string;
    name: string;
    path: string;
    width: number;
    height: number;
}