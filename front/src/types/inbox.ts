export type InboxList = {
    count: number;
    results: Inbox[];
}

export type Inbox = {
    ID: string;
    Name: string;
    Timestamp: number;
    Response: InboxResponse;
    Requests: InboxRequest[];
    ObfuscateHeaderFields: string[];
}

export type InboxRequest = {
    ID: number;
    Timestamp: number;
    URI: string;
    Headers: Record<string, string>;
    Body: string;
    Host: string
    RemoteAddr: string
    Protocol: string
    Method: string
    ContentLength: number
}

export type InboxResponse = {
    Code: number;
    CodeTemplate: string;
    Body: string;
    Headers: Record<string, string>;
    IsDynamic: boolean;
}

export type User = {
    ID: number;
    Name: string;
    Email: string;
    Organization: string;
    AvatarURL: string;
}