import client from "./client";


const getStructuredChangelog = () =>
    client.get<any>("/announcements/changelog");

export default {
    getStructuredChangelog
};
