/**
 * ai-chat-sessions-api.ts
 *
 * Self-contained API module for the platform-ai-chat-sessions addon.
 * Zero imports from the host application (@/shared/*, @/entities, etc.).
 * Initialised once via init(httpClient) in the addon's initialize() hook.
 */

import type { AxiosInstance } from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatSession {
  id: string;
  userId: string;
  title: string | null;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionListResponse {
  items: ChatSession[];
  totalElements: number;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
}

export interface MessageListResponse {
  items: ChatMessage[];
  totalElements: number;
}

export interface SessionListParams {
  limit?: number;
  offset?: number;
}

// ─── Module-level client reference ───────────────────────────────────────────

let _client: AxiosInstance | null = null;

function client(): AxiosInstance {
  if (!_client) {
    throw new Error(
      "[ai-chat-sessions-api] API client not initialised. " +
        "Call aiChatSessionsApi.init(httpClient) inside the addon's initialize() hook.",
    );
  }
  return _client;
}

// ─── API ──────────────────────────────────────────────────────────────────────

const BASE = "/v1/aichat/admin";

export const aiChatSessionsApi = {
  init(httpClient: AxiosInstance): void {
    _client = httpClient;
  },

  list(params: SessionListParams = {}): Promise<SessionListResponse> {
    return client()
      .get<SessionListResponse>(`${BASE}/sessions`, { params })
      .then((r) => r.data);
  },

  getMessages(sessionId: string, limit = 200, offset = 0): Promise<MessageListResponse> {
    return client()
      .get<MessageListResponse>(`${BASE}/sessions/${sessionId}/messages`, {
        params: { limit, offset },
      })
      .then((r) => r.data);
  },
};
