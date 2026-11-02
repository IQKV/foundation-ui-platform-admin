import { t } from "@lingui/core/macro";
import { z } from "zod";
import type { MasterVenue } from "@/entities";
import type { MasterVenueWriteRequest } from "@/shared/api";

/** Numeric text field that accepts an empty value (→ null) or a finite number. */
const optionalNumeric = (message: string) =>
  z.string().refine((value) => value.trim() === "" || Number.isFinite(Number(value)), message);

export function buildMasterVenueSchema() {
  return z.object({
    name: z.string().min(1, t`Name is required`),
    address: z.string(),
    city: z.string(),
    locationLat: optionalNumeric(t`Latitude must be a number`),
    locationLng: optionalNumeric(t`Longitude must be a number`),
    metadata: z.string(),
    confidence: optionalNumeric(t`Confidence must be a number`),
    source: z.string().min(1, t`Source is required`),
  });
}

export type MasterVenueFormValues = z.infer<ReturnType<typeof buildMasterVenueSchema>>;

export function emptyMasterVenueFormValues(): MasterVenueFormValues {
  return {
    name: "",
    address: "",
    city: "",
    locationLat: "",
    locationLng: "",
    metadata: "",
    confidence: "",
    source: "",
  };
}

export function toMasterVenueFormValues(venue: MasterVenue): MasterVenueFormValues {
  return {
    name: venue.name,
    address: venue.address ?? "",
    city: venue.city ?? "",
    locationLat: venue.locationLat === null ? "" : String(venue.locationLat),
    locationLng: venue.locationLng === null ? "" : String(venue.locationLng),
    metadata: venue.metadata ?? "",
    confidence: venue.confidence === null ? "" : String(venue.confidence),
    source: venue.source,
  };
}

function toOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : Number(trimmed);
}

function toOptionalString(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
}

export function toWriteRequest(values: MasterVenueFormValues): MasterVenueWriteRequest {
  return {
    name: values.name.trim(),
    address: toOptionalString(values.address),
    city: toOptionalString(values.city),
    locationLat: toOptionalNumber(values.locationLat),
    locationLng: toOptionalNumber(values.locationLng),
    metadata: toOptionalString(values.metadata),
    confidence: toOptionalNumber(values.confidence),
    source: values.source.trim(),
  };
}
