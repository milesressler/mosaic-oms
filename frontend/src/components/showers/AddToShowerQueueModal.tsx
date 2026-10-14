import { useEffect, useState } from "react";
import { Alert, Modal, Box, Stepper, Button, Group, Text, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { DateTime } from "luxon";
import useApi from "src/hooks/useApi";
import showersApi from "src/services/showersApi";
import customersApi from "src/services/customersApi";
import { CustomerSearchResult } from "src/models/types";
import CustomerSearch from "src/components/customer/CustomerSearch";

interface Props {
    opened: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// unify search result and full customer model for this flow
interface ShowerCustomer {
    uuid: string;
    firstName: string;
    lastName: string;
    showerWaiverCompleted?: string;
    waiverValid: boolean;
}

export const AddToShowerQueueModal = ({ opened, onClose, onSuccess }: Props) => {
    const createReservationApi = useApi(showersApi.createReservation);
    const updateCustomerApi = useApi(customersApi.updateCustomer);
    const createCustomerApi = useApi(customersApi.createCustomer);
    const showerQueueApi = useApi(showersApi.getShowerQueue);

    useEffect(() => {
        if (opened) {
            showerQueueApi.request();
        }
    }, [opened]);

    const [activeStep, setActiveStep] = useState(0);
    const [selectedCustomer, setSelectedCustomer] = useState<ShowerCustomer | null>(null);
    const [waiverDate, setWaiverDate] = useState<string | null>(null);
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

    const form = useForm({
        initialValues: {
            firstName: "",
            lastName: "",
        },
        validate: {
            firstName: (value: string) => (value.trim() ? null : "First name is required"),
            lastName: (value: string) => (value.trim() ? null : "Last name is required"),
        },
    });

    const handleSelectCustomer = (c: CustomerSearchResult) => {
        const customer: ShowerCustomer = {
            uuid: c.uuid,
            firstName: c.firstName,
            lastName: c.lastName,
            showerWaiverCompleted: c.showerWaiverCompleted,
            // waivers expire after a year; the backend rejects reservations without a valid one
            waiverValid: !!c.validWaiver,
        };
        setSelectedCustomer(customer);
        setWaiverDate(null);
        setActiveStep(customer.waiverValid ? 2 : 1);
    };

    const handleCreateCustomer = form.onSubmit(async (values) => {
        const newCust = await createCustomerApi.request(values);
        if (newCust) {
            const customer: ShowerCustomer = {
                uuid: newCust.data.uuid,
                firstName: newCust.data.firstName,
                lastName: newCust.data.lastName,
                waiverValid: false,
            };
            setSelectedCustomer(customer);
            setIsCreatingCustomer(false);
            form.reset();
            setActiveStep(1);
        }
    });

    const handleSaveWaiver = async () => {
        if (!selectedCustomer || !waiverDate) return;
        const updated = await updateCustomerApi.request(selectedCustomer.uuid, {
            showerWaiverSigned: waiverDate ? new Date(waiverDate + 'T00:00:00').toISOString() : null,
        });
        if (updated) {
            setSelectedCustomer({
                ...selectedCustomer,
                showerWaiverCompleted: waiverDate ?? undefined,
                waiverValid: true,
            });
            setActiveStep(2);
        }
    };

    const handleAddToQueue = async () => {
        if (!selectedCustomer) return;
        const res = await createReservationApi.request({ customerUuid: selectedCustomer.uuid });
        if (res) {
            onSuccess();
            onClose();
            form.reset();
            setActiveStep(0);
        }
    };

    return (
        <Modal size="xl" opened={opened} onClose={onClose} title="Add to Shower Queue" centered>
            <Box p="xs">
                <Stepper active={activeStep} onStepClick={setActiveStep} size="sm">
                    <Stepper.Step label="Customer" description="Search or Create">
                        {isCreatingCustomer ? (
                            <Box>
                                <form onSubmit={handleCreateCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <TextInput label="First Name" {...form.getInputProps('firstName')} />
                                    <TextInput label="Last Name" {...form.getInputProps('lastName')} />
                                    <Group justify="apart">
                                        <Button variant="default" onClick={() => { setIsCreatingCustomer(false); form.reset(); }}>
                                            Back to Search
                                        </Button>
                                        <Button type="submit" loading={createCustomerApi.loading}>
                                            Create
                                        </Button>
                                    </Group>
                                </form>
                            </Box>
                        ) : (
                            <Box>
                                <CustomerSearch onSelect={handleSelectCustomer} />
                                <Button fullWidth variant="outline" mt="sm" onClick={() => setIsCreatingCustomer(true)}>
                                    Create New Customer
                                </Button>
                            </Box>
                        )}
                    </Stepper.Step>

                    <Stepper.Step label="Waiver" description="Review or Add">
                        {selectedCustomer?.waiverValid ? (
                            <Box>
                                <Text fw={500} mb="xs">
                                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                                </Text>
                                {selectedCustomer.showerWaiverCompleted && (
                                    <Text size="sm" mb="md">
                                        Waiver signed on {new Date(selectedCustomer.showerWaiverCompleted).toLocaleDateString()}
                                    </Text>
                                )}
                                <Group justify="right">
                                    <Button variant="default" onClick={() => setActiveStep(0)}>
                                        Change Customer
                                    </Button>
                                    <Button onClick={() => setActiveStep(2)}>Continue</Button>
                                </Group>
                            </Box>
                        ) : (
                            <Box>
                                {selectedCustomer?.showerWaiverCompleted ? (
                                    <Text mb="sm">
                                        {selectedCustomer.firstName}'s waiver from {new Date(selectedCustomer.showerWaiverCompleted).toLocaleDateString()} has expired (waivers are valid for one year).
                                        Please have the guest sign a new waiver and record the date below.
                                    </Text>
                                ) : (
                                    <Text mb="sm">
                                        Please have the guest sign a waiver and record the date below.
                                    </Text>
                                )}
                                <DateInput
                                    label="Waiver Date"
                                    value={waiverDate}
                                    onChange={setWaiverDate}
                                    maxDate={new Date()}
                                    required
                                />
                                {updateCustomerApi.error && (
                                    <Alert color="red" mt="sm">{updateCustomerApi.error}</Alert>
                                )}
                                <Group justify="right">
                                    <Button variant="default" onClick={() => setActiveStep(0)}>
                                        Back
                                    </Button>
                                    <Button
                                        loading={updateCustomerApi.loading}
                                        disabled={!waiverDate}
                                        onClick={handleSaveWaiver}
                                    >
                                        Save Waiver
                                    </Button>
                                </Group>
                            </Box>
                        )}
                    </Stepper.Step>

                    <Stepper.Step label="Review" description="Confirm & Add">
                        <Box>
                            <Text mb="xs">
                                Add {selectedCustomer?.firstName} {selectedCustomer?.lastName} to the shower queue?
                            </Text>
                            {showerQueueApi.data && (
                                <Box mb="md" p="sm" style={{ background: 'var(--mantine-color-gray-0)', borderRadius: 'var(--mantine-radius-sm)' }}>
                                    <Text size="sm" c="dimmed">
                                        {showerQueueApi.data.queue.length === 0
                                            ? 'No one is currently waiting.'
                                            : `${showerQueueApi.data.queue.length} ${showerQueueApi.data.queue.length === 1 ? 'person' : 'people'} currently waiting.`}
                                    </Text>
                                    <Text size="sm" fw={500} mt={4}>
                                        Estimated shower time: {DateTime.fromISO(showerQueueApi.data.nextEstimatedStart).toLocaleString(DateTime.TIME_SIMPLE)}
                                    </Text>
                                </Box>
                            )}
                            {createReservationApi.error && (
                                <Alert color="red" mb="md">{createReservationApi.error}</Alert>
                            )}
                            <Group justify="right">
                                <Button variant="default" onClick={() => setActiveStep(selectedCustomer?.waiverValid ? 1 : 0)}>
                                    Back
                                </Button>
                                <Button loading={createReservationApi.loading} onClick={handleAddToQueue}>
                                    Add to Queue
                                </Button>
                            </Group>
                        </Box>
                    </Stepper.Step>
                </Stepper>
            </Box>
        </Modal>
    );
};

export default AddToShowerQueueModal;
