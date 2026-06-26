import { Modal, Stack, TextInput, Group, Button, Text, Divider, Code, Alert } from "@mantine/core";
import { Trans, useLingui } from "@lingui/react/macro";
import dayjs from "dayjs";
import type { IamInvitation } from "@/shared/api";
import { InvitationStatusBadge } from "@/shared/ui";
import { useRevokeInvitation } from "../model";
import { TestSelectors } from "@/shared/lib/test-selectors";

interface EditInvitationModalProps {
  invitation: IamInvitation | null;
  opened: boolean;
  onClose: () => void;
}

export function EditInvitationModal({ invitation, opened, onClose }: EditInvitationModalProps) {
  const { t } = useLingui();

  const revokeMutation = useRevokeInvitation({
    invitationId: invitation?.invitationId ?? "",
    email: invitation?.email ?? "",
    onSuccess: handleClose,
  });

  const isPending = invitation?.status === "PENDING";

  function handleClose() {
    revokeMutation.reset();
    onClose();
  }

  const readOnlyInputStyles = {
    input: {
      cursor: "default",
      color: "var(--mantine-color-gray-6)",
      background: "var(--mantine-color-gray-0)",
    },
  } as const;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Stack gap={2}>
          <Text fw={600} size="md">
            <Trans>Invitation Details</Trans>
          </Text>
          {invitation && (
            <Text size="xs" c="dimmed">
              <Trans>ID:</Trans> <Code>{invitation.invitationId}</Code>
            </Text>
          )}
        </Stack>
      }
      size="md"
      centered
    >
      {invitation && (
        <Stack gap="md" data-testid={TestSelectors.MODAL.EDIT_INVITATION}>
          <TextInput
            label={t`Email`}
            value={invitation.email}
            readOnly
            styles={readOnlyInputStyles}
          />

          <TextInput
            label={t`Tenant key`}
            value={invitation.tenantKey}
            readOnly
            styles={{
              input: {
                ...readOnlyInputStyles.input,
                fontFamily: "var(--mantine-font-family-monospace)",
              },
            }}
          />

          <TextInput
            label={t`Authority`}
            value={invitation.authority}
            readOnly
            styles={readOnlyInputStyles}
          />

          <Stack gap={4}>
            <Text size="sm" fw={500}>
              <Trans>Status</Trans>
            </Text>
            <InvitationStatusBadge status={invitation.status} />
          </Stack>

          <TextInput
            label={t`Invited by (user ID)`}
            value={invitation.invitedBy}
            readOnly
            styles={{
              input: {
                ...readOnlyInputStyles.input,
                fontFamily: "var(--mantine-font-family-monospace)",
                fontSize: "var(--mantine-font-size-xs)",
              },
            }}
          />

          <TextInput
            label={t`Expires`}
            value={dayjs(invitation.expiresAt).format("MMM D, YYYY HH:mm")}
            readOnly
            styles={readOnlyInputStyles}
          />

          <TextInput
            label={t`Accepted`}
            value={
              invitation.acceptedAt ? dayjs(invitation.acceptedAt).format("MMM D, YYYY HH:mm") : "—"
            }
            readOnly
            styles={readOnlyInputStyles}
          />

          <TextInput
            label={t`Created`}
            value={dayjs(invitation.createdAt).format("MMM D, YYYY HH:mm")}
            readOnly
            styles={readOnlyInputStyles}
          />

          {isPending && (
            <Alert color="blue" variant="light">
              <Trans>
                Pending invitations can be revoked. The invitee will no longer be able to accept
                this link.
              </Trans>
            </Alert>
          )}

          <Divider />

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleClose}
              disabled={revokeMutation.isPending}
              data-testid={TestSelectors.BUTTON.CLOSE}
            >
              <Trans>Close</Trans>
            </Button>
            {isPending && (
              <Button
                color="red"
                variant="light"
                loading={revokeMutation.isPending}
                onClick={() => revokeMutation.mutate()}
                data-testid={TestSelectors.BUTTON.REVOKE_INVITATION}
              >
                <Trans>Revoke invitation</Trans>
              </Button>
            )}
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
