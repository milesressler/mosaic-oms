import { Item, ApiResponse } from '../models/types.tsx';

const API_URL = import.meta.env.VITE_API_SERVER_URL;

export const fetchItems = async (): Promise<ApiResponse<Item[]>> => {
    try {
        const url = `${API_URL}/item`;
        const response = await fetch(url);
        const data = await response.json();
        return { data };
    } catch (error) {
        return { data: [], error: error.message };
    }
};
