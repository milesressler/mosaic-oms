import {useNavigate} from "react-router-dom";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import {Order} from "src/models/types.tsx";
import {Button, Modal} from "@mantine/core";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import QrScanner from "src/components/scanner/QrScanner.tsx";

const AdminOrdersPage = () => {

    const navigate = useNavigate();
    const [opened, { toggle, close }] = useDisclosure(false);
    const isMobile = useMediaQuery('(max-width: 50em)');

    return (
        <>
            <Modal
                opened={opened}
                onClose={close}
                title="Scan the QR code at the top of an order label"
                fullScreen={isMobile}
                transitionProps={{ transition: 'fade', duration: 200 }}
            >
                <QrScanner onOrderScanned={(orderId) => {
                    navigate(`/order/${orderId}`);
                }} />
            </Modal>
            <Button onClick={toggle}>
                { opened ? 'Close Scanner' : 'Scan Label' }
            </Button>

            <OrdersTable view={"admin"}
                         autoRefresh={false}
                         allowPagination={true}
                         onSelectRow={(order: Order) => {
                             navigate(`/order/${order.id}`);
                         }} >
            </OrdersTable>
        </>
    );
};

export default AdminOrdersPage;
