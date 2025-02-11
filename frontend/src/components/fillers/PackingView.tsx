import {Button, Divider, Group, Paper, Text} from "@mantine/core";
import {useSelectedOrder} from "src/contexts/SelectedOrderContext.tsx";
import ItemQuantitySelector from "src/components/fillers/ItemQuantitySelector.tsx";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {useEffect, useState} from "react";
import {OrderItem, OrderStatus} from "src/models/types.tsx";
import {useNavigate} from "react-router-dom";
import {useFeatures} from "src/contexts/FeaturesContext.tsx";
import {IconPrinter} from "@tabler/icons-react";

function PackingView({}) {
    const {selectedOrder, doForceRefresh} = useSelectedOrder();
    const updateStatus = useApi(ordersApi.updateOrderStatus);
    const updateQuantities = useApi(ordersApi.updateOrderItems);
    const [draftItems, setDraftItems] = useState<OrderItem[]>([]);
    const navigate = useNavigate();
    const { printOnTransitionToStatus } = useFeatures()

    useEffect(() => {
        if (updateStatus.data && updateStatus.data.orderStatus === OrderStatus.PACKED) {
            navigate("dashboard/filler");
        }
    }, [updateStatus.data]);

    useEffect(() => {
        if (updateQuantities.data) {
            doForceRefresh();
        }
    }, [updateQuantities.data]);

    useEffect(() => {
        if (!selectedOrder) return;

        setDraftItems((prevDraftItems) => {
            // Map selectedOrder items to maintain consistency with draftItems
            return selectedOrder.items.map((orderItem: OrderItem) => {
                const existingDraftItem = prevDraftItems.find(draftItem => draftItem.id === orderItem.id);

                return {
                    ...orderItem,
                    quantityFulfilled: existingDraftItem ? existingDraftItem.quantityFulfilled : orderItem.quantityFulfilled
                };
            });
        });
    }, [selectedOrder]);

    const updateDraftItemQuantityFulfilled = (id: number, newQuantityFulfilled: number) => {
        console.log(`updateDraftItemQuantityFulfilled ${id} to ${newQuantityFulfilled}`)
        setDraftItems((prevDraftItems) =>
            prevDraftItems.map((item) =>
                item.id === id
                    ? { ...item, quantityFulfilled: newQuantityFulfilled }
                    : item
            )
        );
    };

    const clearAll = () => {
        setDraftItems((prevDraftItems: OrderItem[]) => {
            return prevDraftItems.map((item) => ({ ...item, quantityFulfilled: 0 }));
        });
    };

    const fillAll = () => {
        setDraftItems((previous) =>
            previous.map((i) => {
                i.quantityFulfilled = i.quantityRequested;
                return i;
            })
        );
    }

    const saveProgress = () => {
        const quantities = draftItems.reduce((acc, item) => {
            acc[item.id] = item.quantityFulfilled;
            return acc;
        }, {} as Record<number, number>);

        return updateQuantities.request({
            orderUuid: selectedOrder?.uuid,
            quantities
        });
    }

    const moveToWagon = () => {
        updateStatus.request(selectedOrder?.uuid, OrderStatus.PACKED);
    }
    const hasStateChanged =
        draftItems.some((draftItem) => {
            const correspondingItem = selectedOrder?.items.find(
                (orderItem) => orderItem.id === draftItem.id
            );

            // If there's no corresponding item, or the quantities differ, return true
            return !correspondingItem || correspondingItem.quantityFulfilled !== draftItem.quantityFulfilled;
        });


    return (<>
        <Paper shadow="xs" mt={5}>
            {draftItems?.map((item) => {
                return (
                    <div key={item.id}>
                        <Group justify={"space-between"}>
                            <div>
                                <Text span fw={500}> {item.quantityRequested}</Text> {item.description} &nbsp;
                                <Text span c={'dimmed'}>{item.notes}</Text>
                            </div>
                            { item.quantityRequested === item.quantityFulfilled &&
                                <Text>
                                    Complete
                                </Text>
                            }
                            { item.quantityRequested !== item.quantityFulfilled &&
                            <Text>
                                {item.quantityFulfilled} filled / {item.quantityRequested - item.quantityFulfilled} remaining
                            </Text>
                            }
                        </Group>
                        <ItemQuantitySelector quantitySelected={item.quantityFulfilled}
                                              onValueChange={(value) => {
                            updateDraftItemQuantityFulfilled(item.id, value);
                        }} max={item.quantityRequested}></ItemQuantitySelector>
                    </div>
                )
            })}
        </Paper>
        <Divider my={20}></Divider>
        <Group justify={'space-between'}>
            <Group>
                <Button variant={"default"} onClick={clearAll}>Clear All</Button>
                <Button variant={"default"} onClick={fillAll}>Fill All</Button>

            </Group>
            <Group justify={'flex-end'}>
                {hasStateChanged && <Button variant={"primary"} onClick={() => saveProgress()}>Save</Button>}
                {!hasStateChanged && <Button
                    variant={"primary"}
                    leftSection={ printOnTransitionToStatus === OrderStatus.PACKED && <IconPrinter/> }
                    onClick={() => moveToWagon()}>
                    Placed in Wagon
                </Button>}
            </Group>
        </Group>
    </>)
}

export default PackingView;
