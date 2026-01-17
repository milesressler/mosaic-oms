import React, { useState, useEffect } from 'react';
import { Autocomplete, Group, Text } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import useApi from 'src/hooks/useApi';
import itemsApi from 'src/services/itemsApi';
import { Item } from 'src/models/types';

interface ItemSearchProps {
    onItemSelect: (item: Item | null) => void;
    placeholder?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    value?: string;
    clearable?: boolean;
}

export function ItemSearch({ 
    onItemSelect, 
    placeholder = "Search for an item...", 
    size = 'lg',
    value,
    clearable = true 
}: ItemSearchProps) {
    const [searchValue, setSearchValue] = useState(value || '');
    const [allItems, setAllItems] = useState<Item[]>([]);
    
    const suggestedItemsApi = useApi(itemsApi.getSuggestedItems);
    
    useEffect(() => {
        suggestedItemsApi.request();
    }, []);
    
    useEffect(() => {
        if (suggestedItemsApi.data) {
            // Flatten all items from all categories
            const items = Object.values(suggestedItemsApi.data).flat();
            setAllItems(items);
        }
    }, [suggestedItemsApi.data]);
    
    useEffect(() => {
        if (value !== undefined) {
            setSearchValue(value);
        }
    }, [value]);
    
    const autocompleteData = allItems.map(item => ({
        value: item.description,
        label: item.description,
        item: item
    }));
    
    const handleItemSelection = (value: string) => {
        setSearchValue(value);
        const selectedData = autocompleteData.find(d => d.value === value);
        if (selectedData) {
            onItemSelect(selectedData.item);
        } else if (!value && clearable) {
            onItemSelect(null);
        }
    };
    
    return (
        <Autocomplete
            placeholder={placeholder}
            size={size}
            leftSection={<IconSearch size={16} />}
            data={autocompleteData}
            value={searchValue}
            onChange={setSearchValue}
            onOptionSubmit={handleItemSelection}
            clearable={clearable}
            maxDropdownHeight={200}
            comboboxProps={{ 
                withinPortal: true,
                zIndex: 1000
            }}
            filter={({ options, search }) => {
                if (!search) return options;
                
                return options.filter((option) =>
                    option.label.toLowerCase().includes(search.toLowerCase())
                );
            }}
            renderOption={({ option }) => (
                <Group gap="sm">
                    <Text size="sm">{option.label}</Text>
                </Group>
            )}
        />
    );
}

export default ItemSearch;
