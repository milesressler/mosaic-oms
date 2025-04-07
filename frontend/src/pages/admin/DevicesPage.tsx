import { useState, useEffect } from "react";
import {
    ActionIcon,
    Box,
    Text,
    Button,
    Alert,
    Card,
    Divider,
    Group,
    SimpleGrid,
    TextInput,
    Badge,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import useApi from "src/hooks/useApi.tsx";
import devicesApi from "src/services/devicesApi.tsx";
import { UAParser } from "ua-parser-js";
import {
    IconBrandChrome,
    IconBrandFirefox,
    IconBrandSafari,
    IconBrandEdge,
    IconBrandWindows,
    IconBrandApple,
    IconBrandUbuntu,
    IconBrowser,
    IconDeviceMobile,
    IconDeviceLaptop,
    IconTrash,
    IconDeviceDesktop, IconAlertTriangle,
} from "@tabler/icons-react";
import { Device } from "src/models/types.tsx";
import {DateTime} from "luxon";
import {modals} from "@mantine/modals";
import Instructions from "src/components/admin/devices/Instructions.tsx";

// Browser icon helper
const getBrowserIcon = (browserName: string|undefined) => {
    if (!browserName) return <IconBrowser size={16} />;
    switch (browserName.toLowerCase()) {
        case "chrome":
            return <IconBrandChrome size={16} />;
        case "firefox":
            return <IconBrandFirefox size={16} />;
        case "safari":
            return <IconBrandSafari size={16} />;
        case "edge":
            return <IconBrandEdge size={16} />;
        case "internet explorer":
            return <IconBrowser size={16} />;
        default:
            return <IconBrowser size={16} />;
    }
};

// OS icon helper
const getOSIcon = (osName: string) => {
    if (!osName) return <IconDeviceDesktop size={16} />;
    switch (osName.toLowerCase()) {
        case "windows":
            return <IconBrandWindows size={16} />;
        case "mac os":
        case "macos":
        case "ios":
            return <IconBrandApple size={16} />;
        case "linux":
            return <IconBrandUbuntu size={16} />;
        default:
            return <IconDeviceDesktop size={16} />;
    }
};

// Device type icon helper
const getDeviceTypeIcon = (deviceType: string) => {
    if (!deviceType) return null;
    switch (deviceType.toLowerCase()) {
        case "mobile":
            return <IconDeviceMobile size={16} />;
        default:
            return <IconDeviceLaptop size={16} />;
    }
};

const DevicesPage = () => {
    const createDeviceApi = useApi(devicesApi.registerKiosk);
    const getDevicesApi = useApi(devicesApi.getDevices);
    const deleteApi = useApi(devicesApi.deleteDevice);
    const [devices, setDevices] = useState<Device[]>([]);

    // Setup form with expiration as optional (initially undefined)
    const form = useForm({
        initialValues: {
            name: "",
            expiration: undefined as Date | undefined,
        },
        validate: {
            name: (value) => (value.trim().length === 0 ? "Name is required" : null),
            // No validation for expiration because it's optional
        },
    });

    // Fetch devices on mount
    useEffect(() => {
        getDevicesApi.request();
    }, []);

    useEffect(() => {
        if (getDevicesApi.data) {
            setDevices(getDevicesApi.data.content || []);
        }
    }, [getDevicesApi.data]);

    // Handle device creation
    const handleSubmit = async (values: { name: string; expiration?: Date }) => {
        const now = new Date();
        if (values.expiration && values.expiration.getTime() <= now.getTime()) {
            form.setFieldError("expiration", "Expiration must be in the future");
            return;
        }
        // Convert expiration to ISO string if provided; otherwise send null
        const expirationIso = values.expiration ? values.expiration.toISOString() : null;
        createDeviceApi.request(values.name, expirationIso);
    };

    useEffect(() => {
        if (createDeviceApi?.data) {
            // setSuccessMessage("Device registered successfully! You can now logout and navigate to /kiosk");
            setDevices((prev) => [createDeviceApi.data!, ...prev]);
            form.reset();
        }
    }, [createDeviceApi.data]);

    // Utility to check if lastAccessed is within 30 minutes
    const isRecent = (lastAccessed: string) => {
        const lastDate = new Date(lastAccessed);
        const now = new Date();
        return (now.getTime() - lastDate.getTime()) / 60000 <= 30;
    };

    return (
        <Box p={20}>
            <Box mb={20}>
                <Text fw={500} size="lg" mb={10}>
                    Register This Device
                </Text>
                <Text size="md" mb={10}>
                    This will configure the current device as a Kiosk device and retain login credentials for access to dashboard only.
                </Text>
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <TextInput label="Device Name" placeholder="Enter device name" {...form.getInputProps("name")} mb={10} />
                    <Box style={{ maxWidth: 300 }} mb={10}>
                        <DatePickerInput
                            clearable

                            label="Expiration Date (optional)"
                            placeholder="Select expiration date"
                            {...form.getInputProps("expiration")}
                        />
                    </Box>
                    <Button type="submit" loading={createDeviceApi.loading}>
                        Register this device as Kiosk
                    </Button>
                </form>
            </Box>

            {createDeviceApi.data && (
                <Alert title="Device registered successfully" color="green" mb={20}>
                    <Instructions/>
                </Alert>
            )}
            <hr />
            <Box mb={20}>
                <Text fw={500} size="xl" mb="md">
                    Registered Kiosk Devices
                </Text>
                {(getDevicesApi.data?.totalElements || 0) > 0 ? (
                    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
                        {devices.map((device) => {
                            const parsed = device.userAgent ? new UAParser(device.userAgent).getResult() : null;
                            return (
                                <Card
                                    key={device.id}
                                    shadow="sm"
                                    padding="lg"
                                    radius="md"
                                    bg="#f5f5f5"
                                    withBorder
                                >
                                    {/* Header: Device title and delete button */}
                                    <Group justify="space-between" mb="xs" style={{ width: "100%" }}>
                                        <Text size="lg" fw={600}>
                                            {device.name}
                                        </Text>
                                        <ActionIcon
                                            color="red"
                                            variant="light"
                                            disabled={deleteApi.loading}
                                            onClick={() =>
                                                modals.openConfirmModal({
                                                    title: 'Confirm Deletion',
                                                    children: (
                                                        <Text size="sm" mt={'xs'}>
                                                            Are you sure you want to delete the device <strong>{device.name}</strong>?
                                                        </Text>
                                                    ),
                                                    labels: { confirm: 'Delete', cancel: 'Cancel' },
                                                    confirmProps: { color: 'red' },
                                                    onConfirm: () => {
                                                        deleteApi.request(device.uuid).then(getDevicesApi.request);
                                                    },
                                                })
                                            }
                                        >
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Group>

                                    {/* Status: Online/Offline badge with relative time */}
                                    <Group gap="xs" mb="xs" title={device.lastAccessed ? new Date(device.lastAccessed).toLocaleString() : ""}>
                                        {device.lastAccessed && isRecent(device.lastAccessed) ? (
                                            <Badge size="xs" color="green" variant="filled">
                                                Online
                                            </Badge>
                                        ) : (
                                            <Badge size="xs" color="gray" variant="filled">
                                                Offline
                                            </Badge>
                                        )}
                                        <Text size="xs" c={'dimmed'}>
                                            {device.lastAccessed ? `Last used ${DateTime.fromISO(device.lastAccessed)?.toRelative()}` : "Never used"}
                                        </Text>
                                    </Group>

                                    <Group
                                        gap="xs"
                                        mb="xs"
                                        title={device.expiration ? new Date(device.expiration).toLocaleString() : ""}
                                    >
                                        <Text size="xs" c="dimmed">
                                            {device.expiration
                                                ? `Expires ${DateTime.fromISO(device.expiration).toRelative()}`
                                                : "No expiration"}
                                        </Text>
                                        {device.expiration && (() => {
                                            const expirationDate = DateTime.fromISO(device.expiration);
                                            const diffInDays = expirationDate.diffNow("days").days;
                                            // Only show the warning if the expiration is in the future and within 7 days.
                                            if (diffInDays > 0 && diffInDays < 7) {
                                                return <IconAlertTriangle size={16} color="orange" />;
                                            }
                                            return null;
                                        })()}
                                    </Group>
                                    <Divider my="0" />

                                    {/* Device details: OS, browser, device type */}
                                    <Group gap="xs" mt="xs">
                                        <Group gap="xs">
                                            {getOSIcon(parsed?.os?.name || "")}
                                            <Text size="sm">{parsed?.os?.name || "Unknown OS"}</Text>
                                        </Group>
                                        <Group gap="xs">
                                            {getBrowserIcon(parsed?.browser?.name)}
                                            <Text size="sm">{parsed?.browser?.name || "Unknown Browser"}</Text>
                                        </Group>
                                        {parsed?.device && parsed?.device?.type && (
                                            <Group gap="xs">
                                                {getDeviceTypeIcon(parsed.device?.type)}
                                                <Text size="sm">{parsed.device.type}</Text>
                                            </Group>
                                        )}
                                    </Group>

                                    {/* Fallback: Full user agent string */}
                                    <Text size="xs" c="dimmed" mt="sm">
                                        {device.userAgent || "No user agent details available"}
                                    </Text>
                                </Card>

                            );
                        })}
                    </SimpleGrid>
                ) : (
                    <Text c="dimmed">No devices found.</Text>
                )}
            </Box>
        </Box>
    );
};

export default DevicesPage;
