import { nativeFetch } from '../utils/nativeFetch';
import { auth } from '../firebase/config';

export const DEFAULT_NVIDIA_MODEL = 'meta/llama-3.1-8b-instruct';

const FIREBASE_REGION = 'us-central1';

export function hasNvidiaConfigured(): boolean {
  return !!import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim();
}

function getCloudFunctionUrl(functionName: string): string {
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  return `https://${FIREBASE_REGION}-${projectId}.cloudfunctions.net/${functionName}`;
}

async function getIdToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated. Please log in and try again.');
  return user.getIdToken();
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
  const url = getCloudFunctionUrl('secureNvidiaChat');
  const idToken = await getIdToken();

  const body = JSON.stringify({
    data: {
      messages,
      options: {
        model: options?.model ?? DEFAULT_NVIDIA_MODEL,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens,
        response_format: options?.response_format,
      },
    },
  });

  const response = await nativeFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    let detail = text;
    try {
      const json = JSON.parse(text);
      detail = json?.error?.message || json?.result?.message || text;
    } catch { /* use raw text */ }
    throw new Error(`Cloud Function error (${response.status}): ${detail}`);
  }

  const json = await response.json();
  const result = json?.result ?? json?.data ?? json;
  const message = result?.choices?.[0]?.message;
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
