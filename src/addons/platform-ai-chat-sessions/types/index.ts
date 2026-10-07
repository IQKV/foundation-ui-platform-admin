export type {
  ChatSession,
  SessionListResponse,
  SessionListParams,
} from "../api/ai-chat-sessions-api";

// ─── Filter state ─────────────────────────────────────────────────────────────

export interface SessionListFilters {
  search: string;
  model: string; // "" = all
}
