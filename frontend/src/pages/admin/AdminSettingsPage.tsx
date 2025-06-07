import {Box, Select, Switch} from "@mantine/core";
import {useFeatures} from "src/contexts/FeaturesContext.tsx";
import {useEffect} from "react";
import {OrderStatus} from "src/models/types.tsx";
import {statusDisplay} from "src/util/StatusUtils.tsx";


const AdminSettingsPage = () => {

    const {
        groupMeEnabled, setGroupMeEnabled,
        printOnTransitionToStatus, setPrintOnTransitionToStatus,
        featuresLoading, refreshFeatures
    } = useFeatures();

    const handleGroupMeToggler = (isChecked: boolean) => {
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
                    onChange={(event) => handleGroupMeToggler(event.currentTarget.checked)}
                />
                <Select
                    disabled={featuresLoading}
                    value={printOnTransitionToStatus}
                    label="Print Label on Order Transition to status:"
                    placeholder="Disabled"
                    data={[
                        OrderStatus.ACCEPTED,
                        OrderStatus.PACKED
                    ].map((orderStatus) => ({
                        label: statusDisplay(orderStatus),
                        value: orderStatus
                    }))}
                    allowDeselect
                    onChange={(_value, option) => {
                        setPrintOnTransitionToStatus(_value as OrderStatus)
                    }}
                />
            </Box>

        </>
    );
};

export default AdminSettingsPage;
