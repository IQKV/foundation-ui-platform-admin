import { useEffect } from "react";
import { Modal, Stack, Group, Button, Text, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trans } from "@lingui/react/macro";
import { IconAlertCircle } from "@tabler/icons-react";
import type { TenantVenue } from "@/entities";
import { validateWithZod } from "@/shared/lib/zod-form-validation";
import { TestSelectors } from "@/shared/lib/test-selectors";
import {
  useUpdateTenantVenue,
  buildTenantVenueSchema,
  emptyTenantVenueFormValues,
  toTenantVenueFormValues,
} from "../model";
import type { TenantVenueFormValues } from "../model";
import { VenueFields } from "./venue-fields";

interface EditTenantVenueModalProps {
  tenantKey: string;
  venue: TenantVenue | null;
  opened: boolean;
  onClose: () => void;
}

export function EditTenantVenueModal({
  tenantKey,
  venue,
  opened,
  onClose,
}: EditTenantVenueModalProps) {
  const form = useForm<TenantVenueFormValues>({
    initialValues: emptyTenantVenueFormValues(),
    validate: (values) => validateWithZod(buildTenantVenueSchema(), values),
  });

  useEffect(() => {
    if (venue) {
      form.setValues(toTenantVenueFormValues(venue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venue]);

  const mutation = useUpdateTenantVenue({
    tenantKey,
    venueId: venue?.id ?? "",
    onSuccess: handleClose,
  });

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate(values);
  });

  function handleClose() {
    form.reset();
    mutation.reset();
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Stack gap={2}>
          <Text fw={600} size="md">
            <Trans>Edit Venue</Trans>
          </Text>
          {venue && (
            <Text size="xs" c="dimmed">
              <Trans>ID: {venue.id}</Trans>
            </Text>
          )}
        </Stack>
      }
      size="xl"
      centered
    >
      <form onSubmit={handleSubmit} data-testid={TestSelectors.MODAL.EDIT_TENANT_VENUE}>
        <Stack gap="md">
          {mutation.isError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              title={<Trans>Failed to update venue</Trans>}
            >
              <Trans>Please check the form and try again.</Trans>
            </Alert>
          )}

          <VenueFields form={form} />

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleClose}
              disabled={mutation.isPending}
              data-testid={TestSelectors.BUTTON.CANCEL}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button
              type="submit"
              loading={mutation.isPending}
              data-testid={TestSelectors.BUTTON.TENANT_VENUE_EDIT_SAVE}
            >
              <Trans>Save changes</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
