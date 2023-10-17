import {useAuth0} from "@auth0/auth0-react";
import {useContext, useEffect, useState} from "react";
import {OrderContext} from "../contexts/OrderContext";

function OrdersPage() {
    const { getAccessTokenSilently } = useAuth0();
    const [accessToken, setAccessToken] = useState("");
    const { orderList } = useContext(OrderContext);


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
                {orderList.length}
            <p>
                OrdersPage
            </p>
            </div>
        </>
    )
}

export default OrdersPage;
