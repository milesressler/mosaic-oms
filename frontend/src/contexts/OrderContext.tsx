import { useState, createContext } from "react";

export const OrderContext = createContext({
    orderList: [],
    getOrdersPage: (page, pageSize) => {},
});

export const OrderContextProvider = (props) => {

    return (
        <OrderContext.Provider value={{
            orderList: [],
            getOrdersPage: (page: number, pageSize: number) => {

            }
        }}>
            {props.children}
        </OrderContext.Provider>
    );
};

