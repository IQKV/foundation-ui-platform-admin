import { describe, it, expect } from "vitest";
import {
  isFieldEmpty,
  parseMetadata,
  resolveFieldValue,
  sectionCompleteness,
  setFieldValue,
} from "./metadata-utils";

describe("parseMetadata", () => {
  it("returns an empty object for empty input", () => {
    expect(parseMetadata(null)).toEqual({});
    expect(parseMetadata("")).toEqual({});
    expect(parseMetadata("   ")).toEqual({});
  });

  it("parses a JSON object", () => {
    expect(parseMetadata('{"capacity":{"max_total":500}}')).toEqual({
      capacity: { max_total: 500 },
    });
  });

  it("returns null for non-object JSON and malformed input", () => {
    expect(parseMetadata("[1,2]")).toBeNull();
    expect(parseMetadata("{not json")).toBeNull();
  });
});

describe("resolveFieldValue", () => {
  const metadata = { capacity: { max_total: 500, configurations: { banquet: 300 } } };

  it("walks a nested dot-path", () => {
    expect(resolveFieldValue(metadata, "capacity.configurations.banquet")).toBe(300);
  });

  it("returns undefined for missing paths", () => {
    expect(resolveFieldValue(metadata, "capacity.theater")).toBeUndefined();
    expect(resolveFieldValue(metadata, "catering.policy")).toBeUndefined();
    expect(resolveFieldValue(null, "capacity.max_total")).toBeUndefined();
  });
});

describe("setFieldValue", () => {
  it("writes a nested value without mutating the source", () => {
    const source = { capacity: { max_total: 500 } };
    const next = setFieldValue(source, "capacity.configurations.banquet", 300);
    expect(next).toEqual({ capacity: { max_total: 500, configurations: { banquet: 300 } } });
    expect(source).toEqual({ capacity: { max_total: 500 } });
  });

  it("creates missing intermediate objects", () => {
    expect(setFieldValue({}, "catering.policy", "outside_allowed")).toEqual({
      catering: { policy: "outside_allowed" },
    });
  });

  it("removes the key when the value is empty", () => {
    const source = { pricing: { currency: "USD", minimum_spend: 1000 } };
    expect(setFieldValue(source, "pricing.currency", "")).toEqual({
      pricing: { minimum_spend: 1000 },
    });
    expect(setFieldValue(source, "pricing.minimum_spend", null)).toEqual({
      pricing: { currency: "USD" },
    });
  });

  it("keeps explicit false and zero", () => {
    const next = setFieldValue({}, "av_tech.built_in_av", false);
    expect(next).toEqual({ av_tech: { built_in_av: false } });
    expect(setFieldValue({}, "av_tech.screens", 0)).toEqual({ av_tech: { screens: 0 } });
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
      { a: "set" },
    );
    expect(result).toEqual({ filled: 1, total: 2 });
  });
});
