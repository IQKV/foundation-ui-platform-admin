import { Modal, Stack, TextInput, Select, Group, Button, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trans, useLingui } from "@lingui/react/macro";
import { getAuthorityOptions, useProposeInvitation } from "../model";
import type { ProposeInvitationFormValues } from "../model";

interface ProposeInvitationModalProps {
  opened: boolean;
  onClose: () => void;
}

export function ProposeInvitationModal({ opened, onClose }: ProposeInvitationModalProps) {
  const { t } = useLingui();

  const form = useForm<ProposeInvitationFormValues>({
    initialValues: {
      tenantKey: "",
      email: "",
      authority: "MEMBER",
    },
    validate: {
      tenantKey: (v) => (v.trim().length < 8 ? t`Tenant key must be at least 8 characters` : null),
      email: (v) => (/^\S+@\S+\.\S+$/.test(v.trim()) ? null : t`Must be a valid email address`),
    },
  });

  const mutation = useProposeInvitation({
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
        <Text fw={600} size="md">
          <Trans>Propose Invitation</Trans>
        </Text>
      }
      size="md"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label={t`Tenant key`}
            placeholder={t`8-character tenant key`}
            {...form.getInputProps("tenantKey")}
          />

          <TextInput
            label={t`Email`}
            placeholder={t`invitee@example.com`}
            type="email"
            {...form.getInputProps("email")}
          />

          <Select
            label={t`Authority`}
            data={getAuthorityOptions()}
            {...form.getInputProps("authority")}
          />

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              <Trans>Send invitation</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
