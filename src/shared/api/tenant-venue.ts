import { httpClient } from "./http-client";
import type { SemanticSearchFilters } from "./catalog";
import type { TenantVenue, TenantVenueAsset, TenantVenueSummary } from "../../entities";

// ─── API-specific types ───────────────────────────────────────────────────────

export interface AdminTenantVenueListResponse {
  items: TenantVenueSummary[];
  totalElements: number;
}

export interface AdminTenantVenueAssetListResponse {
  items: TenantVenueAsset[];
  totalElements: number;
}

export interface TenantVenueWriteRequest {
  name: string;
  address?: string | null;
  city?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  metadata?: string | null;
  confidence?: number | null;
  source: string;
  masterVenueId?: string | null;
}

export interface TenantVenuePatchRequest {
  name?: string | null;
  address?: string | null;
  city?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  metadata?: string | null;
  confidence?: number | null;
  source?: string | null;
  masterVenueId?: string | null;
}

export interface TenantVenueSemanticSearchResponse {
  items: TenantVenueSummary[];
  totalElements: number;
  appliedFilters: SemanticSearchFilters;
}

export type TenantVenueSortField = "createdAt" | "name";

export interface ListTenantVenuesParams {
  search?: string;
  city?: string;
  limit?: number;
  offset?: number;
  sortBy?: TenantVenueSortField;
  sortDir?: "asc" | "desc";
}

export interface TenantVenueSemanticSearchParams {
  q: string;
  city?: string;
  limit?: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

const basePath = (tenantKey: string) => `/v1/catalog/admin/${encodeURIComponent(tenantKey)}/venues`;

export const tenantVenueApi = {
  listTenantVenues: (tenantKey: string, params: ListTenantVenuesParams = {}) =>
    httpClient
      .get<AdminTenantVenueListResponse>(basePath(tenantKey), { params })
      .then((r) => r.data),

  semanticSearch: (tenantKey: string, params: TenantVenueSemanticSearchParams) =>
    httpClient
      .get<TenantVenueSemanticSearchResponse>(`${basePath(tenantKey)}/search/semantic`, { params })
      .then((r) => r.data),

  getTenantVenue: (tenantKey: string, id: string) =>
    httpClient.get<TenantVenue>(`${basePath(tenantKey)}/${id}`).then((r) => r.data),

  // Assets are written by the ingestion worker only — the admin UI reads them.
  listTenantVenueAssets: (tenantKey: string, id: string) =>
    httpClient
      .get<AdminTenantVenueAssetListResponse>(`${basePath(tenantKey)}/${id}/assets`)
      .then((r) => r.data),

  listTenantVenuePhotos: (tenantKey: string, id: string) =>
    httpClient
      .get<AdminTenantVenueAssetListResponse>(`${basePath(tenantKey)}/${id}/photos`)
      .then((r) => r.data),

  createTenantVenue: (tenantKey: string, data: TenantVenueWriteRequest) =>
    httpClient.post<TenantVenue>(basePath(tenantKey), data).then((r) => r.data),

  replaceTenantVenue: (tenantKey: string, id: string, data: TenantVenueWriteRequest) =>
    httpClient.put<TenantVenue>(`${basePath(tenantKey)}/${id}`, data).then((r) => r.data),

  patchTenantVenue: (tenantKey: string, id: string, data: TenantVenuePatchRequest) =>
    httpClient.patch<TenantVenue>(`${basePath(tenantKey)}/${id}`, data).then((r) => r.data),

  deleteTenantVenue: (tenantKey: string, id: string) =>
    httpClient.delete(`${basePath(tenantKey)}/${id}`).then(() => undefined),
};
