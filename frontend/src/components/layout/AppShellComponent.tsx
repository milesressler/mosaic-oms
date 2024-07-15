import {AppShell, Burger, Group} from "@mantine/core";
import AppShellNavBar from "src/components/layout/navbar/AppShellNavBar.tsx";
import {Link, matchPath, Route, Routes, useLocation} from "react-router-dom";
import {AuthenticationGuard} from "src/components/auth0/AuthenticationGuard.tsx";
import {useDisclosure} from "@mantine/hooks";
import {useAuth0} from "@auth0/auth0-react";
import routes from "src/routesConfig.tsx";
import useApi from "src/hooks/useApi.tsx";
import userApi from "src/services/userApi.tsx";
import {useEffect} from "react";
import mosaicLogo from "src/assets/Mosaic-Church-logo-horizontal-web-dark-180-pad.png";
import UserCard from "src/components/UserCard.tsx";
import {LogoutButton} from "src/components/auth0/LogoutButton.tsx";
import LoginButton from "src/components/auth0/LoginButton.tsx";
import AsideContent from "src/components/layout/aside/AsideContent.tsx";

export function AppShellComponent() {
    const [opened, { toggle, close }] = useDisclosure(false);
    const [asideOpened, asideHandler] = useDisclosure(false);
    const location = useLocation();
    const syncUser = useApi(userApi.syncUser);
    const { user } = useAuth0();

    useEffect(() => {
        if (user) {
            syncUser.request(user?.name, user?.email);
        }
    }, [user]);

    const { isAuthenticated } = useAuth0();

    // Get active route
    const activeRoute = routes
        .flatMap((route: any) => route.children || [route])
        .find((route: any) => matchPath(route.path, location.pathname)) || {};

    useEffect(() => {
        close();
    }, [activeRoute]);



    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{ width: isAuthenticated ? 250 : 0, breakpoint: 'md', collapsed: { mobile: !opened, desktop: activeRoute.navBarHidden ? !opened : false} }}
            aside={{ width: isAuthenticated ? 200 : 0, breakpoint: 'md', collapsed: { mobile: !asideOpened, desktop: !asideOpened || activeRoute.headerHidden},  }}
        >
            { !activeRoute.headerHidden && <AppShell.Header>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            height: '100%',
                            width: '100%',
                            paddingLeft: '10px',
                            paddingRight: '10px',
                        }}
                    >
                        <Group>
                            { !asideOpened && <Burger opened={opened} onClick={toggle} size="sm"
                                    hiddenFrom={!activeRoute.navBarHidden ? "md" : ""}
                            /> }
                            <Link to={"/"}>
                                <img src={mosaicLogo} className="m-logo" alt="Mosaic Church logo"/>
                            </Link>
                        </Group>
                        <Group mr={0} gap={5} visibleFrom={'md'}>
                                {isAuthenticated && <UserCard />}
                                {isAuthenticated && <LogoutButton></LogoutButton>}
                                {!isAuthenticated && <LoginButton></LoginButton>}

                            <Burger opened={asideOpened} onClick={asideHandler.toggle} size="sm" />
                        </Group>
                        { !opened && <Burger opened={asideOpened} onClick={asideHandler.toggle} size="sm" hiddenFrom={'md'} /> }

                    </div>
            </AppShell.Header>
            }
            <AppShell.Main>
                <Routes>
                    {routes.flatMap((route: any) => route.children || [route]).map((route) => {
                        const Element = route.public
                            ? route.element
                            : () => <AuthenticationGuard component={route.element} />;
                        return (
                            <Route
                                key={route.key}
                                path={route.path}
                                element={<Element />}
                                errorElement={route.errorElement && <route.errorElement />}
                            />
                        );
                    })}
                </Routes>
            </AppShell.Main>
             { isAuthenticated && <AppShellNavBar ></AppShellNavBar> }
            <AppShell.Aside>
                <AsideContent/>
            </AppShell.Aside>
        </AppShell>);
}
