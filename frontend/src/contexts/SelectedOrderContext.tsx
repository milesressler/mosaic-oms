import React, {createContext, ReactNode, useContext, useState} from "react";

export interface SelectedOrderContextType {
    selectedOrderId: number | null;
    setSelectedOrderId: (orderId: number | null) => void;
    forceRefresh: boolean;
    doForceRefresh: () => void;
}
// Create the context
const SelectedOrderContext = createContext<SelectedOrderContextType|undefined   >(undefined);

// Create the provider component
export const SelectedOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [forceRefresh, setForceRefresh] = useState(false);

    const doForceRefresh = () => {
        setForceRefresh(prevForceRefresh => !prevForceRefresh); // Toggle force refresh
    }

    return (
        <SelectedOrderContext.Provider value={{ selectedOrderId, setSelectedOrderId, forceRefresh, doForceRefresh }}>
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
