import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {FeatureConfig, OrderStatus} from "src/models/types.tsx";
import useApi from "src/hooks/useApi.tsx";
import FeaturesApi from "src/services/featuresApi.tsx";
import {useAuth0} from "@auth0/auth0-react";
import {useSubscription} from "react-stomp-hooks";

export interface FeaturesContextType {
    refreshFeatures: () => void;
    featuresLoading: boolean;
    groupMeEnabled: boolean;
    ordersOpen: boolean;
    setGroupMeEnabled: (enabled: boolean) => void
    setOrdersOpen: (enabled: boolean) => void
    printOnTransitionToStatus: OrderStatus|null;
    setPrintOnTransitionToStatus: (orderStatus: OrderStatus|null) => void
}

// Create the context
const FeaturesContext = createContext<FeaturesContextType|undefined   >(undefined);


interface props {
    children: any
}

// Create the provider component
export const FeaturesProvider: React.FC<{ children: ReactNode }> = ({ children }: props) => {
    const { isAuthenticated } = useAuth0();
    const [features, setFeatures] = useState<FeatureConfig|null>();

    const featuresApi = useApi(FeaturesApi.getFeatureConfig);
    const updateFeaturesApi = useApi(FeaturesApi.adminUpdateFeatureConfig);
    const orderTakerUpdateFeaturesApi = useApi(FeaturesApi.ordersUpdateFeatureConfig);

    const setGroupMeEnabled = (enabled: boolean) => {
        updateFeaturesApi.request(enabled, null, null);
    };
    const setOrdersOpen = (enabled: boolean) => {
        orderTakerUpdateFeaturesApi.request(enabled);
    };

    const setPrintOnTransitionToStatus = (orderStatus: OrderStatus|null) => {
        updateFeaturesApi.request(null, null, orderStatus ?? "");
    };

    useSubscription("/topic/features/updated", () => {
        if (!updateFeaturesApi.loading && !featuresApi.loading) {
            featuresApi.request();
        }
    });

    useEffect(() => {
        if (featuresApi.data) {
            setFeatures(featuresApi.data)
        }
    }, [featuresApi.data]);

    useEffect(() => {
        if (!featuresApi.data && isAuthenticated) {
            featuresApi.request();
        }
    }, [isAuthenticated]);

    useEffect(() => {
        if (updateFeaturesApi.data) {
            setFeatures(updateFeaturesApi.data)
        }
    }, [updateFeaturesApi.data]);

    useEffect(() => {
        if (orderTakerUpdateFeaturesApi.data) {
            setFeatures(orderTakerUpdateFeaturesApi.data)
        }
    }, [orderTakerUpdateFeaturesApi.data]);


    return (
        <FeaturesContext.Provider value={{
            ordersOpen: !!features?.ordersOpen,
            groupMeEnabled: !!features?.groupMeEnabled,
            printOnTransitionToStatus: features?.printOnTransitionToStatus ?? null,
            setGroupMeEnabled,
            setOrdersOpen,
            setPrintOnTransitionToStatus,
            featuresLoading: featuresApi.loading || updateFeaturesApi.loading,
            refreshFeatures: featuresApi.request
        }}>
            {children}
        </FeaturesContext.Provider>
    );
};

export const useFeatures = (): FeaturesContextType => {
    const context = useContext(FeaturesContext);
    if (!context) {
        throw new Error('usePreferences must be used within a FeaturesContextProvider');
    }
    return context;
};
