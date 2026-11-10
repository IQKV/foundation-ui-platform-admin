import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { tenantVenueApi } from "@/shared/api";

interface UseDeleteTenantVenueOptions {
  tenantKey: string;
  onSuccess: () => void;
}

export function useDeleteTenantVenue({ tenantKey, onSuccess }: UseDeleteTenantVenueOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => tenantVenueApi.deleteTenantVenue(tenantKey, id),
    onSuccess: () => {
      notifications.show({
        title: "Venue deleted",
        message: "The venue has been deleted.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "tenant-venues", tenantKey] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Delete failed",
        message: "Could not delete the venue. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
