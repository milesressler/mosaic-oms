import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Item } from '../models/types.tsx';
import { fetchItems } from '../services/itemService';

interface ItemState {
    items: Item[];
    loading: boolean;
    error: string | null;
}

interface ItemAction {
    type: 'FETCH_ITEMS_REQUEST' | 'FETCH_ITEMS_SUCCESS' | 'FETCH_ITEMS_FAILURE';
    payload?: Item[] | string;
}

const initialState: ItemState = {
    items: [],
    loading: false,
    error: null,
};

const ItemContext = createContext<{ state: ItemState; dispatch: React.Dispatch<ItemAction> } | undefined>(undefined);

const itemReducer = (state: ItemState, action: ItemAction): ItemState => {
    switch (action.type) {
        case 'FETCH_ITEMS_REQUEST':
            return { ...state, loading: true, error: null };
        case 'FETCH_ITEMS_SUCCESS':
            return { ...state, loading: false, items: action.payload as Item[] };
        case 'FETCH_ITEMS_FAILURE':
            return { ...state, loading: false, error: action.payload as string };
        default:
            return state;
    }
};

export const ItemProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(itemReducer, initialState);

    const fetchItemsData = async () => {
        dispatch({ type: 'FETCH_ITEMS_REQUEST' });
        const response = await fetchItems();
        if (response.error) {
            dispatch({ type: 'FETCH_ITEMS_FAILURE', payload: response.error });
        } else {
            dispatch({ type: 'FETCH_ITEMS_SUCCESS', payload: response.data });
        }
    };

    return (
        <ItemContext.Provider value={{ state, dispatch }}>
            {children}
        </ItemContext.Provider>
    );
};

export const useItemContext = () => {
    const context = useContext(ItemContext);
    if (!context) {
        throw new Error('useItemContext must be used within an ItemProvider');
    }
    return context;
};
