import useApi from "src/hooks/useApi.tsx";
import ordersApi from "src/services/ordersApi.tsx";
import {Link} from "react-router-dom";

function OrderFormPageSample() {
    const createOrderAPI = useApi(ordersApi.createOrder);

    function random(arr: any[]) {
        return arr[~~(Math.random() * arr.length)];
    }

    function createRandomOrder() {
        const nameList = ["Bill", "Bob", "Mark", "Tony", "Mack"];
        const lastNameList = ["Smith", "Jones", "Brown", "Garcia", "Wilson"];
        const itemList = ["pants", "socks", "shirts", "shoes", "lotion", "toothpaste", "jacket", "belt", "water bottle", "soap"];
        const items = new Set();
        while (Math.random() < 0.65 || items.size == 0) {
            items.add(random(itemList));
        }
        const itemRequests: any[] = [];
        items.forEach(val => itemRequests.push({
            "description": val,
            "quantity": ~~(Math.random() * 10)+1
        }));

        const request = {
            "customerName": `${random(nameList)} ${random(lastNameList)}`,
            "items": itemRequests
        };
        createOrderAPI.request(request);
    }
    return (<>
        {createOrderAPI.loading && <div>Creating</div>}
        {!createOrderAPI.loading && createOrderAPI.data !== null &&<div>
            <div>Created Order #{createOrderAPI.data.id}</div>
        </div>}
        <div><button onClick={createRandomOrder}>Create Random Order</button></div>
        <div><Link to={"/orders"}>Back to orders</Link></div>
    </>);
}

export default OrderFormPageSample;
