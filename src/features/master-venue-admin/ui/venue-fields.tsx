import { SimpleGrid, Stack, TextInput, Textarea, NumberInput, Divider } from "@mantine/core";
import type { UseFormReturnType } from "@mantine/form";
import { useLingui } from "@lingui/react/macro";
import { TestSelectors } from "@/shared/lib/test-selectors";
import type { MasterVenueFormValues } from "../model";

interface VenueFieldsProps {
  form: UseFormReturnType<MasterVenueFormValues>;
}

/** Shared create/edit form fields for a master venue. */
export function VenueFields({ form }: VenueFieldsProps) {
  const { t } = useLingui();

  return (
    <Stack gap="md">
      <Divider label={t`Identity`} labelPosition="left" />

      <TextInput
        label={t`Name`}
        withAsterisk
        data-testid={TestSelectors.INPUT.MASTER_VENUE_NAME}
        {...form.getInputProps("name")}
      />

      <TextInput
        label={t`Address`}
        data-testid={TestSelectors.INPUT.MASTER_VENUE_ADDRESS}
        {...form.getInputProps("address")}
      />

      <TextInput
        label={t`City`}
        data-testid={TestSelectors.INPUT.MASTER_VENUE_CITY}
        {...form.getInputProps("city")}
      />

      <Divider label={t`Coordinates`} labelPosition="left" />

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <NumberInput
          label={t`Latitude`}
          data-testid={TestSelectors.INPUT.MASTER_VENUE_LATITUDE}
          value={form.values.locationLat}
          error={form.errors.locationLat}
          onChange={(value) => form.setFieldValue("locationLat", value === "" ? "" : String(value))}
        />
        <NumberInput
          label={t`Longitude`}
          data-testid={TestSelectors.INPUT.MASTER_VENUE_LONGITUDE}
          value={form.values.locationLng}
          error={form.errors.locationLng}
          onChange={(value) => form.setFieldValue("locationLng", value === "" ? "" : String(value))}
        />
      </SimpleGrid>

      <Divider label={t`Curation`} labelPosition="left" />

      <TextInput
        label={t`Source`}
        withAsterisk
        data-testid={TestSelectors.INPUT.MASTER_VENUE_SOURCE}
        {...form.getInputProps("source")}
      />

      <NumberInput
        label={t`Confidence`}
        description={t`Curation confidence between 0 and 1.`}
        min={0}
        max={1}
        step={0.01}
        decimalScale={4}
        data-testid={TestSelectors.INPUT.MASTER_VENUE_CONFIDENCE}
        value={form.values.confidence}
        error={form.errors.confidence}
        onChange={(value) => form.setFieldValue("confidence", value === "" ? "" : String(value))}
      />

      <Textarea
        label={t`Metadata`}
        description={t`Raw JSON — written by the ingestion worker. Edit with care.`}
        autosize
        minRows={4}
        maxRows={10}
        data-testid={TestSelectors.INPUT.MASTER_VENUE_METADATA}
        styles={{ input: { fontFamily: "var(--mantine-font-family-monospace)" } }}
        {...form.getInputProps("metadata")}
      />
    </Stack>
  );
}
