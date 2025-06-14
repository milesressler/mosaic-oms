import { useEffect, useState} from "react";
import {UseFormReturnType} from "@mantine/form";
import {
    Alert,
    Badge, Blockquote,
    Box,
    Button,
    Card, DEFAULT_THEME,
    Group,
    Loader,
    LoadingOverlay, Pill,
    Stack,
    Stepper,
    Text,
    Textarea,
    TextInput,
    Title, useMantineTheme
} from "@mantine/core";
import {useDebouncedValue, useMediaQuery} from "@mantine/hooks";
import {CustomerSearch, OrderRequest} from "src/models/types";
import ItemSelection from "src/components/orders/ItemSelection.tsx";
import useApi from "src/hooks/useApi.tsx";
import customersApi from "src/services/customersApi.tsx";
import CustomerResultCard from "src/forms/CustomerResultCard.tsx";
import {FormOrderItem, OrderFormValues} from "src/models/forms.tsx";
import {useFeatures} from "src/contexts/FeaturesContext.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {
    IconExclamationCircle,
    IconNote,
    IconNotes,
    IconSend,
    IconShoppingBag,
    IconUserCheck
} from "@tabler/icons-react";
import {useOrderTracking} from "src/hooks/useOrderTracking.tsx";

interface Props {
    form: UseFormReturnType<OrderFormValues>,
}

