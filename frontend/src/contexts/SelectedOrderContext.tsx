import React, {createContext, ReactNode, useContext, useState} from "react";
import {Order} from "src/models/types.tsx";
export interface SelectedOrderContextType {
    selectedOrder: Order | null;
    setSelectedOrder: (order: Order | null) => void;
    forceRefresh: boolean;
    doForceRefresh: () => void;
}
// Create the context
const SelectedOrderContext = createContext<SelectedOrderContextType|undefined   >(undefined);

// Create the provider component
export const SelectedOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [forceRefresh, setForceRefresh] = useState(false);

    const doForceRefresh = () => {
        setForceRefresh(prevForceRefresh => !prevForceRefresh); // Toggle force refresh
    }

    return (
        <SelectedOrderContext.Provider value={{ selectedOrder, setSelectedOrder, forceRefresh, doForceRefresh }}>
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
