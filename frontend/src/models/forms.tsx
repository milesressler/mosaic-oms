import {Item} from "src/models/types.tsx";

export interface SizeAttribute {
    type: "size";
    waist: number;
    length: number;
}

export interface SingleValueAttribute {
    type: "string";
    // A single value can be a string or a number
    value: string | number;
}

export interface MultiSelectAttribute {
    type: "multi";
    // For multi-select, an array of strings or numbers is expected
    values: Array<string | number>;
}

// Create a union type for all attribute values
export type AttributeValue = SizeAttribute | SingleValueAttribute | MultiSelectAttribute;


export interface FormOrderItem {
    item: Item,
    quantity: number,
    notes?: string,
    attributes?: Record<string, AttributeValue>;
}

export interface OrderFormValues {
    customerId?: string;
    firstName: string;
    lastName: string;
    customerPhone: string;
    specialInstructions?: string | null;
    optInNotifications?: boolean | null;
    items: FormOrderItem[];
}
