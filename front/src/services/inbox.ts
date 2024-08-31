
import { type InboxList, type Inbox } from "../types/inbox";

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
    console.log("newInbox", inbox);
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
        throw new Error('API response error ', await resp.json());
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


export const buildLoginURL = (provider: string) => {
    return `${BASE_URL}/api/v1/auth/${provider}/login/`;
}

export const buildLogoutURL = (provider: string) => {
    return `${BASE_URL}/api/v1/auth/${provider}/login/`;
}



export const buildInboxURL = (id: string) => {
    return `${BASE_URL}/api/v1/inboxes/${id}/in`
}
