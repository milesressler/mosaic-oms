import {Box, Group, Modal, SegmentedControl, Text, TextInput} from "@mantine/core";
import {useDebouncedValue} from "@mantine/hooks";
import {IconSearch} from "@tabler/icons-react";
import {useFeatures} from "src/context/FeaturesContext.tsx";
import {Order, OrderStatus} from "src/models/types.tsx";
import OrdersTable from "src/components/orders/OrdersTable.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {SelectedOrderProvider, useSelectedOrder} from "src/context/SelectedOrderContext.tsx";
import OrderDetailSection from "src/components/fillers/OrderDetailSection.tsx";
import {OrdersView} from "src/components/orders/OrdersTableConfig.tsx";
import {useState} from "react";
import QrScannerButton from "src/components/scanner/QrScannerButton.tsx";

export function DistributorDashboard() {
    const navigate = useNavigate();
    const { id } = useParams();
    const { selectedOrder } = useSelectedOrder();

    const triggerTableRefresh = () => {
        setForceRefreshTable(prev => !prev);
    }

    const handleUpdateCompleted = () => {
        triggerTableRefresh();
        navigate(`/dashboard/distributor/`);
    }

    const onSelectOrder = (order: Order) => {
        if (id && order.id === +id) {
            navigate(`/dashboard/distributor/`)
        } else {
            navigate(`/dashboard/distributor/order/${order.id}`)
        }
    }
    const [ forceRefreshTable, setForceRefreshTable ] = useState(false);
    const [ search, setSearch ] = useState('');
    const [ debouncedSearch ] = useDebouncedValue(search, 300);
    const { activeSpecialEvent } = useFeatures();
    // 'all', or the running event's uuid to show only its orders
    const [ orderFilter, setOrderFilter ] = useState<string>('all');
    const specialEventFilter = activeSpecialEvent && orderFilter === activeSpecialEvent.uuid ? orderFilter : null;
    const customerName = `${selectedOrder?.customer?.firstName || ''} ${selectedOrder?.customer?.lastName || ''}`.trim()

    return (
        <SelectedOrderProvider>
            <Modal size={'md'}
                   opened={!!selectedOrder}
                   title={
                       <Group gap={'md'}>
                           <Text>{`Order #${selectedOrder?.id} - ${customerName}`}</Text>
                       </Group>
                   }
                   onClose={() => {
                navigate(`/dashboard/distributor/`)}}>
                <OrderDetailSection onUpdate={handleUpdateCompleted}/>            </Modal>
            <>
            <Group p={'xs'} gap={'xs'} wrap={'wrap'}>
                <TextInput
                    placeholder="Search by name"
                    leftSection={<IconSearch size={16}/>}
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                    style={{flex: 1, minWidth: 200}}
                />
                {activeSpecialEvent && (
                    <SegmentedControl
                        value={specialEventFilter ?? 'all'}
                        onChange={setOrderFilter}
                        data={[
                            {label: 'All orders', value: 'all'},
                            {label: activeSpecialEvent.name, value: activeSpecialEvent.uuid},
                        ]}
                    />
                )}
            </Group>
            <OrdersTable
                customerSearch={debouncedSearch}
                specialEventUuid={specialEventFilter}
                statusFilter={[OrderStatus.READY_FOR_CUSTOMER_PICKUP, OrderStatus.IN_TRANSIT]}
                view={OrdersView.DISTRIBUTOR}
                onSelectRow={onSelectOrder}
                showProgressIndicator={true}
                forceRefresh={forceRefreshTable}
                selectedOrderIds={id ? [+id] : null}
                maxNumberOfRecords={20}
                disableSorting={true}
            />
            <Box pos={'absolute'} bottom={20} right={20}>
                <QrScannerButton label={''} onOrderScanned={(order: {id: number, uuid: string}) => {
                    navigate(`/dashboard/distributor/order/${order.id}`)
                }}/>
            </Box>
        </>
    </SelectedOrderProvider>
    )
}
export default DistributorDashboard;
