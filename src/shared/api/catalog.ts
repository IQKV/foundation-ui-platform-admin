import { httpClient } from "./http-client";
import type { MasterVenue, MasterVenueAsset } from "../../entities";

// ─── API-specific types ───────────────────────────────────────────────────────

export interface AdminMasterVenueListResponse {
  items: MasterVenue[];
  totalElements: number;
}

export interface AdminMasterVenueAssetListResponse {
  items: MasterVenueAsset[];
  totalElements: number;
}

export interface MasterVenueWriteRequest {
  name: string;
  address?: string | null;
  city?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  metadata?: string | null;
  confidence?: number | null;
  source: string;
}

export interface MasterVenuePatchRequest {
  name?: string | null;
  address?: string | null;
  city?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  metadata?: string | null;
  confidence?: number | null;
  source?: string | null;
}

export interface SemanticSearchResult extends MasterVenue {
  similarity: number;
}

export interface SemanticSearchResponse {
  items: SemanticSearchResult[];
  totalElements: number;
}

export interface ListMasterVenuesParams {
  search?: string;
  city?: string;
  limit?: number;
  offset?: number;
}

export interface SemanticSearchParams {
  q: string;
  city?: string;
  limit?: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────

const BASE_PATH = "/v1/catalog/admin/master-venues";

export const catalogApi = {
  listMasterVenues: (params: ListMasterVenuesParams = {}) =>
    httpClient.get<AdminMasterVenueListResponse>(BASE_PATH, { params }).then((r) => r.data),

  semanticSearch: (params: SemanticSearchParams) =>
    httpClient
      .get<SemanticSearchResponse>(`${BASE_PATH}/search/semantic`, { params })
      .then((r) => r.data),

  getMasterVenue: (id: string) =>
    httpClient.get<MasterVenue>(`${BASE_PATH}/${id}`).then((r) => r.data),

  // Assets and photos are written by the ingestion worker only — the admin UI reads them.
  listMasterVenueAssets: (id: string) =>
    httpClient
      .get<AdminMasterVenueAssetListResponse>(`${BASE_PATH}/${id}/assets`)
      .then((r) => r.data),

  listMasterVenuePhotos: (id: string) =>
    httpClient
      .get<AdminMasterVenueAssetListResponse>(`${BASE_PATH}/${id}/photos`)
      .then((r) => r.data),

  createMasterVenue: (data: MasterVenueWriteRequest) =>
    httpClient.post<MasterVenue>(BASE_PATH, data).then((r) => r.data),

  replaceMasterVenue: (id: string, data: MasterVenueWriteRequest) =>
    httpClient.put<MasterVenue>(`${BASE_PATH}/${id}`, data).then((r) => r.data),

  patchMasterVenue: (id: string, data: MasterVenuePatchRequest) =>
    httpClient.patch<MasterVenue>(`${BASE_PATH}/${id}`, data).then((r) => r.data),

  deleteMasterVenue: (id: string) => httpClient.delete(`${BASE_PATH}/${id}`).then(() => undefined),

  // Bulk delete is a collection-level DELETE with the ids in the JSON body.
  // The backend caps the list at 100 ids and silently ignores unknown ids.
  bulkDeleteMasterVenues: (ids: string[]) =>
    httpClient.delete(BASE_PATH, { data: { ids } }).then(() => undefined),
};
