import { useState, createContext } from "react";

export const OrderContext = createContext({
    orderList: [],
    getOrdersPage: (page, pageSize) => {},
});

export const OrderContextProvider = (props) => {

    return (
        <OrderContext.Provider value={{
            orderList: [],
            getOrdersPage: (page, pageSize) => {

            }
        }}>
            {props.children}
        </OrderContext.Provider>
    );
};

