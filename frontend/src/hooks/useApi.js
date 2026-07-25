import { useState, useEffect } from "react";
import api from "@/services/api";

export const useApi = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    setData(null);
    setError(null);
    setLoading(true);

    const controller = new AbortController();

    (async () => {
      try {
        const res = await api.get(url, { signal: controller.signal });
        setData(res.data);
      } catch (err) {
        if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [url]);

  return { data, loading, error };
};
