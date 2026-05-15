import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";

interface UseRevokeInvitationOptions {
  invitationId: string;
  email: string;
  onSuccess: () => void;
}

export function useRevokeInvitation({
  invitationId,
  email,
  onSuccess,
}: UseRevokeInvitationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => iamApi.revokeInvitation(invitationId),
    onSuccess: () => {
      notifications.show({
        title: "Invitation revoked",
        message: `Invitation for ${email} has been revoked.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "invitations"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Revoke failed",
        message: "Could not revoke the invitation. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
