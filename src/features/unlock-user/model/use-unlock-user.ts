import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";

interface UseUnlockUserOptions {
  userId: string;
  displayName: string;
  onSuccess: () => void;
}

export function useUnlockUser({ userId, displayName, onSuccess }: UseUnlockUserOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => iamApi.unlockUser(userId),
    onSuccess: () => {
      notifications.show({
        title: "User unlocked",
        message: `${displayName} has been unlocked and can now sign in again.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Unlock failed",
        message: "Could not unlock the user. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
