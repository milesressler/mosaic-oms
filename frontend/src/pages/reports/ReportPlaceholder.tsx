import { LineChart } from '@mantine/charts';
import useApi from "src/hooks/useApi.tsx";
import reportingApi from "src/services/reportingApi.tsx";
import {useEffect} from "react";
import { Box } from '@mantine/core';

export function ReportPlaceholder() {

     const api = useApi(reportingApi.ordersCreated);

    useEffect(() => {
        api.request();
    }, []);

    return(<>
        <Box
            p={'md'}>
            <LineChart
                h={300}
                data={api.data || []}
                dataKey="label"
                series={[
                    { label: 'Orders Created',  name: 'total'},
                ]}
                tickLine="y"
            />
        </Box>
    </>);
}
export default ReportPlaceholder;
