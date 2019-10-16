export interface KeyValue<T> {
    [key: string]: T
}

export type Id = string;


export interface InEvent extends InputEvent {

}

export interface ExHTMLInputElement extends HTMLInputElement {
    target: any
}