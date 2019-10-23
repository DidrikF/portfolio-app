/**
 * Here goes basic types shared by both the client and server side.
 */

export type KeyValue<T> = {
    [key: string]: T
}

export type Id = string;

export type Email = string;

export interface InEvent extends InputEvent {

}

export interface ExHTMLInputElement extends HTMLInputElement {
    target: any
}