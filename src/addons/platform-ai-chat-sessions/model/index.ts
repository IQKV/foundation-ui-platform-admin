import { useQuery } from "@tanstack/react-query";
import { aiChatSessionsApi } from "../api/ai-chat-sessions-api";
import type { SessionListParams } from "../api/ai-chat-sessions-api";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const sessionKeys = {
  all: ["addon", "ai-chat-sessions"] as const,
  list: (params: SessionListParams) => [...sessionKeys.all, "list", params] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useSessionList(params: SessionListParams = {}) {
  return useQuery({
    queryKey: sessionKeys.list(params),
    queryFn: () => aiChatSessionsApi.list(params),
  });
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export const MODEL_OPTIONS = [
  { value: "", label: "All models" },
  { value: "llama3.1:8b", label: "Llama 3.1 8B" },
  { value: "llama3.2", label: "Llama 3.2" },
  { value: "mistral", label: "Mistral" },
];

export const MODEL_COLORS: Record<string, string> = {
  "llama3.1:8b": "blue",
  "llama3.2": "cyan",
  mistral: "grape",
};
