import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { adminAccountApi } from "@/shared/api";
import { dynamicActivateLocale } from "@/shared/locales";
import type { EditAccountFormValues } from "./types";

interface UseEditAccountOptions {
  onSuccess: () => void;
}

/**
 * Encapsulates the PATCH /v1/iam/auth/admin/me mutation.
 * Invalidates the ["admin", "account"] query on success so the profile page
 * re-fetches the updated data automatically.
 *
 * When the user changes their locale, the Lingui catalog is activated
 * immediately after the server confirms the update so the UI language
 * switches in the same interaction without a page reload.
 */
export function useEditAccount({ onSuccess }: UseEditAccountOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: EditAccountFormValues) =>
      adminAccountApi.updateAccount({
        firstName: values.firstName,
        lastName: values.lastName,
        locale: values.locale ?? undefined,
      }),
    onSuccess: async (_, variables) => {
      // Activate the new locale in Lingui if it changed
      if (variables.locale) {
        await dynamicActivateLocale(variables.locale);
        document.cookie = `locale=${variables.locale};path=/;max-age=31536000;SameSite=Lax`;
      }

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
