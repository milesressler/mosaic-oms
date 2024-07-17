import useApi from "src/hooks/useApi.tsx";
import transitApi from "src/services/transitApi.tsx";
import {useEffect} from "react";
import {TransitInfoComponent} from "src/components/transit/TransitInfoComponent.tsx";
import {Box} from "@mantine/core";

export function Transit() {
    const transit = useApi(transitApi.getTransitInfo);
    useEffect(() => {
        // Initial request
        transit.request();

        // Set up the interval to refresh every 30 seconds (30000 milliseconds)
        const interval = setInterval(() => {
            transit.request();
        }, 30000);

        // Clean up the interval on component unmount
        return () => clearInterval(interval);
    }, []);

    return (<Box px={'10px'}>
        {transit.data?.map(transit => <TransitInfoComponent transitInfo={transit}/>)}
        </Box>);
}

export default Transit
