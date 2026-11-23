import client from "./client";
import {
    OrderDetails,
    SpecialEvent,
    SpecialEventCustomerOrder,
    SpecialEventOrderRequest,
    SpecialEventRequest
} from "src/models/types.tsx";

// Order takers
const getActiveEvent = () =>
    client.get<SpecialEvent | "">("/special-event/active");
const getCustomerOrders = (eventUuid: string, customerUuid: string) =>
    client.get<SpecialEventCustomerOrder[]>(`/special-event/${eventUuid}/customer/${customerUuid}/orders`);
const createOrder = (eventUuid: string, request: SpecialEventOrderRequest) =>
    client.post<OrderDetails>(`/special-event/${eventUuid}/order`, request);

// Admin
const getEvents = () =>
    client.get<SpecialEvent[]>("/admin/special-event");
const createEvent = (request: SpecialEventRequest) =>
    client.post<SpecialEvent>("/admin/special-event", request);
const updateEvent = (uuid: string, request: SpecialEventRequest) =>
    client.put<SpecialEvent>(`/admin/special-event/${uuid}`, request);
const deleteEvent = (uuid: string) =>
    client.delete<void>(`/admin/special-event/${uuid}`);
/** Starts the event (stopping any other), or stops the running event when uuid is null */
const setActiveEvent = (uuid: string | null) =>
    client.put<SpecialEvent[]>("/admin/special-event/active", {uuid});

export default {
    getActiveEvent,
    getCustomerOrders,
    createOrder,
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    setActiveEvent,
};
