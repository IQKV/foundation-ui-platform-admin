import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { catalogApi } from "@/shared/api";

interface UseDeleteMasterVenueOptions {
  onSuccess: () => void;
}

export function useDeleteMasterVenue({ onSuccess }: UseDeleteMasterVenueOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => catalogApi.deleteMasterVenue(id),
    onSuccess: () => {
      notifications.show({
        title: "Venue deleted",
        message: "The master venue has been deleted.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "master-venues"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Delete failed",
        message: "Could not delete the master venue. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
