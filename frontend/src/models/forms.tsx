import {Item} from "src/models/types.tsx";

export interface FormOrderItem {
    item: Item,
    quantity: number,
    notes?: string,
    attributes?: Record<string, string|number>,
}
