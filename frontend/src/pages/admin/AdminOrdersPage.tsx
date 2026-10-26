import {useNavigate, useSearchParams} from "react-router-dom";
import {Category, categoryDisplayNames, OrderDetails, OrderItem, OrderStatus} from "src/models/types.tsx";
import {
    Avatar,
    Badge,
    Box,
    Center,
    Checkbox,
    Divider,
    Group, Image,
    Pagination, rem, Select, Stack, Switch,
    Table, Text,
    TextInput, UnstyledButton
} from "@mantine/core";
import {useDebouncedValue} from "@mantine/hooks";
import {IconChevronDown, IconChevronUp, IconPencil, IconSearch, IconSelector, IconX} from "@tabler/icons-react";
import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import itemsApi from "src/services/itemsApi.tsx";
import {useEffect, useState} from "react";
import {DateTime} from "luxon";
import groupmeImage from "src/assets/groupme_icon.png";
import StatusBadge from "src/components/StatusBadge.tsx";
import classes from "src/components/orders/TableSort.module.css";
import {statusDisplay} from "src/utils/StatusUtils.tsx";
import QrScannerButton from "src/components/scanner/QrScannerButton.tsx";
import GroupedAttributeBadges from "src/components/common/items/GroupedAttributeBadges.tsx";


type AttributeDisplay = string | { value: string; displayValue: string };

// Statuses where packing is done, so the filled quantity is final
const PACKED_STATUSES: OrderStatus[] = [OrderStatus.PACKED, OrderStatus.IN_TRANSIT, OrderStatus.READY_FOR_CUSTOMER_PICKUP, OrderStatus.COMPLETED];

const ATTR_PARAM_PREFIX = 'attr.';

interface ThProps {
    field?: string
    children: React.ReactNode;
}

