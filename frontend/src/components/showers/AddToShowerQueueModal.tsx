import { useState } from "react";
import { Modal, Box, Stepper, Button, Group, Text, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
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
}

export const AddToShowerQueueModal = ({ opened, onClose, onSuccess }: Props) => {
    const createReservationApi = useApi(showersApi.createReservation);
    const updateCustomerApi = useApi(customersApi.updateCustomer);
    const createCustomerApi = useApi(customersApi.createCustomer);

    const [activeStep, setActiveStep] = useState(0);
    const [selectedCustomer, setSelectedCustomer] = useState<ShowerCustomer | null>(null);
    const [waiverDate, setWaiverDate] = useState<Date | null>(null);
    const [isCreatingCustomer, setIsCreatingCustomer] = useState(false);

    const form = useForm({
        initialValues: {
            firstName: "",
            lastName: "",
        },
        validate: {
            firstName: (value) => (value.trim() ? null : "First name is required"),
            lastName: (value) => (value.trim() ? null : "Last name is required"),
        },
    });

    const handleSelectCustomer = (c: CustomerSearchResult) => {
        const customer: ShowerCustomer = {
            uuid: c.uuid,
            firstName: c.firstName,
            lastName: c.lastName,
            // assume search result may include waiver timestamp
            showerWaiverCompleted: (c as any).showerWaiverCompleted,
        };
        setSelectedCustomer(customer);
        setActiveStep(customer.showerWaiverCompleted ? 2 : 1);
    };

    const handleCreateCustomer = form.onSubmit(async (values) => {
        const newCust = await createCustomerApi.request(values);
        if (newCust) {
            const customer: ShowerCustomer = {
                uuid: newCust.data.uuid,
                firstName: newCust.data.firstName,
                lastName: newCust.data.lastName,
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
            showerWaiverSigned: waiverDate,
        });
        if (updated) {
            setSelectedCustomer({
                ...selectedCustomer,
                showerWaiverCompleted: waiverDate.toISOString(),
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
                        {selectedCustomer?.showerWaiverCompleted ? (
                            <Box>
                                <Text fw={500} mb="xs">
                                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                                </Text>
                                <Text size="sm" mb="md">
                                    Waiver signed on {new Date(selectedCustomer.showerWaiverCompleted).toLocaleDateString()}
                                </Text>
                                <Group justify="right">
                                    <Button variant="default" onClick={() => setActiveStep(0)}>
                                        Change Customer
                                    </Button>
                                    <Button onClick={() => setActiveStep(2)}>Continue</Button>
                                </Group>
                            </Box>
                        ) : (
                            <Box>
                                <Text mb="sm">
                                    Please have the guest sign a waiver and record the date below.
                                </Text>
                                <DateInput
                                    label="Waiver Date"
                                    value={waiverDate}
                                    onChange={setWaiverDate}
                                    maxDate={new Date()}
                                    required
                                />
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
                            <Text mb="md">
                                Add {selectedCustomer?.firstName} {selectedCustomer?.lastName} to the shower queue?
                            </Text>
                            <Group justify="right">
                                <Button variant="default" onClick={() => setActiveStep(selectedCustomer?.showerWaiverCompleted ? 1 : 0)}>
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
