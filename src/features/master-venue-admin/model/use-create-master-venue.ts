import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { catalogApi } from "@/shared/api";
import { toWriteRequest } from "./types";
import type { MasterVenueFormValues } from "./types";

interface UseCreateMasterVenueOptions {
  onSuccess: () => void;
}

export function useCreateMasterVenue({ onSuccess }: UseCreateMasterVenueOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: MasterVenueFormValues) =>
      catalogApi.createMasterVenue(toWriteRequest(values)),
    onSuccess: () => {
      notifications.show({
        title: "Venue created",
        message: "The master venue has been created successfully.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "master-venues"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Creation failed",
        message: "Could not create the master venue. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
