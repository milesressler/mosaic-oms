import {Order, OrderNotification} from "src/models/types.tsx";
import React, {createContext, ReactNode, useContext, useState} from "react";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {useSubscription} from "react-stomp-hooks";
import {DateTime} from "luxon";

export interface OrdersContextType {
    orders: Order[]
    loading: boolean;
    pagingInfo?: any;

}
// Create the context
const OrdersContext = createContext<OrdersContextType|undefined   >(undefined);


interface props {
    children: any
}

/**
 * WIP WIP WIP
 */

// Create the provider component
export const OrdersProvider: React.FC<{ children: ReactNode }> = ({ children }: props) => {
    const defaultOrderApi = useApi(ordersApi.getOrders);
    const [ orders, setOrders ] = useState<Order[]>([]);

    // const x = useNot
    useSubscription("/topic/orders/*", (message) => {
        const body: OrderNotification = JSON.parse(message.body);
        setOrders(prevState => {
            return prevState.map((prevOrder: Order) => {
                if (body.order.id === prevOrder.id && DateTime.fromISO(body.order.updated) > DateTime.fromISO(prevOrder.updated) ) {
                    return body.order;
                } else {
                    return prevOrder;
                }
            })
        })
    });





        return (
        <OrdersContext.Provider value={{ orders: orders }}>
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
