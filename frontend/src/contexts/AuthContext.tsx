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
    const { getAccessTokenSilently } = useAuth0();
    // const stompClient = useStompClient();
    const [token, setToken] = useState("")

    async function authorizeSocket() {
        const token: string = await getAccessTokenSilently();
        setToken(token);

    }

    useEffect(() => {
        addAccessTokenInterceptor(getAccessTokenSilently);
        authorizeSocket();
    }, [getAccessTokenSilently]);

    // useEffect(() => {
    //     console.log(`${!!token} ${!!stompClient}`);
    //     if (token && stompClient) {
    //         stompClient.publish({
    //             destination: "/app/authorize",
    //             body: token,
    //         });
    //     }
    //
    // }, [token, stompClient]);

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
