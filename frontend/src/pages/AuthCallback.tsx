import {useEffect} from "react";
import { useLocation } from "react-router-dom";
import {useAuth0} from "@auth0/auth0-react";

function CallbackPage() {

    const { logout, loginWithRedirect } = useAuth0();
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('linked') === 'true') {
            // Clean up session and re-authenticate
            logout({ logoutParams: { returnTo: window.location.origin } });
            loginWithRedirect();
        }
    }, [location, logout, loginWithRedirect]);

    return (
        <>
            <div>
                Loading
            </div>
        </>)}

export default CallbackPage;
