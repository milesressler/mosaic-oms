import {LogoutButton} from "./auth0/LogoutButton.tsx";
import useApi from "../hooks/useApi";
import userApi from "../services/userApi";
import {useAuth0} from "@auth0/auth0-react";
import {useEffect} from "react";
import {Group, Burger, Text} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import classes from './css/HeaderSearch.module.css';
import mosaicLogo from "../assets/Mosaic-Church-logo-horizontal-web-dark-180-pad.png";
import {Link} from "react-router-dom";
import LoginButton from "./auth0/LoginButton.tsx";
import UserCard from "./UserCard.tsx";



const links = [
    { link: '/orders', label: 'Orders' },
    // { link: '/pricing', label: 'Pricing' },
    // { link: '/learn', label: 'Learn' },
    // { link: '/community', label: 'Community' },
];

export function NavigationBar() {
    const [opened, { toggle }] = useDisclosure(false);

    const syncUser = useApi(userApi.syncUser);
    const { user } = useAuth0();
    useEffect(() => {
        if (user) {
            syncUser.request(user?.name, user?.email);
        }
    }, [user]);

    const { isAuthenticated } = useAuth0();

    const items = links.map((link) => (
        <Link to={link.link}
              className={classes.link}
              key={link.link}
        >{link.label}</Link>
    ));

    return (
        <header className={classes.header}>
            <div className={classes.inner}>
                <Group>
                    <Link to={"/orders"}>
                        <img src={mosaicLogo} className="m-logo" alt="Mosaic Church logo"/>

                    </Link>
                    <Text>OMS</Text>
                    { isAuthenticated && items }
                </Group>

                <Group>
                    <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="md"/>
                </Group>

                <Group mr={0} gap={5} visibleFrom="md">
                    {isAuthenticated && <UserCard/>}
                    {isAuthenticated && <LogoutButton></LogoutButton>}
                    {!isAuthenticated && <LoginButton></LoginButton>}
                </Group>

            </div>
        </header>
    );
}

export default NavigationBar;
