import { useCallback, useEffect, useRef, useState } from "react";
import { fetchSessionState } from "../utils/sessionApi";

/**
 * Polling ringan agar host dan pemain melihat state sesi yang sama.
 * Aksi host/pemain tetap divalidasi di server; polling hanya untuk tampilan.
 */
export const useSessionPolling = ({ code, hostToken = null, interval = 1200 }) => {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const busyRef = useRef(false);
  const timerRef = useRef(null);

  const fetchNow = useCallback(async () => {
    if (!code || busyRef.current) return;
    busyRef.current = true;
    try {
      const data = await fetchSessionState(code, hostToken);
      if (!mountedRef.current) return;
      setState(data.state ?? null);
      setError(null);
    } catch (requestError) {
      if (!mountedRef.current) return;
      setError(requestError);
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setLoading(false);
    }
  }, [code, hostToken]);

  useEffect(() => {
    mountedRef.current = true;
    if (!code) {
      setLoading(false);
      return undefined;
    }

    fetchNow();
    const schedule = () => {
      timerRef.current = setTimeout(async () => {
        if (!mountedRef.current) return;
        await fetchNow();
        if (mountedRef.current) schedule();
      }, interval);
    };
    schedule();

    return () => {
      mountedRef.current = false;
      clearTimeout(timerRef.current);
    };
  }, [code, interval, fetchNow]);

  const applyState = useCallback((nextState) => {
    if (nextState) setState(nextState);
  }, []);

  return { state, setState: applyState, error, loading, refresh: fetchNow };
};
