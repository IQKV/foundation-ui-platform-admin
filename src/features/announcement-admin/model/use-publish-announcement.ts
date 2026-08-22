import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";

interface UsePublishAnnouncementOptions {
  onSuccess: () => void;
}

export function usePublishAnnouncement({ onSuccess }: UsePublishAnnouncementOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => iamApi.publishAnnouncement(id),
    onSuccess: () => {
      notifications.show({
        title: "Announcement queued",
        message: "The announcement has been queued for publishing.",
        color: "blue",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Publish failed",
        message: "Could not publish the announcement. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
