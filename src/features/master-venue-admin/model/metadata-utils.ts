import type { MetadataFieldDefinition } from "./metadata-spec";

/**
 * Parse the raw `metadata` JSON string into a plain object.
 * Returns `{}` for empty input and `null` when the string is not a JSON object
 * (so callers can block editing instead of overwriting unreadable data).
 */
export function parseMetadata(raw: string | null | undefined): Record<string, unknown> | null {
  if (raw == null || raw.trim() === "") return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

/** Read a dot-path value out of the metadata object. */
export function resolveFieldValue(metadata: Record<string, unknown> | null, key: string): unknown {
  if (!metadata) return undefined;
  let current: unknown = metadata;
  for (const part of key.split(".").filter(Boolean)) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/** `null`, `undefined`, `""` and empty arrays count as empty; `false` and `0` do not. */
export function isFieldEmpty(value: unknown): boolean {
  if (value == null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Return a copy of the metadata object with a dot-path field written.
 * Empty values are removed rather than stored.
 */
export function setFieldValue(
  metadata: Record<string, unknown>,
  key: string,
  value: unknown,
): Record<string, unknown> {
  const parts = key.split(".").filter(Boolean);
  if (parts.length === 0) return metadata;

  const root: Record<string, unknown> = { ...metadata };
  let current = root;

  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i] as string;
    const existing = current[part];
    const next: Record<string, unknown> =
      existing !== null && typeof existing === "object" && !Array.isArray(existing)
        ? { ...(existing as Record<string, unknown>) }
        : {};
    current[part] = next;
    current = next;
  }

  const last = parts[parts.length - 1] as string;
  if (isFieldEmpty(value)) {
    delete current[last];
  } else {
    current[last] = value;
  }
  return root;
}

/** Count of populated editable fields in a section, for the completeness badge. */
export function sectionCompleteness(
  fields: MetadataFieldDefinition[],
  metadata: Record<string, unknown> | null,
): { filled: number; total: number } {
  const editable = fields.filter((field) => !field.readOnly);
  const filled = editable.filter(
    (field) => !isFieldEmpty(resolveFieldValue(metadata, field.key)),
  ).length;
  return { filled, total: editable.length };
}
