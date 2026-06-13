import { Modal, Stack, Text, Group, Button, Alert } from "@mantine/core";
import { Trans } from "@lingui/react/macro";
import { IconAlertCircle } from "@tabler/icons-react";
import type { SiteAnnouncement } from "@/shared/api";
import { useDeleteAnnouncement } from "../model";

interface DeleteAnnouncementModalProps {
  announcement: SiteAnnouncement | null;
  opened: boolean;
  onClose: () => void;
}

export function DeleteAnnouncementModal({
  announcement,
  opened,
  onClose,
}: DeleteAnnouncementModalProps) {
  const mutation = useDeleteAnnouncement({ onSuccess: onClose });

  const enTitle =
    announcement?.translations.find((tr) => tr.locale === "en-US")?.title ?? announcement?.id ?? "";

  const handleConfirm = () => {
    if (announcement) {
      mutation.mutate(announcement.id);
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
          <Trans>Delete Announcement</Trans>
        </Text>
      }
      size="sm"
      centered
    >
      <Stack gap="md" data-testid="modal--delete-announcement">
        {mutation.isError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            title={<Trans>Delete failed</Trans>}
          >
            <Trans>Could not delete the announcement. Please try again.</Trans>
          </Alert>
        )}

        <Text size="sm">
          <Trans>
            Are you sure you want to delete <strong>{enTitle}</strong>? This action cannot be
            undone.
          </Trans>
        </Text>

        <Group justify="flex-end" gap="sm">
          <Button
            variant="subtle"
            color="gray"
            onClick={handleClose}
            disabled={mutation.isPending}
            data-testid="button--cancel"
          >
            <Trans>Cancel</Trans>
          </Button>
          <Button
            color="red"
            loading={mutation.isPending}
            onClick={handleConfirm}
            data-testid="button--delete"
          >
            <Trans>Delete</Trans>
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
