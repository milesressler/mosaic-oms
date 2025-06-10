import { useState } from 'react';
import { Group, Box, Collapse, ThemeIcon, UnstyledButton, rem } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import classes from './NavbarLinksGroup.module.css';
import {Link, matchPath, useLocation} from "react-router-dom";
import routes from "src/routesConfig.tsx";

interface LinksGroupProps {
    icon: React.FC<any>;
    rightSection?: React.ReactNode;
    label: string;
    onClick?: () => void;
    key: string;
    initiallyOpened?: boolean;
    links?: {    rightSection?: React.ReactNode,
        label: string; link: string, key: string, onClick?: () => void, }[];
    link?: string; // New prop for the group's link
}

export function LinksGroup({ onClick, icon: Icon, rightSection, label, initiallyOpened, links, link }: LinksGroupProps) {
    const location = useLocation();


    // Get active route
    const activeRoute = routes
        .flatMap((route: any) => route.children || [route])
        .find((route: any) => matchPath(route.path, location.pathname)) || {};

    const hasLinks = Array.isArray(links);
    const [opened, setOpened] = useState(true);
    const items = (hasLinks ? links : []).map((link) => (
         link.onClick ?
             <UnstyledButton  w="calc(100% - var(--mantine-spacing-xl))" onClick={link.onClick} className={classes.link}>
                 <Group justify='space-between'>
                     <span>{link.label}</span>
                     {link.rightSection}
                 </Group>
             </UnstyledButton>
             :
        <Link onClick={link.onClick} className={classes.link} key={link.key} to={link.link}
              data-active={link.key === activeRoute.key || undefined}
        >
            {link.label}
        </Link>
    ));

    const controlContent = (
        <>
            <Group justify="space-between" gap={0}>
                <Box style={{ display: 'flex', alignItems: 'center' }}>
                    <ThemeIcon variant="light" size={30}>
                        <Icon style={{ width: rem(18), height: rem(18) }} />
                    </ThemeIcon>
                    <Box ml="md">{label}</Box>
                </Box>
                {rightSection}
                {hasLinks && (
                    <IconChevronRight
                        className={classes.chevron}
                        stroke={1.5}
                        style={{
                            width: rem(16),
                            height: rem(16),
                            transform: opened ? 'rotate(-90deg)' : 'none',
                        }}
                    />
                )}
            </Group>
        </>
    );
    return (
        <>
            {onClick ? (
                <UnstyledButton onClick={onClick} className={classes.control}>
                    {controlContent}
                </UnstyledButton>
            ) : link && !hasLinks ? (
                <Link to={link} className={classes.control}>
                    {controlContent}
                </Link>
            ) : (
                <UnstyledButton onClick={() => setOpened((o) => !o)} className={classes.control}>
                    {controlContent}
                </UnstyledButton>
            )}
            {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}

        </>
    );
}

export default LinksGroup;
