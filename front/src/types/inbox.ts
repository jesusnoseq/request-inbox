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
    IsPrivate: boolean;
    OwnerID: string;
    Callbacks: InboxCallback[];
}

export type InboxCallback = {
    IsEnabled: boolean;
    IsDynamic: boolean;
    ToURL: string;
    Method: string;
    Headers: Record<string, string>;
    Body: string;
}

export type CallbackResponse = {
    URL: string;
	Method: string;
	Error: string;
    Code: number;
    CodeTemplate: string;
    Body: string;
    Headers: Record<string, string>;
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
    CallbackResponses?: CallbackResponse[];
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

export type APIKeyList = {
    count: number;
    results: APIKey[];
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