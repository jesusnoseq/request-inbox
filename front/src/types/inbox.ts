export type InboxList = {
    count: number;
    results: Inbox[];
}

export type Inbox = {
    ID: string;
    Timestamp: number;
    Response: InboxResponse;
    Requests: InboxRequest[];
    ObfuscateHeaderFields: string[];
}

export type InboxRequest = {
    ID: number;
    Timestamp: number;
    Path: string;
    Headers: Record<string, string>;
    Body: string;
}

export type InboxResponse = {
    Code: number;
    Body: string;
    Headers: Record<string, string>;
}
