import {useAuth0} from "@auth0/auth0-react";
import {useEffect} from "react";
import {addAccessTokenInterceptor} from "../services/client";
import {createContext} from "react";
export const AuthContext = createContext({


});

export const AuthContextProvider = (props: any) => {
    const { getAccessTokenSilently } = useAuth0();

    useEffect(() => {
        addAccessTokenInterceptor(getAccessTokenSilently);
    }, [getAccessTokenSilently]);

    return (
        <AuthContext.Provider value={{

        }}>
            {props.children}
        </AuthContext.Provider>
    );
};
