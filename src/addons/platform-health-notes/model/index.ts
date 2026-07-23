import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
// ── Addon-local import only — no @/shared/* ──────────────────────────────────
import { platformNotesApi } from "../api/platform-notes-api";
import type {
  PlatformNoteListParams,
  CreatePlatformNoteRequest,
  UpdatePlatformNoteRequest,
  PatchPlatformNoteRequest,
} from "../api/platform-notes-api";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const noteKeys = {
  all: ["addon", "platform-notes"] as const,
  list: (params: PlatformNoteListParams) => [...noteKeys.all, "list", params] as const,
  count: (params?: Partial<PlatformNoteListParams>) =>
    [...noteKeys.all, "count", params ?? {}] as const,
  detail: (id: string) => [...noteKeys.all, "detail", id] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useNoteList(params: PlatformNoteListParams = {}) {
  return useQuery({
    queryKey: noteKeys.list(params),
    queryFn: () => platformNotesApi.list(params),
  });
}

export function useNoteCount(
  params: Pick<PlatformNoteListParams, "search" | "severity" | "status"> = {},
) {
  return useQuery({
    queryKey: noteKeys.count(params),
    queryFn: () => platformNotesApi.count(params),
  });
}

export function useNote(id: string) {
  return useQuery({
    queryKey: noteKeys.detail(id),
    queryFn: () => platformNotesApi.get(id),
    enabled: !!id,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateNote(opts?: { onSuccess?: () => void }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePlatformNoteRequest) => platformNotesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noteKeys.all });
      notifications.show({
        color: "green",
        title: "Note created",
        message: "Platform health note has been saved.",
      });
      opts?.onSuccess?.();
    },
  });
}

export function useUpdateNote(id: string, opts?: { onSuccess?: () => void }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdatePlatformNoteRequest) => platformNotesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noteKeys.all });
      notifications.show({
        color: "green",
        title: "Note updated",
        message: "Changes have been saved.",
      });
      opts?.onSuccess?.();
    },
  });
}

export function usePatchNote(opts?: { onSuccess?: () => void }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PatchPlatformNoteRequest }) =>
      platformNotesApi.patch(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noteKeys.all });
      opts?.onSuccess?.();
    },
  });
}

export function useDeleteNote(opts?: { onSuccess?: () => void }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => platformNotesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: noteKeys.all });
      notifications.show({
        color: "red",
        title: "Note deleted",
        message: "The platform health note has been removed.",
      });
      opts?.onSuccess?.();
    },
  });
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export const SEVERITY_OPTIONS = [
  { value: "INFO", label: "Info" },
  { value: "WARNING", label: "Warning" },
  { value: "CRITICAL", label: "Critical" },
];

export const STATUS_OPTIONS = [
  { value: "OPEN", label: "Open" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "ARCHIVED", label: "Archived" },
];

export const SEVERITY_COLORS: Record<string, string> = {
  INFO: "blue",
  WARNING: "orange",
  CRITICAL: "red",
};

export const STATUS_COLORS: Record<string, string> = {
  OPEN: "green",
  RESOLVED: "gray",
  ARCHIVED: "dark",
};
