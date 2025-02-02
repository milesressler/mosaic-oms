import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {FeatureConfig} from "src/models/types.tsx";
import useApi from "src/hooks/useApi.tsx";
import FeaturesApi from "src/services/featuresApi.tsx";
import {useAuth0} from "@auth0/auth0-react";

export interface FeaturesContextType {
    refreshFeatures: () => void;
    featuresLoading: boolean;
    groupMeEnabled: boolean;
    setGroupMeEnabled: (enabled: boolean) => void

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
    const updateFeaturesApi = useApi(FeaturesApi.updateFeatureConfig);

    const setGroupMeEnabled = (enabled: boolean) => {
        updateFeaturesApi.request(enabled);
    };

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


    return (
        <FeaturesContext.Provider value={{
            groupMeEnabled: !!features?.groupMeEnabled,
            setGroupMeEnabled,
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
