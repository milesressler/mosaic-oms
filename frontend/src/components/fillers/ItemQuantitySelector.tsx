import {Box, Slider} from "@mantine/core";

interface Props {
    max: number;
    onValueChange: (value: number) => void
}
function ItemQuantitySelector({max,onValueChange}: Props) {
    return (<>
    <Box>
        <Slider
            w={'100%'}
            defaultValue={max}
            min={0}
            max={max}
            onChangeEnd={onValueChange}
            step={1}
            marks={Array.from({ length: max/5 }).map((_, index) => ({
                value:  (index + 1) * 5, label: (index + 1) * 5
            }))}
            styles={{ markLabel: { display: 'none' } }}
        />
    </Box>
    </>);
}
export default ItemQuantitySelector;
