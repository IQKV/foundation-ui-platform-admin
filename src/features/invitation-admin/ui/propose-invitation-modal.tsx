import { Modal, Stack, TextInput, Select, Group, Button, Text, Alert } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trans, useLingui } from "@lingui/react/macro";
import { IconAlertCircle } from "@tabler/icons-react";
import {
  getAuthorityOptions,
  useActiveTenantOptions,
  useProposeInvitation,
  buildProposeInvitationSchema,
} from "../model";
import type { ProposeInvitationFormValues } from "../model";
import { validateWithZod } from "@/shared/lib/zod-form-validation";

interface ProposeInvitationModalProps {
  opened: boolean;
  onClose: () => void;
}

export function ProposeInvitationModal({ opened, onClose }: ProposeInvitationModalProps) {
  const { t } = useLingui();

  const {
    data: organizationOptions = [],
    isLoading: isLoadingOrganizations,
    isError: isOrganizationsError,
    refetch: refetchOrganizations,
  } = useActiveTenantOptions(opened);

  const form = useForm<ProposeInvitationFormValues>({
    initialValues: {
      tenantKey: "",
      email: "",
      authority: "MEMBER",
    },
    validate: (values) => validateWithZod(buildProposeInvitationSchema(), values),
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
      <form onSubmit={handleSubmit} data-testid="modal--propose-invitation">
        <Stack gap="md">
          {isOrganizationsError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              title={<Trans>Failed to load organizations</Trans>}
            >
              <Button
                variant="subtle"
                color="red"
                size="xs"
                onClick={() => void refetchOrganizations()}
                data-testid="button--retry"
              >
                <Trans>Retry</Trans>
              </Button>
            </Alert>
          )}

          <Select
            label={t`Organization`}
            placeholder={
              isLoadingOrganizations ? t`Loading organizations…` : t`Select an organization`
            }
            data={organizationOptions}
            searchable
            nothingFoundMessage={t`No active organizations found`}
            disabled={
              isLoadingOrganizations || isOrganizationsError || organizationOptions.length === 0
            }
            data-testid="input--tenant-key"
            {...form.getInputProps("tenantKey")}
          />

          <TextInput
            label={t`Email`}
            placeholder={t`invitee@example.com`}
            type="email"
            data-testid="input--email"
            {...form.getInputProps("email")}
          />

          <Select
            label={t`Authority`}
            data={getAuthorityOptions()}
            data-testid="input--authority"
            {...form.getInputProps("authority")}
          />

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
              type="submit"
              loading={mutation.isPending}
              disabled={
                isLoadingOrganizations || isOrganizationsError || organizationOptions.length === 0
              }
              data-testid="button--send-invitation"
            >
              <Trans>Send invitation</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
