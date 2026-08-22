import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";

interface UseUnbanUserOptions {
  userId: string;
  displayName: string;
  onSuccess: () => void;
}

export function useUnbanUser({ userId, displayName, onSuccess }: UseUnbanUserOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => iamApi.unbanUser(userId),
    onSuccess: () => {
      notifications.show({
        title: "User unbanned",
        message: `${displayName} has been unbanned and can now sign in again.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Unban failed",
        message: "Could not unban the user. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
