import { Modal, Stack, Group, Button, Text, Divider, Alert } from "@mantine/core";
import { Trans, useLingui } from "@lingui/react/macro";
import { IconUserCheck } from "@tabler/icons-react";
import type { IamUser } from "@/shared/api";
import { useUnbanUser } from "../model";

interface UnbanUserModalProps {
  user: IamUser | null;
  opened: boolean;
  onClose: () => void;
}

export function UnbanUserModal({ user, opened, onClose }: UnbanUserModalProps) {
  const { t: _t } = useLingui();

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "";

  const mutation = useUnbanUser({
    userId: user?.id ?? "",
    displayName,
    onSuccess: handleClose,
  });

  function handleClose() {
    mutation.reset();
    onClose();
  }

  const handleConfirm = () => {
    mutation.mutate();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Stack gap={2}>
          <Text fw={600} size="md">
            <Trans>Unban User</Trans>
          </Text>
          {user && (
            <Text size="xs" c="dimmed">
              {displayName} &middot; {user.email}
            </Text>
          )}
        </Stack>
      }
      size="md"
      centered
    >
      <Stack gap="md">
        <Alert
          icon={<IconUserCheck size={16} />}
          color="blue"
          variant="light"
          title={<Trans>Restore access</Trans>}
        >
          <Trans>
            Unbanning this user will restore their access to the platform. They will be able to sign
            in again with their existing credentials.
          </Trans>
        </Alert>

        <Divider />

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" color="gray" onClick={handleClose} disabled={mutation.isPending}>
            <Trans>Cancel</Trans>
          </Button>
          <Button color="blue" loading={mutation.isPending} onClick={handleConfirm}>
            <Trans>Unban user</Trans>
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
