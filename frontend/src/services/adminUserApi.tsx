import client from "./client";
import { Page, User, UserDetail} from "src/models/types.tsx";

const createUser = (email: string, name: string) =>
    client.post<User>("/admin/user", {email, name});

const updateUser = (userId: string, addRoles: string[], removeRoles: string[]) =>
    client.put<UserDetail>(`/admin/user/${encodeURIComponent(userId)}`, {addRoles, removeRoles});

const getUsers = (page: number, size: number) =>
    client.get<Page<User>>("/admin/user", {params: {page, size}});

const getUser = (id: string) =>
    client.get<UserDetail>(`/admin/user/${encodeURIComponent(id)}`);
const resendInvite = (id: string) =>
    client.post<any>(`/admin/user/${encodeURIComponent(id)}/invite`);


export default {
    createUser,
    getUsers,
    getUser,
    updateUser,
    resendInvite,
};
