
import { type InboxList, type Inbox, type APIKey, APIKeyList } from "../types/inbox";
import dayjs from 'dayjs';

const BASE_URL = process.env.REACT_APP_REQUEST_INBOX_API_URL;

const defaultHeaders = {
    "Content-Type": "application/json",
}

/**
 * Optional last argument of every service function, so any caller that can be
 * cancelled (WebMCP tool executions, React effects) can pass its signal down
 * without each function growing its own parameter.
 */
export type RequestOptions = {
    signal?: AbortSignal;
}

type APIRequest = RequestOptions & {
    method?: string;
    /** Serialized as JSON. Omit for requests without a body. */
    body?: unknown;
    /** Endpoints that are reachable without a session opt out of cookies. */
    credentials?: RequestCredentials;
    /** Used when the API answers with an error that carries no message. */
    errorMessage?: string;
}

const apiFetch = async (path: string, options: APIRequest = {}) => {
    const { method = "GET", body, credentials = 'include', signal } = options;
    return fetch(`${BASE_URL}${path}`, {
        method,
        headers: defaultHeaders,
        credentials,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
    });
}

const apiError = async (resp: Response, fallback: string) => {
    // A failing endpoint does not always answer with JSON (gateway errors, empty
    // bodies), so parsing must not mask the response error itself.
    const data = await resp.json().catch(() => null);
    return new Error(data?.message || data?.error || fallback, { cause: data });
}

/** Performs the request and throws on any error status, without reading the body. */
const apiVoid = async (path: string, options: APIRequest = {}) => {
    const resp = await apiFetch(path, options);
    if (!resp.ok) {
        throw await apiError(resp, options.errorMessage ?? 'API response error');
    }
    return resp;
}

/** Performs the request and returns its parsed body, throwing on any error status. */
const apiJSON = async <T>(path: string, options: APIRequest = {}): Promise<T> => {
    const resp = await apiVoid(path, options);
    return (await resp.json()) as T;
}


export const getInboxList = async (options: RequestOptions = {}) => {
    const { results: inboxes } = await apiJSON<InboxList>(`/api/v1/inboxes`, options);
    const sortedInboxes = inboxes.sort((a, b) => b.Timestamp - a.Timestamp);
    return sortedInboxes
}


export const getInbox = async (id: string, options: RequestOptions = {}) => {
    return apiJSON<Inbox>(`/api/v1/inboxes/${id}`, options);
}

export const newInbox = async (options: RequestOptions = {}) => {
    return apiJSON<Inbox>(`/api/v1/inboxes`, { ...options, method: "POST", body: {} });
}

export const updateInbox = async (inbox: Inbox, options: RequestOptions = {}) => {
    const reqInbox = {
        ...inbox,
        Requests: []
    }

    return apiJSON<Inbox>(`/api/v1/inboxes/${inbox.ID}`, {
        ...options,
        method: "PUT",
        body: reqInbox,
        errorMessage: 'Failed to update inbox',
    });
}


export const deleteInbox = async (id: string, options: RequestOptions = {}) => {
    const resp = await apiFetch(`/api/v1/inboxes/${id}`, { ...options, method: "DELETE" });
    return resp.status === 204;
}


export const deleteInboxRequests = async (id: string, options: RequestOptions = {}) => {
    const resp = await apiFetch(`/api/v1/inboxes/${id}/requests`, { ...options, method: "DELETE" });
    return resp.status === 204;
}

export const health = async (options: RequestOptions = {}) => {
    return apiJSON<unknown>(`/api/v1/health`, { ...options, credentials: 'same-origin' });
}


export const getUser = async (options: RequestOptions = {}) => {
    const resp = await apiFetch(`/api/v1/auth/user`, options);
    if (!resp.ok) {
        throw await apiError(resp, 'API response error');
    }
    if (resp.status === 204) {
        return null;
    }
    return await resp.json()
}


export const deleteUser = async (options: RequestOptions = {}) => {
    const resp = await apiFetch(`/api/v1/auth/user`, { ...options, method: "DELETE" });
    return resp.status === 200;
}


export const logout = async (options: RequestOptions = {}) => {
    return apiJSON<unknown>(`/api/v1/auth/logout`, options);
}

export const acceptCookies = async (options: RequestOptions = {}) => {
    // Answers 204 with no body, so nothing to parse here.
    await apiVoid(`/api/v1/cookies/accept`, { ...options, credentials: 'same-origin' });
    return
}

export const getAPIKeyList = async (options: RequestOptions = {}) => {
    const { results: apikeys } = await apiJSON<APIKeyList>(`/api/v1/api-keys`, options);
    const sortedAPIKeys = apikeys.sort((a, b) => {
        const dateA = new Date(a.CreationDate);
        const dateB = new Date(b.CreationDate);
        return dateB.getTime() - dateA.getTime();
    });
    return sortedAPIKeys
}

export const createAPIKey = async (name: string, expiryDate: Date | null, options: RequestOptions = {}) => {
    return apiJSON<APIKey>(`/api/v1/api-keys`, {
        ...options,
        method: "POST",
        body: { name, expiryDate: `${dayjs(expiryDate).format('YYYY-MM-DDTHH:mm:ss')}Z` },
        errorMessage: 'Failed to create a new API key',
    });
}

export const deleteAPIKey = async (ID: string, options: RequestOptions = {}) => {
    const resp = await apiFetch(`/api/v1/api-keys/${ID}`, { ...options, method: "DELETE" });
    return resp.status === 200;
}




export const buildLoginURL = (provider: string) => {
    return `${BASE_URL}/api/v1/auth/${provider}/login/`;
}


export const buildInboxURL = (id: string) => {
    return `${BASE_URL}/api/v1/inboxes/${id}/in`
}
