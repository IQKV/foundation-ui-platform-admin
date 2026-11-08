import { useMemo, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Divider,
  Drawer,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { IconAlertCircle, IconAlertTriangle, IconCheck, IconPencil } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { isFieldEmpty, parseMetadata, resolveFieldValue, sectionCompleteness } from "../model";
import { METADATA_SECTIONS, METADATA_TABS } from "../model";
import type {
  MetadataDocument,
  MetadataFieldDefinition,
  MetadataSectionDefinition,
} from "../model";
import { SECTION_CARD_STYLES } from "./section-accent";
import { SectionFieldsForm } from "./section-fields-form";

// ── Field chips ───────────────────────────────────────────────────────────────

function formatFieldValue(definition: MetadataFieldDefinition, value: unknown): string | null {
  if (isFieldEmpty(value)) return null;
  if (definition.type === "enum") {
    const match = definition.options?.find((option) => option.value === value);
    return match?.label ?? String(value);
  }
  if (definition.type === "enum_multi") {
    const list = Array.isArray(value) ? value : [];
    return list
      .map(
        (item) =>
          definition.options?.find((option) => option.value === item)?.label ?? String(item),
      )
      .join(", ");
  }
  if (Array.isArray(value)) {
    const primitives = value.filter((item) => typeof item === "string" || typeof item === "number");
    if (primitives.length > 0) return primitives.join(", ");
    return `${value.length} entries`;
  }
  if (definition.unit) return `${String(value)} ${definition.unit}`;
  return String(value);
}

function ValueChip({ definition, value }: { definition: MetadataFieldDefinition; value: unknown }) {
  const text = formatFieldValue(definition, value);
  return (
    <Group gap={4} wrap="nowrap" style={{ minWidth: 0 }}>
      <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>
        {definition.label}:
      </Text>
      {text === null ? (
        <Text size="sm" c="dimmed" fs="italic">
          —
        </Text>
      ) : (
        <Text size="sm" style={{ wordBreak: "break-word" }}>
          {text}
        </Text>
      )}
    </Group>
  );
}

function BooleanChip({
  definition,
  value,
}: {
  definition: MetadataFieldDefinition;
  value: unknown;
}) {
  const on = Boolean(value);
  return (
    <Group gap={4} wrap="nowrap">
      <ThemeIcon size={16} radius="xl" variant="light" color={on ? "teal" : "gray"}>
        {on ? <IconCheck size={10} /> : <IconAlertTriangle size={10} />}
      </ThemeIcon>
      <Text size="sm" c={on ? undefined : "dimmed"}>
        {definition.label}
      </Text>
    </Group>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

function MetadataSectionCard({
  venueId,
  metadata,
  section,
}: {
  venueId: string;
  metadata: MetadataDocument;
  section: MetadataSectionDefinition;
}) {
  const { t } = useLingui();
  const [opened, setOpened] = useState(false);

  const editable = section.fields.filter((field) => !field.readOnly);
  const readOnly = section.fields.filter((field) => field.readOnly);
  const valueFields = editable.filter((field) => field.type !== "boolean");
  const boolFields = editable.filter((field) => field.type === "boolean");

  const { filled, total } = sectionCompleteness(section.fields, metadata);
  const allFilled = total > 0 && filled === total;

  const hasAny =
    filled > 0 || readOnly.some((field) => !isFieldEmpty(resolveFieldValue(metadata, field)));

  return (
    <>
      <Paper withBorder radius="md" p="lg" shadow="sm" styles={SECTION_CARD_STYLES}>
        <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
          <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
            <Group gap={8} align="center">
              <Text size="md" fw={700}>
                {section.label}
              </Text>
              {total > 0 && (
                <Badge
                  variant="light"
                  color={allFilled ? "teal" : "gray"}
                  size="xs"
                  leftSection={
                    allFilled ? (
                      <IconCheck size={10} style={{ marginTop: 1 }} />
                    ) : (
                      <IconAlertTriangle size={10} style={{ marginTop: 1 }} />
                    )
                  }
                >
                  {filled}/{total}
                </Badge>
              )}
            </Group>

            {!hasAny ? (
              <Text size="xs" c="dimmed" fs="italic">
                <Trans>No data yet — click Edit to add.</Trans>
              </Text>
            ) : (
              <Stack gap={6}>
                {valueFields.length > 0 && (
                  <Group gap="lg" wrap="wrap">
                    {valueFields.map((field) => (
                      <ValueChip
                        key={field.key}
                        definition={field}
                        value={resolveFieldValue(metadata, field)}
                      />
                    ))}
                  </Group>
                )}
                {boolFields.length > 0 && (
                  <Group gap="sm" wrap="wrap">
                    {boolFields.map((field) => (
                      <BooleanChip
                        key={field.key}
                        definition={field}
                        value={resolveFieldValue(metadata, field)}
                      />
                    ))}
                  </Group>
                )}
                {readOnly.length > 0 && (
                  <Box>
                    {readOnly.map((field) => (
                      <ValueChip
                        key={field.key}
                        definition={field}
                        value={resolveFieldValue(metadata, field)}
                      />
                    ))}
                  </Box>
                )}
              </Stack>
            )}
          </Stack>

          {editable.length > 0 && (
            <Tooltip label={t`Edit ${section.label}`} withArrow position="left">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                style={{ flexShrink: 0 }}
                onClick={() => setOpened(true)}
              >
                <IconPencil size={14} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Paper>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        position="right"
        size="md"
        title={
          <Text fw={600} size="sm">
            <Trans>Edit — {section.label}</Trans>
          </Text>
        }
        padding="lg"
        styles={{
          body: {
            display: "flex",
            flexDirection: "column",
            height: "calc(100% - 60px)",
            overflow: "hidden",
          },
        }}
      >
        <SectionFieldsForm
          venueId={venueId}
          metadata={metadata}
          fields={editable}
          sectionLabel={section.label}
          onClose={() => setOpened(false)}
        />
      </Drawer>
    </>
  );
}

// ── Sections list ─────────────────────────────────────────────────────────────

interface VenueMetadataSectionsProps {
  venueId: string;
  metadata: string | null;
  isLoading?: boolean;
}

/**
 * Structured view of the venue metadata document — one card per spec section,
 * grouped under tab dividers, each editable through a right-anchored drawer.
 */
export function VenueMetadataSections({
  venueId,
  metadata,
  isLoading,
}: VenueMetadataSectionsProps) {
  const parsed = useMemo(() => parseMetadata(metadata), [metadata]);

  if (isLoading) {
    return (
      <Stack gap="sm">
        {[140, 110, 110].map((height, index) => (
          <Skeleton key={index} height={height} radius="md" />
        ))}
      </Stack>
    );
  }

  if (parsed === null) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light" radius="md">
        <Trans>
          Metadata is not a supported document — section editing is disabled. Use the raw editor
          below.
        </Trans>
      </Alert>
    );
  }

  return (
    <Stack gap="xs">
      {METADATA_TABS.map((tab) => {
        const sections = METADATA_SECTIONS.filter((section) => section.tab === tab.key).sort(
          (a, b) => a.order - b.order,
        );
        if (sections.length === 0) return null;
        return (
          <Stack key={tab.key} gap="sm">
            <Divider
              label={
                <Text
                  size="xs"
                  fw={700}
                  tt="uppercase"
                  c="dimmed"
                  style={{ letterSpacing: "0.07em" }}
                >
                  {tab.label}
                </Text>
              }
              labelPosition="left"
              my="xs"
            />
            {sections.map((section) => (
              <MetadataSectionCard
                key={section.key}
                venueId={venueId}
                metadata={parsed}
                section={section}
              />
            ))}
          </Stack>
        );
      })}
    </Stack>
  );
}