export function OrderFormV2({ form }: Props) {
    const theme = useMantineTheme();

    const isMobile = useMediaQuery(`(max-width: ${DEFAULT_THEME.breakpoints.lg})`);
    const { groupMeEnabled, ordersOpen, featuresLoading } = useFeatures();
    const { startOrder, trackStep, completeOrder, itemAdded } = useOrderTracking();


    const [step, setStep] = useState<"customer" | "items" | "additional" | "confirm">("customer");
    const [useCustomerSearch, setUseCustomerSearch] = useState(true);
    const [searchString, setSearchString] = useState("");
    const [debouncedSearch] = useDebouncedValue(searchString, 300);
    const searchCustomersApi = useApi(customersApi.search);
    const createOrderAPI = useApi(ordersApi.createOrder);

    const steps = ["customer", "items", "additional", "confirm"];

    useEffect(() => {
        startOrder();
    }, []);

    useEffect(() => {
        if (debouncedSearch) {
            searchCustomersApi.request(debouncedSearch);
        }
    }, [debouncedSearch]);


    const handleCreateNew = () => {
        const [first, ...rest] = searchString.split(" ")
        form.setValues({
            customerId: '',
            firstName: first,
            lastName: rest.length > 0? rest.join(" ") : ''
        });
        setUseCustomerSearch(false)
    }

    const handleItemSelection = (index: number|null, newItem: FormOrderItem|null) => {
        if (index === null) {
            itemAdded(newItem!.item!.description!)
            form.insertListItem('items', newItem)
        } else if (newItem !== null) {
            // posthog.capture('order_funnel_item_changed', {});
            form.removeListItem('items', index);
            form.insertListItem('items', newItem)
        } else {
            // posthog.capture('order_funnel_item_removed', {});
            form.removeListItem('items', index);
        }
    };

    const handleCustomerSelect = (customerId: string) => {
        const customer = searchCustomersApi.data?.find((c) => c.uuid === customerId);
        if (customer) {
            form.setValues({
                customerId: customer.uuid,
                firstName: customer.firstName,
                lastName: customer.lastName || ''
            });
            setStep("items");
        }
        trackStep("customer_selected");
    };

    const submitOrder = (values: OrderFormValues) => {
        form.validate();
        const request: OrderRequest = {
            customerFirstName: values.firstName,
            customerLastName: values.lastName,
            customerUuid: values.customerId,
            customerPhone: values.customerPhone,
            specialInstructions: values.specialInstructions || '',
            optInNotifications: !!values.optInNotifications,
            items: values.items.map((formItem: FormOrderItem) => {
                return {...formItem, 'item': formItem.item.id};
            }),
        };
        createOrderAPI.request(request);
    }

    const startOver = () => {
        form.reset();
        setSearchString('');
        setStep('customer');
        startOrder();
        setUseCustomerSearch(true);
    }

    const newCustomerFormCompleted = () => {
        trackStep('order_funnel_customer_added');
        setStep("items")
    }

    useEffect(() => {
        if (createOrderAPI.data) {
            completeOrder({id: createOrderAPI.data.orderId});
            startOver();
        }
    }, [createOrderAPI.data]);


    return (

        <Box p="md"
             style={{
                 height: '100%',            // for debugging—replace with "100%" when in AppShell.Main
                 display: 'flex',
                 flexDirection: 'column',
                 minHeight: 0,               // let children shrink
             }}>
            {/* ❌ Orders closed banner */}
            {!featuresLoading && !ordersOpen && (
                <Alert color="red" title="Orders are currently closed" mb="md">
                    We’re not accepting new orders right now.
                </Alert>
            )}
            <LoadingOverlay visible={createOrderAPI.loading} />
            <Stepper
                active={steps.indexOf(step)}
                onStepClick={(index) => {
                    if (index === 0) setStep("customer");
                    if (index === 1 && form.values.firstName) setStep("items");
                    if (index === 2 && form.values.items.length > 0) setStep("additional");
                    if (index === 3 && form.values.items.length > 0) setStep("confirm");
                }}
                allowNextStepsSelect
                size="xs"
                styles={isMobile ? {
                    stepBody: {
                        display: 'none',
                    },
                } : {}}
            >
                <Stepper.Step
                    icon={<IconUserCheck />}
                    label="Customer"
                    description={form.values.firstName && step != 'customer' ? `${form.values.firstName} ${form.values.lastName || ''}` : ""}
                />
                <Stepper.Step label="Items"
                              icon={<IconShoppingBag />}
                              description={form.values.items?.length > 0  ? `${form.values.items?.length} item${form.values.items.length === 1 ? '' : 's'}` : ""}
                />
                <Stepper.Step label="Extra"
                              icon={<IconNote />}
                />
                <Stepper.Step label="Review"
                              loading={createOrderAPI.loading}
                              icon={<IconSend />}
                />
            </Stepper>

            {/* scrollable content */}
            <Box
                pt={'md'}
                mih={0}
                style={{
                    flex: 1,
                    overflowY: 'auto',
                }}
            >

                {/* Step 1: Customer Search or Manual Name Input */}
                {step === "customer" &&  (
                    <>
                        {useCustomerSearch ? (
                            <Stack>
                                <TextInput
                                    label=""
                                    placeholder="Search for Customer"
                                    rightSection={searchCustomersApi.loading ? <Loader size="sm" /> : searchCustomersApi.error ? <IconExclamationCircle color={'orange'}/> : null}
                                    value={searchString}
                                    size={'lg'}
                                    onChange={(event) => setSearchString(event.currentTarget.value)}
                                />

                                <Stack gap="xs" style={{ maxHeight: 400}}>

                                    { searchString && <CustomerResultCard useAlternateStyle={true} key={'new'} text={'Create "' + searchString + '"'} onClick={handleCreateNew}/> }
                                {(
                                   searchString && searchCustomersApi.data && searchCustomersApi.data?.map((c: CustomerSearch) =>
                                       <CustomerResultCard key={c.uuid}
                                                           flagged={c.flagged}
                                                           text={`${c.firstName || ''} ${c.lastName || ''}`.trim()}
                                                           onClick={() => handleCustomerSelect(c.uuid)
                                       }/>)
                                       )}
                                    </Stack>
                            </Stack>
                        ) : (
                            <form style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1rem" }}
                            >
                                <TextInput label="First Name" size={'lg'} {...form.getInputProps("firstName")} />
                                <TextInput label="Last Name" size={'lg'} {...form.getInputProps("lastName")} />
                            </form>
                        )}
                    </>
                )}

                {/* Step 2: Item Selection */}
                {step === "items" && <ItemSelection
                            currentSelection={form.values.items}
                            onItemSelectionChange={handleItemSelection}
                        />}

                {/* Step 3: notes and additional */}
                {step === "additional" &&
                    <Textarea
                        label="Special Instructions"
                        placeholder="General notes about the order"
                        {...form.getInputProps('specialInstructions')}
                        size={"lg"}
                    />
                }

                {/* Step 3: Confirmation */}
                {step === "confirm" && (
                    <Stack>
                        <Title order={4}>Order Summary</Title>
                        <Text>Name: {form.values.firstName} {form.values.lastName}</Text>
                        <Stack gap="xs">
                            {form.values.items.map((i: FormOrderItem) => (
                                <Card key={i.item.id} withBorder shadow="sm" padding="xs">
                                    <Group justify="space-between" gap={'xs'}>
                                        <Text fw={600}>{i.item.description}</Text>
                                        <Badge size="sm" color="blue">Qty: {i.quantity || 1}</Badge>
                                    </Group>
                                    <Group>
                                    {i.attributes &&
                                        Object.entries(i.attributes).map(([key, value]) => (
                                            <Pill key={key}>
                                                {key}:{value.value.toString()}
                                            </Pill>
                                        ))}
                                    </Group>
                                    {i.notes && (
                                        <Text size="sm" c="dimmed" >Notes: {i.notes}</Text>
                                    )}
                                </Card>
                            ))}
                        </Stack>
                        { form.values?.specialInstructions && <Text>
                            {/*<Text span fw={700} c={'green'}>Notes:</Text>/!**!/*/}
                            <Blockquote color="green" icon={<IconNotes />} mt="md"  iconSize={15} radius={5} p={8}>
                                {form.values?.specialInstructions}
                            </Blockquote>
                        </Text> }
                    </Stack>
                )}

            </Box>
            {/* sticky footer */}
            {  !(step === 'customer' && useCustomerSearch) && <Box
                style={{
                    flex: '0 0 60px',         // fixed height
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: 'env(safe-area-inset-bottom)',
                    borderTop: `1px solid ${theme.colors.gray[2]}`,
                    backgroundColor: theme.white,
                }}
            >
               <Group grow w={'100%'} justify={'space-between'}>
                    {!useCustomerSearch && step === 'customer' && (
                        <Button variant="outline" onClick={() => setUseCustomerSearch((prev) => !prev)}>
                            Back to Search
                        </Button>
                    )}

                    {step !== steps[0] &&
                    <Button
                        variant="outline"
                        color="gray"
                        onClick={() => {
                            setStep((prev) => {
                                const idx = steps.indexOf(prev);
                                return idx > 0 ? steps[idx - 1] : prev;
                            });
                        }}
                    >
                        Back
                    </Button>
                    }

                    { step === 'customer' && !useCustomerSearch &&
                    <Button onClick={newCustomerFormCompleted}
                            disabled={!form.isValid('firstName') || !form.isValid('lastName')}>
                        Next
                    </Button> }


                    {step === 'items' && <Button
                        onClick={() => form.validateField('items') && setStep("additional")}
                        disabled={form.values.items.length === 0}
                    >
                        Next
                    </Button> }

                    {step === 'additional' && <Button
                        onClick={() => setStep("confirm")}
                        disabled={form.values.items.length === 0}
                    >
                        Next
                    </Button> }

                    {step === "confirm" &&
                    <Button
                        disabled={!ordersOpen || featuresLoading}
                        onClick={() => submitOrder(form.values)}>
                        { groupMeEnabled ? "Send to GroupMe" : "Submit Order"}
                    </Button>}
                </Group>
            </Box>
            }
        </Box>
    );
}

export default OrderFormV2;
