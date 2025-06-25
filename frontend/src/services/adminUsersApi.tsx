import client from "./client";
import {AdminUser} from "src/models/types.tsx";

const createUser = (name: string, email: string) =>
    client.post<AdminUser>("/admin/user", {name, username: email});


export default {
    createUser,
};
