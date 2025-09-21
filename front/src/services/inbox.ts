
import { type InboxList, type Inbox, type APIKey, APIKeyList } from "../types/inbox";
import dayjs from 'dayjs';

const BASE_URL = process.env.REACT_APP_REQUEST_INBOX_API_URL;

const defaultHeaders = {
    "Content-Type": "application/json",
}


export const getInboxList = async () => {
    const resp = await fetch(`${BASE_URL}/api/v1/inboxes`, {
        method: "GET",
        headers: defaultHeaders,
        credentials: 'include',
    });
    if (!resp.ok) {
        throw new Error('API response error ', await resp.json());
    }
    const { results: inboxes } = (await resp.json()) as InboxList
    const sortedInboxes = inboxes.sort((a, b) => b.Timestamp - a.Timestamp);
    return sortedInboxes
}


export const getInbox = async (id: string) => {
    const resp = await fetch(`${BASE_URL}/api/v1/inboxes/${id}`, {
        method: "GET",
        headers: defaultHeaders,
        credentials: 'include',
    });
    if (!resp.ok) {
        throw new Error('API response error ', await resp.json());
    }
    const inbox = (await resp.json()) as Inbox;
    return inbox;
}

export const newInbox = async () => {
    const resp = await fetch(`${BASE_URL}/api/v1/inboxes`, {
        method: "POST",
        headers: defaultHeaders,
        credentials: 'include',
        body: JSON.stringify({}),
    });
    if (!resp.ok) {
        throw new Error('API response error ', await resp.json());
    }
    const inbox = (await resp.json()) as Inbox;
    return inbox;
}

export const updateInbox = async (inbox: Inbox) => {
    const reqInbox = {
        ...inbox,
        Requests: []
    }

    const resp = await fetch(`${BASE_URL}/api/v1/inboxes/${inbox.ID}`, {
        method: "PUT",
        headers: defaultHeaders,
        credentials: 'include',
        body: JSON.stringify(reqInbox),
    });
    
    if (!resp.ok) {
        const errorData = await resp.json();
        // Extract the error message, fallback to generic message
        const errorMessage = errorData?.message || errorData?.error || 'Failed to update inbox';
        throw new Error(errorMessage);
    }
    
    const updatedInbox = (await resp.json()) as Inbox;
    return updatedInbox;
}


export const deleteInbox = async (id: string) => {
    const resp = await fetch(`${BASE_URL}/api/v1/inboxes/${id}`, {
        method: "DELETE",
        headers: defaultHeaders,
        credentials: 'include',
    });
    return resp.status === 204;
}


export const deleteInboxRequests = async (id: string) => {
    const resp = await fetch(`${BASE_URL}/api/v1/inboxes/${id}/requests`, {
        method: "DELETE",
        headers: defaultHeaders,
        credentials: 'include',
    });
    return resp.status === 204;
}

export const health = async () => {
    const resp = await fetch(`${BASE_URL}/api/v1/health`, {
        method: "GET",
        headers: defaultHeaders,
    });
    if (!resp.ok) {
        throw new Error('API response error ', await resp.json());
    }
    return await resp.json()
}


export const getUser = async () => {
    const resp = await fetch(`${BASE_URL}/api/v1/auth/user`, {
        method: "GET",
        credentials: 'include',
        headers: defaultHeaders,
    });
    if (!resp.ok) {
        throw new Error('API response error ', await resp.json());
    }
    if (resp.status === 204) {
        return null;
    }
    return await resp.json()
}


export const deleteUser = async () => {
    const resp = await fetch(`${BASE_URL}/api/v1/auth/user`, {
        method: "DELETE",
        headers: defaultHeaders,
        credentials: 'include',
    });
    return resp.status === 200;
}


export const logout = async () => {
    const resp = await fetch(`${BASE_URL}/api/v1/auth/logout`, {
        method: "GET",
        credentials: 'include',
        headers: defaultHeaders,
    });
    if (!resp.ok) {
        throw new Error('API response error ', await resp.json());
    }
    return await resp.json()
}

export const acceptCookies = async () => {
    const resp = await fetch(`${BASE_URL}/api/v1/cookies/accept`, {
        method: "GET",
        headers: defaultHeaders,
    });
    if (!resp.ok) {
        throw new Error('API response error ', await resp.json());
    }
    return
}

export const getAPIKeyList = async () => {
    const resp = await fetch(`${BASE_URL}/api/v1/api-keys`, {
        method: "GET",
        headers: defaultHeaders,
        credentials: 'include',
    });
    if (!resp.ok) {
        throw new Error('API response error ', await resp.json());
    }
    const { results: apikeys } = (await resp.json()) as APIKeyList
    const sortedAPIKeys = apikeys.sort((a, b) => {
        const dateA = new Date(a.CreationDate);
        const dateB = new Date(b.CreationDate);
        return dateB.getTime() - dateA.getTime();
    });
    return sortedAPIKeys
}

export const createAPIKey = async (name: string, expiryDate: Date | null) => {
    const resp = await fetch(`${BASE_URL}/api/v1/api-keys`, {
        method: "POST",
        headers: defaultHeaders,
        credentials: 'include',
        body: `{"name": "${name}", "expiryDate": "${dayjs(expiryDate).format('YYYY-MM-DDTHH:mm:ss')}Z"}` // 
    });
    //resp.status === 200
    return (await resp.json()) as APIKey;
}

export const deleteAPIKey = async (ID: string) => {
    const resp = await fetch(`${BASE_URL}/api/v1/api-keys/${ID}`, {
        method: "DELETE",
        headers: defaultHeaders,
        credentials: 'include',
    });
    return resp.status === 200;
}






export const buildLoginURL = (provider: string) => {
    return `${BASE_URL}/api/v1/auth/${provider}/login/`;
}


export const buildInboxURL = (id: string) => {
    return `${BASE_URL}/api/v1/inboxes/${id}/in`
}
