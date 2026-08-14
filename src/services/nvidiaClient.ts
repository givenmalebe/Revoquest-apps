import { getFunctions, httpsCallable } from 'firebase/functions';
import app, { auth } from '../firebase/config';

export const DEFAULT_NVIDIA_MODEL = 'meta/llama-3.1-8b-instruct';

const FIREBASE_REGION = 'us-central1';
const functions = getFunctions(app, FIREBASE_REGION);

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
  if (!auth.currentUser) {
    throw new Error('User not authenticated. Please log in and try again.');
  }

  const secureNvidiaChat = httpsCallable<
    {
      messages: NvidiaChatMessage[];
      options?: NvidiaCompletionOptions;
    },
    { choices?: Array<{ message?: { content?: unknown } }> }
  >(functions, 'secureNvidiaChat', { timeout: 300000 });

  try {
    const { data } = await secureNvidiaChat({
      messages,
      options: {
        model: options?.model ?? DEFAULT_NVIDIA_MODEL,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens,
        response_format: options?.response_format,
      },
    });

    const message = data?.choices?.[0]?.message;
    const content =
      typeof message?.content === 'string'
        ? message.content
        : message?.content != null
          ? String(message.content)
          : '';

    if (!content.trim()) {
      throw new Error('AI returned an empty response. Please try again.');
    }

    return { content: content.trim() };
  } catch (err: unknown) {
    const anyErr = err as { code?: string; message?: string };
    const msg = anyErr?.message || 'Failed to generate with AI';
    if (msg.toLowerCase().includes('failed to fetch') || anyErr?.code === 'unavailable') {
      throw new Error('Could not reach the quiz AI service. Please refresh and try again.');
    }
    throw new Error(msg.replace(/^FirebaseError:\s*/i, '').replace(/^internal:\s*/i, ''));
  }
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
