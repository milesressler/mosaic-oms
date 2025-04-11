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
        <Stack gap="md" >
            <Modal title={"Create New Item"} opened={newItemOpen} onClose={() => {closeNewItem()}} >
                    <ItemForm onItemSave={handleItemCreated}/>
            </Modal>

            {<Modal opened={!!draftItem} title={draftItem?.item?.description}
                    onClose={() => setDraftItem(null)}>
                <Box mt={'xs'}>
                { draftItem && <OrderItemFormV2
                    formItem={draftItem}
                    onCancel={() => setDraftItem(null)}
                    onSave={handleItemSave}
                />}
                </Box>
            </Modal> }

            {/* Category Selection */}
            <ScrollArea>
                <SegmentedControl
                    fullWidth
                    value={selectedCategory || undefined}
                    onChange={(val) => setSelectedCategory(val)}
                    data={Object.values(Category).map(category => {
                        return { label: categoryDisplayNames[category], value: category.toString() }
                    })}
                />
            </ScrollArea>
            {/* Item Selection */}
            <Grid>
                {selectedCategory && suggestedItemsApi.data && suggestedItemsApi.data[selectedCategory]?.sort((a:Item, b:Item) => a.description.localeCompare(b.description)).map((item: Item) => (
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
                            <Pill size="xl"
                                  // style={{}}
                                   onClick={() => handleItemEdit(index)}
                                   style={{cursor: '', backgroundColor: categoryColors[categories.indexOf(item.item.category || 'OTHER')]}}
                                   key={index}
                                  onRemove={()=> handleItemDelete(index)}
                                   // variant="filled"
                                   // rightSection={
                                   //      <Group> {item.notes && <IconNote/>}
                                   //     <IconCircleX color={'white'} onClick={(e) => {
                                   //         e.stopPropagation(); // Prevents event from reaching Badge
                                   //         handleItemDelete(index);
                                   //     }}/> </Group>}
                                  withRemoveButton={true}>
                                {item.item.description}
                            </Pill>
                        ))}
                    </Group>
                </Stack>
            )}
            {/*<Modal opened={false} onClose={}></Modal>*/}
            <Button variant={'outline'} onClick={handleNewItem} display={'none'}>New Item</Button>
        </Stack>
    );
}

export default ItemSelection;
