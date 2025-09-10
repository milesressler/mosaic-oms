import { Group } from "@mantine/core";
import { useAuth0 } from "@auth0/auth0-react";
import { IconArrowsMaximize, IconArrowsMinimize } from "@tabler/icons-react";
import UserCard from "src/components/auth0/UserCard.tsx";
import { LogoutButton } from "src/components/auth0/LogoutButton.tsx";
import LoginButton from "src/components/auth0/LoginButton.tsx";
import { DeviceLogoutButton } from "src/components/admin/devices/DeviceLogoutButton.tsx";
import ChatIconWithNotifications from "src/components/chat/ChatIconWithNotifications.tsx";
import NotificationDropdown from "src/components/notifications/NotificationDropdown.tsx";

interface HeaderRightProps {
    isMonitor: boolean;
    fullscreen: boolean;
    fullscreenAvailable: boolean;
    asideOpened: boolean;
    onAsideToggle: () => void;
    onNavClose: () => void;
}

export function HeaderRight({ 
    isMonitor, 
    fullscreen, 
    fullscreenAvailable, 
    asideOpened, 
    onAsideToggle, 
    onNavClose 
}: HeaderRightProps) {
    const { isAuthenticated } = useAuth0();

    const handleAsideToggle = () => {
        onAsideToggle();
        onNavClose();
    };

    if (isMonitor) {
        return (
            <Group mr={0} gap={5} visibleFrom="md">
                {fullscreenAvailable && !fullscreen && (
                    <IconArrowsMaximize 
                        cursor="pointer" 
                        onClick={() => document.body.requestFullscreen()} 
                    />
                )}
                {fullscreenAvailable && fullscreen && (
                    <IconArrowsMinimize 
                        cursor="pointer" 
                        onClick={() => document.exitFullscreen()} 
                    />
                )}
            </Group>
        );
    }

    return (
        <>
            {/* Desktop Controls */}
            <Group mr={0} gap={5} visibleFrom="md">
                {isAuthenticated && <UserCard />}
                {isAuthenticated && <LogoutButton />}
                {!isAuthenticated && <LoginButton />}
                <DeviceLogoutButton />
                
                {isAuthenticated && <NotificationDropdown />}
                {isAuthenticated && (
                    <ChatIconWithNotifications
                        asideOpened={asideOpened}
                        onToggle={handleAsideToggle}
                        size={18}
                    />
                )}
            </Group>

            {/* Mobile Controls */}
            {isAuthenticated && (
                <Group hiddenFrom="md" gap={5} style={{ minWidth: 0, flex: '0 0 auto' }}>
                    <NotificationDropdown size={18} />
                    <ChatIconWithNotifications
                        asideOpened={asideOpened}
                        onToggle={handleAsideToggle}
                        size={18}
                    />
                </Group>
            )}

            {/* Mobile Login (when not authenticated) */}
            {!isAuthenticated && (
                <Group hiddenFrom="md">
                    <LoginButton />
                </Group>
            )}
        </>
    );
}