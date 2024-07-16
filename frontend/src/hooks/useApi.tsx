import {useCallback, useState} from "react";

type ApiFunc<T> = (...args: any[]) => Promise<{ data: T }>;

export default function useApi<T>(apiFunc: ApiFunc<T>) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const request = useCallback(async (...args: any[]) => {
        setLoading(true);
        setError('');
        try {
            const result = await apiFunc(...args);
            setData(result.data);
        } catch (err: any) {
            setError(err.message || "Unexpected Error!");
            setData(null);
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



