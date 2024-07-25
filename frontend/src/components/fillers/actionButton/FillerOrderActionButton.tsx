import {ActionIcon, Button, Group, Menu, rem, useMantineTheme} from '@mantine/core';
import {IconChevronDown, IconNotes, IconSquareX, IconTrash} from '@tabler/icons-react';
import classes from './filler-order-action-button.module.css';
import {OrderDetails, OrderStatus} from "src/models/types.tsx";
import {useAuth0} from "@auth0/auth0-react";

interface FillerOrderActionButtonProps {
    loading?: boolean,
    order: (OrderDetails|null),
    toggleAssigned: () => void
    onStateChange: (orderStatus: OrderStatus) => void
}

export function FillerOrderActionButton({ loading, order, onStateChange, toggleAssigned }: FillerOrderActionButtonProps) {
    const theme = useMantineTheme();
    const buttonStyle = {width: "130px"}
    const {user} = useAuth0();
    const assignedToMe = order?.assignee?.externalId === user?.sub;


    const getButton = () => {
        switch (order?.orderStatus) {
            case OrderStatus.PENDING_ACCEPTANCE:
                return <>
                    <Button style={buttonStyle} loading={loading} onClick={() => onStateChange(OrderStatus.ACCEPTED)}>Accept Order</Button>
                </>
            case OrderStatus.ACCEPTED:
                return <Button style={buttonStyle} loading={loading} onClick={toggleAssigned} >{assignedToMe ? "Unassign" : "Assign to Me"}</Button>
            default:
                return <></>
        }
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
                    <Menu.Item onClick={() => onStateChange(OrderStatus.REJECTED)}
                        leftSection={
                            <IconSquareX
                                style={{ width: rem(16), height: rem(16) }}
                                stroke={1.5}
                                color={theme.colors.blue[5]}
                            />
                        }
                    >
                        Reject
                    </Menu.Item >
                    <Menu.Item onClick={() => onStateChange(OrderStatus.NEEDS_INFO)}
                        leftSection={
                            <IconNotes
                                style={{ width: rem(16), height: rem(16) }}
                                stroke={1.5}
                                color={theme.colors.blue[5]}
                            />
                        }
                    >
                        Needs Info
                    </Menu.Item>
                    <Menu.Item onClick={() => onStateChange(OrderStatus.CANCELLED)}
                        leftSection={
                            <IconTrash
                                style={{ width: rem(16), height: rem(16) }}
                                stroke={1.5}
                                color={theme.colors.blue[5]}
                            />
                        }
                    >
                        Cancel
                    </Menu.Item>
                </Menu.Dropdown>
            </Menu>
        </Group>
    );
}

export default FillerOrderActionButton;
