import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";
import type { AnnouncementFormValues } from "./types";

interface UseCreateAnnouncementOptions {
  onSuccess: () => void;
}

export function useCreateAnnouncement({ onSuccess }: UseCreateAnnouncementOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: AnnouncementFormValues) =>
      iamApi.createAnnouncement({
        type: values.type.trim(),
        status: values.status,
        translations: values.translations.map((t) => ({
          locale: t.locale,
          title: t.title.trim(),
          message: t.message.trim(),
        })),
      }),
    onSuccess: () => {
      notifications.show({
        title: "Announcement created",
        message: "The announcement has been created successfully.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Creation failed",
        message: "Could not create the announcement. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
