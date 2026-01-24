import { Box, Select, Switch, Stack } from "@mantine/core";
import { modals } from "@mantine/modals";
import { useFeatures } from "src/context/FeaturesContext.tsx";
import { useEffect } from "react";
import { OrderStatus } from "src/models/types.tsx";
import { statusDisplay } from "src/utils/StatusUtils.tsx";

const orderStatusOptions = [
    { label: "Disabled", value: "DISABLED" },
    ...([OrderStatus.ACCEPTED, OrderStatus.PACKED].map(
        (status) => ({
            label: statusDisplay(status),
            value: status,
        })
    ))
];

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

    const handlePrintLabelChange = (newValue: string | null) => {
        const getStatusDescription = (status: string | null) => {
            if (!status || status === "DISABLED") return "disabled";
            return `when orders transition to ${statusDisplay(status as OrderStatus)}`;
        };

        const currentStatus = printOnTransitionToStatus ?? "DISABLED";
        const currentDescription = getStatusDescription(currentStatus);
        const newDescription = getStatusDescription(newValue);

        modals.openConfirmModal({
            title: "Confirm Print Label Setting Change",
            children: (
                <div>
                    <p>
                        <strong>Current setting:</strong> Label printing is {currentDescription}
                    </p>
                    <p>
                        <strong>New setting:</strong> Label printing will be {newDescription}
                    </p>
                    <p>Are you sure you want to make this change?</p>
                </div>
            ),
            labels: { confirm: "Confirm Change", cancel: "Cancel" },
            confirmProps: { color: "blue" },
            onConfirm: () => setPrintOnTransitionToStatus(newValue === "DISABLED" ? null : newValue as OrderStatus),
        });
    };

    return (
        <Box p="md">
            <Stack gap="md">
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
                    value={printOnTransitionToStatus ?? "DISABLED"}
                    label="Print label when order transitions to:"
                    data={orderStatusOptions}
                    onChange={handlePrintLabelChange}
                />
            </Stack>
        </Box>
    );
};

export default AdminSettingsPage;
