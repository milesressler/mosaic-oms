import { Box, Select, Switch, Stack } from "@mantine/core";
import { useFeatures } from "src/context/FeaturesContext.tsx";
import { useEffect } from "react";
import { OrderStatus } from "src/models/types.tsx";
import { statusDisplay } from "src/utils/StatusUtils.tsx";

const orderStatusOptions = [OrderStatus.ACCEPTED, OrderStatus.PACKED].map(
    (status) => ({
        label: statusDisplay(status),
        value: status,
    })
);

const AdminSettingsPage = () => {
    const {
        groupMeEnabled,
        setGroupMeEnabled,
        ordersOpen,
        setOrdersOpen,
        printOnTransitionToStatus,
        setPrintOnTransitionToStatus,
        featuresLoading,
        refreshFeatures,
    } = useFeatures();

    useEffect(() => {
        refreshFeatures();
    }, [refreshFeatures]);

    return (
        <Box p="md">
            <Stack spacing="md">
                <Switch
                    checked={groupMeEnabled}
                    disabled={featuresLoading}
                    label="GroupMe Order Creation Post"
                    description="Cross‑posts orders to GroupMe when created"
                    onChange={(event) => setGroupMeEnabled(event.currentTarget.checked)}
                />

                <Switch
                    checked={ordersOpen}
                    disabled={featuresLoading}
                    label="Orders Open"
                    description="Enable or disable creating orders"
                    onChange={(event) => setOrdersOpen(event.currentTarget.checked)}
                />

                <Select
                    disabled={featuresLoading}
                    value={printOnTransitionToStatus ?? null}
                    label="Print label when order transitions to:"
                    placeholder="Disabled"
                    data={orderStatusOptions}
                    allowDeselect
                    onChange={(value) =>
                        setPrintOnTransitionToStatus(value as OrderStatus)
                    }
                />
            </Stack>
        </Box>
    );
};

export default AdminSettingsPage;
