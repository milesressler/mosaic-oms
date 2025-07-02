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
import {useMediaQuery} from "@mantine/hooks";
import {CustomerSearchResult, OrderDetails, OrderRequest} from "src/models/types";
import ItemSelection from "src/components/orders/ItemSelection.tsx";
import useApi from "src/hooks/useApi.tsx";
import {FormOrderItem, OrderFormValues} from "src/models/forms.tsx";
import {useFeatures} from "src/context/FeaturesContext.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {
    IconNote,
    IconNotes,
    IconSend,
    IconShoppingBag,
    IconUserCheck
} from "@tabler/icons-react";
import {useOrderTracking} from "src/hooks/useOrderTracking.tsx";
import CustomerSearch from "src/components/customer/CustomerSearch.tsx";
import OrdersOpenSwitch from "src/components/features/OrdersOpenSwitch.tsx";
import OrdersClosedAlert from "src/components/common/orders/OrdersClosedAlert.tsx";

interface Props {
    form: UseFormReturnType<OrderFormValues>,
    mode: "create" | "edit",
    order: OrderDetails|null,
    onUpdateComplete?: () => void,
}

export function OrderFormV2({ form, mode, order, onUpdateComplete }: Props) {
    const theme = useMantineTheme();

    const isMobile = useMediaQuery(`(max-width: ${DEFAULT_THEME.breakpoints.lg})`);
    const { groupMeEnabled, ordersOpen, featuresLoading } = useFeatures();
    const { startOrder, trackStep, completeOrder, itemAdded } = useOrderTracking();

    const [step, setStep] = useState<"customer" | "items" | "additional" | "confirm">("customer");
    const [useCustomerSearch, setUseCustomerSearch] = useState(true);

    const createOrderAPI = useApi(ordersApi.createOrder);
    const updateOrderApi = useApi(ordersApi.updateOrderDetails);

    const steps = ["customer", "items", "additional", "confirm"];

    useEffect(() => {
        startOrder();
    }, []);

    useEffect(() => {
        if (mode === 'edit') {
            setStep('items');
        } else {
            setStep('customer');
        }

    }, [mode]);

    const handleCreateNew = (first: string, last: string) => {
        form.setValues({
            customerId: '',
            firstName: first,
            lastName: last
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
            const removedItem = form.values.items[index];
            if (removedItem.orderItemId != null) {
                form.setFieldValue(
                    'deletedItemIds',
                    [...(form.values.deletedItemIds || []), removedItem.orderItemId]
                );
            }
            // posthog.capture('order_funnel_item_removed', {});
            form.removeListItem('items', index);
        }
    };

    const handleCustomerSelect = (customer: CustomerSearchResult) => {
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
        if (mode === 'create') {
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
        } else {
            const request: Partial<OrderRequest> = {
                specialInstructions: values.specialInstructions || '',
                upsertItems: values.items.map((formItem: FormOrderItem) => ({
                    ...formItem,
                    item: formItem.item.id,
                })),
                removeItems: values.deletedItemIds || [],
            };
            updateOrderApi.request(order!.uuid, request);
        }
    }

    const startOver = () => {
        form.reset();
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
            if (mode == 'create') {
                startOver();
            }
        }
    }, [createOrderAPI.data]);

    useEffect(() => {
        if (updateOrderApi.data) {

            if (onUpdateComplete) {
                onUpdateComplete();
            }
        }
    }, [updateOrderApi.data]);

    if (!ordersOpen && !featuresLoading) {
        return <OrdersClosedAlert withToggle={true}/>
    }


    return (

        <Box p="md"
             style={{
                 height: '100%',            // for debugging—replace with "100%" when in AppShell.Main
                 display: 'flex',
                 flexDirection: 'column',
                 minHeight: 0,               // let children shrink
             }}>
            <LoadingOverlay visible={createOrderAPI.loading} />
            <Stepper
                active={steps.indexOf(step)}
                onStepClick={(index) => {
                    if (index === 0 && mode !== 'edit') setStep("customer");
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
                            <CustomerSearch
                                onSelect={handleCustomerSelect}
                                onSelectCreate={handleCreateNew}
                            />
                        ) : (
                            <form style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "1rem" }}
                            >
                                <TextInput label="First Name" id='customerFirstInput' size={'lg'} {...form.getInputProps("firstName")} />
                                <TextInput label="Last Name" id='customerLastInput' size={'lg'} {...form.getInputProps("lastName")} />
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
                        id='specialInstructions'
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
            {<Box
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

                    {step !== steps[0] && (step !== steps[1] && mode === 'edit') &&
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

                   {
                       step == steps[0] && useCustomerSearch && ordersOpen && <OrdersOpenSwitch/>
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
                        { groupMeEnabled ? "Send to GroupMe" : mode === 'create'  ? "Submit Order" : 'Update Order'}
                    </Button>}
                </Group>
            </Box>
            }
        </Box>
    );
}

export default OrderFormV2;
