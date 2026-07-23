// All types are defined locally inside the addon — no host-app imports.
// The addon's own api/ module is the single source of truth for the
// backend contract types; this file re-exports them for convenience and
// adds any purely UI-level shapes the addon needs.

export type {
  PlatformNote,
  PlatformNoteSeverity,
  PlatformNoteStatus,
  PlatformNoteListParams,
  CreatePlatformNoteRequest,
  UpdatePlatformNoteRequest,
  PatchPlatformNoteRequest,
  PagedResponse,
  CountResponse,
} from "../api/platform-notes-api";

// ─── Form value shapes ────────────────────────────────────────────────────────

export interface NoteFormValues {
  title: string;
  body: string;
  severity: string; // string for Mantine Select; coerced to PlatformNoteSeverity at submit
}

export interface NoteEditFormValues {
  title: string;
  body: string;
  severity: string;
  status: string;
}

// ─── Filter state ─────────────────────────────────────────────────────────────

export interface NoteListFilters {
  search: string;
  severity: string; // "" = all
  status: string; // "" = all
}
