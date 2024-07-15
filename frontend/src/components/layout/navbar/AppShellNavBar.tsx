import {useAuth0} from "@auth0/auth0-react";
import {AppShell, Box, Code, Collapse, Group, rem, ScrollArea, ThemeIcon, UnstyledButton} from '@mantine/core';
import {Link} from "react-router-dom";
import classes from "src/components/css/HeaderSearch.module.css";
import {
    IconAdjustments,
    IconCalendarStats, IconChevronRight,
    IconFileAnalytics,
    IconGauge, IconLock,
    IconNotes,
    IconPresentationAnalytics
} from "@tabler/icons-react";
import React from "react";
import UserCard from "src/components/UserCard.tsx";
import {LinksGroup} from "src/components/layout/LInksGroup.tsx";
import {Logo} from "src/components/layout/Logo.tsx";


export function AppShellNavBar() {

    const { isAuthenticated } = useAuth0();

    const navbarLinks = [
        {
            label: 'Dashboards',
            icon: IconNotes,
            initiallyOpened: true,
            links: [
                { label: 'Overview', link: '/' },
                { label: 'Forecasts', link: '/' },
                { label: 'Outlook', link: '/' },
                { label: 'Real time', link: '/' },
            ],
        },
        {
            label: 'Admin',
            icon: IconCalendarStats,
            links: [
                { label: 'Users', link: '/admin/users' },
                { label: 'Item Management', link: '/admin/items' },
            ],
        },
        { label: 'Reports', icon: IconAdjustments },
        {
            label: 'Security',
            icon: IconLock,
            links: [
                { label: 'Orders', link: '/reports/orders' },
                // { label: 'Change password', link: '/' },
                // { label: 'Recovery codes', link: '/' },
            ],
        },
    ];


    // const links = !isAuthenticated ? [] : [
    //     {
    //         section: "Dashboards", links: [
    //             { url: '/orders', label: 'Orders (temp)' },
    //             { url: '/dashboard/orders', label: 'Orders' },
    //             { url: '/dashboard/runner', label: 'Runners' },
    //         ]
    //     },
    //     {
    //         section: "Admin", links: [
    //             { url: '/admin/item', label: 'Items' },
    //             { url: '/admin/user', label: 'Users' },
    //         ]
    //     },
    //     {
    //         section: "Reports", links: [
    //             { url: '/reports/orders', label: 'Orders' },
    //         ]
    //     },
    // ];
    const links = navbarLinks.map((item) => <LinksGroup {...item} key={item.label} />);

    return (
        <AppShell.Navbar>
        {/*<nav className={classes.navbar}>*/}
            <div className={classes.header}>
                <Group justify="space-between">
                    <Logo style={{ width: rem(120) }} />
                    <Code fw={700}>v3.1.2</Code>
                </Group>
            </div>

            <ScrollArea className={classes.links}>
                <div className={classes.linksInner}>{links}</div>
            </ScrollArea>

            <div className={classes.footer}>
                {isAuthenticated && <UserCard/>}
                {/*<UserButton />*/}
            </div>
        {/*</nav>*/}
        </AppShell.Navbar>
    );


    //
    // return (
    //     <AppShell.Navbar>
    //         {
    //             links.map((section) => {
    //             return (
    //                 <>
    //                     <AppShell.Section>{section.section}</AppShell.Section>
    //                     { section.links.map(link =>
    //                         <Link to={link.url}
    //                               className={classes.link}
    //                               key={link.url}>
    //                             {link.label}
    //                         </Link>) }
    //                 </>
    //             )
    //         })
    //         }
    //     </AppShell.Navbar>
    // );
}

export default AppShellNavBar;
