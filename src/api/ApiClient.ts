import { ApiError } from "./ApiError.ts";

export class ApiClient {
  constructor(private readonly baseUrl: string = "https://dummyjson.com") {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((init.headers as Record<string, string>) || {}),
    };

    let res: Response;
    try {
      res = await fetch(this.baseUrl + path, { ...init, headers });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error occurred";
      throw new ApiError(0, msg);
    }

    if (!res.ok) {
      let errText = "";
      try {
        errText = await res.text();
      } catch {
        errText = `HTTP error status ${res.status}`;
      }
      throw new ApiError(res.status, errText || `Request failed with status ${res.status}`);
    }

    return (await res.json()) as T;
  }

  get<T>(path: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>(path, { method: "GET", signal });
  }

  post<T, B>(path: string, body: B, signal?: AbortSignal): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: JSON.stringify(body),
      signal,
    });
  }
}

export const apiClient = new ApiClient("https://dummyjson.com");
