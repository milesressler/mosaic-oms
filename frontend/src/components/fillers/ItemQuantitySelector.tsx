import { Box, Slider } from '@mantine/core';

interface Props {
    max: number;
    quantitySelected: number;
    onValueChange: (value: number) => void;
}

function ItemQuantitySelector({ max, onValueChange, quantitySelected }: Props) {
    return (
        <Box mt="sm">
            <Slider
                min={0}
                max={max}
                step={1}
                value={quantitySelected}
                onChangeEnd={onValueChange}
                marks={Array.from({ length: max / 5 }, (_, index) => ({
                    value: (index + 1) * 5,
                    label: (index + 1) * 5,
                }))}
                styles={{ markLabel: { display: 'none' } }}
            />
        </Box>
    );
}

export default ItemQuantitySelector;
