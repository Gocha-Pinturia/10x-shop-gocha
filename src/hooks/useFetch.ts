import { useState, useEffect } from "react";
import type { AsyncState } from "../types/api.ts";
import { apiClient } from "../api/ApiClient.ts";

export function useFetch<T>(url: string): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ status: "loading" });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    setState({ status: "loading" });

    apiClient
      .get<T>(url, controller.signal)
      .then((data) => {
        if (isMounted) {
          setState({ status: "success", data });
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : "Failed to load data";
          setState({ status: "error", message: msg });
        }
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [url]);

  return state;
}
