import { useState } from "react";
import {
  Alert,
  Button,
  Divider,
  Group,
  MultiSelect,
  NumberInput,
  Select,
  Stack,
  Switch,
  TagsInput,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { resolveFieldValue } from "../model";
import type { MetadataFieldDefinition } from "../model";
import { useUpdateVenueMetadata } from "../model";

// ── Single-field input ────────────────────────────────────────────────────────

/** Render a metadata value as text input content; non-primitives render empty. */
function toInputText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function FieldInput({
  definition,
  value,
  onChange,
}: {
  definition: MetadataFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const { type, label, placeholder, unit, min, max, options, hint } = definition;
  const inputLabel = unit ? `${label} (${unit})` : label;

  if (type === "boolean") {
    return (
      <Group justify="space-between" py={4} wrap="nowrap">
        <Stack gap={0} style={{ minWidth: 0, flex: 1 }}>
          <Text size="sm" fw={500}>
            {label}
          </Text>
          {hint && (
            <Text size="xs" c="dimmed">
              {hint}
            </Text>
          )}
        </Stack>
        <Switch checked={Boolean(value)} onChange={(e) => onChange(e.currentTarget.checked)} />
      </Group>
    );
  }

  if (type === "enum") {
    return (
      <Select
        label={inputLabel}
        description={hint}
        data={options?.map((option) => ({ value: option.value, label: option.label })) ?? []}
        value={value != null ? toInputText(value) : null}
        onChange={(next) => onChange(next)}
        placeholder={placeholder ?? "Select…"}
        clearable
      />
    );
  }

  if (type === "enum_multi") {
    return (
      <MultiSelect
        label={inputLabel}
        description={hint}
        data={options?.map((option) => ({ value: option.value, label: option.label })) ?? []}
        value={Array.isArray(value) ? (value as string[]) : []}
        onChange={(next) => onChange(next)}
        placeholder={placeholder ?? "Select…"}
      />
    );
  }

  if (type === "string_array") {
    return (
      <TagsInput
        label={inputLabel}
        description={hint}
        value={Array.isArray(value) ? (value as string[]) : []}
        onChange={(next) => onChange(next)}
        placeholder={placeholder ?? "Type and press Enter…"}
        splitChars={[","]}
      />
    );
  }

  if (type === "integer" || type === "decimal") {
    return (
      <NumberInput
        label={inputLabel}
        description={hint}
        value={value != null ? Number(value) : ""}
        onChange={(next) => onChange(next === "" ? null : Number(next))}
        placeholder={placeholder ?? ""}
        min={min}
        max={max}
        allowDecimal={type === "decimal"}
        decimalScale={type === "decimal" ? 2 : undefined}
      />
    );
  }

  if (type === "time") {
    return (
      <TextInput
        label={inputLabel}
        description={hint}
        value={toInputText(value)}
        onChange={(e) => onChange(e.currentTarget.value || null)}
        placeholder={placeholder ?? "23:00"}
        maxLength={5}
      />
    );
  }

  if (hint) {
    return (
      <Textarea
        label={inputLabel}
        description={hint}
        value={toInputText(value)}
        onChange={(e) => onChange(e.currentTarget.value || null)}
        placeholder={placeholder}
        minRows={2}
        autosize
        maxRows={5}
      />
    );
  }

  return (
    <TextInput
      label={inputLabel}
      description={hint}
      value={toInputText(value)}
      onChange={(e) => onChange(e.currentTarget.value || null)}
      placeholder={placeholder}
    />
  );
}

// ── Section editor ────────────────────────────────────────────────────────────

interface SectionFieldsFormProps {
  venueId: string;
  metadata: Record<string, unknown>;
  fields: MetadataFieldDefinition[];
  sectionLabel: string;
  onClose: () => void;
}

/**
 * Edit drawer body for a single metadata section. Keeps a local draft, and on
 * apply sends only the fields that changed in one PATCH. Stays open on failure
 * so the draft is not lost.
 */
export function SectionFieldsForm({
  venueId,
  metadata,
  fields,
  sectionLabel,
  onClose,
}: SectionFieldsFormProps) {
  const { t } = useLingui();
  const mutation = useUpdateVenueMetadata({ venueId, sectionLabel, onSuccess: onClose });

  const [draft, setDraft] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const field of fields) {
      initial[field.key] = resolveFieldValue(metadata, field.key) ?? null;
    }
    return initial;
  });

  function handleChange(key: string, value: unknown) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleApply() {
    const changes = fields
      .filter(
        (field) =>
          JSON.stringify(resolveFieldValue(metadata, field.key) ?? null) !==
          JSON.stringify(draft[field.key] ?? null),
      )
      .map((field) => ({ key: field.key, value: draft[field.key] ?? null }));

    if (changes.length === 0) {
      onClose();
      return;
    }
    mutation.mutate({ base: metadata, changes });
  }

  return (
    <Stack gap="md" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Stack gap="sm" style={{ flex: 1, overflowY: "auto" }}>
        {fields.map((field, index) => {
          const previous = fields[index - 1];
          const showDivider = index > 0 && field.type === "boolean" && previous?.type !== "boolean";
          return (
            <div key={field.key}>
              {showDivider && <Divider my={4} />}
              <FieldInput
                definition={field}
                value={draft[field.key]}
                onChange={(value) => handleChange(field.key, value)}
              />
            </div>
          );
        })}
      </Stack>

      {mutation.isError && (
        <Alert icon={<IconAlertCircle size={14} />} color="red" variant="light" radius="sm">
          <Text size="xs">
            <Trans>Some fields could not be saved. Please try again.</Trans>
          </Text>
        </Alert>
      )}

      <Divider />
      <Group justify="flex-end" gap="sm">
        <Button variant="subtle" color="gray" onClick={onClose} disabled={mutation.isPending}>
          <Trans>Cancel</Trans>
        </Button>
        <Button loading={mutation.isPending} onClick={handleApply}>
          {t`Apply`}
        </Button>
      </Group>
    </Stack>
  );
}
