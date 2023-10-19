import {LogoutButton} from "./auth0/LogoutButton.tsx";
import useApi from "../hooks/useApi";
import userApi from "../services/userApi";
import {useAuth0} from "@auth0/auth0-react";
import {useEffect} from "react";

function NavigationBar() {
    // const syncUser = useApi(userApi.syncUser);
    // const { user } = useAuth0();
    // useEffect(() => {
    //     syncUser.request(user.name, user.email);
    // }, [user]);
    const { isAuthenticated } = useAuth0();

    return (
        <>
            <div className="navbar">
                {isAuthenticated && <LogoutButton></LogoutButton> }
            </div>
        </>)}

export default NavigationBar;
