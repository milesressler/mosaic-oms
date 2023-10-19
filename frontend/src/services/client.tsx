import axios, {AxiosInstance} from "axios";

const client: AxiosInstance = axios.create({
    baseURL:  import.meta.env.VITE_API_SERVER_URL,
    headers: {
        'Content-type': 'application/json',
    },
});

export const addAccessTokenInterceptor = (getAccessTokenSilently) => {
    client.interceptors.request.use(async (config) => {
        const token: string = await getAccessTokenSilently();
        config.headers.authorization = `Bearer ${token}`;
        return config;
    });
};

export default client;
