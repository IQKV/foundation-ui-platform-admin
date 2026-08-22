import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";

interface UseBanUserOptions {
  userId: string;
  displayName: string;
  onSuccess: () => void;
}

export function useBanUser({ userId, displayName, onSuccess }: UseBanUserOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { reason?: string; expiresAt?: Date | null }) =>
      iamApi.banUser(userId, {
        reason: data.reason,
        expiresAt: data.expiresAt ? data.expiresAt.toISOString() : undefined,
      }),
    onSuccess: () => {
      notifications.show({
        title: "User banned",
        message: `${displayName} has been banned. All their sessions have been invalidated.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Ban failed",
        message: "Could not ban the user. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
