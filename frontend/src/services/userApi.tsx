import client from "./client";
import {User} from "src/models/types.tsx";

const syncUser = (name: string, email: string) =>
    client.post<User>("/user", {name, username: email});

const syncUserWithToken = () => client.post<User>("/user/token", {});


export default {
    syncUser,
    syncUserWithToken,
};
