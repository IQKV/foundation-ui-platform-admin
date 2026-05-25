import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";

interface UseDeleteAnnouncementOptions {
  onSuccess: () => void;
}

export function useDeleteAnnouncement({ onSuccess }: UseDeleteAnnouncementOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => iamApi.deleteAnnouncement(id),
    onSuccess: () => {
      notifications.show({
        title: "Announcement deleted",
        message: "The announcement has been deleted.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "announcements"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Delete failed",
        message: "Could not delete the announcement. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
