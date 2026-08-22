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
import { TestSelectors } from "@/shared/lib/test-selectors";

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
      <form onSubmit={handleSubmit} data-testid={TestSelectors.MODAL.PROPOSE_INVITATION}>
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
                data-testid={TestSelectors.BUTTON.RETRY}
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
            data-testid={TestSelectors.INPUT.TENANT_KEY}
            {...form.getInputProps("tenantKey")}
          />

          <TextInput
            label={t`Email`}
            placeholder={t`invitee@example.com`}
            type="email"
            data-testid={TestSelectors.INPUT.EMAIL}
            {...form.getInputProps("email")}
          />

          <Select
            label={t`Authority`}
            data={getAuthorityOptions()}
            data-testid={TestSelectors.INPUT.AUTHORITY}
            {...form.getInputProps("authority")}
          />

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
              disabled={
                isLoadingOrganizations || isOrganizationsError || organizationOptions.length === 0
              }
              data-testid={TestSelectors.BUTTON.SEND_INVITATION}
            >
              <Trans>Send invitation</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
