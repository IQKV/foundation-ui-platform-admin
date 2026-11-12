import { httpClient } from "./http-client";
import type { SemanticSearchFilters } from "./catalog";
import type {
  TenantVenue,
  TenantVenueAsset,
  TenantVenuePhoto,
  TenantVenueSummary,
} from "../../entities";

// ─── API-specific types ───────────────────────────────────────────────────────

export interface AdminTenantVenueListResponse {
  items: TenantVenueSummary[];
  totalElements: number;
}

export interface AdminTenantVenueAssetListResponse {
  items: TenantVenueAsset[];
  totalElements: number;
}

/** Photos come back as the public projection, which carries a presigned `sourceUrl`. */
export interface AdminTenantVenuePhotoListResponse {
  items: TenantVenuePhoto[];
  totalElements: number;
}

export interface InitiateVenueAssetUploadRequest {
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface InitiateVenueAssetUploadResponse {
  assetId: string;
  presignedUploadUrl: string;
  objectKey: string;
  expiresInMinutes: number;
}

export interface ConfirmVenueAssetUploadRequest {
  objectKey: string;
  fileName: string;
  assetType: string;
  photoCategory?: string | null;
  displayOrder?: number | null;
  label?: string | null;
}

/** Presigned GET URL for one asset — lets the browser render it inline (images and PDFs). */
export interface AdminVenueAssetPreviewUrlResponse {
  assetId: string;
  url: string;
  contentType: string | null;
  fileName: string | null;
  expiresInMinutes: number;
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

  // Assets are read by the admin UI; uploads go through the platform-admin surface below.
  listTenantVenueAssets: (tenantKey: string, id: string) =>
    httpClient
      .get<AdminTenantVenueAssetListResponse>(`${basePath(tenantKey)}/${id}/assets`)
      .then((r) => r.data),

  listTenantVenuePhotos: (tenantKey: string, id: string) =>
    httpClient
      .get<AdminTenantVenuePhotoListResponse>(`${basePath(tenantKey)}/${id}/photos`)
      .then((r) => r.data),

  // Two-phase presigned upload on behalf of the tenant — mirrors the tenant surface.
  initiateAssetUpload: (tenantKey: string, id: string, data: InitiateVenueAssetUploadRequest) =>
    httpClient
      .post<InitiateVenueAssetUploadResponse>(`${basePath(tenantKey)}/${id}/assets/initiate`, data)
      .then((r) => r.data),

  confirmAssetUpload: (
    tenantKey: string,
    id: string,
    assetId: string,
    data: ConfirmVenueAssetUploadRequest,
  ) =>
    httpClient
      .post<TenantVenueAsset>(`${basePath(tenantKey)}/${id}/assets/${assetId}/confirm`, data)
      .then((r) => r.data),

  // Presigned GET URL for one asset — lets the browser render the object inline.
  getAssetPreviewUrl: (tenantKey: string, id: string, assetId: string) =>
    httpClient
      .get<AdminVenueAssetPreviewUrlResponse>(
        `${basePath(tenantKey)}/${id}/assets/${assetId}/preview-url`,
      )
      .then((r) => r.data),

  deleteAsset: (tenantKey: string, id: string, assetId: string): Promise<void> =>
    httpClient
      .delete(`${basePath(tenantKey)}/${id}/assets/${assetId}`)
      .then(() => undefined),

  createTenantVenue: (tenantKey: string, data: TenantVenueWriteRequest) =>
    httpClient.post<TenantVenue>(basePath(tenantKey), data).then((r) => r.data),

  replaceTenantVenue: (tenantKey: string, id: string, data: TenantVenueWriteRequest) =>
    httpClient.put<TenantVenue>(`${basePath(tenantKey)}/${id}`, data).then((r) => r.data),

  patchTenantVenue: (tenantKey: string, id: string, data: TenantVenuePatchRequest) =>
    httpClient.patch<TenantVenue>(`${basePath(tenantKey)}/${id}`, data).then((r) => r.data),

  deleteTenantVenue: (tenantKey: string, id: string) =>
    httpClient.delete(`${basePath(tenantKey)}/${id}`).then(() => undefined),
};

/**
 * PUT a file to a presigned S3/MinIO URL with upload-progress callbacks.
 * Uses XHR so the browser fires real progress events; axios does not support
 * upload progress for PUT out of the box when the body is a File/Blob.
 */
export function uploadFileToPresignedUrl(
  presignedUrl: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed: ${xhr.status}`));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}
