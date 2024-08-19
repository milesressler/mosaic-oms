import {OrderStatus} from "src/models/types.tsx";
import {Button, Group, Paper, Text} from "@mantine/core";
import {useSelectedOrder} from "src/contexts/SelectedOrderContext.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {useAuth0} from "@auth0/auth0-react";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";

export function OrderItemListView({}) {
    const {selectedOrder} = useSelectedOrder();
    const {user} = useAuth0();
    const changeAssigneeApi = useApi(ordersApi.changeAssignee);
    const navigate = useNavigate();
    const assignedToMe = selectedOrder?.assignee?.externalId === user?.sub;
    const {id} = useParams();

    const unassign = () => {
        changeAssigneeApi.request(selectedOrder!.uuid, true);
    }

    const toggleAssigned = () => {
        if (assignedToMe) {
            return unassign();
        } else {
            return changeAssigneeApi.request(selectedOrder!.uuid, false);
        }
    }

    const startFilling = () => {
        if (!assignedToMe) {
            toggleAssigned()
            navigate(`/dashboard/filler/fill/${id}`);
        } else {
            navigate(`/dashboard/filler/fill/${id}`);
        }
    }
    return (
        <>

            {selectedOrder?.orderStatus === OrderStatus.ACCEPTED && <Group grow my={10}>
                <Button onClick={startFilling} disabled={!assignedToMe}>
                    Begin Filling
                </Button>
            </Group>}
            <Paper shadow="xs" mt={5}>
                {selectedOrder?.items?.map((item) => {
                    return (
                        <div key={item.id}>
                            <Text span fw={500}> {item.quantityRequested}</Text> {item.description} &nbsp;
                            <Text span c={'dimmed'}>{item.notes}</Text>
                        </div>
                    )
                })}
            </Paper>
        </>
    );
}

export default OrderItemListView;
