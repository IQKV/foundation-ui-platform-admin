import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { adminAccountApi } from "@/shared/api";

interface UseChangeAdminPasswordOptions {
  onSuccess: () => void;
}

/**
 * Encapsulates the POST /v1/iam/auth/admin/me/password mutation.
 * Requires the current password for re-authentication.
 * On success, all existing sessions are invalidated server-side.
 */
export function useChangeAdminPassword({ onSuccess }: UseChangeAdminPasswordOptions) {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      adminAccountApi.changePassword(data),
    onSuccess: () => {
      notifications.show({
        title: "Password changed",
        message: "Your password has been updated. All other sessions have been invalidated.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      onSuccess();
    },
    onError: (error: unknown) => {
      // 401 means the current password was wrong
      const status = (error as { response?: { status?: number } })?.response?.status;
      notifications.show({
        title: "Password change failed",
        message:
          status === 401
            ? "Current password is incorrect. Please try again."
            : "Could not change your password. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
