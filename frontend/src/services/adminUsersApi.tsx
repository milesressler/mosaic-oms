import client from "./client";
import { RoleName } from '../models/constants';

const createUser = (name: string, email: string) =>
    client.post<AdminUser>("/admin/user", {name, username: email});

const roleFilter = (role: RoleName) => {
    client.get<AdminUser[]>(`/admin/users?role=${role}`);
}

export default {
    createUser,
    roleFilter
};
