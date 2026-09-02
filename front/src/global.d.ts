declare module 'react-materialize';
declare module 'swagger-ui-react';

type WebMCPToolResult = Record<string, unknown>;

interface WebMCPTool {
  name: string;
  title?: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (
    input: Record<string, unknown>,
    options: { signal: AbortSignal }
  ) => Promise<WebMCPToolResult>;
  annotations?: {
    readOnlyHint?: boolean;
    untrustedContentHint?: boolean;
  };
}

interface WebMCPModelContext {
  registerTool: (
    tool: WebMCPTool,
    options?: { signal?: AbortSignal; exposedTo?: string[] }
  ) => Promise<void>;
}

interface Document {
  modelContext?: WebMCPModelContext;
}
