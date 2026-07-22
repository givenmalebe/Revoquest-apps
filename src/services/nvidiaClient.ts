import { getFunctions, httpsCallable } from 'firebase/functions';

export const DEFAULT_NVIDIA_MODEL = 'meta/llama-3.1-8b-instruct';

export function hasNvidiaConfigured(): boolean {
  return !!import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
}

export interface NvidiaChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface NvidiaCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
}

export interface NvidiaCompletionResult {
  content: string;
}

export async function nvidiaChatCompletion(
  messages: NvidiaChatMessage[],
  options?: NvidiaCompletionOptions
): Promise<NvidiaCompletionResult> {
  const functions = getFunctions();
  const secureProxy = httpsCallable<
    { messages: any[]; options?: any },
    any
  >(functions, 'secureNvidiaChat');

  const response = await secureProxy({
    messages,
    options: {
      model: options?.model ?? DEFAULT_NVIDIA_MODEL,
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.max_tokens,
      response_format: options?.response_format,
    },
  });

  const data = response.data;
  const message = data?.choices?.[0]?.message;
  const content =
    typeof message?.content === 'string' ? message.content : message?.content != null ? String(message.content) : '';

  return { content: content.trim() };
}

export async function nvidiaGenerateText(params: {
  system?: string;
  user: string;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' };
  model?: string;
}): Promise<string> {
  const messages: NvidiaChatMessage[] = [];
  if (params.system?.trim()) {
    messages.push({ role: 'system', content: params.system.trim() });
  }
  messages.push({ role: 'user', content: params.user });
  const { content } = await nvidiaChatCompletion(messages, {
    model: params.model,
    temperature: params.temperature,
    max_tokens: params.max_tokens,
    response_format: params.response_format,
  });
  return content;
}
