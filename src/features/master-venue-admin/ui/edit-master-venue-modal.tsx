import { useEffect } from "react";
import { Modal, Stack, Group, Button, Text, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trans } from "@lingui/react/macro";
import { IconAlertCircle } from "@tabler/icons-react";
import type { MasterVenue } from "@/entities";
import { validateWithZod } from "@/shared/lib/zod-form-validation";
import { TestSelectors } from "@/shared/lib/test-selectors";
import {
  useUpdateMasterVenue,
  buildMasterVenueSchema,
  emptyMasterVenueFormValues,
  toMasterVenueFormValues,
} from "../model";
import type { MasterVenueFormValues } from "../model";
import { VenueFields } from "./venue-fields";

interface EditMasterVenueModalProps {
  venue: MasterVenue | null;
  opened: boolean;
  onClose: () => void;
}

export function EditMasterVenueModal({ venue, opened, onClose }: EditMasterVenueModalProps) {
  const form = useForm<MasterVenueFormValues>({
    initialValues: emptyMasterVenueFormValues(),
    validate: (values) => validateWithZod(buildMasterVenueSchema(), values),
  });

  useEffect(() => {
    if (venue) {
      form.setValues(toMasterVenueFormValues(venue));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venue]);

  const mutation = useUpdateMasterVenue({ venueId: venue?.id ?? "", onSuccess: handleClose });

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
            <Trans>Edit Master Venue</Trans>
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
      <form onSubmit={handleSubmit} data-testid={TestSelectors.MODAL.EDIT_MASTER_VENUE}>
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
              data-testid={TestSelectors.BUTTON.MASTER_VENUE_EDIT_SAVE}
            >
              <Trans>Save changes</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
