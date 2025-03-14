import {Item} from "src/models/types.tsx";

export interface FormOrderItem {
    item: Item,
    quantity: number,
    notes?: string,
    attributes?: Record<string, string|number>,
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
