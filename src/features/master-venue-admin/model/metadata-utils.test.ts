import { describe, it, expect } from "vitest";
import {
  isFieldEmpty,
  parseMetadata,
  resolveFieldValue,
  sectionCompleteness,
  setFieldValue,
} from "./metadata-utils";
import type { MetadataDocument } from "./metadata-utils";
import type { MetadataFieldDefinition } from "./metadata-spec";

function field(
  key: string,
  type: MetadataFieldDefinition["type"] = "string",
): MetadataFieldDefinition {
  return { key, label: key, type };
}

describe("parseMetadata", () => {
  it("returns an empty document for empty input", () => {
    expect(parseMetadata(null)).toEqual({ _schema_version: 1, items: [] });
    expect(parseMetadata("")).toEqual({ _schema_version: 1, items: [] });
    expect(parseMetadata("   ")).toEqual({ _schema_version: 1, items: [] });
  });

  it("parses a flat item document", () => {
    expect(
      parseMetadata(
        '{"_schema_version":1,"items":[{"group":"capacity","field":"max_total","value":500}]}',
      ),
    ).toEqual({
      _schema_version: 1,
      items: [{ group: "capacity", field: "max_total", value: 500 }],
    });
  });

  it("defaults the schema version when missing", () => {
    expect(parseMetadata('{"items":[]}')).toEqual({ _schema_version: 1, items: [] });
  });

  it("returns null for non-object JSON, a non-item document and malformed input", () => {
    expect(parseMetadata("[1,2]")).toBeNull();
    expect(parseMetadata('{"capacity":{"max_total":500}}')).toBeNull();
    expect(parseMetadata("{not json")).toBeNull();
  });
});

describe("resolveFieldValue", () => {
  const metadata: MetadataDocument = {
    _schema_version: 1,
    items: [
      { group: "capacity", field: "max_total", value: 500 },
      { group: "capacity", field: "configurations.banquet", value: 300 },
      { group: "amenities", field: "amenities", value: "Wi-Fi" },
      { group: "amenities", field: "amenities", value: "Parking" },
    ],
  };

  it("reads a scalar field from its row", () => {
    expect(resolveFieldValue(metadata, field("capacity.configurations.banquet", "integer"))).toBe(
      300,
    );
  });

  it("collects a list field into an array", () => {
    expect(resolveFieldValue(metadata, field("amenities", "string_array"))).toEqual([
      "Wi-Fi",
      "Parking",
    ]);
  });

  it("returns undefined for a missing scalar and an empty array for a missing list", () => {
    expect(resolveFieldValue(metadata, field("catering.policy", "enum"))).toBeUndefined();
    expect(resolveFieldValue(metadata, field("restrictions", "string_array"))).toEqual([]);
    expect(resolveFieldValue(null, field("capacity.max_total", "integer"))).toBeUndefined();
  });
});

describe("setFieldValue", () => {
  const empty: MetadataDocument = { _schema_version: 1, items: [] };

  it("writes a scalar row without mutating the source", () => {
    const next = setFieldValue(empty, field("capacity.configurations.banquet", "integer"), 300);
    expect(next).toEqual({
      _schema_version: 1,
      items: [{ group: "capacity", field: "configurations.banquet", value: 300 }],
    });
    expect(empty.items).toEqual([]);
  });

  it("expands a list field into one row per element", () => {
    const next = setFieldValue(empty, field("amenities", "string_array"), ["Wi-Fi", "Parking"]);
    expect(next.items).toEqual([
      { group: "amenities", field: "amenities", value: "Wi-Fi" },
      { group: "amenities", field: "amenities", value: "Parking" },
    ]);
  });

  it("replaces existing rows for the same group and field", () => {
    const source: MetadataDocument = {
      _schema_version: 1,
      items: [
        { group: "pricing", field: "currency", value: "USD" },
        { group: "pricing", field: "minimum_spend", value: 1000 },
      ],
    };
    expect(setFieldValue(source, field("pricing.currency"), "EUR").items).toEqual([
      { group: "pricing", field: "minimum_spend", value: 1000 },
      { group: "pricing", field: "currency", value: "EUR" },
    ]);
  });

  it("removes a scalar row when the value is empty", () => {
    const source: MetadataDocument = {
      _schema_version: 1,
      items: [{ group: "pricing", field: "minimum_spend", value: 1000 }],
    };
    expect(setFieldValue(source, field("pricing.minimum_spend", "decimal"), null).items).toEqual(
      [],
    );
  });

  it("removes all rows of a list field when the value is empty", () => {
    const source: MetadataDocument = {
      _schema_version: 1,
      items: [
        { group: "amenities", field: "amenities", value: "Wi-Fi" },
        { group: "amenities", field: "amenities", value: "Parking" },
      ],
    };
    expect(setFieldValue(source, field("amenities", "string_array"), []).items).toEqual([]);
  });

  it("keeps explicit false and zero", () => {
    expect(setFieldValue(empty, field("av_tech.built_in_av", "boolean"), false).items).toEqual([
      { group: "av_tech", field: "built_in_av", value: false },
    ]);
    expect(setFieldValue(empty, field("av_tech.screens", "integer"), 0).items).toEqual([
      { group: "av_tech", field: "screens", value: 0 },
    ]);
  });
});

describe("isFieldEmpty", () => {
  it("treats null, empty string and empty array as empty", () => {
    expect(isFieldEmpty(null)).toBe(true);
    expect(isFieldEmpty(undefined)).toBe(true);
    expect(isFieldEmpty("")).toBe(true);
    expect(isFieldEmpty([])).toBe(true);
  });

  it("treats false, zero and non-empty values as populated", () => {
    expect(isFieldEmpty(false)).toBe(false);
    expect(isFieldEmpty(0)).toBe(false);
    expect(isFieldEmpty(["a"])).toBe(false);
    expect(isFieldEmpty("x")).toBe(false);
  });
});

describe("sectionCompleteness", () => {
  it("counts only populated editable fields", () => {
    const result = sectionCompleteness(
      [
        { key: "a", label: "A", type: "string" },
        { key: "b", label: "B", type: "integer" },
        { key: "c", label: "C", type: "string", readOnly: true },
      ],
      { _schema_version: 1, items: [{ group: "a", field: "a", value: "set" }] },
    );
    expect(result).toEqual({ filled: 1, total: 2 });
  });
});
