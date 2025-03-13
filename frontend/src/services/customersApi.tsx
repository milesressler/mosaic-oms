import client from "./client";
import {CustomerSearch} from "src/models/types.tsx";

const search = (searchString: string) =>
    client.get<CustomerSearch[]>(`/customer?q=${searchString}`);


export default {
    search,
};
