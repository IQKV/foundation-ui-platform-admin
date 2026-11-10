import { Modal, Stack, Text, Group, Button, Alert } from "@mantine/core";
import { Trans } from "@lingui/react/macro";
import { IconAlertCircle } from "@tabler/icons-react";
import { TestSelectors } from "@/shared/lib/test-selectors";
import { useDeleteTenantVenue } from "../model";

interface DeleteTenantVenueModalProps {
  tenantKey: string;
  /** Only the id and name are needed to confirm deletion. */
  venue: { id: string; name: string } | null;
  opened: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteTenantVenueModal({
  tenantKey,
  venue,
  opened,
  onClose,
  onDeleted,
}: DeleteTenantVenueModalProps) {
  const mutation = useDeleteTenantVenue({
    tenantKey,
    onSuccess: () => {
      onDeleted?.();
      onClose();
    },
  });

  const handleConfirm = () => {
    if (venue) {
      mutation.mutate(venue.id);
    }
  };

  function handleClose() {
    mutation.reset();
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={600} size="md">
          <Trans>Delete Venue</Trans>
        </Text>
      }
      size="sm"
      centered
    >
      <Stack gap="md" data-testid={TestSelectors.MODAL.DELETE_TENANT_VENUE}>
        {mutation.isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            title={<Trans>Delete failed</Trans>}
          >
            <Trans>Could not delete the venue. Please try again.</Trans>
          </Alert>
        )}

        <Text size="sm">
          <Trans>
            Are you sure you want to delete <strong>{venue?.name ?? ""}</strong>? This action cannot
            be undone.
          </Trans>
        </Text>

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
            color="red"
            loading={mutation.isPending}
            onClick={handleConfirm}
            data-testid={TestSelectors.BUTTON.TENANT_VENUE_DELETE_CONFIRM}
          >
            <Trans>Delete</Trans>
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
