import {ActionIcon, Button, Group, Menu, rem, useMantineTheme} from '@mantine/core';
import {IconCheckbox, IconChevronDown, IconNotes, IconPrinter, IconTrash} from '@tabler/icons-react';
import classes from './filler-order-action-button.module.css';
import {OrderDetails, OrderStatus} from "src/models/types.tsx";
import {useAuth0} from "@auth0/auth0-react";
import {useFeatures} from "src/contexts/FeaturesContext.tsx";

interface OrderActionButtonProps {
    loading?: boolean,
    order: (OrderDetails|null),
    toggleAssigned: () => void
    onStateChange: (orderStatus: OrderStatus) => void
}

export function OrderActionButton({ loading, order, onStateChange, toggleAssigned }: OrderActionButtonProps) {


    const theme = useMantineTheme();
    const {user} = useAuth0();
    const assignedToMe = order?.assignee?.externalId === user?.sub;
    const { printOnTransitionToStatus } = useFeatures();

    const buttonStyle = {width: printOnTransitionToStatus === OrderStatus.ACCEPTED ? "166px" : '146px'}


    const disabled = order?.orderStatus === OrderStatus.COMPLETED ||
        order?.orderStatus === OrderStatus.CANCELLED;

    const getButton = () => {
        switch (order?.orderStatus) {
            case OrderStatus.PENDING_ACCEPTANCE:
                return <>
                    <Button
                        style={buttonStyle}
                            loading={loading}
                            leftSection={printOnTransitionToStatus === OrderStatus.ACCEPTED && <IconPrinter/>}
                            onClick={() => onStateChange(OrderStatus.ACCEPTED)}>
                        Accept Order
                    </Button>
                </>
            case OrderStatus.READY_FOR_CUSTOMER_PICKUP:
                return <>
                    <Button style={buttonStyle} loading={loading} onClick={() => onStateChange(OrderStatus.COMPLETED)}>Complete Order</Button>
                </>
            default:
                return <Button style={buttonStyle} loading={loading} onClick={toggleAssigned} >{assignedToMe ? "Unassign" : "Assign to Me"}</Button>
        }
    }

    const options = [

        {
            label: "Complete",
            icon: IconCheckbox,
            action: () => onStateChange(OrderStatus.COMPLETED)
        },
        {
            label: "Cancel Order",
            icon: IconTrash,
            action: () => onStateChange(OrderStatus.CANCELLED)
        },
    ];

    if (order?.orderStatus === OrderStatus.PENDING_ACCEPTANCE) {
        options.push(
            {
                label: "Request Info",
                icon: IconNotes,
                action: () => onStateChange(OrderStatus.NEEDS_INFO)
            });
    }

    if (disabled) {
        return  (<></>);
    }

    return (
        <Group wrap="nowrap" gap={0}>
            {getButton()}
            <Menu transitionProps={{ transition: 'pop' }} position="bottom-end" withinPortal>
                <Menu.Target >
                    <ActionIcon
                        variant="filled"
                        color={theme.primaryColor}
                        size={36}
                        className={classes.menuControl}
                    >
                        <IconChevronDown style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                    </ActionIcon>
                </Menu.Target>
                <Menu.Dropdown>
                    {
                        options.map((option) =>
                                <Menu.Item onClick={option.action}
                                           leftSection={
                                    <option.icon
                                        style={{ width: rem(16), height: rem(16) }}
                                        stroke={1.5}
                                        color={theme.colors.blue[5]}
                                    />
                                }>{option.label}
                        </Menu.Item >
                        )
                    }
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
}

export default OrderActionButton;
