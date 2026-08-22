import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";

interface UseGrantPlatformAdminOptions {
  userId: string;
  displayName: string;
  onSuccess: () => void;
}

/**
 * Grants PLATFORM_ADMIN authority to the target user.
 * Self-application is blocked on the backend; the UI additionally prevents it.
 */
export function useGrantPlatformAdmin({
  userId,
  displayName,
  onSuccess,
}: UseGrantPlatformAdminOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => iamApi.updateUserPlatformAuthorities(userId, ["PLATFORM_ADMIN"]),
    onSuccess: () => {
      notifications.show({
        title: "Platform Admin granted",
        message: `${displayName} is now a Platform Admin.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "users", userId, "authorities"] });
    },
    onError: () => {
      notifications.show({
        title: "Failed to grant Platform Admin",
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
