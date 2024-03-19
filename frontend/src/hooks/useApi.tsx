import { useState } from "react";

export default (apiFunc) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const request = async (...args) => {
        setLoading(true);
        setError('');
        try {
            const result = await apiFunc(...args);
            setData(result.data);
        } catch (err) {
            setError(err.message || "Unexpected Error!");
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    return {
        data,
        error,
        loading,
        request
    };
};



