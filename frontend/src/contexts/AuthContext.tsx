import {useAuth0} from "@auth0/auth0-react";
import {useContext, useEffect, useState} from "react";
import {addAccessTokenInterceptor} from "../services/client";
import {createContext} from "react";

export interface AuthContextProps {
    token?: string;
}
export const AuthContext = createContext<AuthContextProps>({


});

export const AuthContextProvider = (props: any) => {
    const { getAccessTokenSilently, isAuthenticated, isLoading} = useAuth0();
    // const stompClient = useStompClient();
    const [token, setToken] = useState("")

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
