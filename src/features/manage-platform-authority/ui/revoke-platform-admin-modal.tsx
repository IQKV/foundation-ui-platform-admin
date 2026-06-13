import { Modal, Stack, Group, Button, Text, Divider, Alert } from "@mantine/core";
import { Trans } from "@lingui/react/macro";
import { IconShieldOff } from "@tabler/icons-react";
import type { IamUser } from "@/shared/api";
import { useRevokePlatformAdmin } from "../model";

interface RevokePlatformAdminModalProps {
  user: IamUser | null;
  opened: boolean;
  onClose: () => void;
}

export function RevokePlatformAdminModal({ user, opened, onClose }: RevokePlatformAdminModalProps) {
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "";

  const mutation = useRevokePlatformAdmin({
    userId: user?.id ?? "",
    displayName,
    onSuccess: onClose,
  });

  function handleClose() {
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
            <Trans>Revoke Platform Admin</Trans>
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
          icon={<IconShieldOff size={16} />}
          color="orange"
          variant="light"
          title={<Trans>Confirm privilege removal</Trans>}
        >
          <Trans>
            Revoking Platform Admin from <strong>{displayName}</strong> will remove their full
            administrative access. They will no longer be able to manage users, tenants, or any
            other admin-only resources.
          </Trans>
        </Alert>

        <Divider />

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" color="gray" onClick={handleClose} disabled={mutation.isPending}>
            <Trans>Cancel</Trans>
          </Button>
          <Button color="orange" loading={mutation.isPending} onClick={() => mutation.mutate()}>
            <Trans>Revoke Platform Admin</Trans>
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
