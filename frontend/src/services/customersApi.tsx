import client from "./client";
import {Customer, CustomerSearch, Page} from "src/models/types.tsx";

const search = (searchString: string) =>
    client.get<CustomerSearch[]>(`/customer/find?q=${searchString}`);

const getCustomers = (page: number, size: number, params?: {name? :string|null, flagged?: boolean|null}) =>
    client.get<Page<Customer>>(`/customer`, {params: {page, size, ...params}});

const getCustomer = (uuid: string) =>
    client.get<Customer>(`/customer/${uuid}`);

const updateCustomer = (uuid: string,  body: {
    showerWaiverSigned?: Date,
    flagged?: boolean,
}) =>
    client.put<Customer>(`/customer/${uuid}`, body);


export default {
    search,
    getCustomers,
    getCustomer,
    updateCustomer,
};
