
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
