import {AppShell, Box, DEFAULT_THEME} from "@mantine/core";
import AppShellNavBar from "src/components/layout/navbar/AppShellNavBar.tsx";
import {matchPath, Route, Routes, useLocation} from "react-router-dom";
import {AuthenticationGuard} from "src/components/auth0/AuthenticationGuard.tsx";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import {useAuth0} from "@auth0/auth0-react";
import routes from "src/routesConfig.tsx";
import useApi from "src/hooks/useApi.tsx";
import {useEffect, useState} from "react";
import AsideContent from "src/components/layout/aside/AsideContent.tsx";
import UserApi from "src/services/userApi.tsx";
import { SelectedOrderProvider} from "src/context/SelectedOrderContext.tsx";
import { ChatProvider } from "src/context/ChatContext.tsx";
import NotificationsHandler from "src/components/notifications/NotificationsHandler.tsx";
import {usePageTracking} from "src/hooks/usePageTracking.tsx";
import { HeaderLeft } from "src/components/layout/header/HeaderLeft.tsx";
import { HeaderRight } from "src/components/layout/header/HeaderRight.tsx";

const mappedRoutes = routes.flatMap((route: any) => route.children || [route]).map((route) => {
    const Element = route.public
        ? route.element
        : () => <AuthenticationGuard component={route.element} />;
    return (
        <Route
            key={route.key}
            path={route.path}
            element={<Element />}
            errorElement={route.errorElement && <route.errorElement />}
        >
            {
                route.children?.flatMap((child:any) => {
                   return <Route
                        key={child.key} path={child.path}
                        element={<child.element/>}
                        />
            })
        }
        </Route>
    );
});
export function AppShellComponent() {
    usePageTracking();
    const DEFAULT_HEADER_HEIGHT = 60;
    const [opened, { toggle, close }] = useDisclosure(false);
    const [asideOpened, asideHandler] = useDisclosure(false);
    const location = useLocation();
    const syncUserWithToken = useApi(UserApi.syncUserWithToken);
    const { user, isAuthenticated } = useAuth0();
    const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
    const [fullscreen, setFullscreen] = useState(false);
    const [activeRoute, setActiveRoute] = useState(routes[0])

    const fullscreenAvailable = document.fullscreenEnabled;
    const headerIsVisible = (!fullscreen && !activeRoute.isMonitor);
    const isMobile = useMediaQuery(`(max-width: ${DEFAULT_THEME.breakpoints.lg})`);


    useEffect(() => {
        if (isAuthenticated && user) {
            syncUserWithToken.request();

        }
    }, [isAuthenticated, user]);


    useEffect(() => {

        const allRoutes =  routes
            .flatMap((topLevelLinkOrGroup: any) => {
                if (topLevelLinkOrGroup.children) {
                    let mainlinks = topLevelLinkOrGroup.children;
                    mainlinks.forEach((mainlink: any) => {
                        if (mainlink.children) {
                            const childrenWithInheritedProps = mainlink.children.map((child: any) => {
                                child.fullPath = mainlink.path + "/" + child.path;
                                const inheritedProps = {
                                    showInNavBar: mainlink.showInNavBar,
                                    isMonitor: mainlink.isMonitor,
                                }
                                return {...inheritedProps, ...child};
                            })
                            mainlinks = mainlinks.concat(childrenWithInheritedProps);
                        }
                    })
                    return mainlinks;
                } else {
                    return [topLevelLinkOrGroup];
                }
            });
        const matchingRoute = allRoutes
            .find((route: any) => matchPath(route.fullPath ?? route.path, location.pathname)) || {};
        setActiveRoute(matchingRoute);
    }, [location]);

    useEffect(() => {
        setHeaderHeight(headerIsVisible ? DEFAULT_HEADER_HEIGHT : 0);
    }, [activeRoute, fullscreen]);

    useEffect(() => {
        if (isMobile) {
            close();
        }
    }, [activeRoute]);

    useEffect(() => {
        function onFullscreenChange() {
            const fullScreened = Boolean(document.fullscreenElement);
            setFullscreen(fullScreened);
        }
        document.addEventListener('fullscreenchange', onFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
    }, []);


    return (
        <ChatProvider isOpen={asideOpened}>
        <AppShell
            styles={{
                root: { height: '100dvh' },
            }}
            header={{ height: headerIsVisible ? headerHeight : 0 }}
            navbar={{ width: isAuthenticated ? 250 : 0, breakpoint: 'md', collapsed: { mobile: !opened, desktop: !opened || activeRoute.isMonitor} }}
            aside={{ width: isAuthenticated ? { base: 200, md: 250, lg: 300, xl: 350 } : 0, breakpoint: 'md', collapsed: { mobile: !asideOpened, desktop: !asideOpened || activeRoute.isMonitor },  }}
        >
            {headerIsVisible && (
                <AppShell.Header>
                    <Box
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            height: '100%',
                            paddingLeft: '10px',
                            paddingRight: '10px',
                        }}
                    >
                        <HeaderLeft
                            isMonitor={!!activeRoute.isMonitor}
                            opened={opened}
                            onToggle={toggle}
                            onAsideClose={asideHandler.close}
                        />
                        
                        <NotificationsHandler />
                        
                        <HeaderRight
                            isMonitor={!!activeRoute.isMonitor}
                            fullscreen={fullscreen}
                            fullscreenAvailable={fullscreenAvailable}
                            asideOpened={asideOpened}
                            onAsideToggle={asideHandler.toggle}
                            onNavClose={close}
                        />
                    </Box>
                </AppShell.Header>
            )}
            <AppShell.Main style={{
                paddingTop: headerHeight,
                paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
                height: `calc(100dvh - ${headerHeight}px)`,
                overflow: 'auto',
            }}>
                    <SelectedOrderProvider>
                        <Routes>
                            {mappedRoutes}
                        </Routes>
                    </SelectedOrderProvider>
            </AppShell.Main>
             { isAuthenticated &&
                 <AppShellNavBar ></AppShellNavBar> }
            { isAuthenticated &&
                <AppShell.Aside>
                    <AsideContent/>
                </AppShell.Aside> }

        </AppShell>
        </ChatProvider>);
}
