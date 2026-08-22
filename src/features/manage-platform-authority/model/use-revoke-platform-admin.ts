import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";

interface UseRevokePlatformAdminOptions {
  userId: string;
  displayName: string;
  onSuccess: () => void;
}

/**
 * Revokes PLATFORM_ADMIN authority from the target user.
 * Self-revocation is blocked on the backend; the UI additionally prevents it.
 */
export function useRevokePlatformAdmin({
  userId,
  displayName,
  onSuccess,
}: UseRevokePlatformAdminOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => iamApi.updateUserPlatformAuthorities(userId, []),
    onSuccess: () => {
      notifications.show({
        title: "Platform Admin revoked",
        message: `${displayName} is no longer a Platform Admin.`,
        color: "orange",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "users", userId, "authorities"] });
    },
    onError: () => {
      notifications.show({
        title: "Failed to revoke Platform Admin",
        message: "Could not update platform authority. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
    onSettled: () => {
      onSuccess();
    },
  });
}
