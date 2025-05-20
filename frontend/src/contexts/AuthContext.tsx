import {useAuth0} from "@auth0/auth0-react";
import {useContext, useEffect, useState} from "react";
import {addAccessTokenInterceptor} from "../services/client";
import {createContext} from "react";
import {usePostHog} from "posthog-js/react";

export interface AuthContextProps {
    token?: string;
}
export const AuthContext = createContext<AuthContextProps>({


});

export const AuthContextProvider = (props: any) => {
    const { getAccessTokenSilently, isAuthenticated, isLoading, user} = useAuth0();
    // const stompClient = useStompClient();
    const [token, setToken] = useState("")
    const posthog = usePostHog();

    async function authorizeSocket() {
        try {
            const token = await getAccessTokenSilently();
            setToken(token);
            // If needed: stompClient?.connect(headersUsing(token));
        } catch {
            setToken("");
            }
    }

    useEffect(() => {
        addAccessTokenInterceptor(getAccessTokenSilently);
    }, [getAccessTokenSilently]);

    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            authorizeSocket();
        }
    }, [getAccessTokenSilently, isAuthenticated, isLoading]);

    useEffect(() => {
        if (posthog && isAuthenticated && user) {
            posthog.identify(user.sub, {
                email: user.email,
                name: user.name,
                // any other properties you want to set
            });
        }
    }, [posthog, isAuthenticated, user]);

    return (
        <AuthContext.Provider value={{
            token
        }}>
            {props.children}
        </AuthContext.Provider>
    );
};
export const useAuthContext = (): any => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within a AuthContextProvider');
    }
    return context;
};
