import client from "./client";
import {
    CreateItemLimitEntryRequest,
    CreateItemLimitEntryResponse,
    Customer,
    CustomerItemHistoryParams,
    CustomerItemHistoryRow,
    CustomerItemLimit,
    CustomerSearchResult,
    Page
} from "src/models/types.tsx";

const search = (searchString: string) =>
    client.get<CustomerSearchResult[]>(`/customer/find?q=${searchString}`);

const getCustomers = (page: number, size: number, params?: {name? :string|null, flagged?: boolean|null}) =>
    client.get<Page<Customer>>(`/customer`, {params: {page, size, ...params}});

const getCustomer = (uuid: string) =>
    client.get<Customer>(`/customer/${uuid}`);

const getItemLimits = (uuid: string) =>
    client.get<CustomerItemLimit[]>(`/customer/${uuid}/item-limits`);

const getItemHistory = (uuid: string, page: number, size: number, params: CustomerItemHistoryParams) =>
    client.get<Page<CustomerItemHistoryRow>>(`/customer/${uuid}/item-history`, {params: {page, size, ...params}});

const createItemLimitEntry = (uuid: string, request: CreateItemLimitEntryRequest) =>
    client.post<CreateItemLimitEntryResponse>(`/customer/${uuid}/item-limits/entries`, request);

const deleteItemLimitEntry = (uuid: string, entryId: number) =>
    client.delete(`/customer/${uuid}/item-limits/entries/${entryId}`);

const updateCustomer = (uuid: string,  body: {
    showerWaiverSigned?: string | null,
    flagged?: boolean,
    excludeFromMetrics?: boolean,
    obfuscateName?: boolean,
    firstName?: string,
    lastName?: string,
}) =>
    client.put<Customer>(`/customer/${uuid}`, body);

const createCustomer = (body: {
    firstName: string,
    lastName: string,
}) =>
    client.post<Customer>(`/customer`, body);

const mergeCustomers = (body: {
    fromCustomerUuid: string,
    toCustomerUuid: string,
    firstName?: string,
    lastName?: string,
    flagged?: boolean,
    obfuscateName?: boolean,
    excludeFromMetrics?: boolean,
    showerWaiverSigned?: string,
}) =>
    client.post<{
        mergedToCustomerUuid: string,
        ordersTransferred: number,
        showerReservationsTransferred: number,
        success: boolean,
        message: string
    }>(`/customer/merge`, body);

export default {
    search,
    getCustomers,
    getCustomer,
    getItemLimits,
    getItemHistory,
    createItemLimitEntry,
    deleteItemLimitEntry,
    updateCustomer,
    createCustomer,
    mergeCustomers,
};
