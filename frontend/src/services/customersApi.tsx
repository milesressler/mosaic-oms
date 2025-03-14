import client from "./client";
import {Customer, CustomerSearch, Page} from "src/models/types.tsx";

const search = (searchString: string) =>
    client.get<CustomerSearch[]>(`/customer?q=${searchString}`);

const getCustomers = (page: number, size: number) =>
    client.get<Page<Customer>>(`/admin/customer`, {params: {page, size}});

const getCustomer = (uuid: string) =>
    client.get<Customer>(`/admin/customer/${uuid}`);


export default {
    search,
    getCustomers,
    getCustomer,
};
