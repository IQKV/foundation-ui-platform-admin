import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";

interface UseSetUserPasswordOptions {
  userId: string;
  displayName: string;
  onSuccess: () => void;
}

/**
 * Encapsulates the POST /v1/iam/admin/users/{id}/password mutation.
 * Handles success/error notifications.
 * No query invalidation needed — password change does not affect any cached user data.
 */
export function useSetUserPassword({ userId, displayName, onSuccess }: UseSetUserPasswordOptions) {
  return useMutation({
    mutationFn: (newPassword: string) => iamApi.setUserPassword(userId, newPassword),
    onSuccess: () => {
      notifications.show({
        title: "Password updated",
        message: `Password for ${displayName} has been changed. All their sessions have been invalidated.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Password update failed",
        message: "Could not set the new password. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
