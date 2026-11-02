import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { catalogApi } from "@/shared/api";
import { toWriteRequest } from "./types";
import type { MasterVenueFormValues } from "./types";

interface UseUpdateMasterVenueOptions {
  venueId: string;
  onSuccess: () => void;
}

export function useUpdateMasterVenue({ venueId, onSuccess }: UseUpdateMasterVenueOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: MasterVenueFormValues) =>
      catalogApi.replaceMasterVenue(venueId, toWriteRequest(values)),
    onSuccess: () => {
      notifications.show({
        title: "Venue updated",
        message: "The master venue has been updated successfully.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "master-venues"] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "master-venue", venueId] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Update failed",
        message: "Could not update the master venue. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
