/**
 * platform-notes-api.ts
 *
 * Self-contained API module for the platform-health-notes addon.
 *
 * ISOLATION CONTRACT
 * ------------------
 * This file has zero imports from the host application (@/shared/*, @/entities, etc.).
 * It depends only on the Axios AxiosInstance type (a peer-dependency of the host, so
 * always available) and on the types defined within this addon.
 *
 * The module is initialised once during addon bootstrap by passing in the
 * AddonContext.httpClient supplied by the platform. After init() is called the
 * exported function objects are safe to use anywhere inside the addon.
 *
 * Pattern:
 *   addon/index.tsx  →  initialize({ httpClient }) → platformNotesApi.init(httpClient)
 *   addon/model      →  import { platformNotesApi } from "../api/platform-notes-api"
 *   host app         →  never imports anything from this addon's api/ folder
 */

import type { AxiosInstance } from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────
// Defined locally so the addon carries no runtime dependency on the host's
// entity layer. They intentionally mirror the backend DTOs 1-to-1.

export type PlatformNoteSeverity = "INFO" | "WARNING" | "CRITICAL";
export type PlatformNoteStatus = "OPEN" | "RESOLVED" | "ARCHIVED";
export type SortDirection = "asc" | "desc";

export interface PlatformNote {
  id: string;
  title: string;
  body: string;
  severity: PlatformNoteSeverity;
  status: PlatformNoteStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface CountResponse {
  total: number;
}

export interface PlatformNoteListParams {
  page?: number;
  size?: number;
  search?: string;
  severity?: PlatformNoteSeverity;
  status?: PlatformNoteStatus;
  sortBy?: "title" | "severity" | "status" | "createdAt" | "updatedAt";
  sortDir?: SortDirection;
}

export interface CreatePlatformNoteRequest {
  title: string;
  body: string;
  severity: PlatformNoteSeverity;
}

export interface UpdatePlatformNoteRequest {
  title: string;
  body: string;
  severity: PlatformNoteSeverity;
  status: PlatformNoteStatus;
}

export interface PatchPlatformNoteRequest {
  title?: string;
  body?: string;
  severity?: PlatformNoteSeverity;
  status?: PlatformNoteStatus;
}

// ─── Module-level client reference ───────────────────────────────────────────

let _client: AxiosInstance | null = null;

function client(): AxiosInstance {
  if (!_client) {
    throw new Error(
      "[platform-notes-api] API client not initialised. " +
        "Call platformNotesApi.init(httpClient) inside the addon's initialize() hook.",
    );
  }
  return _client;
}

// ─── API ──────────────────────────────────────────────────────────────────────

const BASE = "/v1/iam/admin/platform-notes";

export const platformNotesApi = {
  /**
   * Must be called once in the addon's initialize() before any query or mutation runs.
   * Receives the AxiosInstance from AddonContext so auth interceptors and baseURL
   * are inherited from the host without duplicating configuration.
   */
  init(httpClient: AxiosInstance): void {
    _client = httpClient;
  },

  list(params: PlatformNoteListParams = {}): Promise<PagedResponse<PlatformNote>> {
    return client()
      .get<PagedResponse<PlatformNote>>(BASE, { params })
      .then((r) => r.data);
  },

  count(
    params: Pick<PlatformNoteListParams, "search" | "severity" | "status"> = {},
  ): Promise<CountResponse> {
    return client()
      .get<CountResponse>(`${BASE}/count`, { params })
      .then((r) => r.data);
  },

  get(id: string): Promise<PlatformNote> {
    return client()
      .get<PlatformNote>(`${BASE}/${id}`)
      .then((r) => r.data);
  },

  create(data: CreatePlatformNoteRequest): Promise<PlatformNote> {
    return client()
      .post<PlatformNote>(BASE, data)
      .then((r) => r.data);
  },

  update(id: string, data: UpdatePlatformNoteRequest): Promise<PlatformNote> {
    return client()
      .put<PlatformNote>(`${BASE}/${id}`, data)
      .then((r) => r.data);
  },

  patch(id: string, data: PatchPlatformNoteRequest): Promise<PlatformNote> {
    return client()
      .patch<PlatformNote>(`${BASE}/${id}`, data)
      .then((r) => r.data);
  },

  delete(id: string): Promise<void> {
    return client()
      .delete(`${BASE}/${id}`)
      .then(() => undefined);
  },
};
