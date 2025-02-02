import client from "./client";
import {AdminItem, Item, Page, UpdateItemRequest} from "src/models/types.tsx";

const getSuggestedItems = () =>
    client.get<Item[]>("/item");
const getAdminItemsPage = (page: number, size: number) =>
    client.get<Page<AdminItem>>("/admin/item", {params: {page, size}});

const updateAdminItem = (id: number, request: UpdateItemRequest) =>
    client.put<AdminItem>( `/admin/item/${id}`, request)
const deleteAdminItem = (id: number) =>
    client.delete( `/admin/item/${id}`)

export default {
    getSuggestedItems,
    getAdminItemsPage,
    updateAdminItem,
    deleteAdminItem,
};
