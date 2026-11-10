import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { tenantVenueApi } from "@/shared/api";
import { toWriteRequest } from "./types";
import type { TenantVenueFormValues } from "./types";

interface UseCreateTenantVenueOptions {
  tenantKey: string;
  onSuccess: () => void;
}

export function useCreateTenantVenue({ tenantKey, onSuccess }: UseCreateTenantVenueOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: TenantVenueFormValues) =>
      tenantVenueApi.createTenantVenue(tenantKey, toWriteRequest(values)),
    onSuccess: () => {
      notifications.show({
        title: "Venue created",
        message: "The venue has been created successfully.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "tenant-venues", tenantKey] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Creation failed",
        message: "Could not create the venue. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
