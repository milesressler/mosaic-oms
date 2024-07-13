// hooks/useItems.ts
import { useEffect } from 'react';
import {fetchItems} from "../services/itemService.tsx";
import {useItemContext} from "../contexts/ItemContext.tsx";

export const useItems = () => {
    const { state, dispatch } = useItemContext();

    useEffect(() => {
        const fetchItemsData = async () => {
            dispatch({ type: 'FETCH_ITEMS_REQUEST' });
            const response = await fetchItems();
            if (response.error) {
                dispatch({ type: 'FETCH_ITEMS_FAILURE', payload: response.error });
            } else {
                dispatch({ type: 'FETCH_ITEMS_SUCCESS', payload: response.data });
            }
        };

        fetchItemsData();
    }, [dispatch]);


    return state;
};
