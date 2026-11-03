import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { catalogApi } from "@/shared/api";

interface UseBulkDeleteMasterVenuesOptions {
  onSuccess: () => void;
}

export function useBulkDeleteMasterVenues({ onSuccess }: UseBulkDeleteMasterVenuesOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => catalogApi.bulkDeleteMasterVenues(ids),
    onSuccess: (_data, ids) => {
      notifications.show({
        title: "Venues deleted",
        message:
          ids.length === 1
            ? "The master venue has been deleted."
            : `${ids.length} master venues have been deleted.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "master-venues"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Delete failed",
        message: "Could not delete the selected master venues. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
