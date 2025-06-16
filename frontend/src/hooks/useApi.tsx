import { useCallback, useState } from "react";

type ApiFunc<T, Args extends any[]> = (...args: Args) => Promise<{ data: T }>;

export default function useApi<T, Args extends any[]>(apiFunc: ApiFunc<T, Args>) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    const request = useCallback(
        async (...rawArgs: [...Args, { silent?: boolean }?]): Promise<{ data: T } | null> => {
            const args = rawArgs as Args;
            const maybeOptions = rawArgs[rawArgs.length - 1];
            const hasOptions = typeof maybeOptions === "object" && maybeOptions?.silent !== undefined;
            const silent = hasOptions ? maybeOptions.silent : false;

            if (!silent) setLoading(true);
            setError("");

            try {
                const result = await apiFunc(...(hasOptions ? args.slice(0, -1) : args));
                setData(result.data);
                return result;
            } catch (err: any) {
                setError(err?.response?.data?.message || "Unexpected Error!");
                setData(null);
                return null;
            } finally {
                if (!silent) setLoading(false);
            }
        },
        [apiFunc]
    );

    return {
        data,
        error,
        loading,
        request,
    };
}
