import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { adminAccountApi } from "@/shared/api";
import type { EditAccountFormValues } from "./types";

interface UseEditAccountOptions {
  onSuccess: () => void;
}

/**
 * Encapsulates the PATCH /v1/iam/auth/admin/me mutation.
 * Invalidates the ["admin", "account"] query on success so the profile page
 * re-fetches the updated data automatically.
 */
export function useEditAccount({ onSuccess }: UseEditAccountOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: EditAccountFormValues) => adminAccountApi.updateAccount(values),
    onSuccess: () => {
      notifications.show({
        title: "Profile updated",
        message: "Your account details have been saved.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "account"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Update failed",
        message: "Could not update your profile. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
