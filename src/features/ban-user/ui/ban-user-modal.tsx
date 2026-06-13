import { useEffect } from "react";
import { Modal, Stack, Textarea, Group, Button, Text, Divider, Alert } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { Trans, useLingui } from "@lingui/react/macro";
import { IconAlertTriangle } from "@tabler/icons-react";
import type { IamUser } from "@/shared/api";
import { useBanUser } from "../model";

interface BanUserModalProps {
  user: IamUser | null;
  opened: boolean;
  onClose: () => void;
}

interface BanUserFormValues {
  reason?: string;
  expiresAt?: Date | null;
}

export function BanUserModal({ user, opened, onClose }: BanUserModalProps) {
  const { t } = useLingui();

  const form = useForm<BanUserFormValues>({
    initialValues: {
      reason: "",
      expiresAt: undefined,
    },
  });

  useEffect(() => {
    if (opened) {
      form.reset();
    }
  }, [opened, form]);

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "";

  const mutation = useBanUser({
    userId: user?.id ?? "",
    displayName,
    onSuccess: handleClose,
  });

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate({
      reason: values.reason || undefined,
      expiresAt: values.expiresAt || undefined,
    });
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
            <Trans>Ban User</Trans>
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
      <form onSubmit={handleSubmit} data-testid="modal--ban-user">
        <Stack gap="md">
          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="red"
            variant="light"
            title={<Trans>Are you sure?</Trans>}
          >
            <Trans>
              Banning this user will immediately invalidate all their active sessions, revoke their
              access, and send them a notification email. They will not be able to sign in again
              until unbanned.
            </Trans>
          </Alert>

          <Textarea
            label={t`Reason (optional)`}
            placeholder={t`Provide a reason for the ban…`}
            autosize
            minRows={2}
            maxRows={4}
            data-testid="input--ban-reason"
            {...form.getInputProps("reason")}
          />

          <DateTimePicker
            label={t`Expires at (optional)`}
            placeholder={t`Pick a date and time`}
            valueFormat="YYYY-MM-DD HH:mm"
            clearable
            {...form.getInputProps("expiresAt")}
          />

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
            <Button type="submit" color="red" loading={mutation.isPending} data-testid="button--ban-user">
              <Trans>Ban user</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
