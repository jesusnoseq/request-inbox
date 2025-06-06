export type InboxList = {
    count: number;
    results: Inbox[];
}

export type APIKeyList = {
    count: number;
    results: APIKey[];
}

export type Inbox = {
    ID: string;
    Name: string;
    Timestamp: number;
    Response: InboxResponse;
    Requests: InboxRequest[];
    ObfuscateHeaderFields: string[];
    IsPrivate: boolean;
    OwnerID: string;
}

export type InboxRequest = {
    ID: number;
    Timestamp: number;
    URI: string;
    Headers: Record<string, string>;
    Body: string;
    Host: string;
    RemoteAddr: string;
    Protocol: string;
    Method: string;
    ContentLength: number;
}

export type InboxResponse = {
    Code: number;
    CodeTemplate: string;
    Body: string;
    Headers: Record<string, string>;
    IsDynamic: boolean;
}

export type User = {
    ID: string;
    Name: string;
    Email: string;
    Organization: string;
    AvatarURL: string;
}

export type APIKey = {
    ID: string;
    Name: string;
    OwnerID: string;
    APIKey: string;
    CreationDate: Date;
    ExpiryDate: Date | null;
    IsActive: boolean;
}