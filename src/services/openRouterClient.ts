/**
 * OpenRouter (OpenAI-compatible) chat API secure client.
 * Calls are securely proxied through Firebase Cloud Functions to protect API keys.
 * @see https://openrouter.ai/docs
 */

import { getFunctions, httpsCallable } from 'firebase/functions';

export const DEFAULT_OPENROUTER_MODEL = 'z-ai/glm-4.7-flash';

/**
 * AI keys live in `firebase-functions/.env` (OPENROUTER_API_KEY, GEMINI_API_KEY).
 * The frontend uses Cloud Function proxies — no client-side API key required.
 */
export function getOpenRouterApiKey(): string {
  const direct = import.meta.env.VITE_OPENROUTER_API_KEY?.trim();
  if (direct) return direct;
  if (import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim()) return "proxied";
  return "";
}

export function getOpenRouterModel(): string {
  const m = import.meta.env.VITE_OPENROUTER_MODEL?.trim();
  return m || DEFAULT_OPENROUTER_MODEL;
}

/** Must support OpenRouter output modality `image` (see model list). Default: Gemini image on OpenRouter. */
export function getOpenRouterImageModel(): string {
  const m = import.meta.env.VITE_OPENROUTER_IMAGE_MODEL?.trim();
  return m || 'google/gemini-2.5-flash-image';
}

export function assertOpenRouterApiKey(): string {
  const key = getOpenRouterApiKey();
  if (!key) {
    throw new Error(
      "AI is not configured. Set OPENROUTER_API_KEY in firebase-functions/.env and deploy functions."
    );
  }
  return key;
}

type ChatRole = 'system' | 'user' | 'assistant' | 'tool';

export interface OpenRouterChatMessage {
  role: ChatRole;
  content: string;
  tool_call_id?: string;
}

export interface OpenRouterTool {
  type: 'function';
  function: {
    name: string;
    description?: string;
    parameters: Record<string, unknown>;
  };
}

export interface OpenRouterCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  tools?: OpenRouterTool[];
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  response_format?: { type: 'json_object' };
}

export interface ParsedToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
}

export interface OpenRouterCompletionResult {
  content: string;
  tool_calls?: ParsedToolCall[];
}

/**
 * Chat/completions secure call proxied through Firebase Functions.
 */
export async function openRouterChatCompletion(
  messages: OpenRouterChatMessage[],
  options?: OpenRouterCompletionOptions
): Promise<OpenRouterCompletionResult> {
  const model = options?.model ?? getOpenRouterModel();

  const formattedMessages = messages.map((m) => {
    if (m.role === 'tool' && m.tool_call_id) {
      return { role: 'tool', content: m.content, tool_call_id: m.tool_call_id };
    }
    return { role: m.role, content: m.content };
  });

  const functions = getFunctions();
  const secureProxy = httpsCallable<
    { messages: any[]; options?: any },
    any
  >(functions, 'secureOpenRouterChat');

  const response = await secureProxy({
    messages: formattedMessages,
    options: {
      model,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens,
      tools: options?.tools,
      tool_choice: options?.tool_choice,
      response_format: options?.response_format,
    },
  });

  const data = response.data;
  const message = data?.choices?.[0]?.message;
  const content =
    typeof message?.content === 'string' ? message.content : message?.content != null ? String(message.content) : '';

  const rawToolCalls = message?.tool_calls;
  const tool_calls: ParsedToolCall[] = [];
  if (Array.isArray(rawToolCalls)) {
    for (const tc of rawToolCalls) {
      if (tc?.type !== 'function' || !tc.function?.name) continue;
      let args: Record<string, unknown> = {};
      try {
        args = tc.function.arguments ? (JSON.parse(tc.function.arguments) as Record<string, unknown>) : {};
      } catch {
        args = {};
      }
      tool_calls.push({
        id: String(tc.id ?? ''),
        name: tc.function.name,
        arguments: args,
      });
    }
  }

  return {
    content: content.trim(),
    tool_calls: tool_calls.length ? tool_calls : undefined,
  };
}

/** Single user message, optional system prompt. */
export async function openRouterGenerateText(params: {
  system?: string;
  user: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
  model?: string;
}): Promise<string> {
  const messages: OpenRouterChatMessage[] = [];
  if (params.system?.trim()) {
    messages.push({ role: 'system', content: params.system.trim() });
  }
  messages.push({ role: 'user', content: params.user });
  const { content } = await openRouterChatCompletion(messages, {
    model: params.model,
    temperature: params.temperature,
    max_tokens: params.max_tokens,
    response_format: params.response_format,
  });
  return content;
}

function extractImageDataUrlFromOpenRouterPayload(data: unknown): string | null {
  const root = data as {
    choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }>;
  };
  const images = root?.choices?.[0]?.message?.images;
  if (!Array.isArray(images)) return null;
  for (const img of images) {
    const url = img?.image_url?.url;
    if (typeof url === 'string' && url.length > 12) {
      return url.startsWith('data:') ? url : url;
    }
  }
  return null;
}

/**
 * Secure educational illustration image generation proxied through Firebase Functions.
 */
export async function openRouterGenerateImageDataUrl(prompt: string): Promise<string | null> {
  const model = getOpenRouterImageModel();

  const functions = getFunctions();
  const secureProxy = httpsCallable<
    { prompt: string; model: string },
    any
  >(functions, 'secureOpenRouterImage');

  try {
    const response = await secureProxy({ prompt, model });
    return extractImageDataUrlFromOpenRouterPayload(response.data);
  } catch (error) {
    console.warn('secureOpenRouterImage error:', error);
    return null;
  }
}
