import { useEffect, useRef } from 'react';
import type {
  InferArgsFromInputSchema,
  InferJsonSchema,
  InputSchema,
  ModelContextRegisterToolOptions,
  WebMcpToolAnnotations,
} from '@mcp-b/webmcp-types';

/** A tool this app exposes to WebMCP agents. */
export type WebMCPToolDefinition<
  TInputSchema extends InputSchema,
  TOutputSchema extends InputSchema
> = {
  name: string;
  /** Display name; agents fall back to `name` when a tool has none. */
  title: string;
  description: string;
  inputSchema: TInputSchema;
  /**
   * Describes the returned object. An MCP-B extension rather than part of the
   * core dictionary, so spec-only runtimes ignore it.
   */
  outputSchema: TOutputSchema;
  annotations?: WebMcpToolAnnotations;
  execute: (input: InferArgsFromInputSchema<TInputSchema>) => Promise<InferJsonSchema<TOutputSchema>>;
};

/**
 * Registers a tool with `document.modelContext` for as long as the component is
 * mounted, and does nothing where the browser has no WebMCP.
 *
 * The tool is registered once: `execute` is read through a ref so it always runs
 * against the current render's props without re-registering.
 */
const useWebMCPTool = <TInputSchema extends InputSchema, TOutputSchema extends InputSchema>(
  tool: WebMCPToolDefinition<TInputSchema, TOutputSchema>,
  enabled = true
) => {
  const toolRef = useRef(tool);
  toolRef.current = tool;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const modelContext = document.modelContext;
    if (!modelContext) {
      return;
    }

    const controller = new AbortController();
    const { name, title, description, inputSchema, outputSchema, annotations } = toolRef.current;

    const registerTool = modelContext.registerTool.bind(modelContext) as (
      descriptor: unknown,
      options?: ModelContextRegisterToolOptions
    ) => Promise<void>;

    registerTool(
      {
        name,
        title,
        description,
        inputSchema,
        outputSchema,
        annotations,
        execute: (input: InferArgsFromInputSchema<TInputSchema>) => toolRef.current.execute(input),
      },
      { signal: controller.signal }
    ).catch((error: unknown) => {
      if (!controller.signal.aborted) {
        console.error(`Failed to register the "${name}" WebMCP tool`, error);
      }
    });

    return () => controller.abort();
  }, [enabled]);
};

export default useWebMCPTool;
