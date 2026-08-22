import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";
import type { AnnouncementFormValues } from "./types";

interface UseUpdateAnnouncementOptions {
  announcementId: string;
  onSuccess: () => void;
}

export function useUpdateAnnouncement({ announcementId, onSuccess }: UseUpdateAnnouncementOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: AnnouncementFormValues) =>
      iamApi.updateAnnouncement(announcementId, {
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
        title: "Announcement updated",
        message: "The announcement has been updated successfully.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Update failed",
        message: "Could not update the announcement. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
