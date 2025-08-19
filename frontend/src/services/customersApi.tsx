import client from "./client";
import {Customer, CustomerSearchResult, Page} from "src/models/types.tsx";

const search = (searchString: string) =>
    client.get<CustomerSearchResult[]>(`/customer/find?q=${searchString}`);

const getCustomers = (page: number, size: number, params?: {name? :string|null, flagged?: boolean|null}) =>
    client.get<Page<Customer>>(`/customer`, {params: {page, size, ...params}});

const getCustomer = (uuid: string) =>
    client.get<Customer>(`/customer/${uuid}`);

const updateCustomer = (uuid: string,  body: {
    showerWaiverSigned?: Date,
    flagged?: boolean,
    obfuscateName?: boolean,
}) =>
    client.put<Customer>(`/customer/${uuid}`, body);

const createCustomer = (body: {
    firstName: string,
    lastName: string,
}) =>
    client.post<Customer>(`/customer`, body);


export default {
    search,
    getCustomers,
    getCustomer,
    updateCustomer,
    createCustomer,
};
