import client from "./client";
import {AdminItem, Category, CreateItemRequest, Item, Page, UpdateItemRequest} from "src/models/types.tsx";

const getSuggestedItems = () =>
    client.get<Record<string, Item[]>>("/item");
const getAdminItemsPage = (page: number, size: number) =>
    client.get<Page<AdminItem>>("/admin/item", {params: {page, size}});
const getAdminItemsPageSort = (page: number, size: number, sort: {column: string, direction: 'asc'|'desc'}, showAll?: boolean, category?: Category|null) => {
    const params = {page, size, sort: `${sort.column},${sort.direction}`, categories: category, managedItemsOnly: !showAll};

    return client.get<Page<AdminItem>>("/admin/item", {params: params});
}

const createItem = (request: CreateItemRequest) =>
    client.post<Item>( `/item`, request)

const createAdminItem = (request: CreateItemRequest) =>
    client.post<AdminItem>( `/admin/item`, request)
const updateAdminItem = (id: number, request: UpdateItemRequest) =>
    client.put<AdminItem>( `/admin/item/${id}`, request)
const deleteAdminItem = (id: number) =>
    client.delete( `/admin/item/${id}`)

export default {
    getSuggestedItems,
    getAdminItemsPage,
    getAdminItemsPageSort,
    createItem,
    updateAdminItem,
    deleteAdminItem,
    createAdminItem,
};
