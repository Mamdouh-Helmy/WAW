import { useState, useEffect, useRef } from 'react';

export const useFetch = (fetchFn, deps = []) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const abortRef = useRef(null);

  useEffect(() => {
    // إلغاء الـ request القديمة لو الـ deps اتغيرت
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    fetchFn()
      .then((result) => {
        if (!controller.signal.aborted) setData(result);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setError(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, deps);

  return { data, loading, error };
};