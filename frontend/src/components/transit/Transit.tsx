import useApi from "src/hooks/useApi.tsx";
import {TransitInfoComponent} from "src/components/transit/TransitInfoComponent.tsx";
import {Box} from "@mantine/core";
import kioskApi from "src/services/kioskApi.tsx";
import {useInterval} from "@mantine/hooks";
import {useEffect} from "react";

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
        <Box px={'10px'}>
            {transit.data?.map(transit =>
                <TransitInfoComponent key={transit.stopId} transitInfo={transit}/>)}
        </Box>);
}

export default Transit
