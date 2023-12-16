
import { type InboxList, type Inbox } from "../types/inbox";

const BASE_URL = process.env.REACT_APP_REQUEST_INBOX_API_URL;

const defaultHeaders = {
    "Content-Type": "application/json",
}

export const getInboxList = async () => {
    const resp = await fetch(`${BASE_URL}/api/v1/inboxes`, {
        method: "GET",
        headers: defaultHeaders,
    });
    if (!resp.ok) {
        throw new Error('API response error ', await resp.json());
    }
    const { results: inboxes } = (await resp.json()) as InboxList
    return inboxes
}


export const getInbox = async (id: string) => {
    const resp = await fetch(`${BASE_URL}/api/v1/inboxes/${id}`, {
        method: "GET",
        headers: defaultHeaders,
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
        body: JSON.stringify({}),
    });
    if (!resp.ok) {
        throw new Error('API response error ', await resp.json());
    }
    const inbox = (await resp.json()) as Inbox;
    console.log(inbox);
    return inbox;
}

export const UpdateInbox = async (inbox: Inbox) => {
    const reqInbox = {
        ...inbox,
        Requests: []
    }

    const resp = await fetch(`${BASE_URL}/api/v1/inboxes/${inbox.ID}`, {
        method: "PUT",
        headers: defaultHeaders,
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
    });
    return resp.status === 204;
}


export const buildInboxURL = (id: string) => {
    return `${BASE_URL}/api/v1/inboxes/${id}/in`
}