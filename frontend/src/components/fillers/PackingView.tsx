import {Box, isNumberLike, LoadingOverlay} from "@mantine/core";
import OrderInfoBlock from "src/components/orders/OrderInfoBlock.tsx";
import {useSelectedOrder} from "src/contexts/SelectedOrderContext.tsx";
import {useAuth0} from "@auth0/auth0-react";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {useParams} from "react-router-dom";
import {useEffect} from "react";

function PackingView({}) {
    const {user} = useAuth0();
    const orderDetailApi = useApi(ordersApi.getOrderById);
    const updateStateApi = useApi(ordersApi.updateOrderStatus);
    const changeAssigneeApi = useApi(ordersApi.changeAssignee);
    const { id } = useParams();


    useEffect(() => {
        if (id && isNumberLike(id)) {
            orderDetailApi.request(+id);
        }
    }, [id, updateStateApi.data, changeAssigneeApi.data]);

    const isLoading = changeAssigneeApi.loading ||
        orderDetailApi.loading ||
        updateStateApi.loading;

    return(<>

        <Box pos="relative" p={10}>
            <LoadingOverlay visible={isLoading}
                            zIndex={1000}
                            overlayProps={{ radius: "sm", blur: 2 }} />
            <OrderInfoBlock
                loading={isLoading}
                orderDetails={orderDetailApi.data}
                // toggleAssigned={toggleAssigned}
                // changeState={changeState}
            ></OrderInfoBlock>
        </Box>
        </>)
}
export default PackingView;
