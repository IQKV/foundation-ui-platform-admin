import { useEffect } from "react";
import {
  Modal,
  Stack,
  PasswordInput,
  Group,
  Button,
  Text,
  Divider,
  Alert,
  List,
  ThemeIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trans, useLingui } from "@lingui/react/macro";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import type { IamUser } from "@/shared/api";
import { useSetUserPassword } from "../model";

interface SetUserPasswordModalProps {
  user: IamUser | null;
  opened: boolean;
  onClose: () => void;
}

interface SetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/;

export function SetUserPasswordModal({ user, opened, onClose }: SetUserPasswordModalProps) {
  const { t } = useLingui();

  const form = useForm<SetPasswordFormValues>({
    initialValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      newPassword: (v) => {
        if (v.length < 8) return t`Password must be at least 8 characters`;
        if (v.length > 128) return t`Password must be at most 128 characters`;
        if (!PASSWORD_PATTERN.test(v))
          return t`Password must contain uppercase, lowercase, digit, and special character`;
        return null;
      },
      confirmPassword: (v, values) => (v !== values.newPassword ? t`Passwords do not match` : null),
    },
  });

  // Reset form whenever the modal is opened for a new user
  useEffect(() => {
    if (opened) {
      form.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const displayName = user ? `${user.firstName} ${user.lastName}`.trim() : "";

  const mutation = useSetUserPassword({
    userId: user?.id ?? "",
    displayName,
    onSuccess: handleClose,
  });

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate(values.newPassword);
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
            <Trans>Set Password</Trans>
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
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          {/* Warning banner */}
          <Alert
            icon={<IconAlertTriangle size={16} />}
            color="orange"
            variant="light"
            title={<Trans>Admin password override</Trans>}
          >
            <Trans>
              This will immediately change the user's password and invalidate all their active
              sessions. The user will need to sign in again with the new password.
            </Trans>
          </Alert>

          <PasswordInput
            label={t`New password`}
            placeholder={t`Enter new password`}
            {...form.getInputProps("newPassword")}
          />

          <PasswordInput
            label={t`Confirm password`}
            placeholder={t`Repeat new password`}
            {...form.getInputProps("confirmPassword")}
          />

          {/* Policy hint */}
          <Stack gap={4}>
            <Text size="xs" c="dimmed" fw={500}>
              <Trans>Password requirements:</Trans>
            </Text>
            <List
              size="xs"
              c="dimmed"
              spacing={2}
              icon={
                <ThemeIcon size={12} radius="xl" color="gray" variant="transparent">
                  <IconCircleCheck size={12} />
                </ThemeIcon>
              }
            >
              <List.Item>
                <Trans>At least 8 characters, at most 128</Trans>
              </List.Item>
              <List.Item>
                <Trans>Uppercase and lowercase letters</Trans>
              </List.Item>
              <List.Item>
                <Trans>At least one digit</Trans>
              </List.Item>
              <List.Item>
                <Trans>At least one special character</Trans>
              </List.Item>
            </List>
          </Stack>

          <Divider />

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" color="orange" loading={mutation.isPending}>
              <Trans>Set password</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
