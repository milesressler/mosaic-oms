import client from "./client";

const createUser = (name: string, email: string) =>
    client.post<AdminUser>("/admin/user", {name, username: email});


export default {
    createUser,
};
