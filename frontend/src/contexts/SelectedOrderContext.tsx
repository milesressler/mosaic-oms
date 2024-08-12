import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {OrderDetails} from "src/models/types.tsx";
import {useParams} from "react-router-dom";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";

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

    useEffect(() => {
        console.log("context provider doing a fetch");
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
        <SelectedOrderContext.Provider value={{ selectedOrder, doForceRefresh, loading: orderDetailApi.loading }}>
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
