import {useAuth0} from "@auth0/auth0-react";
import {useEffect, useState} from "react";

function OrdersPage() {
    const { getAccessTokenSilently } = useAuth0();
    const [accessToken, setAccessToken] = useState("");


    const getToken = async () => {

        setAccessToken(await getAccessTokenSilently());
    }

    useEffect(() => {
        getToken();
    }, [getAccessTokenSilently]);


    return (
        <>
            <div style={{maxWidth: '75vw'}}>
                <pre>
                { accessToken }
                    </pre>
            <p>
                OrdersPage
            </p>
            </div>
        </>
    )
}

export default OrdersPage;
