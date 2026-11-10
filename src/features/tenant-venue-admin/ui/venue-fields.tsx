import {
  SimpleGrid,
  Stack,
  TextInput,
  Textarea,
  NumberInput,
  Paper,
  Group,
  Text,
} from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { useLingui } from "@lingui/react/macro";
import { IconBuildingStore, IconMapPin, IconAdjustments } from "@tabler/icons-react";
import { TestSelectors } from "@/shared/lib/test-selectors";
import type { TenantVenueFormValues } from "../model";
import { SECTION_CARD_STYLES } from "./section-accent";

interface VenueFieldsProps {
  form: UseFormReturnType<TenantVenueFormValues>;
}

interface SectionCardProps {
  icon: React.ReactNode;
  title: string;
  hint: string;
  children: React.ReactNode;
}

function SectionCard({ icon, title, hint, children }: SectionCardProps) {
  return (
    <Paper shadow="sm" radius="md" p="lg" withBorder styles={SECTION_CARD_STYLES}>
      <Stack gap="lg">
        <Group gap="sm" align="flex-start">
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "var(--mantine-radius-sm)",
              background: "var(--mantine-color-blue-0)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {icon}
          </div>
          <Stack gap={2}>
            <Text size="md" fw={700} lh={1.2}>
              {title}
            </Text>
            <Text size="xs" c="dimmed" lh={1.45}>
              {hint}
            </Text>
          </Stack>
        </Group>
        <Stack gap="md">{children}</Stack>
      </Stack>
    </Paper>
  );
}

/** Shared create/edit form fields for a tenant venue. */
export function VenueFields({ form }: VenueFieldsProps) {
  const { t } = useLingui();

  return (
    <Stack gap="md">
      <SectionCard
        icon={<IconBuildingStore size={18} color="var(--mantine-color-blue-6)" />}
        title={t`Identity`}
        hint={t`The venue's canonical name and address as it appears in the catalog.`}
      >
        <TextInput
          label={t`Name`}
          withAsterisk
          data-testid={TestSelectors.INPUT.TENANT_VENUE_NAME}
          {...form.getInputProps("name")}
        />
        <TextInput
          label={t`Address`}
          data-testid={TestSelectors.INPUT.TENANT_VENUE_ADDRESS}
          {...form.getInputProps("address")}
        />
        <TextInput
          label={t`City`}
          data-testid={TestSelectors.INPUT.TENANT_VENUE_CITY}
          {...form.getInputProps("city")}
        />
      </SectionCard>

      <SectionCard
        icon={<IconMapPin size={18} color="var(--mantine-color-blue-6)" />}
        title={t`Coordinates`}
        hint={t`Decimal lat / lng used for map pins and geo search. Leave blank if unknown.`}
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <NumberInput
            label={t`Latitude`}
            data-testid={TestSelectors.INPUT.TENANT_VENUE_LATITUDE}
            value={form.values.locationLat}
            error={form.errors.locationLat}
            onChange={(value) =>
              form.setFieldValue("locationLat", value === "" ? "" : String(value))
            }
          />
          <NumberInput
            label={t`Longitude`}
            data-testid={TestSelectors.INPUT.TENANT_VENUE_LONGITUDE}
            value={form.values.locationLng}
            error={form.errors.locationLng}
            onChange={(value) =>
              form.setFieldValue("locationLng", value === "" ? "" : String(value))
            }
          />
        </SimpleGrid>
      </SectionCard>

      <SectionCard
        icon={<IconAdjustments size={18} color="var(--mantine-color-blue-6)" />}
        title={t`Curation`}
        hint={t`Ingestion provenance and quality signal. Metadata is managed by the worker — edit only to correct errors.`}
      >
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
          <TextInput
            label={t`Source`}
            withAsterisk
            data-testid={TestSelectors.INPUT.TENANT_VENUE_SOURCE}
            {...form.getInputProps("source")}
          />
          <NumberInput
            label={t`Confidence`}
            description={t`0 – 1 quality score set by the ingestion pipeline.`}
            min={0}
            max={1}
            step={0.01}
            decimalScale={4}
            data-testid={TestSelectors.INPUT.TENANT_VENUE_CONFIDENCE}
            value={form.values.confidence}
            error={form.errors.confidence}
            onChange={(value) =>
              form.setFieldValue("confidence", value === "" ? "" : String(value))
            }
          />
        </SimpleGrid>
        <Textarea
          label={t`Metadata`}
          description={t`Raw JSON document written by the ingestion worker. Edit with care.`}
          autosize
          minRows={4}
          maxRows={10}
          data-testid={TestSelectors.INPUT.TENANT_VENUE_METADATA}
          styles={{ input: { fontFamily: "var(--mantine-font-family-monospace)" } }}
          {...form.getInputProps("metadata")}
        />
      </SectionCard>
    </Stack>
  );
}
