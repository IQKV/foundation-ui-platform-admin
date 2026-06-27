import { Modal, Stack, Group, Button, Text, Divider, Alert } from "@mantine/core";
import { Trans } from "@lingui/react/macro";
import { IconShieldCheck } from "@tabler/icons-react";
import type { User } from "@/entities";
import { useGrantPlatformAdmin } from "../model";

interface GrantPlatformAdminModalProps {
  user: User | null;
  opened: boolean;
  onClose: () => void;
}

export function GrantPlatformAdminModal({ user, opened, onClose }: GrantPlatformAdminModalProps) {
  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "";

  const mutation = useGrantPlatformAdmin({
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
            <Trans>Grant Platform Admin</Trans>
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
          icon={<IconShieldCheck size={16} />}
          color="blue"
          variant="light"
          title={<Trans>Confirm privilege escalation</Trans>}
        >
          <Trans>
            Granting Platform Admin to <strong>{displayName}</strong> will give them full
            administrative access to this platform, including user management, tenant management,
            and all admin-only operations.
          </Trans>
        </Alert>

        <Divider />

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
            color="blue"
            loading={mutation.isPending}
            onClick={() => mutation.mutate()}
            data-testid="button--grant-platform-admin"
          >
            <Trans>Grant Platform Admin</Trans>
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
