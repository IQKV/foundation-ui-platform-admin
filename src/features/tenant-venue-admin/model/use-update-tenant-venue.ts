import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { tenantVenueApi } from "@/shared/api";
import { toWriteRequest } from "./types";
import type { TenantVenueFormValues } from "./types";

interface UseUpdateTenantVenueOptions {
  tenantKey: string;
  venueId: string;
  onSuccess: () => void;
}

export function useUpdateTenantVenue({
  tenantKey,
  venueId,
  onSuccess,
}: UseUpdateTenantVenueOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: TenantVenueFormValues) =>
      tenantVenueApi.replaceTenantVenue(tenantKey, venueId, toWriteRequest(values)),
    onSuccess: () => {
      notifications.show({
        title: "Venue updated",
        message: "The venue has been updated successfully.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "tenant-venues", tenantKey] });
      void queryClient.invalidateQueries({
        queryKey: ["admin", "tenant-venues", tenantKey, "venue", venueId],
      });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Update failed",
        message: "Could not update the venue. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
