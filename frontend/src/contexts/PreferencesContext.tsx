import React, {createContext, ReactNode, useContext} from "react";
import {useLocalStorage} from "@mantine/hooks";

export interface PreferencesContextType {
    notificationsEnabled: boolean;
    setNotificationsEnabled: (enabled: boolean) => void

}
// Create the context
const PreferencesContext = createContext<PreferencesContextType|undefined   >(undefined);


interface props {
    children: any
}

// Create the provider component
export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }: props) => {

    const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage({
        key: 'notificationsEnabled',
        defaultValue: true,
    });

        return (
        <PreferencesContext.Provider value={{
            notificationsEnabled: !!notificationsEnabled,
            setNotificationsEnabled
        }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = (): PreferencesContextType => {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within a PreferencesContextProvider');
    }
    return context;
};
