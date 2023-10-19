import {useAuth0} from "@auth0/auth0-react";
import {useEffect} from "react";
import {addAccessTokenInterceptor} from "../services/client";
import { useState, createContext } from "react";
import useApi from "../hooks/useApi";
import userApi from "../services/userApi";

export const AuthContext = createContext({


});

export const AuthContextProvider = (props) => {
    const { getAccessTokenSilently } = useAuth0();
    const syncUserApi = useApi(userApi.syncUser);

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
