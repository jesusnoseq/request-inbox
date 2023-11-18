
import { type InboxList, type Inbox } from "../types/inbox";

//console.log(import.meta.env.MODE);
//const BASE_URL = import.meta.env.PUBLIC_REQUEST_INBOX_API_URL
const BASE_URL = "http://localhost:8080";

export const getInboxList = async () => {
    const resp = await fetch(`${BASE_URL}/api/v1/inboxes`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const { results: inboxes } = (await resp.json()) as InboxList
    console.log(inboxes);
    return inboxes
}


export const getInbox = async (id: string) => {
    const resp = await fetch(`${BASE_URL}/api/v1/inboxes/${id}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const inbox = (await resp.json()) as Inbox;
    console.log(inbox);
    return inbox;
}

export const newInbox = async () => {
    const resp = await fetch(`${BASE_URL}/api/v1/inboxes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
    });
    const inbox = (await resp.json()) as Inbox;
    console.log(inbox);
    return inbox;
}