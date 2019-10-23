/**
 * Here goes platform wide types that is share between both the client and server side.
 * These are base types which both the client and server is free to use directly or extend to
 * meet local requirements. The idea is; that which is common between the client and server code
 * should only live one place.
 * 
 * How does this fit in with REST?
 * Am I loosing some flexibility by coupling the client and server in this way?
 */


export type Page = {
    id: string,
    type: string,
    path: string,
    pathTitle: string,
    title: string,
    style?: {[key: string]: string},
    className?: string,
    styleInput?: string,
    sections: Section[]
    show: boolean,

}


export type Section = {
    id: string,
    style?: {[key: string]: string},
    className?: string,
    styleInput?: string,
    layoutName: "One column" | "Two columns" | "Three columns", 
    gridSections: GridSection[],
}

export type GridSection = {
    id: string,
    style?: {[key: string]: string},
    className?: string,
    styleInput?: string,
    coordinates: [number, number],
    componentStates: ComponentState[],
} 

export type ComponentState = {
    id: string,
    style?: {[key: string]: string},
    styleInput?: string,
    className?: string,
    type: "rich text" | "project card" | "image", // options of strings
    state: any,
}


export type User = {
	email: string,
	password: string,
	firstName: string,
	lastName: string,
	description?: string,
	image?: string
}


export type Template = {
  owner: import('./basic-types').Email,
  title: string,
  type: string,
  template: Page | Section | GridSection | ComponentState,
}