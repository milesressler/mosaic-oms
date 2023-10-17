import { useState, createContext } from "react";

export const OrderContext = createContext({
    orderList: [],
    setUserName: () => {},

});

export const OrderContextProvider = (props) => {
    return (
        <OrderContext.Provider value={{orderList: [{id: 1}]}}>
            {props.children}
        </OrderContext.Provider>
    );
};

