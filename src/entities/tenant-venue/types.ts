/** Platform-admin view of a tenant venue (`VenueResponse`). */
export interface TenantVenue {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  locationLat: number | null;
  locationLng: number | null;
  metadata: string | null;
  confidence: number | null;
  source: string;
  masterVenueId: string | null;
  createdAt: string;
  updatedAt: string;
  /** Present on semantic-search results only. */
  similarity?: number;
}

/**
 * Narrower list projection (`VenueSummaryView`) — no address, source, confidence or photo.
 * A semantic-search result adds `primaryPhotoUrl` and `similarity`.
 */
export interface TenantVenueSummary {
  id: string;
  name: string;
  city: string | null;
  locationLat: number | null;
  locationLng: number | null;
  masterVenueId: string | null;
  createdAt: string;
  updatedAt: string;
  primaryPhotoUrl?: string | null;
  similarity?: number;
}

/** Admin projection of a venue asset (`VenueAssetResponse`) — carries `s3Key`, no download URL. */
export interface TenantVenueAsset {
  id: string;
  venueId: string;
  assetType: string;
  photoCategory: string | null;
  displayOrder: number | null;
  label: string | null;
  fileName: string | null;
  contentType: string | null;
  sizeBytes: number | null;
  s3Key: string | null;
  uploadedBy: string | null;
  createdAt: string;
  updatedAt: string;
}
