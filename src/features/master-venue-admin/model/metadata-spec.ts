/**
 * Local field specification for the master-venue `metadata` JSON document.
 *
 * The admin app does not depend on `@shortlisty/ui-types`, so the canonical
 * venue metadata shape is re-declared here. `key` is a dot-path into the
 * metadata JSON, matching the ingestion worker's output.
 */

export type MetadataFieldType =
  | "string"
  | "string_array"
  | "integer"
  | "decimal"
  | "boolean"
  | "enum"
  | "enum_multi"
  | "time";

export interface MetadataFieldOption {
  value: string;
  label: string;
}

export interface MetadataFieldDefinition {
  /** Row address: first segment is the `group`, the rest the `field` (`capacity.max_total` → capacity / max_total). */
  key: string;
  label: string;
  type: MetadataFieldType;
  unit?: string;
  placeholder?: string;
  hint?: string;
  min?: number;
  max?: number;
  options?: MetadataFieldOption[];
  /** Rendered as a read-only chip; excluded from the edit drawer. */
  readOnly?: boolean;
}

export interface MetadataSectionDefinition {
  key: string;
  label: string;
  /** Tab key this section belongs to. */
  tab: string;
  order: number;
  fields: MetadataFieldDefinition[];
}

export interface MetadataTabDefinition {
  key: string;
  label: string;
}

export const METADATA_TABS: MetadataTabDefinition[] = [
  { key: "overview", label: "Overview" },
  { key: "capacity", label: "Capacity" },
  { key: "facilities", label: "Facilities" },
  { key: "logistics", label: "Logistics" },
  { key: "contacts", label: "Contacts" },
  { key: "pricing", label: "Pricing" },
  { key: "online", label: "Online" },
];

const VENUE_TYPE_OPTIONS: MetadataFieldOption[] = [
  { value: "hotel_ballroom", label: "Hotel ballroom" },
  { value: "conference_center", label: "Conference centre" },
  { value: "restaurant", label: "Restaurant" },
  { value: "rooftop", label: "Rooftop" },
  { value: "outdoor_garden", label: "Outdoor / garden" },
  { value: "historic_building", label: "Historic building" },
  { value: "warehouse_loft", label: "Warehouse / loft" },
  { value: "theatre_auditorium", label: "Theatre / auditorium" },
  { value: "gallery", label: "Gallery" },
  { value: "sports_facility", label: "Sports facility" },
  { value: "boat_cruise", label: "Boat / cruise" },
  { value: "private_estate", label: "Private estate" },
  { value: "other", label: "Other" },
];

const CATERING_POLICY_OPTIONS: MetadataFieldOption[] = [
  { value: "in_house_exclusive", label: "In-house only" },
  { value: "in_house_preferred", label: "In-house preferred" },
  { value: "outside_allowed", label: "Outside allowed" },
  { value: "no_catering", label: "No catering provided" },
];

