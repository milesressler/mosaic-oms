import {useCallback, useState} from "react";

type ApiFunc<T, Args extends any[]> = (...args: Args) => Promise<{ data: T }>;

export default function useApi<T, Args extends any[]>(apiFunc: ApiFunc<T, Args>) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const request = useCallback(async (...args: Args) => {
        setLoading(true);
        setError('');
        try {
            const result = await apiFunc(...args);
            setData(result.data);
            return result?.data;
        } catch (err: any) {
            setError(err.message || "Unexpected Error!");
            setData(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, [apiFunc]);

    return {
        data,
        error,
        loading,
        request
    };
};
