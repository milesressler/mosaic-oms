import {Box, Switch} from "@mantine/core";
import {useFeatures} from "src/contexts/FeaturesContext.tsx";
import {useEffect} from "react";


const AdminSettingsPage = () => {

    const { groupMeEnabled, setGroupMeEnabled, featuresLoading, refreshFeatures } = useFeatures();

    const handleToggle = (isChecked: boolean) => {
        setGroupMeEnabled(isChecked);
    }

    useEffect(() => {
        refreshFeatures();
    }, []);




    return (
        <>
            <Box p={5}>
                <Switch
                    checked={groupMeEnabled}
                    disabled={featuresLoading}
                    label="GroupMe Order Creation Post"
                    description="Crossposts orders to GroupMe upon creation"
                    onChange={(event) => handleToggle(event.currentTarget.checked)}
                />
            </Box>

        </>
    );
};

export default AdminSettingsPage;
