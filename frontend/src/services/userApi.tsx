import client from "./client";

const syncUser = (name, email) => {
    client.post<User>("/user", {name, username: email});
}

export default {
    syncUser
};
