import {ScrollArea, AppShell, Stack, Switch, Group, Modal, Badge} from '@mantine/core';
import classes from './NavbarNested.module.css';
import {LinksGroup} from "src/components/layout/navbar/NavBarLinksGroup.tsx";
import UserCard from "src/components/auth0/UserCard.tsx";
import routes from "src/routesConfig.tsx";
import {LogoutButton} from "src/components/auth0/LogoutButton.tsx";
import {useAuth0} from "@auth0/auth0-react";
import LoginButton from "src/components/auth0/LoginButton.tsx";
import {getRolesFromAuth0User} from "src/components/auth0/Auth0Utils.tsx";
import {usePreferences} from "src/contexts/PreferencesContext.tsx";
import {DeviceLogoutButton} from "src/components/admin/devices/DeviceLogoutButton.tsx";
import {IconBrandSlack, IconLink, IconLinkOff, IconSpeakerphone} from "@tabler/icons-react";
import {useStompConnectionStatus} from "src/hooks/useStompConnectionStatus.tsx";
import {useDisclosure} from "@mantine/hooks";
import ChangelogModalContent from "src/components/announcements/ChangelogModalContent.tsx";
import {usePostHog} from "posthog-js/react";
import {useEffect} from "react";


export function NavbarNested() {

    const stompConnected = useStompConnectionStatus();
    const { isAuthenticated, user } = useAuth0();
    const userRoles = getRolesFromAuth0User(user); // Adjust namespace accordingly

    const { notificationsEnabled, setNotificationsEnabled } = usePreferences();
    const hasRequiredRole = (requiredRole: string) => {
        if (!requiredRole) return true;
        return userRoles.includes(requiredRole.toLowerCase());
    };

    const [opened, { open, close }] = useDisclosure(false);
    const posthog = usePostHog();

    useEffect(() => {
        if (opened) {
            posthog?.capture('changelog_opened', { label: 'Changelog Opened' })
        }
    }, [opened]);

    const renderLinks = (routes: any) => {
        const links = routes
            .filter((route: any) => route.showInNavBar !== false && hasRequiredRole(route.requiredRole))
            .map((route: any) => {
                if (route.children) {
                    return {
                        label: route.group,
                        icon: route.icon,
                        initiallyOpened: route.initiallyOpened,
                        onClick: route.onClick, // pass down onClick if defined
                        links: route.children
                            .filter((childRoute: any) => childRoute.showInNavBar !== false)
                            .map((childRoute: any) => ({
                                label: childRoute.title,
                                link: childRoute.path,
                                key: childRoute.key,
                                onClick: childRoute.onClick, // pass down onClick if defined
                            })),
                    };
                } else {
                    return {
                        label: route.title,
                        icon: route.icon,
                        link: route.path,
                        key: route.key,
                        onClick: route.onClick, // pass down onClick if defined

                    };
                }
            });
        links.push(
            {
                label: 'Slack Support',
                icon: IconBrandSlack,
                link: "https://join.slack.com/t/mosaicstreetministry/shared_invite/zt-34n12jsn7-m7FS_hCaHnm9DZ5snp_8Ig",
                key: 'slack_support',
            }
        );
        links.push(
            {
                label: 'Changelog',
                icon: IconSpeakerphone,
                link: "",
                onClick: open,
                key: 'changelog',
                rightSection: <Badge size="sm" color="red">NEW</Badge>,

            }
        );
        return links;
    };

    const links = renderLinks(routes).map((item: any) => (
        <LinksGroup {...item} key={item.label} />
    ));

    return (
        <AppShell.Navbar className={classes.navbar}>
            <Modal opened={opened} onClose={close} title="Changelog" size="xl" scrollAreaComponent={ScrollArea.Autosize}>
                <ChangelogModalContent/>
            </Modal>
            {/*This is a header - probably not needed, but keeping in case*/}
            {/*<div className={classes.header}>*/}
                {/*<Group justify="space-between">*/}
                {/*    <Logo style={{ width: rem(120) }} />*/}
                {/*    <Code fw={700}>v3.1.2</Code>*/}
                {/*</Group>*/}
            {/*</div>*/}

            <ScrollArea className={classes.links}>
                <div className={classes.linksInner}>{links}</div>
            </ScrollArea>


            <Group justify={'space-between'}>
            <Switch
                disabled={!stompConnected}
                my={10}
                label={'Notifications'}
                checked={notificationsEnabled}
                onChange={(event) =>
                    setNotificationsEnabled(event.currentTarget.checked)}
            ></Switch>
                {stompConnected ? <IconLink color={'green'}/> : <IconLinkOff/>}
            </Group>
            <Stack className={classes.footer} hiddenFrom={ 'md'}>
                { isAuthenticated && <UserCard /> }
                { isAuthenticated && <LogoutButton/> }
                { !isAuthenticated && <LoginButton/> }
                { <DeviceLogoutButton /> }
            </Stack>
        </AppShell.Navbar>
    );
}

export default NavbarNested;