export const METADATA_SECTIONS: MetadataSectionDefinition[] = [
  {
    key: "basic",
    label: "Basic info",
    tab: "overview",
    order: 1,
    fields: [
      {
        key: "location_notes",
        label: "Location notes",
        type: "string",
        placeholder: "Walking distance from transport, freight access…",
        hint: "Context not captured by the address.",
      },
      {
        key: "amenities",
        label: "Amenities",
        type: "string_array",
        placeholder: "Rooftop terrace, Built-in bar, Green room",
        hint: "Free-text tags shown in search results.",
      },
    ],
  },
  {
    key: "venue_type",
    label: "Venue type",
    tab: "overview",
    order: 2,
    fields: [
      {
        key: "venue_type",
        label: "Venue type(s)",
        type: "enum_multi",
        options: VENUE_TYPE_OPTIONS,
      },
    ],
  },
  {
    key: "restrictions",
    label: "Restrictions",
    tab: "overview",
    order: 3,
    fields: [
      {
        key: "restrictions",
        label: "Restrictions",
        type: "string_array",
        placeholder: "No open flame, No confetti, No outside alcohol",
        hint: "Hard restrictions that may block event planning.",
      },
    ],
  },
  {
    key: "cap_total",
    label: "Total capacity",
    tab: "capacity",
    order: 1,
    fields: [
      {
        key: "capacity.max_total",
        label: "Maximum capacity",
        type: "integer",
        unit: "guests",
        min: 1,
        hint: "Maximum headcount across all configurations.",
      },
    ],
  },
  {
    key: "cap_configs",
    label: "Configuration breakdown",
    tab: "capacity",
    order: 2,
    fields: [
      {
        key: "capacity.configurations.banquet",
        label: "Banquet / seated dinner",
        type: "integer",
        unit: "guests",
        min: 1,
      },
      {
        key: "capacity.configurations.theater",
        label: "Theatre / lecture",
        type: "integer",
        unit: "guests",
        min: 1,
      },
      {
        key: "capacity.configurations.classroom",
        label: "Classroom",
        type: "integer",
        unit: "guests",
        min: 1,
      },
      {
        key: "capacity.configurations.cocktail",
        label: "Cocktail / standing",
        type: "integer",
        unit: "guests",
        min: 1,
      },
      {
        key: "capacity.configurations.conference",
        label: "Conference / boardroom",
        type: "integer",
        unit: "guests",
        min: 1,
      },
    ],
  },
  {
    key: "catering",
    label: "Catering",
    tab: "facilities",
    order: 1,
    fields: [
      {
        key: "catering.policy",
        label: "Catering policy",
        type: "enum",
        options: CATERING_POLICY_OPTIONS,
      },
      { key: "catering.kosher_available", label: "Kosher available", type: "boolean" },
      { key: "catering.halal_available", label: "Halal available", type: "boolean" },
      { key: "catering.vegan_available", label: "Vegan menu available", type: "boolean" },
    ],
  },
  {
    key: "av",
    label: "AV & technology",
    tab: "facilities",
    order: 2,
    fields: [
      { key: "av_tech.built_in_av", label: "Built-in AV system", type: "boolean" },
      {
        key: "av_tech.projector_lumens",
        label: "Projector brightness",
        type: "integer",
        unit: "lm",
        min: 0,
      },
      { key: "av_tech.screens", label: "Number of screens", type: "integer", min: 0 },
      {
        key: "av_tech.rigging_points",
        label: "Rigging points",
        type: "boolean",
        hint: "Structural anchor points for hanging lights or décor.",
      },
      {
        key: "av_tech.internet_bandwidth_mbps",
        label: "Internet bandwidth",
        type: "integer",
        unit: "Mbps",
        min: 0,
      },
    ],
  },
  {
    key: "accessibility",
    label: "Accessibility",
    tab: "facilities",
    order: 3,
    fields: [
      { key: "accessibility.ada_compliant", label: "ADA / wheelchair compliant", type: "boolean" },
      { key: "accessibility.elevator_access", label: "Elevator access", type: "boolean" },
      { key: "accessibility.accessible_restrooms", label: "Accessible restrooms", type: "boolean" },
      {
        key: "accessibility.wheelchair_stage_access",
        label: "Wheelchair stage access",
        type: "boolean",
      },
    ],
  },
  {
    key: "outdoor",
    label: "Outdoor space",
    tab: "facilities",
    order: 4,
    fields: [
      { key: "outdoor_space.available", label: "Outdoor space available", type: "boolean" },
      { key: "outdoor_space.covered", label: "Covered / sheltered", type: "boolean" },
      { key: "outdoor_space.sqm", label: "Outdoor area", type: "integer", unit: "m²", min: 0 },
    ],
  },
  {
    key: "exclusivity",
    label: "Exclusivity",
    tab: "facilities",
    order: 5,
    fields: [
      { key: "exclusivity.exclusive_use", label: "Exclusive use available", type: "boolean" },
      {
        key: "exclusivity.shared_space",
        label: "Shared space (concurrent events)",
        type: "boolean",
      },
    ],
  },
  {
    key: "logistics",
    label: "Logistics",
    tab: "logistics",
    order: 1,
    fields: [
      {
        key: "logistics.load_in_access",
        label: "Load-in access",
        type: "string",
        placeholder: "Freight elevator, ground-floor rear access…",
      },
      {
        key: "logistics.parking_spaces",
        label: "Parking spaces",
        type: "integer",
        unit: "spaces",
        min: 0,
      },
      { key: "logistics.valet_available", label: "Valet available", type: "boolean" },
      {
        key: "logistics.curfew_time",
        label: "Noise curfew",
        type: "time",
        hint: "Latest time amplified activity is permitted (24-hour HH:mm).",
      },
      {
        key: "logistics.setup_hours_before",
        label: "Setup time",
        type: "decimal",
        unit: "hours before event",
        min: 0,
      },
      {
        key: "logistics.teardown_hours_after",
        label: "Teardown time",
        type: "decimal",
        unit: "hours after event",
        min: 0,
      },
    ],
  },
  {
    key: "contacts",
    label: "Contacts",
    tab: "contacts",
    order: 1,
    fields: [
      {
        key: "contacts",
        label: "Contacts",
        type: "string_array",
        readOnly: true,
        hint: "Venue coordinators and sales managers.",
      },
    ],
  },
  {
    key: "pricing",
    label: "Pricing",
    tab: "pricing",
    order: 1,
    fields: [
      {
        key: "pricing.minimum_spend",
        label: "Minimum spend",
        type: "decimal",
        hint: "Minimum F&B or hire spend required to book the space.",
      },
      {
        key: "pricing.currency",
        label: "Currency",
        type: "string",
        placeholder: "USD",
        hint: "ISO 4217 currency code.",
      },
      {
        key: "pricing.rental_fee_indicative",
        label: "Rental fee (indicative)",
        type: "decimal",
        hint: "Indicative hire fee — not a confirmed quote.",
      },
    ],
  },
  {
    key: "social",
    label: "Social & maps",
    tab: "online",
    order: 1,
    fields: [
      { key: "social.instagram_handle", label: "Instagram", type: "string", placeholder: "@venue" },
      {
        key: "social.google_place_id",
        label: "Google Place ID",
        type: "string",
        placeholder: "ChIJ…",
        hint: "Used to pull live ratings and the map pin.",
      },
    ],
  },
  {
    key: "ratings",
    label: "Ratings",
    tab: "online",
    order: 2,
    fields: [
      {
        key: "ratings.google_rating",
        label: "Google rating",
        type: "decimal",
        min: 0,
        max: 5,
        hint: "0.0 – 5.0.",
      },
      {
        key: "ratings.google_review_count",
        label: "Google review count",
        type: "integer",
        min: 0,
      },
    ],
  },
];
