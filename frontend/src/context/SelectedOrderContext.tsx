import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {OrderDetails, OrderNotification} from "src/models/types.tsx";
import {useParams} from "react-router-dom";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {useSubscription} from "react-stomp-hooks";

export interface SelectedOrderContextType {
    selectedOrder: OrderDetails | null
    forceRefresh: boolean;
    doForceRefresh: () => void;
    loading: boolean;
}
// Create the context
const SelectedOrderContext = createContext<SelectedOrderContextType|undefined   >(undefined);

// Create the provider component
export const SelectedOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [selectedOrder, setSelectedOrder] = useState<OrderDetails|null>(null);
    const orderDetailApi = useApi(ordersApi.getOrderById);


    const { id } = useParams();
    const doForceRefresh = () => {
        if (!!id) {
            orderDetailApi.request(+id);
        }
        // setForceRefresh(prevForceRefresh => !prevForceRefresh); // Toggle force refresh
    }


    useSubscription("/topic/orders/assignee", (message) => {
        const body: OrderNotification = JSON.parse(message.body);
        if (`${body.order.id}` === id) {
            setSelectedOrder((prev) => {
                if (!prev) return prev; // nothing to update if null
                return {
                    ...prev,
                    assignee: body.assignee, // or however you get the updated assignee from `body`
                };
            });
        }
    });

    useEffect(() => {
        if (!!id) {
            orderDetailApi.request(+id);
        } else {
            setSelectedOrder(null);
        }
    }, [id]);

    useEffect(() => {
        if (orderDetailApi.data) {
            setSelectedOrder(orderDetailApi.data);
        }
    }, [orderDetailApi.data]);



    return (
        <SelectedOrderContext.Provider value={{  selectedOrder, doForceRefresh, loading: orderDetailApi.loading }}>
            {children}
        </SelectedOrderContext.Provider>
    );
};

// Custom hook to use the SelectedOrderContext
export const useSelectedOrder = (): SelectedOrderContextType => {
    const context = useContext(SelectedOrderContext);
    if (!context) {
        throw new Error('useSelectedOrder must be used within a SelectedOrderProvider');
    }
    return context;
};
