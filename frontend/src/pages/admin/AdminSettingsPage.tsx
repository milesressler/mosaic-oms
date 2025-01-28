import useApi from "src/hooks/useApi.tsx";
import FeaturesApi from "src/services/featuresApi.tsx";
import {useEffect, useState} from "react";
import {Box, Switch} from "@mantine/core";
import {FeatureConfig} from "src/models/types.tsx";


const AdminSettingsPage = () => {

    const [features, setFeatures] = useState<FeatureConfig|null>();
    const featuresApi = useApi(FeaturesApi.getFeatureConfig);
    const updateFeaturesApi = useApi(FeaturesApi.updateFeatureConfig);

    useEffect(() => {
        if (updateFeaturesApi.data) {
            setFeatures(updateFeaturesApi.data);
        }
    }, [updateFeaturesApi.data]);

    useEffect(() => {
        if (featuresApi.data) {
            setFeatures(updateFeaturesApi.data);
        }
    }, [featuresApi.data]);

    useEffect(() => {
        featuresApi.request();
    }, []);

    const handleToggle = (isChecked: boolean) => {
        updateFeaturesApi.request(isChecked)
    }




    return (
        <>
            <Box p={5}>
                <Switch
                    checked={!!features?.groupMeEnabled}
                    disabled={featuresApi.loading || updateFeaturesApi.loading}
                    label="GroupMe Order Creation Post"
                    description="Crossposts orders to GroupMe upon creation"
                    onChange={(event) => handleToggle(event.currentTarget.checked)}
                />
            </Box>

        </>
    );
};

export default AdminSettingsPage;