const AdminOrdersPage = () => {

    const navigate = useNavigate();
    const getOrders = useApi(ordersApi.getOrdersWithDetails);
    const suggestedItemsApi = useApi(itemsApi.getSuggestedItems);
    const [searchParams, setSearchParams] = useSearchParams();

    // Get page from URL or default to 1
    const customerUuidFilter = searchParams.get('customerUuid') || null;
    const page = Number(searchParams.get("page")) || 1;
    const orderId = Number(searchParams.get("orderId")) || '';
    const sortField = searchParams.get("sort") || 'created';
    const reversed = (searchParams.get("direction") || 'desc') === 'desc';
    const statusFilter = searchParams.get("status") || null;
    const onlyMyOrdersFilter = searchParams.get("onlyMyOrders") === "true";
    const customerFilter = searchParams.get("customer") || null;
    const itemIdFilter = Number(searchParams.get("itemId")) || null;
    // Size and other attribute filters are kept in the URL as attr.<key>=<value>, e.g. attr.size=13
    const attrFilters: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        if (key.startsWith(ATTR_PARAM_PREFIX) && value) {
            attrFilters[key.slice(ATTR_PARAM_PREFIX.length)] = value;
        }
    });
    const attrParam = Object.entries(attrFilters).map(([key, value]) => `${key}:${value}`).join(',');
    const [customerSearchString, setCustomerSearchString] = useState(customerFilter);

    // Role action filter state
    const myOrdersActionsParam = searchParams.get("myOrdersActions");
    const [myOrdersActions, setMyOrdersActions] = useState<string[]>(
        myOrdersActionsParam ? myOrdersActionsParam.split(',') : ['created', 'packed', 'transported', 'distributed']
    );

    const [debouncedCustomer] = useDebouncedValue(customerSearchString, 300);


    useEffect(() => {
        getOrders.request({
            status: statusFilter,
            page: page - 1,
            orderId: orderId,
            size: 10,
            sort: `${sortField},${reversed ? 'desc' : 'asc'}`,
            customer: customerFilter,
            customerUuid: customerUuidFilter,
            onlyMyOrders: onlyMyOrdersFilter,
            myOrdersActions: onlyMyOrdersFilter && myOrdersActions.length > 0 ? myOrdersActions.join(',') : undefined,
            itemId: itemIdFilter ?? undefined,
            attr: itemIdFilter && attrParam ? attrParam : undefined,
        });
    }, [page, sortField, reversed, statusFilter, customerFilter, customerUuidFilter, orderId, onlyMyOrdersFilter, myOrdersActions, itemIdFilter, attrParam]);

    useEffect(() => {
        suggestedItemsApi.request();
    }, []);

    const itemOptions = Object.entries(suggestedItemsApi.data ?? {}).map(([category, items]) => ({
        group: categoryDisplayNames[category as Category] ?? category,
        items: items.map((item) => ({value: item.id.toString(), label: item.description})),
    }));
    const selectedItem = Object.values(suggestedItemsApi.data ?? {}).flat().find((item) => item.id === itemIdFilter);
    const filterableAttributes = (selectedItem?.attributes ?? [])
        .filter((attr) => (attr.type === 'SINGLE_SELECT' || attr.type === 'MULTI_SELECT') && attr.options.length > 0);

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (debouncedCustomer) {
            params.set("customer", debouncedCustomer);
        } else {
            params.delete('customer');
        }
        // Optionally reset page when status filter changes:
        params.set("page", "1");
        setSearchParams(params, { replace: true });
    }, [debouncedCustomer]);

    // Sync myOrdersActions with URL on initial load
    useEffect(() => {
        if (myOrdersActionsParam) {
            const actions = myOrdersActionsParam.split(',');
            setMyOrdersActions(actions);
        }
    }, [myOrdersActionsParam]);

    const setOrderId = (orderId: string) => {
        const params = new URLSearchParams(searchParams);
        if (orderId) {
            params.set("orderId", orderId);
        } else {
            params.delete('orderId');
        }
        setSearchParams(params, { replace: true });
    };
    const setPage = (page: number) => {
        const params = new URLSearchParams(searchParams);
        params.set("page", page.toString());
        setSearchParams(params, { replace: true });
    };
    const setSort = (field: string, reversed: boolean) => {
        const params = new URLSearchParams(searchParams);
        params.set("sort", field);
        params.set("direction", reversed ? "desc" : "asc");
        // Optionally reset page when sort changes:
        params.set("page", "1");
        setSearchParams(params, { replace: true });
    };

    const setStatusSearch = (orderStatus: string|null) => {
        const params = new URLSearchParams(searchParams);
        if (!orderStatus) {
            params.delete('status');
        } else  {
            params.set("status", orderStatus);
        }
        // Optionally reset page when status filter changes:
        params.set("page", "1");
        setSearchParams(params, { replace: true });
    };
    const setCustomerUuid = (uuid: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (!uuid) {
            params.delete('customerUuid');
        } else {
            params.set('customerUuid', uuid);
        }
        params.set('page', '1'); // reset pagination
        setSearchParams(params, { replace: true });
    };

    const setItemFilter = (itemId: string | null) => {
        const params = new URLSearchParams(searchParams);
        // Attribute filters belong to the previous item
        [...params.keys()].filter((key) => key.startsWith(ATTR_PARAM_PREFIX)).forEach((key) => params.delete(key));
        if (itemId) {
            params.set('itemId', itemId);
        } else {
            params.delete('itemId');
        }
        params.set('page', '1');
        setSearchParams(params, { replace: true });
    };

    const setAttrFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(ATTR_PARAM_PREFIX + key, value);
        } else {
            params.delete(ATTR_PARAM_PREFIX + key);
        }
        params.set('page', '1');
        setSearchParams(params, { replace: true });
    };

    // Lines on the order for the filtered item, narrowed to the chosen sizes when the stored values line up
    const matchingLines = (order: OrderDetails): OrderItem[] => {
        const lines = (order.items ?? []).filter((line) => line.item?.id === itemIdFilter);
        const narrowed = lines.filter((line) => Object.entries(attrFilters).every(([key, expected]) => {
            const actual = (line.attributes as Record<string, AttributeDisplay>)[key];
            const values = typeof actual === 'string' ? [actual] : actual ? [actual.value, actual.displayValue] : [];
            return values.some((value) => value?.toLowerCase() === expected.toLowerCase());
        }));
        return narrowed.length > 0 ? narrowed : lines;
    };

    const renderFill = (order: OrderDetails, line: OrderItem) => {
        if (!PACKED_STATUSES.includes(order.orderStatus)) {
            return <Badge size="sm" variant="light" color="gray">{line.quantityRequested} requested</Badge>;
        }
        const fulfilled = line.quantityFulfilled ?? 0;
        if (fulfilled >= line.quantityRequested) {
            return <Badge size="sm" variant="light" color="green">{fulfilled} received</Badge>;
        }
        return (
            <Badge size="sm" variant="light" color="orange">
                {fulfilled === 0 ? 'Not filled' : `${fulfilled} of ${line.quantityRequested}`}
            </Badge>
        );
    };

    const setOnlyMyOrders = (val: boolean) => {
        const params = new URLSearchParams(searchParams);
        console.log(val);
        if (val) {
            params.set('onlyMyOrders', 'true');
            // When enabling, default to all actions selected
            const allActions = ['created', 'packed', 'transported', 'distributed'];
            setMyOrdersActions(allActions);
            params.set('myOrdersActions', allActions.join(','));
        } else {
            params.delete('onlyMyOrders');
            params.delete('myOrdersActions');
            setMyOrdersActions(['created', 'packed', 'transported', 'distributed']);
        }
        setSearchParams(params, { replace: true });
    }

    const handleMyOrdersActionsChange = (actions: string[]) => {
        setMyOrdersActions(actions);
        updateMyOrdersActionsParam(actions);
    }

    const updateMyOrdersActionsParam = (actions: string[]) => {
        const params = new URLSearchParams(searchParams);
        if (actions.length > 0) {
            params.set('myOrdersActions', actions.join(','));
        } else {
            params.delete('myOrdersActions');
        }
        params.set('page', '1'); // reset pagination
        setSearchParams(params, { replace: true });
    }

    function Th({ field, children }: ThProps) {
        const isSorted = field === sortField;
        const Icon = isSorted ? (!reversed ? IconChevronUp : IconChevronDown) : IconSelector;
        return (
            <Table.Th className={classes.th}>
                {field &&
                <UnstyledButton onClick={() => field && setSort(field || '', isSorted ? !reversed : true)}
                    className={classes.control}>
                    <Group justify="space-between">
                        <Text fw={isSorted ? 'bold' : 500} fz="sm">
                            {children}
                        </Text>
                        <Center className={classes.icon}>
                             <Icon style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                        </Center>
                    </Group>
                </UnstyledButton>
                }
                {!field && <Box className={classes.nosort}>
                    <Text fw={500} fz="sm">
                        {children}
                    </Text>
                </Box>
                }

            </Table.Th>
        );
    }

    const rows = getOrders.data?.content?.map((order: OrderDetails) => (
        <>
            {/*<LoadingOverlay visible={getOrders.loading}/>*/}
            <Table.Tr key={order.uuid} pos={'relative'} onClick={() =>  navigate(`/order/${order.id}`)} >
                <Table.Td><><Group justify={'flex-start'} gap={5}>
                    <Avatar src={order?.assignee?.avatar}  color={order.assignee && !order.assignee?.avatar ? 'indigo' : ''}  size={'sm'} />
                    <Text size={'sm'} c={order.assignee ? '' : 'dimmed'}>
                        {order.assignee?.name ?? 'Unassigned'}
                    </Text></Group></></Table.Td>
                <Table.Td>{order.id}  { order.postedToGroupMe && <Image w={16} h={16} src={groupmeImage}></Image> } </Table.Td>
                <Table.Td>{order.customer.firstName} {order.customer.lastName}</Table.Td>
                {itemIdFilter && (
                    <Table.Td>
                        <Stack gap={4}>
                            {matchingLines(order).map((line) => (
                                <Group key={line.id} gap="xs" wrap="nowrap">
                                    {Object.keys(line.attributes ?? {}).length > 0 && (
                                        <GroupedAttributeBadges attrs={line.attributes} itemAttributes={line.item.attributes}/>
                                    )}
                                    {renderFill(order, line)}
                                </Group>
                            ))}
                        </Stack>
                    </Table.Td>
                )}
                <Table.Td> <>
                    <Text>{DateTime.fromISO(order.created).toLocaleString(DateTime.TIME_SIMPLE)}</Text>
                    <Text c={"dimmed"} size={'xs'}>{DateTime.fromISO(order.created).toLocaleString(DateTime.DATE_MED)}</Text>
                </></Table.Td>
                <Table.Td>
                    <div>
                        <StatusBadge orderStatus={order.orderStatus} />
                        <Text c={'dimmed'} size={'xs'}>{DateTime.fromISO(order.lastStatusChange?.timestamp).toRelative()}</Text>
                    </div>
                </Table.Td>
                <Table.Td>
                    { [OrderStatus.PENDING_ACCEPTANCE, OrderStatus.NEEDS_INFO].indexOf(order.orderStatus) !== -1 &&
                        <IconPencil style={{cursor: 'pointer'}} color={'gray'} onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/taker/${order.id}`);}}/>
                    }
                </Table.Td>
            </Table.Tr>
        </>
    ));

    return (
        <>
            <Stack gap="xs" m="xs">
                {/* Row 1: 3 input boxes + QR scanner */}
                <Group justify="space-between" wrap="wrap" style={{ flex: 1 }}>
                    <Group gap="sm" style={{ flex: 1 }} wrap="wrap">
                        <TextInput
                            placeholder="Search customer name"
                            leftSection={<IconSearch size={16} stroke={1.5} />}
                            value={customerSearchString || ''}
                            onChange={(e) => setCustomerSearchString(e.currentTarget.value)}
                            style={{ flex: 1, minWidth: 200 }}
                        />
                        <Select
                            data={[OrderStatus.PENDING_ACCEPTANCE, OrderStatus.ACCEPTED, OrderStatus.PACKED, OrderStatus.READY_FOR_CUSTOMER_PICKUP, OrderStatus.NEEDS_INFO, OrderStatus.CANCELLED, OrderStatus.COMPLETED].map(status => {
                                return { label: statusDisplay(status), value: status.toString() }
                            })}
                            placeholder="Filter by status"
                            value={statusFilter}
                            onChange={(val: string|null) => (setStatusSearch(val))}
                            style={{ flex: 1, minWidth: 150 }}
                        />
                        <TextInput
                            placeholder="Order ID"
                            leftSection={<IconSearch size={16} stroke={1.5} />}
                            value={orderId || ''}
                            type={'number'}
                            onChange={(e) => setOrderId(e.currentTarget.value)}
                            style={{ minWidth: 120 }}
                            visibleFrom="sm"
                        />
                        {customerUuidFilter && (
                            <Badge
                                size={'md'}
                                rightSection={
                                    <IconX
                                        size={16}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setCustomerUuid(null)}
                                    />
                                }
                                variant="outline"
                            >
                                Customer:
                                <Text span ml={4}>
                                    {customerUuidFilter.slice(0, 8)}…
                                </Text>
                            </Badge>
                        )}
                    </Group>
                    <QrScannerButton onOrderScanned={(order: {id: number, uuid: string}) => {
                        navigate(`/order/${order.id}`);
                    }}/>
                </Group>

                {/* Item filter: who asked for this item, optionally in a given size */}
                <Group gap="sm" wrap="wrap">
                    <Select
                        data={itemOptions}
                        placeholder="Filter by item"
                        searchable
                        clearable
                        value={itemIdFilter ? itemIdFilter.toString() : null}
                        onChange={setItemFilter}
                        style={{ flex: 1, minWidth: 200, maxWidth: 320 }}
                    />
                    {itemIdFilter && filterableAttributes.map((attr) => {
                        const current = attrFilters[attr.key];
                        // Links from reports may use the display value, so match either
                        const option = current
                            ? attr.options.find((o) => [o.value, o.label].some((v) => v.toLowerCase() === current.toLowerCase()))
                            : undefined;
                        const data = attr.options.map((o) => ({value: o.value, label: o.label}));
                        if (current && !option) {
                            data.push({value: current, label: current});
                        }
                        return (
                            <Select
                                key={attr.key}
                                data={data}
                                placeholder={`Any ${attr.label.toLowerCase()}`}
                                aria-label={attr.label}
                                searchable
                                clearable
                                value={option?.value ?? current ?? null}
                                onChange={(value) => setAttrFilter(attr.key, value)}
                                style={{ minWidth: 140, maxWidth: 200 }}
                            />
                        );
                    })}
                </Group>

                {/* Row 2: Switch + action checkboxes */}
                <Group gap="sm">
                    <Switch
                        id={'onlyMyOrdersToggle'}
                        label={"Only orders that I've handled"}
                        checked={onlyMyOrdersFilter}
                        onChange={(e) => setOnlyMyOrders(e.currentTarget.checked)}
                    />
                    {onlyMyOrdersFilter && (
                        <>
                            <Divider orientation="vertical" />
                            <Checkbox.Group
                                value={myOrdersActions}
                                onChange={handleMyOrdersActionsChange}
                            >
                                <Group gap="xs">
                                    <Checkbox value="created" label="Created" size="sm" />
                                    <Checkbox value="packed" label="Packed" size="sm" />
                                    <Checkbox value="transported" label="Transported" size="sm" />
                                    <Checkbox value="distributed" label="Distributed" size="sm" />
                                </Group>
                            </Checkbox.Group>
                        </>
                    )}
                </Group>
            </Stack>
            <Table pos={'relative'}>
                <Table.Thead>
                    <Table.Tr>
                        <Th key={'assignee'} field={'assignee.name'}>Assignee</Th>
                        <Th
                            key={'id'}
                            field={'id'}>
                            <>Order #</>
                        </Th>
                        <Th key={'customer'} field={'customer.lastName'}>Customer</Th>
                        {itemIdFilter && <Th key={'matching'}>{selectedItem?.description ?? 'Matching item'}</Th>}
                        <Th
                            key={'created'}
                            field={'created'}>
                            <>Created</>
                        </Th>
                        <Th key={'status'}>Status</Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {rows}
                </Table.Tbody>
            </Table>
            { (getOrders.data?.totalPages ?? 0) > 1 && <Center><Pagination value={page} onChange={setPage} total={getOrders.data?.totalPages ?? 0} /></Center> }
        </>
    );
};

export default AdminOrdersPage;
