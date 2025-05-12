import useApi from "src/hooks/useApi.tsx";
import { TransitInfoComponent } from "src/components/transit/TransitInfoComponent.tsx";
import { Box, Flex } from "@mantine/core";
import kioskApi from "src/services/kioskApi.tsx";
import { useInterval } from "@mantine/hooks";
import { useEffect } from "react";

export function Transit() {
    const transit = useApi(kioskApi.getTransitInfo);

    const transitInterval = useInterval(
        transit.request,
        15000,
        { autoInvoke: true }
    );

    useEffect(() => {
        transitInterval.start();
        transit.request();
        return transitInterval.stop;
    }, []);

    return (
        <Flex p={'xs'} gap="md" justify="stretch" wrap="nowrap" w="100%">
            {transit.data?.map(transit => (
                <Box key={transit.stopId} style={{ flex: 1 }}>
                    <TransitInfoComponent transitInfo={transit} />
                </Box>
            ))}
        </Flex>
    );
}

export default Transit;
