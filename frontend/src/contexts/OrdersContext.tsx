import {Order, Page} from "src/models/types.tsx";
import React, {createContext, ReactNode, useContext} from "react";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";

export interface OrdersContextType {
    orders: Order[] | null
    loading: boolean;
    pagedApiQuery?: (pagingParameters: any) => Page<Order>
}
// Create the context
const OrdersContext = createContext<OrdersContextType|undefined   >(undefined);


// Create the provider component
export const SelectedOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const defaultOrderApi = useApi(ordersApi.getOrders);



    return (
        <OrdersContext.Provider value={{ orders:  }}>
            {children}
        </OrdersContext.Provider>
    );
};

// Custom hook to use the SelectedOrderContext
export const useOrders = (): OrdersContextType => {
    const context = useContext(OrdersContext);
    if (!context) {
        throw new Error('useOrders must be used within a SelectedOrderProvider');
    }
    return context;
};
