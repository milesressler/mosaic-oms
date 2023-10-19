import client from "./client";

const getSuggestedItems = () => client.get("/item");

export default {
    getSuggestedItems
};
