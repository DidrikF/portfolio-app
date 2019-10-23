import uuidv4 from 'uuid/v4';
import { assign } from 'lodash';

export function getId(): import('../../types/basic-types').Id {
    return uuidv4()
}

export function deepStyleMerge<T extends {style: import('../../types/basic-types').KeyValue<string>}>(obj: T, update: Partial<T>): T {
    assign(obj, update)
    if (update.style && Object.keys(update.style).length === 0) {
        obj["style"] = {} // #REFACTOR Clear style (not optimal)
    }
    return obj
}