import useApi from "src/hooks/useApi.tsx";
import {
    Text, Stack, SegmentedControl, ScrollArea, Grid, Card, Badge, useMantineTheme, Group, Modal, Button
} from '@mantine/core';
import {useCallback, useEffect, useState} from "react";
import itemsApi from "src/services/itemsApi.tsx";
import {Item} from "src/models/types.tsx";
import OrderItemFormV2 from "src/forms/OrderItemFormV2.tsx";
import {FormOrderItem} from "src/models/forms.tsx";
import {IconCircleX, IconNote} from "@tabler/icons-react";
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

    const [draftItem, setDraftItem] = useState<FormOrderItem | null>(null);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [categories, setCategories] = useState<string[]>([]);
    const [newItemOpen, {open: openNewItem, close: closeNewItem}] = useDisclosure(false);

    const suggestedItemsApi = useApi(itemsApi.getSuggestedItems);

    useEffect(() => {
        suggestedItemsApi.request();
    }, []);

    useEffect(() => {
        if (categories.length === 0 && suggestedItemsApi.data) {
            setCategories(suggestedItemsApi.data ? Object.keys(suggestedItemsApi.data) : [])
        }

    }, [suggestedItemsApi.data]);

    useEffect(() => {
        if (categories && !selectedCategory) {
            setSelectedCategory(categories[0]);
        }
    }, [categories]);

    const [selectedCategory, setSelectedCategory] = useState("");


    const handleItemSelect = (item: Item) => {
        setDraftItem({
            item,
            quantity: 1,
            notes: "", // Default state
            attributes: {}, // If there are attributes to be filled
        });
        setEditingIndex(null);
    };

    const handleItemEdit = (index: number) => {
        setDraftItem({ ...currentSelection[index] });
        setEditingIndex(index);
    };

    const handleItemDelete = (index: number) => {
        onItemSelectionChange(index, null);
    };

    const handleItemSave = (formOrderItem: FormOrderItem) => {
        if (editingIndex !== null) {
            // Update existing item
            // const updatedSelection = [...currentSelection];
            // updatedSelection[editingIndex] = formOrderItem;
            onItemSelectionChange(editingIndex, formOrderItem);
        } else {
            onItemSelectionChange(null, formOrderItem);
            // Add new item
            // onItemSelectionChange([...currentSelection, formOrderItem]);
        }
        setDraftItem(null);
        setEditingIndex(null);
    };

    const handleNewItem = () => {
        openNewItem();
    }

    const handleItemCreated = useCallback((item: Item) => {
        suggestedItemsApi.request();
        closeNewItem();
    }, [suggestedItemsApi.request, closeNewItem]);

    return (
        <Stack gap="md" >
            <Modal title={"Create New Item"} opened={newItemOpen} onClose={() => {closeNewItem()}} >
                <ItemForm categories={categories} onItemCreate={handleItemCreated}/>
            </Modal>

            {<Modal opened={!!draftItem} title={draftItem?.item?.description}  onClose={() => setDraftItem(null)}>
                {/*<Card center maw={200}>*/}
                { draftItem && <OrderItemFormV2
                    formItem={draftItem}
                    onCancel={() => setDraftItem(null)}
                    onSave={handleItemSave}
                />}
                {/*</Card>*/}
            </Modal> }

            {/* Category Selection */}
            <ScrollArea>
                <SegmentedControl
                    fullWidth
                    value={selectedCategory || undefined}
                    onChange={(val) => setSelectedCategory(val)}
                    data={categories}
                />
            </ScrollArea>
            {/* Item Selection */}
            <Grid>
                {selectedCategory && suggestedItemsApi.data && suggestedItemsApi.data[selectedCategory].sort((a:Item, b:Item) => a.description.localeCompare(b.description)).map((item: Item) => (
                    <Grid.Col span={{base: 6, md: 3}} key={item.description}>
                        <Card
                            shadow="sm"
                            padding="xs"
                            radius="md"
                            withBorder
                            onClick={() => handleItemSelect(item)}
                            style={{
                                cursor: "pointer",
                                backgroundColor: currentSelection?.map((i) => i.item?.id).includes(item.id) ? "#e0f7fa" : "white",
                            }}
                        >
                            <Text>{item.description}</Text>
                        </Card>
                    </Grid.Col>
                ))}
            </Grid>

            {/* Selected Items */}
            {currentSelection.length > 0 && (
                <Stack gap="xs">
                    {/*<Text fw={500}>Selected Items:</Text>*/}
                    <Group>
                        {currentSelection.sort((a, b) => (a.item.category || 'OTHER').localeCompare(b.item.category || 'OTHER')).map((item: FormOrderItem, index: number) => (
                            <Badge size="xl"
                                   onClick={() => handleItemEdit(index)}
                                   style={{cursor: ''}}
                                   key={index}
                                   variant="filled"
                                   rightSection={
                                        <Group> {item.notes && <IconNote/>}
                                       <IconCircleX color={'white'} onClick={(e) => {
                                           e.stopPropagation(); // Prevents event from reaching Badge
                                           handleItemDelete(index);
                                       }}/> </Group>}
                                   color={categoryColors[categories.indexOf(item.item.category || 'OTHER')]}>
                                {item.item.description}
                            </Badge>
                        ))}
                    </Group>
                </Stack>
            )}
            {/*<Modal opened={false} onClose={}></Modal>*/}
            <Button variant={'outline'} onClick={handleNewItem}>New Item</Button>
        </Stack>
    );
}

export default ItemSelection;
