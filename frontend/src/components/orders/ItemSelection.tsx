import useApi from "src/hooks/useApi.tsx";
import {
    Box,
    Button,
    Card,
    Grid,
    Group,
    Modal,
    Pill,
    ScrollArea,
    SegmentedControl,
    Stack,
    Text,
    useMantineTheme
} from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import {useCallback, useEffect, useState} from "react";
import itemsApi from "src/services/itemsApi.tsx";
import {Category, categoryDisplayNames, Item} from "src/models/types.tsx";
import OrderItemFormV2 from "src/forms/OrderItemFormV2.tsx";
import {FormOrderItem} from "src/models/forms.tsx";
import {useDisclosure} from "@mantine/hooks";
import ItemForm from "src/forms/items/ItemForm.tsx";


interface props {
    currentSelection: FormOrderItem[]
    onItemSelectionChange: (index: number|null, formOrderItem: FormOrderItem|null) => void
}

export function ItemSelection ({currentSelection, onItemSelectionChange}: props) {

    const theme = useMantineTheme();
    const categoryColors = [
        theme.colors.grape[7],
        theme.colors.red[4],
        theme.colors.teal[5],
        theme.colors.indigo[3],
        theme.colors.yellow[3],
        theme.colors.lime[4],
        theme.colors.cyan[7]]

    const categories = Object.values(Category).map(c => c.toString());

    const [draftItem, setDraftItem] = useState<FormOrderItem | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [newItemOpen, {open: openNewItem, close: closeNewItem}] = useDisclosure(false);

    const suggestedItemsApi = useApi(itemsApi.getSuggestedItems);

    useEffect(() => {
        suggestedItemsApi.request();
    }, []);

    const [selectedCategory, setSelectedCategory] = useState(categories[0].toString());


    const handleItemSelect = (item: Item) => {
        const draftItem: FormOrderItem = {
            item,
            quantity: 1,
            notes: "", // Default state
            attributes: {}, // If there are attributes to be filled
        };

        const needsForm = (item.placeholder && item.placeholder.length > 0) ||
            (item.attributes && item.attributes.length > 0)
        || item.category === Category.CLOTHING;
        if (needsForm) {
            setDraftItem(draftItem);
            setEditingIndex(null);
        } else {
            onItemSelectionChange(null, draftItem);
        }
    };

    const handleItemEdit = (index: number) => {
        setDraftItem({ ...currentSelection[index] });
        setEditingIndex(index);
    };

    const handleItemDelete = (index: number) => {
        onItemSelectionChange(index, null);
    };

    const handleItemSave = (formOrderItem: FormOrderItem) => {
        onItemSelectionChange(editingIndex, formOrderItem);
        setDraftItem(null);
        setEditingIndex(null);
    };

    const handleNewItem = () => {
        openNewItem();
    }

    const handleItemCreated = useCallback((item: Item) => {
        suggestedItemsApi.request();

        closeNewItem();
        onItemSelectionChange(null, {item: item, quantity: 1})
    }, [suggestedItemsApi.request, closeNewItem]);

    return (
        <Stack gap="0" style={{ height: '100%', overflow: 'hidden' }}>
            <Modal title={"Create New Item"} opened={newItemOpen} onClose={closeNewItem}>
                <ItemForm onItemSave={handleItemCreated} />
            </Modal>

            <Modal opened={!!draftItem}
                   title={draftItem?.item?.description}
                   onClose={() => setDraftItem(null)}>
                <Box mt={'xs'}>
                { draftItem && <OrderItemFormV2
                    formItem={draftItem}
                    onCancel={() => setDraftItem(null)}
                    onSave={handleItemSave}
                />}
                </Box>
            </Modal>

            {/* Fixed Segmented Control with horizontal scroll */}
            <Box style={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                background: 'white', // to cover what's underneath
                paddingBottom: 8
            }}>
                <ScrollArea scrollbarSize={6} type="scroll" offsetScrollbars >
                    <SegmentedControl
                        fullWidth
                        value={selectedCategory || undefined}
                        onChange={(val) => setSelectedCategory(val)}
                        data={Object.values(Category).map((category) => ({
                            label: categoryDisplayNames[category],
                            value: category
                        }))}
                    />
                </ScrollArea>
            </Box>
            {/* Scrollable content */}
            <ScrollArea style={{ flex: 1 }} w="100%">
                <Box px="sm" pb="md">
                    <Grid gutter="xs">
                        {selectedCategory &&
                            suggestedItemsApi.data &&
                            suggestedItemsApi.data[selectedCategory]
                                ?.sort((a: Item, b: Item) => a.description.localeCompare(b.description))
                                .map((item: Item) => (
                                    <Grid.Col span={{ base: 6, md: 3 }} key={item.description}>
                                        <Card
                                            shadow="sm"
                                            padding="xs"
                                            radius="md"
                                            withBorder
                                            w="100%"
                                            onClick={() => handleItemSelect(item)}
                                            style={{
                                                cursor: "pointer",
                                                backgroundColor: currentSelection?.map((i) => i.item?.id).includes(item.id)
                                                    ? "#e0f7fa"
                                                    : "white",
                                            }}
                                        >
                                            <Group justify="space-between" gap="xs">
                                                <Text style={{ flex: 1 }}>{item.description}</Text>
                                                {(item.availability === 'UNAVAILABLE' || item.availability === 'DISCONTINUED') && (
                                                    <IconAlertTriangle 
                                                        size={16} 
                                                        color={theme.colors.orange[6]}
                                                        style={{ flexShrink: 0 }}
                                                    />
                                                )}
                                            </Group>
                                        </Card>
                                    </Grid.Col>
                                ))}
                    </Grid>

                    {currentSelection.length > 0 && (
                        <Group mt="sm" wrap="wrap">
                            {currentSelection
                                .sort((a, b) =>
                                    (a.item.category || "OTHER").localeCompare(b.item.category || "OTHER")
                                )
                                .map((item: FormOrderItem, index: number) => (
                                    <Pill
                                        size="xl"
                                        key={index}
                                        onClick={() => handleItemEdit(index)}
                                        onRemove={() => handleItemDelete(index)}
                                        withRemoveButton
                                        style={{
                                            backgroundColor:
                                                categoryColors[categories.indexOf(item.item.category || "OTHER")],
                                            cursor: "pointer",
                                        }}
                                    >
                                        {item.item.description}
                                    </Pill>
                                ))}
                        </Group>
                    )}
                </Box>
            </ScrollArea>


            <Button variant={'outline'} onClick={handleNewItem} display={'none'}>New Item</Button>
        </Stack>

    );
}

export default ItemSelection;
