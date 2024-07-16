import {AppShell, Burger, Group} from "@mantine/core";
import AppShellNavBar from "src/components/layout/navbar/AppShellNavBar.tsx";
import {Link, matchPath, Route, Routes, useLocation} from "react-router-dom";
import {AuthenticationGuard} from "src/components/auth0/AuthenticationGuard.tsx";
import {useDisclosure} from "@mantine/hooks";
import {useAuth0} from "@auth0/auth0-react";
import routes from "src/routesConfig.tsx";
import useApi from "src/hooks/useApi.tsx";
import {useEffect, useState} from "react";
import mosaicLogo from "src/assets/Mosaic-Church-logo-horizontal-web-dark-180-pad.png";
import UserCard from "src/components/auth0/UserCard.tsx";
import {LogoutButton} from "src/components/auth0/LogoutButton.tsx";
import LoginButton from "src/components/auth0/LoginButton.tsx";
import AsideContent from "src/components/layout/aside/AsideContent.tsx";
import UserApi from "src/services/userApi.tsx";

export function AppShellComponent() {
    const DEFAULT_HEADER_HEIGHT = 60;
    const [opened, { toggle, close }] = useDisclosure(false);
    const [asideOpened, asideHandler] = useDisclosure(false);
    const location = useLocation();
    const syncUserWithToken = useApi(UserApi.syncUserWithToken);
    const { user, getIdTokenClaims, isAuthenticated } = useAuth0();
    const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);

    useEffect(() => {
        const fetchIdToken = async () => {
            if (isAuthenticated && user) {
                const idTokenClaims = await getIdTokenClaims();
                await syncUserWithToken.request( idTokenClaims?.__raw);
            }
        };
        fetchIdToken();
    }, [isAuthenticated, getIdTokenClaims, user]);


    // Get active route
    const activeRoute = routes
        .flatMap((route: any) => route.children || [route])
        .find((route: any) => matchPath(route.path, location.pathname)) || {};

    useEffect(() => {
        close();
    }, [activeRoute]);

    useEffect(() => {
        setHeaderHeight(activeRoute.headerHidden ? 0 : DEFAULT_HEADER_HEIGHT);
    }, [activeRoute]);



    return (
        <AppShell
            header={{ height: activeRoute.headerHidden ? 0 : headerHeight }}
            navbar={{ width: isAuthenticated ? 250 : 0, breakpoint: 'md', collapsed: { mobile: !opened, desktop: activeRoute.navBarHidden ? !opened : false} }}
            aside={{ width: isAuthenticated ? { base: 200, md: 250, lg: 300, xl: 350 } : 0, breakpoint: 'md', collapsed: { mobile: !asideOpened, desktop: !asideOpened || activeRoute.headerHidden || activeRoute.minimalHeader },  }}
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
                            { isAuthenticated && (!asideOpened || activeRoute.minimalHeader) && <Burger opened={opened} onClick={toggle} size="sm"
                                    hiddenFrom={!activeRoute.navBarHidden ? "md" : ""}
                            /> }
                            <Link to={"/"}>
                                <img src={mosaicLogo} className="m-logo" alt="Mosaic Church logo"/>
                            </Link>
                        </Group>
                        { !isAuthenticated &&
                            <Group hiddenFrom={'md'}>
                                <LoginButton></LoginButton>
                            </Group>
                        }
                        {!activeRoute.minimalHeader &&
                        <Group mr={0} gap={5} visibleFrom={'md'}>
                                {isAuthenticated && <UserCard />}
                                {isAuthenticated && <LogoutButton></LogoutButton>}
                                {!isAuthenticated && <LoginButton></LoginButton>}

                            { isAuthenticated && <Burger opened={asideOpened} onClick={asideHandler.toggle} size="sm" /> }
                        </Group> }
                        { isAuthenticated && !activeRoute.minimalHeader  && !opened && <Burger opened={asideOpened} onClick={asideHandler.toggle} size="sm" hiddenFrom={'md'} /> }



                    </div>
            </AppShell.Header>
            }
            <AppShell.Main style={{paddingTop: headerHeight }}>
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
            { isAuthenticated && <AppShell.Aside>
                <AsideContent/>
            </AppShell.Aside> }
        </AppShell>);
}
