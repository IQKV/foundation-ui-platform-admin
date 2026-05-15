import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";
import type { ProposeInvitationFormValues } from "./types";

interface UseProposeInvitationOptions {
  onSuccess: () => void;
}

export function useProposeInvitation({ onSuccess }: UseProposeInvitationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ProposeInvitationFormValues) =>
      iamApi.proposeInvitation({
        tenantKey: values.tenantKey.trim(),
        email: values.email.trim(),
        authority: values.authority,
      }),
    onSuccess: (invitation) => {
      notifications.show({
        title: "Invitation sent",
        message: `Invitation proposed for ${invitation.email}.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "invitations"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Proposal failed",
        message: "Could not send the invitation. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
