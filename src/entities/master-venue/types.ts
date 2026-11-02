export interface MasterVenue {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  locationLat: number | null;
  locationLng: number | null;
  metadata: string | null;
  confidence: number | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface MasterVenueAsset {
  id: string;
  assetType: string;
  photoCategory: string | null;
  displayOrder: number | null;
  label: string | null;
  fileName: string | null;
  contentType: string | null;
  sizeBytes: number | null;
  s3Key: string | null;
  sourceUrl: string | null;
  provider: string | null;
  createdAt: string;
  updatedAt: string;
}
