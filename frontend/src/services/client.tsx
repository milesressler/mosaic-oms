import axios, {AxiosInstance} from "axios";

const client: AxiosInstance = axios.create({
    baseURL:  import.meta.env.VITE_API_SERVER_URL,
    headers: {
        'Content-type': 'application/json',
    },
});

let interceptorAttached = false;

export const addAccessTokenInterceptor = (
    getAccessTokenSilently: () => Promise<string>
) => {
    if (interceptorAttached) return;
    interceptorAttached = true;

    client.interceptors.request.use(async (config) => {
        const token = await getAccessTokenSilently().catch(() => null);
        if (token) {
            config.headers.authorization = `Bearer ${token}`;
        }
        return config;
    });
};

export default client;
